'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store';
import { authService } from '@/services/appwrite/client';
import { AppSidebarCitizen } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType } = useUserStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAuth() {
      // First check if Zustand store is already authenticated as citizen
      if (isAuthenticated && userType === 'CITIZEN') {
        setLoading(false);
        return;
      }

      const session = await authService.getCurrentUser();
      if (session && session.role === 'CITIZEN') {
        useUserStore.getState().login('CITIZEN', session.user.$id, session.user.email);
        setLoading(false);
      } else {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
    
    checkAuth();
  }, [isAuthenticated, userType, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Verifying session...</p>
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

