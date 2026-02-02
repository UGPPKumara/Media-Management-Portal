'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Clock, Tag, User } from 'lucide-react';
import { API_URL } from '@/config/api';

function SinglePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));

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
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
      Post not found
    </div>
  );

  const isVideo = post.media_type === 'VIDEO';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{post.title}</h1>
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
              <Link href={`/post-edit?id=${post.id}`} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200">
                <Edit className="w-4 h-4 mr-2" /> Edit & Resubmit
              </Link>
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
      </div>
    </div>
  );
}

export default function PostViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
      <SinglePostContent />
    </Suspense>
  );
}
