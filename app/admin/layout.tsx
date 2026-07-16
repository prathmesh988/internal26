'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store';
import { authService } from '@/services/appwrite/client';
import { AppSidebarAdmin } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function AdminLayout({
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
      // Check if Zustand store is already authenticated as admin or worker
      if (isAuthenticated && (userType === 'ADMIN' || userType === 'WORKER')) {
        setLoading(false);
        return;
      }

      const session = await authService.getCurrentUser();
      if (
        session &&
        (session.role === 'ADMIN' ||
          session.role === 'WORKER' ||
          session.role === 'COLLECTOR' ||
          (session.role as string) === 'SUPERVISOR' ||
          (session.role as string) === 'OPERATOR' ||
          (session.role as string) === 'ROUTE_PLANNER')
      ) {
        const storeRole = session.role === 'ADMIN' ? 'ADMIN' : 'WORKER';
        useUserStore.getState().login(storeRole, session.user.$id, session.user.email);
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
          <p className="text-muted-foreground">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebarAdmin />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

