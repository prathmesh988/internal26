'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { vehicleService } from '@/services/appwrite/client';
import type { Vehicle } from '@/types';
import { Loader2, Truck } from 'lucide-react';

function getVehicleStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'IN_USE':      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'IDLE':        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'MAINTENANCE': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'FUEL':        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'END_OF_DAY':  return 'bg-muted text-muted-foreground border-border';
    default:            return 'bg-secondary text-secondary-foreground';
  }
}

export default function DashboardFleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehicleService.list(1, 25)
      .then((res) => setVehicles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <SiteHeader title="Fleet Status" />
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Fleet Status" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-6 px-4 lg:px-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Sanitation Fleet Status</h2>
            <p className="text-sm text-muted-foreground">
              {vehicles.length} vehicles in the system.
            </p>
          </div>

          {vehicles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No vehicles found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles.map((v) => {
                const loadPercent = v.capacity > 0 ? Math.round((v.currentLoad / v.capacity) * 100) : 0;
                return (
                  <Card
                    key={v.id}
                    className="hover:shadow-md transition-all duration-200 border"
                  >
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold font-mono">
                        {v.registrationNumber}
                      </CardTitle>
                      <Truck className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="capitalize text-muted-foreground">
                          {v.type.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <Badge variant="outline" className={getVehicleStatusBadge(v.status)}>
                          {v.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Driver:</span>
                          <span className="font-medium text-foreground">{v.assignedDriverName || '—'}</span>
                        </div>

                        {/* Fuel progress */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Fuel Level</span>
                            <span>{v.fuelLevel}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                v.fuelLevel > 50
                                  ? 'bg-emerald-500'
                                  : v.fuelLevel > 20
                                  ? 'bg-amber-500'
                                  : 'bg-destructive'
                              }`}
                              style={{ width: `${v.fuelLevel}%` }}
                            />
                          </div>
                        </div>

                        {/* Load progress */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Current Load</span>
                            <span>{loadPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${loadPercent}%` }}
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
