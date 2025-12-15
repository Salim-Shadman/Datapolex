'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { FolderKanban, ListTodo } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    myTasks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ১. সব প্রজেক্ট নিয়ে আসা
        const projectsRes = await api.get('/projects');
        
        // ২. আমার টাস্কগুলো নিয়ে আসা (লগইন করা ইউজারের ID দিয়ে ফিল্টার)
        // নোট: ব্যাকএন্ডে আমরা assigneeId কুয়েরি প্যারামিটার সাপোর্ট রেখেছি
        const tasksRes = await api.get(`/tasks?assigneeId=${user?._id}&status=todo,in-progress`);

        setStats({
          totalProjects: projectsRes.data.length,
          myTasks: tasksRes.data.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      <p className="mt-2 text-gray-600">
        Hello <span className="font-semibold">{user?.name}</span>, welcome to your project management dashboard.
      </p>
      
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Projects Card */}
        <div className="rounded-lg bg-white p-6 shadow border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <FolderKanban size={24} />
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900">Total Projects</h3>
                <p className="mt-1 text-3xl font-bold text-indigo-600">{stats.totalProjects}</p>
                <p className="text-xs text-gray-500">All available projects</p>
            </div>
        </div>

        {/* My Tasks Card */}
        <div className="rounded-lg bg-white p-6 shadow border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <ListTodo size={24} />
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900">My Pending Tasks</h3>
                <p className="mt-1 text-3xl font-bold text-green-600">{stats.myTasks}</p>
                <p className="text-xs text-gray-500">Assigned to you</p>
            </div>
        </div>
      </div>
    </div>
  );
}