import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  client: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planned' | 'active' | 'completed';
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    client: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned',
    },
    thumbnail: { type: String },
  },
  { timestamps: true }
);

// PERFORMANCE FIX: Text Index for Fast Search on Title and Client
ProjectSchema.index({ title: 'text', client: 'text' });

export default mongoose.model<IProject>('Project', ProjectSchema);