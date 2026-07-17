'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { useRealtimeTracking } from '@/hooks/use-realtime-tracking';
import { TrackingMap } from '@/components/tracking/tracking-map';
import { useTheme } from 'next-themes';
import { MapPin } from 'lucide-react';

export default function CitizenTrackingPage() {
  const router = useRouter();
  const [selectedWard, setSelectedWard] = useState('W03');
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  const { vehicles } = useRealtimeTracking();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <SiteHeader
        title="Live Fleet Tracking"
        actionLabel="File Complaint"
        onAction={() => router.push('/citizen/file-complaint')}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <MapPin className="size-5 text-primary" />
                    Live Fleet & Heatmap Tracker
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Monitor active waste collection routes and community complaint density in your area.
                  </CardDescription>
                </div>
                {/* Ward Selector Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground select-none">Select Ward:</span>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="bg-background border rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
                  >
                    <option value="W01">Ward 01 – Sirpur</option>
                    <option value="W02">Ward 02 – Chandan Nagar</option>
                    <option value="W03">Ward 03 – Kalani Nagar</option>
                    <option value="W04">Ward 04 – Sukhdev Nagar</option>
                    <option value="W05">Ward 05 – Raj Nagar</option>
                    <option value="W06">Ward 06 – Malharganj</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[600px] p-0 overflow-hidden relative border-t">
              {mounted && (
                <TrackingMap
                  vehicles={vehicles}
                  viewMode="citizen"
                  selectedWard={selectedWard}
                  isDark={theme === 'dark'}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
