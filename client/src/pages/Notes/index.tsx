import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Edit,
  GraduationCap,
  Briefcase,
  Lightbulb,
  X
} from 'lucide-react';
import { Button, Loader } from '../../components/UI';
import { notesService } from '../../services/notesService';
import { getRoadmaps } from '../../services/roadmapService';
import { resumeService } from '../../services/resumeService';
import { successToast, errorToast } from '../../utils/toast';
import ConfirmModal from '../../components/Common/ConfirmModal';

interface Note {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  aiSummary?: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface Suggestion {
  title: string;
  category: string;
  content: string;
  icon: React.ReactNode;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  
  // Page view & editor states
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // UX states
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedReadNote, setSelectedReadNote] = useState<Note | null>(null);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
    fetchEcosystemSuggestions();
    
    // Cleanup speech on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await notesService.getAll();
      if (res.data?.success) {
        setNotes(res.data.notes || []);
      }
    } catch (err) {
      errorToast('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchEcosystemSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const list: Suggestion[] = [];

      // 1. Fetch roadmaps
      try {
        const roadRes = await getRoadmaps();
        if (roadRes.roadmaps && roadRes.roadmaps.length > 0) {
          const latest = roadRes.roadmaps[0];
          latest.steps.slice(0, 2).forEach((step: any) => {
            list.push({
              title: `Study: ${step.title}`,
              category: 'Roadmap Notes',
              content: `- Key Goal: Master ${step.title}\n- Core Tasks:\n${step.tasks.map((t: any) => `  * [ ] ${t.title}`).join('\n')}\n- Resources to check: ${step.resources.map((r: any) => r.name).join(', ')}`,
              icon: <GraduationCap size={16} />
            });
          });
        }
      } catch (e) {
        console.log('Skipping roadmap suggestions');
      }

      // 2. Fetch resumes for weaknesses
      try {
        const resRes = await resumeService.getAll();
        const resumes = resRes.data.resumes;
        if (resumes && resumes.length > 0) {
          const latest = resumes[0];
          if (latest.aiAnalysis?.weaknesses && latest.aiAnalysis.weaknesses.length > 0) {
            latest.aiAnalysis.weaknesses.slice(0, 2).forEach((weakness: string) => {
              list.push({
                title: `Skill Gap Study: ${weakness}`,
                category: 'Resume Weakness',
                content: `- Focus Area: Overcoming skill deficiency in ${weakness}\n- Objective: Implement standard projects and learn core patterns.\n- Roadmap:\n  1. Learn foundations of ${weakness}.\n  2. Build a mini demo application.\n  3. Review common interview questions.`,
                icon: <Briefcase size={16} />
              });
            });
          }
        }
      } catch (e) {
        console.log('Skipping resume suggestions');
      }

      // Fallback/standard tech suggestions
      if (list.length === 0) {
        list.push({
          title: 'React Hooks Best Practices',
          category: 'Frontend',
          content: '1. Only call Hooks at the top level.\n2. Only call Hooks from React functions.\n3. Use useMemo and useCallback to optimize rendering.\n4. Always declare dependencies in useEffect correctly.',
          icon: <Lightbulb size={16} />
        });
        list.push({
          title: 'System Design: Caching Patterns',
          category: 'System Design',
          content: '- Cache-Aside: Application queries database if cache misses, then writes to cache.\n- Write-Through: Data is written to cache and database synchronously.\n- Write-Behind: Data is written to cache first, database updated asynchronously.',
          icon: <Lightbulb size={16} />
        });
      }

      setSuggestions(list);
    } catch (err) {
      console.log('Error loading suggestions', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleOpenNewNote = () => {
    setIsEditMode(false);
    setEditId(null);
    setTitle('');
    setContent('');
    setViewMode('create');
  };

  const handleOpenEditNote = (note: Note) => {
    setIsEditMode(true);
    setEditId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setViewMode('edit');
    setActiveMenuId(null);
  };

  const handleApplySuggestion = (sug: Suggestion) => {
    setTitle(sug.title);
    setContent(sug.content);
    successToast('Suggestion loaded 💡');
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      errorToast('Title and content are required');
      return;
    }

    try {
      setIsSaving(true);
      if (isEditMode && editId) {
        const res = await notesService.update(editId, { title, content });
        if (res.data?.success) {
          successToast('Note saved ✅');
          setViewMode('list');
          fetchNotes();
        }
      } else {
        const res = await notesService.create({ title, content });
        if (res.data?.success) {
          successToast('Note saved ✅');
          setViewMode('list');
          fetchNotes();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save note';
      errorToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNoteClick = (id: string) => {
    setDeleteNoteId(id);
    setActiveMenuId(null);
  };

  const confirmDeleteNote = async () => {
    if (!deleteNoteId) return;
    try {
      const res = await notesService.delete(deleteNoteId);
      if (res.data?.success) {
        successToast('Note deleted ✅');
        setNotes(notes.filter(n => n._id !== deleteNoteId));
        if (activeSpeakingId === deleteNoteId) {
          window.speechSynthesis.cancel();
          setActiveSpeakingId(null);
        }
      }
    } catch (err) {
      errorToast('Failed to delete note');
    } finally {
      setDeleteNoteId(null);
    }
  };

  const handleSpeak = (noteId: string, text: string) => {
    if (activeSpeakingId === noteId) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[*#_\-`]/g, '') // remove markdown indicators
        .trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => {
        setActiveSpeakingId(null);
      };
      utterance.onerror = () => {
        setActiveSpeakingId(null);
      };
      window.speechSynthesis.speak(utterance);
      setActiveSpeakingId(noteId);
    }
  };

  const handleOpenReadModal = (note: Note) => {
    setSelectedReadNote(note);
    setIsReadModalOpen(true);
  };

  const handleCloseReadModal = () => {
    setSelectedReadNote(null);
    setIsReadModalOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    if (weeks < 4) return `${weeks} weeks ago`;
    return date.toLocaleDateString();
  };

  // Extract all categories dynamically
  const categories = ['All', ...Array.from(new Set(notes.map(n => n.category).filter(Boolean)))];

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) return <Loader text="Loading your AI Notes..." />;

  if (viewMode !== 'list') {
    return (
      <div className="w-full pb-20 relative">
        {/* Decorative Blur Backgrounds */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Back Link Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('list')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0"
            title="Back to notes"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white leading-none">
              {viewMode === 'edit' ? 'Edit Note' : 'Create Note'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {viewMode === 'edit' ? 'Update your note content and re-analyze with AI' : 'Draft a new technology or career note with AI assistance'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form Box */}
          <div className="lg:col-span-2 glass rounded-3xl border border-white/5 p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React hooks guidelines, Docker basics..."
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your study notes or career goals here... (supports tech & career topics only)"
                className="w-full h-96 p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-600 resize-none custom-scrollbar leading-relaxed"
              />
            </div>

            {/* AI smart validation notice */}
            <div className="rounded-xl bg-purple-950/20 border border-purple-500/10 p-4 flex gap-3 text-xs text-purple-300">
              <Sparkles className="shrink-0 text-purple-400" size={16} />
              <p>
                <strong>AI Smart Validation:</strong> Our Learning Hub accepts technology or career-related notes only. Saving will automatically analyze relevance, generate summaries, and assign tags.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveNote}
                loading={isSaving}
                className="shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-gradient-to-r from-purple-600 to-fuchsia-600"
              >
                {isSaving ? 'Analyzing & Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>

          {/* Suggestions Sidebar */}
          <div className="glass rounded-3xl border border-white/5 p-8 flex flex-col justify-between h-fit lg:sticky lg:top-8">
            <div>
              <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-400" /> Suggested Topics
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Prefill note content based on roadmap, mock interview, and resume weaknesses.
              </p>

              {loadingSuggestions ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  Loading suggested topics...
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleApplySuggestion(sug)}
                      className="p-3.5 rounded-xl border border-white/5 hover:border-purple-500/20 bg-white/5 hover:bg-purple-950/10 transition-all cursor-pointer group flex items-start gap-3"
                    >
                      <div className="text-purple-400 mt-0.5 shrink-0">
                        {sug.icon}
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-0.5">
                          {sug.category}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {sug.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-[10px] text-gray-600 text-center">
              CareerGPT Ecosystem Integration
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Notes</h1>
          <p className="text-gray-400">Create and organize notes with AI assistance.</p>
        </div>
        <button
          onClick={handleOpenNewNote}
          className="px-5 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center gap-2 text-sm active:scale-95"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-6 mb-10">
        <div className="relative group max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-600 group-hover:bg-white/[0.07]"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
            <Search size={18} />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs rounded-full transition-all duration-300 font-bold border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600/20 to-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Notes */}
      {filteredNotes.length === 0 ? (
        <div className="glass rounded-[2rem] border border-white/5 p-16 text-center max-w-xl mx-auto mt-10">
          <span className="text-5xl mb-4 block">📝</span>
          <h3 className="text-xl font-bold text-white mb-2">No Notes Found</h3>
          <p className="text-gray-400 text-sm">
            {search || selectedCategory !== 'All' 
              ? "We couldn't find any notes matching your search criteria." 
              : "Start your tech learning journey by creating your first AI note!"}
          </p>
          {!search && selectedCategory === 'All' && (
            <button
              onClick={handleOpenNewNote}
              className="mt-6 px-4 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              + Create Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="glass rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group shadow-lg w-full h-[280px]"
            >
              {/* Card Header & Content (Clickable Area) */}
              <div className="relative flex-1 flex flex-col min-h-0">
                {/* Options Menu (Top Right absolute) */}
                <div className="absolute right-6 top-6 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === note._id ? null : note._id);
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                  >
                    •••
                  </button>
                  
                  {activeMenuId === note._id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 mt-2 w-32 rounded-xl bg-[#0b0616] border border-white/10 p-1.5 shadow-2xl z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditNote(note);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                          <Edit size={12} /> Edit Note
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNoteClick(note._id);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
                        >
                          <Trash2 size={12} /> Delete Note
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div 
                  onClick={() => handleOpenReadModal(note)}
                  className="p-6 pb-2 cursor-pointer flex-1 flex flex-col min-h-0 select-none"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1 min-w-0 pr-8">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wider mb-2 inline-block">
                        {note.category}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {note.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-3 whitespace-pre-line leading-relaxed mb-3">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto overflow-hidden h-[22px]">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md whitespace-nowrap">
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px] text-gray-600 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">
                  {formatTimeAgo(note.createdAt)}
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Sparkle Summary Trigger */}
                  <button
                    onClick={() => handleOpenReadModal(note)}
                    className="p-2 rounded-xl transition-all border bg-white/5 border-white/5 text-gray-500 hover:text-purple-400 hover:border-purple-500/20"
                    title="View AI Summary"
                  >
                    <Sparkles size={14} />
                  </button>

                  {/* Speaker TTS Trigger */}
                  <button
                    onClick={() => handleSpeak(note._id, note.content)}
                    className={`p-2 rounded-xl transition-all border ${
                      activeSpeakingId === note._id
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-pulse'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-blue-400 hover:border-blue-500/20'
                    }`}
                    title={activeSpeakingId === note._id ? 'Stop Reading' : 'Read Note Aloud'}
                  >
                    {activeSpeakingId === note._id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read Note Modal */}
      <AnimatePresence>
        {isReadModalOpen && selectedReadNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0616] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseReadModal}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-10"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="p-8 pb-4 border-b border-white/5">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wider mb-3 inline-block">
                  {selectedReadNote.category}
                </span>
                <h2 className="text-2xl font-bold text-white pr-10">
                  {selectedReadNote.title}
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(selectedReadNote.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Content Area */}
              <div className="p-8 py-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {/* AI Summary Block */}
                {(selectedReadNote.summary || selectedReadNote.aiSummary) && (
                  <div className="rounded-2xl bg-purple-950/20 border border-purple-500/15 p-5 flex gap-3.5 text-sm text-purple-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <Sparkles className="shrink-0 text-purple-400 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">AI Generated Summary</h4>
                      <p className="leading-relaxed text-xs">
                        {selectedReadNote.summary || selectedReadNote.aiSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Note Main Body Content */}
                <div className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                  {selectedReadNote.content}
                </div>

                {/* Tags */}
                {selectedReadNote.tags && selectedReadNote.tags.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Category Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedReadNote.tags.map((tag) => (
                        <span key={tag} className="text-xs text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  CareerGPT Learning Hub
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(selectedReadNote._id, selectedReadNote.content)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                      activeSpeakingId === selectedReadNote._id
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-purple-500/20'
                    }`}
                  >
                    {activeSpeakingId === selectedReadNote._id ? (
                      <>
                        <VolumeX size={14} /> Stop Listening
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} /> Listen to Note
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCloseReadModal}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteNoteId !== null}
        onClose={() => setDeleteNoteId(null)}
        onConfirm={confirmDeleteNote}
        title="Delete Study Note"
        message="Are you sure you want to delete this study note? This will remove all AI summaries and tags."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Notes;
