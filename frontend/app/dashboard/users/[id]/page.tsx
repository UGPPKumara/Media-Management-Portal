'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { ChevronLeft, Mail, Phone, Calendar, MapPin, Activity, CheckCircle, Clock, XCircle, FileText, Loader2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function UserPerformancePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      // console.log('Fetching data for user:', id);

      try {
        const statsRes = await axios.get(`${API_URL}/api/posts/user-stats/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        // console.log('Stats res:', statsRes.data);
        if (statsRes.data.user) setUser(statsRes.data.user);
        setStats(statsRes.data.stats);
      } catch (e) {
        console.error('Failed to fetch stats', e);
        // Try fallback to just get user details if stats failed
        try {
          const userRes = await axios.get(`${API_URL}/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setUser(userRes.data);
        } catch (uErr) {
          console.error('Failed to fetch user fallback', uErr);
        }
      }

      try {
        const postsRes = await axios.get(`${API_URL}/api/posts?user_id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setPosts(postsRes.data);
      } catch (e) {
        console.error('Failed to fetch posts', e);
      }

    } catch (err) {
      console.error(err);
      showToast('Failed to load user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getDaysWithPosts = () => {
    // Simple heatmap data: count posts per day for last 30 days
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString();

      const count = posts.filter(p => new Date(p.created_at).toLocaleDateString() === dateString).length;
      days.push({ date: dateString, count });
    }
    return days;
  };

  const activityData = getDaysWithPosts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-theme-muted">
        <p>User not found</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <button
          onClick={() => router.back()}
          className="mt-1 p-2 hover:bg-theme-tertiary rounded-lg transition-colors border border-transparent hover:border-theme"
        >
          <ChevronLeft className="w-5 h-5 text-theme-secondary" />
        </button>

        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-theme-tertiary flex items-center justify-center text-theme-primary font-bold text-2xl overflow-hidden border-2 border-theme shadow-md">
                {user.profile_picture ? <img src={`${API_URL}${user.profile_picture}`} alt="" className="w-full h-full object-cover" /> : user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">{user.username}</h1>
                <div className="flex items-center gap-2 text-theme-secondary text-sm">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-semibold border border-indigo-500/20">{user.role}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Logic to edit or message user could go here */}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-theme-card p-4 rounded-xl border border-theme shadow-sm hover:border-indigo-500/30 transition-colors">
              <p className="text-theme-secondary text-xs uppercase font-bold tracking-wider mb-1">Total Posts</p>
              <p className="text-3xl font-bold text-theme-primary">{stats?.total || 0}</p>
            </div>
            <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <p className="text-green-600 text-xs uppercase font-bold tracking-wider">Published</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats?.published || 0}</p>
            </div>
            <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-yellow-500" />
                <p className="text-yellow-600 text-xs uppercase font-bold tracking-wider">Pending</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
            </div>
            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-3 h-3 text-red-500" />
                <p className="text-red-500 text-xs uppercase font-bold tracking-wider">Rejected</p>
              </div>
              <p className="text-3xl font-bold text-red-500">{stats?.rejected || 0}</p>
            </div>
            <div className="bg-theme-card p-4 rounded-xl border border-theme shadow-sm">
              <p className="text-theme-secondary text-xs uppercase font-bold tracking-wider mb-1">Drafts</p>
              <p className="text-3xl font-bold text-theme-primary">{stats?.drafts || 0}</p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-theme-card p-6 rounded-xl border border-theme mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Activity (Last 30 Days)
            </h3>
            <div className="flex items-end justify-between gap-1 h-32 w-full">
              {activityData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${day.count > 0 ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-theme-tertiary'}`}
                    style={{ height: `${day.count > 0 ? Math.max((day.count / 5) * 100, 10) : 5}%` }}
                  ></div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {day.date}: {day.count} posts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-theme-card border border-theme rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-theme flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-semibold text-theme-primary">All Posts</h3>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-theme-tertiary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-theme-tertiary text-theme-secondary text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-theme-muted">
                        No posts found
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map(post => (
                      <tr key={post.id} className="hover:bg-theme-tertiary transition-colors group">
                        <td className="p-4">
                          <Link href={`/dashboard/posts?view=${post.id}`} className="font-medium text-theme-primary hover:text-indigo-500 transition-colors block truncate max-w-md">
                            {post.title}
                          </Link>
                          <p className="text-xs text-theme-muted truncate max-w-md mt-0.5">{post.content?.substring(0, 50)}...</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold uppercase
                                       ${post.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                              post.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                post.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                  'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-theme-secondary">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/dashboard/posts?view=${post.id}`} className="text-indigo-500 hover:text-indigo-400 text-sm font-medium">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
