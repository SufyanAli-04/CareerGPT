import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  RiMenuLine, RiAddLine, RiMessage3Line, RiArchiveLine,
  RiProfileLine, RiBriefcaseLine, RiChatVoiceLine,
  RiMapPinLine, RiVipCrownLine, RiSettings3Line,
  RiSparklingFill, RiAttachment2, RiMicLine,
  RiMagicLine, RiDeleteBin7Line, RiUser3Line,
  RiSendPlaneFill, RiArchiveFill
} from 'react-icons/ri';
import { chatbotService } from '../../services/chatbotService';
import type { ChatMessage, ChatSession } from '../../services/chatbotService';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/Common/ConfirmModal';

// ─── Inline markdown renderer ─────────────────────────────────────────────────
const inlineMd = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="text-purple-200 font-bold">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono">{p.slice(1, -1)}</code>;
    return p;
  });
};

const renderMd = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('```')) {
      const lang = l.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      out.push(
        <pre key={i} className="bg-black/40 border border-purple-500/20 rounded-xl p-3 my-2 text-xs overflow-x-auto font-mono">
          {lang && <div className="text-purple-400 text-[10px] mb-1.5 opacity-70 uppercase tracking-widest">{lang}</div>}
          <code className="text-purple-100">{code.join('\n')}</code>
        </pre>
      );
    } else if (l.startsWith('### ')) {
      out.push(<div key={i} className="text-purple-300 text-[13.5px] font-bold mt-2.5 mb-1">{l.slice(4)}</div>);
    } else if (l.startsWith('## ')) {
      out.push(<div key={i} className="text-fuchsia-300 text-sm font-bold mt-2.5 mb-1">{l.slice(3)}</div>);
    } else if (l.match(/^[-*] /)) {
      out.push(
        <div key={i} className="flex gap-2 my-0.5 items-start">
          <span className="text-purple-400 shrink-0">•</span>
          <span>{inlineMd(l.slice(2))}</span>
        </div>
      );
    } else if (l.match(/^\d+\. /)) {
      const num = l.match(/^(\d+)\. /)?.[1];
      out.push(
        <div key={i} className="flex gap-2 my-0.5 items-start">
          <span className="text-fuchsia-300 shrink-0 font-bold min-w-[16px]">{num}.</span>
          <span>{inlineMd(l.replace(/^\d+\. /, ''))}</span>
        </div>
      );
    } else if (l.trim() === '') {
      out.push(<div key={i} className="h-1.5" />);
    } else {
      out.push(<p key={i} className="my-0.5 leading-relaxed">{inlineMd(l)}</p>);
    }
    i++;
  }
  return out;
};

// ─── Typing dots ──────────────────────────────────────────────────────────────
const TypingDots: React.FC = () => (
  <div className="flex gap-1.5 px-1 py-1 items-center">
    {[0, 1, 2].map(i => (
      <span key={i} 
        className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }} 
      />
    ))}
  </div>
);

// ─── Message bubble ───────────────────────────────────────────────────────────
const Bubble: React.FC<{ msg: ChatMessage; isNew: boolean }> = ({ msg, isNew }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3 items-start ${isNew ? 'animate-fade-in-up' : ''} mb-6`}>
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center
        ${isUser ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                 : 'bg-white/5 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'}`}>
        {isUser ? <RiUser3Line size={14} className="text-white" /> : <RiSparklingFill size={14} className="text-purple-300" />}
      </div>
      <div className={`max-w-[76%] px-4 py-3 text-sm leading-relaxed text-gray-100
        ${isUser ? 'rounded-[18px_4px_18px_18px] bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 border border-purple-500/20 shadow-[0_4px_20px_rgba(168,85,247,0.05)]' 
                 : 'rounded-[4px_18px_18px_18px] bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]'}`}>
        {isUser ? msg.content : renderMd(msg.content)}
      </div>
    </div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, nav: string, navState?: any }> = ({ icon, title, desc, nav, navState }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(nav, { state: navState })}
      className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-md"
    >
      <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium mb-1 group-hover:text-purple-300 transition-colors">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const AIMentorChat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state || {}) as { prefillMessage?: string, fromFlow?: boolean };

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [newIdx, setNewIdx] = useState(-1);
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [confirmModalState, setConfirmModalState] = useState<{ type: 'delete' | 'unsave'; sessionId: string } | null>(null);
  
  // New States for Tab and Settings
  const [activeTab, setActiveTab] = useState<'mentor' | 'saved'>('mentor');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const inputRef = useRef(input);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      let silenceTimer: any = null;

      const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          rec.stop();
        }, 3000);
      };

      let baseInput = '';

      rec.onstart = () => {
        setIsListening(true);
        baseInput = inputRef.current;
        resetSilenceTimer();
      };

      rec.onresult = (event: any) => {
        resetSilenceTimer();
        let accumulatedTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          accumulatedTranscript += event.results[i][0].transcript;
        }
        setInput(() => {
          const prefix = baseInput.trim();
          const spoken = accumulatedTranscript.trim();
          return prefix ? `${prefix} ${spoken}` : spoken;
        });
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
      };

      rec.onend = () => {
        setIsListening(false);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
      };

      setRecognition(rec);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const handleToggleListen = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;
    try {
      setIsEnhancing(true);
      const res = await chatbotService.enhancePrompt(input);
      if (res.data && res.data.success && res.data.enhanced) {
        setInput(res.data.enhanced);
        toast.success('Prompt enhanced! 🪄');
      } else {
        toast.error('Failed to enhance prompt');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const navType = useNavigationType();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(e.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSaveCurrentChat = async () => {
    if (!activeChatId) {
      toast.info('Start a conversation to save the chat!');
      return;
    }
    try {
      const res = await chatbotService.saveSession(activeChatId);
      const isSavedNow = res.data.isSaved;
      setSessions(prev => prev.map(s => s._id === activeChatId ? { ...s, isSaved: isSavedNow } : s));
      toast.success(res.data.message || 'Chat saved successfully!');
    } catch {
      toast.error('Failed to save the chat session');
    }
  };

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Smoothly slide open the chatbot sidebar
    const slideTimer = setTimeout(() => {
      setIsSidebarOpen(true);
    }, 100);
    
    // If user navigates directly to Chatbot (independent use), start fresh
    if (navType === 'PUSH' && !navState.fromFlow && !navState.prefillMessage) {
      sessionStorage.removeItem('careergpt_chatbot_active_id');
      sessionStorage.removeItem('careergpt_chatbot_draft');
    }

    loadSessions();

    return () => clearTimeout(slideTimer);
  }, []);

  // Separate useEffect to handle actual session opening once on load, to keep hooks aligned
  useEffect(() => {
    const savedId = sessionStorage.getItem('careergpt_chatbot_active_id');
    const savedDraft = sessionStorage.getItem('careergpt_chatbot_draft');

    if (savedId) {
      openSession(savedId);
    }
    
    if (savedDraft) {
      setInput(savedDraft);
      textareaRef.current?.focus();
    } else if (navState.prefillMessage) {
      setInput(navState.prefillMessage);
      textareaRef.current?.focus();
      // Clear it from state so back/forward navigation doesn't prefill again
      navigate(location.pathname, { replace: true, state: { ...navState, prefillMessage: undefined } });
    }
  }, []);

  // Sync draft to sessionStorage
  useEffect(() => {
    if (input.trim()) {
      sessionStorage.setItem('careergpt_chatbot_draft', input);
    } else {
      sessionStorage.removeItem('careergpt_chatbot_draft');
    }
  }, [input]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const r = await chatbotService.getSessions();
      setSessions(r.data.sessions || []);
    } catch { /* silent */ }
  };

  const openSession = async (id: string) => {
    try {
      const r = await chatbotService.getSession(id);
      setActiveChatId(id);
      sessionStorage.setItem('careergpt_chatbot_active_id', id);
      setMessages(r.data.chat.messages || []);
    } catch { toast.error('Failed to load conversation'); }
  };

  const newChat = () => { 
    setActiveChatId(null); 
    sessionStorage.removeItem('careergpt_chatbot_active_id'); 
    setMessages([]); 
    setActiveTab('mentor');
    textareaRef.current?.focus(); 
  };

  const send = useCallback(async (override?: string) => {
    const msg = (override ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages(p => { setNewIdx(p.length); return [...p, userMsg]; });
    setLoading(true);
    try {
      const r = await chatbotService.sendMessage(msg, activeChatId ?? undefined);
      const { chatId, message: reply } = r.data;
      if (!activeChatId) { 
        setActiveChatId(chatId); 
        sessionStorage.setItem('careergpt_chatbot_active_id', chatId);
        loadSessions(); 
      }
      setMessages(p => { setNewIdx(p.length); return [...p, { role: 'assistant', content: reply }]; });
    } catch {
      toast.error('Error generating response');
      setMessages(p => p.filter(m => m !== userMsg));
      setInput(msg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeChatId]);

  const isCurrentChatSaved = sessions.find(s => s._id === activeChatId)?.isSaved || false;

  return (
    <div className="flex h-full bg-[#030308] text-white font-sans overflow-hidden">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className={`shrink-0 flex flex-col bg-[#05050A]/80 backdrop-blur-xl border-white/5 relative z-20 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-[280px] opacity-100 border-r' : 'w-0 opacity-0 border-none'}`}>
        <div className="w-[280px] flex flex-col h-full">
          <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <RiSparklingFill className="text-white" size={16} />
          </div>
          <span className="font-bold tracking-wide">CareerGPT</span>
        </div>

        <div className="p-4">
          <button 
            onClick={newChat}
            className="w-full py-2.5 px-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            <RiAddLine size={18} />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4">
          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Features</h4>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('mentor')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'mentor' ? 'bg-purple-500/10 text-purple-300' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
              >
                <RiMessage3Line size={16} /> <span className="text-sm">Career Mentor</span>
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'saved' ? 'bg-purple-500/10 text-purple-300' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
              >
                <RiArchiveLine size={16} /> <span className="text-sm">Saved Chats</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Workspaces</h4>
            <div className="space-y-1">
              <button onClick={() => navigate('/resume')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 flex items-center gap-3 transition-colors">
                <RiProfileLine size={16} /> <span className="text-sm">Resume</span>
              </button>
              <button onClick={() => navigate('/jobs')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 flex items-center gap-3 transition-colors">
                <RiBriefcaseLine size={16} /> <span className="text-sm">Jobs</span>
              </button>
              <button onClick={() => navigate('/interview')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 flex items-center gap-3 transition-colors">
                <RiChatVoiceLine size={16} /> <span className="text-sm">Interview</span>
              </button>
              <button onClick={() => navigate('/roadmap')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 flex items-center gap-3 transition-colors">
                <RiMapPinLine size={16} /> <span className="text-sm">Roadmap</span>
              </button>
            </div>
          </div>

          {sessions.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Recent Chats</h4>
              <div className="space-y-1">
                {sessions.map(s => (
                  <div key={s._id} 
                    onClick={() => openSession(s._id)}
                    className={`group w-full text-left px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors
                      ${activeChatId === s._id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
                  >
                    <span className="text-sm truncate pr-2">{s.title || 'Conversation'}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModalState({ type: 'delete', sessionId: s._id });
                      }} 
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    >
                      <RiDeleteBin7Line size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 relative overflow-hidden group cursor-pointer hover:border-purple-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-colors" />
            <div className="flex items-center gap-2 mb-2">
              <RiVipCrownLine className="text-purple-400" size={18} />
              <span className="text-sm font-bold text-white">
                {user?.plan === 'CareerGPT Pro' ? 'Pro Plan Active' : user?.plan === 'CareerGPT Advance' ? 'Advance Plan Active' : 'Pro Upgrade'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3 relative z-10">
              {user?.plan === 'CareerGPT Pro' ? 'Enjoy all advanced resume ATS matching and mock interviews.' : 'Get advanced resume ATS matching and mock interviews.'}
            </p>
            {user?.plan === 'CareerGPT Pro' ? (
              <button disabled className="w-full py-1.5 rounded-lg bg-gray-700/50 text-gray-500 text-xs font-bold border border-gray-700 cursor-not-allowed">
                Highest Plan Selected
              </button>
            ) : (
              <button 
                onClick={() => navigate('/pricing')}
                className="w-full py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {user?.plan === 'CareerGPT Advance' ? 'Upgrade to Pro' : 'Upgrade Now'}
              </button>
            )}
          </div>
        </div>
        </div>
      </aside>

      {/* ─── MAIN CHAT AREA ─── */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#030308]/50 backdrop-blur-md relative z-30">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <RiMenuLine size={20} />
              </button>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                Toggle Sidebar
              </div>
            </div>
            {navState.fromFlow && (
              <button
                onClick={() => navigate('/jobs', { state: { restoreJobsState: true } })}
                className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-bold hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                Back to Jobs
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {navState.fromFlow && (
              <button 
                onClick={() => navigate('/interview', { state: { fromFlow: true } })}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-bold hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-sm mr-2"
              >
                <RiChatVoiceLine size={16} /> Prepare for Interview
              </button>
            )}
            {activeChatId && (
              <div className="relative group">
                <button 
                  onClick={handleSaveCurrentChat}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-all"
                >
                  {isCurrentChatSaved ? <RiArchiveFill size={18} /> : <RiArchiveLine size={18} />}
                </button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                  {isCurrentChatSaved ? "Unsave Chat" : "Save Chat"}
                </div>
              </div>
            )}
            
            {/* Custom Settings Dropdown */}
            <div className="relative" ref={settingsDropdownRef}>
              <div className="relative group">
                <button 
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <RiSettings3Line size={18} />
                </button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                  Chat Preferences
                </div>
              </div>

              {showSettingsDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0e0d16]/95 border border-purple-500/30 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <RiSettings3Line className="text-purple-400" size={16} />
                    <span className="text-sm font-bold text-white">Chat Preferences</span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Language Preference */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Language</label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium cursor-pointer">
                          <span>English</span>
                          <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded">Active</span>
                        </div>
                        {['Spanish', 'French', 'German'].map((lang) => (
                          <div key={lang} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-gray-500 text-xs font-medium opacity-60 cursor-not-allowed">
                            <span>{lang}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Coming soon</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Theme Preference */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Chat Theme</label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium cursor-pointer">
                          <span>Cyber-Purple Neon</span>
                          <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded">Active</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-gray-500 text-xs font-medium opacity-60 cursor-not-allowed">
                          <span>Light Theme (Beta)</span>
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Coming soon</span>
                        </div>
                      </div>
                    </div>

                    {/* Model Preference */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">AI Model</label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium cursor-pointer">
                          <span>Gemini 2.0 Flash</span>
                          <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded">Active</span>
                        </div>
                        {['GPT-4o Mini (Pro)', 'DeepSeek R1'].map((model) => (
                          <div key={model} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-gray-500 text-xs font-medium opacity-60 cursor-not-allowed">
                            <span>{model}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Coming soon</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Content */}
        {activeTab === 'saved' ? (
          <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-1">Saved Conversations</h2>
              <p className="text-sm text-gray-400 mb-8">Access your bookmarked career advising sessions below.</p>
              
              {sessions.filter(s => s.isSaved).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 saas-card bg-white/[0.01] border-white/5 rounded-2xl p-8">
                  <RiArchiveLine size={48} className="text-purple-500/40 mb-4 animate-[pulse_3s_infinite]" />
                  <p className="text-sm font-semibold text-gray-300">No Saved Chats Yet</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm text-center">
                    Click the Archive/Save icon at the top right of an active chat to save it here for quick reference.
                  </p>
                  <button 
                    onClick={() => setActiveTab('mentor')}
                    className="mt-6 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    Go to Career Mentor
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.filter(s => s.isSaved).map(s => (
                    <div 
                      key={s._id} 
                      className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] backdrop-blur-md relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-white font-semibold text-base group-hover:text-purple-300 transition-colors truncate pr-6">{s.title || 'Advising Session'}</h3>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModalState({ type: 'unsave', sessionId: s._id });
                            }}
                            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                            title="Remove from saved"
                          >
                            <RiArchiveLine size={16} className="text-purple-400 group-hover:text-red-400" />
                          </button>
                        </div>
                        <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                          {s.messages && s.messages.length > 0 
                            ? s.messages[s.messages.length - 1].content 
                            : 'No messages yet.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                        <span className="text-[10px] text-gray-500 font-medium">
                          {new Date(s.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button 
                          onClick={() => {
                            openSession(s._id);
                            setActiveTab('mentor');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white text-xs font-bold transition-all border border-purple-500/20 hover:border-purple-500"
                        >
                          Open Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
              <div className="max-w-4xl mx-auto min-h-full flex flex-col px-4 py-8">
                
                {messages.length === 0 ? (
                  // Hero State
                  <div className="flex-1 flex flex-col items-center justify-start mt-6 pt-4 animation-fade-in">
                    <div className="relative w-28 h-28 mb-8 animate-[pulse_4s_ease-in-out_infinite]">
                      <div className="absolute inset-0 bg-purple-500 rounded-full blur-[35px] opacity-50" />
                      <div className="relative w-full h-full bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                        <RiSparklingFill size={44} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-center">
                      Ready to Build Your Tech Career?
                    </h1>
                    <p className="text-gray-400 text-center max-w-lg mb-10 text-sm md:text-base leading-relaxed">
                      Ask about skills, interviews, roadmaps, job scores, or anything tech-career related. I'm context-aware of your resume and job matches.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-2xl">
                      {['Improve Resume', 'Prepare Interview', 'Find Skills Gap', 'Generate Roadmap'].map((action, i) => (
                        <button 
                          key={i}
                          onClick={() => send(`Help me ${action.toLowerCase()}`)}
                          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-300 text-sm transition-all shadow-sm"
                        >
                          {action}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                      <FeatureCard icon={<RiProfileLine size={24} />} title="Resume Analysis" desc="Get ATS scoring and personalized feedback to land more interviews." nav="/resume" />
                      <FeatureCard icon={<RiBriefcaseLine size={24} />} title="Job Matching" desc="Find roles that perfectly match your skills and experience level." nav="/jobs" />
                      <FeatureCard icon={<RiChatVoiceLine size={24} />} title="AI Interview" desc="Practice mock interviews with real-time feedback and grading." nav="/interview" />
                      <FeatureCard icon={<RiMapPinLine size={24} />} title="Career Roadmap" desc="Generate step-by-step guides to master new tech stacks." nav="/roadmap" />
                    </div>
                  </div>
                ) : (
                  // Message List
                  <div className="pb-4">
                    {messages.map((m, i) => (
                      <Bubble key={i} msg={m} isNew={i >= newIdx} />
                    ))}
                    {loading && (
                      <div className="flex flex-row gap-3 items-start animate-fade-in-up mb-6">
                        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-white/5 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                          <RiSparklingFill size={14} className="text-purple-300" />
                        </div>
                        <div className="px-4 py-3 rounded-[4px_18px_18px_18px] bg-white/[0.02] border border-white/5 backdrop-blur-md flex items-center min-h-[44px]">
                          <TypingDots />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Input Section */}
            <div className="p-4 md:p-6 w-full max-w-4xl mx-auto relative z-20">
              <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all focus-within:border-purple-500/50 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask tech career questions... (Shift+Enter for new line)"
                  className="w-full bg-transparent text-white px-5 pt-5 pb-2 resize-none outline-none placeholder:text-gray-500 min-h-[60px] max-h-[200px] text-sm md:text-base leading-relaxed custom-scrollbar"
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                
                <div className="flex items-center justify-between px-4 pb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                        <RiAttachment2 size={18} />
                      </button>
                      <div className="absolute bottom-10 left-0 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                        Attach File (Coming soon)
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <button 
                        type="button"
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !input.trim()}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isEnhancing 
                            ? 'text-purple-400 bg-purple-500/10 animate-pulse' 
                            : !input.trim()
                              ? 'text-gray-600 cursor-not-allowed opacity-50' 
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {isEnhancing ? (
                          <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RiMagicLine size={18} />
                        )}
                      </button>
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                        {!input.trim() ? 'Type a prompt to enhance' : 'Enhance Prompt'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <div className="relative group">
                      <button 
                        type="button"
                        onClick={handleToggleListen}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isListening 
                            ? 'text-rose-400 bg-rose-500/20 animate-pulse border border-rose-500/30' 
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <RiMicLine size={18} />
                      </button>
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                        {isListening ? 'Listening... Click to stop' : 'Voice Input'}
                      </div>
                    </div>

                    <div className="relative group">
                      <button 
                        onClick={() => send()}
                        disabled={!input.trim() || loading}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500 text-white hover:bg-purple-400 transition-all disabled:opacity-50 disabled:hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                      >
                        <RiSendPlaneFill size={18} />
                      </button>
                      <div className="absolute bottom-10 right-0 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                        Send Message
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-3">
                <span className="text-[10px] text-gray-500">AI can make mistakes. Consider verifying important information.</span>
              </div>
            </div>
          </>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.7); }
        @keyframes mfadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: mfadein 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animation-fade-in { animation: mfadein 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      <ConfirmModal
        isOpen={confirmModalState !== null}
        onClose={() => setConfirmModalState(null)}
        onConfirm={async () => {
          if (!confirmModalState) return;
          const { type, sessionId } = confirmModalState;
          if (type === 'delete') {
            try {
              await chatbotService.deleteSession(sessionId);
              setSessions(p => p.filter(s => s._id !== sessionId));
              if (activeChatId === sessionId) newChat();
              toast.success('Conversation deleted');
            } catch {
              toast.error('Failed to delete conversation');
            }
          } else if (type === 'unsave') {
            try {
              const res = await chatbotService.saveSession(sessionId);
              setSessions(prev => prev.map(item => item._id === sessionId ? { ...item, isSaved: res.data.isSaved } : item));
              toast.success('Removed from Saved Chats');
            } catch {
              toast.error('Failed to update session');
            }
          }
        }}
        title={confirmModalState?.type === 'delete' ? 'Delete Conversation' : 'Remove from Saved Chats'}
        message={
          confirmModalState?.type === 'delete'
            ? 'Are you sure you want to delete this chat session? This action cannot be undone.'
            : 'Are you sure you want to remove this chat session from your Saved Chats list?'
        }
        confirmText={confirmModalState?.type === 'delete' ? 'Delete' : 'Remove'}
        cancelText="Cancel"
        type={confirmModalState?.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default AIMentorChat;
