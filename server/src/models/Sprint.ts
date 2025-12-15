import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
  title: string;
  goal?: string; // --- NEW FIELD ADDED ---
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed'; // --- NEW FIELD ADDED ---
  project: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SprintSchema = new Schema<ISprint>(
  {
    title: {
      type: String,
      required: true,
    },
    goal: { // --- NEW FIELD ADDED ---
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: { // --- NEW FIELD ADDED ---
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sprint = mongoose.model<ISprint>('Sprint', SprintSchema);

export default Sprint;