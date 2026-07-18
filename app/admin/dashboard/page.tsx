'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Loader2,
} from 'lucide-react';
import { formatPercentage } from '@/lib/utils-helpers';

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

// ── Main Component ────────────────────────────────────────────────────────────

import { toast } from 'sonner';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [vehicles,   setVehicles]   = useState<Vehicle[]>([]);
  const [wards,      setWards]      = useState<Ward[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [range, setRange] = useState<'3m' | '30d' | '7d'>('30d');
  const [isExporting, setIsExporting] = useState(false);

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

  // Chart data
  const chartData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return generateComplaintData(days);
  }, [range]);
  const displayedChartData = range === '3m' ? chartData.filter((_, i) => i % 3 === 0) : chartData;

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

        </div>
      </div>
    </>
  );
}
