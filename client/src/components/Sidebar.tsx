'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, LogOut, Settings } from 'lucide-react'; // Settings Icon Added
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import ProfileModal from './ProfileModal'; // Import Modal

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Team', href: '/dashboard/team', icon: Users },
  ];

  return (
    <>
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
      {/* Logo Area */}
      <div className="flex h-16 items-center justify-center border-b border-slate-800 bg-slate-950">
        <h1 className="text-2xl font-bold tracking-wider text-white">MPMS</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section (Bottom) */}
      <div className="border-t border-slate-800 p-4">
        <div 
            onClick={() => setIsProfileOpen(true)} // Click to open modal
            className="flex items-center w-full rounded-lg p-2 hover:bg-slate-800 transition cursor-pointer group"
        >
          {/* USER AVATAR DISPLAY */}
          <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-full bg-indigo-500 border-2 border-slate-600 group-hover:border-indigo-400 transition">
            {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
                <span className="flex h-full w-full items-center justify-center font-bold text-white">
                    {user?.name?.charAt(0)}
                </span>
            )}
            {/* Edit Icon Overlay on Hover */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Settings size={14} className="text-white"/>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white group-hover:text-indigo-300 transition">{user?.name}</p>
            <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
              {user?.role}
            </span>
          </div>
          
          <button
            onClick={(e) => {
                e.stopPropagation(); // Prevent modal opening
                logout();
            }}
            className="ml-2 rounded-full p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400 transition"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
    
    {/* Profile Modal */}
    <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}