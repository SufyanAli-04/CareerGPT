import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  RiBriefcaseLine, RiSearchLine, RiDeleteBin7Line, RiEdit2Line, 
  RiAddLine 
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import type { JobListing } from '../../services/adminService';
import ConfirmModal from '../../components/Common/ConfirmModal';

const AdminJobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (user && user.userRole !== 'Admin') {
      toast.error('Access denied: Admin credentials required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedJobForDelete, setSelectedJobForDelete] = useState<string | null>(null);

  // Add/Edit Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobFormMode, setJobFormMode] = useState<'add' | 'edit'>('add');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    category: 'Web Development' as 'Web Development' | 'AI / ML' | 'Mobile Development',
    skills: '',
    description: '',
    requirements: '',
    salary: ''
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getJobListings(search, page, 10);
      if (res.data?.success) {
        setJobs(res.data.jobs);
        setTotalPages(res.data.pagination.pages || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.userRole === 'Admin') {
      fetchJobs();
    }
  }, [search, page, user]);

  const handleDeleteJob = async () => {
    if (!selectedJobForDelete) return;
    try {
      const res = await adminService.deleteJobListing(selectedJobForDelete);
      if (res.data?.success) {
        toast.success('Job listing deleted successfully.');
        setSelectedJobForDelete(null);
        fetchJobs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleOpenAddJob = () => {
    setJobFormMode('add');
    setEditingJobId(null);
    setJobForm({
      title: '',
      company: '',
      location: '',
      category: 'Web Development',
      skills: '',
      description: '',
      requirements: '',
      salary: ''
    });
    setShowJobModal(true);
  };

  const handleOpenEditJob = (job: JobListing) => {
    setJobFormMode('edit');
    setEditingJobId(job._id);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      category: job.category,
      skills: job.skills.join(', '),
      description: job.description,
      requirements: job.requirements.join(', '),
      salary: job.salary || ''
    });
    setShowJobModal(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.skills || !jobForm.description || !jobForm.requirements) {
      toast.error('All required fields must be completed.');
      return;
    }

    const payload = {
      ...jobForm,
      skills: jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: jobForm.requirements.split(',').map((r) => r.trim()).filter(Boolean),
    };

    try {
      if (jobFormMode === 'add') {
        const res = await adminService.addJobListing(payload);
        if (res.data?.success) {
          toast.success('New job listing added.');
          setShowJobModal(false);
          fetchJobs();
        }
      } else {
        if (!editingJobId) return;
        const res = await adminService.editJobListing(editingJobId, payload);
        if (res.data?.success) {
          toast.success('Job listing updated.');
          setShowJobModal(false);
          fetchJobs();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save job listing');
    }
  };

  if (!user || user.userRole !== 'Admin') {
    return null;
  }

  return (
    <div className="mx-auto w-full pt-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RiBriefcaseLine className="text-purple-400 text-2xl shadow-neon" />
              <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300">
                Jobs Database
              </h1>
            </div>
            <p className="text-sm text-gray-400">Add, edit, or remove internal job listings stored in the platform database.</p>
          </div>

          <button
            onClick={handleOpenAddJob}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            <RiAddLine size={18} /> Add Job Listing
          </button>
        </div>
      </div>

      <div className="space-y-5 animate-fade-in-up">
        {/* Toolbar */}
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
              placeholder="Search jobs, categories..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Jobs list table */}
        <div className="saas-card border border-white/5 bg-[#090812]/40 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase tracking-widest bg-white/[0.01]">
                  <th className="py-4 px-6">Job Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Salary</th>
                  <th className="py-4 px-6">Key Skills Required</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                      <span className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                      Querying database...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">No job listings found in database.</td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{j.title}</span>
                          <span className="text-xs text-purple-400">{j.company}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-300">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                          {j.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-300">
                        {j.location}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-300 font-medium">
                        {j.salary || 'Not specified'}
                      </td>

                      <td className="py-4 px-6 max-w-[280px]">
                        <div className="flex flex-wrap gap-1">
                          {j.skills.slice(0, 4).map((s, i) => (
                            <span key={i} className="text-[9px] bg-white/5 border border-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                          {j.skills.length > 4 && (
                            <span className="text-[9px] text-gray-500 italic pr-1">+{j.skills.length - 4} more</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenEditJob(j)}
                            title="Edit Job"
                            className="p-2 rounded-lg border border-white/10 hover:border-purple-500/40 bg-white/5 hover:bg-purple-500/10 text-gray-400 hover:text-purple-300 transition-all cursor-pointer"
                          >
                            <RiEdit2Line size={15} />
                          </button>
                          <button
                            onClick={() => setSelectedJobForDelete(j._id)}
                            title="Delete Job"
                            className="p-2 rounded-lg border border-white/10 hover:border-red-500/40 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                          >
                            <RiDeleteBin7Line size={15} />
                          </button>
                        </div>
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
        isOpen={selectedJobForDelete !== null}
        onClose={() => setSelectedJobForDelete(null)}
        onConfirm={handleDeleteJob}
        title="Confirm Job Listing Deletion"
        message="Are you sure you want to delete this job listing from the self-job database?"
        confirmText="Delete Listing"
        cancelText="Cancel"
        type="danger"
      />

      {/* Add/Edit Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-purple-500/30 bg-[#0c0a18]/95 p-6 shadow-[0_10px_50px_rgba(168,85,247,0.3)] backdrop-blur-xl animate-fade-in-up">
            <h2 className="text-lg font-bold text-white mb-4">
              {jobFormMode === 'add' ? 'Add Platform Job Listing' : 'Edit Job Listing'}
            </h2>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Senior React Developer"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    placeholder="e.g. Google DeepMind"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Location *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Remote, San Francisco, CA"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Salary Range (Optional)</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="e.g. $120,000 - $150,000"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Category *</label>
                <select
                  value={jobForm.category}
                  onChange={(e) => setJobForm({ ...jobForm, category: e.target.value as any })}
                  className="w-full bg-[#110f22] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI / ML">AI / ML</option>
                  <option value="Mobile Development">Mobile Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Required Skills * (comma separated)</label>
                <input
                  type="text"
                  required
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                  placeholder="React, TypeScript, CSS, Node.js"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description *</label>
                <textarea
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Brief summary of the job responsibilities..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Requirements * (comma separated)</label>
                <textarea
                  required
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="3+ years experience, Bachelor degree in CS"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                >
                  Save Job Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
