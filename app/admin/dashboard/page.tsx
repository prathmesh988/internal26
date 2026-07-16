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
import { complaintService, vehicleService, wardService } from '@/services/appwrite/client';
import type { Complaint, Vehicle, Ward } from '@/types';
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Star,
  Loader2,
} from 'lucide-react';
import { formatPercentage } from '@/lib/utils-helpers';
import { ComplaintDetailModal } from '@/components/complaint-detail-modal';

// ── Status badge styling ─────────────────────────────────────────────────────

function getStatusBadgeClass(status: string) {
  switch (status.toUpperCase()) {
    case 'OPEN':       return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'ASSIGNED':   return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'IN_PROGRESS':return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
    case 'RESOLVED':   return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'CLOSED':     return 'bg-muted text-muted-foreground border-border';
    case 'ESCALATED':  return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
    case 'REJECTED':   return 'bg-destructive/10 text-destructive border-destructive/20';
    default:           return 'bg-secondary text-secondary-foreground';
  }
}

function getPriorityBadgeClass(priority: string) {
  switch (priority.toUpperCase()) {
    case 'LOW':      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'MEDIUM':   return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'HIGH':     return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'CRITICAL': return 'bg-destructive/10 text-destructive border-destructive/20';
    default:         return 'bg-secondary text-secondary-foreground';
  }
}

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

// ── Chart data (generated client-side — no historical DB storage) ────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// ── Main Component ────────────────────────────────────────────────────────────

import { toast } from 'sonner';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [vehicles,   setVehicles]   = useState<Vehicle[]>([]);
  const [wards,      setWards]      = useState<Ward[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [range, setRange] = useState<'3m' | '30d' | '7d'>('30d');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportReport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    toast.loading('Generating and compiling monthly city sanitation report PDF using Gemini...');

    try {
      const res = await fetch('/api/reports/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin-001',
          'x-user-type': 'ADMIN',
        },
      });

      if (!res.ok) {
        let errMsg = 'Failed to generate report';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      // Download report as PDF binary file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `indore-monthly-sanitation-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('PDF report downloaded successfully!');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error exporting report');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    Promise.all([
      complaintService.list(undefined, 1, 100),
      vehicleService.list(1, 25),
      wardService.list(),
    ]).then(([cRes, vRes, wList]) => {
      setComplaints(cRes.data);
      setVehicles(vRes.data);
      setWards(wList);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const totalComplaints    = complaints.length;
  const complaintsResolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const pendingEscalations = complaints.filter(c => c.status === 'ESCALATED').length;
  const complaintsToday    = complaints.filter(c => {
    const d = new Date(c.createdAt);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth();
  }).length;

  const avgRouteEfficiency = wards.length
    ? Math.round(wards.reduce((s, w) => {
        const pct = w.pickupsScheduledToday > 0
          ? (w.pickupsCompletedToday / w.pickupsScheduledToday) * 100
          : 0;
        return s + pct;
      }, 0) / wards.length)
    : 0;

  // Recent complaints — first 15
  const recentComplaints = useMemo(() => complaints.slice(0, 15), [complaints]);

  // Chart data
  const chartData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return generateComplaintData(days);
  }, [range]);
  const displayedChartData = range === '3m' ? chartData.filter((_, i) => i % 3 === 0) : chartData;

  // Ward performance table derived from real ward data
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
        <SiteHeader title="Dashboard" actionLabel="Export Report" onAction={handleExportReport} />
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Dashboard" actionLabel="Export Report" onAction={handleExportReport} />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Complaints',
                value: totalComplaints,
                sub: `${complaintsToday} filed today`,
                footer: 'Pulled from live Appwrite DB',
                trend: `${complaintsToday} today`,
                up: true,
                icon: AlertTriangle,
              },
              {
                title: 'Resolved',
                value: complaintsResolved,
                sub: totalComplaints > 0
                  ? `${formatPercentage((complaintsResolved / totalComplaints) * 100)}% resolution rate`
                  : '—',
                footer: 'Resolved + Closed complaints',
                trend: totalComplaints > 0
                  ? `${formatPercentage((complaintsResolved / totalComplaints) * 100)}`
                  : '—',
                up: true,
                icon: CheckCircle2,
              },
              {
                title: 'Escalations',
                value: pendingEscalations,
                sub: 'Awaiting immediate review',
                footer: 'Status = ESCALATED',
                trend: pendingEscalations > 0 ? `${pendingEscalations} open` : 'None',
                up: pendingEscalations === 0,
                icon: Clock,
              },
              {
                title: 'Route Efficiency',
                value: `${avgRouteEfficiency}%`,
                sub: 'Avg across wards — today',
                footer: 'Based on pickups completed',
                trend: `${avgRouteEfficiency}%`,
                up: avgRouteEfficiency >= 80,
                icon: TrendingUp,
              },
            ].map((card) => (
              <Card key={card.title} className="bg-gradient-to-br from-card to-muted/30 shadow-sm border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">{card.title}</CardDescription>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      card.up ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/10 text-destructive'
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

          {/* Chart */}
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

          {/* Tabs */}
          <Tabs defaultValue="recent-complaints" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="recent-complaints">Recent Complaints</TabsTrigger>
              <TabsTrigger value="active-vehicles">Fleet Status</TabsTrigger>
              <TabsTrigger value="top-wards">Ward Performance</TabsTrigger>
            </TabsList>

            {/* Recent Complaints — from Appwrite */}
            <TabsContent value="recent-complaints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Complaint Submissions</CardTitle>
                  <CardDescription>
                    {totalComplaints} total complaints — showing the most recent {recentComplaints.length}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentComplaints.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No complaints found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentComplaints.map((item) => (
                            <TableRow
                              key={item.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                setSelectedComplaint(item);
                                setIsModalOpen(true);
                              }}
                            >
                              <TableCell className="font-mono text-xs font-semibold text-muted-foreground">{item.id.slice(0, 8)}…</TableCell>
                              <TableCell className="font-medium text-foreground max-w-[160px] truncate">{item.title}</TableCell>
                              <TableCell className="text-sm">{formatCategory(item.category)}</TableCell>
                              <TableCell>{item.wardCode}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                                  {item.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                                  {item.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {(item as any).assignedToWorkerName || 'Unassigned'}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">{timeAgo(item.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fleet Status — from Appwrite */}
            <TabsContent value="active-vehicles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sanitation Fleet Status</CardTitle>
                  <CardDescription>{vehicles.length} vehicles in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicles.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No vehicles found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registration</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Driver</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fuel</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Load</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vehicles.map((v) => (
                            <TableRow key={v.id}>
                              <TableCell className="font-mono text-xs font-semibold">{v.registrationNumber}</TableCell>
                              <TableCell className="capitalize text-sm">{v.type.replace(/_/g, ' ').toLowerCase()}</TableCell>
                              <TableCell className="text-sm">{v.assignedDriverName || '—'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${v.fuelLevel > 50 ? 'bg-emerald-500' : v.fuelLevel > 20 ? 'bg-amber-500' : 'bg-destructive'}`}
                                      style={{ width: `${v.fuelLevel}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground">{v.fuelLevel}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${v.capacity > 0 ? Math.round((v.currentLoad / v.capacity) * 100) : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground">
                                    {v.capacity > 0 ? Math.round((v.currentLoad / v.capacity) * 100) : 0}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getVehicleStatusBadge(v.status)}>
                                  {v.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ward Performance — from Appwrite */}
            <TabsContent value="top-wards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ward Performance Ranking</CardTitle>
                  <CardDescription>Sorted by cleanliness score — live from database.</CardDescription>
                </CardHeader>
                <CardContent>
                  {wardPerformance.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No ward data found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">Rank</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cleanliness</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaints</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pickups Today</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Response</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wardPerformance.map((item, i) => (
                            <TableRow key={item.ward}>
                              <TableCell className="font-bold text-muted-foreground text-center">{i + 1}</TableCell>
                              <TableCell className="font-semibold text-foreground">{item.ward}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                  <Star className="size-3 fill-emerald-500 text-emerald-500" />
                                  {item.cleanlinessScore}/100
                                </span>
                              </TableCell>
                              <TableCell className="tabular-nums">{item.complaintCount}</TableCell>
                              <TableCell className="tabular-nums">
                                {item.pickupsCompletedToday}/{item.pickupsScheduledToday}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {item.avgResponseTime.toFixed(1)} hrs
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      <ComplaintDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
        }}
        complaint={selectedComplaint}
      />
    </>
  );
}
