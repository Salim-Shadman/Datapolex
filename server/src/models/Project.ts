import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  client: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planned' | 'active' | 'completed';
  thumbnail?: string; // New Field
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    client: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned',
    },
    thumbnail: { type: String }, // New Field
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);