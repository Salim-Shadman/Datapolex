'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import Link from 'next/link';
import { FolderKanban, ListTodo, Clock, DollarSign, Briefcase, ArrowRight, CheckCircle, PlayCircle, PauseCircle, Users } from 'lucide-react';
import ProjectThumbnail from '@/components/ProjectThumbnail';
import DashboardCharts from '@/components/DashboardCharts'; // NEW IMPORT
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Loading your workspace...</p>
            </div>
        </div>
    );
  }

  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'active': return 'bg-green-100 text-green-700 border-green-200';
        case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'active': return <PlayCircle size={14} className="mr-1"/>;
        case 'completed': return <CheckCircle size={14} className="mr-1"/>;
        default: return <PauseCircle size={14} className="mr-1"/>;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={container} 
      className="max-w-7xl mx-auto pb-10"
    >
      <motion.div variants={item} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="mt-1 text-gray-500">
                Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span> 👋
            </p>
        </div>
        <div className="text-right hidden sm:block bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </motion.div>
      
      {isAdminOrManager ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 mr-4">
                    <FolderKanban size={26} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Projects</p>
                    <p className="mt-1 text-2xl font-black text-gray-900">{stats.projects?.total || 0}</p>
                    <p className="text-xs text-green-600 font-bold mt-0.5 bg-green-50 px-1.5 py-0.5 rounded-md inline-block">+{stats.projects?.active || 0} Active</p>
                </div>
            </motion.div>

            <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 mr-4">
                    <DollarSign size={26} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Budget</p>
                    <p className="mt-1 text-2xl font-black text-gray-900">${(stats.budget || 0).toLocaleString()}</p>
                </div>
            </motion.div>

            <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-3.5 rounded-xl bg-orange-50 text-orange-600 mr-4">
                    <Clock size={26} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Hours</p>
                    <p className="mt-1 text-2xl font-black text-gray-900">{stats.totalHours ? stats.totalHours.toFixed(1) : '0'}h</p>
                </div>
            </motion.div>

             <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 mr-4">
                    <Users size={26} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team Size</p>
                    <p className="mt-1 text-2xl font-black text-gray-900">{stats.totalUsers || 0}</p>
                </div>
            </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-4 rounded-xl bg-blue-50 text-blue-600 mr-5">
                    <Briefcase size={28} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Projects</p>
                    <p className="mt-1 text-3xl font-black text-gray-900">{stats.myStats?.projects?.length || 0}</p>
                </div>
            </motion.div>

            <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600 mr-5">
                    <ListTodo size={28} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Tasks</p>
                    <p className="mt-1 text-3xl font-black text-gray-900">{stats.myStats?.pendingTasks || 0}</p>
                </div>
            </motion.div>

            <motion.div variants={item} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 mr-5">
                    <Clock size={28} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Worked Hours</p>
                    <p className="mt-1 text-3xl font-black text-gray-900">{stats.myStats?.totalHours ? stats.myStats.totalHours.toFixed(1) : '0'}h</p>
                </div>
            </motion.div>
        </div>
      )}

      
      {isAdminOrManager && stats.chartData && (
        <motion.div variants={item}>
            <DashboardCharts data={stats.chartData} />
        </motion.div>
      )}

      <motion.div variants={item} className="mt-8">
        <div className="flex items-center justify-between mb-5">
             <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FolderKanban className="mr-2 text-indigo-600" size={22}/> 
                {isAdminOrManager ? 'Recent Projects' : 'My Assigned Projects'}
            </h2>
            <Link href="/dashboard/projects" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                View All <ArrowRight size={16} className="ml-1"/>
            </Link>
        </div>
        
        {(isAdminOrManager ? stats.recentProjects : stats.myStats?.projects)?.length === 0 ? (
            <motion.div variants={item} className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <FolderKanban size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-gray-500">Get started by creating a new project.</p>
            </motion.div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(isAdminOrManager ? stats.recentProjects : stats.myStats?.projects)?.map((project: any) => (
                    <motion.div variants={item} key={project._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                        <Link href={`/dashboard/projects/${project._id}`} className="block relative">
                             <ProjectThumbnail 
                                src={project.thumbnail} 
                                alt={project.title} 
                                className="h-44 w-full"
                            >
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm uppercase tracking-wide backdrop-blur-md ${getStatusColor(project.status)}`}>
                                        {getStatusIcon(project.status)}
                                        {project.status}
                                    </span>
                                </div>
                            </ProjectThumbnail>
                        </Link>
                        
                        <div className="p-5 flex-1 flex flex-col">
                            <Link href={`/dashboard/projects/${project._id}`}>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {project.title}
                                </h3>
                            </Link>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-1 font-medium">{project.client}</p>
                            
                            {project.progress !== undefined && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-bold mb-1.5 text-gray-600">
                                        <span>Progress</span>
                                        <span>{Math.round(project.progress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md" 
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500 font-medium">
                                <span className="flex items-center bg-gray-50 px-2 py-1 rounded">
                                    <Clock size={12} className="mr-1.5 text-gray-400"/> 
                                    {new Date(project.startDate).toLocaleDateString()}
                                </span>
                                {project.budget && (
                                    <span className="text-gray-700 bg-green-50 px-2 py-1 rounded text-green-700">
                                        ${project.budget.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </motion.div>
    </motion.div>
  );
}