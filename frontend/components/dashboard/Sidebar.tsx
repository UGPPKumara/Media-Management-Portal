'use client';

import axios from 'axios';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import { API_URL } from '@/config/api';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  PenSquare,
  Building,
  ChevronRight,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState({ company_name: 'MediaPortal', logo_url: null });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchSettings();
  }, []);

  // Fetch unread message count and poll every 5 seconds
  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/chat/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadMessages(res.data.unread || 0);
    } catch (err) {
      // Silently fail - don't spam console
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/settings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data) {
        setCompany(res.data);
      }
    } catch (err) {
      console.error('Failed to load company settings', err);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  const links = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'CREATOR'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Review Posts', href: '/dashboard/posts', icon: FileText, roles: ['ADMIN', 'MANAGER'] },
    { name: 'My Posts', href: '/dashboard/my-posts', icon: FileText, roles: ['CREATOR'] },
    { name: 'Create Post', href: '/dashboard/create-post', icon: PenSquare, roles: ['CREATOR'] },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'CREATOR'], badge: unreadMessages },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, roles: ['ADMIN', 'MANAGER', 'CREATOR'] },
    { name: 'Company Settings', href: '/dashboard/settings', icon: Building, roles: ['ADMIN'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(user.role));

  return (
    <>
      <aside className="w-72 bg-[#0F172A] flex flex-col h-screen sticky top-0 font-sans shadow-2xl z-50 text-white relative overflow-hidden">
        {/* Background Gradients for Aesthetics */}
        <div className="absolute top-0 left-0 w-full h-96 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-full h-96 bg-violet-500/10 blur-3xl pointer-events-none"></div>

        {/* Header Section */}
        <div className="p-8 pb-8 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-lg shadow-indigo-500/30 shrink-0 border border-white/10">
            {company.logo_url ? (
              <img
                src={`${API_URL}${company.logo_url}`}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl">{(company.company_name || 'M').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <span className="block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 truncate tracking-tight">
              {company.company_name || 'MediaPortal'}
            </span>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mt-0.5">Workspace</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-2 relative z-10 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</div>
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <link.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  <span>{link.name}</span>
                </div>
                {/* Unread Badge for Messages */}
                {link.badge && link.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive
                      ? 'bg-white text-indigo-600'
                      : 'bg-indigo-500 text-white animate-pulse'
                    }`}>
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
                {isActive && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Section */}
        <div className="p-4 relative z-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-sm font-bold uppercase tracking-wider transition-all duration-200 border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive={true}
      />
    </>
  );
}
