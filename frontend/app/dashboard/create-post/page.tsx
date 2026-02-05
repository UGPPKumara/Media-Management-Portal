'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Upload, FileText, Image as ImageIcon, X, Loader2, Save, Send, AlertTriangle, Eye, Edit2 } from 'lucide-react';
import { API_URL } from '@/config/api';

import { Suspense } from 'react';

function CreatePostContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  const [existingMediaType, setExistingMediaType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(!!editId);
  const [dragActive, setDragActive] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [postStatus, setPostStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load existing post if in edit mode
  useEffect(() => {
    if (editId) {
      loadPost(editId);
    }
  }, [editId]);

  const loadPost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const post = res.data;

      // Only allow editing DRAFT or REJECTED posts
      if (!['DRAFT', 'REJECTED'].includes(post.status)) {
        alert('This post cannot be edited');
        router.push('/dashboard/my-posts');
        return;
      }

      setTitle(post.title);
      setContent(post.content || '');
      setExistingMediaUrl(post.media_path);
      setExistingMediaType(post.media_type);
      setPostStatus(post.status);
      setIsEditMode(true);
    } catch (err) {
      console.error('Failed to load post', err);
      alert('Failed to load post');
      router.push('/dashboard/my-posts');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
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

  const handleSubmitClick = () => {
    if (!file && !existingMediaUrl) return alert('Please select a file');
    if (!title) return alert('Please enter a title');
    setShowSubmitConfirm(true);
  };

  const submitPost = async (isDraft: boolean) => {
    if (!file && !existingMediaUrl) return alert('Please select a file');
    if (!title) return alert('Please enter a title');

    setLoading(true);
    setShowSubmitConfirm(false);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) {
      formData.append('media', file);
    }
    if (isDraft) {
      formData.append('isDraft', 'true');
    } else {
      formData.append('isDraft', 'false');
    }

    try {
      const token = localStorage.getItem('token');

      if (isEditMode && editId) {
        // Update existing post
        await axios.put(`${API_URL}/api/posts/${editId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new post
        await axios.post(`${API_URL}/api/posts`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      router.push('/dashboard/my-posts');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching post
  if (loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Determine which media to show
  const displayMediaUrl = previewUrl || (existingMediaUrl ? `${API_URL}${existingMediaUrl}` : null);
  const displayMediaType = file?.type || existingMediaType;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
            {isEditMode ? (
              <>
                <Edit2 className="w-8 h-8 text-blue-500" />
                Edit Post
              </>
            ) : (
              'Create Post'
            )}
          </h1>
          <p className="text-theme-secondary">
            {isEditMode
              ? postStatus === 'REJECTED'
                ? 'Edit your rejected post and resubmit for review'
                : 'Edit your draft and submit when ready'
              : 'Share your creativity with the world'
            }
          </p>
        </div>
        <Link
          href="/dashboard/my-posts"
          className="flex items-center gap-2 px-4 py-2 bg-theme-tertiary border border-theme text-theme-primary rounded-xl hover:bg-theme-hover transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View My Posts
        </Link>
      </div>

      {/* Status Badge for Edit Mode */}
      {isEditMode && postStatus && (
        <div className={`mb-6 p-4 rounded-xl border ${postStatus === 'REJECTED'
          ? 'bg-red-500/10 border-red-500/20'
          : 'bg-slate-500/10 border-slate-500/20'
          }`}>
          <p className={`text-sm font-medium ${postStatus === 'REJECTED' ? 'text-red-400' : 'text-slate-400'
            }`}>
            {postStatus === 'REJECTED'
              ? '⚠️ This post was rejected. Make changes and submit for review again.'
              : '📝 This is a draft. You can continue editing or submit for review.'
            }
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-card p-6 rounded-2xl shadow-sm border border-theme">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-theme-secondary mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-tertiary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-theme-primary placeholder:text-theme-muted"
                  placeholder="Give your post a catchy title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-theme-secondary mb-2">Description</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-tertiary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-40 resize-none text-theme-primary placeholder:text-theme-muted"
                  placeholder="Tell us about your masterpiece..."
                />
              </div>
            </div>
          </div>

          <div className="bg-theme-card p-6 rounded-2xl shadow-sm border border-theme">
            <label className="block text-sm font-semibold text-theme-secondary mb-4">
              Media Upload {isEditMode && existingMediaUrl && !file && '(Current media shown)'}
            </label>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-theme hover:border-indigo-500/50 hover:bg-theme-tertiary'
                } ${displayMediaUrl ? 'border-none p-0 overflow-hidden bg-slate-900' : ''}`}
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

              {displayMediaUrl ? (
                <div className="relative group">
                  {displayMediaType?.startsWith('video') || displayMediaType === 'VIDEO' ? (
                    <video src={displayMediaUrl} controls className="w-full max-h-[400px] mx-auto" />
                  ) : (
                    <img src={displayMediaUrl} alt="Preview" className="w-full max-h-[400px] object-contain mx-auto" />
                  )}
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {file ? (
                      <>
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-white/70">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <p className="text-sm font-medium">Current media - Click to change</p>
                    )}
                  </div>
                  {/* Change media button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-4 right-4 px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Change Media
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-16 h-16 bg-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-theme-primary">Click to upload or drag and drop</h3>
                  <p className="text-theme-muted mt-1">SVG, PNG, JPG or MP4 (max. 100MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-theme-card p-6 rounded-2xl shadow-sm border border-theme">
            <h3 className="text-lg font-bold text-theme-primary mb-4">Publishing Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleSubmitClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isEditMode ? 'Submit for Review' : 'Submit for Review'}
              </button>
              <button
                onClick={() => submitPost(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-theme-tertiary border-2 border-theme text-theme-primary rounded-xl font-bold hover:bg-theme-hover transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isEditMode ? 'Save Changes' : 'Save as Draft'}
              </button>
            </div>
            <p className="text-xs text-theme-muted mt-4 text-center">
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

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-md mx-4 border border-theme overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-theme bg-amber-500/10">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-theme-primary">Confirm Submission</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-theme-secondary">
                Are you sure you want to submit this post for review?
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-amber-400 text-sm font-medium">
                  ⚠️ Important: Once submitted, you <strong>cannot edit</strong> this post until it is reviewed.
                </p>
                <p className="text-amber-400/80 text-xs mt-2">
                  If rejected, you will be able to edit and resubmit. Consider saving as draft if you need more time.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-theme bg-theme-tertiary flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => submitPost(false)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium text-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePostContent />
    </Suspense>
  );
}
