import mongoose, { Document, Schema } from 'mongoose';

export interface IRoadmap extends Document {
  user: mongoose.Types.ObjectId;
  targetRole: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timeframe: string;
  summary: string;
  currentSkills: string[];
  skillGap: {
    have: string[];
    missing: string[];
  };
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    tasks: { title: string; completed: boolean }[];
    resources: { name: string; type: string; url?: string }[];
    completed: boolean;
  }[];
  overallProgress: number;
  createdAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    timeframe: { type: String, required: true },
    summary: { type: String },
    currentSkills: [{ type: String }],
    skillGap: {
      have: [{ type: String }],
      missing: [{ type: String }],
    },
    steps: [
      {
        stepNumber: { type: Number },
        title: { type: String },
        description: { type: String },
        duration: { type: String },
        difficulty: { type: String },
        tasks: [
          {
            title: { type: String },
            completed: { type: Boolean, default: false },
          },
        ],
        resources: [
          {
            name: { type: String },
            type: { type: String },
            url: { type: String },
          },
        ],
        completed: { type: Boolean, default: false },
      },
    ],
    overallProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
