'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, CreditCard, Lock, Camera, Loader2, Save } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { API_URL } from '@/config/api';

export default function ProfilePage() {
  const { showToast } = useToast();
  const { updateUser } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    nic: '',
    address: ''
  });

  // Password States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setFormData({
        username: res.data.username || '',
        email: res.data.email || '',
        full_name: res.data.full_name || '',
        phone_number: res.data.phone_number || '',
        nic: res.data.nic || '',
        address: res.data.address || ''
      });
      // Update context for live header update
      updateUser(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/profile`, {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        nic: formData.nic,
        address: formData.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Profile updated successfully', 'success');
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/profile/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Password changed successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/profile/picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchProfile();
    } catch (err: any) {
      console.error('Upload error details:', err);
      showToast(err.response?.data?.message || 'Failed to upload profile picture', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">

      {/* Header & Profile Picture */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-theme-card p-6 rounded-2xl shadow-sm border border-theme">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-theme-tertiary border-4 border-theme-card shadow-md">
            {profile?.profile_picture ? (
              <img
                src={`${API_URL}${profile.profile_picture}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-500 text-3xl font-bold">
                {profile?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-theme-card p-2 rounded-full shadow-md border border-theme text-theme-secondary hover:text-indigo-500 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-theme-primary">{profile?.username}</h1>
          <p className="text-theme-secondary">{profile?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/20 text-indigo-500 text-xs font-semibold rounded-full uppercase">
            {profile?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Personal Details Form */}
        <div className="bg-theme-card p-6 rounded-2xl shadow-sm border border-theme">
          <div className="flex items-center gap-2 mb-6 text-indigo-500">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-bold text-theme-primary">Personal Details</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  disabled
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-theme-secondary">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                placeholder="Your Full Name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                  placeholder="+94 77 ..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">NIC / ID</label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                  placeholder="ID Number"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-theme-secondary">Address</label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary resize-none"
                placeholder="123, Main Street..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-theme-card p-6 rounded-2xl shadow-sm border border-theme h-fit">
          <div className="flex items-center gap-2 mb-6 text-indigo-500">
            <Lock className="w-5 h-5" />
            <h2 className="text-lg font-bold text-theme-primary">Security</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-theme-secondary">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-theme-secondary">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-theme-secondary">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
