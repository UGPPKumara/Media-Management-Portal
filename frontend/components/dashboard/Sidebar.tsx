'use client';

import axios from 'axios';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  PenSquare,
  Building,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState({ company_name: 'MediaPortal', logo_url: null });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      // Auth might not be needed for public settings, but let's send it if we have it
      const res = await axios.get('http://localhost:5000/api/settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // Handle the case where the API returns null/empty if no settings exist, though controller defaults it.
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
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'CREATOR', 'USER'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Approvals', href: '/dashboard/posts', icon: FileText, roles: ['ADMIN', 'MANAGER'] },
    { name: 'My Posts', href: '/dashboard/posts', icon: FileText, roles: ['CREATOR', 'USER'] },
    { name: 'Create Post', href: '/dashboard/create-post', icon: PenSquare, roles: ['CREATOR', 'USER'] },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings, roles: ['ADMIN', 'MANAGER', 'CREATOR', 'USER'] },
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
                src={`http://localhost:5000${company.logo_url}`}
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
                {isActive && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout Section */}
        <div className="p-4 relative z-10">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md overflow-hidden border border-white/10">
                {user.profile_picture ? (
                  <img
                    src={`http://localhost:5000${user.profile_picture}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.username}</p>
                <p className="text-xs text-indigo-300 truncate font-medium">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
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
