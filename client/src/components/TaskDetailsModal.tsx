'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { taskService } from '@/services/taskService';
import { X, Send, User, Clock, Paperclip, History, Activity, CheckSquare, Trash2, Play, Square } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';

interface TaskDetailsModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const formatHoursToDuration = (totalHours: number) => {
    if(!totalHours) return "0m";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
};

// Separated Timer Component for better performance
function TimerDisplay({ startTime, isRunning, onToggle }: { startTime: Date | null, isRunning: boolean, onToggle: () => void }) {
    const [elapsed, setElapsed] = useState('00:00:00');
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && startTime) {
            const start = new Date(startTime).getTime();
            interval = setInterval(() => {
                const now = new Date().getTime();
                const diff = Math.max(0, now - start);
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }, 1000);
        } else {
            setElapsed('00:00:00');
        }
        return () => clearInterval(interval);
    }, [isRunning, startTime]);

    return (
        <div className={`p-5 rounded-xl border flex flex-col items-center justify-center transition-all shadow-sm ${isRunning ? 'bg-red-50 border-red-200 ring-2 ring-red-100' : 'bg-indigo-50 border-indigo-200'}`}>
            {isRunning ? (
                <div className="text-center w-full">
                    <span className="text-red-600 font-bold text-3xl font-mono block mb-3 animate-pulse">{elapsed}</span>
                    <button onClick={onToggle} className="flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full shadow-lg shadow-red-200 font-medium">
                        <Square size={16} fill="currentColor" className="mr-2"/> Stop & Log
                    </button>
                </div>
            ) : (
                <button onClick={onToggle} className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition w-full shadow-lg shadow-indigo-200 font-bold text-lg">
                    <Play size={20} fill="currentColor" className="mr-2"/> Start Timer
                </button>
            )}
            <p className="text-xs text-gray-500 mt-3 text-center">{isRunning ? 'Recording time in progress...' : 'Click start to track your work'}</p>
        </div>
    );
}

export default function TaskDetailsModal({ task, isOpen, onClose, onUpdate }: TaskDetailsModalProps) {
  const { register, handleSubmit, reset } = useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [timeLogHours, setTimeLogHours] = useState('');
  
  const [newSubtask, setNewSubtask] = useState('');
  const [localSubtasks, setLocalSubtasks] = useState<any[]>([]);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [localStartTime, setLocalStartTime] = useState<Date | null>(null);

  const sanitizedDescription = useMemo(() => {
    if (!task?.description) return '<p class="text-gray-400 italic">No description provided.</p>';
    return DOMPurify.sanitize(task.description); 
  }, [task?.description]);

  useEffect(() => {
    if (task && isOpen) {
        setLocalSubtasks(task.subtasks || []);
        const myActiveTimer = task.activeTimers?.find((t: any) => (t.user?._id || t.user) === user?._id);
        
        if (myActiveTimer) {
            setIsTimerRunning(true);
            setLocalStartTime(new Date(myActiveTimer.startTime));
        } else {
            setIsTimerRunning(false);
            setLocalStartTime(null);
        }
    }
  }, [task, isOpen, user]);

  const activities = useMemo(() => {
    if (!task) return [];
    const commentLogs = (task.comments || []).map((c: any) => ({
      type: 'comment',
      user: c.user,
      text: c.text,
      date: new Date(c.createdAt),
      id: c._id
    }));
    const timeLogs = (task.timeLogs || []).map((t: any) => ({
      type: 'time_log',
      user: t.user,
      text: `logged ${formatHoursToDuration(t.hours)}`,
      date: new Date(t.date),
      id: t._id
    }));
    return [...commentLogs, ...timeLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [task]);

  if (!isOpen || !task) return null;

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const handleToggleTimer = async () => {
    const wasRunning = isTimerRunning;
    
    // Optimistic Update
    if (wasRunning) {
        setIsTimerRunning(false);
        setLocalStartTime(null);
        toast.success('Timer Stopped & Logged');
    } else {
        setIsTimerRunning(true);
        setLocalStartTime(new Date());
        toast.success('Timer Started');
    }

    try {
        await taskService.toggleTimer(task._id);
        onUpdate();
    } catch (error) {
        setIsTimerRunning(wasRunning); // Revert on error
        toast.error('Failed to sync timer');
    }
  };

  const updateSubtasks = async (subtasks: any[]) => {
    try {
        await taskService.update(task._id, { subtasks });
        onUpdate();
    } catch (error) { toast.error('Failed to update subtasks'); }
  };

  const handleAddSubtask = () => {
    if(!newSubtask.trim()) return;
    const updated = [...localSubtasks, { title: newSubtask, completed: false }];
    setLocalSubtasks(updated);
    setNewSubtask('');
    updateSubtasks(updated);
  };

  const toggleSubtask = (index: number) => {
    const updated = [...localSubtasks];
    updated[index].completed = !updated[index].completed;
    setLocalSubtasks(updated);
    updateSubtasks(updated);
  };

  const deleteSubtask = (index: number) => {
    const updated = localSubtasks.filter((_, i) => i !== index);
    setLocalSubtasks(updated);
    updateSubtasks(updated);
  };

  const onCommentSubmit = async (data: any) => {
    if (!data.text.trim()) return;
    setLoading(true);
    try {
      await taskService.addComment(task._id, data.text);
      reset();
      onUpdate(); 
    } catch (error) { toast.error('Failed to comment'); } 
    finally { setLoading(false); }
  };

  const onLogTime = async () => {
    const hours = Number(timeLogHours);
    if (!hours || hours <= 0) { toast.error('Invalid hours'); return; }
    try {
        await taskService.logTime(task._id, hours);
        setTimeLogHours('');
        toast.success('Time logged');
        onUpdate();
    } catch (error) { toast.error('Failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center space-x-3 mb-3">
                <span className={`px-2.5 py-1 text-xs rounded-md uppercase font-bold border ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{task.priority}</span>
                <span className={`px-2.5 py-1 text-xs rounded-md uppercase font-bold border ${task.status === 'done' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>{task.status}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 flex items-center mb-3">
                            <Activity className="w-4 h-4 mr-2 text-indigo-500"/> Description
                        </h3>
                        <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                    </div>

                    <div>
                         <h3 className="text-sm font-bold text-gray-900 flex items-center mb-3">
                            <CheckSquare className="w-4 h-4 mr-2 text-indigo-500"/> Subtasks
                        </h3>
                        <div className="space-y-2 mb-3">
                            {localSubtasks.map((st, idx) => (
                                <div key={idx} className="flex items-center group p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition">
                                    <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(idx)} className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer" />
                                    <span className={`ml-3 text-sm flex-1 ${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{st.title}</span>
                                    <button onClick={() => deleteSubtask(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()} placeholder="Add a subtask..." className="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                            <button onClick={handleAddSubtask} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200">Add</button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <TimerDisplay startTime={localStartTime} isRunning={isTimerRunning} onToggle={handleToggleTimer} />

                    {isAdminOrManager && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Manual Entry</label>
                            <div className="flex gap-2">
                                <input type="number" value={timeLogHours} onChange={(e) => setTimeLogHours(e.target.value)} placeholder="Hours" className="w-full border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                <button onClick={onLogTime} className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-medium hover:bg-black transition">Add</button>
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Activity</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {activities.map((item: any, idx: number) => (
                                <div key={idx} className="flex space-x-3 text-xs">
                                    <div className="font-bold text-indigo-600">{item.user?.name || 'User'}:</div>
                                    <div className="text-gray-600">{item.text}</div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSubmit(onCommentSubmit)} className="mt-4 pt-4 border-t border-gray-100 relative">
                             <textarea {...register('text', { required: true })} placeholder="Write a comment..." className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm p-3 pr-10 resize-none"/>
                             <button type="submit" disabled={loading} className="absolute bottom-2 right-2 text-indigo-600 hover:text-indigo-700"><Send size={16} /></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}