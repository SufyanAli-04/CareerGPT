import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  currentRole?: string;
  targetRole?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  userRole?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  language?: string;
  theme?: string;
  plan?: string;
  suspended?: boolean;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    currentRole: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    userRole: { type: String, default: 'User' },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    language: { type: String, default: 'English' },
    theme: { type: String, default: 'Dark' },
    plan: { type: String, default: 'Free Tier' },
    suspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
