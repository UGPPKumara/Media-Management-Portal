'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, CheckCheck, ExternalLink, Search, Moon, Sun, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { API_URL } from '@/config/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';

interface Notification {
  id: string;
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    if (!isNotificationOpen) fetchNotifications();
    setIsNotificationOpen(!isNotificationOpen);
    setIsUserMenuOpen(false);
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/posts?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'POST_SUBMITTED': return '📝';
      case 'POST_APPROVED': return '✅';
      case 'POST_REJECTED': return '❌';
      case 'POST_PUBLISHED': return '🚀';
      case 'USER_REGISTERED': return '👤';
      default: return '🔔';
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <header className="bg-[#0F172A] dark:bg-[#0c1222] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
      </form>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 ml-6">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all group"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div className="relative w-5 h-5">
            <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
            <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`} />
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-700/50 mx-1"></div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationClick}
            className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-theme-card rounded-2xl shadow-2xl border border-theme overflow-hidden animate-fadeIn">
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center">
                <h3 className="font-bold">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto bg-theme-secondary">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-theme-muted">
                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 border-b border-theme hover:bg-theme-tertiary cursor-pointer transition-colors ${!n.is_read ? 'bg-indigo-500/10' : ''}`}
                      onClick={() => {
                        // 1. Mark as read immediately
                        if (!n.is_read) markAsRead(n._id);
                        setIsNotificationOpen(false);

                        // 2. Robust Role Check
                        let currentUserRole = user?.role;
                        if (!currentUserRole) {
                          try {
                            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                            currentUserRole = localUser.role;
                          } catch (e) {
                            console.error('Failed to parse user from storage');
                          }
                        }

                        const isManager = currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER';

                        // 3. Post ID Extraction
                        const getPostId = (link: string | null) => {
                          if (!link) return null;
                          try {
                            if (link.includes('view=')) {
                              return link.split('view=')[1].split('&')[0];
                            }
                            if (link.includes('id=')) {
                              return link.split('id=')[1].split('&')[0];
                            }
                            const url = new URL(link, window.location.origin);
                            return url.searchParams.get('id') || url.searchParams.get('view');
                          } catch (e) {
                            return null;
                          }
                        };

                        const postId = getPostId(n.link);

                        // 4. Role-Based Routing
                        // Explicitly route POST_SUBMITTED to Content Management (Admin view)
                        if (n.type === 'POST_SUBMITTED') {
                          router.push(postId ? `/dashboard/posts?view=${postId}` : '/dashboard/posts');
                          return;
                        }

                        if (n.type.includes('POST')) {
                          if (isManager) {
                            router.push(postId ? `/dashboard/posts?view=${postId}` : '/dashboard/posts');
                          } else {
                            router.push(postId ? `/dashboard/my-posts?view=${postId}` : '/dashboard/my-posts');
                          }
                        } else if (n.link) {
                          router.push(n.link);
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <span className="text-lg">{getNotificationIcon(n.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className={`text-sm font-medium ${!n.is_read ? 'text-theme-primary' : 'text-theme-secondary'}`}>{n.title}</p>
                            <span className="text-xs text-theme-muted">{timeAgo(n.created_at)}</span>
                          </div>
                          <p className="text-xs text-theme-muted line-clamp-1">{n.message}</p>
                        </div>
                        {n.link && (
                          <ExternalLink className="w-4 h-4 text-theme-muted flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link href="/dashboard/notifications" className="block px-4 py-2.5 text-center text-sm text-indigo-500 hover:bg-theme-tertiary font-medium border-t border-theme bg-theme-secondary" onClick={() => setIsNotificationOpen(false)}>
                View All
              </Link>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-700/50 mx-1"></div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotificationOpen(false); }}
            className="flex items-center gap-2.5 p-1.5 pr-3 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-lg">
              {user?.profile_picture ? (
                <img src={`${API_URL}${user.profile_picture}`} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
              <p className="text-[10px] text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-theme-card rounded-2xl shadow-2xl border border-theme overflow-hidden animate-fadeIn">
              <div className="px-4 py-4 border-b border-theme bg-gradient-to-r from-indigo-600/10 to-violet-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-lg">
                    {user?.profile_picture ? (
                      <img src={`${API_URL}${user.profile_picture}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-theme-primary">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-theme-muted">{user?.email}</p>
                  </div>
                </div>
                <span className="inline-block mt-2 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-medium rounded-lg">
                  {user?.role}
                </span>
              </div>
              <div className="py-2 bg-theme-secondary">
                <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-theme-primary hover:bg-theme-tertiary transition" onClick={() => setIsUserMenuOpen(false)}>
                  <User className="w-4 h-4 text-theme-muted" /> My Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-theme-primary hover:bg-theme-tertiary transition" onClick={() => setIsUserMenuOpen(false)}>
                    <Settings className="w-4 h-4 text-theme-muted" /> Settings
                  </Link>
                )}
              </div>
              <div className="border-t border-theme bg-theme-secondary">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 transition">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
