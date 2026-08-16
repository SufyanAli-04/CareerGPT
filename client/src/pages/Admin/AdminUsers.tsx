import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  RiUserLine, RiSearchLine, RiDeleteBin7Line, RiProhibitedLine 
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import type { AdminUser } from '../../services/adminService';
import ConfirmModal from '../../components/Common/ConfirmModal';

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (user && user.userRole !== 'Admin') {
      toast.error('Access denied: Admin credentials required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(search, page, 10);
      if (res.data?.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.userRole === 'Admin') {
      fetchUsers();
    }
  }, [search, page, user]);

  const handleToggleSuspendUser = async (id: string) => {
    try {
      const res = await adminService.toggleSuspendUser(id);
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user state');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    try {
      const res = await adminService.deleteUser(selectedUserForDelete);
      if (res.data?.success) {
        toast.success('User and associated data deleted.');
        setSelectedUserForDelete(null);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (!user || user.userRole !== 'Admin') {
    return null;
  }

  return (
    <div className="mx-auto w-full pt-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RiUserLine className="text-purple-400 text-2xl shadow-neon" />
            <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300">
              Users Management
            </h1>
          </div>
          <p className="text-sm text-gray-400">Suspend/Unsuspend accounts, delete inactive profiles, and review users operation metrics.</p>
        </div>
      </div>

      <div className="space-y-5 animate-fade-in-up">
        {/* Search bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 placeholder:text-gray-500"
            />
          </div>
          <span className="text-xs text-gray-400 font-semibold">Total Accounts: {totalCount}</span>
        </div>

        {/* Users table */}
        <div className="saas-card border border-white/5 bg-[#090812]/40 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-widest bg-white/[0.01]">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Joined</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Plan</th>
                  <th className="py-4 px-6 text-center">Telemetry (Res/Int/Rdm)</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                      <span className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">No users matched search criteria.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs uppercase">
                            {u.avatar ? (
                              <img src={u.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.name.slice(0, 2)
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{u.name}</span>
                            <span className="text-xs text-gray-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-300">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.userRole === 'Admin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-white/5 text-gray-400 border border-white/5'
                        }`}>
                          {u.userRole}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.plan === 'CareerGPT Pro' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : u.plan === 'CareerGPT Advance'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-white/5 text-gray-400 border border-white/5'
                        }`}>
                          {u.plan}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center text-sm font-mono text-gray-300">
                        {u.activity?.resumes || 0} / {u.activity?.interviews || 0} / {u.activity?.roadmaps || 0}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          u.suspended 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {u.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {u.userRole !== 'Admin' ? (
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleToggleSuspendUser(u._id)}
                              title={u.suspended ? "Unsuspend User" : "Suspend User"}
                              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                u.suspended 
                                  ? 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                                  : 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              <RiProhibitedLine size={15} />
                            </button>
                            <button
                              onClick={() => setSelectedUserForDelete(u._id)}
                              title="Delete User Data"
                              className="p-2 rounded-lg border border-white/10 hover:border-red-500/40 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <RiDeleteBin7Line size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic pr-3 select-none">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={selectedUserForDelete !== null}
        onClose={() => setSelectedUserForDelete(null)}
        onConfirm={handleDeleteUser}
        title="Confirm User Account Deletion"
        message="Are you absolutely sure you want to permanently delete this user and all of their related files, resumes, chatbot transcripts, interviews, and roadmap files? This action is permanent and cannot be undone."
        confirmText="Permanently Delete User"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AdminUsers;
