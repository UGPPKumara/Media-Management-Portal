'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { getImageUrl } from '@/utils/imageUtils';
import { useToast } from '@/context/ToastContext';
import { useSearchParams } from 'next/navigation';
import {
  FileText, Filter, Plus, Eye, Edit2, RotateCcw, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, X, Save, Upload, Image as ImageIcon, RefreshCw, MessageSquare
} from 'lucide-react';

type Post = {
  id: string;
  title: string;
  content: string;
  media_path: string;
  media_type: string;
  status: string;
  rejection_reason?: string;
  views: number;
  created_at: string;
  updated_at: string;
};

import { Suspense } from 'react';

function MyPostsContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Modals
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchPosts(parsed.id);
      fetchStats();
    }
  }, []);

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(p => p.status === filter));
    }

    // Check for deep linking view param
    const viewId = searchParams.get('view');
    if (viewId && posts.length > 0) {
      const post = posts.find(p => p.id === viewId);
      if (post) {
        setViewPost(post);
      }
    }
  }, [posts, filter, searchParams]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/user-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchPosts = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/users/${userId}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
      setFilteredPosts(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openView = (post: Post) => setViewPost(post);
  const closeView = () => setViewPost(null);

  // Navigate to create-post page in edit mode
  const openEdit = (post: Post) => {
    window.location.href = `/dashboard/create-post?edit=${post.id}`;
  };

  const closeEdit = () => {
    setEditPost(null);
    setNewFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    if (!editPost) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('content', editForm.content);
      if (newFile) {
        formData.append('media', newFile);
      }

      await axios.put(`${API_URL}/api/posts/${editPost.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast('Post updated successfully', 'success');
      closeEdit();
      fetchPosts(user.id);
    } catch (err) {
      console.error(err);
      showToast('Failed to update post', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResubmit = async (post: Post) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/posts/${post.id}/resubmit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Post resubmitted for review', 'success');
      fetchPosts(user.id);
    } catch (err) {
      console.error(err);
      showToast('Failed to resubmit', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/posts/${deletePostId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Post deleted', 'success');
      setDeletePostId(null);
      fetchPosts(user.id);
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-green-500/20 text-green-500',
    PENDING: 'bg-yellow-500/20 text-yellow-500',
    APPROVED: 'bg-blue-500/20 text-blue-500',
    REJECTED: 'bg-red-500/20 text-red-500',
    DRAFT: 'bg-gray-500/20 text-gray-400'
  };

  const statusIcons: Record<string, any> = {
    PUBLISHED: <CheckCircle className="w-3 h-3" />,
    PENDING: <Clock className="w-3 h-3" />,
    APPROVED: <CheckCircle className="w-3 h-3" />,
    REJECTED: <XCircle className="w-3 h-3" />,
    DRAFT: <FileText className="w-3 h-3" />
  };

  const filters = ['ALL', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'DRAFT'];

  const statCounts = {
    ALL: posts.length,
    PENDING: posts.filter(p => p.status === 'PENDING').length,
    APPROVED: posts.filter(p => p.status === 'APPROVED').length,
    PUBLISHED: posts.filter(p => p.status === 'PUBLISHED').length,
    REJECTED: posts.filter(p => p.status === 'REJECTED').length,
    DRAFT: posts.filter(p => p.status === 'DRAFT').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">My Posts</h1>
          <p className="text-theme-secondary">View and manage your posts</p>
        </div>
        <Link
          href="/dashboard/create-post"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/30"
        >
          <Plus className="w-4 h-4" /> Create Post
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-theme-card p-4 rounded-xl border border-theme hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Today</p>
                <p className="text-2xl font-bold text-theme-primary mt-1">{stats.today || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-theme-card p-4 rounded-xl border border-theme hover:border-violet-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-theme-muted font-semibold uppercase tracking-wider">This Week</p>
                <p className="text-2xl font-bold text-theme-primary mt-1">{stats.thisWeek || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-500">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-theme-card p-4 rounded-xl border border-theme hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-theme-primary mt-1">{stats.total || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-theme-card p-4 rounded-xl border border-theme hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Published</p>
                <p className="text-2xl font-bold text-green-500 mt-1">{stats.published || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-green-500">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-theme-card p-4 rounded-xl border border-theme hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-theme-card p-4 rounded-xl border border-theme hover:border-slate-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Drafts</p>
                <p className="text-2xl font-bold text-slate-400 mt-1">{stats.drafts || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-500">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-theme-card p-4 rounded-xl border border-theme">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-theme-muted" />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-hover'
                }`}
            >
              {f} ({statCounts[f as keyof typeof statCounts]})
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-theme-card border border-theme rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-theme-tertiary text-theme-secondary text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 w-20">Media</th>
                <th className="p-4 min-w-[200px]">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-theme-muted">Loading posts...</td></tr>
              ) : filteredPosts.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-theme-muted">No posts found</td></tr>
              ) : (
                filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-theme-tertiary transition-colors">
                    {/* Thumbnail */}
                    <td className="p-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-theme-tertiary border border-theme">
                        {post.media_path ? (
                          post.media_type?.startsWith('video') ? (
                            <video src={getImageUrl(post.media_path)} className="w-full h-full object-cover" />
                          ) : (
                            <img src={getImageUrl(post.media_path)} alt="" className="w-full h-full object-cover" />
                          )

                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-theme-muted">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Title + Rejection Reason */}
                    <td className="p-4">
                      <p className="font-medium text-theme-primary truncate max-w-[250px]">{post.title}</p>
                      {post.status === 'REJECTED' && post.rejection_reason && (
                        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.rejection_reason}
                        </p>
                      )}
                    </td>
                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {statusIcons[post.status]}
                        {post.status}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="p-4 text-sm text-theme-secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    {/* Views */}
                    <td className="p-4 text-center text-sm font-medium text-theme-primary">
                      {post.views || 0}
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openView(post)} className="p-2 text-theme-muted hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Edit - Only for DRAFT and REJECTED */}
                        {['DRAFT', 'REJECTED'].includes(post.status) ? (
                          <button onClick={() => openEdit(post)} className="p-2 text-theme-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button disabled className="p-2 text-theme-muted/30 cursor-not-allowed rounded-lg" title="Cannot edit submitted posts">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {post.status === 'REJECTED' && (
                          <button onClick={() => handleResubmit(post)} className="p-2 text-theme-muted hover:text-green-500 hover:bg-green-500/10 rounded-lg" title="Resubmit">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {/* Delete - Only for DRAFT */}
                        {post.status === 'DRAFT' ? (
                          <button onClick={() => setDeletePostId(post.id)} className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button disabled className="p-2 text-theme-muted/30 cursor-not-allowed rounded-lg" title="Cannot delete submitted posts">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-theme flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary">View Post</h2>
              <button onClick={closeView} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Media */}
              {viewPost.media_path && (
                <div className="rounded-xl overflow-hidden bg-black">
                  {viewPost.media_type?.startsWith('video') ? (
                    <video src={getImageUrl(viewPost.media_path)} controls className="w-full max-h-80 object-contain" />
                  ) : (
                    <img src={getImageUrl(viewPost.media_path)} alt="" className="w-full max-h-80 object-contain" />
                  )}
                </div>
              )}
              {/* Title */}
              <h3 className="text-xl font-bold text-theme-primary">{viewPost.title}</h3>
              {/* Status */}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[viewPost.status]}`}>
                {statusIcons[viewPost.status]}
                {viewPost.status}
              </span>
              {/* Rejection Reason */}
              {viewPost.status === 'REJECTED' && viewPost.rejection_reason && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                  <p className="text-red-400 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Rejection Reason:</strong> {viewPost.rejection_reason}</span>
                  </p>
                </div>
              )}
              {/* Content */}
              <div className="text-theme-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {viewPost.content}
              </div>
              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-theme-muted pt-4 border-t border-theme">
                <span>Created: {new Date(viewPost.created_at).toLocaleString()}</span>
                <span>Views: {viewPost.views || 0}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-theme bg-theme-tertiary flex justify-end gap-3">
              {viewPost.status === 'REJECTED' && (
                <button
                  onClick={() => { closeView(); openEdit(viewPost); }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                >
                  Edit & Resubmit
                </button>
              )}
              <button onClick={closeView} className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-theme flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-500" />
                Edit Post
              </h2>
              <button onClick={closeEdit} className="p-2 text-theme-muted hover:text-theme-primary rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Current/New Media */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-secondary">Media</label>
                <div className="flex gap-4 items-start">
                  {/* Current Image */}
                  <div className="w-32 h-24 rounded-lg overflow-hidden bg-theme-tertiary border border-theme flex-shrink-0">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : editPost.media_path ? (
                      editPost.media_type?.startsWith('video') ? (
                        <video src={getImageUrl(editPost.media_path)} className="w-full h-full object-cover" />
                      ) : (
                        <img src={getImageUrl(editPost.media_path)} alt="" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-muted">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  {/* Upload New */}
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-theme rounded-xl cursor-pointer hover:bg-theme-tertiary transition-colors">
                      <Upload className="w-6 h-6 text-theme-muted mb-1" />
                      <span className="text-xs text-theme-muted">Click to change image/video</span>
                      <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-theme rounded-xl bg-theme-secondary text-theme-primary focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-theme-secondary">Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-theme rounded-xl bg-theme-secondary text-theme-primary focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Rejection Warning */}
              {editPost.status === 'REJECTED' && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                  <p className="text-amber-400 text-sm">
                    <strong>Note:</strong> After saving, use the Resubmit button to send for review again.
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-theme bg-theme-tertiary flex justify-end gap-3">
              <button onClick={closeEdit} className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg disabled:opacity-50 font-medium text-sm"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-md mx-4 border border-theme">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-theme">
              <div className="p-2 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-theme-primary">Delete Post</h3>
            </div>
            <div className="p-6">
              <p className="text-theme-secondary">Are you sure you want to delete this post? This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-theme bg-theme-tertiary flex justify-end gap-3">
              <button onClick={() => setDeletePostId(null)} className="px-4 py-2 text-sm font-medium text-theme-secondary">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyPostsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPostsContent />
    </Suspense>
  );
}
