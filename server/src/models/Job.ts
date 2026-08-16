import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  location?: string;
  type?: 'Full-time' | 'Part-time' | 'Remote' | 'Internship';
  matchScore?: number;
  saved: boolean;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    location: { type: String, default: 'Remote' },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Remote', 'Internship'],
      default: 'Full-time',
    },
    matchScore: { type: Number, default: 0 },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IJob>('Job', JobSchema);
