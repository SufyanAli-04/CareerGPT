import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  rawText: string;
  textHash?: string;
  aiAnalysis?: {
    overallScore: number;
    keywordMatch: number;
    formatting: number;
    contentQuality: number;
    skills: string[];
    strengths: string[];
    weaknesses: string[];
    suggestions: { priority: string; title: string; detail: string }[];
    atsScore: number;
  };
  jobMatches?: {
    jobTitle: string;
    company: string;
    description: string;
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
  }[];
  createdAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    textHash: { type: String, index: true },
    aiAnalysis: {
      overallScore: { type: Number, default: 0 },
      keywordMatch: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 },
      contentQuality: { type: Number, default: 0 },
      skills: [{ type: String }],
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      suggestions: [
        {
          priority: { type: String },
          title: { type: String },
          detail: { type: String },
        },
      ],
      atsScore: { type: Number, default: 0 },
    },
    jobMatches: [
      {
        jobTitle: String,
        company: String,
        description: String,
        matchScore: Number,
        matchingSkills: [String],
        missingSkills: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IResume>('Resume', ResumeSchema);
