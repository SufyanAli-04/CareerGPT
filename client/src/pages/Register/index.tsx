import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiUser3Line, RiMailLine, RiLockLine, RiArrowLeftLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { FaGoogle } from 'react-icons/fa';
import { successToast, errorToast, warningToast } from '../../utils/toast';
import robotImage from '../../assets/images/robot.png';

const showcaseSlides = [
  {
    title: "A career companion that adapts to how you grow.",
    description: "CareerGPT helps you focus, improve, and get interview-ready one smart session at a time."
  },
  {
    title: "Optimize your resume for ATS algorithms.",
    description: "Instantly scan your CV, target weak areas, and score higher matching your dream job description."
  },
  {
    title: "Simulate real interviews with AI coaches.",
    description: "Practice custom role-based questions, receive immediate scoring, and get detailed tips to improve."
  }
];

const Register: React.FC = () => {
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('register_form_draft');
    return saved ? JSON.parse(saved) : { name: '', email: '', password: '', confirm: '' };
  });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(() => {
    const saved = sessionStorage.getItem('register_agreed_draft');
    return saved ? JSON.parse(saved) : false;
  });
  const isSubmittingRef = useRef(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async (email: string, name: string) => {
    if (!email || !name) {
      errorToast('Please enter both name and email');
      return;
    }
    setLoading(true);
    try {
      sessionStorage.removeItem('just_signed_up');
      await register(name, email, 'google_oauth_mock_password_123!', 'Guest');
      successToast('Guest Sign In Successful! 🎉');
      navigate('/resume');
    } catch (err: any) {
      try {
        const loggedUser = await login(email, 'google_oauth_mock_password_123!');
        sessionStorage.removeItem('just_signed_up');
        successToast('Guest Log In Successful! Welcome back.');
        if (loggedUser?.userRole === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          if (loggedUser?.userRole === 'Guest') {
            navigate('/resume');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (loginErr: any) {
        errorToast(err?.response?.data?.message || 'Failed to authenticate.');
      }
    } finally {
      setLoading(false);
    }
  };

  const [activeSlide, setActiveSlide] = useState(0);
  const directionRef = useRef<'forward' | 'backward'>('forward');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        if (directionRef.current === 'forward') {
          if (prev === showcaseSlides.length - 1) {
            directionRef.current = 'backward';
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev === 0) {
            directionRef.current = 'forward';
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveSlide((prev) => {
      const nextSlide = prev === 0 ? showcaseSlides.length - 1 : prev - 1;
      if (nextSlide === 0) {
        directionRef.current = 'forward';
      } else if (nextSlide === showcaseSlides.length - 1) {
        directionRef.current = 'backward';
      }
      return nextSlide;
    });
  };

  const handleNext = () => {
    setActiveSlide((prev) => {
      const nextSlide = prev === showcaseSlides.length - 1 ? 0 : prev + 1;
      if (nextSlide === 0) {
        directionRef.current = 'forward';
      } else if (nextSlide === showcaseSlides.length - 1) {
        directionRef.current = 'backward';
      }
      return nextSlide;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;

    if (form.password !== form.confirm) { 
      errorToast('Passwords do not match', 'auth-register-password-mismatch'); 
      return; 
    }
    if (form.password.length < 6) { 
      errorToast('Password must be at least 6 characters', 'auth-register-password-short'); 
      return; 
    }
    if (!agreed) {
      warningToast('Please accept Terms and Privacy Policy', 'auth-register-agree-terms');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    try {
      sessionStorage.setItem('just_signed_up', 'true');
      await register(form.name, form.email, form.password);
      
      // Clean up form draft upon successful account creation
      sessionStorage.removeItem('register_form_draft');
      sessionStorage.removeItem('register_agreed_draft');

      successToast('Account Created Successfully 🎉');
      navigate('/onboarding');
    } catch (err: any) {
      sessionStorage.removeItem('just_signed_up');
      const errorMsg = err?.response?.data?.message;
      const normalizedMessage = typeof errorMsg === 'string' ? errorMsg.toLowerCase() : '';

      if (normalizedMessage.includes('already') || normalizedMessage.includes('exist')) {
        warningToast('Already Registered, Please Login ⚠️', 'auth-register-already-exists');
      } else {
        errorToast(typeof errorMsg === 'string' ? errorMsg : 'Registration failed', 'auth-register-failed');
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-signup" style={{ position: 'relative' }}>
      <Link
        to="/"
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
        className="hover:text-white/80!"
      >
        <RiArrowLeftLine size={16} /> Back to CareerGPT
      </Link>
      <div className="auth-card auth-card-signup">
        <div className="auth-showcase">
          <div className="auth-showcase-glow" />
          <div className="auth-showcase-bot">
            <img src={robotImage} alt="CareerGPT Robot" className="auth-showcase-robot-img" />
          </div>
          
          <div className="slider-container">
            <div
              className="slider-track"
              style={{
                transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: `translateX(-${activeSlide * 100}%)`,
              }}
            >
              {showcaseSlides.map((slide, idx) => (
                <div key={idx} className="slider-slide">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="slider-controls">
            <div className="auth-showcase-dots" style={{ marginTop: 0 }}>
              {showcaseSlides.map((_, idx) => (
                <span
                  key={idx}
                  className={idx === activeSlide ? 'active' : ''}
                  onClick={() => setActiveSlide(idx)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handlePrev} className="slider-arrow-btn">
                <RiArrowLeftSLine size={18} />
              </button>
              <button type="button" onClick={handleNext} className="slider-arrow-btn">
                <RiArrowRightSLine size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="auth-panel auth-panel-signup">
          <div className="auth-panel-inner">
            <p className="auth-logo-lite">CareerGPT</p>
            <h1 className="auth-title-dark">Welcome to CareerGPT!</h1>
            <p className="auth-subtitle-dark">
              Create a free account to save progress, unlock personalized guidance, and access all modules.
            </p>

            <div className="auth-social-row">
              <button
                type="button"
                onClick={() => handleGoogleSignIn('guest@careergpt.com', 'Guest User')}
                disabled={loading}
                className="auth-social-btn hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                <FaGoogle className="text-purple-400" /> Continue as a Guest
              </button>
              <button
                type="button"
                disabled
                className="auth-social-btn opacity-60 cursor-not-allowed relative"
                title="Apple Sign-In is coming soon!"
              >
                <FaGoogle /> Continue with Google
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[8px] font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full uppercase tracking-wider scale-90 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  Coming Soon
                </span>
              </button>
            </div>

            <div className="auth-divider"><span>or sign up with</span></div>

            <form onSubmit={handleSubmit} className="auth-form auth-form-light">
              <label className="auth-input-wrap auth-input-wrap-light">
                <RiUser3Line size={16} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => {
                    const newForm = { ...form, name: e.target.value };
                    setForm(newForm);
                    sessionStorage.setItem('register_form_draft', JSON.stringify(newForm));
                  }}
                  required
                />
              </label>

              <label className="auth-input-wrap auth-input-wrap-light">
                <RiMailLine size={16} />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => {
                    const newForm = { ...form, email: e.target.value };
                    setForm(newForm);
                    sessionStorage.setItem('register_form_draft', JSON.stringify(newForm));
                  }}
                  required
                />
              </label>

              <label className="auth-input-wrap auth-input-wrap-light">
                <RiLockLine size={16} />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => {
                    const newForm = { ...form, password: e.target.value };
                    setForm(newForm);
                    sessionStorage.setItem('register_form_draft', JSON.stringify(newForm));
                  }}
                  required
                />
              </label>

              <label className="auth-input-wrap auth-input-wrap-light">
                <RiLockLine size={16} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={form.confirm}
                  onChange={(e) => {
                    const newForm = { ...form, confirm: e.target.value };
                    setForm(newForm);
                    sessionStorage.setItem('register_form_draft', JSON.stringify(newForm));
                  }}
                  required
                />
              </label>

              <div className="auth-check-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    sessionStorage.setItem('register_agreed_draft', JSON.stringify(e.target.checked));
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: 'rgba(92, 87, 87, 0.7)', pointerEvents: 'auto' }}>
                  I agree to{' '}
                  <Link
                    to="/terms"
                    style={{ color: '#D946EF', textDecoration: 'underline', cursor: 'pointer', zIndex: 10, position: 'relative' }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    style={{ color: '#D946EF', textDecoration: 'underline', cursor: 'pointer', zIndex: 10, position: 'relative' }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn auth-submit-btn-blue">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p className="auth-switch-text auth-switch-text-dark">
              Already have an account? <Link to="/login">I have an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
