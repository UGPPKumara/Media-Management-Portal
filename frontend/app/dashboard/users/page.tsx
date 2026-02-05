'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Ban, CheckCircle, Trash2, Search, Plus, Edit2, Filter, Key, Download, Users, UserCheck, UserX, RefreshCw, Tag, FileText, Clock, Activity, Monitor, Mail, X, Eye, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import UserCreateModal from './UserCreateModal';
import UserEditModal from './UserEditModal';
import ConfirmModal from '@/components/ConfirmModal';
import { API_URL } from '@/config/api';
import { getImageUrl } from '@/utils/imageUtils';
import { useToast } from '@/context/ToastContext';

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Bulk Selection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // New Modals
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<any>(null);

  // Tags/Notes State
  const [userTags, setUserTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('CREATOR');
  // Performance Modal
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [performancePosts, setPerformancePosts] = useState<any[]>([]);

  // ... existing modalLoading state ...

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    let result = [...users];
    if (searchQuery) {
      result = result.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (roleFilter !== 'ALL') result = result.filter(user => user.role === roleFilter);
    if (statusFilter !== 'ALL') result = result.filter(user => statusFilter === 'ACTIVE' ? user.is_active : !user.is_active);
    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${id}/status`, { is_active: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
      showToast(currentStatus ? 'User blocked' : 'User activated', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const deleteUser = (id: string) => { setUserToDelete(id); setIsDeleteModalOpen(true); };
  const editUser = (user: any) => { setUserToEdit(user); setIsEditModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/${userToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${id}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Role updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedUsers([]);
    else setSelectedUsers(filteredUsers.map(u => u.id));
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    else setSelectedUsers([...selectedUsers, id]);
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedUsers.map(id => axios.delete(`${API_URL}/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      showToast(`${selectedUsers.length} users deleted`, 'success');
      setSelectedUsers([]); setSelectAll(false);
      fetchUsers();
    } catch (err) {
      showToast('Failed to delete some users', 'error');
    }
  };

  const openPasswordReset = (user: any) => { setUserForPasswordReset(user); setNewPassword(''); setIsPasswordModalOpen(true); };

  const handlePasswordReset = async () => {
    if (!userForPasswordReset || !newPassword) return;
    setResetLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${userForPasswordReset.id}/password`, { password: newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Password reset successfully', 'success');
      setIsPasswordModalOpen(false);
    } catch (err) {
      showToast('Failed to reset password', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  // Tags Modal
  const openTagsModal = (user: any) => {
    setSelectedUserForModal(user);
    setUserTags(user.tags || []);
    setNewTag('');
    setIsTagsModalOpen(true);
  };

  const addTag = () => {
    if (newTag.trim() && userTags.length < 5 && !userTags.includes(newTag.trim())) {
      setUserTags([...userTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setUserTags(userTags.filter(t => t !== tag));

  const saveTags = async () => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${selectedUserForModal.id}/tags`, { tags: userTags }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Tags updated', 'success');
      setIsTagsModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast('Failed to update tags', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Notes Modal
  const openNotesModal = (user: any) => {
    setSelectedUserForModal(user);
    setUserNotes(user.admin_notes || '');
    setIsNotesModalOpen(true);
  };

  const saveNotes = async () => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${selectedUserForModal.id}/notes`, { notes: userNotes }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Notes updated', 'success');
      setIsNotesModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast('Failed to update notes', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Activity Modal
  const openActivityModal = async (user: any) => {
    setSelectedUserForModal(user);
    setActivityLogs([]);
    setIsActivityModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/activity/user/${user.id}?limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      setActivityLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Sessions Modal
  const openSessionsModal = async (user: any) => {
    setSelectedUserForModal(user);
    setSessions([]);
    setIsSessionsModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/sessions/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Session terminated', 'success');
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      showToast('Failed to terminate session', 'error');
    }
  };

  // Invite Modal
  const handleInvite = async () => {
    if (!inviteEmail) return;
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/users/invite`, { email: inviteEmail, role: inviteRole }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Invitation sent!', 'success');
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send invite', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Username', 'Email', 'Full Name', 'Role', 'Status', 'Last Login', 'Tags'].join(','),
      ...filteredUsers.map(u => [
        u.username, u.email, u.full_name || '', u.role,
        u.is_active ? 'Active' : 'Inactive',
        u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
        (u.tags || []).join(';')
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Users exported to CSV', 'success');
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never';
  const timeAgo = (date: string) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const stats = {
    total: users.length, active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length, admins: users.filter(u => u.role === 'ADMIN').length,
    managers: users.filter(u => u.role === 'MANAGER').length, creators: users.filter(u => u.role === 'CREATOR').length
  };

  if (currentUser?.role !== 'ADMIN') {
    return (<div className="flex flex-col items-center justify-center h-[50vh] text-theme-muted"><Shield className="w-12 h-12 mb-4 opacity-50" /><p>You do not have permission to view this page.</p></div>);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">User Management</h1>
          <p className="text-theme-secondary">Manage user roles, tags, and access permissions</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-theme-tertiary text-theme-primary border border-theme rounded-lg hover:bg-theme-hover transition-colors text-sm font-medium">
            <Mail className="w-4 h-4" /> Invite
          </button>
          <button onClick={exportUsers} className="flex items-center gap-2 px-4 py-2 bg-theme-tertiary text-theme-primary border border-theme rounded-lg hover:bg-theme-hover transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/30">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { icon: Users, color: 'indigo', value: stats.total, label: 'Total Users' },
          { icon: UserCheck, color: 'green', value: stats.active, label: 'Active' },
          { icon: UserX, color: 'red', value: stats.inactive, label: 'Inactive' },
          { icon: Shield, color: 'purple', value: stats.admins, label: 'Admins' },
          { icon: Users, color: 'blue', value: stats.managers, label: 'Managers' },
          { icon: Users, color: 'orange', value: stats.creators, label: 'Creators' }
        ].map((s, i) => (
          <div key={i} className="bg-theme-card p-4 rounded-xl border border-theme">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${s.color}-500/20 rounded-lg`}><s.icon className={`w-5 h-5 text-${s.color}-500`} /></div>
              <div><p className="text-2xl font-bold text-theme-primary">{s.value}</p><p className="text-xs text-theme-muted">{s.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-theme-card p-4 rounded-xl border border-theme">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-theme-muted" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="pl-10 pr-4 py-2 border border-theme rounded-lg text-sm bg-theme-secondary text-theme-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-theme-muted" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-theme rounded-lg text-sm bg-theme-secondary text-theme-primary focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="ALL">All Roles</option><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="CREATOR">Creator</option>
              </select>
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-theme rounded-lg text-sm bg-theme-secondary text-theme-primary focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
              <span className="text-sm text-red-500 font-medium">{selectedUsers.length} selected</span>
              <button onClick={() => setIsBulkDeleteModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"><Trash2 className="w-4 h-4" />Delete</button>
              <button onClick={() => { setSelectedUsers([]); setSelectAll(false); }} className="text-sm text-theme-secondary hover:text-theme-primary">Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-theme-card border border-theme rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-theme-tertiary text-theme-secondary text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 w-12"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded" /></th>
              <th className="p-4 min-w-[200px]">User</th>
              <th className="p-4">Last Login</th>
              <th className="p-4">Tags</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-theme-muted">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-theme-muted">No users found</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-theme-tertiary transition-colors ${selectedUsers.includes(user.id) ? 'bg-indigo-500/10' : ''}`}>
                <td className="p-4"><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} className="w-4 h-4 rounded" /></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-theme-tertiary flex items-center justify-center text-theme-primary font-bold overflow-hidden border border-theme">
                      {user.profile_picture ? <img src={getImageUrl(user.profile_picture)} alt="" className="w-full h-full object-cover" /> : user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-theme-primary">{user.username}</p>
                      <p className="text-sm text-theme-secondary">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-sm text-theme-secondary">
                    <Clock className="w-3 h-3" />
                    {user.last_login ? timeAgo(user.last_login) : <span className="text-theme-muted">Never</span>}
                  </div>
                  {user.login_count > 0 && <p className="text-xs text-theme-muted">{user.login_count} logins</p>}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(user.tags || []).slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-500 rounded-full">{tag}</span>
                    ))}
                    {(user.tags?.length || 0) > 3 && <span className="text-xs text-theme-muted">+{user.tags.length - 3}</span>}
                  </div>
                </td>
                <td className="p-4">
                  <select value={user.role} onChange={(e) => changeRole(user.id, e.target.value)} className="text-sm border border-theme rounded-lg p-1.5 bg-theme-secondary text-theme-primary focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                    <option value="CREATOR">Creator</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {user.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openTagsModal(user)} className="p-1.5 text-theme-muted hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg" title="Tags"><Tag className="w-4 h-4" /></button>
                    <button onClick={() => openNotesModal(user)} className="p-1.5 text-theme-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg" title="Notes"><FileText className="w-4 h-4" /></button>
                    <button onClick={() => openActivityModal(user)} className="p-1.5 text-theme-muted hover:text-cyan-500 hover:bg-cyan-500/10 rounded-lg" title="Activity"><Activity className="w-4 h-4" /></button>
                    <button onClick={() => openSessionsModal(user)} className="p-1.5 text-theme-muted hover:text-purple-500 hover:bg-purple-500/10 rounded-lg" title="Sessions"><Monitor className="w-4 h-4" /></button>
                    <Link href={`/dashboard/user-performance?id=${user.id}`} className="p-1.5 text-theme-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg inline-flex items-center justify-center" title="Performance"><BarChart2 className="w-4 h-4" /></Link>
                    <button onClick={() => openPasswordReset(user)} className="p-1.5 text-theme-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg" title="Reset Password"><Key className="w-4 h-4" /></button>
                    <button onClick={() => editUser(user)} className="p-1.5 text-theme-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => toggleStatus(user.id, user.is_active)} className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'text-theme-muted hover:text-red-500 hover:bg-red-500/10' : 'text-theme-muted hover:text-green-500 hover:bg-green-500/10'}`} title={user.is_active ? "Block" : "Unblock"}>
                      {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="p-1.5 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Existing Modals */}
      <UserCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} />
      <UserEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchUsers} user={userToEdit} />
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete User" message="Are you sure you want to delete this user? This action cannot be undone." confirmText="Delete" isDestructive={true} />
      <ConfirmModal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} onConfirm={handleBulkDelete} title="Delete Selected Users" message={`Are you sure you want to delete ${selectedUsers.length} selected users?`} confirmText="Delete All" isDestructive={true} />

      {/* Password Reset Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-md mx-4 border border-theme">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2"><Key className="w-5 h-5 text-amber-500" />Reset Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-theme-secondary text-sm">Set a new password for <strong className="text-theme-primary">{userForPasswordReset?.username}</strong></p>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-theme rounded-xl bg-theme-secondary text-theme-primary" placeholder="Enter new password" />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-sm font-medium text-theme-secondary">Cancel</button>
                <button onClick={handlePasswordReset} disabled={resetLoading || !newPassword} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg disabled:opacity-50 font-medium text-sm">
                  {resetLoading && <RefreshCw className="w-4 h-4 animate-spin" />}Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags Modal */}
      {isTagsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-md mx-4 border border-theme">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-500" />User Tags</h2>
              <button onClick={() => setIsTagsModalOpen(false)} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-theme-secondary text-sm">Manage tags for <strong className="text-theme-primary">{selectedUserForModal?.username}</strong></p>
              <div className="flex flex-wrap gap-2">
                {userTags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-500 rounded-full text-sm">
                    {tag}<button onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              {userTags.length < 5 && (
                <div className="flex gap-2">
                  <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} className="flex-1 px-4 py-2 border border-theme rounded-lg bg-theme-secondary text-theme-primary text-sm" placeholder="Add tag (max 5)" />
                  <button onClick={addTag} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm">Add</button>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsTagsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-theme-secondary">Cancel</button>
                <button onClick={saveTags} disabled={modalLoading} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg disabled:opacity-50 font-medium text-sm">
                  {modalLoading && <RefreshCw className="w-4 h-4 animate-spin" />}Save Tags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-theme">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2"><FileText className="w-5 h-5 text-amber-500" />Admin Notes</h2>
              <button onClick={() => setIsNotesModalOpen(false)} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-theme-secondary text-sm">Private notes for <strong className="text-theme-primary">{selectedUserForModal?.username}</strong></p>
              <textarea value={userNotes} onChange={(e) => setUserNotes(e.target.value)} className="w-full h-40 px-4 py-3 border border-theme rounded-xl bg-theme-secondary text-theme-primary resize-none" placeholder="Add private notes about this user..." />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsNotesModalOpen(false)} className="px-4 py-2 text-sm font-medium text-theme-secondary">Cancel</button>
                <button onClick={saveNotes} disabled={modalLoading} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg disabled:opacity-50 font-medium text-sm">
                  {modalLoading && <RefreshCw className="w-4 h-4 animate-spin" />}Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-2xl mx-4 border border-theme max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-500" />Activity Log</h2>
              <button onClick={() => setIsActivityModalOpen(false)} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-theme-secondary text-sm mb-4">Recent activity for <strong className="text-theme-primary">{selectedUserForModal?.username}</strong></p>
              {activityLogs.length === 0 ? (
                <p className="text-theme-muted text-center py-8">No activity logs found</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-theme-tertiary rounded-lg">
                      <div className="p-2 bg-cyan-500/20 rounded-lg"><Activity className="w-4 h-4 text-cyan-500" /></div>
                      <div className="flex-1">
                        <p className="text-sm text-theme-primary font-medium">{log.action}</p>
                        <p className="text-xs text-theme-secondary">{log.description}</p>
                        <p className="text-xs text-theme-muted mt-1">{formatDate(log.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {isSessionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-2xl mx-4 border border-theme max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2"><Monitor className="w-5 h-5 text-purple-500" />Active Sessions</h2>
              <button onClick={() => setIsSessionsModalOpen(false)} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-theme-secondary text-sm mb-4">Active sessions for <strong className="text-theme-primary">{selectedUserForModal?.username}</strong></p>
              {sessions.length === 0 ? (
                <p className="text-theme-muted text-center py-8">No active sessions</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-theme-tertiary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg"><Monitor className="w-4 h-4 text-purple-500" /></div>
                        <div>
                          <p className="text-sm text-theme-primary font-medium">{session.device_info}</p>
                          <p className="text-xs text-theme-muted">{session.ip_address} • Last active: {timeAgo(session.last_activity)}</p>
                        </div>
                      </div>
                      <button onClick={() => terminateSession(session.id)} className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs rounded-lg hover:bg-red-500/20">Terminate</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-md mx-4 border border-theme">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-500" />Invite User</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-3 border border-theme rounded-xl bg-theme-secondary text-theme-primary" placeholder="user@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-4 py-3 border border-theme rounded-xl bg-theme-secondary text-theme-primary">
                  <option value="CREATOR">Creator</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-theme-secondary">Cancel</button>
                <button onClick={handleInvite} disabled={modalLoading || !inviteEmail} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg disabled:opacity-50 font-medium text-sm">
                  {modalLoading && <RefreshCw className="w-4 h-4 animate-spin" />}Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
