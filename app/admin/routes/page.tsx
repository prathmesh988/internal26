'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  StatusBadge,
  MetricCard,
  ProgressIndicator,
} from '@/components/shared';
import {
  BarChartComponent,
  TrendChart,
} from '@/components/charts';
import { useRoutes, useActiveRoutes, useVehicles } from '@/hooks';
import {
  AlertTriangle,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  Navigation,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils-helpers';

export default function RoutesPage() {
  const { data: routesData, loading: routesLoading } = useRoutes(1, 50);
  const { data: activeRoutes } = useActiveRoutes();
  const { data: vehiclesData } = useVehicles(1, 50);

  const routes = routesData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const totalRoutes = routesData?.total || 0;
  const completedRoutes = routes.filter((r: any) => r.status === 'COMPLETED').length;
  const inProgressRoutes = routes.filter((r: any) => r.status === 'IN_PROGRESS').length;
  const failedRoutes = routes.filter((r: any) => r.status === 'FAILED').length;

  const avgEfficiency = routes.length > 0
    ? Math.round(routes.reduce((sum: number, r: any) => sum + r.efficiency, 0) / routes.length)
    : 0;

  // Chart Data
  const efficiencyData = Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    efficiency: Math.floor(Math.random() * 30) + 70,
  }));

  const routesByWard = routes.reduce((acc: any, r: any) => {
    const existing = acc.find((item: any) => item.name === r.wardCode);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: r.wardCode, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Route Monitoring</h1>
        <p className="text-muted-foreground">Real-time vehicle tracking and route management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Routes"
          value={totalRoutes}
          icon={<Navigation className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="In Progress"
          value={inProgressRoutes}
          icon={<Truck className="w-5 h-5 text-yellow-500" />}
        />
        <MetricCard
          title="Completed"
          value={completedRoutes}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
        <MetricCard
          title="Failed"
          value={failedRoutes}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        />
        <MetricCard
          title="Avg Efficiency"
          value={`${avgEfficiency}%`}
          icon={<Navigation className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Active Routes Alert */}
      {activeRoutes && activeRoutes.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Navigation className="h-4 w-4 text-blue-600" />
          <AlertTitle>Active Routes</AlertTitle>
          <AlertDescription>
            {activeRoutes.length} route{activeRoutes.length !== 1 ? 's' : ''} currently in progress
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChartComponent
          data={efficiencyData}
          title="Monthly Route Efficiency Trend"
          dataKey="efficiency"
          barColor="#3b82f6"
          height={300}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Routes by Ward</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routesByWard.slice(0, 6).map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-foreground/80">{item.name}</span>
                    <span className="text-foreground font-semibold">{item.value}</span>
                  </div>
                  <ProgressIndicator
                    value={item.value}
                    max={Math.max(...routesByWard.map((r: any) => r.value))}
                    color={item.value > 10 ? 'success' : 'info'}
                    showPercent={false}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Active Routes</CardTitle>
          <CardDescription>{activeRoutes?.length || 0} routes currently running</CardDescription>
        </CardHeader>
        <CardContent>
          {!activeRoutes || activeRoutes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active routes at the moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Route ID</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Ward</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Vehicle</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Worker</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Pickups</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Progress</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRoutes.map((route: any) => {
                    const progress = (route.pickupsCompleted / route.pickupsScheduled) * 100;
                    return (
                      <tr key={route.id} className="border-b border-border hover:bg-muted/50 transition">
                        <td className="py-3 px-4 text-foreground/80 font-mono text-xs">{route.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-foreground/80">{route.wardCode}</td>
                        <td className="py-3 px-4 text-foreground/80 text-xs">
                          {route.vehicleId?.slice(0, 8) || '-'}
                        </td>
                        <td className="py-3 px-4 text-foreground/80">{route.workerName}</td>
                        <td className="py-3 px-4 text-foreground/80">
                          {route.pickupsCompleted}/{route.pickupsScheduled}
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={route.efficiency > 85 ? 'default' : 'secondary'}>
                            {route.efficiency}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">All Routes</CardTitle>
          <CardDescription>All scheduled and completed routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Route ID</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Ward</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Distance</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Scheduled</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Checkpoints</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {routes.slice(0, 25).map((route: any) => (
                  <tr key={route.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="py-3 px-4 text-foreground/80 font-mono text-xs">{route.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-foreground/80">{route.wardCode}</td>
                    <td className="py-3 px-4 text-foreground/80">{route.distance.toFixed(1)} km</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={route.status} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {formatDate(route.scheduledFor)}
                    </td>
                    <td className="py-3 px-4 text-foreground/80">{route.checkpoints.length}</td>
                    <td className="py-3 px-4">
                      <Badge variant={route.efficiency > 80 ? 'default' : 'secondary'}>
                        {route.efficiency}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
