import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RiDashboardLine, RiFileTextLine, RiBriefcaseLine, RiRobot2Line,
  RiMicLine, RiMapLine, RiBookOpenLine, RiLogoutBoxLine, RiQuestionLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiUserLine, RiCalendarEventLine
} from 'react-icons/ri';

const navItems = [
  { label: 'Dashboard',  path: '/dashboard', icon: RiDashboardLine },
  { label: 'Resume',     path: '/resume',    icon: RiFileTextLine },
  { label: 'Jobs',       path: '/jobs',      icon: RiBriefcaseLine },
  { label: 'AI Career Mentor',    path: '/chatbot',   icon: RiRobot2Line },
  { label: 'Interview',  path: '/interview', icon: RiMicLine },
  { label: 'Roadmap',    path: '/roadmap',   icon: RiMapLine },
  { label: 'Learning Hub',      path: '/notes',     icon: RiBookOpenLine, badge: 'New' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogoutClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleSidebar, onLogoutClick }) => {
  const { user } = useAuth();

  const visibleNavItems = [];
  if (user?.userRole === 'Admin') {
    visibleNavItems.push(
      { label: 'Admin Dashboard', path: '/admin/dashboard', icon: RiDashboardLine },
      { label: 'Users Management', path: '/admin/users', icon: RiUserLine },
      { label: 'Jobs Database', path: '/admin/jobs', icon: RiBriefcaseLine },
      { label: 'Session Bookings', path: '/admin/bookings', icon: RiCalendarEventLine }
    );
  } else {
    visibleNavItems.push(...navItems);
  }

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '240px',
        height: 'calc(100vh - 64px)',
        background: 'linear-gradient(180deg, rgba(5, 5, 10, 0.85) 0%, rgba(10, 5, 20, 0.75) 100%)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(168, 85, 247, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        padding: isCollapsed ? '24px 8px' : '24px 16px',
        position: 'fixed',
        left: 0,
        top: '64px',
        zIndex: 90,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Floating Toggle Button on the vertical border line */}
      <div
        className="group"
        style={{
          position: 'absolute',
          right: '-14px',
          top: '24px',
          zIndex: 101,
        }}
      >
        <button
          onClick={onToggleSidebar}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#0c0d16',
            border: '1px solid rgba(168, 85, 247, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 8px rgba(168, 85, 247, 0.3)',
            color: '#ffffff',
            transition: 'all 0.2s ease',
          }}
          className="hover:scale-110 hover:bg-[#18112d] hover:border-purple-400"
        >
          {isCollapsed ? <RiArrowRightSLine size={16} /> : <RiArrowLeftSLine size={16} />}
        </button>
        <div
          className="absolute top-1/2 left-9 -translate-y-1/2 bg-[#0a0515]/95 border border-purple-500/35 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-[9999]"
        >
          {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        </div>
      </div>

      {/* Top spacer container to prevent logo/button overlapping with first navigation item */}
      <div style={{ height: '48px', flexShrink: 0 }} />

      {/* Nav Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'stretch' }}>
        {visibleNavItems.map(({ label, path, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            title={isCollapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '10px 0px' : '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#ffffff' : 'var(--color-text-muted)',
              background: isActive ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(217, 70, 239, 0.12))' : 'transparent',
              border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              width: '100%',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span
                style={{
                  opacity: isCollapsed ? 0 : 1,
                  maxWidth: isCollapsed ? '0px' : '150px',
                  visibility: isCollapsed ? 'hidden' : 'visible',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  marginLeft: isCollapsed ? '0px' : '12px',
                  transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {label}
              </span>
            </div>
            {badge && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #d946ef, #a855f7)',
                  padding: isCollapsed ? '0px' : '3px 6px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  lineHeight: '1',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(217, 70, 239, 0.25)',
                  opacity: isCollapsed ? 0 : 1,
                  maxWidth: isCollapsed ? '0px' : '60px',
                  visibility: isCollapsed ? 'hidden' : 'visible',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* How it Works + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
        <NavLink
          to="/how-it-works"
          title={isCollapsed ? "How it Works" : undefined}
          style={() => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '10px 0px' : '10px 12px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(217, 70, 239, 0.12))',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            transition: 'all 0.2s ease',
            width: '100%',
          })}
        >
          <RiQuestionLine size={18} style={{ flexShrink: 0 }} />
          <span
            style={{
              opacity: isCollapsed ? 0 : 1,
              maxWidth: isCollapsed ? '0px' : '150px',
              visibility: isCollapsed ? 'hidden' : 'visible',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              marginLeft: isCollapsed ? '0px' : '12px',
              transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            How it Works
          </span>
        </NavLink>
        <button
          onClick={onLogoutClick}
          title={isCollapsed ? "Logout" : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '10px 0px' : '10px 12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            background: 'transparent',
            color: '#f87171',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
        >
          <RiLogoutBoxLine size={18} style={{ flexShrink: 0 }} />
          <span
            style={{
              opacity: isCollapsed ? 0 : 1,
              maxWidth: isCollapsed ? '0px' : '150px',
              visibility: isCollapsed ? 'hidden' : 'visible',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              marginLeft: isCollapsed ? '0px' : '12px',
              transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
