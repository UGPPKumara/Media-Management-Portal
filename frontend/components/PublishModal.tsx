'use client';

import { useState } from 'react';
import { X, Share2, Facebook, MessageCircle } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (platforms: string[]) => void;
  title?: string;
}

export default function PublishModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Approve & Publish',
}: PublishModalProps) {
  const [platforms, setPlatforms] = useState<string[]>([]);

  if (!isOpen) return null;

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm">
            You are about to approve this post. Select which external platforms you'd like to publish to automatically:
          </p>

          <div className="space-y-3">
            <label
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${platforms.includes('FACEBOOK')
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-100 hover:border-slate-200'
                }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={platforms.includes('FACEBOOK')}
                onChange={() => togglePlatform('FACEBOOK')}
              />
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">Facebook Page</span>
                <p className="text-xs text-slate-500">Post to connected business page</p>
              </div>
              {platforms.includes('FACEBOOK') && <div className="w-3 h-3 rounded-full bg-blue-500" />}
            </label>

            <label
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${platforms.includes('WHATSAPP')
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-100 hover:border-slate-200'
                }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={platforms.includes('WHATSAPP')}
                onChange={() => togglePlatform('WHATSAPP')}
              />
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-900">WhatsApp</span>
                <p className="text-xs text-slate-500">Send to official channel</p>
              </div>
              {platforms.includes('WHATSAPP') && <div className="w-3 h-3 rounded-full bg-green-500" />}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(platforms)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm"
          >
            Publish Post
          </button>
        </div>
      </div>
    </div>
  );
}
