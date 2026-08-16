import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  user: mongoose.Types.ObjectId;
  role: string;
  type: 'HR' | 'Technical' | 'Behavioral';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: {
    question: string;
    sampleAnswer?: string;
    userAnswer?: string;
    score?: number;
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
  }[];
  overallScore?: number;
  performanceSummary?: string;
  completedAt?: Date;
  createdAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ['HR', 'Technical', 'Behavioral'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    questions: [
      {
        question: { type: String, required: true },
        sampleAnswer: { type: String },
        userAnswer: { type: String },
        score: { type: Number },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        suggestions: [{ type: String }],
      },
    ],
    overallScore: { type: Number },
    performanceSummary: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
