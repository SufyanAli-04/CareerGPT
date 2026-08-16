import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Resume from '../models/Resume';
import Job from '../models/Job';
import Chat from '../models/Chat';
import Interview from '../models/Interview';
import Roadmap from '../models/Roadmap';
import Notes from '../models/Notes';
import JobListing from '../models/JobListing';
import Booking from '../models/Booking';

// Helper: Format month name
const getMonthName = (monthIndex: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

// ─── 1. Admin Dashboard Stats ──────────────────────────────────────────────────
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      totalResumes,
      totalInterviews,
      totalRoadmaps,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ plan: { $in: ['CareerGPT Advance', 'CareerGPT Pro'] } }),
      Resume.countDocuments(),
      Interview.countDocuments(),
      Roadmap.countDocuments(),
    ]);

    // Calculate revenue estimate
    const advanceUsers = await User.countDocuments({ plan: 'CareerGPT Advance' });
    const proUsers = await User.countDocuments({ plan: 'CareerGPT Pro' });
    const totalRevenue = (advanceUsers * 19) + (proUsers * 49);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalResumes,
        totalInterviews,
        totalRoadmaps,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── 2. Growth Analytics ───────────────────────────────────────────────────────
export const getGrowthAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfSixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [thisMonthCount, prevMonthCount] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({
        createdAt: {
          $gte: startOfPrevMonth,
          $lt: startOfThisMonth,
        },
      }),
    ]);

    let growthPercentage = 0;
    if (prevMonthCount > 0) {
      growthPercentage = parseFloat((((thisMonthCount - prevMonthCount) / prevMonthCount) * 100).toFixed(1));
    } else if (thisMonthCount > 0) {
      growthPercentage = 100;
    }

    // Monthly signups trend
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await User.countDocuments({
        createdAt: { $gte: start, $lt: end },
      });
      trendData.push({
        month: getMonthName(start.getMonth()) + ' ' + start.getFullYear().toString().slice(-2),
        users: count,
      });
    }

    res.json({
      success: true,
      growth: {
        thisMonthUsers: thisMonthCount,
        previousMonthUsers: prevMonthCount,
        growthPercentage,
        monthlyTrend: trendData,
      },
    });
  } catch (error) {
    console.error('Growth Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── 3. Feature Usage Tracking ────────────────────────────────────────────────
export const getFeatureUsage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [resumes, jobMatches, chatbot, interviews, roadmaps] = await Promise.all([
      Resume.countDocuments(),
      Job.countDocuments(),
      Chat.countDocuments(),
      Interview.countDocuments(),
      Roadmap.countDocuments(),
    ]);

    res.json({
      success: true,
      features: [
        { name: 'Resume Analyzer', count: resumes },
        { name: 'Job Matcher', count: jobMatches },
        { name: 'Career Chatbot', count: chatbot },
        { name: 'Interview Coach', count: interviews },
        { name: 'Roadmap Generator', count: roadmaps },
      ],
    });
  } catch (error) {
    console.error('Feature Usage Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── 4. Users Management ──────────────────────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search = '', page = '1', limit = '10' } = req.query as { search?: string; page?: string; limit?: string };
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Enhance each user object with their exact activity counts
    const enhancedUsers = await Promise.all(
      users.map(async (u) => {
        const [resumesCount, interviewsCount, roadmapsCount] = await Promise.all([
          Resume.countDocuments({ user: u._id }),
          Interview.countDocuments({ user: u._id }),
          Roadmap.countDocuments({ user: u._id }),
        ]);
        return {
          ...u.toObject(),
          activity: {
            resumes: resumesCount,
            interviews: interviewsCount,
            roadmaps: roadmapsCount,
          },
        };
      })
    );

    res.json({
      success: true,
      users: enhancedUsers,
      pagination: {
        total: totalUsers,
        page: pageNum,
        pages: Math.ceil(totalUsers / limitNum),
      },
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const toggleSuspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.userRole === 'Admin') {
      res.status(400).json({ success: false, message: 'Cannot suspend an Admin user' });
      return;
    }

    user.suspended = !user.suspended;
    await user.save();

    res.json({
      success: true,
      message: user.suspended ? 'User account suspended' : 'User account unsuspended',
      suspended: user.suspended,
    });
  } catch (error) {
    console.error('Toggle Suspend Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.userRole === 'Admin') {
      res.status(400).json({ success: false, message: 'Cannot delete an Admin user' });
      return;
    }

    // Cascade delete all associated collections
    const userId = user._id;
    await Promise.all([
      User.deleteOne({ _id: userId }),
      Resume.deleteMany({ user: userId }),
      Job.deleteMany({ user: userId }),
      Chat.deleteMany({ user: userId }),
      Interview.deleteMany({ user: userId }),
      Roadmap.deleteMany({ user: userId }),
      Notes.deleteMany({ user: userId }),
    ]);

    res.json({ success: true, message: 'User and all associated data deleted' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── 5. Job Listings Management (CRUD Self-Job DB) ─────────────────────────────
export const getJobListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search = '', page = '1', limit = '10' } = req.query as { search?: string; page?: string; limit?: string };
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const totalJobs = await JobListing.countDocuments(query);
    const jobs = await JobListing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      jobs,
      pagination: {
        total: totalJobs,
        page: pageNum,
        pages: Math.ceil(totalJobs / limitNum),
      },
    });
  } catch (error) {
    console.error('Get Job Listings Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addJobListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, company, location, category, skills, description, requirements, salary } = req.body;

    if (!title || !company || !location || !category || !skills || !description || !requirements) {
      res.status(400).json({ success: false, message: 'Please fill all required fields' });
      return;
    }

    const job = await JobListing.create({
      title,
      company,
      location,
      category,
      skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()),
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split(',').map((r: string) => r.trim()),
      salary,
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Add Job Listing Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const editJobListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await JobListing.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found' });
      return;
    }

    const { title, company, location, category, skills, description, requirements, salary } = req.body;

    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (location !== undefined) job.location = location;
    if (category !== undefined) job.category = category;
    if (skills !== undefined) {
      job.skills = Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim());
    }
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements) ? requirements : requirements.split(',').map((r: string) => r.trim());
    }
    if (salary !== undefined) job.salary = salary;

    const updatedJob = await job.save();
    res.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('Edit Job Listing Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteJobListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await JobListing.findByIdAndDelete(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job listing not found' });
      return;
    }
    res.json({ success: true, message: 'Job listing deleted successfully' });
  } catch (error) {
    console.error('Delete Job Listing Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// ─── 7. Session Bookings Management ──────────────────────────────────────────
export const getAdminBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status = 'all', search = '' } = req.query as { status?: string; search?: string };

    const query: any = {};
    if (status !== 'all') {
      query.status = status;
    }
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query).sort({ date: 1, timeSlot: 1 });
    res.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Get Admin Bookings Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving bookings' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking session not found' });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking session has been cancelled successfully', booking });
  } catch (error: any) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};

