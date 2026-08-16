import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ConfirmModal from '../Common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (user?.userRole === 'Guest' && ['/chatbot', '/interview', '/roadmap', '/notes', '/how-it-works'].includes(location.pathname)) {
      setShowGuestModal(true);
      navigate('/resume', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (user?.userRole === 'Admin' && !location.pathname.startsWith('/admin') && !['/how-it-works', '/profile', '/settings'].includes(location.pathname)) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === '/chatbot') {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (user?.userRole === 'Admin' && !location.pathname.startsWith('/admin') && !['/how-it-works', '/profile', '/settings'].includes(location.pathname)) {
    return (
      <div className="fixed inset-0 bg-[#030308] z-[9999] flex flex-col items-center justify-center text-white px-6">
        <div className="text-center space-y-6">
          <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Redirecting to Admin Portal</h3>
            <p className="text-sm text-gray-400">Loading secure admin dashboard telemetry... 🔒</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#030308] text-white">
      <Navbar />
      <div className="flex flex-1 pt-[64px]">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
        <main
          className={`relative z-10 flex-1 overflow-x-hidden ${location.pathname === '/chatbot' ? 'overflow-y-hidden p-0' : 'px-8 py-8'}`}
          style={{
            marginLeft: isSidebarCollapsed ? '72px' : '240px',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            height: location.pathname === '/chatbot' ? 'calc(100vh - 64px)' : 'auto',
          }}
        >
          {children}
        </main>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your session?"
        confirmText="Log Out"
        cancelText="Cancel"
        type="warning"
      />

      {showGuestModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e0c1a] border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative text-center animate-in zoom-in duration-150">
            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute top-3.5 right-4 text-gray-400 hover:text-white transition-all text-xl cursor-pointer focus:outline-none"
            >
              &times;
            </button>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Access Restricted</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Please Login as a valid user
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-xs hover:shadow-lg hover:shadow-purple-600/25 transition-all cursor-pointer flex items-center justify-center"
              >
                Sign In / Register
              </button>
              <button
                onClick={() => setShowGuestModal(false)}
                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-semibold text-xs hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
