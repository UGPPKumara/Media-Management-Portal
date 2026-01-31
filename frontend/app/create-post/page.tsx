'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('media', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('media', file);
    formData.append('isDraft', 'true');

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded h-32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Media (Image/Video)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
            accept="image/*,video/*"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleDraft}
            disabled={loading}
            className="flex-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-600 disabled:bg-gray-400"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
