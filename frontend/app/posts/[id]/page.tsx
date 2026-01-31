'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';

export default function SinglePostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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

    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/posts/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPost(res.data);
      } catch (err) {
        console.error(err);
        // router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!post) return <div className="p-8">Post not found</div>;

  const isVideo = post.media_type === 'VIDEO';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 w-fit">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    post.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      post.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                  {post.status}
                </span>
                <span>By {post.username}</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Edit Button for Creator (if Rejected or Draft) */}
            {user?.role === 'CREATOR' && (post.status === 'REJECTED' || post.status === 'DRAFT') && (
              <Link href={`/posts/${post.id}/edit`} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Edit className="w-4 h-4 mr-2" /> Edit & Resubmit
              </Link>
            )}
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`rounded-xl overflow-hidden bg-black flex items-center justify-center ${isVideo ? 'aspect-video' : ''}`}>
              {isVideo ? (
                <video src={`http://localhost:5000${post.media_path}`} controls className="w-full h-full object-contain" />
              ) : (
                <img src={`http://localhost:5000${post.media_path}`} alt={post.title} className="w-full h-auto object-contain" />
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
              </div>

              {post.status === 'REJECTED' && post.rejection_reason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="text-red-800 font-semibold mb-1">Rejection Reason:</h4>
                  <p className="text-red-700">{post.rejection_reason}</p>
                  <p className="text-sm text-red-600 mt-2">Please edit the post to address these issues and resubmit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
