'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600">MediaPortal</div>
      <div className="flex gap-4">
        {user ? (
          <>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/create-post" className="text-gray-700 hover:text-blue-600">
              Create Post
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              Logout ({user.username})
            </button>
          </>
        ) : (
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
