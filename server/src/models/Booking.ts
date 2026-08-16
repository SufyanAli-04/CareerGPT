import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  name: string;
  email: string;
  company?: string;
  businessSize?: string;
  challenges?: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // e.g. "10:00 AM"
  status: 'ongoing' | 'completed' | 'cancelled';
  user?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, trim: true },
    businessSize: { type: String, trim: true },
    challenges: { type: String, trim: true },
    date: { type: String, required: true }, // Format "YYYY-MM-DD"
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['ongoing', 'completed', 'cancelled'], default: 'ongoing' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
