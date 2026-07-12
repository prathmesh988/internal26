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

// 15+ mock active routes
const activeMockRoutes = [
  { name: 'RT-Ward03-Primary', vehicle: 'MH-12-GQ-4920', driver: 'Sanjay Dutt', startTime: '07:30 AM', completion: 75, eta: '10:45 AM', status: 'Running' },
  { name: 'RT-Ward01-Secondary', vehicle: 'MH-12-HU-9871', driver: 'Rajesh Shinde', startTime: '08:00 AM', completion: 40, eta: '11:30 AM', status: 'Running' },
  { name: 'RT-Ward05-Bulk', vehicle: 'MH-12-ER-3829', driver: 'Dilip Rao', startTime: '06:45 AM', completion: 95, eta: '09:15 AM', status: 'Running' },
  { name: 'RT-Ward06-Primary', vehicle: 'MH-12-PL-9022', driver: 'Manoj Bajpayee', startTime: '07:15 AM', completion: 85, eta: '10:15 AM', status: 'Running' },
  { name: 'RT-Ward02-Primary', vehicle: 'MH-12-QW-5867', driver: 'Devendra Patil', startTime: '08:30 AM', completion: 30, eta: '12:00 PM', status: 'Running' },
  { name: 'RT-Ward05-Secondary', vehicle: 'MH-12-AZ-3498', driver: 'Kailash Kher', startTime: '07:45 AM', completion: 55, eta: '11:15 AM', status: 'Running' },
  { name: 'RT-Ward04-Express', vehicle: 'MH-12-FT-2039', driver: 'Vijay Chauhan', startTime: '09:00 AM', completion: 15, eta: '01:30 PM', status: 'Delayed' },
  { name: 'RT-Ward03-Sweeping', vehicle: 'MH-12-XW-1049', driver: 'Sunil Shetty', startTime: '05:30 AM', completion: 100, eta: 'Completed', status: 'Completed' }
];

// 20+ mock all routes
const allMockRoutes = [
  { route: 'RT-Ward03-Primary', ward: 'W03', vehicle: 'MH-12-GQ-4920', totalStops: 45, todayStops: 34, completion: 75, lastUpdated: 'Just now', status: 'Running' },
  { route: 'RT-Ward01-Secondary', ward: 'W01', vehicle: 'MH-12-HU-9871', totalStops: 35, todayStops: 14, completion: 40, lastUpdated: '3 min ago', status: 'Running' },
  { route: 'RT-Ward05-Bulk', ward: 'W05', vehicle: 'MH-12-ER-3829', totalStops: 28, todayStops: 27, completion: 95, lastUpdated: 'Just now', status: 'Running' },
  { route: 'RT-Ward06-Primary', ward: 'W06', vehicle: 'MH-12-PL-9022', totalStops: 50, todayStops: 42, completion: 85, lastUpdated: '8 min ago', status: 'Running' },
  { route: 'RT-Ward02-Primary', ward: 'W02', vehicle: 'MH-12-QW-5867', totalStops: 40, todayStops: 12, completion: 30, lastUpdated: '2 min ago', status: 'Running' },
  { route: 'RT-Ward05-Secondary', ward: 'W05', vehicle: 'MH-12-AZ-3498', totalStops: 32, todayStops: 18, completion: 55, lastUpdated: 'Just now', status: 'Running' },
  { route: 'RT-Ward04-Express', ward: 'W04', vehicle: 'MH-12-FT-2039', totalStops: 20, todayStops: 3, completion: 15, lastUpdated: '15 min ago', status: 'Delayed' },
  { route: 'RT-Ward03-Sweeping', ward: 'W03', vehicle: 'MH-12-XW-1049', totalStops: 25, todayStops: 25, completion: 100, lastUpdated: '4 hours ago', status: 'Completed' },
  { route: 'RT-Ward01-Alternate', ward: 'W01', vehicle: 'MH-12-OP-8973', totalStops: 30, todayStops: 0, completion: 0, lastUpdated: 'Scheduled', status: 'Scheduled' },
  { route: 'RT-Ward04-Morning', ward: 'W04', vehicle: 'MH-12-TR-9081', totalStops: 38, todayStops: 38, completion: 100, lastUpdated: '6 hours ago', status: 'Completed' },
  { route: 'RT-Ward02-Bulk', ward: 'W02', vehicle: 'MH-12-UY-8890', totalStops: 15, todayStops: 0, completion: 0, lastUpdated: 'Scheduled', status: 'Scheduled' },
  { route: 'RT-Ward06-Night', ward: 'W06', vehicle: 'MH-12-MN-2287', totalStops: 42, todayStops: 0, completion: 0, lastUpdated: 'Scheduled', status: 'Scheduled' }
];

export default function RoutesPage() {
  const totalRoutes = allMockRoutes.length;
  const runningRoutes = allMockRoutes.filter((r) => r.status === 'Running').length;
  const completedRoutes = allMockRoutes.filter((r) => r.status === 'Completed').length;
  const delayedRoutes = allMockRoutes.filter((r) => r.status === 'Delayed').length;
  const scheduledRoutes = allMockRoutes.filter((r) => r.status === 'Scheduled').length;

  const avgEfficiency = Math.round(
    allMockRoutes.reduce((sum, r) => sum + r.completion, 0) / totalRoutes
  );

  const efficiencyData = Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    efficiency: Math.floor(Math.random() * 20) + 80,
  }));

  const routesByWard = allMockRoutes.reduce((acc: any, r: any) => {
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
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      card.up ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/10 text-destructive'
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Routes by Ward</CardTitle>
                <CardDescription>Route distribution across sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {routesByWard.slice(0, 6).map((item: any, idx: number) => {
                    const max = Math.max(...routesByWard.map((r: any) => r.value));
                    return (
                      <div key={idx} className="py-2.5 flex items-center gap-3">
                        <span className="text-sm font-medium w-10 flex-shrink-0">{item.name}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item.value / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground w-6 text-right">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

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
                      {activeMockRoutes.map((item) => (
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
                      {allMockRoutes.map((item) => (
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
