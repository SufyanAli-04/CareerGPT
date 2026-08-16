import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { stripeService } from '../../services/stripeService';
import { successToast, errorToast, infoToast } from '../../utils/toast';
import { RiSparkling2Line, RiLogoutBoxLine } from 'react-icons/ri';
import {
  Check,
  Zap,
  FileSearch,
  MessageSquare,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { LandingCard, LandingBadge } from '../../components/Landing';

const pricingPlans = [
  {
    label: 'Free Forever',
    key: 'Free Tier',
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
    key: 'CareerGPT Advance',
    icon: MessageSquare,
    name: 'CareerGPT Advance',
    description: 'Perfect for regular career searchers and interview practice.',
    price: '$19',
    priceSuffix: '/month',
    note: 'Billed monthly',
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
    cta: 'Select Advance',
    footer: 'Great for building your career foundation fast',
    highlighted: false,
  },
  {
    label: 'Pro Plan',
    key: 'CareerGPT Pro',
    icon: Briefcase,
    name: 'CareerGPT Pro',
    description: 'Ultimate dashboard access and deep AI recruiting features.',
    price: '$49',
    priceSuffix: '/month',
    note: 'Billed monthly',
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
    ],
    cta: 'Select Pro',
    footer: 'Complete toolkit to boost interviews and offers',
    highlighted: true,
  },
];

const Pricing: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const toastShown = useRef(false);

  useEffect(() => {
    if (!toastShown.current) {
      infoToast("Unlock full mock interviews, customized career roadmaps, and more!");
      toastShown.current = true;
    }
  }, []);

  const handleSelectPlan = async (planKey: string) => {
    if (user?.plan === planKey) {
      if (planKey === 'Free Tier') {
        navigate('/dashboard');
      } else {
        errorToast('Already in this plan!');
      }
      return;
    }
    setLoadingPlan(planKey);
    if (planKey === 'Free Tier') {
      try {
        const res = await authService.updateProfile({ plan: 'Free Tier' });
        updateUser(res.data.user);
        successToast('Free plan activated successfully! 🎉');
        navigate('/dashboard');
      } catch (err) {
        errorToast('Failed to update plan. Please try again.');
      } finally {
        setLoadingPlan(null);
      }
    } else {
      try {
        // Request the official Stripe hosted Checkout Session URL from the backend
        const res = await stripeService.createCheckoutSession(planKey);
        if (res.data && res.data.url) {
          successToast('Redirecting to secure Stripe Checkout... 🔒');
          // Redirect the browser directly to Stripe's hosted checkout page
          window.location.href = res.data.url;
        } else {
          throw new Error('Failed to get session URL');
        }
      } catch (err: any) {
        console.error(err);
        const errMsg = err?.response?.data?.message || err?.message || 'Checkout error';
        errorToast(errMsg);
        setLoadingPlan(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030308] text-[#f1f7ff] relative overflow-hidden pb-24">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-purple-500/10 bg-[#080410]/80 backdrop-blur-md">
        <div className="mx-auto flex h-[65px] w-full max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <RiSparkling2Line className="text-purple-500 text-2xl animate-pulse" />
            <span className="text-xl font-bold saas-gradient-text">
              CareerGPT
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-400">
                Logged in as <strong className="text-white">{user.name}</strong>
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs cursor-pointer"
            >
              <RiLogoutBoxLine size={14} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Core Pricing Section */}
      <main className="mx-auto max-w-[1400px] px-6 pt-16 relative z-10 text-center">
        <LandingBadge className="mb-4">Subscription Packages</LandingBadge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 mb-3 tracking-tight">
          Supercharge Your Career Search
        </h1>
        <p className="text-gray-400 text-base max-w-2xl mx-auto mb-16">
          Choose the billing package that fits your learning timeline. Unlock deep interview grading, custom AI mentorship, and infinite ATS matching.
        </p>

        {/* Plan Cards Grid (Shifted layout & style from landing/overview page) */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <LandingCard
                key={plan.name}
                className={`relative h-full rounded-2xl border p-6 text-left flex flex-col justify-between ${
                  plan.highlighted
                    ? 'border-purple-500 bg-[linear-gradient(180deg,rgba(15,10,25,0.95),rgba(10,5,20,0.9))] shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'border-white/10 bg-[linear-gradient(180deg,rgba(10,12,15,0.94),rgba(8,10,13,0.9))]'
                }`}
              >
                {/* Header Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-purple-500/50 bg-gradient-to-r from-[#a855f7] to-[#d946ef] px-3 py-1 text-xs font-semibold text-white">
                  {plan.label}
                </div>

                {/* Plan Info */}
                <div>
                  <div className="mt-5 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-center text-4xl font-medium text-white">{plan.name}</h3>
                  <p className="mx-auto mt-3 max-w-md text-center text-[0.98rem] leading-relaxed text-slate-300 min-h-[48px]">
                    {plan.description}
                  </p>

                  <p className="mt-6 text-center text-[2.6rem] font-bold text-purple-400">
                    {plan.price}
                    <span className="ml-2 text-[1rem] font-medium text-slate-300">{plan.priceSuffix}</span>
                  </p>
                  <p className="text-center text-sm text-slate-400">{plan.note}</p>

                  {/* Features List */}
                  <ul className="mt-8 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                        {plan.highlighted ? (
                          <Zap className="mt-0.5 h-4 w-4 text-[#D946EF] flex-shrink-0" />
                        ) : (
                          <Check className="mt-0.5 h-4 w-4 text-purple-400 flex-shrink-0" />
                        )}
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button & Footer */}
                <div>
                  <button
                    onClick={() => handleSelectPlan(plan.key)}
                    disabled={loadingPlan !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] saas-btn-primary w-full mt-8 h-11 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loadingPlan === plan.key ? 'Connecting...' : plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-4 text-center text-xs text-slate-400">{plan.footer}</p>
                </div>
              </LandingCard>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
