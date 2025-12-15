'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Users, Mail, Plus, CheckCircle, Clock, Trash2, Edit2, Shield, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  totalTasks: number;
  completedTasks: number; // Added
  totalHours: number;
  avatar?: string;
}

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'admin': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 uppercase"><ShieldCheck size={10} className="mr-1"/> Admin</span>;
          case 'manager': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 uppercase"><Shield size={10} className="mr-1"/> Manager</span>;
          default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 uppercase">Member</span>;
      }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Team...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 text-indigo-600" /> Team Members
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage roles, view performance, and add new members.</p>
        </div>
        {currentUser?.role === 'admin' && (
             <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md font-medium">
                <Plus size={18} className="mr-2"/> Add Member
            </button>
        )}
      </div>

      <div className="space-y-4">
        {users.map((member) => (
            <div key={member._id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex-shrink-0">
                    {member.avatar ? (
                         <img src={member.avatar} alt={member.name} className="h-14 w-14 rounded-full object-cover border-2 border-indigo-50" />
                    ) : (
                        <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center text-xl font-bold text-indigo-600 uppercase border-2 border-white shadow-sm">
                            {member.name.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                        {getRoleBadge(member.role)}
                    </div>
                    <div className="text-sm text-gray-500 flex flex-col md:flex-row items-center gap-1 md:gap-4">
                        <span className="flex items-center"><Mail size={12} className="mr-1"/> {member.email}</span>
                    </div>
                     <span className="inline-block mt-2 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                        {member.department || 'General'}
                    </span>
                </div>

                <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-center">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tasks</p>
                        <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                            <CheckCircle size={14} className="text-green-500 mr-1.5"/> 
                            <span className="text-green-600">{member.completedTasks}</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span>{member.totalTasks}</span>
                        </p>
                    </div>
                    <div className="w-px h-8 bg-gray-100 hidden md:block"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hours</p>
                        <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                            <Clock size={14} className="text-orange-500 mr-1.5"/> 
                            {member.totalHours?.toFixed(1) || 0}h
                        </p>
                    </div>
                </div>

                {currentUser?.role === 'admin' && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Role">
                            <Edit2 size={16}/>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Remove Member">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
}