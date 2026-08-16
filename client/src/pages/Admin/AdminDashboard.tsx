import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, ResponsiveContainer 
} from 'recharts';
import { 
  RiUserLine, RiCoinsLine, RiCheckboxCircleLine, 
  RiUserStarLine, RiBarChartFill 
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (user && user.userRole !== 'Admin') {
      toast.error('Access denied: Admin credentials required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Dashboard Stats States
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalResumes: 0,
    totalInterviews: 0,
    totalRoadmaps: 0,
    totalRevenue: 0
  });

  const [growthData, setGrowthData] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [growthMeta, setGrowthMeta] = useState({
    thisMonthUsers: 0,
    previousMonthUsers: 0,
    growthPercentage: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [statsRes, growthRes, featureRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getGrowthAnalytics(),
        adminService.getFeatureUsage()
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (growthRes.data?.success) {
        setGrowthData(growthRes.data.growth.monthlyTrend);
        setGrowthMeta({
          thisMonthUsers: growthRes.data.growth.thisMonthUsers,
          previousMonthUsers: growthRes.data.growth.previousMonthUsers,
          growthPercentage: growthRes.data.growth.growthPercentage
        });
      }
      if (featureRes.data?.success) {
        setFeatureUsage(featureRes.data.features);
      }
    } catch (err) {
      console.error('Fetch Stats Error:', err);
      toast.error('Failed to load admin dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.userRole === 'Admin') {
      fetchDashboardStats();
    }
  }, [user]);

  if (!user || user.userRole !== 'Admin') {
    return null;
  }

  return (
    <div className="mx-auto w-full pt-4 max-w-full">
      {/* Title Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <RiBarChartFill className="text-purple-400 text-2xl shadow-neon" />
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-gray-400">View real-time business telemetry and metrics on user growth and feature usage trends.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Gathering business telemetry...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in-up">
          {/* Analytics Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Users */}
            <div className="saas-card p-6 border border-white/5 bg-[#090812]/50 rounded-2xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Registrations</span>
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl"><RiUserLine size={20} /></div>
              </div>
              <span className="text-3xl font-extrabold text-white mb-1">{stats.totalUsers}</span>
              <span className="text-[11px] text-green-400 font-medium">All accounts signed up</span>
            </div>

            {/* Active Users */}
            <div className="saas-card p-6 border border-white/5 bg-[#090812]/50 rounded-2xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Active Users (30d)</span>
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl"><RiCheckboxCircleLine size={20} /></div>
              </div>
              <span className="text-3xl font-extrabold text-white mb-1">{stats.activeUsers}</span>
              <span className="text-[11px] text-blue-300 font-medium">Users with recent activity</span>
            </div>

            {/* Premium Subscriptions */}
            <div className="saas-card p-6 border border-white/5 bg-[#090812]/50 rounded-2xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-fuchsia-500/20 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Premium Users</span>
                <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl"><RiUserStarLine size={20} /></div>
              </div>
              <span className="text-3xl font-extrabold text-white mb-1">{stats.premiumUsers}</span>
              <span className="text-[11px] text-fuchsia-300 font-medium">
                {stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}% Conversion
              </span>
            </div>

            {/* Total Billing Estimate */}
            <div className="saas-card p-6 border border-white/5 bg-[#090812]/50 rounded-2xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Estimated Monthly Rev</span>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl"><RiCoinsLine size={20} /></div>
              </div>
              <span className="text-3xl font-extrabold text-white mb-1">${stats.totalRevenue}</span>
              <span className="text-[11px] text-emerald-400 font-medium">Stripe monthly run-rate</span>
            </div>
          </div>

          {/* Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Growth trend Area Chart */}
            <div className="saas-card p-6 border border-white/5 bg-[#090812]/40 backdrop-blur-md rounded-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">User Signups Trend</h3>
                  <p className="text-xs text-gray-400">Monthly signups over the last 6 months</p>
                </div>
                {growthMeta.growthPercentage !== 0 && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    growthMeta.growthPercentage > 0 
                      ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  }`}>
                    {growthMeta.growthPercentage > 0 ? '+' : ''}{growthMeta.growthPercentage}% Mom
                  </span>
                )}
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="month" stroke="#666" fontSize={11} tickLine={false} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} />
                    <ChartTooltip 
                      cursor={false}
                      contentStyle={{ backgroundColor: '#0a0914', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a855f7', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature usage Bar Chart */}
            <div className="saas-card p-6 border border-white/5 bg-[#090812]/40 backdrop-blur-md rounded-2xl">
              <div>
                <h3 className="text-base font-bold text-white mb-0.5">Feature Usage Tracking</h3>
                <p className="text-xs text-gray-400 mb-4">Total operations completed per module</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} />
                    <ChartTooltip 
                      cursor={false}
                      contentStyle={{ backgroundColor: '#0a0914', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#ec4899', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#d946ef" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Extra Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="p-5 border border-white/5 bg-[#090812]/20 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Resume Analyses</span>
                <span className="text-2xl font-bold text-white">{stats.totalResumes}</span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            </div>
            <div className="p-5 border border-white/5 bg-[#090812]/20 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Interviews Run</span>
                <span className="text-2xl font-bold text-white">{stats.totalInterviews}</span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-pulse" />
            </div>
            <div className="p-5 border border-white/5 bg-[#090812]/20 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Roadmaps Seized</span>
                <span className="text-2xl font-bold text-white">{stats.totalRoadmaps}</span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
