import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { stripeService } from '../../services/stripeService';
import { successToast, errorToast } from '../../utils/toast';
import DashboardContent from './DashboardContent';

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const verifiedSessionsRef = React.useRef<string[]>([]);

  useEffect(() => {
    if (user?.userRole === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Clear signup flag once they reach dashboard
    sessionStorage.removeItem('just_signed_up');
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && !verifiedSessionsRef.current.includes(sessionId)) {
      // Mark as verification started to prevent duplicate runs
      verifiedSessionsRef.current.push(sessionId);

      const verifyStripePayment = async () => {
        setIsVerifying(true);
        try {
          const res = await stripeService.verifyCheckoutSession(sessionId);
          if (res.data && res.data.user) {
            updateUser(res.data.user);
            successToast(`Subscription plan activated successfully! 🎉`);
          } else {
            throw new Error('Verification failed');
          }
        } catch (err: any) {
          console.error(err);
          const errMsg = err?.response?.data?.message || err?.message || 'Verification error';
          errorToast(`Failed to verify payment session: ${errMsg}`);
        } finally {
          setIsVerifying(false);
          // Remove session_id from query params to avoid duplicate checks on page refresh
          searchParams.delete('session_id');
          setSearchParams(searchParams);
        }
      };

      verifyStripePayment();
    }
  }, [searchParams, setSearchParams, updateUser]);

  if (user?.userRole === 'Admin') {
    return (
      <div className="fixed inset-0 bg-[#0c0d16] z-[9999] flex flex-col items-center justify-center text-white px-6">
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
    <div className="min-h-screen">
      {isVerifying && (
        <div className="fixed inset-0 bg-[#0c0d16]/95 z-[9999] flex flex-col items-center justify-center text-white px-6">
          <div className="text-center space-y-6">
            <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Verifying Subscription</h3>
              <p className="text-sm text-gray-400">Confirming payment transaction with Stripe secure portal... 🔒</p>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-[1680px]">
        <DashboardContent />
      </div>
    </div>
  );
};

export default Dashboard;
