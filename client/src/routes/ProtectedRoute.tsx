import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Only warn when we're certain they're not authenticated (not just loading)
    if (!loading && !isAuthenticated) {
      toast.warning('Please login first ⚠️', { toastId: 'auth-required' });
    }
  }, [loading, isAuthenticated]);

  // While auth is hydrating, don't redirect — just render nothing briefly.
  // This prevents the flash where a token-holding user gets bounced to /login.
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
