'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      theme="light"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast: 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
          description: 'text-sm opacity-90',
          title: 'font-semibold',
        },
      }}
    />
  );
}

export { toast } from 'sonner';
