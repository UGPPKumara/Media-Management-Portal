'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, CheckCircle, XCircle, Clock, Layout } from 'lucide-react';

function UserStatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = `http://localhost:5000/api/posts/user-stats/${userId}`;
        if (dateRange.start && dateRange.end) {
          url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, dateRange]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">User not found</div>;

  const { stats, user } = data;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Link href="/users" className="flex items-center text-gray-600 hover:text-blue-600 mb-6 w-fit">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Users
      </Link>

      {/* User Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
          <div className="flex gap-4 text-sm text-gray-500 mt-1">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{user.role}</span>
            <span>{user.email}</span>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="bg-transparent text-sm outline-none w-32"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="bg-transparent text-sm outline-none w-32"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Performance Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Posts" value={stats.total} icon={<Layout />} color="gray" />
        <StatCard title="Published" value={stats.published} icon={<CheckCircle />} color="green" />
        <StatCard title="Pending" value={stats.pending} icon={<Clock />} color="yellow" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle />} color="red" />
        <StatCard title="Drafts" value={stats.drafts} icon={<FileText />} color="gray" />
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-xl border shadow-sm ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2 opacity-80">
        <span className="w-4 h-4">{icon}</span>
        <span className="text-xs font-bold uppercase">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value || 0}</p>
    </div>
  );
}

export default function UserStatsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserStatsContent />
    </Suspense>
  );
}
