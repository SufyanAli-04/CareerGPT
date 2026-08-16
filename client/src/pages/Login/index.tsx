import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiMailLine, RiLockLine, RiSparkling2Line, RiArrowLeftLine } from 'react-icons/ri';
import { successToast, errorToast } from '../../utils/toast';
import robotImage from '../../assets/images/robot_signin.png';

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block double-submit clicks while request is in flight.
    if (isSubmittingRef.current || loading) return;

    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      successToast('Login Successful ✅');
      if (user?.userRole === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message;
      const normalizedMessage = typeof errorMsg === 'string' ? errorMsg.toLowerCase() : '';

      if (normalizedMessage.includes('not found')) {
        errorToast('User does not exist ', 'auth-login-not-found');
      } else if (normalizedMessage.includes('password') || normalizedMessage.includes('invalid')) {
        errorToast('Invalid Email or Password ', 'auth-login-invalid');
      } else {
        errorToast(typeof errorMsg === 'string' ? errorMsg : 'Login failed ', 'auth-login-failed');
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-signin" style={{ position: 'relative' }}>
      <Link
        to="/signup"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.65)',
          textDecoration: 'none',
          padding: '8px 16px',
          transition: 'all 0.2s',
          zIndex: 10,
        }}
        className=" hover:text-white/80!"
      >
        <RiArrowLeftLine size={16} /> Back to Sign Up
      </Link>
      <div className="auth-card auth-card-signin">
        <div className="auth-illustration auth-illustration-signin">
          <div className="auth-orbit auth-orbit-a" />
          <div className="auth-orbit auth-orbit-b" />
          <div className="auth-bot-wrap">
            <div className="auth-bot">
              <img src={robotImage} alt="CareerGPT Robot" className="auth-showcase-robot-img" />
            </div>
            <div className="auth-bubble auth-bubble-top">Hello, ready to boost your career?</div>
            <div className="auth-bubble auth-bubble-bottom">
              <strong>CareerGPT</strong>
              <span>Your AI buddy is ready to help you.</span>
            </div>
          </div>
        </div>

        <div className="auth-panel auth-panel-signin">
          <div className="auth-brand-mark">
            <RiSparkling2Line />
          </div>
          <h1 className="auth-title">Welcome Back to <span>CareerGPT</span></h1>
          <p className="auth-subtitle">Sign in to continue building your next career milestone.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-input-wrap">
              <RiMailLine size={16} />
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                }}
                required
              />
            </label>

            <label className="auth-input-wrap">
              <RiLockLine size={16} />
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                }}
                required
              />
            </label>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch-text">
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
