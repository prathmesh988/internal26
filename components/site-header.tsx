'use client';

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SiteHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SiteHeader({ title, actionLabel, onAction }: SiteHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/90 backdrop-blur transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      {actionLabel && (
        <div className="ml-auto">
          <Button size="sm" onClick={onAction} className="gap-1.5">
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        </div>
      )}
    </header>
  );
}
