'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      if (res.data.link) {
        // Dev mode hint
        console.log("Dev Link:", res.data.link);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Forgot Password</h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 pl-10 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="mail@example.com"
                required
              />
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
          >
            {loading ? 'Sending...' : <><Send size={18} /> Send Reset Link</>}
          </button>
        </form>
      </div>
    </div>
  );
}
