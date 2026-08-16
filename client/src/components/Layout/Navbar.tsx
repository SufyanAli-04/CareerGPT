import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiNotification3Line, RiSettings4Line, RiUser3Line, RiCloseLine } from 'react-icons/ri';
import { extractInitials } from '../../utils/helpers';
import { toast } from 'react-toastify';

interface NotificationItem {
  id: string;
  message: string;
  type: string;
  timestamp: string;
  seen?: boolean;
}

const tooltipClass = "absolute top-12 left-1/2 -translate-x-1/2 bg-[#0a0515]/90 border border-purple-500/20 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50";
const accentColors: Record<string, string> = { success: 'bg-emerald-500', error: 'bg-rose-500', warning: 'bg-amber-500' };

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!user) return setNotifications([]);
    const storageKey = `careergpt_notifications_${user._id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setNotifications(JSON.parse(stored)); } catch (e) { console.error(e); }
    }

    return toast.onChange((payload) => {
      if (payload.status !== 'added' || !payload.content) return;
      const message = typeof payload.content === 'string' ? payload.content : (payload.content as any).props?.children || String(payload.content);
      if (!message || !message.trim()) return;

      const newNotif = {
        id: `${payload.id}_${Date.now()}`,
        message,
        type: payload.type || 'info',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: false
      };

      setNotifications((prev) => {
        if (prev[0]?.message === message) return prev;
        const updated = [newNotif, ...prev];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    });
  }, [user]);

  const updateStore = (updated: NotificationItem[]) => {
    if (user) localStorage.setItem(`careergpt_notifications_${user._id}`, JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleToggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && notifications.some((n) => !n.seen)) {
      const updated = notifications.map((n) => ({ ...n, seen: true }));
      updateStore(updated);
    }
  };

  const unseenCount = notifications.filter((n) => !n.seen).length;

  return (
    <header
      style={{
        height: '64px',
        background: 'rgba(5, 5, 10, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
      className="w-full flex justify-between items-center"
    >
      <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
        <h1 className="saas-gradient-text" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          CareerGPT
        </h1>
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>AI Career Platform</span>
      </NavLink>

      <div className="flex items-center gap-5">
        <div className="relative" ref={dropdownRef}>
          <div className="relative group">
            <button
              onClick={handleToggleOpen}
              className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer focus:outline-none"
            >
              <RiNotification3Line size={20} />
              {unseenCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-fuchsia-500 text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_#d946ef] animate-pulse">
                  {unseenCount}
                </span>
              )}
            </button>
            <div className={tooltipClass}>View Notification History</div>
          </div>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0e0d16] border border-purple-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <RiNotification3Line className="text-purple-400" size={16} /> Notifications
                </span>
                {notifications.length > 0 && (
                  <button onClick={() => updateStore([])} className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 cursor-pointer">
                    Clear All
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-[300px] divide-y divide-white/5 custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div key={item.id} className="p-4 flex gap-3 hover:bg-white/[0.02] relative group/item">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${accentColors[item.type] || 'bg-purple-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-200 leading-relaxed break-words pr-4">{item.message}</p>
                        <span className="block text-[10px] text-gray-500 mt-1.5 font-medium">{item.timestamp}</span>
                      </div>
                      <button
                        onClick={() => updateStore(notifications.filter((n) => n.id !== item.id))}
                        className="absolute right-2 top-3 p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                      >
                        <RiCloseLine size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <RiNotification3Line className="text-purple-500/40 mb-2" size={32} />
                    <p className="text-xs font-semibold text-gray-400">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative group">
          <NavLink to="/settings" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center">
            <RiSettings4Line size={20} />
          </NavLink>
          <div className={tooltipClass}>Manage Account Settings</div>
        </div>

        <span className="h-6 w-[1px] bg-white/35" />

        <div className="relative group">
          <NavLink to="/profile" className="flex items-center gap-3">
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #A855F7, #D946EF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                transition: 'all 0.2s',
                overflow: 'hidden',
              }}
              className="hover:scale-105 hover:border-fuchsia-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : user ? (
                extractInitials(user.name)
              ) : (
                <RiUser3Line />
              )}
            </div>
            <span className="hidden md:block text-sm font-semibold text-gray-300 hover:text-white transition-colors">
              {user?.name || 'Account'}
            </span>
          </NavLink>
          <div className={tooltipClass}>View My Career Profile</div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
