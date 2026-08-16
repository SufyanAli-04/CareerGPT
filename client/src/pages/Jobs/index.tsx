import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RiBriefcase4Line,
  RiLoader4Line,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiSearchLine,
  RiSparklingLine,
  RiRobot2Line,
  RiCodeSSlashLine,
  RiTimeLine,
} from 'react-icons/ri';
import { jobsService, type JobMatchResult, type ResumeJobProfile } from '../../services/jobsService';
import { errorToast, successToast, warningToast } from '../../utils/toast';

type JobsLocationState = {
  autoFillProfile?: ResumeJobProfile;
  autoSearch?: boolean;
  fromResume?: boolean;
  restoreJobsState?: boolean;
};

const parseSkills = (value: string): string[] =>
  [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];

const Jobs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state || {}) as JobsLocationState;
  const initRef = React.useRef(false);

  const [skillsInput, setSkillsInput] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [results, setResults] = useState<JobMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const clearFormFields = () => {
    setSkillsInput('');
    setTargetRole('');
    setExperience('');
    setResults([]);
    setErrorMessage('');
    setHasSearched(false);
    setExpandedId(null);
    sessionStorage.removeItem('careergpt_jobs_last_auto_search');
  };

  const applyProfile = (profile: ResumeJobProfile) => {
    setSkillsInput(profile.skills.join(', '));
    setTargetRole(profile.targetRole || '');
    setExperience(String(profile.experience ?? 0));
  };

  const inFlightMatches = React.useRef<Record<string, Promise<any> | null>>({});

  const executeMatch = async (
    payload: { skills: string[]; targetRole: string; experience: number },
    opts?: { showValidationToast?: boolean }
  ) => {
    const { skills, targetRole: role, experience: years } = payload;

    if (!skills.length || !role.trim() || Number.isNaN(years) || years < 0) {
      if (opts?.showValidationToast !== false) {
        warningToast('Please fill skills, target role, and valid years of experience.');
      }
      return;
    }

    setLoading(true);
    setExpandedId(null);
    setErrorMessage('');
    setHasSearched(true);

    const payloadKey = JSON.stringify({ skills, role: role.trim(), years: Math.round(years) });

    try {
      if (inFlightMatches.current[payloadKey]) {
        const res = await inFlightMatches.current[payloadKey];
        const matchedJobs = res.data.jobs || [];
        setResults(matchedJobs);
        sessionStorage.setItem('careergpt_jobs_results', JSON.stringify(matchedJobs));
        sessionStorage.setItem('careergpt_jobs_inputs', JSON.stringify({ skills, role: role.trim(), years }));
        if (matchedJobs.length === 0) warningToast('No data');
        else successToast('Jobs matched successfully ✅', 'jobs-matched-success');
        return;
      }

      const promise = jobsService.matchJobs({
        skills,
        targetRole: role.trim(),
        experience: Math.round(years),
      });

      inFlightMatches.current[payloadKey] = promise;

      const res = await promise;
      const matchedJobs = res.data.jobs || [];
      setResults(matchedJobs);
      sessionStorage.setItem('careergpt_jobs_results', JSON.stringify(matchedJobs));
      sessionStorage.setItem('careergpt_jobs_inputs', JSON.stringify({ skills, role: role.trim(), years }));
      if (matchedJobs.length === 0) {
        warningToast('No data');
      } else {
        successToast('Jobs matched successfully ✅', 'jobs-matched-success');
      }
    } catch (error: any) {
      setResults([]);
      const message = error?.response?.data?.message || 'Failed to match jobs. Please try again.';
      setErrorMessage(message);
      errorToast(message, 'jobs-match-error');
    } finally {
      delete inFlightMatches.current[payloadKey];
      setLoading(false);
    }
  };

  const runMatch = async (opts?: { showValidationToast?: boolean }) => {
    const skills = parseSkills(skillsInput);
    const experienceNum = Number(experience);
    await executeMatch(
      {
        skills,
        targetRole,
        experience: experienceNum,
      },
      opts
    );
  };

  useEffect(() => {
    if (navState.fromResume) {
      sessionStorage.setItem('careergpt_jobs_from_resume', 'true');
    }

    if (navState.autoFillProfile) {
      initRef.current = false;
    }

    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      if (navState.restoreJobsState) {
        try {
          const storedResults = sessionStorage.getItem('careergpt_jobs_results');
          const storedInputs = sessionStorage.getItem('careergpt_jobs_inputs');
          if (storedResults && storedInputs) {
            setResults(JSON.parse(storedResults));
            const inputs = JSON.parse(storedInputs);
            setSkillsInput(inputs.skills.join(', '));
            setTargetRole(inputs.role);
            setExperience(String(inputs.years));
            setHasSearched(true);
            return;
          }
        } catch (e) {}
      }

      if (navState.autoFillProfile) {
        clearFormFields();
        try {
          const profileKey = JSON.stringify(navState.autoFillProfile || {});
          const lastKey = sessionStorage.getItem('careergpt_jobs_last_auto_search');
          if (lastKey === profileKey) {
            applyProfile(navState.autoFillProfile);
            return;
          }
          sessionStorage.setItem('careergpt_jobs_last_auto_search', profileKey);
        } catch (e) {
        }
        applyProfile(navState.autoFillProfile);

        if (navState.autoSearch) {
          await executeMatch(
            {
              skills: navState.autoFillProfile.skills,
              targetRole: navState.autoFillProfile.targetRole,
              experience: navState.autoFillProfile.experience,
            },
            { showValidationToast: false }
          );
        }

        return;
      }

      clearFormFields();
      sessionStorage.removeItem('careergpt_jobs_profile');
      sessionStorage.removeItem('careergpt_jobs_from_resume');
    };

    void init();
  }, [location]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen font-sans pb-10">
      <style>{`
        @keyframes spin-jobs { to { transform: rotate(360deg); } }
        .jobs-spin { animation: spin-jobs 1s linear infinite; }
      `}</style>

      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-extrabold text-white m-0">AI Job Matcher</h1>
            <p className="text-sm text-gray-400 m-0">
              Map your technical skills and experience levels directly to target career roles to discover optimized job matches curated by intelligence.
            </p>
          </div>
          {(navState.fromResume || sessionStorage.getItem('careergpt_jobs_from_resume') === 'true') && (
            <button
              type="button"
              onClick={() => navigate('/resume', { state: { restoreResumeState: true } })}
              className="shrink-0 px-5 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
            >
              Back to Resume
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runMatch();
          }}
          className="saas-card py-10 px-8 mb-10 bg-white/[0.01] border-purple-500/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-end">
            <div className="col-span-1 md:col-span-1 lg:col-span-4">
              <label className="block text-sm font-bold text-gray-300 mb-2">Skills</label>
              <div className="relative">
                <RiCodeSSlashLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border text-white border-white/10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/30 transition-all bg-white/5 placeholder-gray-500 outline-none hover:bg-white/[0.07] text-sm"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-1 lg:col-span-4">
              <label className="block text-sm font-bold text-gray-300 mb-2">Target Role</label>
              <div className="relative">
                <RiBriefcase4Line className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Frontend Developer"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border text-white border-white/10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/30 transition-all bg-white/5 placeholder-gray-500 outline-none hover:bg-white/[0.07] text-sm"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-1 lg:col-span-2">
              <label className="block text-sm font-bold text-gray-300 mb-2">Years of Experience</label>
              <div className="relative">
                <RiTimeLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="5"
                  min="0"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border text-white border-white/10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/30 transition-all bg-white/5 placeholder-gray-500 outline-none hover:bg-white/[0.07] text-sm"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-1 lg:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#A855F7] to-[#D946EF] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer text-sm whitespace-nowrap"
              >
                {loading ? <RiLoader4Line size={18} className="jobs-spin" /> : <RiSearchLine size={18} />}
                <span>Find Best Jobs</span>
              </button>
            </div>
          </div>
        </form>
 
        {!loading && !hasSearched && (
          <div className="text-center max-w-6xl mx-auto my-12 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-400 text-3xl mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <RiSearchLine />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Search to Find Your Perfect Match</h3>
            <p className="text-gray-400 text-sm max-w-2xl leading-relaxed mb-10">
              Enter your professional skills, target job role, and years of experience above. Our AI agent will scan available roles and compute precise match percentages.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
              {[
                { title: '1. Input Skills', text: 'Enter multiple keywords separated by commas to align with ATS requirements.' },
                { title: '2. Define Target', text: 'Specify your desired role title to match against industry vacancies.' },
                { title: '3. Calculate Fit', text: 'Receive clear match scoring, missing skill lists, and gap explanations.' }
              ].map((step, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 shadow-sm hover:border-purple-500/20 hover:bg-white/[0.02] transition-all duration-300">
                  <h4 className="text-sm font-bold text-purple-300 mb-2">{step.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="saas-card p-8 flex flex-col items-center gap-3 text-gray-400 mb-6">
            <RiLoader4Line size={32} className="jobs-spin text-purple-500" />
            <p className="text-sm font-semibold text-purple-300">Matching jobs with AI...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/20 shadow-sm mb-6">
            <h3 className="text-sm font-bold text-red-400 mb-1">Unable to fetch jobs</h3>
            <p className="text-sm text-red-300">{errorMessage}</p>
          </div>
        )}

        {!loading && hasSearched && !errorMessage && (
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-white">Found {results.length} matching jobs</h2>
            <div className="flex items-center gap-3">
              {results.length > 0 && (
                <span className="text-sm font-semibold text-purple-400">Sorted by match score</span>
              )}
              <button
                id="ask-ai-mentor-btn"
                type="button"
                onClick={() => {
                  navigate('/chatbot', {
                    state: {
                      fromFlow: true,
                      prefillMessage: results.length > 0
                        ? `I have ${results.length} job matches. My top match is "${results[0]?.title}" at ${results[0]?.matchScore}% match score. Why is my score this high/low and how can I improve it?`
                        : 'Why is my job match score low and how can I improve it?',
                    }
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-bold hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-sm"
              >
                <RiRobot2Line size={16} />
                Ask AI Mentor
              </button>
            </div>
          </div>
        )}

        {!loading && hasSearched && !errorMessage && results.length === 0 && (
          <div className="saas-card p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-1">No data</h3>
            <p className="text-sm text-gray-400">
              No relevant jobs were found for your CV or current inputs. Try a broader role, different skills, or update your resume and search again.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {results.map((job) => {
            const expanded = expandedId === job.id;

            return (
              <div
                key={job.id}
                className="saas-card p-6 transition-all hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      <RiBriefcase4Line size={24} />
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-white mb-1 tracking-tight">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-400 mb-3">
                        <span className="text-purple-300 font-bold">{job.company}</span>
                        <span className="flex items-center gap-1">
                          <RiMapPinLine />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <RiMoneyDollarCircleLine />
                            {job.salary}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {job.skills.map((skill) => (
                          <span
                            key={`${job.id}-${skill}`}
                            className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 min-w-35">
                    <div className="text-3xl font-black text-fuchsia-400 mb-1">{job.matchScore}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Match Score</div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 mb-4 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${job.matchScore}%` }} />
                    </div>
                    <button
                      onClick={() => toggleExpand(job.id)}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-sm"
                    >
                      {expanded ? 'View Less' : 'View More'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg flex items-start gap-2 text-sm font-medium bg-purple-500/5 border border-purple-500/20 text-purple-200">
                  <RiSparklingLine className="mt-0.5 shrink-0 text-fuchsia-400" />
                  {job.explanation}
                </div>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 rounded-lg border border-white/5 bg-white/5">
                      <h4 className="text-sm font-extrabold text-gray-200 mb-2">Job Description</h4>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">{job.description}</p>

                      <h4 className="text-sm font-extrabold text-gray-200 mb-2">Requirements</h4>
                      <ul className="text-sm text-gray-400 space-y-1 mb-4 list-disc list-inside">
                        {job.requirements.map((req) => (
                          <li key={`${job.id}-${req}`}>{req}</li>
                        ))}
                      </ul>

                      <div className="text-sm font-semibold text-gray-400">
                        Salary: <span className="text-purple-400">{job.salary || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
