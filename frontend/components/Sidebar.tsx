'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, LogOut, Users, FileText, Settings, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/my-posts', label: 'My Posts', icon: FileText, roles: ['CREATOR'] },
    { href: '/dashboard/create-post', label: 'Create Post', icon: PlusCircle, roles: ['CREATOR'] },
    { href: '/dashboard/posts', label: 'Review Posts', icon: ClipboardList, roles: ['ADMIN', 'MANAGER'] },
    { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
  ];

  return (
    <div className="w-64 bg-[var(--bg-sidebar)] text-white min-h-screen flex flex-col border-r border-[var(--border-primary)]">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">MediaPortal</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          // Check role visibility
          if (item.roles && !item.roles.includes(user?.role)) return null;

          const active = item.exact ? pathname === item.href : isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${active
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-300 hover:bg-white/10'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
