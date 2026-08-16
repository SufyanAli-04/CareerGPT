import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  AtSign,
  Bot,
  Clock3,
  DollarSign,
  Check,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  FileSearch,
  GraduationCap,
  MessageSquare,
  Phone,
  Quote,
  Route,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import {
  LandingBadge,
  LandingButton,
  LandingCard,
  LandingNavbar,
  SectionContainer,
} from '../../components/Landing';
import { errorToast } from '../../utils/toast';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
};

const coreFeatures = [
  {
    icon: FileSearch,
    title: 'AI Resume Analyzer + Job Matcher',
    description:
      'Upload your CV, get ATS analysis, and instantly map profile strengths to job opportunities.',
  },
  {
    icon: GraduationCap,
    title: 'Career Notes + Learning Progress',
    description:
      'Save structured notes, receive AI summaries, and track growth with measurable skill milestones.',
  },
  {
    icon: MessageSquare,
    title: 'AI Career Guidance Chatbot',
    description:
      'Ask career questions anytime and receive personalized advice tailored to your role and goals.',
  },
  {
    icon: Bot,
    title: 'AI Interview Preparation',
    description:
      'Practice technical, HR, and behavioral rounds with scoring, feedback, and improvement actions.',
  },
  {
    icon: Route,
    title: 'Personalized Career Roadmap',
    description:
      'Generate a step-by-step path from your current profile to your target role with clear priorities.',
  },
];

const pricingPlans = [
  {
    label: 'Free Forever',
    icon: FileSearch,
    name: 'CareerGPT Free',
    description: 'Start your career journey with essential tools at no cost.',
    price: '$0',
    priceSuffix: '/month',
    note: 'No credit card required',
    features: [
      'Basic resume scan and score',
      'Limited ATS keyword suggestions',
      '3 job matches per week',
      '2 mock interview sessions per month',
      'Starter career roadmap view',
      'Community support access',
    ],
    cta: 'Start Free',
    footer: 'Perfect for getting started with CareerGPT',
    highlighted: false,
  },
  {
    label: 'Advance Plan',
    icon: MessageSquare,
    name: 'CareerGPT Advance',
    description: 'Get essential AI tools to improve your resume, prepare interviews, and apply smarter.',
    price: '$19',
    priceSuffix: '/month',
    note: 'Best for students and fresh graduates',
    features: [
      'AI resume score and ATS feedback',
      'Job role matching suggestions',
      'Basic mock interview practice',
      'Career chatbot guidance',
      'Weekly learning plan generator',
      'Roadmap for target role',
      'Progress tracking dashboard',
      'Email support included',
    ],
    cta: 'Start Career Advance',
    footer: 'Great for building your career foundation fast',
    highlighted: false,
  },
  {
    label: 'Pro Plan',
    icon: Briefcase,
    name: 'CareerGPT Pro',
    description: 'Advanced coaching workflows for serious job seekers, switchers, and high-growth candidates.',
    price: '$49',
    priceSuffix: '/month',
    note: 'For job switchers and placement-focused learners',
    features: [
      'Everything in Career Advance',
      'Advanced interview simulator (tech + HR)',
      'Personalized weekly action roadmap',
      'Role-based skill-gap analysis',
      'Smart answer feedback and scoring',
      'Priority job match recommendations',
      'Application tracker with insights',
      'Portfolio and profile optimization tips',
      'Priority support and faster responses',
      'Monthly performance report and goals',
    ],
    cta: 'Start with Pro',
    footer: 'Complete toolkit to boost interviews and offers',
    highlighted: true,
  },
];

const benefitItems = [
  {
    icon: TrendingUp,
    title: 'Exponential Growth',
    description: 'Scale your business operations without proportionally increasing costs or complexity.',
    metric: '300% Average ROI',
  },
  {
    icon: Clock3,
    title: 'Time Savings',
    description: 'Automate repetitive tasks and free up your team to focus on strategic initiatives.',
    metric: '40+ Hours/Week Saved',
  },
  {
    icon: DollarSign,
    title: 'Cost Reduction',
    description: 'Reduce operational costs while improving efficiency and output quality.',
    metric: '60% Cost Reduction',
  },
  {
    icon: Users,
    title: 'Better Customer Experience',
    description: 'Provide personalized, 24/7 customer service that delights and retains customers.',
    metric: '95% Satisfaction Rate',
  },
  {
    icon: Target,
    title: 'Data-Driven Decisions',
    description: 'Make informed decisions based on AI-powered insights and predictive analytics.',
    metric: '85% Accuracy Improvement',
  },
  {
    icon: Check,
    title: 'Competitive Advantage',
    description: 'Stay ahead of the competition with cutting-edge AI technology and innovation.',
    metric: '2x Faster Implementation',
  },
];

const testimonials = [
  {
    quote:
      'CareerGPT transformed our hiring and career preparation workflows completely. We went from handling 50 candidate guidance queries per day to 500, with better response times and higher satisfaction rates.',
    name: 'Sarah Mitchell',
    role: 'CEO, TechStart Solutions',
    initials: 'SM',
  },
  {
    quote:
      'The automation tools saved us 40 hours per week. We redirected that time into growth strategies and saw a 300% increase in revenue within 6 months.',
    name: 'Michael Chen',
    role: 'Founder, E-commerce Plus',
    initials: 'MC',
  },
  {
    quote:
      'The predictive analytics helped us identify new market opportunities we never would have discovered. Our conversion rates improved by 85%.',
    name: 'Emily Rodriguez',
    role: 'Marketing Director, GrowthCo',
    initials: 'ER',
  },
  {
    quote:
      'Implementation was seamless and the ROI was immediate. The AI solutions paid for themselves within the first month through cost savings alone.',
    name: 'David Thompson',
    role: 'Operations Manager, LogiFlow',
    initials: 'DT',
  },
  {
    quote:
      'As a small business, I thought AI was out of reach. CareerGPT made it accessible and affordable. Now I compete with much larger companies.',
    name: 'Lisa Park',
    role: 'Small Business Owner',
    initials: 'LP',
  },
  {
    quote:
      'The security features give us peace of mind. We can focus on innovation knowing our data and customers are protected by cutting-edge AI.',
    name: 'James Wilson',
    role: 'CTO, InnovateLab',
    initials: 'JW',
  },
];

const footerServices = [
  { label: 'Resume Analyzer', path: '/resume' },
  { label: 'Job Matcher', path: '/jobs' },
  { label: 'AI Interview Prep', path: '/interview' },
  { label: 'Career Roadmap', path: '/roadmap' },
  { label: 'Career Notes', path: '/notes' },
  { label: 'AI Career Chatbot', path: '/chatbot' },
];

const footerCompany = [
  { label: 'About CareerGPT', path: '#benefits', isHash: true },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Pricing', path: '#pricing', isHash: true },
  { label: 'Success Stories', path: '#testimonials', isHash: true },
  { label: 'Help Center', path: '/help', isHash: false },
  { label: 'Contact', path: '#cta', isHash: true },
];

const AnimatedCounter: React.FC<{ value: string }> = ({ value }) => {
  const [current, setCurrent] = React.useState(0);
  const numMatch = value.match(/(\d+)/);
  const target = numMatch ? parseInt(numMatch[1], 10) : 0;
  
  const matchedStr = numMatch ? numMatch[1] : '';
  const numberIndex = matchedStr ? value.indexOf(matchedStr) : -1;
  const prefix = numberIndex !== -1 ? value.slice(0, numberIndex) : '';
  const suffix = numberIndex !== -1 ? value.slice(numberIndex + matchedStr.length) : value;

  React.useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const val = Math.floor(easeProgress * target);
      setCurrent(val);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target]);

  return <>{prefix}{current}{suffix}</>;
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [bookingForm, setBookingForm] = React.useState({
    name: '',
    email: '',
    company: '',
    businessSize: '',
    challenges: ''
  });

  const handleBookingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email) {
      errorToast('Please enter your Name and Email Address');
      return;
    }
    navigate('/book-session', { state: bookingForm });
  };

  const handlePageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--page-mx', `${x}px`);
    e.currentTarget.style.setProperty('--page-my', `${y}px`);
    e.currentTarget.style.setProperty('--page-glow-opacity', '1');
  };

  const handlePageLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--page-glow-opacity', '0');
  };

  return (
    <div
      className="saas-page saas-page-scatter min-h-screen text-slate-100"
      onMouseMove={handlePageMove}
      onMouseLeave={handlePageLeave}
    >
      <LandingNavbar />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="saas-radial saas-radial-left" />
        <div className="saas-radial saas-radial-right" />
      </div>

      <SectionContainer className="relative z-10 pt-28 text-center">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
          <LandingBadge className="mx-auto mb-7 inline-flex items-center gap-2 text-[11px]">
            <Sparkles className="h-4 w-4" />
            AI-Powered Career Transformation
          </LandingBadge>

          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.04] text-white sm:text-7xl">
            Transform Your Career
            <br />
            with
            <span className="saas-gradient-text"> Intelligent AI</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            From resume analysis to interview preparation and roadmap generation, unlock
            exponential career growth with AI workflows built for real results.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LandingButton to="/signup">
              Start Career Analysis <ArrowRight className="h-4 w-4" />
            </LandingButton>
            
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }} className="mx-auto mt-14 max-w-4xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { label: 'Average ROI Increase', value: '~300%' },
              { label: 'Hours Saved Weekly', value: '40+' },
              { label: 'AI Operations', value: '24/7' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-semibold text-[#D946EF] sm:text-[2.15rem]">
                  <AnimatedCounter value={item.value} />
                </p>
                <p className="mt-2 text-sm text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </SectionContainer>

      <SectionContainer id="features" className="relative z-10">
        <motion.div {...fadeUp} className="mb-14 text-center">
          <LandingBadge className="mb-4">Core Modules</LandingBadge>
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl">Everything You Need to Grow Faster</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Five integrated AI modules built with a consistent product system and clean workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature, index) => (
            <motion.div key={feature.title} {...fadeUp} transition={{ duration: 0.45, delay: index * 0.05 }}>
              <LandingCard className="group h-full p-7">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-[#A855F7] transition-transform duration-200 group-hover:scale-105">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{feature.description}</p>
              </LandingCard>
            </motion.div>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer id="testimonials" className="relative z-10">
        <motion.div {...fadeUp} className="mb-14 text-center">
          <h2 className="text-3xl text-white sm:text-5xl">
            What Our <span className="saas-gradient-text">Clients Say</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            Don't just take our word for it. See how businesses like yours are achieving
            remarkable results with our AI solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, idx) => (
            <motion.div key={item.name} {...fadeUp} transition={{ duration: 0.45, delay: idx * 0.04 }}>
              <LandingCard className="h-full rounded-2xl border border-purple-500/20 bg-[linear-gradient(180deg,rgba(15,10,25,0.95)_0%,rgba(10,5,20,0.9)_100%)] p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-0.5 text-[#D946EF]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={`${item.name}-star-${i}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-purple-500/40" />
                </div>

                <p className="text-[1.02rem] leading-relaxed text-slate-300">"{item.quote}"</p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-sm font-semibold text-purple-300">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.role}</p>
                  </div>
                </div>
              </LandingCard>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm font-medium tracking-[0.01em] text-slate-400 sm:text-base">
            <span>Trusted by 1000+ businesses</span>
            <span>99.9% Uptime</span>
            <span>24/7 Support</span>
            <span>SOC 2 Compliant</span>
          </div>
        </motion.div>
      </SectionContainer>

      <SectionContainer id="benefits" className="relative z-10">
        <motion.div {...fadeUp} className="mb-14 text-center">
          <h2 className="text-3xl text-white sm:text-5xl">
            Why Choose <span className="saas-gradient-text">CareerGPT</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            Join thousands of businesses that have transformed their operations and achieved
            remarkable growth with our AI solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-3">
          {benefitItems.map((item, idx) => (
            <motion.div
              key={item.title}
              {...fadeUp}
              transition={{ duration: 0.45, delay: idx * 0.04 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-400">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-relaxed text-slate-300">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1 text-xs font-semibold text-purple-300">
                {item.metric}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-14 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-[#080410]/92 px-5 py-3 text-base text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <Check className="h-5 w-5 text-purple-400" />
            <span className="font-semibold text-purple-400">1000+</span>
            businesses already scaling with AI
          </span>
        </motion.div>
      </SectionContainer>

      <SectionContainer id="pricing" className="relative z-10">
        <motion.div {...fadeUp} className="mb-14 text-center">
          <LandingBadge className="mb-4">CareerGPT Plans</LandingBadge>
          <h2 className="text-3xl text-white sm:text-6xl">
            Choose Your <span className="saas-gradient-text">Career Journey</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            Whether you are starting out or aiming for faster placements, pick the plan that
            fits your goals and grow with AI-powered career guidance.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan, idx) => (
            <motion.div key={plan.name} {...fadeUp} transition={{ duration: 0.45, delay: idx * 0.05 }}>
              <LandingCard
                className={`relative h-full rounded-2xl border p-6 ${
                  plan.highlighted
                    ? 'border-purple-500 bg-[linear-gradient(180deg,rgba(15,10,25,0.95),rgba(10,5,20,0.9))] shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'border-white/10 bg-[linear-gradient(180deg,rgba(10,12,15,0.94),rgba(8,10,13,0.9))]'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-purple-500/50 bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-3 py-1 text-xs font-semibold text-white">
                  {plan.label}
                </div>

                <div className="mt-5 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
                    <plan.icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mt-5 text-center text-4xl font-medium text-white">{plan.name}</h3>
                <p className="mx-auto mt-3 max-w-md text-center text-[0.98rem] leading-relaxed text-slate-300">
                  {plan.description}
                </p>

                <p className="mt-6 text-center text-[2.6rem] font-bold text-purple-400">
                  {plan.price}
                  <span className="ml-2 text-[1rem] font-medium text-slate-300">{plan.priceSuffix}</span>
                </p>
                <p className="text-center text-sm text-slate-400">{plan.note}</p>

                <ul className="mt-8 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                      {plan.highlighted ? (
                        <Zap className="mt-0.5 h-4 w-4 text-[#D946EF]" />
                      ) : (
                        <Check className="mt-0.5 h-4 w-4 text-purple-400" />
                      )}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <LandingButton
                  to="/signup"
                  variant="primary"
                  className="mt-8 h-11 w-full rounded-lg text-sm"
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </LandingButton>

                <p className="mt-4 text-center text-xs text-slate-400">{plan.footer}</p>
              </LandingCard>
            </motion.div>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer id="cta" className="relative z-10 pb-24">
        <motion.div {...fadeUp} className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:gap-10">
          <div className="flex h-full flex-col pt-1">
            <div>
            <h2 className="text-4xl font-medium leading-tight text-white sm:text-[3rem] lg:whitespace-nowrap xl:text-[3.35rem]">
              Ready to <span className="saas-gradient-text">Accelerate Your Career?</span>
            </h2>
            <p className="mt-5 max-w-xl text-[1.03rem] leading-relaxed text-slate-300">
              Join ambitious learners and professionals using CareerGPT to improve resumes,
              crack interviews, and land better opportunities with AI.
            </p>

            <ul className="mt-9 space-y-4">
              {[
                'Resume optimization and ATS improvement',
                'Target-role interview preparation workflow',
                'Personalized roadmap with weekly milestones',
                'Career chatbot support whenever you need it',
                'Any query about any AI tool',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[1.02rem] font-medium text-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 space-y-4 text-[1rem] text-white">
              <p className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-purple-400" />
                admin@careergpt.ai
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-purple-400" />
                +92 306 0333943
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-400" />
                Bahawalpur, Pakistan
              </p>
            </div>
            </div>

            <div className="mt-9 inline-flex w-full max-w-none items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-5 py-3.5 text-sm text-purple-200 lg:mt-auto">
              <Zap className="h-5 w-5 text-purple-400" />
              <span className="lg:whitespace-nowrap">
                <span className="font-semibold text-purple-400">Limited Time:</span> Book consultation this month
                and receive priority implementation scheduling
              </span>
            </div>
          </div>

          <div className="h-full rounded-2xl border border-[#2a3433] bg-[linear-gradient(180deg,rgba(10,12,16,0.96)_0%,rgba(11,13,18,0.93)_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-7 lg:p-8">
            <h3 className="mb-6 text-center text-[2rem] font-medium text-white">Book Your Career Strategy Session</h3>

            <form className="space-y-4" onSubmit={handleBookingFormSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  className="h-12 rounded-lg border border-[#2a3237] bg-[#171a1f] px-4 text-[0.95rem] text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  className="h-12 rounded-lg border border-[#2a3237] bg-[#171a1f] px-4 text-[0.95rem] text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <input
                type="text"
                placeholder="Company Name"
                value={bookingForm.company}
                onChange={(e) => setBookingForm({ ...bookingForm, company: e.target.value })}
                className="h-12 w-full rounded-lg border border-[#2a3237] bg-[#171a1f] px-4 text-[0.95rem] text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
              />

              <select
                value={bookingForm.businessSize}
                onChange={(e) => setBookingForm({ ...bookingForm, businessSize: e.target.value })}
                className="h-12 w-full rounded-lg border border-[#2a3237] bg-[#171a1f] px-4 text-[0.95rem] text-slate-300 focus:border-purple-500 focus:outline-none"
              >
                <option value="" disabled>
                  Business Size
                </option>
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="200+ employees">200+ employees</option>
              </select>

              <textarea
                placeholder="Tell us about your business challenges and AI goals..."
                value={bookingForm.challenges}
                onChange={(e) => setBookingForm({ ...bookingForm, challenges: e.target.value })}
                className="h-40 w-full rounded-lg border border-[#2a3237] bg-[#171a1f] px-4 py-3 text-[0.95rem] text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none"
              />

              <button
                type="submit"
                className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 text-[0.95rem] font-semibold text-white transition-all duration-200 hover:bg-purple-500"
              >
                Book Career Session
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="pt-2 text-center text-xs text-slate-400">
                By submitting this form, you agree to our privacy policy and terms of service.
              </p>
            </form>
          </div>
        </motion.div>
      </SectionContainer>

      <footer className="relative z-10 border-y border-white/10 py-12">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          {/* CareerGPT + Services + Company Grid */}
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_0.6fr_0.6fr] lg:gap-14">
            <div>
              <h3 className="text-4xl font-semibold tracking-tight text-white">CareerGPT</h3>
              <p className="mt-4 max-w-[560px] text-[1.02rem] leading-relaxed text-slate-300">
                Empowering everyday business people to scale online with intelligent AI solutions.
                Transform your operations, automate processes, and achieve exponential growth with
                precision and elegance.
              </p>

              <div className="mt-6 flex items-center gap-4 text-slate-400">
                {[Globe, MessageCircle, Share2, AtSign].map((Icon, idx) => (
                  <a
                    key={`social-${idx}`}
                    href="#"
                    className="transition-colors duration-200 hover:text-purple-400"
                    aria-label="Social"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <h4 className="text-[1.4rem] font-semibold tracking-tight text-white">Services</h4>
              <ul className="mt-5 space-y-3 text-[1rem] leading-[1.35] text-slate-300">
                {footerServices.map((item) => (
                  <li key={item.label}>
                    <Link to={item.path} className="transition-colors duration-200 hover:text-purple-300">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              <h4 className="text-[1.4rem] font-semibold tracking-tight text-white">Company</h4>
              <ul className="mt-5 space-y-3 text-[1rem] leading-[1.35] text-slate-300">
                {footerCompany.map((item) => (
                  <li key={item.label}>
                    {item.isHash ? (
                      <a href={item.path} className="transition-colors duration-200 hover:text-purple-300">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.path} className="transition-colors duration-200 hover:text-purple-300">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-7">
            <div className="flex flex-col gap-3 text-[0.95rem] text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 CareerGPT. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link to="/privacy" className="transition-colors duration-200 hover:text-white">Privacy Policy</Link>
                <Link to="/terms" className="transition-colors duration-200 hover:text-white">Terms of Service</Link>
                <Link to="/cookies" className="transition-colors duration-200 hover:text-white">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
