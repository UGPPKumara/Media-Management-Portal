'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { API_URL } from '@/config/api';

function EditPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({ title: res.data.title, content: res.data.content });
      } catch (err) {
        console.error(err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/posts/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/post-view?id=${id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to update post');
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-primary p-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/post-view?id=${id}`} className="flex items-center text-theme-secondary hover:text-indigo-500 mb-6 w-fit transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Post
        </Link>

        <div className="bg-theme-card rounded-2xl shadow-lg p-8 border border-theme">
          <h1 className="text-2xl font-bold mb-6 text-theme-primary">Edit Post</h1>

          {error && <div className="mb-4 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-theme-secondary font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-theme p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary"
                required
              />
            </div>

            <div>
              <label className="block text-theme-secondary font-medium mb-2">Description</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-theme p-3 rounded-xl h-40 focus:ring-2 focus:ring-indigo-500 outline-none bg-theme-secondary text-theme-primary resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition flex items-center font-medium disabled:opacity-50 shadow-lg shadow-indigo-500/30"
              >
                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PostEditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-theme-primary"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <EditPostContent />
    </Suspense>
  );
}
