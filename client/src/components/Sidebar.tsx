'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, FolderKanban, Users, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Team', href: '/dashboard/team', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">MPMS</h1>
      </div>
      
      <div className="p-4 border-b border-gray-800">
        <p className="text-sm text-gray-400">Welcome,</p>
        <p className="font-semibold truncate">{user?.name}</p>
        <span className="text-xs px-2 py-0.5 rounded bg-indigo-600 capitalize">{user?.role}</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-800 hover:text-white',
                pathname === item.href ? 'bg-gray-800 text-white' : 'text-gray-300'
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button
          onClick={logout}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}