import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiShieldLine, RiShieldKeyholeLine, RiQuestionLine, RiHistoryLine, RiSettings3Line } from 'react-icons/ri';

const CookiePolicy: React.FC = () => {
  const sections = [
    { id: 'definition', label: '1. What are Cookies?', icon: RiQuestionLine },
    { id: 'use', label: '2. How We Use Cookies', icon: RiHistoryLine },
    { id: 'analytics', label: '3. Third-Party Analytics', icon: RiShieldLine },
    { id: 'manage', label: '4. Managing Cookie Prefs', icon: RiSettings3Line },
  ];

  return (
    <div className="min-h-screen bg-[#05050A] text-[#f1f7ff] relative overflow-hidden pb-20">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-purple-500/10 bg-[#080410]/80 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] w-full max-w-[1720px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-white font-semibold hover:text-purple-300 transition-colors">
            <RiArrowLeftLine size={18} />
            <span>Back to CareerGPT</span>
          </Link>
          <div className="flex items-center gap-2 text-[13px] text-purple-400 font-semibold uppercase tracking-wider">
            <RiShieldLine size={16} />
            <span>Cookie Compliance</span>
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
            Cookie Policy
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Find out how and why CareerGPT uses cookies and local storage tokens to personalize your career experience.
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
                <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  <RiShieldKeyholeLine size={14} />
                  <span>Terms of Service</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column: Detailed Document Card */}
          <div className="glass p-8 sm:p-10 rounded-3xl border border-white/5 space-y-8">
            <section id="definition" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiQuestionLine className="text-purple-400" />
                <span>1. What are Cookies and Local Storage?</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Cookies are small text data blocks sent to your web browser and stored on your hard drive when you visit a website. CareerGPT also uses browser "Local Storage" (localStorage) to store auth session tokens, notification histories, and user dashboard settings, ensuring a fast and responsive interface.
              </p>
            </section>

            <section id="use" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiHistoryLine className="text-purple-400" />
                <span>2. How We Use Cookies & Local Storage</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                We divide our tracking and persistence markers into three essential categories:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 text-sm leading-relaxed">
                <li><strong>Essential & Authentication Tokens:</strong> We store authorization state markers to keep you logged in as you navigate between modules (Resume, Jobs, Interview, Roadmap, Notes, Chatbot). These are critical for system operation.</li>
                <li><strong>Preference Cache:</strong> We save active configurations, such as your selected dark/light theme setting, menu collapse preferences, and language selection.</li>
                <li><strong>Notifications Logs:</strong> Persistent user alerts are saved locally in the browser to remember which updates have been read, preventing double alerts.</li>
              </ul>
            </section>

            <section id="analytics" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiShieldLine className="text-purple-400" />
                <span>3. Third-Party Analytics</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                We may utilize third-party dashboard trackers (like Google Analytics) to gather anonymous performance data. This reports on page traffic, feature usage speeds, and loading diagnostics to help us prioritize server optimizations.
              </p>
            </section>

            <section id="manage" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RiSettings3Line className="text-purple-400" />
                <span>4. Managing Your Cookie Preferences</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Most web browsers permit cookie customization directly via application settings. You can instruct your browser to block or erase stored session history. Please notice that disabling cookies will prevent the CareerGPT dashboard from identifying your credentials, meaning you will not be able to log in or save CV matching records.
              </p>
            </section>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
              <span>© 2026 CareerGPT cookies</span>
              <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">Read Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicy;
