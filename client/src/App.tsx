import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import { landingRoute } from './routes/landingRoute';
import { publicRouteConfig } from './routes/publicRoutes';
import { protectedRouteConfig } from './routes/protectedRoutes';

// Import general public pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import HelpCenter from './pages/HelpCenter';
import BookSession from './pages/BookSession';

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();


  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        {publicRouteConfig.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {protectedRouteConfig.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      {/* Landing Page */}
      <Route path={landingRoute.path} element={landingRoute.element} />
      <Route path="/book-session" element={<BookSession />} />

      {/* General Public Pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/help" element={<HelpCenter />} />

      {/* Default redirect for unknown paths */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
