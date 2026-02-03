'use client';

import { useState } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';
import { API_URL } from '@/config/api';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserCreateModal({ isOpen, onClose, onSuccess }: UserCreateModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CREATOR',
    full_name: '',
    phone_number: '',
    nic: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
      onClose();
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'CREATOR',
        full_name: '',
        phone_number: '',
        nic: '',
        address: ''
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-theme">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme flex-shrink-0">
          <h2 className="text-lg font-semibold text-theme-primary">Create New User</h2>
          <button
            onClick={onClose}
            className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-theme-primary uppercase tracking-wider">Account Details</h3>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary bg-theme-secondary placeholder:text-theme-muted"
                    placeholder="johndoe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary bg-theme-secondary placeholder:text-theme-muted"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary bg-theme-secondary placeholder:text-theme-muted"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-theme-secondary text-theme-primary cursor-pointer"
                  >
                    <option value="CREATOR">Creator</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-theme-primary uppercase tracking-wider">Personal Details</h3>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary bg-theme-secondary placeholder:text-theme-muted"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary bg-theme-secondary placeholder:text-theme-muted"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">NIC / ID Number</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary bg-theme-secondary placeholder:text-theme-muted"
                    placeholder="991234567V"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary bg-theme-secondary resize-none placeholder:text-theme-muted"
                    placeholder="123, Main Street, Colombo"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-theme">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
