'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Mail, Shield, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import UserEditModal from '@/components/UserEditModal';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Delete
  const handleDelete = async (userId: string) => {
    if(!confirm('Are you sure you want to remove this user?')) return;

    try {
        await api.delete(`/users/${userId}`);
        toast.success('User removed successfully');
        fetchUsers(); // Refresh list
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle Edit Click
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8">Loading Team...</div>;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h1>
      
      <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {users.map((member) => (
            <li key={member._id} className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" /> {member.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      member.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {member.role}
                  </span>

                  {/* Action Buttons (Only for Admin) */}
                  {isAdmin && currentUser?._id !== member._id && (
                    <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                        <button 
                            onClick={() => handleEditClick(member)}
                            className="text-gray-400 hover:text-indigo-600 transition"
                            title="Change Role"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(member._id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="Remove User"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Modal */}
      <UserEditModal 
        user={editingUser} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers} 
      />
    </div>
  );
}