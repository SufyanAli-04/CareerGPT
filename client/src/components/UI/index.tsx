import React from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', loading = false, icon, style, disabled, ...rest
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    borderRadius: '10px', border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.2s', opacity: disabled || loading ? 0.6 : 1,
  };
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', color: '#fff' },
    secondary: { background: 'rgba(108,99,255,0.15)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.3)' },
    ghost: { background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.08)' },
    danger: { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} disabled={disabled || loading} {...rest}>
      {loading ? <span style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> : icon}
      {children}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, style, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex' }}>{icon}</span>}
      <input
        style={{
          width: '100%', padding: icon ? '10px 14px 10px 38px' : '10px 14px',
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '10px', color: 'var(--color-text)', fontSize: '14px', outline: 'none',
          fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box', ...style,
        }}
        onFocus={e => (e.target.style.borderColor = '#6c63ff')}
        onBlur={e => (e.target.style.borderColor = error ? '#f87171' : 'rgba(255,255,255,0.1)')}
        {...rest}
      />
    </div>
    {error && <span style={{ fontSize: '12px', color: '#f87171' }}>{error}</span>}
  </div>
);

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, style, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</label>}
    <textarea
      style={{
        width: '100%', padding: '10px 14px', resize: 'vertical', minHeight: '100px',
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '10px', color: 'var(--color-text)', fontSize: '14px', outline: 'none',
        fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box', ...style,
      }}
      onFocus={e => (e.target.style.borderColor = '#6c63ff')}
      onBlur={e => (e.target.style.borderColor = error ? '#f87171' : 'rgba(255,255,255,0.1)')}
      {...rest}
    />
    {error && <span style={{ fontSize: '12px', color: '#f87171' }}>{error}</span>}
  </div>
);

// ─── Loader ───────────────────────────────────────────────────────────────────
export const Loader: React.FC<{ size?: number; text?: string }> = ({ size = 40, text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px' }}>
    <div style={{
      width: size, height: size,
      border: '3px solid rgba(108,99,255,0.2)',
      borderTopColor: '#6c63ff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    {text && <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{text}</p>}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge: React.FC<{ label: string; color?: string }> = ({ label, color = '#6c63ff' }) => (
  <span style={{ 
    background: `${color}15`, 
    color, 
    padding: '4px 12px', 
    borderRadius: '99px', 
    fontSize: '11px', 
    fontWeight: 700,
    border: `1px solid ${color}33`,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }}>
    {label}
  </span>
);

// ─── Page Header ──────────────────────────────────────────────────────────────
export const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
