'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Ban, CheckCircle, Trash2, Search, Plus, Edit2 } from 'lucide-react';
import Link from 'next/link';
import UserCreateModal from './UserCreateModal';
import UserEditModal from './UserEditModal';
import ConfirmModal from '@/components/ConfirmModal';
import { API_URL } from '@/config/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${id}/status`, { is_active: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = (id: number) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const editUser = (user: any) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const changeRole = async (id: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Shield className="w-12 h-12 mb-4 text-gray-300" />
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">Manage user roles and access permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>

          {/* Search Placeholder */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 min-w-[250px]">User</th>
              <th className="p-4 min-w-[150px]">Personal Details</th>
              <th className="p-4 min-w-[200px]">Contact Info</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading users...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden border border-gray-200">
                      {user.profile_picture ? (
                        <img
                          src={`${API_URL}${user.profile_picture}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.username}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">{user.full_name || '-'}</p>
                    <p className="text-xs text-slate-500">NIC: {user.nic || '-'}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      {user.phone_number || '-'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-[200px] truncate" title={user.address}>
                      {user.address || '-'}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="text-sm border-gray-200 rounded-lg p-1.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="USER">User</option>
                    <option value="CREATOR">Creator</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/user-details?id=${user.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Search className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => editUser(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleStatus(user.id, user.is_active)}
                      className={`p-2 rounded-lg transition-colors ${user.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={user.is_active ? "Block User" : "Unblock User"}
                    >
                      {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <UserCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchUsers}
        user={userToEdit}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
