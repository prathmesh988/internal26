'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store';
import { AppSidebar } from '@/components/app-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userType } = useUserStore();
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!initialized) {
      if (!userType || userType !== 'ADMIN') {
        useUserStore.getState().login('ADMIN', 'admin-001', 'admin@municipal.gov');
      }
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Initializing system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto ml-64">
        <div className="min-h-full p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
