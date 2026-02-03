'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import {
  Camera, Save, Loader2, Building, Shield, Globe, Mail, Phone,
  MapPin, Facebook, Instagram, Twitter, Youtube, Clock, Database,
  Users, FileText, HardDrive
} from 'lucide-react';
import { API_URL } from '@/config/api';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    company_name: '',
    logo_url: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    timezone: 'Asia/Colombo'
  });
  const [stats, setStats] = useState({
    total_users: 0,
    total_posts: 0,
    storage_used: '0 MB'
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      fetchSettings();
      fetchStats();
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats({
        total_users: res.data.total_users || 0,
        total_posts: res.data.total_posts || 0,
        storage_used: res.data.storage_used || '0 MB'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('company_name', settings.company_name);
    formData.append('company_email', settings.company_email || '');
    formData.append('company_phone', settings.company_phone || '');
    formData.append('company_address', settings.company_address || '');
    formData.append('website_url', settings.website_url || '');
    formData.append('facebook_url', settings.facebook_url || '');
    formData.append('instagram_url', settings.instagram_url || '');
    formData.append('twitter_url', settings.twitter_url || '');
    formData.append('youtube_url', settings.youtube_url || '');
    formData.append('timezone', settings.timezone || 'Asia/Colombo');

    if (fileInputRef.current?.files?.[0]) {
      formData.append('logo', fileInputRef.current.files[0]);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/settings`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      showToast('Settings updated successfully', 'success');
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSettings(prev => ({ ...prev, logo_url: url }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-theme-muted">
        <Shield className="w-12 h-12 mb-4 opacity-50" />
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'system', label: 'System Info', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">Company Settings</h1>
        <p className="text-theme-secondary">Manage branding and company details</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-theme-card p-1.5 rounded-xl border border-theme w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-theme-secondary hover:bg-theme-tertiary'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-theme-card p-8 rounded-2xl border border-theme space-y-8">
            {/* Logo Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-theme-primary uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-500" /> Company Logo
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative group w-32 h-32 bg-theme-tertiary rounded-2xl border-2 border-dashed border-theme flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url.startsWith('blob:') ? settings.logo_url : `${API_URL}${settings.logo_url}`}
                      alt="Company Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-theme-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
                <div className="text-sm text-theme-muted">
                  <p>Click to upload a new logo.</p>
                  <p>Recommended: 200x200px, PNG/JPG</p>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-theme-primary uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" /> Company Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Company Name</label>
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    className="w-full px-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                    placeholder="My Company"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-theme-secondary">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                    <input
                      type="url"
                      value={settings.website_url}
                      onChange={(e) => handleChange('website_url', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="bg-theme-card p-8 rounded-2xl border border-theme space-y-6">
            <h2 className="text-sm font-semibold text-theme-primary uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    type="email"
                    value={settings.company_email}
                    onChange={(e) => handleChange('company_email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    type="tel"
                    value={settings.company_phone}
                    onChange={(e) => handleChange('company_phone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                    placeholder="+94 11 234 5678"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-theme-secondary">Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-theme-muted" />
                <textarea
                  value={settings.company_address}
                  onChange={(e) => handleChange('company_address', e.target.value)}
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary resize-none"
                  placeholder="123 Main Street, Colombo, Sri Lanka"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-theme-secondary">Timezone</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                >
                  <option value="Asia/Colombo">Asia/Colombo (IST +5:30)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="bg-theme-card p-8 rounded-2xl border border-theme space-y-6">
            <h2 className="text-sm font-semibold text-theme-primary uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" /> Social Media Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                </label>
                <input
                  type="url"
                  value={settings.facebook_url}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  className="w-full px-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                  placeholder="https://facebook.com/company"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                </label>
                <input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                  placeholder="https://instagram.com/company"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-sky-500" /> Twitter / X
                </label>
                <input
                  type="url"
                  value={settings.twitter_url}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                  className="w-full px-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                  placeholder="https://twitter.com/company"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" /> YouTube
                </label>
                <input
                  type="url"
                  value={settings.youtube_url}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                  className="w-full px-4 py-3 border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-theme-primary bg-theme-secondary"
                  placeholder="https://youtube.com/@company"
                />
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-theme-card p-8 rounded-2xl border border-theme space-y-6">
            <h2 className="text-sm font-semibold text-theme-primary uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" /> System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-theme-tertiary p-6 rounded-xl border border-theme">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted">Total Users</p>
                    <p className="text-2xl font-bold text-theme-primary">{stats.total_users}</p>
                  </div>
                </div>
              </div>
              <div className="bg-theme-tertiary p-6 rounded-xl border border-theme">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <FileText className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted">Total Posts</p>
                    <p className="text-2xl font-bold text-theme-primary">{stats.total_posts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-theme-tertiary p-6 rounded-xl border border-theme">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <HardDrive className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted">Storage Used</p>
                    <p className="text-2xl font-bold text-theme-primary">{stats.storage_used}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-theme-tertiary p-4 rounded-xl border border-theme">
              <p className="text-sm text-theme-muted">
                <strong className="text-theme-secondary">API Endpoint:</strong> {API_URL}
              </p>
            </div>
          </div>
        )}

        {/* Save Button - Show for all tabs except system */}
        {activeTab !== 'system' && (
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
