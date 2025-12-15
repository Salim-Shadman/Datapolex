'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import { X, Send, User, Clock, Paperclip, History, Activity, FileText } from 'lucide-react'; // Icons updated
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface TaskDetailsModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskDetailsModal({ task, isOpen, onClose, onUpdate }: TaskDetailsModalProps) {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [timeLogHours, setTimeLogHours] = useState('');

  // Combine Comments and TimeLogs for a unified "Activity Story"
  const activities = useMemo(() => {
    if (!task) return [];
    
    // 1. Process Comments & Status Logs
    const commentLogs = (task.comments || []).map((c: any) => ({
      type: 'comment',
      user: c.user,
      text: c.text,
      date: new Date(c.createdAt),
      id: c._id
    }));

    // 2. Process Time Logs
    const timeLogs = (task.timeLogs || []).map((t: any) => ({
      type: 'time_log',
      user: t.user,
      text: `logged ${t.hours} hours`,
      date: new Date(t.date),
      id: t._id
    }));

    // 3. Merge and Sort by Date (Newest first)
    return [...commentLogs, ...timeLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [task]);

  if (!isOpen || !task) return null;

  const onCommentSubmit = async (data: any) => {
    if (!data.text.trim()) return;
    setLoading(true);
    try {
      await api.post(`/tasks/${task._id}/comments`, data);
      reset();
      onUpdate(); // Refresh data
    } catch (error) { toast.error('Failed to add comment'); } 
    finally { setLoading(false); }
  };

  const onLogTime = async () => {
    if (!timeLogHours || isNaN(Number(timeLogHours)) || Number(timeLogHours) <= 0) {
        toast.error('Enter valid hours'); return;
    }
    try {
        await api.post(`/tasks/${task._id}/log-time`, { hours: timeLogHours });
        setTimeLogHours('');
        toast.success('Time logged');
        onUpdate();
    } catch (error) { toast.error('Failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="flex items-center space-x-3 mb-2">
                <span className={`px-2 py-1 text-xs rounded uppercase font-bold bg-white border border-gray-200 text-gray-800`}>{task.priority}</span>
                <span className={`px-2 py-1 text-xs rounded uppercase font-bold ${task.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{task.status}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
          </div>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center"><User size={16} className="mr-2 text-indigo-500" /> <span className="font-medium">Assignee:</span> <span className="ml-1">{task.assignees?.[0]?.name || 'Unassigned'}</span></div>
                <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-indigo-500" /> 
                    <span className="font-medium">Time:</span> <span className="ml-1">{task.estimate}h (Est) / <span className="text-green-600 font-bold">{task.actualHours || 0}h (Actual)</span></span>
                </div>
            </div>

            {/* Description */}
            {task.description && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{task.description}</p>
                </div>
            )}

            {/* Attachments */}
            {task.attachments?.length > 0 && (
                <div>
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attachments</h3>
                     <div className="flex flex-wrap gap-2">
                        {task.attachments.map((url: string, idx: number) => (
                            <a key={idx} href={url} target="_blank" className="flex items-center px-3 py-2 bg-white border border-gray-200 text-indigo-600 text-sm rounded hover:bg-gray-50 transition">
                                <Paperclip className="w-3 h-3 mr-2" /> Attachment {idx + 1}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Time Logging Input */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                <History size={18} className="text-blue-600" />
                <input 
                    type="number" 
                    value={timeLogHours} 
                    onChange={(e) => setTimeLogHours(e.target.value)} 
                    placeholder="Log hours (e.g. 2)" 
                    className="border-gray-300 rounded px-2 py-1 text-sm w-32 focus:ring-blue-500 focus:border-blue-500" 
                />
                <button onClick={onLogTime} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">Add Time Log</button>
            </div>

            {/* UNIFIED ACTIVITY STORY */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                    <Activity className="w-5 h-5 mr-2 text-indigo-600"/> Activity Story
                </h3>
                
                <div className="space-y-6 mb-6">
                    {activities.length === 0 ? (
                        <p className="text-gray-400 text-sm italic text-center py-4">No activity recorded yet.</p>
                    ) : (
                        activities.map((item: any, idx: number) => (
                            <div key={idx} className="flex space-x-3 relative">
                                {/* Timeline Connector */}
                                {idx !== activities.length - 1 && (
                                    <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-gray-200"></div>
                                )}

                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 
                                    ${item.type === 'time_log' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-indigo-100 border-indigo-200 text-indigo-700'}`}>
                                    {item.type === 'time_log' ? <History size={14}/> : item.user?.name?.charAt(0) || 'S'}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="text-sm">
                                        <span className="font-semibold text-gray-900">{item.user?.name || 'System'}</span>
                                        <span className="text-gray-500 ml-1">
                                            {item.type === 'time_log' ? <span className="text-green-600 font-medium">logged time</span> : ''} 
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2 float-right">
                                            {item.date.toLocaleDateString()} {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    
                                    <div className={`mt-1 text-sm p-2 rounded 
                                        ${item.type === 'time_log' ? 'bg-green-50 text-green-800 inline-block' : 'text-gray-700'}`}>
                                        {item.text}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSubmit(onCommentSubmit)} className="flex gap-2 items-start mt-4 pt-4 border-t border-gray-100">
                    <div className="flex-shrink-0 mt-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User size={16}/>
                        </div>
                    </div>
                    <div className="flex-1">
                         <textarea 
                            {...register('text', { required: true })} 
                            placeholder="Write a comment or update..." 
                            className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm min-h-[40px] py-2"
                            rows={1}
                         />
                    </div>
                    <button type="submit" disabled={loading} className="mt-1 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition">
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}