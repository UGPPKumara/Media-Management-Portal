'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import {
  TrendingUp,
  Users,
  FileText,
  Clock,
  Plus,
  ArrowRight,
  Database,
  Activity,
  Zap,
  Shield,
  Lightbulb,
  Upload
} from 'lucide-react';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [creatorPosts, setCreatorPosts] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadDashboardData(parsedUser);

      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        loadDashboardData(parsedUser);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  const loadDashboardData = async (currentUser: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Load global stats for Admin/Manager
      if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
        const statsRes = await axios.get(`${API_URL}/api/posts/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        const activityRes = await axios.get(`${API_URL}/api/posts/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivity(activityRes.data);

        const storageRes = await axios.get(`${API_URL}/api/posts/storage`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStorage(storageRes.data);
      }

      // Load user stats for Creator
      if (currentUser.role === 'CREATOR') {
        const userStatsRes = await axios.get(`${API_URL}/api/posts/user-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserStats(userStatsRes.data);

        // Fetch Recent Posts for Creator
        const postsRes = await axios.get(`${API_URL}/api/users/${currentUser.id}/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(postsRes.data)) {
          setCreatorPosts(postsRes.data.slice(0, 5));
        } else {
          console.error("Expected array for posts, got:", postsRes.data);
          setCreatorPosts([]);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard = ({ title, value, color, icon: Icon, subValue }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-all">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {subValue && <p className={`text-xs mt-2 font-medium ${subValue.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.username || 'Guest'}!</h1>
          <p className="text-indigo-100 opacity-90 max-w-xl">
            {user?.role === 'CREATOR'
              ? 'Ready to create something amazing today? Your audience is waiting.'
              : user?.role === 'ADMIN' || user?.role === 'MANAGER'
                ? 'System performance is optimal. You have a few items pending review.'
                : 'Welcome to the Media Portal.'}
          </p>

          <div className="flex gap-3 mt-6">
            {user?.role === 'CREATOR' ? (
              <Link
                href="/create-post"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Create New Post
              </Link>
            ) : (
              <Link
                href="/dashboard/posts"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Review Pending
              </Link>
            )}
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && stats && (
          <>
            <StatCard
              title="Total Posts"
              value={stats.total_posts}
              icon={FileText}
              color="bg-blue-500 text-blue-600"
              subValue="+12% this month"
            />
            <StatCard
              title="Pending Review"
              value={stats.pending_posts}
              icon={Clock}
              color="bg-yellow-500 text-yellow-600"
              subValue="Requires Attention"
            />
            <StatCard
              title="Avg. Engagement"
              value="4.8/5"
              icon={Activity}
              color="bg-green-500 text-green-600"
              subValue="Quality Score"
            />
            {user.role === 'ADMIN' && (
              <StatCard
                title="Total Users"
                value={stats.total_users}
                icon={Users}
                color="bg-purple-500 text-purple-600"
                subValue="+5 New Users"
              />
            )}
          </>
        )}

        {user?.role === 'CREATOR' && userStats && (
          <>
            <StatCard
              title="Total Views"
              value="12.5k"
              icon={TrendingUp}
              color="bg-indigo-500 text-indigo-600"
              subValue="+12% this week"
            />
            <StatCard
              title="Published Posts"
              value={userStats.published}
              icon={CheckCircle}
              color="bg-green-500 text-green-600"
            />
            <StatCard
              title="Content Score"
              value="98"
              icon={Activity}
              color="bg-pink-500 text-pink-600"
              subValue="Top 5% Creator"
            />
            <StatCard
              title="Drafts"
              value={userStats.drafts}
              icon={FileText}
              color="bg-slate-500 text-slate-600"
            />
          </>
        )}
      </div>

      {/* Main Content Area - Widgets (No Post List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Storage / Usage Widget */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && storage && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  System Storage
                </h2>
                <span className="text-sm font-medium text-gray-500">
                  {((storage.used_gb / storage.total_gb) * 100).toFixed(1)}% Used
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-4 rounded-full"
                  style={{ width: `${(storage.used_gb / storage.total_gb) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Images</p>
                  <p className="text-lg font-bold text-gray-800">{storage.images_gb} GB</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Videos</p>
                  <p className="text-lg font-bold text-gray-800">{storage.videos_gb} GB</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                  <p className="text-lg font-bold text-gray-800">{storage.used_gb} GB</p>
                </div>
              </div>
            </div>
          )}

          {/* Creator Content: My Recent Posts */}
          {user?.role === 'CREATOR' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  My Recent Posts
                </h2>
                <Link href="/dashboard/posts" className="text-sm text-indigo-600 hover:underline">View All</Link>
              </div>

              {creatorPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>You haven't posted anything yet.</p>
                  <Link href="/dashboard/create-post" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">Create your first post</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs text-gray-400 uppercase font-semibold border-b border-gray-100">
                      <tr>
                        <th className="pb-3 pl-2">Title</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {creatorPosts.map((post: any) => (
                        <tr key={post.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="py-3 pl-2 max-w-[200px] truncate font-medium text-gray-800">{post.title}</td>
                          <td className="py-3 text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                                                ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  post.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3 text-right text-sm font-bold text-gray-600">
                            {post.views || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Activity Log */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Recent Activity
                </h2>
                <button className="text-sm text-indigo-600 hover:underline">View Log</button>
              </div>
              <div className="space-y-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                {activity.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">No recent activity.</p>
                ) : (
                  activity.map((item: any, i: number) => (
                    <ActivityItem
                      key={i}
                      icon={item.type === 'USER_JOINED' ? <Users className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-white" />}
                      color={item.type === 'USER_JOINED' ? "bg-blue-500" : "bg-indigo-500"}
                      title={item.type === 'USER_JOINED' ? "New User Registration" : "New Post Submitted"}
                      desc={item.type === 'USER_JOINED'
                        ? `User '${item.username}' joined the platform.`
                        : `'${item.title}' by ${item.username} submitted.`}
                      time={new Date(item.created_at).toLocaleDateString()}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              {user?.role === 'CREATOR' && (
                <Link href="/dashboard/create-post" className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-between group">
                  <span className="font-medium">Upload New Post</span>
                  <Plus className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
              {['ADMIN', 'MANAGER'].includes(user?.role) && (
                <Link href="/dashboard/users" className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-between group">
                  <span className="font-medium">User Management</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
              <Link href={user?.role === 'ADMIN' ? "/dashboard/settings" : "/dashboard/profile"} className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-between group">
                <span className="font-medium">{user?.role === 'ADMIN' ? 'System Settings' : 'Profile Settings'}</span>
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/dashboard/posts" className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-between group">
                <span className="font-medium">Content Reports</span>
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Creative/Tips Widget */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h2 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-600" />
              Daily Tip
            </h2>
            <p className="text-indigo-800/80 text-sm leading-relaxed mb-4">
              "Consistency is key! Active creators who post at least 3 times a week see 40% higher engagement rates."
            </p>
            <button className="text-xs font-bold text-indigo-700 uppercase tracking-wider hover:text-indigo-900">Read More</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Activity Item Helper
function ActivityItem({ icon, color, title, desc, time }: any) {
  return (
    <div className="flex gap-4 relative z-10">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
        <p className="text-gray-500 text-xs mb-1">{desc}</p>
        <span className="text-xs font-medium text-gray-400">{time}</span>
      </div>
    </div>
  )
}

function CheckCircle(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
