import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // While auth is still hydrating, don't redirect anywhere
  if (loading) return <Outlet />;

  const justSignedUp = sessionStorage.getItem('just_signed_up') === 'true';

  return isAuthenticated ? <Navigate to={justSignedUp ? "/onboarding" : "/dashboard"} replace /> : <Outlet />;
};

export default PublicRoute;
