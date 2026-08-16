import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

interface LandingButtonProps {
  children: React.ReactNode;
  href?: string;
  to?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const LandingButton: React.FC<LandingButtonProps> = ({
  children,
  href,
  to,
  variant = 'primary',
  className = '',
}) => {
  const baseClass =
    'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03]';
  const variantClass =
    variant === 'primary'
      ? 'saas-btn-primary'
      : 'saas-btn-secondary';

  if (to) {
    return (
      <Link to={to} className={`${baseClass} ${variantClass} ${className}`}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${baseClass} ${variantClass} ${className}`}>
        {children}
      </a>
    );
  }

  return <span className={`${baseClass} ${variantClass} ${className}`}>{children}</span>;
};

export const LandingCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`saas-card ${className}`}>{children}</div>;
};

export const LandingBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <span className={`saas-badge ${className}`}>{children}</span>;
};

export const SectionContainer: React.FC<{
  id?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ id, children, className = '' }) => {
  return (
    <section id={id} className={`saas-section ${className}`}>
      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
};

export const StatsBlock: React.FC<{ items: Array<{ label: string; value: string }> }> = ({ items }) => {
  return (
    <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-white/10 bg-black/25 px-5 py-4 text-center backdrop-blur-md">
          <p className="text-3xl font-extrabold text-[#D946EF]">{item.value}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export const LandingNavbar: React.FC = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-purple-500/20 bg-[#080410]/92 backdrop-blur-md">
      <div className="mx-auto flex h-[54px] w-full max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#a855f7] to-[#d946ef] text-black shadow-[0_0_18px_rgba(168,85,247,0.4)]">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <span className="text-[18px] font-semibold leading-none tracking-tight text-white">CareerGPT</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-200 md:flex">
          <a href="#features" className="hover:text-white">Services</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#benefits" className="hover:text-white">Benefits</a>
          <a href="#testimonials" className="hover:text-white">Testimonials</a>
          <a href="#cta" className="hover:text-white">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <LandingButton to="/signup" className="px-5 py-2 text-[13px]">
            Get Started
          </LandingButton>
        </div>
      </div>
    </header>
  );
};
