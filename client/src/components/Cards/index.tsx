import React from 'react';
import { RiArrowRightUpLine } from 'react-icons/ri';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = '#6c63ff' }) => (
  <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '22px', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{subtitle}</div>}
    </div>
  </div>
);

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, color = '#6c63ff', onClick }) => (
  <FeatureCardInner title={title} description={description} icon={icon} color={color} onClick={onClick} />
);

const FeatureCardInner: React.FC<FeatureCardProps> = ({ title, description, icon, color = '#6c63ff', onClick }) => {
  const [pointer, setPointer] = React.useState({ x: 0, y: 0, active: false });

  return (
    <div
      className="glass"
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPointer({ x: rect.width - 26, y: 26, active: true });
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
      }}
      onMouseLeave={(e) => {
        setPointer((prev) => ({ ...prev, active: false }));
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          left: `${pointer.x - 78}px`,
          top: `${pointer.y - 78}px`,
          width: '156px',
          height: '156px',
          borderRadius: '999px',
          background: `${color}30`,
          filter: 'blur(28px)',
          opacity: pointer.active ? 0.9 : 0,
          transition: 'left 120ms linear, top 120ms linear, opacity 220ms ease',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: '14px',
          top: '14px',
          width: '30px',
          height: '30px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}66`,
          color,
          background: `${color}18`,
          boxShadow: pointer.active ? `0 0 18px ${color}66` : 'none',
          transform: pointer.active
            ? `translate(${(pointer.x - 140) / 42}px, ${(pointer.y - 90) / 42}px)`
            : 'translate(0, 0)',
          transition: 'transform 140ms ease-out, box-shadow 200ms ease-out',
          zIndex: 2,
        }}
      >
        <RiArrowRightUpLine size={15} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, fontSize: '28px', marginBottom: '12px', color }}>{icon}</div>
      <div style={{ position: 'relative', zIndex: 1, fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>{title}</div>
      <div style={{ position: 'relative', zIndex: 1, fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        {description}
      </div>
    </div>
  );
};

interface JobCardProps {
  title: string;
  company: string;
  matchScore?: number;
  skills?: string[];
  onClick?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ title, company, matchScore, skills, onClick }) => {
  const scoreColor = matchScore ? (matchScore >= 75 ? '#4ade80' : matchScore >= 50 ? '#fbbf24' : '#f87171') : '#8888aa';
  return (
    <div className="glass" onClick={onClick}
      style={{ padding: '20px', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '15px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{company}</div>
        </div>
        {matchScore !== undefined && (
          <div style={{ background: `${scoreColor}22`, color: scoreColor, padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
            {matchScore}% match
          </div>
        )}
      </div>
      {skills && skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {skills.slice(0, 4).map((s) => (
            <span key={s} style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff', padding: '3px 8px', borderRadius: '20px', fontSize: '11px' }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
};
