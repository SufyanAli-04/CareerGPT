import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiQuestionLine, RiSearchLine, RiMailSendLine, RiComputerLine, RiShieldUserLine, RiSettingsLine } from 'react-icons/ri';

const faqs = [
  {
    category: "Resume & ATS Analysis",
    icon: RiComputerLine,
    color: "#A855F7",
    items: [
      {
        q: "What file formats does the Resume Analyzer support?",
        a: "We support PDF and Microsoft Word (.docx) formats. For optimal ATS scan accuracy, we recommend uploading clean, single-column PDF documents."
      },
      {
        q: "What is considered a good ATS score?",
        a: "An ATS match score of 80% or above indicates that your resume is highly aligned with the target job description's keywords and structural criteria."
      },
      {
        q: "Does CareerGPT store my resumes?",
        a: "Yes, resumes are saved securely in your profile dashboard so you can track improvements. You can delete any uploaded file permanently at any time."
      }
    ]
  },
  {
    category: "AI Interview Simulator",
    icon: RiShieldUserLine,
    color: "#3B82F6",
    items: [
      {
        q: "How does the mock interview grading work?",
        a: "Our AI evaluates your answers based on context, technical accuracy, and structure (such as the STAR method). You receive an overall score from 0-100 and a bullet-point breakdown of missing elements."
      },
      {
        q: "Can I simulate HR and behavioral rounds?",
        a: "Yes, you can choose from specialized Technical, HR, or Behavioral rounds tailored to your target position and experience level."
      }
    ]
  },
  {
    category: "Account & Subscriptions",
    icon: RiSettingsLine,
    color: "#D946EF",
    items: [
      {
        q: "What is included in the Free tier?",
        a: "The Free tier includes basic resume scans, 3 job matches per week, and standard access to the AI Career Chatbot."
      },
      {
        q: "How do I upgrade or cancel my subscription?",
        a: "You can modify, upgrade, or cancel your active billing package directly from the Profile Preferences panel under the Settings page."
      }
    ]
  }
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleContactSupport = () => {
    navigate('/');
    // After navigating to landing page, scroll to the CTA/booking section
    setTimeout(() => {
      const el = document.getElementById('cta');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

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
            <RiQuestionLine size={16} />
            <span>Help Center</span>
          </div>
        </div>
      </header>

      {/* Search Header */}
      <main className="mx-auto max-w-[1720px] px-6 pt-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4 tracking-tight">
            How can we help?
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto mb-6">
            Search our knowledge base or browse frequently asked questions regarding resume analysis, mock interviews, and roadmaps.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-[600px] mx-auto relative">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search documentation, categories, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/10 bg-[#120F24]/60 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm backdrop-blur-md"
            />
          </div>
        </div>

        {/* FAQs Grid Layout (2 columns or 3 columns on wide screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div key={idx} className="glass p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-purple-500/20 transition-all duration-300 relative group">
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white pb-3 border-b border-white/5 flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: `${category.color}15`, color: category.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <span>{category.category}</span>
                    </h2>
                    <div className="space-y-5">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="space-y-1.5">
                          <h3 className="text-[14px] font-bold text-purple-300 flex items-start gap-2">
                            <span className="mt-0.5"><RiQuestionLine size={15} /></span>
                            <span>{item.q}</span>
                          </h3>
                          <p className="text-gray-400 text-[13px] leading-relaxed pl-5">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 glass rounded-3xl border border-white/5">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-white mt-3">No results found</h3>
              <p className="text-gray-400 text-sm mt-1">Try searching with other keywords or clear search filter.</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="glass p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-blue-950/10 text-center max-w-2xl mx-auto">
          <RiMailSendLine size={36} className="mx-auto text-purple-400 mb-3 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">
            Can't find the answers you're looking for? Reach out directly to the CareerGPT support team, and we'll respond within 24 hours.
          </p>
          <button
            onClick={handleContactSupport}
            className="saas-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            Contact Support Team
          </button>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
