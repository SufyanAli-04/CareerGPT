import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  isVerified: boolean;
  emailsSent: number;
  suspended: boolean;
  createdAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isVerified: { type: Boolean, default: true },
    emailsSent: { type: Number, default: 0 },
    suspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
