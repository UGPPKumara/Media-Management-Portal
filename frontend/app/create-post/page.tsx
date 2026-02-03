'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This old page is deprecated - redirect to dashboard create-post
export default function CreatePostRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/create-post');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="text-theme-secondary">Redirecting...</div>
    </div>
  );
}
