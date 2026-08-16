import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Map, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Brain, 
  Target, 
  Trash2, 
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle,
  X
} from 'lucide-react';
import { Button, Loader } from '../../components/UI';
import { 
  generateRoadmap, 
  getRoadmaps, 
  updateTaskProgress,
  deleteRoadmap, 
  type Roadmap as RoadmapType
} from '../../services/roadmapService';
import { resumeService } from '../../services/resumeService';
import { interviewService } from '../../services/interviewService';
import { successToast, errorToast } from '../../utils/toast';
import ConfirmModal from '../../components/Common/ConfirmModal';

const Roadmap: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapType[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState('Building Your Career Path...');
  const [viewMode, setViewMode] = useState<'setup' | 'display'>('setup');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);
  const [deleteRoadmapId, setDeleteRoadmapId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Setup Form State
  const [targetRole, setTargetRole] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [timeframe, setTimeframe] = useState('3 Months');

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const times = ['1 Month', '3 Months', '6 Months', '1 Year'];

  useEffect(() => {
    fetchRoadmaps();
    // Only auto-fill context if we're coming from the AI flow
    if (location.state && (location.state as any).fromFlow) {
      fetchUserContext();
    }
  }, [location.state]);

  const fetchUserContext = async () => {
    try {
      setLoadingContext(true);
      // 1. Try to get latest resume
      const resRes = await resumeService.getAll();
      const resumes = resRes.data.resumes;
      
      if (resumes && resumes.length > 0) {
        const latest = resumes[0];
        if (latest.jobMatches && latest.jobMatches.length > 0) {
          setTargetRole(latest.jobMatches[0].jobTitle);
        } else if (latest.aiAnalysis?.skills && latest.aiAnalysis.skills.length > 0) {
          // If no job match, use skills to infer
          setTargetRole(latest.aiAnalysis.skills.slice(0, 2).join(' & ') + ' Specialist');
        }
      }

      // 2. Override with latest interview if available (more specific)
      const intRes = await interviewService.getInterviews();
      if (intRes.success && intRes.interviews.length > 0) {
        setTargetRole(intRes.interviews[0].role);
      }
    } catch (err) {
      console.log('Failed to fetch user context for roadmap', err);
    } finally {
      setLoadingContext(false);
    }
  };

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const data = await getRoadmaps();
      setRoadmaps(data.roadmaps || []);
      if (data.roadmaps?.length > 0) {
        setCurrentRoadmap(data.roadmaps[0]);
      }
    } catch (err) {
      errorToast('Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!targetRole) {
      errorToast('Please enter a target role');
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    try {
      setIsGenerating(true);
      const messages = [
        'Analyzing requirements...',
        'Mapping career milestones...',
        'Curating best resources...',
        'Tailoring skill paths...',
        'Almost there...'
      ];
      let msgIdx = 0;
      interval = setInterval(() => {
        setGeneratingMessage(messages[msgIdx]);
        msgIdx = (msgIdx + 1) % messages.length;
      }, 2500);

      const data = await generateRoadmap({ targetRole, timeframe, skillLevel });
      successToast('Roadmap generated ✅');
      setRoadmaps([data.roadmap, ...roadmaps]);
      setCurrentRoadmap(data.roadmap);
      setViewMode('display');
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to generate roadmap. Please try again.';
      errorToast(msg);
    } finally {
      if (interval) clearInterval(interval);
      setIsGenerating(false);
      setGeneratingMessage('Building Your Career Path...');
    }
  };

  const handleToggleTask = async (roadmapId: string, stepIndex: number, taskIndex: number, completed: boolean) => {
    try {
      const data = await updateTaskProgress(roadmapId, stepIndex, taskIndex, !completed);
      
      // Update local state
      const updatedRoadmap = data.roadmap;
      setRoadmaps(roadmaps.map(r => r._id === roadmapId ? updatedRoadmap : r));
      if (currentRoadmap?._id === roadmapId) {
        setCurrentRoadmap(updatedRoadmap);
      }
      
      successToast(!completed ? 'Task completed ✅' : 'Task updated');
    } catch (err) {
      errorToast('Failed to update progress');
    }
  };

  const handleDeleteRoadmapClick = (id: string) => {
    setDeleteRoadmapId(id);
  };

  const confirmDeleteRoadmap = async () => {
    if (!deleteRoadmapId) return;
    try {
      await deleteRoadmap(deleteRoadmapId);
      successToast('Roadmap deleted');
      const updatedList = roadmaps.filter(r => r._id !== deleteRoadmapId);
      setRoadmaps(updatedList);
      if (currentRoadmap?._id === deleteRoadmapId) {
        setCurrentRoadmap(updatedList.length > 0 ? updatedList[0] : null);
        if (updatedList.length === 0) setIsModalOpen(false);
      }
    } catch (err) {
      errorToast('Failed to delete roadmap');
    } finally {
      setDeleteRoadmapId(null);
    }
  };

  const toggleStepExpansion = (index: number) => {
    if (expandedSteps.includes(index)) {
      setExpandedSteps(expandedSteps.filter(i => i !== index));
    } else {
      setExpandedSteps([...expandedSteps, index]);
    }
  };

  const renderRoadmapDisplay = () => {
    if (!currentRoadmap) return null;
    return (
      <motion.div
        key="display"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 mt-4 w-full max-w-6xl mx-auto"
      >
        {/* Overall Progress Card - Horizontal Layout */}
        <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent pointer-events-none" />
          
          <div className="flex-1 text-center md:text-left z-10">
            <h3 className="text-xl font-bold text-white mb-2">Overall Progress</h3>
            <p className="text-gray-400 text-sm">
              {currentRoadmap?.overallProgress === 100 
                ? "Congratulations! You've completed your roadmap! 🎉" 
                : "You're making great progress on your journey!"}
            </p>
          </div>

          <div className="flex items-center gap-12 z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{currentRoadmap?.overallProgress || 0}%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Complete</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {currentRoadmap?.steps?.filter(s => s.completed).length || 0}/{currentRoadmap?.steps?.length || 0}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Stages Done</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">~{currentRoadmap?.timeframe ? currentRoadmap.timeframe.split(' ')[0] : '0'} {currentRoadmap?.timeframe ? currentRoadmap.timeframe.split(' ')[1].slice(0, 2) : 'Mo'}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">To Goal</div>
            </div>
          </div>
        </div>

        {/* Timeline & Steps */}
        <div className="relative pl-12">
          {/* Vertical Line */}
          <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-white/5 rounded-full" />

          <div className="space-y-10">
            {currentRoadmap?.steps?.map((step, sIdx) => (
              <div key={sIdx} className="relative">
                {/* Node */}
                <div 
                  className={`absolute -left-[57px] top-6 w-10 h-10 rounded-full border-[6px] border-[#030308] z-10 flex items-center justify-center transition-all duration-500 ${
                    step.completed 
                      ? 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-110' 
                      : 'bg-white/10'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : (
                    <div className={`w-3 h-3 rounded-full ${sIdx === 0 && !step.completed ? 'bg-blue-500 animate-pulse' : 'bg-white/20'}`} />
                  )}
                </div>

                {/* Step Card */}
                <motion.div 
                  layout
                  className={`glass rounded-3xl overflow-hidden border border-white/5 group hover:border-white/10 transition-all duration-300 ${
                    step.completed ? 'opacity-80' : ''
                  }`}
                >
                  <div 
                    className="p-8 cursor-pointer flex items-start justify-between relative"
                    onClick={() => toggleStepExpansion(sIdx)}
                  >
                    <div className="flex-1 pr-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                          step.completed 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {step.completed ? 'Completed' : 'In Progress'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{step.duration}</span>
                      </div>
                      
                      <h4 className={`text-2xl font-bold mb-3 transition-all ${step.completed ? 'text-gray-400' : 'text-white'}`}>
                        {step.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                        {step.description}
                      </p>

                      {/* Task Checklist */}
                      <div className="mt-8 space-y-4">
                        {step.tasks?.map((task, tIdx) => (
                          <div 
                            key={tIdx} 
                            className="flex items-center gap-4 group/task cursor-pointer w-fit"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentRoadmap) {
                                handleToggleTask(currentRoadmap._id, sIdx, tIdx, task.completed);
                              }
                            }}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white/5 border border-white/10 text-transparent group-hover/task:border-purple-500/50'
                            }`}>
                              <CheckCircle size={12} />
                            </div>
                            <span className={`text-sm transition-all ${
                              task.completed ? 'text-gray-500 line-through' : 'text-gray-300 group-hover/task:text-white'
                            }`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Resources Section */}
                      <div className="mt-10 pt-8 border-t border-white/5">
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <BookOpen size={12} />
                          Recommended Resources
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          {step.resources?.map((res, rid) => (
                            <a 
                              key={rid}
                              href={res.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all text-xs font-medium text-gray-300 hover:text-white group/res"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {res.name}
                              <ExternalLink size={12} className="opacity-40 group-hover/res:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`mt-2 transition-transform duration-500 ${expandedSteps.includes(sIdx) ? 'rotate-180' : ''}`}>
                      <ChevronDown size={24} className="text-white/20 group-hover:text-white/40" />
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) return <Loader text="Loading your roadmaps..." />;

  return (
    <div className="w-full pb-20">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Career Roadmap</h1>
          <p className="text-gray-400">
            {currentRoadmap ? `Your personalized path to becoming a ${currentRoadmap.targetRole}.` : 'Your personalized AI-powered path to professional success'}
          </p>
        </div>
        <div className="flex gap-3">
          {viewMode === 'display' ? (
            <>
              <Button 
                variant="ghost" 
                icon={<ArrowLeft size={18} />}
                onClick={() => setViewMode('setup')}
                className="bg-white/5 border-white/10 hover:bg-white/10"
              >
                Setup
              </Button>
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={() => {
                  setViewMode('setup');
                  setTargetRole('');
                }}
                className="shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                New
              </Button>
            </>
          ) : (
            (location.state as any)?.fromFlow && (
              <button
                type="button"
                onClick={() => navigate('/interview', { state: { fromFlow: true } })}
                className="shrink-0 px-5 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={16} /> Back to Interview
              </button>
            )
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'setup' ? (
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative"
        >
            {/* Decorative background glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="glass p-10 rounded-[2.5rem] border border-white/5 w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                <Map size={200} />
              </div>

              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                  <Brain size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Configure Your Path</h2>
                  <p className="text-gray-400">Tailored AI guidance for your professional journey.</p>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Target Career Role</label>
                    {loadingContext && <span className="text-[10px] text-purple-400 animate-pulse font-bold">Syncing context...</span>}
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Developer, AI Engineer..."
                      className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-600 group-hover:bg-white/[0.07] text-lg"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                      <Target size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Skill Level</label>
                    <div className="flex p-1.5 rounded-2xl bg-black/40 border border-white/5 gap-1">
                      {levels.map(level => (
                        <button
                          key={level}
                          onClick={() => setSkillLevel(level)}
                          className={`flex-1 py-3 px-1 text-xs rounded-xl transition-all duration-300 font-bold ${
                            skillLevel === level 
                            ? 'bg-gradient-to-r from-purple-600/20 to-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                            : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Timeline</label>
                    <div className="relative group">
                      <select 
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="w-full p-4 pl-12 rounded-2xl bg-black/40 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all cursor-pointer appearance-none group-hover:bg-white/[0.07]"
                      >
                        {times.map(t => <option key={t} value={t} className="bg-[#0A0A0F]">{t}</option>)}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Clock size={18} />
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full h-18 text-xl font-black rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    onClick={handleGenerate}
                    loading={isGenerating}
                    icon={!isGenerating && <Sparkles size={24} />}
                  >
                    {isGenerating ? generatingMessage : 'Generate My Roadmap'}
                  </Button>
                  <p className="text-center text-gray-500 text-xs mt-6 font-medium">
                    AI will analyze your profile and current industry trends to build this.
                  </p>
                </div>
              </div>
            </div>
          {roadmaps.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full mt-20"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">Recent Roadmaps</h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
              </div>

              <div className="space-y-4">
                {roadmaps.map((r) => (
                  <div 
                    key={r._id}
                    onClick={() => {
                      setCurrentRoadmap(r);
                      setIsModalOpen(true);
                    }}
                    className="group glass p-5 rounded-[1.5rem] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.03] transition-all cursor-pointer flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-500">
                        <Map size={26} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors text-lg">{r.targetRole}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="bg-white/5 text-[10px] py-0.5 px-2 rounded-full border border-white/10 text-gray-300 font-bold uppercase tracking-wider">
                            {r.skillLevel}
                          </span>
                          <span className="text-[10px] text-gray-600 flex items-center gap-1 font-bold uppercase tracking-wider">
                            <Clock size={12} /> {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-purple-500/80 font-black uppercase tracking-wider">
                            {r.overallProgress}% Complete
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoadmapClick(r._id);
                        }}
                        className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="p-2 text-gray-700 group-hover:text-purple-500 transition-all group-hover:translate-x-1">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
        ) : (
          renderRoadmapDisplay()
        )}
      </AnimatePresence>

      {/* Roadmap Modal */}
      {isModalOpen && currentRoadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm z-[100]">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-50"
            >
              <X size={20} />
            </button>
            {renderRoadmapDisplay()}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteRoadmapId !== null}
        onClose={() => setDeleteRoadmapId(null)}
        onConfirm={confirmDeleteRoadmap}
        title="Delete Career Roadmap"
        message="Are you sure you want to permanently delete this career roadmap? This will erase all tasks and progress details."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Roadmap;
