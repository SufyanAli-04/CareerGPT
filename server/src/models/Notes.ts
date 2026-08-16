import mongoose, { Document, Schema } from 'mongoose';

export interface INotes extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  aiSummary?: string;
  summary?: string;
  aiKeyTakeaways?: string[];
  aiActionItems?: string[];
  relatedTopics?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotesSchema = new Schema<INotes>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    category: { type: String, default: 'General' },
    aiSummary: { type: String },
    summary: { type: String },
    aiKeyTakeaways: [{ type: String }],
    aiActionItems: [{ type: String }],
    relatedTopics: [{ type: String }],
  },
  { timestamps: true }
);

// Text index for smart search
NotesSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model<INotes>('Notes', NotesSchema);
