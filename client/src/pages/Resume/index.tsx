import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiUploadCloud2Line,
  RiFileTextLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiLightbulbFlashLine,
  RiVolumeUpLine,
  RiLoader4Line,
  RiDeleteBin6Line,
  RiCheckLine,
  RiCloseLine,
  RiMore2Line,
} from 'react-icons/ri';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jobsService } from '../../services/jobsService';
import ConfirmModal from '../../components/Common/ConfirmModal';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Suggestion {
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  detail: string;
}

interface AnalysisResult {
  overallScore: number;
  keywordMatch: number;
  formatting: number;
  contentQuality: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
}

// ─── Priority badge colors ─────────────────────────────────────────────────────
const priorityStyle: Record<string, string> = {
  High: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Medium: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  Low: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
};

// ─── AnimatedBar ───────────────────────────────────────────────────────────────
const AnimatedBar: React.FC<{ label: string; value: number; delay?: number }> = ({
  label,
  value,
  delay = 0,
}) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 150 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <span className="text-xs font-bold text-purple-400">{value}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
          style={{ width: `${width}%`, transition: `width 1.2s ease-out` }}
        />
      </div>
    </div>
  );
};

// ─── DonutScore ────────────────────────────────────────────────────────────────
const DonutScore: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 251.2;
  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    const t = setTimeout(
      () => setOffset(circumference - (circumference * score) / 100),
      150
    );
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="url(#purpleGradient)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-white leading-none mb-1">{score}</span>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
          ATS Score
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Resume: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileLabel, setSelectedFileLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [findJobsLoading, setFindJobsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState(() => {
    return sessionStorage.getItem('careergpt_resume_raw_text') || '';
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSkillsInput, setShowSkillsInput] = useState(() => {
    return sessionStorage.getItem('careergpt_resume_show_skills_input') === 'true';
  });
  const [skillsInputValue, setSkillsInputValue] = useState(() => {
    return sessionStorage.getItem('careergpt_resume_skills_input') || '';
  });
  const [resumeId, setResumeId] = useState<string | null>(() => {
    return sessionStorage.getItem('careergpt_resume_id') || null;
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('careergpt_resume_result');
    const storedFileLabel = sessionStorage.getItem('careergpt_resume_file_label');
    const storedRawText = sessionStorage.getItem('careergpt_resume_raw_text');
    const storedResumeId = sessionStorage.getItem('careergpt_resume_id');

    if (storedResult && storedFileLabel) {
      try {
        const parsed = JSON.parse(storedResult) as AnalysisResult;
        setResult(parsed);
        setSelectedFileLabel(storedFileLabel);
        if (storedRawText) setRawText(storedRawText);
        if (storedResumeId) {
          setResumeId(storedResumeId);
          console.log('Loaded active resume ID:', storedResumeId);
        }
      } catch {
        sessionStorage.removeItem('careergpt_resume_result');
        sessionStorage.removeItem('careergpt_resume_file_label');
        sessionStorage.removeItem('careergpt_resume_raw_text');
        sessionStorage.removeItem('careergpt_resume_id');
      }
    }
  }, []);

  useEffect(() => {
    if (resumeId) {
      console.log('Active resume ID tracking:', resumeId);
    }
  }, [resumeId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF or DOC/DOCX resumes are allowed ');
      return false;
    }
    
    if (file.size > 1024 * 1024) {
      toast.error('File size must be less than or equal to 1MB ⚠️');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) setSelectedFile(file);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setSelectedFileLabel(file.name);
      sessionStorage.setItem('careergpt_resume_file_label', file.name);
    }
    if (e.target) e.target.value = '';
  };

  const runAnalysis = async (): Promise<AnalysisResult | null> => {
    if (!selectedFile) {
      toast.error('Please select a resume file first.');
      return null;
    }

    setLoading(true);
    setResult(null);
    setRawText('');

    const formData = new FormData();
    formData.append('resume', selectedFile);

    const extraSkills = skillsInputValue
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (extraSkills.length > 0) {
      formData.append('extraSkills', JSON.stringify(extraSkills));
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const ai = res.data.resume.aiAnalysis;
      const extractedText = res.data.resume.rawText || '';
      const dbId = res.data.resume._id;
      
      setRawText(extractedText);
      setResumeId(dbId);
      sessionStorage.setItem('careergpt_resume_id', dbId);

      const parsedResult: AnalysisResult = {
        overallScore: ai.overallScore,
        keywordMatch: ai.keywordMatch,
        formatting: ai.formatting,
        contentQuality: ai.contentQuality,
        skills: ai.skills || [],
        strengths: ai.strengths || [],
        weaknesses: ai.weaknesses || [],
        suggestions: ai.suggestions || [],
      };

      setResult(parsedResult);
      sessionStorage.setItem('careergpt_resume_result', JSON.stringify(parsedResult));
      sessionStorage.setItem('careergpt_resume_raw_text', extractedText);
      sessionStorage.setItem('careergpt_resume_file_label', selectedFile.name);
      
      return parsedResult;
    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.message;
      const backendErr = err.response?.data?.error || '';
      const fullErrorMsg = `${serverMsg} ${backendErr}`.trim();
      
      if (fullErrorMsg.includes('Invalid Resume')) {
        toast.error('Failed: Invalid Resume ⚠️. Only resumes are supported.');
      } else {
        toast.error(`Error: ${fullErrorMsg}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    const res = await runAnalysis();
    if (res) {
      toast.success('Resume analyzed successfully ✅');
    }
  };

  const handleViewResume = () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      window.open(url, '_blank');
    } else if (rawText) {
      setShowViewModal(true);
    } else {
      toast.error('No resume content available to view.');
    }
  };

  const handleFindRelevantJobs = async () => {
    if (findJobsLoading) return;
    setFindJobsLoading(true);
    try {
      const res = await jobsService.getResumeProfile();
      if (!res.data.profile) {
        toast.error('No resume profile found. Please analyze a resume first.');
        return;
      }
      sessionStorage.setItem('careergpt_jobs_profile', JSON.stringify(res.data.profile));
      navigate('/jobs', {
        state: {
          autoFillProfile: res.data.profile,
          autoSearch: true,
          fromResume: true,
        },
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not load resume profile for job matching. Please try again.';
      toast.error(message);
    } finally {
      setFindJobsLoading(false);
    }
  };

  const handleSpeakFeedback = () => {
    if (!result) return;
    if (isSpeakingFeedback) {
      window.speechSynthesis.cancel();
      setIsSpeakingFeedback(false);
    } else {
      window.speechSynthesis.cancel();
      const scoreText = `Your overall resume score is ${result.overallScore} out of 100. `;
      const recommendationsText = result.suggestions
        .map((s, idx) => `Recommendation ${idx + 1}: ${s.priority} priority. ${s.title}: ${s.detail}`)
        .join('. ');
      const fullText = `${scoreText} ${recommendationsText}`;
      const cleanText = fullText
        .replace(/[*#_\-`]/g, '')
        .trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => {
        setIsSpeakingFeedback(false);
      };
      utterance.onerror = () => {
        setIsSpeakingFeedback(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeakingFeedback(true);
    }
  };

  const handleDeleteResume = async () => {
    window.speechSynthesis.cancel();
    setIsSpeakingFeedback(false);
    setShowDeleteConfirmModal(false);
    
    setSelectedFile(null);
    setSelectedFileLabel('');
    setResult(null);
    setRawText('');
    setResumeId(null);
    setSkillsInputValue('');
    setShowSkillsInput(false);
    sessionStorage.removeItem('careergpt_resume_result');
    sessionStorage.removeItem('careergpt_resume_file_label');
    sessionStorage.removeItem('careergpt_resume_raw_text');
    sessionStorage.removeItem('careergpt_resume_id');
    sessionStorage.removeItem('careergpt_resume_skills_input');
    sessionStorage.removeItem('careergpt_resume_show_skills_input');
    toast.success('Resume cleared from view successfully ✅');
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 1s linear infinite; }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col gap-1.5 mb-2">
        <h1 className="text-3xl font-extrabold text-white m-0">AI Resume Analyzer</h1>
        <p className="text-sm text-gray-400 m-0">
          Upload your resume for AI-powered analysis and recommendations.
        </p>
      </div>

      {/* Top Row: Upload + ATS Score */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Upload Card */}
        <div className="lg:w-[35%] shrink-0 saas-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <RiUploadCloud2Line size={20} className="text-purple-400" />
            <h2 className="text-base font-bold text-white m-0">Upload Resume</h2>
          </div>

          {/* Dropzone */}
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : selectedFile
                ? 'border-purple-400 bg-purple-500/5'
                : 'border-white/10 bg-black/20 hover:bg-white/5 hover:border-purple-400/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile || selectedFileLabel ? (
              <div className="relative w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>

                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-3 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <RiCheckLine size={28} />
                </div>
                <p className="text-sm font-semibold text-purple-300 text-center mb-1 max-w-[80%] truncate">
                  {selectedFile?.name || selectedFileLabel}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Uploaded resume'}
                </p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-purple-400 border border-white/5 shadow-sm">
                  <RiFileTextLine size={28} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Drop your resume here</h3>
                <p className="text-gray-500 text-sm">Supports PDF, DOCX</p>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedFile}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-all"
            >
              {loading ? (
                <>
                  <RiLoader4Line size={16} className="spin-slow" />
                  Analyzing...
                </>
              ) : (
                'Analyze Resume'
              )}
            </button>
            {(selectedFile || selectedFileLabel) && !loading && (
              <div className="relative" ref={dropdownRef}>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
                  >
                    <RiMore2Line size={16} />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                    More Options
                  </div>
                </div>

                {showDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-32 bg-[#0e0d16] border border-purple-500/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-1 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        handleViewResume();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-purple-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RiFileTextLine size={14} className="text-purple-400" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowSkillsInput(true);
                        sessionStorage.setItem('careergpt_resume_show_skills_input', 'true');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-purple-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RiLightbulbFlashLine size={14} className="text-fuchsia-400" />
                      Add Skills
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowDeleteConfirmModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RiDeleteBin6Line size={14} className="text-red-400" />
                      Clear View
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showSkillsInput && (
            <div className="flex flex-col gap-1.5 mt-1 pt-3 border-t border-white/5">
              <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Additional Skills (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. React Native, Go, Docker"
                value={skillsInputValue}
                onChange={(e) => {
                  setSkillsInputValue(e.target.value);
                  sessionStorage.setItem('careergpt_resume_skills_input', e.target.value);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          )}
        </div>

        {/* ATS Score Card */}
        <div className="flex-1 saas-card p-6 flex flex-col">
          <h2 className="text-base font-bold text-white m-0 mb-6">ATS Score Analysis</h2>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <RiLoader4Line size={40} className="spin-slow text-purple-500" />
              <p className="text-sm font-medium">AI is analyzing your resume…</p>
            </div>
          ) : result ? (
            <div className="flex flex-col sm:flex-row items-center gap-8 flex-1">
              <DonutScore score={result.overallScore} />
              <div className="flex-1 w-full flex flex-col gap-5 justify-center">
                <AnimatedBar label="Keyword Match" value={result.keywordMatch} delay={0} />
                <AnimatedBar label="Formatting" value={result.formatting} delay={200} />
                <AnimatedBar label="Content Quality" value={result.contentQuality} delay={400} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500">
              <RiFileTextLine size={40} className="opacity-50" />
              <p className="text-sm font-medium">Upload and analyze a resume to see your score</p>
            </div>
          )}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      {result && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Strengths */}
          <div className="flex-1 saas-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <RiCheckDoubleLine size={20} className="text-emerald-400" />
              <h2 className="text-base font-bold text-white m-0">Strengths</h2>
            </div>
            <div className="flex flex-col gap-3 max-h-42.5 overflow-y-auto custom-scrollbar pr-2">
              {result.strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-lg shrink-0"
                >
                  <RiCheckDoubleLine className="text-emerald-400 shrink-0" size={18} />
                  <span className="text-sm font-medium text-gray-200">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="flex-1 saas-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <RiErrorWarningLine size={20} className="text-orange-400" />
              <h2 className="text-base font-bold text-white m-0">Areas to Improve</h2>
            </div>
            <div className="flex flex-col gap-3 max-h-42.5 overflow-y-auto custom-scrollbar pr-2">
              {result.weaknesses.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-lg shrink-0"
                >
                  <RiErrorWarningLine className="text-orange-400 shrink-0" size={18} />
                  <span className="text-sm font-medium text-gray-200">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {result && result.suggestions.length > 0 && (
        <div className="saas-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <RiLightbulbFlashLine size={20} className="text-purple-400" />
              <h2 className="text-base font-bold text-white m-0">AI Recommendations</h2>
            </div>
            <button
              onClick={handleSpeakFeedback}
              className={`flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors border ${
                isSpeakingFeedback
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-pulse'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <RiVolumeUpLine size={16} /> {isSpeakingFeedback ? 'Stop Listening' : 'Listen to Feedback'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {result.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-xl"
              >
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 mt-0.5 ${
                    priorityStyle[s.priority] ?? priorityStyle['Low']
                  }`}
                >
                  {s.priority}
                </span>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm m-0 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="saas-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white m-0">Ready for job matching?</h3>
            <p className="text-sm text-gray-400 m-0 mt-1">
              Use this analyzed resume to auto-fill the Job Matcher and find relevant roles.
            </p>
          </div>
          <button
            onClick={handleFindRelevantJobs}
            disabled={findJobsLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            {findJobsLoading ? (
              <>
                <RiLoader4Line size={16} className="spin-slow" />
                Finding Jobs...
              </>
            ) : (
              'Find Relevant Jobs'
            )}
          </button>
        </div>
      )}

      {/* Empty state when nothing analyzed yet */}
      {!result && !loading && (
        <div className="saas-card p-8 flex flex-col items-center gap-3 text-center">
          <RiLightbulbFlashLine size={36} className="text-purple-500 opacity-80" />
          <p className="text-gray-400 text-sm font-medium">
            Upload your resume above and click <strong>Analyze Resume</strong> to get your full AI-powered report.
          </p>
        </div>
      )}

      {/* View Extracted Text Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-[#0c0d16] border border-purple-500/20 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Extracted Resume Text</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <RiCloseLine size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {rawText}
              </pre>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        title="Clear Active Resume"
        message="Are you sure you want to remove this resume from the current view? This will clear the active report so you can upload a new one, but your upload history on the dashboard will be preserved."
        onConfirm={handleDeleteResume}
        onClose={() => setShowDeleteConfirmModal(false)}
      />
    </div>
  );
};

export default Resume;
