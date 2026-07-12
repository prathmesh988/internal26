'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { SiteHeader } from '@/components/site-header';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { generateDashboardMetrics } from '@/services/mock/generators';
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Truck,
  Star,
  Activity,
  MapPin,
} from 'lucide-react';
import { formatPercentage } from '@/lib/utils-helpers';

// ── Status badge styling functions ──────────────────────────────────────────

function getStatusBadgeClass(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'UNDER REVIEW':
    case 'UNDER_REVIEW':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'ASSIGNED':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'IN PROGRESS':
    case 'IN_PROGRESS':
      return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
    case 'RESOLVED':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'CLOSED':
      return 'bg-muted text-muted-foreground border-border';
    case 'REOPENED':
      return 'bg-pink-500/10 text-pink-600 border-pink- pink-500/20';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

function getPriorityBadgeClass(priority: string) {
  switch (priority.toUpperCase()) {
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'CRITICAL':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

function getVehicleStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'IDLE':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'MAINTENANCE':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'OFFLINE':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

// ── Chart data helpers ──────────────────────────────────────────────────────

function generateComplaintData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - i) * 86400000);
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      complaints: Math.floor(Math.random() * 25) + 8,
      resolved: Math.floor(Math.random() * 20) + 5,
    };
  });
}

// ── 20+ Rows of Detailed Mock Datasets ──────────────────────────────────────

const recentMockComplaints = [
  { id: 'CMP-2094', citizen: 'Aarav Mehta', category: 'Missed Pickup', ward: 'W03', priority: 'Medium', status: 'Pending', assignedTo: 'Inspector R. Sen', created: '10 min ago' },
  { id: 'CMP-2081', citizen: 'Priya Sharma', category: 'Overflowing Bins', ward: 'W01', priority: 'Critical', status: 'In Progress', assignedTo: 'Officer S. Kulkarni', created: '25 min ago' },
  { id: 'CMP-2077', citizen: 'Aditya Gupta', category: 'Illegal Dumping', ward: 'W04', priority: 'High', status: 'Assigned', assignedTo: 'Officer J. Roy', created: '1 hour ago' },
  { id: 'CMP-2065', citizen: 'Neha Verma', category: 'Spillage', ward: 'W02', priority: 'Low', status: 'Resolved', assignedTo: 'Inspector M. Kumar', created: '2 hours ago' },
  { id: 'CMP-2059', citizen: 'Rohan Deshmukh', category: 'Missed Pickup', ward: 'W05', priority: 'Medium', status: 'Under Review', assignedTo: 'Unassigned', created: '3 hours ago' },
  { id: 'CMP-2041', citizen: 'Ananya Iyer', category: 'Overflowing Bins', ward: 'W06', priority: 'Critical', status: 'Resolved', assignedTo: 'Officer R. Sen', created: '4 hours ago' },
  { id: 'CMP-2032', citizen: 'Kabir Kapoor', category: 'Illegal Dumping', ward: 'W01', priority: 'High', status: 'Pending', assignedTo: 'Unassigned', created: '6 hours ago' },
  { id: 'CMP-2022', citizen: 'Diya Joshi', category: 'Segregation Issue', ward: 'W03', priority: 'Low', status: 'Assigned', assignedTo: 'Inspector R. Sen', created: '8 hours ago' },
  { id: 'CMP-2015', citizen: 'Vikram Malhotra', category: 'Missed Pickup', ward: 'W02', priority: 'Medium', status: 'Reopened', assignedTo: 'Officer J. Roy', created: '12 hours ago' },
  { id: 'CMP-1999', citizen: 'Sanya Pillai', category: 'Spillage', ward: 'W04', priority: 'Low', status: 'Closed', assignedTo: 'Officer S. Kulkarni', created: '1 day ago' },
  { id: 'CMP-1988', citizen: 'Rahul Bansal', category: 'Overflowing Bins', ward: 'W05', priority: 'High', status: 'Resolved', assignedTo: 'Inspector M. Kumar', created: '1 day ago' },
  { id: 'CMP-1976', citizen: 'Meera Nair', category: 'Illegal Dumping', ward: 'W06', priority: 'Medium', status: 'Resolved', assignedTo: 'Officer R. Sen', created: '1 day ago' },
  { id: 'CMP-1955', citizen: 'Arjun Rao', category: 'Segregation Issue', ward: 'W02', priority: 'Low', status: 'Closed', assignedTo: 'Inspector R. Sen', created: '2 days ago' },
  { id: 'CMP-1940', citizen: 'Ishaan Trivedi', category: 'Missed Pickup', ward: 'W01', priority: 'Medium', status: 'Resolved', assignedTo: 'Officer J. Roy', created: '2 days ago' },
  { id: 'CMP-1933', citizen: 'Avani Patil', category: 'Spillage', ward: 'W03', priority: 'Low', status: 'Resolved', assignedTo: 'Inspector R. Sen', created: '3 days ago' }
];

const activeMockVehicles = [
  { id: 'MH-12-GQ-4920', driver: 'Sanjay Dutt', route: 'RT-Ward03-Primary', gpsStatus: 'Online', lastSeen: 'Just now', fuel: '85%', progress: 75, status: 'Active' },
  { id: 'MH-12-HU-9871', driver: 'Rajesh Shinde', route: 'RT-Ward01-Secondary', gpsStatus: 'Online', lastSeen: '3 min ago', fuel: '62%', progress: 40, status: 'Active' },
  { id: 'MH-12-FT-2039', driver: 'Vijay Chauhan', route: 'RT-Ward04-Express', gpsStatus: 'Idle', lastSeen: '12 min ago', fuel: '92%', progress: 95, status: 'Idle' },
  { id: 'MH-12-KL-4093', driver: 'Anil Kamble', route: 'RT-Ward02-Sweeping', gpsStatus: 'Offline', lastSeen: '1 hour ago', fuel: '40%', progress: 10, status: 'Maintenance' },
  { id: 'MH-12-ER-3829', driver: 'Dilip Rao', route: 'RT-Ward05-Bulk', gpsStatus: 'Online', lastSeen: 'Just now', fuel: '78%', progress: 60, status: 'Active' },
  { id: 'MH-12-PL-9022', driver: 'Manoj Bajpayee', route: 'RT-Ward06-Primary', gpsStatus: 'Online', lastSeen: '8 min ago', fuel: '50%', progress: 85, status: 'Active' },
  { id: 'MH-12-OP-8973', driver: 'Narendra Singh', route: 'RT-Ward01-Alternate', gpsStatus: 'Idle', lastSeen: '15 min ago', fuel: '45%', progress: 50, status: 'Idle' },
  { id: 'MH-12-XW-1049', driver: 'Sunil Shetty', route: 'RT-Ward03-Sweeping', gpsStatus: 'Offline', lastSeen: '4 hours ago', fuel: '15%', progress: 100, status: 'Offline' },
  { id: 'MH-12-QW-5867', driver: 'Devendra Patil', route: 'RT-Ward02-Primary', gpsStatus: 'Online', lastSeen: '2 min ago', fuel: '90%', progress: 30, status: 'Active' },
  { id: 'MH-12-AZ-3498', driver: 'Kailash Kher', route: 'RT-Ward05-Secondary', gpsStatus: 'Online', lastSeen: 'Just now', fuel: '72%', progress: 55, status: 'Active' }
];

const topWardsPerformance = [
  { rank: 1, ward: 'W03 (Shivajinagar)', total: 320, resolved: 298, pending: 15, avgResolution: '8.5 hrs', satisfaction: '96%' },
  { rank: 2, ward: 'W01 (Kothrud)', total: 285, resolved: 260, pending: 18, avgResolution: '10.2 hrs', satisfaction: '92%' },
  { rank: 3, ward: 'W05 (Aundh)', total: 410, resolved: 375, pending: 22, avgResolution: '12.4 hrs', satisfaction: '89%' },
  { rank: 4, ward: 'W02 (Deccan)', total: 195, resolved: 172, pending: 14, avgResolution: '14.0 hrs', satisfaction: '85%' },
  { rank: 5, ward: 'W06 (Hadapsar)', total: 350, resolved: 290, pending: 45, avgResolution: '18.6 hrs', satisfaction: '78%' },
  { rank: 6, ward: 'W04 (Camp)', total: 240, resolved: 188, pending: 40, avgResolution: '22.1 hrs', satisfaction: '72%' }
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [range, setRange] = useState<'3m' | '30d' | '7d'>('30d');

  useEffect(() => {
    setMetrics(generateDashboardMetrics());
  }, []);

  const chartData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return generateComplaintData(days);
  }, [range]);

  const displayedChartData = range === '3m' ? chartData.filter((_, i) => i % 3 === 0) : chartData;

  if (!metrics) return null;

  return (
    <>
      <SiteHeader title="Dashboard" actionLabel="Export Report" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat Cards with Highlight Pill Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Complaints',
                value: metrics.totalComplaints,
                sub: `${metrics.complaintsToday} filed today`,
                footer: 'Trending up this month',
                trend: '+12.5%',
                up: true,
                icon: AlertTriangle,
                color: 'text-destructive',
              },
              {
                title: 'Resolved',
                value: metrics.complaintsResolved,
                sub: `${formatPercentage((metrics.complaintsResolved / metrics.totalComplaints) * 100)}% resolution rate`,
                footer: 'Strong resolution performance',
                trend: '+8%',
                up: true,
                icon: CheckCircle2,
                color: 'text-emerald-500',
              },
              {
                title: 'Escalations',
                value: metrics.pendingEscalations,
                sub: 'Awaiting attention',
                footer: 'Needs immediate review',
                trend: '+3%',
                up: false,
                icon: Clock,
                color: 'text-amber-500',
              },
              {
                title: 'Route Efficiency',
                value: `${metrics.routeEfficiency}%`,
                sub: 'Average across all routes',
                footer: 'Meets performance targets',
                trend: '+4.5%',
                up: true,
                icon: TrendingUp,
                color: 'text-primary',
              },
            ].map((card) => (
              <Card key={card.title} className="bg-gradient-to-br from-card to-muted/30 shadow-sm border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">{card.title}</CardDescription>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      card.up ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {card.up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                      {card.trend}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums mt-2">{card.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                    {card.up ? <TrendingUp className="size-3 text-emerald-500" /> : <ArrowDown className="size-3 text-destructive" />}
                    {card.footer}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Chart Section */}
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Complaint Trends</CardTitle>
                <CardDescription>Submissions vs resolved tickets</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {(['3m', '30d', '7d'] as const).map((r) => (
                  <Button
                    key={r}
                    variant={range === r ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={() => setRange(r)}
                  >
                    {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 3 months'}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={displayedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 12 }}
                    cursor={{ stroke: '#e5e7eb' }}
                  />
                  <Area type="monotone" dataKey="complaints" name="Complaints" stroke="#ef4444" strokeWidth={2} fill="url(#gradComplaints)" dot={false} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#3b82f6" strokeWidth={2} fill="url(#gradResolved)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Replaced Stacked Cards with Clean Tabs layout */}
          <Tabs defaultValue="recent-complaints" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="recent-complaints">Recent Complaints</TabsTrigger>
              <TabsTrigger value="active-vehicles">Active Vehicles</TabsTrigger>
              <TabsTrigger value="top-wards">Top Wards</TabsTrigger>
            </TabsList>

            {/* Recent Complaints Tab */}
            <TabsContent value="recent-complaints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Complaint Submissions</CardTitle>
                  <CardDescription>Track new tickets and their resolution updates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Citizen</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Officer</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentMockComplaints.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                          <TableCell className="font-medium text-foreground">{item.citizen}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.ward}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                              {item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.assignedTo}</TableCell>
                          <TableCell className="text-muted-foreground">{item.created}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Active Vehicles Tab */}
            <TabsContent value="active-vehicles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sanitation Fleet Status</CardTitle>
                  <CardDescription>Real-time operating statuses and route progress of municipal vehicles.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicle</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Driver</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Route</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">GPS Status</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Seen</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fuel</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMockVehicles.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                          <TableCell className="font-medium text-foreground">{item.driver}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.route}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-xs ${item.gpsStatus === 'Online' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                              <span className={`size-1.5 rounded-full ${item.gpsStatus === 'Online' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                              {item.gpsStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{item.lastSeen}</TableCell>
                          <TableCell className="tabular-nums">{item.fuel}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${item.progress}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">{item.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getVehicleStatusBadge(item.status)}>
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

            {/* Top Wards Tab */}
            <TabsContent value="top-wards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ward Performance ranking</CardTitle>
                  <CardDescription>Cleanliness statistics and satisfaction ratings across municipal sectors.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">Rank</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Complaints</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolved</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Resolution</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Satisfaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topWardsPerformance.map((item) => (
                        <TableRow key={item.rank}>
                          <TableCell className="font-bold text-muted-foreground text-center">{item.rank}</TableCell>
                          <TableCell className="font-semibold text-foreground">{item.ward}</TableCell>
                          <TableCell className="tabular-nums">{item.total}</TableCell>
                          <TableCell className="tabular-nums text-emerald-600 font-semibold">{item.resolved}</TableCell>
                          <TableCell className="tabular-nums text-amber-600 font-semibold">{item.pending}</TableCell>
                          <TableCell className="text-muted-foreground">{item.avgResolution}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <Star className="size-3 fill-emerald-500 text-emerald-500" />
                              {item.satisfaction}
                            </span>
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
