'use client';

import React from 'react';
import { useUserStore } from '@/store';
import { AppSidebarCitizen } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userType } = useUserStore();
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!initialized) {
      if (!userType || userType !== 'CITIZEN') {
        useUserStore.getState().login('CITIZEN', 'citizen-001', 'citizen@example.com');
      }
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebarCitizen />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
