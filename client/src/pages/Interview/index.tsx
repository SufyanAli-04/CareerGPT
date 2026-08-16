import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  RiRobot2Line, RiPlayCircleLine, RiVolumeUpLine,
  RiArrowRightLine, RiMicLine, RiArrowRightUpLine, RiArrowRightDownLine, RiDeleteBin6Line, RiCloseLine,
  RiArrowRightSLine, RiTimeLine
} from 'react-icons/ri';
import { toast } from 'react-toastify';
import { interviewService } from '../../services/interviewService';
import type { Interview as IInterview } from '../../services/interviewService';
import { resumeService } from '../../services/resumeService';
import ConfirmModal from '../../components/Common/ConfirmModal';


type Step = 'setup' | 'session' | 'dashboard';

// --- Reusable Dashboard View Component ---
const DashboardView: React.FC<{ 
  interview: IInterview; 
  isModal?: boolean; 
  onClose?: () => void; 
  onStartNew?: () => void;
  navigate: (path: string, options?: any) => void;
}> = ({ interview, isModal, onClose, onStartNew, navigate }) => {
  const answeredQs = interview.questions.filter(q => q.score !== undefined);
  const topStrengths = answeredQs.flatMap(q => q.strengths || []).filter(Boolean);
  const areasToImprove = answeredQs.flatMap(q => q.weaknesses || []).filter(Boolean);
  
  return (
    <div className={`mx-auto w-full ${isModal ? 'pt-0 pb-6' : 'pt-6 pb-16'}`}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className={`${isModal ? 'text-3xl' : 'text-4xl'} font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2`}>Performance Dashboard</h1>
          <p className="text-sm font-medium text-gray-400 bg-white/5 inline-flex items-center px-3 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            {interview.role} • {interview.type} • {interview.difficulty}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (onClose) onClose();
              navigate('/roadmap', { state: { fromFlow: true } });
            }}
            className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-5 py-2.5 text-sm font-bold text-blue-300 hover:from-blue-500/20 hover:to-purple-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          >
            <RiArrowRightUpLine size={18} /> Career Roadmap
          </button>
          {isModal ? (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <RiCloseLine size={24} />
            </button>
          ) : (
            <button 
              onClick={onStartNew}
              className="flex items-center gap-2 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-5 py-2.5 text-sm font-bold text-purple-300 hover:from-purple-500/20 hover:to-blue-500/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              <RiPlayCircleLine size={18} /> Start New Interview
            </button>
          )}
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-10">
        <div className="dashboard-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Overall Score</h3>
          
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full">
            <div className="absolute inset-0 rounded-full border-8 border-[#111116] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 z-10 drop-shadow-md">
              {interview.overallScore || 0}%
            </span>
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="46" fill="none" stroke="url(#scoreGradient)" strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={`${(interview.overallScore || 0) * 2.89} 289`} 
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {interview.overallScore === 0 && (
            <p className="mt-6 text-xs text-red-400 font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Interview ended before answering
            </p>
          )}
        </div>
        
        <div className="dashboard-card p-8 lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Interview Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            <div className="rounded-xl bg-gradient-to-br from-[#062417] to-[#0A0A0F] p-6 border border-emerald-500/20 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <RiArrowRightUpLine size={64} className="text-emerald-500" />
              </div>
              <div className="flex items-center gap-3 mb-4 text-emerald-400 font-bold text-sm uppercase tracking-wide">
                <div className="p-1.5 bg-emerald-500/20 rounded-md"><RiArrowRightUpLine size={16} /></div>
                Top Strengths
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2.5 z-10 flex-1">
                {topStrengths.length > 0 ? (
                  topStrengths.slice(0, 4).map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)
                ) : (
                  <li className="text-gray-500 italic list-none -ml-5">No strengths identified yet.</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-[#2A0811] to-[#0A0A0F] p-6 border border-rose-500/20 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <RiArrowRightDownLine size={64} className="text-rose-500" />
              </div>
              <div className="flex items-center gap-3 mb-4 text-rose-400 font-bold text-sm uppercase tracking-wide">
                <div className="p-1.5 bg-rose-500/20 rounded-md"><RiArrowRightDownLine size={16} /></div>
                Areas to Improve
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2.5 z-10 flex-1">
                {areasToImprove.length > 0 ? (
                  areasToImprove.slice(0, 4).map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)
                ) : (
                  <li className="text-gray-500 italic list-none -ml-5">No areas to improve identified yet.</li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Detailed Question Breakdown</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
      </div>

      {answeredQs.length === 0 ? (
        <div className="dashboard-card p-12 text-center text-gray-500">
          No questions were answered during this session.
        </div>
      ) : (
        <div className="space-y-6">
          {answeredQs.map((q, index) => (
            <div key={index} className="dashboard-card overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="bg-gradient-to-r from-white/5 to-transparent p-5 flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 gap-4">
                <h3 className="font-semibold text-white/90 text-base leading-relaxed md:max-w-[75%]">
                  <span className="text-purple-400 font-bold mr-2">Q{index + 1}.</span> 
                  {q.question}
                </h3>
                
                <div className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-black border flex items-center gap-2 shadow-sm ${
                  (q.score || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                  (q.score || 0) >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  Score: {q.score}/100
                </div>
              </div>
              
              <div className="p-6 grid md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <RiMicLine size={14} /> Your Answer
                  </h4>
                  <div className="flex-1 bg-[#111116] p-4 rounded-xl border border-white/5 shadow-inner">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {q.userAnswer || <span className="text-gray-600 italic">No answer provided.</span>}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <RiRobot2Line size={14} /> AI Suggestions
                  </h4>
                  <div className="flex-1">
                    {q.suggestions && q.suggestions.length > 0 ? (
                      <ul className="space-y-3">
                        {q.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-3 bg-purple-500/5 p-3 rounded-lg border border-purple-500/10">
                            <span className="text-purple-400 mt-0.5 shrink-0"><RiArrowRightLine size={14} /></span> 
                            <span className="leading-relaxed">{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic bg-white/5 p-4 rounded-xl border border-white/5">
                        No specific suggestions provided.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const InterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('setup');
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [deleteInterviewId, setDeleteInterviewId] = useState<string | null>(null);
  
  // Setup State
  const [role, setRole] = useState('');
  const [type, setType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);

  // Session State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Voice & Audio State
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecordingAnswer(true);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript.trim()}` : finalTranscript.trim();
          });
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsRecordingAnswer(false);
      };

      rec.onend = () => {
        setIsRecordingAnswer(false);
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

  // Cancel speak when changing question index or stepping out of session
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeakingQuestion(false);
    if (recognition) {
      recognition.stop();
    }
  }, [currentIndex, step]);

  const handleSpeakQuestion = (text: string) => {
    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[*#_\-`]/g, '')
        .trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => {
        setIsSpeakingQuestion(false);
      };
      utterance.onerror = () => {
        setIsSpeakingQuestion(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingQuestion(true);
    }
  };

  const handleToggleRecord = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecordingAnswer) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    }
  };

  // History State
  const [pastInterviews, setPastInterviews] = useState<IInterview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistoryInterview, setSelectedHistoryInterview] = useState<IInterview | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);


  useEffect(() => {
    // Only auto-fill if navigating directly from the flow
    if (location.state && (location.state as any).fromFlow) {
      const fetchContext = async () => {
        try {
          const res = await resumeService.getAll();
          const resumes = res.data.resumes;
          if (resumes && resumes.length > 0) {
            const latest = resumes[0];
            if (latest.jobMatches && latest.jobMatches.length > 0) {
              setRole(latest.jobMatches[0].jobTitle);
            } else if (latest.aiAnalysis && latest.aiAnalysis.skills.length > 0) {
              setRole(latest.aiAnalysis.skills.slice(0, 3).join(', ') + ' Developer');
            }
          }
        } catch (err) {
          console.log('Failed to fetch resume context', err);
        } finally {
          setLoadingContext(false);
        }
      };
      fetchContext();
    } else {
      setLoadingContext(false);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await interviewService.getInterviews();
        if (res.success) {
          setPastInterviews(res.interviews);
        }
      } catch (err) {
        console.error('Failed to fetch interview history', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    if (step === 'setup') {
      fetchHistory();
    }
  }, [step]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      toast.error('Please enter a target role.');
      return;
    }
    
    setIsGenerating(true);
    toast.info('Generating AI interview questions...', { autoClose: 2000 });
    try {
      const res = await interviewService.generateQuestions({ role, type, difficulty });
      if (res.success) {
        setInterview(res.interview);
        setStep('session');
        setCurrentIndex(0);
        setUserAnswer('');
        toast.success('Interview started ✅');
      }
    } catch (err) {
      toast.error('Failed to generate interview questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please provide an answer before submitting.');
      return;
    }
    if (!interview) return;

    setIsEvaluating(true);
    try {
      const res = await interviewService.evaluateAnswer(interview._id, currentIndex, userAnswer);
      if (res.success) {
        setInterview(res.interview);
        toast.success('Answer submitted ✅');
        setUserAnswer('');
        
        if (currentIndex < interview.questions.length - 1) {
          setCurrentIndex(curr => curr + 1);
        } else {
          handleEndInterview(res.interview._id);
        }
      }
    } catch (err) {
      toast.error('Failed to evaluate answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEndInterview = async (id: string = interview?._id!) => {
    try {
      const res = await interviewService.endInterview(id);
      if (res.success) {
        setInterview(res.interview);
        setStep('dashboard');
        toast.success('Interview completed ✅');
      }
    } catch (err) {
      toast.error('Failed to finalize interview.');
    }
  };

  const handleDeleteInterviewClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteInterviewId(id);
  };

  const confirmDeleteInterview = async () => {
    if (!deleteInterviewId) return;
    try {
      const res = await interviewService.deleteInterview(deleteInterviewId);
      if (res.success) {
        setPastInterviews(prev => prev.filter(i => i._id !== deleteInterviewId));
        toast.success('Interview deleted');
      }
    } catch (err) {
      toast.error('Failed to delete interview');
    } finally {
      setDeleteInterviewId(null);
    }
  };

  // --- Render Setup ---
  if (step === 'setup') {
    return (
      <div className="flex flex-col gap-6 pb-10">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">AI Interview Coach</h1>
            <p className="text-lg text-gray-400 m-0">
              Practice with AI-generated questions and receive real-time feedback tailored to your target role.
            </p>
          </div>
          {(location.state as any)?.fromFlow && (
            <button
              type="button"
              onClick={() => navigate('/chatbot', { state: { fromFlow: true } })}
              className="shrink-0 px-5 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              Back to AI Mentor
            </button>
          )}
        </div>

        {/* Setup Card */}
        <div className="saas-card p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-white m-0 mb-2">Interview Configuration</h2>
          <form onSubmit={handleStart} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-gray-400 uppercase tracking-wide">Target Role</label>
                <div className="relative">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder={loadingContext ? 'Loading context...' : 'e.g. Frontend Developer'}
                    disabled={loadingContext}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none transition-colors hover:border-purple-400/50 focus:border-purple-500 focus:bg-white/5"
                    required
                  />
                  {loadingContext && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <RiRobot2Line className="animate-spin text-purple-400" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-gray-500">Auto-filled from your latest resume if available.</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-400 uppercase tracking-wide">Interview Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none transition-colors hover:border-purple-400/50 focus:border-purple-500 focus:bg-white/5 appearance-none cursor-pointer"
                >
                  <option value="Technical" className="bg-[#1A1A24] text-white">Technical</option>
                  <option value="Behavioral" className="bg-[#1A1A24] text-white">Behavioral</option>
                  <option value="HR" className="bg-[#1A1A24] text-white">HR</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-400 uppercase tracking-wide">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white outline-none transition-colors hover:border-purple-400/50 focus:border-purple-500 focus:bg-white/5 appearance-none cursor-pointer"
                >
                  <option value="Easy" className="bg-[#1A1A24] text-white">Easy</option>
                  <option value="Medium" className="bg-[#1A1A24] text-white">Medium</option>
                  <option value="Hard" className="bg-[#1A1A24] text-white">Hard</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating || loadingContext}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                {isGenerating ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Generating...</>
                ) : (
                  <><RiPlayCircleLine size={18} /> Start Interview</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Interviews Section */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">Recent Interviews</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          {isLoadingHistory ? (
             <div className="flex justify-center p-8"><RiRobot2Line className="animate-spin text-purple-400" size={32} /></div>
          ) : pastInterviews.length === 0 ? (
             <div className="saas-card p-8 text-center text-gray-500">No past interviews found. Start your first one above!</div>
          ) : (
             <div className="space-y-4">
               {pastInterviews.map(interviewItem => (
                 <div 
                   key={interviewItem._id} 
                   onClick={() => { setSelectedHistoryInterview(interviewItem); setIsModalOpen(true); }}
                   className="group glass p-5 rounded-[1.5rem] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.03] transition-all cursor-pointer flex items-center justify-between shadow-lg"
                 >
                   <div className="flex items-center gap-5">
                     <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-500">
                       <RiRobot2Line size={26} />
                     </div>
                     <div>
                       <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors text-lg">{interviewItem.role}</h4>
                       <div className="flex items-center gap-3 mt-1.5">
                         <span className="bg-white/5 text-[10px] py-0.5 px-2 rounded-full border border-white/10 text-gray-300 font-bold uppercase tracking-wider">
                           {interviewItem.type} • {interviewItem.difficulty}
                         </span>
                         <span className="text-[10px] text-gray-600 flex items-center gap-1 font-bold uppercase tracking-wider">
                           <RiTimeLine size={12} /> {new Date(interviewItem.createdAt).toLocaleDateString()}
                         </span>
                         <span className={`text-[10px] font-black uppercase tracking-wider ${interviewItem.overallScore !== undefined ? 'text-purple-500/80' : 'text-gray-500'}`}>
                           {interviewItem.overallScore !== undefined ? `${interviewItem.overallScore}% Score` : 'Incomplete'}
                         </span>
                       </div>
                     </div>
                   </div>

                   <div className="flex items-center gap-2">
                     <button 
                       onClick={(e) => handleDeleteInterviewClick(e, interviewItem._id)}
                       className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                       title="Delete Interview"
                     >
                       <RiDeleteBin6Line size={20} />
                     </button>
                     <div className="p-2 text-gray-700 group-hover:text-purple-500 transition-all group-hover:translate-x-1">
                       <RiArrowRightSLine size={24} />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* History Modal */}
        {isModalOpen && selectedHistoryInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar p-8 shadow-2xl relative">
              <DashboardView interview={selectedHistoryInterview} isModal={true} onClose={() => setIsModalOpen(false)} navigate={navigate} />
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteInterviewId !== null}
          onClose={() => setDeleteInterviewId(null)}
          onConfirm={confirmDeleteInterview}
          title="Delete Interview History"
          message="Are you sure you want to permanently delete this interview session? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    );
  }

  // --- Render Session ---
  if (step === 'session' && interview) {
    const currentQ = interview.questions[currentIndex];

    return (
      <div className="mx-auto w-full pt-4">
        {/* Top Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">AI Interview Coach</h1>
          <p className="text-sm text-gray-400">Practice with AI-generated questions and receive real-time feedback.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Active Question & Answer */}
          <div className="dashboard-card p-6 flex flex-col h-[600px]">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Question {currentIndex + 1} of {interview.questions.length}</h2>
              <button 
                onClick={() => handleSpeakQuestion(currentQ.question)}
                className={`transition-colors p-1.5 rounded-lg ${
                  isSpeakingQuestion 
                    ? 'text-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_12px_rgba(217,70,239,0.2)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={isSpeakingQuestion ? "Stop Reading" : "Read Question"}
              >
                <RiVolumeUpLine size={20} />
              </button>
            </div>

            {/* Question Text Box */}
            <div className="rounded-xl bg-[#15112B] p-5 border border-purple-500/20 mb-8">
              <p className="text-base font-medium leading-relaxed text-white">
                {currentQ.question}
              </p>
            </div>

            {/* Audio Waveform Graphic (Conditionally rendered) */}
            <div className="flex flex-1 items-center justify-center gap-1.5 px-10">
              {isSpeakingQuestion || isRecordingAnswer ? (
                [...Array(40)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 rounded-full bg-gradient-to-t from-purple-600 to-blue-400 animate-pulse" 
                    style={{ 
                      height: `${Math.max(15, Math.random() * 80)}px`, 
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0.8
                    }} 
                  />
                ))
              ) : (
                <div className="text-gray-600 text-xs italic text-center select-none">
                  {recognition ? 'Click the volume icon or "Record Answer" to activate voice coach' : 'Voice features not supported in this browser'}
                </div>
              )}
            </div>

            {/* Answer Input Area */}
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-bold text-gray-300">Your Answer</h3>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here or use the microphone to record..."
                className="h-32 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none transition-colors focus:border-purple-500/50"
              />
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all ${
                    isRecordingAnswer 
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' 
                      : 'border-white/10 bg-black/20 text-gray-300 hover:bg-white/5 hover:border-purple-500/30'
                  }`}
                >
                  <RiMicLine size={18} /> {isRecordingAnswer ? 'Listening... Stop' : 'Record Answer'}
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !userAnswer.trim()}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEvaluating ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Question List */}
          <div className="dashboard-card p-6 flex flex-col h-[600px]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Questions</h2>
              <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider select-none">
                AI Curated
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {interview.questions.map((q, i) => (
                <div 
                  key={i} 
                  className={`rounded-xl p-4 transition-colors ${
                    i === currentIndex 
                      ? 'border border-purple-500/40 bg-[#25154C]' 
                      : 'border border-white/5 bg-[#111116] opacity-60'
                  }`}
                >
                  <p className={`text-sm truncate ${i === currentIndex ? 'text-white' : 'text-gray-400'}`}>
                    <span className="font-semibold mr-1">Q{i + 1}:</span> {q.question}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => handleEndInterview()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
              >
                <RiPlayCircleLine size={18} /> End & View Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Dashboard ---
  if (step === 'dashboard' && interview) {
    return <DashboardView interview={interview} onStartNew={() => setStep('setup')} navigate={navigate} />;
  }

  return null;
};

export default InterviewPage;
