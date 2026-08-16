import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { 
  RiFileTextLine, 
  RiCheckLine, 
  RiUploadCloud2Line, 
  RiCalendarLine,
  RiRoadMapLine,
  RiCloseLine,
  RiAlertLine,
  RiInformationLine,
  RiLightbulbLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { resumeService } from '../../services/resumeService';
import { getRoadmaps } from '../../services/roadmapService';

// Relative time helper
const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeColor?: 'green' | 'red' | 'yellow' | 'gray';
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, change, changeColor = 'green', color }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getChangeBadgeClass = () => {
    switch (changeColor) {
      case 'green':
        return 'text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20';
      case 'red':
        return 'text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20';
      case 'yellow':
        return 'text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20';
      case 'gray':
      default:
        return 'text-xs font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10';
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="saas-card relative overflow-hidden p-6"
    >
      {isHovering && (
        <div
          className="pointer-events-none absolute h-40 w-40 rounded-full opacity-0 mix-blend-screen transition-opacity duration-300"
          style={{
            left: `${mousePosition.x - 80}px`,
            top: `${mousePosition.y - 80}px`,
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            opacity: 0.6,
          }}
        />
      )}

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-lg p-3 text-xl" style={{ background: `${color}20`, color }}>
            {icon}
          </div>
          {change && <span className={getChangeBadgeClass()}>{change}</span>}
        </div>
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

// Custom Chart Tooltip component for Progression Chart
const CustomProgressionTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0A0A0F]/95 border border-purple-500/30 rounded-xl p-3 shadow-xl max-w-[240px]">
        <p className="text-xs font-semibold text-purple-400">{data.name}</p>
        <p className="text-sm font-bold text-white mt-1">ATS Score: {data.score}</p>
        {data.fileName && (
          <p className="text-[10px] text-text-muted mt-1 truncate">
            File: {data.fileName}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<any | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resResume, resRoadmap] = await Promise.all([
          resumeService.getAll(),
          getRoadmaps(),
        ]);
        if (resResume.data && resResume.data.resumes) {
          setResumes(resResume.data.resumes);
        }
        if (resRoadmap && resRoadmap.roadmaps) {
          setRoadmaps(resRoadmap.roadmaps);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute stats
  const cvCount = resumes.length;
  const analyzedCount = resumes.filter((r) => r.aiAnalysis).length;

  const planLimit = user?.plan === 'CareerGPT Pro' ? 100 : user?.plan === 'CareerGPT Advance' ? 20 : 4;
  const limitText = String(planLimit);

  // Dynamic calculations for badge info & positive/negative/neutral colors
  // 1. CVs Uploaded change badge (new uploads in the last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const uploadedThisWeek = resumes.filter((r) => new Date(r.createdAt) >= oneWeekAgo).length;
  const cvChangeText = uploadedThisWeek > 0 ? `+${uploadedThisWeek} this week` : '0 new';
  const cvChangeColor: 'green' | 'gray' = uploadedThisWeek > 0 ? 'green' : 'gray';

  // 2. Analyzed usage level color indicator (red when limit is reached/full, green when safe)
  const usagePercentage = planLimit > 0 ? Math.round((analyzedCount / planLimit) * 100) : 0;
  const analyzedChangeText = `${usagePercentage}% used`;
  let analyzedChangeColor: 'green' | 'yellow' | 'red' = 'green';
  if (usagePercentage >= 100) {
    analyzedChangeColor = 'red';
  } else if (usagePercentage >= 80) {
    analyzedChangeColor = 'yellow';
  }

  // 3. Roadmaps change badge
  const roadmapsCount = roadmaps.length;
  const roadmapsChangeText = roadmapsCount > 0 ? `+${roadmapsCount} total` : '0 active';
  const roadmapsChangeColor: 'green' | 'gray' = roadmapsCount > 0 ? 'green' : 'gray';

  // 4. Last Upload change badge
  let lastUploadValue = 'N/A';
  let lastUploadChange = 'Inactive';
  let lastUploadChangeColor: 'green' | 'red' = 'red';
  if (resumes.length > 0) {
    lastUploadValue = getRelativeTime(resumes[0].createdAt);
    lastUploadChange = 'Active';
    lastUploadChangeColor = 'green';
  }

  // Calculate ATS Score Progression from oldest to newest
  const sortedResumesForProgression = [...resumes]
    .filter((r) => r.aiAnalysis?.overallScore)
    .reverse();

  const scoreProgressionData = sortedResumesForProgression.map((r, idx) => ({
    name: `CV #${idx + 1}`,
    score: r.aiAnalysis?.overallScore || 0,
    fileName: r.fileName,
  }));

  // Fallback if 0 or 1 CV is present to draw a clean line
  if (scoreProgressionData.length === 0) {
    scoreProgressionData.push({ name: 'Start', score: 0, fileName: 'No CVs uploaded yet' });
  } else if (scoreProgressionData.length === 1) {
    scoreProgressionData.unshift({ name: 'Baseline', score: 40, fileName: 'System Baseline' });
  }

  // Calculate resume score breakdown using latest resume analysis
  const latestResume = resumes[0];
  const resumeScoreData = latestResume?.aiAnalysis
    ? [
        { name: 'Content', value: latestResume.aiAnalysis.contentQuality || 0 },
        { name: 'Format', value: latestResume.aiAnalysis.formatting || 0 },
        { name: 'Keywords', value: latestResume.aiAnalysis.keywordMatch || 0 },
        { name: 'Length', value: latestResume.aiAnalysis.overallScore || 0 },
      ]
    : [
        { name: 'Content', value: 0 },
        { name: 'Format', value: 0 },
        { name: 'Keywords', value: 0 },
        { name: 'Length', value: 0 },
      ];

  const cvRecords = resumes.map((r) => ({
    id: r._id,
    filename: r.fileName,
    uploadedDate: r.createdAt,
    status: r.aiAnalysis ? 'analyzed' : 'pending',
    score: r.aiAnalysis?.overallScore || 0,
    rawResumeData: r,
  }));

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Welcome back, <span className="saas-gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-text-muted">
          {formatDate(new Date().toISOString())} - Let's build your career today!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<RiFileTextLine className="text-xl" />}
          label="CVs Uploaded"
          value={loading ? '...' : cvCount}
          change={cvChangeText}
          changeColor={cvChangeColor}
          color="#A855F7"
        />
        <MetricCard
          icon={<RiCheckLine className="text-xl" />}
          label="Analyzed"
          value={loading ? '...' : `${analyzedCount}/${limitText}`}
          change={analyzedChangeText}
          changeColor={analyzedChangeColor}
          color="#D946EF"
        />
        <MetricCard
          icon={<RiRoadMapLine className="text-xl" />}
          label="Roadmaps Generated"
          value={loading ? '...' : roadmaps.length}
          change={roadmapsChangeText}
          changeColor={roadmapsChangeColor}
          color="#C084FC"
        />
        <MetricCard
          icon={<RiCalendarLine className="text-xl" />}
          label="Last Upload"
          value={loading ? '...' : lastUploadValue}
          change={lastUploadChange}
          changeColor={lastUploadChangeColor}
          color="#E879F9"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="saas-card p-6">
          <h3 className="text-lg font-semibold text-white">
            <span className="saas-gradient-text">ATS Score Progression</span>
          </h3>
          <p className="text-xs text-text-muted mt-1 mb-4">
            How your overall CV score has improved with each new revision.
          </p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={scoreProgressionData}>
              <defs>
                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis stroke="rgba(255, 255, 255, 0.3)" dataKey="name" />
              <YAxis stroke="rgba(255, 255, 255, 0.3)" domain={[0, 100]} />
              <Tooltip content={<CustomProgressionTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="saas-card p-6">
          <h3 className="text-lg font-semibold text-white">
            <span className="saas-gradient-text">Resume Score Breakdown</span>
          </h3>
          <p className="text-xs text-text-muted mt-1 mb-4">
            Analysis sub-scores breakdown of your most recently uploaded CV.
          </p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={resumeScoreData}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#4C1D95" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis stroke="rgba(255, 255, 255, 0.3)" dataKey="name" />
              <YAxis stroke="rgba(255, 255, 255, 0.3)" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 15, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 0, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Analyze Resume',
            description: 'Get ATS insights and improvement tips in seconds.',
            icon: 'DOC',
            path: '/resume',
          },
          {
            label: 'Match Jobs',
            description: 'Discover roles aligned with your skills instantly.',
            icon: 'JOB',
            path: '/jobs',
          },
          {
            label: 'Start Interview',
            description: 'Practice questions with AI feedback and scoring.',
            icon: 'INT',
            path: '/interview',
          },
          {
            label: 'Learning Hub',
            description: 'Review, organize, and study your saved career notes.',
            icon: 'NOTE',
            path: '/notes',
          },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="saas-card group relative min-h-[120px] overflow-hidden px-6 py-6 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer w-full"
          >
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">{action.label}</p>
                <p className="mt-2 text-xs text-text-muted">{action.description}</p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white/90">
                {action.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="saas-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            <span className="saas-gradient-text">Uploaded CVs</span>
          </h3>
          <span
            className="rounded-lg px-3 py-1 text-sm font-medium"
            style={{
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#D8B4FE',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            {loading ? '...' : `${cvCount}/${limitText}`}
          </span>
        </div>

        {cvRecords.length > 0 ? (
          <div className="space-y-3">
            {cvRecords.map((cv) => (
              <div
                key={cv.id}
                onClick={() => {
                  if (cv.rawResumeData.aiAnalysis) {
                    setSelectedResume(cv.rawResumeData);
                  }
                }}
                className={`flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4 transition-all duration-300 ${
                  cv.rawResumeData.aiAnalysis
                    ? 'cursor-pointer hover:border-[#A855F7]/40 hover:bg-black/30'
                    : ''
                }`}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className="rounded-lg p-2"
                    style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7' }}
                  >
                    <RiFileTextLine className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-white">{cv.filename}</p>
                    <p className="text-xs text-text-muted">Uploaded: {formatDate(cv.uploadedDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {cv.status === 'analyzed' ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-white">{cv.score}</p>
                        <p className="text-xs text-text-muted">Score</p>
                      </div>
                      <div className="rounded-full bg-success/20 p-2 text-success">
                        <RiCheckLine className="text-lg" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium text-text-muted">Pending</p>
                        <p className="text-xs text-text-muted">Analysis</p>
                      </div>
                      <div className="rounded-full bg-warning/20 p-2 text-warning">
                        <RiUploadCloud2Line className="animate-bounce text-lg" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-text-muted text-sm">
            No resumes uploaded yet. Upload a CV to unlock detailed statistics.
          </div>
        )}

        {cvRecords.length < planLimit && (
          <div className="mt-6 rounded-xl border-2 border-dashed border-white/20 p-6 text-center">
            <RiUploadCloud2Line className="mx-auto mb-2 text-3xl text-text-muted" />
            <p className="text-sm text-text-muted">
              You can upload{' '}
              <span className="font-semibold text-white">
                {planLimit - cvRecords.length} more CV{planLimit - cvRecords.length !== 1 ? 's' : ''}
              </span>
            </p>
            <button
              onClick={() => navigate('/resume')}
              className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-[#051614] transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(130deg, #A855F7 0%, #D946EF 55%, #8B5CF6 100%)',
                boxShadow: '0 10px 24px rgba(168, 85, 247, 0.3)',
              }}
            >
              + Upload CV
            </button>
          </div>
        )}
      </div>

      {/* CV Detail Report Modal */}
      {selectedResume && selectedResume.aiAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0c0d16] border border-purple-500/20 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedResume(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <RiCloseLine size={24} />
            </button>

            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#D946EF] font-bold">
                  ATS Resume Report
                </span>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <RiFileTextLine className="text-[#A855F7]" />
                  {selectedResume.fileName}
                </h2>
                <p className="text-xs text-text-muted">
                  Analyzed on {formatDate(selectedResume.createdAt)}
                </p>
              </div>
              
              {/* Overall Score Badge */}
              <div className="flex items-center gap-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl px-5 py-3 self-start md:self-auto">
                <div className="text-right">
                  <p className="text-2xl font-black text-white">{selectedResume.aiAnalysis.overallScore}</p>
                  <p className="text-[10px] text-[#A855F7] font-semibold tracking-wider uppercase">ATS Score</p>
                </div>
                <div className="h-10 w-[1px] bg-purple-500/20" />
                <div className="text-xs text-text-muted max-w-[120px]">
                  {selectedResume.aiAnalysis.overallScore >= 80 
                    ? 'Excellent job! High chance of passing ATS.' 
                    : selectedResume.aiAnalysis.overallScore >= 60 
                    ? 'Good baseline. Apply recommendations to boost.' 
                    : 'Needs improvement. Refactor key areas below.'}
                </div>
              </div>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
              {[
                { label: 'Content Quality', val: selectedResume.aiAnalysis.contentQuality, col: '#A855F7' },
                { label: 'Formatting', val: selectedResume.aiAnalysis.formatting, col: '#D946EF' },
                { label: 'Keyword Match', val: selectedResume.aiAnalysis.keywordMatch, col: '#C084FC' },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-text-muted font-medium">{s.label}</p>
                    <p className="text-xl font-bold text-white mt-1">{s.val}%</p>
                  </div>
                  <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.val}%`, backgroundColor: s.col }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Analysis Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              
              {/* Strengths */}
              <div className="bg-success/5 border border-success/15 rounded-xl p-5">
                <h3 className="text-sm font-bold text-success flex items-center gap-2 mb-3 uppercase tracking-wider">
                  <RiCheckLine className="text-lg bg-success/10 rounded-full p-0.5" />
                  Key Strengths
                </h3>
                {selectedResume.aiAnalysis.strengths && selectedResume.aiAnalysis.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedResume.aiAnalysis.strengths.map((str: string, i: number) => (
                      <li key={i} className="text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        {str}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-text-muted">No specific strengths highlighted yet.</p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="bg-error/5 border border-error/15 rounded-xl p-5">
                <h3 className="text-sm font-bold text-error flex items-center gap-2 mb-3 uppercase tracking-wider">
                  <RiAlertLine className="text-lg bg-error/10 rounded-full p-0.5" />
                  Areas for Improvement
                </h3>
                {selectedResume.aiAnalysis.weaknesses && selectedResume.aiAnalysis.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedResume.aiAnalysis.weaknesses.map((weak: string, i: number) => (
                      <li key={i} className="text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                        <span className="text-error mt-0.5">•</span>
                        {weak}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-success">None flagged. Great work!</p>
                )}
              </div>
            </div>

            {/* Skills & Actionable AI Suggestions */}
            <div className="space-y-6 mt-6">
              
              {/* Skills Pills */}
              {selectedResume.aiAnalysis.skills && selectedResume.aiAnalysis.skills.length > 0 && (
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 uppercase tracking-wider">
                    <RiInformationLine className="text-lg text-purple-400" />
                    Detected Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.aiAnalysis.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-purple-500/10 border border-purple-500/25 text-[#D8B4FE] px-2.5 py-1 rounded-full uppercase"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {selectedResume.aiAnalysis.suggestions && selectedResume.aiAnalysis.suggestions.length > 0 && (
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
                    <RiLightbulbLine className="text-lg text-yellow-400" />
                    AI Actionable Suggestions
                  </h3>
                  <div className="space-y-3">
                    {selectedResume.aiAnalysis.suggestions.map((sug: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-yellow-500/30 pl-4 py-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            sug.priority === 'High' 
                              ? 'bg-red-500/15 text-red-400' 
                              : sug.priority === 'Medium'
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-blue-500/15 text-blue-400'
                          }`}>
                            {sug.priority} Priority
                          </span>
                          <h4 className="text-xs font-bold text-white">{sug.title}</h4>
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">{sug.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/10">
              <button
                onClick={() => setSelectedResume(null)}
                className="rounded-lg border border-white/10 hover:bg-white/5 text-xs font-semibold text-white px-4 py-2"
              >
                Close Report
              </button>
              <button
                onClick={() => {
                  setSelectedResume(null);
                  navigate('/resume');
                }}
                className="rounded-lg text-xs font-bold text-[#051614] px-4 py-2"
                style={{
                  background: 'linear-gradient(130deg, #A855F7 0%, #D946EF 55%, #8B5CF6 100%)',
                }}
              >
                Go to Resume Page
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;