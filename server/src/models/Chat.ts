import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  isSaved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSchema = new Schema<IChat>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
    messages: [MessageSchema],
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', ChatSchema);
