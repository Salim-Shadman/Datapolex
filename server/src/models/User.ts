import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'member';
  department?: string;
  skills?: string[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { 
      type: String, 
      required: true,
      select: false // Best Practice: ডিফল্টভাবে পাসওয়ার্ড রিটার্ন করবে না
    },
    role: { 
      type: String, 
      enum: ['admin', 'manager', 'member'], 
      default: 'member' 
    },
    department: { type: String },
    skills: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);