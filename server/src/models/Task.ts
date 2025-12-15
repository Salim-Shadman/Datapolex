import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  project: mongoose.Schema.Types.ObjectId;
  sprint?: mongoose.Schema.Types.ObjectId;
  assignees: mongoose.Schema.Types.ObjectId[];
  estimate?: number; 
  actualHours?: number; // New: Total logged hours
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate: Date;
  attachments?: string[];
  comments: {
    user: mongoose.Schema.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  timeLogs: { // New: Log history
    user: mongoose.Schema.Types.ObjectId;
    hours: number;
    date: Date;
  }[];
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    estimate: { type: Number },
    actualHours: { type: Number, default: 0 }, // New
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
    dueDate: { type: Date },
    attachments: [{ type: String }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    timeLogs: [ // New
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hours: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);