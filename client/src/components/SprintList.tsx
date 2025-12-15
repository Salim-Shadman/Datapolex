'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, CheckCircle, Clock } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function SprintList({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // New Sprint Form State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSprints = async () => {
    try {
      const res = await api.get(`/sprints?projectId=${projectId}`);
      setSprints(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [projectId]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sprints', {
        title,
        startDate,
        endDate,
        project: projectId
      });
      toast.success('Sprint created!');
      setShowForm(false);
      setTitle('');
      setStartDate('');
      setEndDate('');
      fetchSprints();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create sprint');
    }
  };

  const handleDelete = async (sprintId: string) => {
    if(!confirm('Delete this sprint?')) return;
    try {
        await api.delete(`/sprints/${sprintId}`);
        toast.success('Sprint deleted');
        setSprints(sprints.filter(s => s._id !== sprintId));
    } catch (error) {
        toast.error('Failed to delete');
    }
  };

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  if (loading) return <div className="text-center py-4 text-gray-500">Loading Sprints...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Sprints & Timeline</h3>
        {isAdminOrManager && !showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
                <Plus size={16} className="mr-1"/> New Sprint
            </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreateSprint} className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Sprint Goal / Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="e.g. Sprint 1: Setup" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border p-2 rounded-lg" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border p-2 rounded-lg" required />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Sprint</button>
            </div>
        </form>
      )}

      <div className="space-y-4">
        {sprints.length === 0 ? (
            <p className="text-gray-500 italic">No sprints found.</p>
        ) : (
            sprints.map((sprint) => (
                <div key={sprint._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                {sprint.title}
                                {sprint.status === 'active' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full uppercase">Active</span>}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                <span className="flex items-center"><Calendar size={14} className="mr-1"/> {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span>
                            </p>
                        </div>
                        {isAdminOrManager && (
                            <button onClick={() => handleDelete(sprint._id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}