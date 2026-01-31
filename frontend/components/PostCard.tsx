'use client';

import { useState } from 'react';
import axios from 'axios';
import { Download, CheckCircle, XCircle, Share2, AlertCircle, Copy } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_path: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  rejection_reason?: string;
  username: string; // Creator
}

interface PostCardProps {
  post: Post;
  userRole: string; // 'CREATOR' | 'MANAGER' | 'ADMIN'
  onStatusChange: () => void;
}

export default function PostCard({ post, userRole, onStatusChange }: PostCardProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    let reason = '';
    if (status === 'REJECTED') {
      const input = prompt('Enter rejection reason:');
      if (input === null) return; // Cancelled
      reason = input;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/posts/${post.id}/status`,
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStatusChange();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    // Basic share link logic 
    const text = encodeURIComponent(`${post.title} - ${post.content}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const isManager = ['MANAGER', 'ADMIN'].includes(userRole);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>
          <p className="text-sm text-gray-500 mt-1">By <span className="font-medium text-gray-700">{post.username}</span></p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold h-fit ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
          post.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
            post.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
          }`}>
          {post.status}
        </span>
      </div>

      <div className="p-4">
        {post.media_type === 'VIDEO' ? (
          <video src={`http://localhost:5000${post.media_path}`} controls className="w-full max-h-96 object-contain bg-black" />
        ) : (
          <img src={`http://localhost:5000${post.media_path}`} alt={post.title} className="w-full max-h-96 object-contain" />
        )}
        <p className="mt-4 text-gray-700 whitespace-pre-wrap">{post.content}</p>

        {post.status === 'REJECTED' && post.rejection_reason && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
            <strong>Rejection Reason:</strong> {post.rejection_reason}
          </div>
        )}
      </div>

      {isManager && (
        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-wrap gap-2 justify-between items-center">
          {/* Download */}
          <a href={`http://localhost:5000${post.media_path}`} download className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">
            <Download size={16} /> Download
          </a>

          {/* Copy Text */}
          <button
            onClick={() => navigator.clipboard.writeText(post.title + "\n\n" + post.content)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            <Copy size={16} /> Copy Text
          </button>

          {/* Status Actions */}
          <div className="flex gap-2">
            {post.status === 'PENDING' && (
              <>
                <button onClick={() => handleStatusUpdate('APPROVED')} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                <button onClick={() => handleStatusUpdate('REJECTED')} disabled={loading} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
              </>
            )}

            {post.status === 'APPROVED' && (
              <div className="flex gap-2">
                {/* Simulate Auto Uploads / Manual Shares */}
                <a
                  href={`https://web.whatsapp.com/send?text=${encodeURIComponent(post.title + "\n\n" + post.content)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                >
                  <Share2 size={16} /> WhatsApp
                </a>
                <button
                  onClick={() => handleStatusUpdate('PUBLISHED')}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mark Published
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
