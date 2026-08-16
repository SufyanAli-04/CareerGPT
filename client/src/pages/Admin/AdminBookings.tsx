import React, { useState, useEffect } from 'react';
import { 
  RiCalendarEventLine, RiSearchLine, RiCloseCircleLine, 
  RiCheckDoubleLine, RiTimeLine 
} from 'react-icons/ri';
import adminService from '../../services/adminService';
import { successToast, errorToast } from '../../utils/toast';

interface Booking {
  _id: string;
  name: string;
  email: string;
  company?: string;
  businessSize?: string;
  challenges?: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string;
  status: 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAdminBookings();
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Fetch Bookings Error:', err);
      errorToast('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = (id: string) => {
    setCancellingId(id);
  };

  const confirmCancelBooking = async () => {
    if (!cancellingId) return;
    try {
      const res = await adminService.cancelBooking(cancellingId);
      if (res.data?.success) {
        successToast(res.data.message || 'Session cancelled successfully.');
        // Update local state
        setBookings(prev => 
          prev.map(b => b._id === cancellingId ? { ...b, status: 'cancelled' } : b)
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel session.';
      errorToast(msg);
    } finally {
      setCancellingId(null);
    }
  };

  // Helper to determine active status including date checking
  const getBookingEffectiveStatus = (b: Booking): 'ongoing' | 'completed' | 'cancelled' => {
    if (b.status === 'cancelled') return 'cancelled';
    if (b.status === 'completed') return 'completed';
    
    // If ongoing, check date
    const todayStr = new Date().toISOString().split('T')[0];
    if (b.date < todayStr) {
      return 'completed'; // booking date has passed, so it is completed
    }
    return 'ongoing';
  };

  // Filter bookings based on activeTab and searchQuery
  const filteredBookings = bookings.filter(b => {
    const effStatus = getBookingEffectiveStatus(b);
    
    // Tab Filter
    if (activeTab !== 'all' && effStatus !== activeTab) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = b.name.toLowerCase().includes(query);
      const emailMatch = b.email.toLowerCase().includes(query);
      const companyMatch = b.company?.toLowerCase().includes(query) || false;
      return nameMatch || emailMatch || companyMatch;
    }

    return true;
  });

  return (
    <div className="mx-auto w-full pt-4 max-w-full">
      {/* Title Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <RiCalendarEventLine className="text-purple-400 text-2xl shadow-neon" />
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300">
            Session Bookings
          </h1>
        </div>
        <p className="text-sm text-gray-400">View and manage scheduled career strategy sessions submitted by users.</p>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Four tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl max-w-fit">
          {(['all', 'ongoing', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-neon border border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-[#090812]/50 text-xs text-slate-100 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table List Card */}
      <div className="saas-card border border-white/5 bg-[#090812]/40 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading bookings telemetry...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No booking sessions found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-400 font-semibold bg-white/5">
                  <th className="py-4 px-6">Client Info</th>
                  <th className="py-4 px-6">Company & Size</th>
                  <th className="py-4 px-6">Challenges / Goals</th>
                  <th className="py-4 px-6">Session Date & Time</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {filteredBookings.map((b) => {
                  const effStatus = getBookingEffectiveStatus(b);
                  return (
                    <tr key={b._id} className="hover:bg-white/5 transition-colors">
                      {/* Client Info */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white text-sm">{b.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{b.email}</div>
                      </td>

                      {/* Company Info */}
                      <td className="py-4 px-6">
                        {b.company ? (
                          <>
                            <div className="font-medium text-white">{b.company}</div>
                            <div className="text-[10px] text-purple-300 mt-0.5">{b.businessSize || 'N/A'}</div>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Individual</span>
                        )}
                      </td>

                      {/* Challenges */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="line-clamp-2 text-gray-300" title={b.challenges}>
                          {b.challenges || <span className="text-gray-500 italic">None provided</span>}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{b.date}</div>
                        <div className="text-[11px] text-purple-300 font-semibold mt-0.5">{b.timeSlot}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {effStatus === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 font-semibold text-[10px] uppercase">
                            <RiCheckDoubleLine /> Completed
                          </span>
                        )}
                        {effStatus === 'ongoing' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 font-semibold text-[10px] uppercase">
                            <RiTimeLine /> Ongoing
                          </span>
                        )}
                        {effStatus === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 font-semibold text-[10px] uppercase">
                            <RiCloseCircleLine /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        {effStatus === 'ongoing' ? (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all text-[11px] font-bold cursor-pointer"
                          >
                            Cancel Session
                          </button>
                        ) : (
                          <span className="text-gray-500 text-[11px] italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020205]/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0a18] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Cancel Strategy Session?</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to cancel this career strategy session? This action will mark the status as cancelled and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setCancellingId(null)}
                className="px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                No, Keep
              </button>
              <button
                onClick={confirmCancelBooking}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-all shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
