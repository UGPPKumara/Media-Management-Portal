'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Loader2, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { API_URL } from '@/config/api';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

export default function UserEditModal({ isOpen, onClose, onSuccess, user }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    nic: '',
    address: '',
    role: 'CREATOR'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        nic: user.nic || '',
        address: user.address || '',
        role: user.role || 'CREATOR'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-theme">
        <div className="flex justify-between items-center p-6 border-b border-theme">
          <h2 className="text-xl font-bold text-theme-primary">Edit User Details</h2>
          <button onClick={onClose} className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-500/20">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-muted uppercase">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-theme-muted" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-theme rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-muted uppercase">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-theme rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary"
              >
                <option value="CREATOR">Creator</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-theme-muted uppercase">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-theme rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-theme-muted uppercase">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-theme-muted" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-theme rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-muted uppercase">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-theme-muted" />
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-theme rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-theme-muted uppercase">NIC / ID</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-theme-muted" />
                <input
                  type="text"
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-theme rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-theme-muted uppercase">Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-theme-muted" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-theme rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20 bg-theme-secondary text-theme-primary"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-theme mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-colors disabled:opacity-50 font-medium text-sm shadow-lg shadow-indigo-500/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
