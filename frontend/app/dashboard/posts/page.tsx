'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { getImageUrl } from '@/utils/imageUtils';
import { useToast } from '@/context/ToastContext';
import { Eye, Edit, Trash2, Filter, Plus, CheckCircle, XCircle, Clock, Send, X, AlertTriangle, Share2, Search, User } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_path: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  rejection_reason?: string;
  username: string;
  user_profile_picture?: string;
  created_at: string;
}

export default function PostsPage() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // ... existing states ...

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPostId, setRejectPostId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishPostId, setPublishPostId] = useState<string | null>(null);
  const [publishPlatforms, setPublishPlatforms] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchPosts();
    if (parsedUser.role === 'ADMIN' || parsedUser.role === 'MANAGER') {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  // ... existing useEffect (view param) ...

  // ... existing fetchPosts ...

  // Filter posts client-side for search and basic filtering
  // (Date filtering is handled by API usually, but for now let's do client side if manageable or pass to API if we modify fetchPosts)
  // The user wants "manage karaganna lesi" so let's do a robust client filter for the current loaded list
  const filteredPosts = posts.filter(post => {
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(post.created_at) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      matchesDate = matchesDate && new Date(post.created_at) <= endDate;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  useEffect(() => {
    // Check for deep linking view param
    const viewId = searchParams.get('view');
    if (viewId && posts.length > 0) {
      const post = posts.find(p => p.id === viewId);
      if (post) {
        setViewPost(post);
      }
    }
  }, [posts, searchParams]);

  const fetchPosts = async (status?: string) => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/posts`;
      if (status && status !== 'ALL') {
        url += `?status=${status}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setLoading(true);
    fetchPosts(status);
  };

  const handleStatusUpdate = async (postId: string, newStatus: string, reason?: string, socialPlatforms?: string[]) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/posts/${postId}/status`,
        { status: newStatus, reason, socialPlatforms },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Close modal and reset if needed
      if (newStatus === 'REJECTED') {
        closeRejectModal();
      }
      if (newStatus === 'PUBLISHED') {
        closePublishModal();
      }

      showToast(`Post status updated to ${newStatus}`, 'success');
      fetchPosts(statusFilter);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = (postId: string) => {
    setDeleteConfirmId(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/posts/${deleteConfirmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Post deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeleteConfirmId(null);
      fetchPosts(statusFilter);
    } catch (err) {
      showToast('Failed to delete post', 'error');
    }
  };

  const openRejectModal = (postId: string) => {
    setRejectPostId(postId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectPostId(null);
    setRejectionReason('');
  };

  const confirmRejection = () => {
    if (rejectPostId && rejectionReason.trim()) {
      handleStatusUpdate(rejectPostId, 'REJECTED', rejectionReason);
    } else {
      showToast('Please enter a rejection reason', 'error');
    }
  };

  // Publish Modal Handlers
  const openPublishModal = (postId: string) => {
    setPublishPostId(postId);
    setPublishPlatforms([]);
    setShowPublishModal(true);
  };

  const closePublishModal = () => {
    setShowPublishModal(false);
    setPublishPostId(null);
    setPublishPlatforms([]);
    setPublishing(false);
  };

  const togglePlatform = (platform: string) => {
    setPublishPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const confirmPublish = async () => {
    if (!publishPostId) return;
    setPublishing(true);
    await handleStatusUpdate(publishPostId, 'PUBLISHED', undefined, publishPlatforms);
    setPublishing(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      REJECTED: 'bg-red-100 text-red-700',
      PUBLISHED: 'bg-green-100 text-green-700'
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.DRAFT}`;
  };

  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">
            {isManager ? 'Content Management' : 'My Posts'}
          </h1>
          <p className="text-theme-secondary text-sm mt-1">
            {isManager ? 'Review and manage all submitted content' : 'View and manage your posts'}
          </p>
        </div>

        {user?.role === 'CREATOR' && (
          <Link
            href="/dashboard/create-post"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" /> Create Post
          </Link>
        )}
      </div>

      {/* Metrics Cards (Manager Only) */}
      {isManager && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-theme-card p-4 rounded-xl border border-theme shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Filter className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-theme-secondary text-sm font-medium">Total Posts</span>
            </div>
            <p className="text-2xl font-bold text-theme-primary">{stats.total_posts}</p>
          </div>
          <div className="bg-theme-card p-4 rounded-xl border border-theme shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-theme-secondary text-sm font-medium">Pending Review</span>
            </div>
            <p className="text-2xl font-bold text-theme-primary">{stats.pending_posts}</p>
          </div>
          <div className="bg-theme-card p-4 rounded-xl border border-theme shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-theme-secondary text-sm font-medium">Published</span>
            </div>
            <p className="text-2xl font-bold text-theme-primary">{stats.published_posts}</p>
          </div>
          {/* You could add Total Users or another metric here */}
          <div className="bg-theme-card p-4 rounded-xl border border-theme shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-theme-secondary text-sm font-medium">Total Creators</span>
            </div>
            <p className="text-2xl font-bold text-theme-primary">{stats.total_users}</p>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="bg-theme-card p-4 rounded-xl border border-theme space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'DRAFT'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-hover'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search & Date */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Search title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-sm text-theme-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-theme-muted">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-sm text-theme-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      {filteredPosts.length === 0 ? (
        <div className="bg-theme-card rounded-xl p-12 text-center border border-theme">
          <p className="text-theme-muted mb-4">No posts found</p>
          {user?.role === 'CREATOR' && (
            <Link href="/dashboard/create-post" className="text-indigo-500 font-medium hover:underline">
              Create your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-theme-card border border-theme rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-theme-tertiary text-theme-secondary text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4 w-20">Media</th>
                  <th className="p-4 min-w-[200px]">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-theme-tertiary transition-colors group">
                    {/* Media Thumbnail */}
                    <td className="p-4">
                      <div
                        className="w-16 h-12 rounded-lg overflow-hidden bg-theme-tertiary border border-theme cursor-pointer relative"
                        onClick={() => setViewPost(post)}
                      >
                        {post.media_type === 'VIDEO' ? (
                          <video src={getImageUrl(post.media_path)} className="w-full h-full object-cover" />
                        ) : (
                          <img src={getImageUrl(post.media_path)} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="p-4">
                      <p className="font-medium text-theme-primary truncate max-w-[250px]">{post.title}</p>
                      {post.status === 'REJECTED' && post.rejection_reason && (
                        <div className="mt-1 text-xs text-red-400 flex items-center gap-1">
                          <span className="font-semibold">Reason:</span> {post.rejection_reason}
                        </div>
                      )}
                    </td>

                    {/* Author */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-xs font-bold">
                          {post.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-theme-secondary">{post.username}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                        {post.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-sm text-theme-secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>

                    {/* Views */}
                    <td className="p-4 text-center text-sm font-medium text-theme-primary">
                      0
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewPost(post)}
                          className="p-2 text-theme-muted hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(user?.role === 'ADMIN' || (user?.role === 'CREATOR' && post.status === 'DRAFT')) && (
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-theme-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Manager Actions */}
                        {isManager && post.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(post.id, 'APPROVED')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(post.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {isManager && post.status === 'APPROVED' && (
                          <button
                            onClick={() => openPublishModal(post.id)}
                            className="ml-2 flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                          >
                            <Send className="w-3 h-3" /> Publish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-theme flex flex-col md:flex-row relative">
            <button
              onClick={() => setViewPost(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Side */}
            <div className="w-full md:w-2/3 bg-black flex items-center justify-center bg-theme-tertiary">
              {viewPost.media_type === 'VIDEO' ? (
                <video controls src={getImageUrl(viewPost.media_path)} className="max-h-[60vh] md:max-h-full w-full object-contain" />
              ) : (
                <img src={getImageUrl(viewPost.media_path)} alt="" className="max-h-[60vh] md:max-h-full w-full object-contain" />
              )}
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/3 flex flex-col bg-theme-card border-l border-theme">
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {viewPost.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-primary">{viewPost.username}</h3>
                    <p className="text-xs text-theme-muted">{new Date(viewPost.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-theme-primary mb-2 line-clamp-2">{viewPost.title}</h2>
                  <span className={`inline-block mb-4 ${getStatusBadge(viewPost.status)}`}>
                    {viewPost.status}
                  </span>
                  <div className="whitespace-pre-wrap text-theme-secondary text-sm">
                    {viewPost.content}
                  </div>
                </div>

                {viewPost.status === 'REJECTED' && viewPost.rejection_reason && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                    <h4 className="text-sm font-semibold text-red-500 mb-1">Rejection Reason:</h4>
                    <p className="text-sm text-red-400">{viewPost.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-theme bg-theme-tertiary">
                <div className="flex flex-col gap-2">
                  {isManager && viewPost.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleStatusUpdate(viewPost.id, 'APPROVED')}
                        className="py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setViewPost(null); // Close view modal
                          openRejectModal(viewPost.id); // Open reject modal
                        }}
                        className="py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {isManager && viewPost.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setViewPost(null);
                        openPublishModal(viewPost.id);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Publish Now
                    </button>
                  )}

                  {isManager && viewPost.status === 'REJECTED' && (
                    <div className="text-center text-xs text-theme-muted">
                      This post has been rejected.
                    </div>
                  )}

                  {/* Creator Action */}
                  {(user?.role === 'CREATOR' && (viewPost.status === 'DRAFT' || viewPost.status === 'REJECTED')) && (
                    <Link
                      href={`/dashboard/create-post?edit=${viewPost.id}`}
                      className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit Post
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-md border border-theme transform transition-all scale-100">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-full">
                  <Share2 className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-theme-primary">Publish Post</h3>
                  <p className="text-xs text-theme-muted">Select platforms to publish to</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${publishPlatforms.includes('FACEBOOK') ? 'bg-blue-500/10 border-blue-500' : 'bg-theme-tertiary border-transparent hover:border-theme'}`}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-transparent"
                    checked={publishPlatforms.includes('FACEBOOK')}
                    onChange={() => togglePlatform('FACEBOOK')}
                  />
                  <span className="font-medium text-theme-primary flex items-center gap-2">
                    <span className="text-blue-500">Facebook</span>
                  </span>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${publishPlatforms.includes('WHATSAPP') ? 'bg-green-500/10 border-green-500' : 'bg-theme-tertiary border-transparent hover:border-theme'}`}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 bg-transparent"
                    checked={publishPlatforms.includes('WHATSAPP')}
                    onChange={() => togglePlatform('WHATSAPP')}
                  />
                  <span className="font-medium text-theme-primary flex items-center gap-2">
                    <span className="text-green-500">WhatsApp</span>
                  </span>
                </label>
              </div>

              <div className="p-3 bg-theme-tertiary rounded-xl text-xs text-theme-secondary">
                <p>The post will be marked as <strong>PUBLISHED</strong> internally.</p>
                {publishPlatforms.length > 0 && (
                  <p className="mt-1 text-green-500">Included: {publishPlatforms.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-theme-tertiary border-t border-theme rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closePublishModal}
                disabled={publishing}
                className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                disabled={publishing}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-500 hover:to-violet-500 transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                {publishing ? 'Publishing...' : 'Confirm Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-md border border-theme transform transition-all scale-100">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary">Reject Post</h3>
              </div>

              <p className="text-theme-secondary text-sm mb-4">
                Please provide a reason for rejecting this post. This will be sent to the creator.
              </p>

              <textarea
                className="w-full bg-theme-tertiary border border-theme rounded-xl p-3 text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              ></textarea>
            </div>

            <div className="px-6 py-4 bg-theme-tertiary border-t border-theme rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-500/20"
              >
                Reject Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-sm border border-theme transform transition-all scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2">Delete Post?</h3>
              <p className="text-theme-secondary text-sm">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-theme-tertiary border-t border-theme rounded-b-2xl flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary transition bg-theme-card border border-theme rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
