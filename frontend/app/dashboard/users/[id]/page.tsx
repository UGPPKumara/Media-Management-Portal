'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, CreditCard, ArrowLeft, Calendar, FileText, CheckCircle, Ban, Eye } from 'lucide-react';
import Link from 'next/link';

export default function UserActivityPage() {
  const { id } = useParams();
  const router = useRouter();
  const [targetUser, setTargetUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const counts = {
    ALL: posts.length,
    PUBLISHED: posts.filter(p => p.status === 'PUBLISHED').length,
    DRAFT: posts.filter(p => p.status === 'DRAFT').length,
    REJECTED: posts.filter(p => p.status === 'REJECTED').length,
    PENDING: posts.filter(p => p.status === 'PENDING').length,
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userRes, postsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/users/${id}/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setTargetUser(userRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading user activity...</div>;

  // Security Check
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Ban className="w-12 h-12 mb-4 text-gray-300" />
        <p>You do not have permission to view this page.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-indigo-600 hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  if (!targetUser) return <div className="p-8 text-center text-red-500">User not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {/* User Profile Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex-shrink-0">
          {targetUser.profile_picture ? (
            <img
              src={`http://localhost:5000${targetUser.profile_picture}`}
              alt={targetUser.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-3xl font-bold">
              {targetUser.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{targetUser.full_name || targetUser.username}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                ${targetUser.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {targetUser.is_active ? 'Active' : 'Blocked'}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase">
                {targetUser.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mt-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>{targetUser.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{targetUser.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{targetUser.phone_number || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>NIC: {targetUser.nic || '-'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{targetUser.address || '-'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined: {new Date(targetUser.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Work / Posts */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Work History</h2>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="ALL">All ({counts.ALL})</option>
              <option value="PUBLISHED">Published ({counts.PUBLISHED})</option>
              <option value="DRAFT">Draft ({counts.DRAFT})</option>
              <option value="REJECTED">Rejected ({counts.REJECTED})</option>
              <option value="PENDING">Pending ({counts.PENDING})</option>
            </select>
            <span className="text-sm text-slate-500">{posts.filter(p => statusFilter === 'ALL' || p.status === statusFilter).length} Posts</span>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg">
            No posts created yet.
          </div>
        ) : (
          <div className="overflow-hidden overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.filter(post => statusFilter === 'ALL' || post.status === statusFilter).map(post => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {post.image_url && (
                            <img
                              src={`http://localhost:5000${post.image_url}`}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-slate-900 line-clamp-1 max-w-[200px]" title={post.title}>
                          {post.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {post.category || 'General'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                        ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                          post.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {post.views || 0}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/posts/${post.id}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
