'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/api';
import {
  FileText,
  Users,
  Search,
  Filter,
  ChevronLeft,
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, USER_JOINED, POST_CREATED

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/activity/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-theme-secondary hover:text-theme-primary mb-2 inline-flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-theme-primary">System Activity Log</h1>
          <p className="text-theme-secondary">View detailed system events and user actions.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-theme-card p-4 rounded-xl border border-theme shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 bg-theme-tertiary border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-theme-secondary" />
          <select
            className="bg-theme-tertiary border border-theme rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Events</option>
            <option value="USER_JOINED">User Registrations</option>
            <option value="POST_CREATED">Post Submissions</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-theme-card rounded-xl border border-theme shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-theme-secondary">Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-theme-secondary">No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-theme-tertiary border-b border-theme text-xs font-bold text-theme-muted uppercase">
                <tr>
                  <th className="px-6 py-4">Event Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Event Type</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-theme-tertiary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-theme-secondary">
                        <Calendar className="w-4 h-4 text-theme-muted" />
                        <span className="text-sm">{new Date(log.created_at).toLocaleDateString()}</span>
                        <Clock className="w-4 h-4 ml-2 text-theme-muted" />
                        <span className="text-xs">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs">
                          {log.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-theme-primary">{log.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                        ${log.type === 'USER_JOINED' ? 'bg-blue-500/10 text-blue-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                        {log.type === 'USER_JOINED' ? <Users className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {log.type === 'USER_JOINED' ? 'Registration' : 'Submission'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-secondary">
                      {log.type === 'USER_JOINED' ? (
                        <span className="opacity-80 ">{log.details}</span>
                      ) : (
                        <span>
                          New post: <span className="font-medium text-theme-primary">"{log.title}"</span>
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-theme-tertiary border border-theme">{log.details}</span>
                        </span>
                      )}
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
