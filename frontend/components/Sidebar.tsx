'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';
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

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-400">MediaPortal</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 p-3 rounded transition-colors ${pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          href="/create-post"
          className={`flex items-center gap-3 p-3 rounded transition-colors ${pathname === '/create-post' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
        >
          <PlusCircle size={20} />
          Create Post
        </Link>

        {user?.role === 'ADMIN' && (
          <Link
            href="/users"
            className={`flex items-center gap-3 p-3 rounded transition-colors ${pathname === '/users' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <PlusCircle size={20} />
            Users
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full text-left text-red-400 hover:bg-gray-800 rounded transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
