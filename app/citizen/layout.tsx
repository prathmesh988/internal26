'use client';

import React from 'react';
import { useUserStore } from '@/store';
import CitizenSidebar from '@/components/citizen-sidebar';

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userType } = useUserStore();
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    // Initialize on first render only
    if (!initialized) {
      if (!userType || userType !== 'CITIZEN') {
        useUserStore.getState().login('CITIZEN', 'citizen-001', 'citizen@example.com');
      }
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <CitizenSidebar />
      <main className="flex-1 overflow-auto ml-64">
        <div className="min-h-full p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
