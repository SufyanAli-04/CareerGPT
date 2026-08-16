import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RiArrowLeftLine, RiShieldKeyholeLine, RiFileShield2Line, RiShieldUserLine, RiDatabaseLine, RiServerLine, RiExternalLinkLine } from 'react-icons/ri';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const sections = [
    { id: 'collect', label: '1. Information We Collect', icon: RiDatabaseLine },
    { id: 'use', label: '2. How We Use Information', icon: RiShieldUserLine },
    { id: 'sharing', label: '3. Data Sharing & APIs', icon: RiExternalLinkLine },
    { id: 'security', label: '4. Retention & Security', icon: RiServerLine },
    { id: 'rights', label: '5. Your Privacy Rights', icon: RiShieldKeyholeLine },
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
            <RiShieldKeyholeLine size={16} />
            <span>Privacy & Security</span>
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
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Your trust is our priority. Learn how we handle your resume, chats, and personal data with security and confidentiality.
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
                <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  <RiFileShield2Line size={14} />
                  <span>Terms of Service</span>
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
            <section id="collect" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiDatabaseLine className="text-purple-400" />
                <span>1. Information We Collect</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                At CareerGPT, we collect and process specific information to provide premium AI career mentorship, resume analysis, and interview simulations. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 text-sm leading-relaxed">
                <li><strong>Account Credentials:</strong> Name, email address, password, and profile preferences (theme, language, selected subscription plan).</li>
                <li><strong>Resume Data:</strong> CV files (PDF/Word format) that you upload for ATS score analysis, bullet-point matching, and experience grading.</li>
                <li><strong>Interview Submissions:</strong> Voice transcripts, ratings, and feedback responses submitted during our mock HR, Technical, and Behavioral simulations.</li>
                <li><strong>Notes & Roadmap Data:</strong> Structured learning notes, roadmaps, and tasks created inside the notes dashboard.</li>
                <li><strong>Chat Transcripts:</strong> Conversation histories recorded with the AI Career Mentor.</li>
              </ul>
            </section>

            <section id="use" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiShieldUserLine className="text-purple-400" />
                <span>2. How We Use Your Information</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                We utilize advanced language learning models (LLMs) and scoring algorithms to process your data for the following core purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 text-sm leading-relaxed">
                <li>To evaluate resume strengths, identify structural flaws, and suggest matching job positions.</li>
                <li>To dynamically adjust and customize AI Career chatbot interactions according to your skill set.</li>
                <li>To benchmark mock interview answers against industry standards and provide constructive feedback scores.</li>
                <li>To track, persist, and store user learning roadmaps and notification logs.</li>
              </ul>
            </section>

            <section id="sharing" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiExternalLinkLine className="text-purple-400" />
                <span>3. Data Sharing & Third-Party Services</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                We never sell or rent your personal information to third parties. In order to provide AI analyses, we securely route relevant text fragments (such as CV text or chatbot prompts) to trusted LLM service provider APIs (like OpenAI and Google Gemini).
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                All transit channels are secured using modern SSL/TLS encryption protocols, and we contractually verify that providers do not utilize your training inputs to build public models.
              </p>
            </section>

            <section id="security" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiServerLine className="text-purple-400" />
                <span>4. Data Retention & Security</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Your security is our absolute commitment. We apply industrial-grade encryption standards for storing profile records, roadmaps, and CV analyses. You retain full control over your documents, and you may delete your uploaded resumes or clear your chat transcripts at any time.
              </p>
            </section>

            <section id="rights" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiShieldKeyholeLine className="text-purple-400" />
                <span>5. Your Privacy Rights</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Depending on your location, you may have rights under the General Data Protection Regulation (GDPR) or similar regulations. You can export a copy of your stored skill records or request complete deletion of your account directly from your settings dashboard.
              </p>
            </section>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
              <span>© 2026 CareerGPT Security Team</span>
              <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">Read Terms of Service</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
