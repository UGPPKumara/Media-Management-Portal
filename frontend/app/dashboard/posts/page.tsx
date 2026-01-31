'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Filter, Eye, CheckCircle, XCircle, Download, Facebook, Share2, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import RejectionModal from '@/components/RejectionModal';
import PublishModal from '@/components/PublishModal';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/config/api';

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // Default to Pending for managers
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { showToast } = useToast();

  // Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{ id: number, status: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed.role === 'ADMIN' || parsed.role === 'MANAGER') {
        fetchUsersList();
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filter, userFilter, startDate, endDate]);

  const fetchUsersList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let query = `?status=${filter === 'ALL' ? '' : filter}`;
      if (userFilter !== 'ALL') {
        query += `&user_id=${userFilter}`;
      }
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await axios.get(`${API_URL}/api/posts${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initiateStatusUpdate = (id: number, status: string) => {
    setModalAction({ id, status });
    if (status === 'REJECTED') {
      setIsRejectionModalOpen(true);
    } else if (status === 'PUBLISHED') {
      setIsPublishModalOpen(true);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmAction = async (reason?: string, platforms?: string[]) => {
    if (!modalAction) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/posts/${modalAction.id}/status`, {
        status: modalAction.status,
        reason: reason,
        socialPlatforms: platforms
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts(); // Refresh
      setModalAction(null);
      setIsConfirmModalOpen(false);
      setIsRejectionModalOpen(false);
      setIsPublishModalOpen(false);

      showToast(`Post marked as ${modalAction.status}`, 'success');
      if (platforms && platforms.length > 0) {
        setTimeout(() => {
          showToast(`Published to ${platforms.join(', ')}`, 'success');
        }, 800);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  // Social Publish Modal State
  const [socialPublishId, setSocialPublishId] = useState<number | null>(null);

  const handlePublishToSocials = (id: number) => {
    setSocialPublishId(id);
  };

  const confirmPublishToSocials = async () => {
    if (!socialPublishId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/posts/${socialPublishId}/publish`,
        { platform: 'FACEBOOK' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Successfully published to Facebook!', 'success');
      fetchPosts();
      setSocialPublishId(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to publish', 'error');
    }
  };

  // Delete Logic
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/posts/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Post deleted successfully', 'success');
      fetchPosts();
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete post', 'error');
    }
  };

  const handleDownloadMedia = async (mediaPath: string, filename: string) => {
    try {
      const response = await fetch(`${API_URL}${mediaPath}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      // Fallback to direct link
      window.open(`${API_URL}${mediaPath}`, '_blank');
    }
  };



  const downloadCSV = () => {
    if (posts.length === 0) return;

    // CSV Header
    const headers = ['Post Title', 'Author', 'Date Submitted', 'Status'];
    const rows = posts.map(post => [
      `"${post.title.replace(/"/g, '""')}"`, // Escape quotes
      post.username,
      new Date(post.created_at).toLocaleDateString(),
      post.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `posts_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'ALL', label: 'All Posts' },
    { id: 'PENDING', label: 'Pending Review' },
    { id: 'PUBLISHED', label: 'Published' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'DRAFT', label: 'Drafts' },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {user?.role === 'ADMIN' || user?.role === 'MANAGER' ? 'Post Management' : 'My Content'}
          </h1>
          <p className="text-slate-500">
            {user?.role === 'ADMIN' || user?.role === 'MANAGER'
              ? 'Review, approve, or reject content submissions'
              : 'Manage and track the status of your posts'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Date Filter */}
          <div className="flex gap-2 items-center bg-white p-1 rounded-lg border border-gray-200">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-sm outline-none text-gray-600 font-medium"
            />
            <span className="text-gray-300">|</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 text-sm outline-none text-gray-600 font-medium"
            />
          </div>

          {/* User Filter Dropdown */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">All Users</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <button
              onClick={downloadCSV}
              disabled={posts.length === 0}
              className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          )}

          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading posts...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Post Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Date Submited</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No posts found in this category.</td></tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900 truncate max-w-xs">{post.title}</p>
                    </td>
                    <td className="p-4 font-normal text-slate-600">
                      {post.username}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {(post.status === 'DRAFT' || !post.status) && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          DRAFT
                        </span>
                      )}
                      {post.status && post.status !== 'DRAFT' && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                          ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                            post.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-600'}`}>
                          {post.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      {/* Edit Button for Drafts/Rejected */}
                      {((post.status === 'DRAFT' || !post.status) || post.status === 'REJECTED') && (user?.id === post.user_id) && (
                        <Link
                          href={`/dashboard/post-edit?id=${post.id}`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}

                      <Link
                        href={`/dashboard/posts/${post.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.id === post.user_id) && (
                        <>
                          {/* Social Publish Button */}
                          {post.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handlePublishToSocials(post.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Publish to Facebook"
                            >
                              <Facebook className="w-4 h-4" />
                            </button>
                          )}

                          {/* Download Button */}
                          <button
                            onClick={() => handleDownloadMedia(post.media_path, post.title)}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Download Media"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Delete Button (Admin OR Owner of Draft) */}
                          {(user?.role === 'ADMIN' || (user?.id === post.user_id && post.status === 'DRAFT')) && (
                            <button
                              onClick={() => setDeleteId(post.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && post.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => initiateStatusUpdate(post.id, 'PUBLISHED')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => initiateStatusUpdate(post.id, 'REJECTED')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => handleConfirmAction()}
        title={modalAction?.status === 'PUBLISHED' ? 'Approve Post' : 'Update Status'}
        message={`Are you sure you want to mark this post as ${modalAction?.status}?`}
        confirmText="Confirm"
        isDestructive={modalAction?.status === 'REJECTED'}
      />

      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onConfirm={(reason) => handleConfirmAction(reason)}
        title="Reject Post"
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={(platforms) => handleConfirmAction(undefined, platforms)}
      />

      <ConfirmModal
        isOpen={!!socialPublishId}
        onClose={() => setSocialPublishId(null)}
        onConfirm={confirmPublishToSocials}
        title="Publish to Social Media"
        message="Are you sure you want to publish this post to the connected Facebook Page?"
        confirmText="Publish Now"
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
