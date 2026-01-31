'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import { Camera, Save, Loader2, Building, Shield } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: '',
    logo_url: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // We handle text update here, logo is handled separately immediately on file select? 
    // Or we can submit both? Let's submit both. But file input needs to be part of FormData if we want one button.
    // For simplicity, let's keep logo separate or FormData approach.
    // Let's use FormData for everything.

    // Ah, my backend expects 'logo' file and 'company_name' text. 
    // But if I want to update name without logo, I need to handle that.
    // My backend `updateSettings` handles optional logo.

    // BUT, backend uses `upload.single('logo')`. If no file, req.file is undefined.

    const formData = new FormData();
    formData.append('company_name', settings.company_name);
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
      // Force reload to update sidebar/other components if they don't value context
      // Or we can just refetch. Sidebar won't update automatically unless we use a Context for Settings.
      // For now, let's just alert user or reload window.
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
      // Preview
      const url = URL.createObjectURL(file);
      setSettings(prev => ({ ...prev, logo_url: url }));
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Shield className="w-12 h-12 mb-4 text-gray-300" />
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Company Settings</h1>
        <p className="text-slate-500">Manage branding and company details</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Logo Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Company Logo</h2>
            <div className="flex items-center gap-6">
              <div className="relative group w-32 h-32 bg-slate-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden hover:border-indigo-400 transition-colors">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url.startsWith('blob:') ? settings.logo_url : `${API_URL}${settings.logo_url}`}
                    alt="Company Logo"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Building className="w-8 h-8 text-slate-300" />
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
              <div className="text-sm text-slate-500">
                <p>Click to upload a new logo.</p>
                <p>Recommended size: 200x200px</p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">General Information</h2>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                placeholder="My Company"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-50">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
