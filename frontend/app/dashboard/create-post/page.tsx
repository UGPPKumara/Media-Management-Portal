'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Image as ImageIcon, Video, X, Loader2, Save, Send } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitPost = async (isDraft: boolean) => {
    if (!file) return alert('Please select a file');
    if (!title) return alert('Please enter a title');

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('media', file);
    if (isDraft) formData.append('isDraft', 'true');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Create Post</h1>
          <p className="text-slate-500">Share your creativity with the world</p>
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-slate-700 mb-4">Media Upload</label>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-slate-50'
                } ${previewUrl ? 'border-none p-0 overflow-hidden bg-slate-900' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
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
                  {file?.type.startsWith('image') ? (
                    <img src={previewUrl} alt="Preview" className="w-full max-h-[400px] object-contain mx-auto" />
                  ) : (
                    <video src={previewUrl} controls className="w-full max-h-[400px] mx-auto" />
                  )}
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium truncate">{file?.name}</p>
                    <p className="text-xs text-white/70">{(file!.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Click to upload or drag and drop</h3>
                  <p className="text-slate-500 mt-1">SVG, PNG, JPG or MP4 (max. 100MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Publishing Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => submitPost(false)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Submit for Review
              </button>
              <button
                onClick={() => submitPost(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-800 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Save as Draft
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              By submitting, you agree to our Content Policy.
            </p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Pro Tip</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  High-quality thumbnails attract 40% more views. Ensure your media is clear and well-lit!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
