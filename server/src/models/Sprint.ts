import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
  title: string;
  goal?: string;
  sprintNumber: number; // ADDED: Required by assignment
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed';
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
    goal: {
      type: String,
      default: '',
    },
    sprintNumber: { 
      type: Number, 
      required: true 
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
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

// Compound index to ensure sprint numbers are unique per project
SprintSchema.index({ project: 1, sprintNumber: 1 }, { unique: true });

const Sprint = mongoose.model<ISprint>('Sprint', SprintSchema);

export default Sprint;