'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { Eye, Edit, Trash2, Filter, Plus, CheckCircle, XCircle, Clock, Send } from 'lucide-react';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchPosts();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setLoading(true);
    fetchPosts(status);
  };

  const handleStatusUpdate = async (postId: string, newStatus: string, reason?: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/posts/${postId}/status`,
        { status: newStatus, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts(statusFilter);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts(statusFilter);
    } catch (err) {
      alert('Failed to delete post');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isManager ? 'Content Management' : 'My Posts'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-wrap gap-2">
        <Filter className="w-5 h-5 text-gray-400 mr-2" />
        {['ALL', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'DRAFT'].map(status => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-400 mb-4">No posts found</p>
          {user?.role === 'CREATOR' && (
            <Link href="/dashboard/create-post" className="text-indigo-600 font-medium hover:underline">
              Create your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {post.media_type === 'VIDEO' ? (
                  <video
                    src={`${API_URL}${post.media_path}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={`${API_URL}${post.media_path}`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                )}
                <span className={`absolute top-3 right-3 ${getStatusBadge(post.status)}`}>
                  {post.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.content}</p>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>By {post.username}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                {post.status === 'REJECTED' && post.rejection_reason && (
                  <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
                    Reason: {post.rejection_reason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex gap-2">
                  <Link
                    href={`/post-view?id=${post.id}`}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {(user?.role === 'CREATOR' && (post.status === 'DRAFT' || post.status === 'REJECTED')) && (
                    <Link
                      href={`/dashboard/post-edit?id=${post.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  )}

                  {(user?.role === 'ADMIN' || (user?.role === 'CREATOR' && post.status === 'DRAFT')) && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Manager Actions */}
                {isManager && post.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStatusUpdate(post.id, 'APPROVED')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason !== null) handleStatusUpdate(post.id, 'REJECTED', reason);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isManager && post.status === 'APPROVED' && (
                  <button
                    onClick={() => handleStatusUpdate(post.id, 'PUBLISHED')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                  >
                    <Send className="w-3 h-3" /> Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
