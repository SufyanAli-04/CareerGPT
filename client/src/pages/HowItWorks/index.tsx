import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiFileTextLine, 
  RiBriefcaseLine, 
  RiRobot2Line, 
  RiMicLine, 
  RiBookOpenLine,
  RiMapLine
} from 'react-icons/ri';

const features = [
  {
    title: 'Resume Analyzer',
    icon: RiFileTextLine,
    color: '#A855F7',
    description: 'Upload your PDF resume to receive a real-time ATS match score, layout evaluation, strengths list, and actionable bullet-point improvement suggestions.'
  },
  {
    title: 'Job Matcher',
    icon: RiBriefcaseLine,
    color: '#EC4899',
    description: 'Paste any target job description alongside your resume. The AI computes keyword relevance, lists missing critical skills, and flags immediate gaps.'
  },
  {
    title: 'AI Career Mentor',
    icon: RiRobot2Line,
    color: '#3B82F6',
    description: 'A 24/7 dedicated conversation chatbot. Ask technical coding questions, request interview tips, or get advice on career advancement paths.'
  },
  {
    title: 'Interview Simulator',
    icon: RiMicLine,
    color: '#10B981',
    description: 'Simulate realistic HR, Technical, or Behavioral phone screens. Submit answers to questions and get strict scoring and weakness critiques.'
  },
  {
    title: 'Interactive Roadmap Builder',
    icon: RiMapLine,
    color: '#F59E0B',
    description: 'Define target job roles and timeframes to construct step-by-step learning roadmaps complete with task lists and external resource links.'
  },
  {
    title: 'Learning Hub (Notes Manager)',
    icon: RiBookOpenLine,
    color: '#D946EF',
    description: 'Store tech and career notes. The AI validates tech relevance, generates summaries, assigns tags, and plays text-to-speech audio.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <div className="w-full pb-20 relative min-h-screen">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
          How <span className="saas-gradient-text">CareerGPT</span> Works
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          Discover the technology and features powering your interactive AI career companion.
        </p>
      </div>

      {/* Steps/Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.03] transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div>
                {/* Floating Glow effect */}
                <div 
                  className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle, ${feature.color}30 0%, transparent 70%)` }}
                />

                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}15`, color: feature.color }}
                >
                  <Icon />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                <span>Core Module</span>
                <span className="font-semibold" style={{ color: feature.color }}>Active</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Guide Callout */}
      <div className="mt-12 glass p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl">
        <div className="flex gap-4 items-start">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Ecosystem Synergy</h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
              All tools are connected. Uploading your resume allows the Job Matcher, AI Career Mentor, and Interview Simulator to automatically pull your professional skills, saving you time and giving you personalized feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
