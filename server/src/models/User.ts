import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'member';
  department?: string;
  skills?: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
    department: { type: String, default: 'General' },
    skills: [{ type: String }],
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// Match Password Method
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// FIX: 'next' প্যারামিটার রিমুভ করা হয়েছে টাইপস্ক্রিপ্ট এরর ফিক্স করার জন্য
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) {
    return; // next() কল করার দরকার নেই, শুধু রিটার্ন করলেই হবে
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error; // next(error) এর বদলে সরাসরি throw করতে হবে
  }
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;