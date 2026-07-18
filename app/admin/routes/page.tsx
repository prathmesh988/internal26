'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  Navigation,
  Truck,
  CheckCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useRoutes } from '@/hooks';

function getRouteStatusBadgeClass(status: string) {
  switch (status.toUpperCase()) {
    case 'RUNNING':
      return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'DELAYED':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'SCHEDULED':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

export default function RoutesPage() {
  const { data: allRoutesData } = useRoutes(1, 100);

  const allRoutes = useMemo(() => {
    return (allRoutesData?.data || []).map((r) => {
      const totalStops = r.checkpoints?.length || 0;
      const todayStops = r.checkpoints?.filter((cp) => cp.status === 'COMPLETED').length || 0;
      const completion = r.efficiency || (totalStops > 0 ? Math.round((todayStops / totalStops) * 100) : 0);

      let displayStatus = 'Scheduled';
      if (r.status === 'IN_PROGRESS') displayStatus = 'Running';
      else if (r.status === 'COMPLETED') displayStatus = 'Completed';
      else if (r.status === 'FAILED') displayStatus = 'Delayed';
      else if (r.status === 'PLANNED') displayStatus = 'Scheduled';

      return {
        name: r.name,
        route: r.name,
        ward: r.wardCode,
        vehicle: r.vehicleId || 'Unassigned',
        driver: r.workerName || 'Unassigned',
        startTime: r.startedAt ? new Date(r.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        totalStops,
        todayStops,
        completion,
        eta: r.status === 'COMPLETED' ? 'Completed' : (r.scheduledFor ? new Date(r.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'),
        lastUpdated: r.completedAt ? 'Completed' : 'Just now',
        status: displayStatus,
      };
    });
  }, [allRoutesData]);

  const activeRoutes = useMemo(() => {
    return allRoutes.filter((r) => r.status === 'Running' || r.status === 'Delayed');
  }, [allRoutes]);

  const totalRoutes = allRoutes.length;
  const runningRoutes = allRoutes.filter((r) => r.status === 'Running').length;
  const completedRoutes = allRoutes.filter((r) => r.status === 'Completed').length;
  const delayedRoutes = allRoutes.filter((r) => r.status === 'Delayed').length;
  const scheduledRoutes = allRoutes.filter((r) => r.status === 'Scheduled').length;

  const avgEfficiency = totalRoutes > 0 ? Math.round(
    allRoutes.reduce((sum, r) => sum + r.completion, 0) / totalRoutes
  ) : 0;

  const efficiencyData = Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    efficiency: Math.floor(Math.random() * 20) + 80,
  }));

  const routesByWard = allRoutes.reduce((acc: any, r: any) => {
    const existing = acc.find((item: any) => item.name === r.ward);
    if (existing) { existing.value++; }
    else { acc.push({ name: r.ward, value: 1 }); }
    return acc;
  }, []);

  const statCards = [
    { label: 'Total Routes', value: totalRoutes, trend: '+8%', up: true, icon: Navigation },
    { label: 'Running', value: runningRoutes, trend: 'Active now', up: true, icon: Truck },
    { label: 'Completed', value: completedRoutes, trend: '+15%', up: true, icon: CheckCircle },
    { label: 'Delayed', value: delayedRoutes, trend: 'Investigating', up: false, icon: AlertTriangle },
    { label: 'Scheduled', value: scheduledRoutes, trend: 'Later today', up: true, icon: Navigation },
  ];

  return (
    <>
      <SiteHeader title="Route Monitoring" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {statCards.map((card) => (
              <Card key={card.label} className="bg-gradient-to-br from-card to-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">{card.label}</CardDescription>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${card.up ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/10 text-destructive'
                      }`}>
                      {card.up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                      {card.trend}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums mt-2">{card.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Route Efficiency</CardTitle>
              <CardDescription>Historical fleet route performance (%)</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={efficiencyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 12 }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="efficiency" name="Efficiency %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>



          {/* Tabular Lists */}
          <Tabs defaultValue="active-routes" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="active-routes">Active Routes</TabsTrigger>
              <TabsTrigger value="all-routes">All Routes</TabsTrigger>
            </TabsList>

            {/* Active Routes Tab */}
            <TabsContent value="active-routes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Routes Currently Operating</CardTitle>
                  <CardDescription>Real-time completion tracking and ETA metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Route Name</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Vehicle</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Driver</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Time</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ETA</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeRoutes.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{item.vehicle}</TableCell>
                          <TableCell>{item.driver}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{item.startTime}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${item.completion}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">{item.completion}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground/80 text-xs">{item.eta}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRouteStatusBadgeClass(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Routes Tab */}
            <TabsContent value="all-routes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Routes Master List</CardTitle>
                  <CardDescription>Review entire sector stops and completion histories</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Route</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Vehicle</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Stops</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today's Stops</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion %</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRoutes.map((item) => (
                        <TableRow key={item.route}>
                          <TableCell className="font-semibold text-foreground">{item.route}</TableCell>
                          <TableCell>{item.ward}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{item.vehicle}</TableCell>
                          <TableCell className="tabular-nums text-center">{item.totalStops}</TableCell>
                          <TableCell className="tabular-nums text-center">{item.todayStops}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${item.completion}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">{item.completion}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{item.lastUpdated}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRouteStatusBadgeClass(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
}
