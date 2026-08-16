import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Roadmap from '../models/Roadmap';
import Resume from '../models/Resume';
import { generateCareerRoadmap } from '../services/aiService';

// @desc    Generate personalized career roadmap
// @route   POST /api/roadmap/generate
// @access  Protected
export const generateRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetRole, timeframe, skillLevel } = req.body as { 
      targetRole: string; 
      timeframe: string; 
      skillLevel: string; 
    };

    if (!targetRole || !timeframe || !skillLevel) {
      res.status(400).json({ message: 'targetRole, timeframe, and skillLevel are required' });
      return;
    }

    // Fetch latest resume for context
    const latestResume = await Resume.findOne({ user: req.user!._id }).sort({ createdAt: -1 });
    
    let currentSkills: string[] = [];
    let weaknesses: string[] = [];
    let matchedJobs: string[] = [];

    if (latestResume) {
      currentSkills = latestResume.aiAnalysis?.skills || [];
      weaknesses = latestResume.aiAnalysis?.weaknesses || [];
      
      if (latestResume.jobMatches && latestResume.jobMatches.length > 0) {
        matchedJobs = latestResume.jobMatches.map(j => j.jobTitle);
      }
    }

    const rawRoadmap = await generateCareerRoadmap(
      currentSkills,
      targetRole,
      timeframe,
      skillLevel,
      weaknesses,
      matchedJobs
    );

    let roadmapData;
    try {
      const cleaned = rawRoadmap.replace(/```json|```/gi, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        roadmapData = JSON.parse(cleaned.slice(start, end + 1));
        
        // Handle non-tech role rejection from AI
        if (roadmapData.error) {
          res.status(400).json({ message: roadmapData.error });
          return;
        }

        if (!roadmapData.steps || !Array.isArray(roadmapData.steps) || roadmapData.steps.length === 0) {
          throw new Error('AI generated an empty or invalid roadmap');
        }

        // Clean and validate steps
        roadmapData.steps = roadmapData.steps.map((step: any, idx: number) => {
          // Ensure stepNumber exists
          if (step.stepNumber === undefined) step.stepNumber = idx + 1;
          
          // Ensure tasks is an array and handle stringified inputs
          let tasks = step.tasks;
          if (typeof tasks === 'string') {
            try { tasks = JSON.parse(tasks); } catch (e) { tasks = []; }
          }
          // Handle case where tasks is ["[...]"]
          if (Array.isArray(tasks) && tasks.length === 1 && typeof tasks[0] === 'string' && tasks[0].startsWith('[')) {
            try { tasks = JSON.parse(tasks[0]); } catch (e) { /* keep as is */ }
          }
          if (!Array.isArray(tasks)) tasks = [];

          // Ensure resources is an array and handle stringified inputs
          let resources = step.resources;
          if (typeof resources === 'string') {
            try { resources = JSON.parse(resources); } catch (e) { resources = []; }
          }
          // Handle case where resources is ["[...]"]
          if (Array.isArray(resources) && resources.length === 1 && typeof resources[0] === 'string' && resources[0].startsWith('[')) {
            try { resources = JSON.parse(resources[0]); } catch (e) { /* keep as is */ }
          }
          if (!Array.isArray(resources)) resources = [];

          // Final map and validation for resources
          step.resources = resources.map((res: any) => ({
            name: String(res?.name || 'Resource'),
            type: String(res?.type || 'Course'),
            url: String(res?.url || '#')
          }));

          // Final map and validation for tasks
          step.tasks = tasks.map((task: any) => {
            if (typeof task === 'string') return { title: task, completed: false };
            return {
              title: String(task?.title || 'Task'),
              completed: !!task?.completed
            };
          });

          return step;
        });

        console.log('Cleaned Roadmap Data ready for DB:', JSON.stringify(roadmapData.steps[0], null, 2));

      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (parseErr) {
      console.error('Failed to parse AI Roadmap:', rawRoadmap);
      res.status(500).json({ message: 'AI failed to generate a structured roadmap. Please try again.', error: String(parseErr) });
      return;
    }

    // Create new roadmap
    const roadmap = await Roadmap.create({
      user: req.user!._id,
      targetRole,
      skillLevel,
      timeframe,
      summary: roadmapData.summary || `Personalized roadmap for ${targetRole}`,
      currentSkills: roadmapData.skillGap?.have || currentSkills,
      skillGap: {
        have: roadmapData.skillGap?.have || currentSkills,
        missing: roadmapData.skillGap?.missing || [],
      },
      steps: roadmapData.steps || [],
      overallProgress: 0,
    });

    res.status(201).json({ success: true, roadmap });
  } catch (error) {
    console.error('Generate Roadmap Error:', error);
    res.status(500).json({ message: 'Failed to generate roadmap', error: String(error) });
  }
};

// @desc    Get all roadmaps for user
// @route   GET /api/roadmap
// @access  Protected
export const getRoadmaps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single roadmap
// @route   GET /api/roadmap/:id
// @access  Protected
export const getRoadmapById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user!._id });
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }
    res.json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update step progress
// @route   PATCH /api/roadmap/:id/step/:stepIndex
// @access  Protected
export const updateStepProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, stepIndex } = req.params as { id: string; stepIndex: string };
    const { completed } = req.body as { completed: boolean };

    const roadmap = await Roadmap.findOne({ _id: id, user: req.user!._id });
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const idx = parseInt(stepIndex, 10);
    if (roadmap.steps[idx]) {
      roadmap.steps[idx].completed = completed;
    }

    // Recalculate overall progress
    const completedCount = roadmap.steps.filter((s) => s.completed).length;
    roadmap.overallProgress = Math.round((completedCount / roadmap.steps.length) * 100);

    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

// @desc    Update task progress within a step
// @route   PATCH /api/roadmap/:id/step/:stepIndex/task/:taskIndex
// @access  Protected
export const updateTaskProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, stepIndex, taskIndex } = req.params as { id: string; stepIndex: string; taskIndex: string };
    const { completed } = req.body as { completed: boolean };

    const roadmap = await Roadmap.findOne({ _id: id, user: req.user!._id });
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const sIdx = parseInt(stepIndex, 10);
    const tIdx = parseInt(taskIndex, 10);

    if (roadmap.steps[sIdx] && roadmap.steps[sIdx].tasks[tIdx]) {
      roadmap.steps[sIdx].tasks[tIdx].completed = completed;
      
      // Update step completion if all tasks are done
      const allTasksDone = roadmap.steps[sIdx].tasks.every(t => t.completed);
      roadmap.steps[sIdx].completed = allTasksDone;
    }

    // Recalculate overall progress based on total tasks
    let totalTasks = 0;
    let completedTasks = 0;
    roadmap.steps.forEach(step => {
      step.tasks.forEach(task => {
        totalTasks++;
        if (task.completed) completedTasks++;
      });
    });

    roadmap.overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

// @desc    Delete roadmap
// @route   DELETE /api/roadmap/:id
// @access  Protected
export const deleteRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Roadmap.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
