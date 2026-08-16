import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RiArrowLeftLine, RiFileShield2Line, RiShieldKeyholeLine, RiUserLine, RiBrainLine, RiShieldLine, RiListSettingsLine, RiTimeLine } from 'react-icons/ri';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();
  const sections = [
    { id: 'accept', label: '1. Acceptance of Terms', icon: RiShieldLine },
    { id: 'security', label: '2. User Account Security', icon: RiUserLine },
    { id: 'nature', label: '3. Nature of AI Services', icon: RiBrainLine },
    { id: 'usage', label: '4. Permissible Use', icon: RiListSettingsLine },
    { id: 'billing', label: '5. Subscriptions & Billing', icon: RiFileShield2Line },
    { id: 'changes', label: '6. Changes to Terms', icon: RiTimeLine },
  ];

  return (
    <div className="min-h-screen bg-[#05050A] text-[#f1f7ff] relative overflow-hidden pb-20">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-purple-500/10 bg-[#080410]/80 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] w-full max-w-[1720px] items-center justify-between px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white font-semibold hover:text-purple-300 transition-colors bg-transparent border-none cursor-pointer outline-none"
          >
            <RiArrowLeftLine size={18} />
            <span>Back to CareerGPT</span>
          </button>
          <div className="flex items-center gap-2 text-[13px] text-purple-400 font-semibold uppercase tracking-wider">
            <RiFileShield2Line size={16} />
            <span>Usage Terms</span>
          </div>
        </div>
      </header>

      {/* Document Content */}
      <main className="mx-auto max-w-[1720px] px-6 pt-12 relative z-10">
        <div className="text-center mb-12">
          <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-widest">
            Last Updated: May 24, 2026
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Please read these terms carefully before accessing or using the CareerGPT career enhancement platform.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
          {/* Left Column: Sticky Sidebar Table of Contents */}
          <aside className="hidden lg:block sticky top-24 space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">
                On This Page
              </h3>
              <nav className="flex flex-col gap-1.5">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all text-[14px]"
                    >
                      <Icon size={16} className="text-purple-400" />
                      <span>{sec.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Other Policies
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  <RiShieldKeyholeLine size={14} />
                  <span>Privacy Policy</span>
                </Link>
                <Link to="/cookies" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  <RiShieldKeyholeLine size={14} />
                  <span>Cookie Policy</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column: Detailed Document Card */}
          <div className="glass p-8 sm:p-10 rounded-3xl border border-white/5 space-y-8">
            <section id="accept" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiShieldLine className="text-purple-400" />
                <span>1. Acceptance of Terms</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                By creating an account, registering, or using any feature inside CareerGPT (including the Resume Analyzer, Job Matcher, AI Career Mentor, or Interview Simulator), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not access or use our services.
              </p>
            </section>

            <section id="security" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiUserLine className="text-purple-400" />
                <span>2. User Account Security</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                You must provide accurate and complete registration info when creating a free or premium account. You are solely responsible for maintaining the confidentiality of your credentials. You agree to immediately notify CareerGPT of any unauthorized breach of your login credentials.
              </p>
            </section>

            <section id="nature" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiBrainLine className="text-purple-400" />
                <span>3. Nature of AI Services & Limitation of Liability</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                CareerGPT leverages complex large language models (LLMs) to perform automated ATS scans, formulate roadmaps, and host simulated HR dialogues. You explicitly understand and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 text-sm leading-relaxed">
                <li><strong>AI Interpretations:</strong> The scores, feedback metrics, and structural suggestions provided are diagnostic mock estimates. We do not guarantee employment, recruiter callbacks, or job offers.</li>
                <li><strong>No Professional Career/Legal Counsel:</strong> You hold the ultimate responsibility to verify the accuracy of resume edits and application strategies prior to submitting them to employers.</li>
                <li><strong>LLM Hallucinations:</strong> As with all generative AI models, responses may occasionally contain discrepancies. We hold no liability for errors or automated feedback ratings.</li>
              </ul>
            </section>

            <section id="usage" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiListSettingsLine className="text-purple-400" />
                <span>4. Permissible Use & Resource Fair-Usage</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                To guarantee optimal speed, security, and equal resource availability across our MERN stack platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 text-sm leading-relaxed">
                <li>You may not run scraping algorithms, security probes, or batch loaders against our Express API endpoints.</li>
                <li>You may not use account access to build competitive tools or bypass active rate limits on resume processing or interview sessions.</li>
                <li>Abuse of pricing quota limits may result in temporary suspension or cancellation of account privileges.</li>
              </ul>
            </section>

            <section id="billing" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiFileShield2Line className="text-purple-400" />
                <span>5. Subscriptions, Payments & Billing</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Premium features (like advanced HR simulations, deep ATS scoring lists, and prioritised AI responses) are subject to billing packages outlined on the landing page. Payment packages are non-refundable, and subscription plans renew automatically unless cancelled in settings.
              </p>
            </section>

            <section id="changes" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiTimeLine className="text-purple-400" />
                <span>6. Changes to Terms</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                CareerGPT reserves the right to modify these Terms of Service at any time. We will post notification updates within your dashboard settings or alert you via email when critical changes are rolled out.
              </p>
            </section>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
              <span>© 2026 CareerGPT Compliance</span>
              <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">Read Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
