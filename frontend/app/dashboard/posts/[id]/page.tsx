'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Clock, Tag, User, CheckCircle, XCircle, Trash2 } from 'lucide-react';

import ConfirmModal from '@/components/ConfirmModal';
import RejectionModal from '@/components/RejectionModal';
import PublishModal from '@/components/PublishModal';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/config/api';

export default function DashboardPostViewPage() {
  const router = useRouter();
  const { id } = useParams();
  const { showToast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (!id) return;

    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPost(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const initiateStatusUpdate = (status: string) => {
    setPendingStatus(status);
    if (status === 'REJECTED') {
      setShowRejectionModal(true);
    } else if (status === 'PUBLISHED') {
      setShowPublishModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmUpdate = async (reason?: string, platforms?: string[]) => {
    if (!pendingStatus) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/posts/${id}/status`, {
        status: pendingStatus,
        reason: reason,
        socialPlatforms: platforms
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh post data
      const res = await axios.get(`${API_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost(res.data);
      setShowConfirmModal(false);
      setShowRejectionModal(false);
      setShowPublishModal(false);

      showToast(`Post marked as ${pendingStatus}`, 'success');
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/posts/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Post deleted successfully', 'success');
      router.push('/dashboard/posts'); // Redirect to list
    } catch (err) {
      console.error(err);
      showToast('Failed to delete post', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!post) return (
    <div className="flex items-center justify-center h-96 text-slate-500">
      Post not found
    </div>
  );

  const isVideo = post.media_type === 'VIDEO';

  return (
    <div className="font-sans space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase
                ${post.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  post.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    post.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                {post.status}
              </span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.username}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Edit Button for Creator (if Rejected or Draft) */}
          {user?.role === 'CREATOR' && (post.status === 'REJECTED' || post.status === 'DRAFT') && (
            <Link href={`/dashboard/post-edit?id=${post.id}`} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200">
              <Edit className="w-4 h-4 mr-2" /> Edit & Resubmit
            </Link>
          )}

          {/* Admin/Manager Actions for Pending Posts */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && post.status === 'PENDING' && (
            <div className="flex items-center gap-3">
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setDeleteId(Number(id))}
                  className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              )}
              {post.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => initiateStatusUpdate('PUBLISHED')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg shadow-green-200"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </button>
                  <button
                    onClick={() => initiateStatusUpdate('REJECTED')}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-lg shadow-red-200"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
          {/* Media Column */}
          <div className={`lg:col-span-3 bg-black flex items-center justify-center p-0 relative group`}>
            {/* Blurred Backdrop */}
            <div className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl z-0" style={{ backgroundImage: `url(${API_URL}${post.media_path})` }}></div>

            {isVideo ? (
              <video src={`${API_URL}${post.media_path}`} controls className="w-full h-full max-h-[600px] object-contain relative z-10" />
            ) : (
              <img src={`${API_URL}${post.media_path}`} alt={post.title} className="w-full h-full max-h-[600px] object-contain relative z-10" />
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 p-8 bg-white border-l border-slate-100 flex flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Description
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">{post.content}</p>
              </div>

              {post.status === 'REJECTED' && post.rejection_reason && (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mt-8">
                  <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Rejection Reason
                  </h4>
                  <p className="text-red-700 text-sm leading-relaxed">{post.rejection_reason}</p>
                  <p className="text-xs text-red-500 mt-4 font-medium uppercase tracking-wide">Action Required</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => handleConfirmUpdate()}
        title='Approve Post'
        message={`Are you sure you want to mark this post as ${pendingStatus}?`}
        confirmText='Approve'
        isDestructive={false}
      />

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={(reason) => handleConfirmUpdate(reason)}
        title="Reject Post"
      />

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={(platforms) => handleConfirmUpdate(undefined, platforms)}
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
