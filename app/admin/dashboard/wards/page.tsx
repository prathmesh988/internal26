'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { wardService } from '@/services/appwrite/client';
import type { Ward } from '@/types';
import { Loader2, Star, Trophy, Sparkles } from 'lucide-react';

export default function DashboardWardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wardService.list()
      .then((wList) => setWards(wList))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const wardPerformance = useMemo(() => {
    return wards.map((w, i) => ({
      rank: i + 1,
      ward: `${w.code} — ${w.name}`,
      cleanlinessScore: w.cleanlinessScore,
      complaintCount: w.complaintCount,
      pickupsScheduledToday: w.pickupsScheduledToday,
      pickupsCompletedToday: w.pickupsCompletedToday,
      avgResponseTime: w.averageResponseTime,
    })).sort((a, b) => b.cleanlinessScore - a.cleanlinessScore);
  }, [wards]);

  if (loading) {
    return (
      <>
        <SiteHeader title="Ward Performance" />
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Ward Performance" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-6 px-4 lg:px-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Ward Performance Ranking</h2>
            <p className="text-sm text-muted-foreground">
              Sorted by cleanliness score — live from database.
            </p>
          </div>

          {wardPerformance.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No ward data found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {wardPerformance.map((item, i) => {
                const pickupPercent = item.pickupsScheduledToday > 0 
                  ? Math.round((item.pickupsCompletedToday / item.pickupsScheduledToday) * 100) 
                  : 0;

                return (
                  <Card
                    key={item.ward}
                    className="hover:shadow-md transition-all duration-200 border"
                  >
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold truncate max-w-[80%]">
                        {item.ward}
                      </CardTitle>
                      {i === 0 ? (
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <div className="text-2xl font-bold">{item.cleanlinessScore}/100</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Cleanliness
                        </div>
                      </div>

                      <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Rank:</span>
                          <span className="font-bold text-foreground">#{item.rank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Active Complaints:</span>
                          <span className="font-semibold text-foreground">{item.complaintCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">Avg Response:</span>
                          <span>{item.avgResponseTime.toFixed(1)} hrs</span>
                        </div>

                        {/* Pickups progress bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px]">
                            <span>Today's Pickups</span>
                            <span>{item.pickupsCompletedToday}/{item.pickupsScheduledToday}</span>
                          </div>
                          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${pickupPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
