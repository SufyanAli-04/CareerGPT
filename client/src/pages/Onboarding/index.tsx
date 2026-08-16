import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiUser3Line, RiBuilding4Line, RiArrowRightLine, RiArrowLeftLine, RiLoader4Line } from 'react-icons/ri';

const Onboarding: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [roleType, setRoleType] = useState<'individual' | 'company'>('individual');
  const [loading, setLoading] = useState(false);

  const handleProceed = () => {
    setLoading(true);
    setTimeout(() => {
      sessionStorage.removeItem('just_signed_up');
      setLoading(false);
      navigate('/pricing');
    }, 1200);
  };

  const handleBack = async () => {
    sessionStorage.removeItem('just_signed_up');
    await logout();
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/10 bg-[#080410]/80 backdrop-blur-md">
        <div className="mx-auto flex h-[65px] w-full max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold saas-gradient-text">
              CareerGPT
            </span>
          </div>
          {user && (
            <div className="text-sm text-gray-400">
              Welcome, <strong className="text-white">{user.name}</strong>
            </div>
          )}
        </div>
      </header>

      {/* Core Onboarding Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-2xl w-full bg-[#0c0a18]/60 border border-purple-500/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl relative">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              How will you use <span className="saas-gradient-text">CareerGPT</span>?
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Select the option that best fits your workflow to tailor your career and recruiting dashboard experience.
            </p>
          </div>

          {/* Individual vs Company Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Individual Card */}
            <div
              onClick={() => setRoleType('individual')}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                roleType === 'individual'
                  ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'border-white/5 bg-white/[0.02] hover:border-purple-500/30'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                roleType === 'individual' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'
              }`}>
                <RiUser3Line size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Individual</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Optimize your ATS resume score, construct interactive learning roadmaps, and practice with real AI mock interviewers.
              </p>
            </div>

            {/* Company Card */}
            <div
              onClick={() => setRoleType('company')}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                roleType === 'company'
                  ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'border-white/5 bg-white/[0.02] hover:border-purple-500/30'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                roleType === 'company' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'
              }`}>
                <RiBuilding4Line size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Company / Recruiter</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Post job listings, screen target resumes with batch candidate evaluation, and deploy custom recruitment filters.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-8">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white transition-all font-semibold text-sm cursor-pointer disabled:opacity-50 animate-hover"
            >
              <RiArrowLeftLine />
              <span>Back</span>
            </button>

            <button
              onClick={handleProceed}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-purple-600/25 transition-all font-semibold text-sm cursor-pointer min-w-[180px] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RiLoader4Line className="animate-spin text-lg" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Proceed to payment</span>
                  <RiArrowRightLine />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-gray-500 z-10">
        © 2026 CareerGPT. All rights reserved.
      </footer>
    </div>
  );
};

export default Onboarding;
