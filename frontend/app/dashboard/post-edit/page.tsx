'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, Loader2, Save, Send, Image as ImageIcon, Video, ArrowLeft } from 'lucide-react';
import { API_URL } from '@/config/api';

function PostEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) {
      alert('No post ID provided');
      router.push('/dashboard');
      return;
    }
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const post = res.data;
      setTitle(post.title);
      setContent(post.content);
      // For existing media, we set the preview URL to the backend path
      setPreviewUrl(`${API_URL}${post.media_path}`);
      // Note: We can't set the 'file' state object from a URL, so 'file' remains null 
      // unless user uploads a new one. Backend should handle keeping existing file if no new media sent.
    } catch (err) {
      console.error(err);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitPost = async (isDraft: boolean) => {
    if (!title) return alert('Please enter a title');

    setSubmitting(true);

    // Use FormData for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) {
      formData.append('media', file);
    }
    formData.append('isDraft', isDraft.toString());

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/posts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Edit Post</h1>
          <p className="text-slate-500">Refine your content for submission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Give your post a catchy title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-40 resize-none"
                  placeholder="Tell us about your masterpiece..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <label className="block text-sm font-semibold text-slate-700 mb-4">Media (Optional update)</label>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-0 overflow-hidden text-center transition-all 
                ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-slate-50'}
                ${previewUrl ? 'border-none p-0 bg-slate-900' : 'p-12'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*"
              />

              {previewUrl ? (
                <div className="relative group">
                  {previewUrl.endsWith('.mp4') || (file && file.type.startsWith('video')) ? (
                    <video src={previewUrl} controls className="w-full max-h-[400px] mx-auto" />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full max-h-[400px] object-contain mx-auto" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Click to upload or drag and drop</h3>
                  <p className="text-slate-500 mt-1">Updates the existing media</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => submitPost(false)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Submit for Review
              </button>
              <button
                onClick={() => submitPost(true)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-800 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <PostEditForm />
    </Suspense>
  )
}
