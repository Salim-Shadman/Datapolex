import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  sprint?: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
  estimate?: number;
  actualHours?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate?: Date;
  attachments?: string[];
  subtasks: {
    title: string;
    completed: boolean;
  }[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  timeLogs: {
    user: mongoose.Types.ObjectId;
    hours: number;
    date: Date;
  }[];
  activeTimers: {
    user: mongoose.Types.ObjectId;
    startTime: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    
 
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', index: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    
    estimate: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo', index: true },
    
    dueDate: { type: Date },
    attachments: [{ type: String }],
    
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      }
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    timeLogs: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hours: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    activeTimers: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            startTime: { type: Date }
        }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);