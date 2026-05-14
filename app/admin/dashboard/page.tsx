'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedTable } from '@/components/enhanced-table';
import { PageTransition } from '@/components/animated';
import {
  TrendChart,
  BarChartComponent,
  PieChartComponent,
} from '@/components/charts';
import { generateDashboardMetrics } from '@/services/mock/generators';
import {
  useComplaints,
  useRoutes,
  useWards,
  useActiveVehicles,
} from '@/hooks';
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Zap,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatDate, formatNumber, formatPercentage } from '@/lib/utils-helpers';

export default function AdminDashboard() {
  const { data: complaintsData } = useComplaints({}, 1, 10);
  const { data: wards } = useWards();
  const { data: activeVehicles } = useActiveVehicles();

  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    setMetrics(generateDashboardMetrics());
  }, []);

  if (!metrics) return null;

  const complaintsTrendData = Array.from({ length: 30 }, (_, i) => ({
    date: formatDate(new Date(Date.now() - (30 - i) * 86400000).toISOString()),
    value: Math.floor(Math.random() * 30) + 10,
  }));

  const routeEfficiencyData = Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    efficiency: Math.floor(Math.random() * 30) + 70,
  }));

  const complaintStatusData = [
    { name: 'Open', value: Math.floor(metrics.totalComplaints * 0.01) },
    { name: 'In Progress', value: Math.floor(metrics.totalComplaints * 0.52) },
    { name: 'Resolved', value: metrics.complaintsResolved },
    { name: 'Escalated', value: Math.floor(metrics.totalComplaints * 0.17) },
  ];

  const MetricCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    trend,
  }: {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardContent className="p-6 flex flex-col h-full justify-between flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
              {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
            </div>
            <div className="text-primary/80 ml-4">{Icon}</div>
          </div>
          <div className="mt-auto pt-4 min-h-[24px]">
            {trend && (
              <div className="flex items-center gap-2 text-xs">
                {trend.isPositive ? (
                  <ArrowUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-600" />
                )}
                <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Real-time waste management overview</p>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Total Complaints"
              value={metrics.totalComplaints}
              subtext={`${metrics.complaintsToday} filed today`}
              icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
              trend={{ value: 12, isPositive: false }}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Resolved"
              value={metrics.complaintsResolved}
              subtext={`${formatPercentage((metrics.complaintsResolved / metrics.totalComplaints) * 100)}% resolution rate`}
              icon={<CheckCircle2 className="w-8 h-8 text-green-500" />}
              trend={{ value: 8, isPositive: true }}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Escalations"
              value={metrics.pendingEscalations}
              subtext="Awaiting attention"
              icon={<Clock className="w-8 h-8 text-yellow-500" />}
              trend={{ value: 3, isPositive: false }}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MetricCard
              title="Route Efficiency"
              value={`${metrics.routeEfficiency}%`}
              subtext="Average across all routes"
              icon={<TrendingUp className="w-8 h-8 text-blue-500" />}
              trend={{ value: 5, isPositive: true }}
            />
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-foreground font-bold">Complaint Trends</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart data={complaintsTrendData} height={300} />
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-foreground font-bold">By Status</CardTitle>
              <CardDescription>Distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartComponent data={complaintStatusData} height={300} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-foreground font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Active Vehicles
              </CardTitle>
              <CardDescription>On route</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(activeVehicles || []).slice(0, 5).map((vehicle: any) => (
                  <div key={vehicle.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80">{vehicle.registrationNumber}</span>
                    <Badge className="bg-green-900 text-green-200 text-xs">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-foreground font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Wards
              </CardTitle>
              <CardDescription>By cleanliness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(wards || []).slice(0, 5).map((ward: any) => (
                  <div key={ward.code} className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80">{ward.code}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${ward.cleanlinessScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground/80 w-8">
                        {ward.cleanlinessScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Route Efficiency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground font-bold">Monthly Efficiency</CardTitle>
              <CardDescription>Route performance</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={routeEfficiencyData}
                title=""
                dataKey="efficiency"
                barColor="#3b82f6"
                height={300}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Complaints Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground font-bold">Recent Complaints</CardTitle>
              <CardDescription>Latest submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedTable
                data={(complaintsData?.data || []).slice(0, 10)}
                onSelectionChange={(selected) => console.log('Selected:', selected)}
                onRowAction={(action, id) => console.log(`${action}: ${id}`)}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
