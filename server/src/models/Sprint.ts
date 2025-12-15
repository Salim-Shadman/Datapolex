import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
  title: string;
  sprintNumber: number;
  startDate: Date;
  endDate: Date;
  // FIX: Changed from mongoose.Schema.Types.ObjectId to mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId; 
}

const SprintSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    sprintNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISprint>('Sprint', SprintSchema);