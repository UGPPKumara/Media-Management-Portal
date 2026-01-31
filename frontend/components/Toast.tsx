'use client';

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all animate-in slide-in-from-left-5 duration-300 ${bgColors[type]} pointer-events-auto min-w-[300px]`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className={`flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors ${textColors[type]}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
