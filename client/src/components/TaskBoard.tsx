'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskBoard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const columns = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-50' },
    { id: 'review', label: 'Review', color: 'bg-yellow-50' },
    { id: 'done', label: 'Done', color: 'bg-green-50' },
  ];

  if (loading) return <div>Loading Board...</div>;

  return (
    <div className="flex gap-6 min-w-[1000px] h-full pb-4">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div key={col.id} className={`flex-1 min-w-[280px] rounded-xl ${col.color} p-4 flex flex-col`}>
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    {col.label} 
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm border text-gray-500">{colTasks.length}</span>
                </h3>
             </div>

             <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {colTasks.map((task) => (
                    <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                task.priority === 'high' ? 'bg-red-50 text-red-600' :
                                task.priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                                'bg-green-50 text-green-600'
                            }`}>{task.priority}</span>
                            <button className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{task.title}</h4>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                            <div className="flex -space-x-2">
                                {task.assignees?.map((u: any) => (
                                    <div key={u._id} className="h-6 w-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] text-indigo-600 font-bold" title={u.name}>
                                        {u.avatar ? <img src={u.avatar} className="h-full w-full rounded-full object-cover"/> : u.name.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 font-mono">
                                {task.sprint ? 'Sprint ' + task.sprint.sprintNumber : 'Backlog'}
                            </span>
                        </div>
                    </div>
                ))}
                {colTasks.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                        No tasks
                    </div>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
}