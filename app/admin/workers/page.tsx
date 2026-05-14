'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  StatusBadge,
  MetricCard,
  ProgressIndicator,
} from '@/components/shared';
import { BarChartComponent } from '@/components/charts';
import { useWorkers, useWards } from '@/hooks';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Star,
  Eye,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils-helpers';

export default function WorkersPage() {
  const { data: workersData, loading: workersLoading } = useWorkers(1, 50);
  const { data: wards } = useWards();

  const workers = workersData?.data || [];
  const totalWorkers = workersData?.total || 0;

  const activeWorkers = workers.filter((w: any) => w.status === 'ACTIVE').length;
  const onLeaveWorkers = workers.filter((w: any) => w.status === 'ON_LEAVE').length;
  const avgRating = workers.length > 0 ? (workers.reduce((sum: number, w: any) => sum + w.averageRating, 0) / workers.length).toFixed(1) : 0;
  const avgCompletion = workers.length > 0 ? Math.round(workers.reduce((sum: number, w: any) => sum + w.completionRate, 0) / workers.length) : 0;

  // Chart data
  const performanceData = workers.slice(0, 10).map((w: any) => ({
    name: w.name.split(' ')[0],
    rating: Math.round(w.averageRating * 10),
  }));

  const roleDistribution = workers.reduce((acc: any, w: any) => {
    const existing = acc.find((item: any) => item.name === w.role);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: w.role, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Worker Management</h1>
        <p className="text-muted-foreground">Monitor worker performance and assignments</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Workers"
          value={totalWorkers}
          icon={<Users className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="Active"
          value={activeWorkers}
          description={`${onLeaveWorkers} on leave`}
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
        />
        <MetricCard
          title="Avg Completion"
          value={`${avgCompletion}%`}
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="Avg Rating"
          value={avgRating}
          unit="/ 5.0"
          icon={<Star className="w-5 h-5 text-yellow-500" />}
        />
      </div>

      {/* Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChartComponent
          data={performanceData}
          title="Top Worker Ratings"
          dataKey="rating"
          barColor="#eab308"
          height={300}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Worker Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleDistribution.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                  <span className="text-foreground/80">{item.name}</span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Performance Alert */}
      {workers.some((w: any) => w.completionRate < 80) && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle>Performance Alert</AlertTitle>
          <AlertDescription>
            {workers.filter((w: any) => w.completionRate < 80).length} worker(s) have completion rates below 80%
          </AlertDescription>
        </Alert>
      )}

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Workers List</CardTitle>
        </CardHeader>
        <CardContent>
          {workersLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading workers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Role</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Ward</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Completion</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Rating</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Pickups</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker: any) => (
                    <tr key={worker.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="py-3 px-4 text-foreground/80 font-medium">{worker.name}</td>
                      <td className="py-3 px-4 text-foreground/80">
                        <Badge variant="secondary" className="text-xs">
                          {worker.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-foreground/80">{worker.wardCode || '-'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={worker.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-16">
                          <ProgressIndicator
                            value={worker.completionRate}
                            max={100}
                            color={worker.completionRate > 90 ? 'success' : worker.completionRate > 80 ? 'warning' : 'danger'}
                            showPercent={true}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-foreground/80 font-semibold">
                            {worker.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground/80 text-center">
                        {formatNumber(worker.totalPickups)}
                      </td>
                      <td className="py-3 px-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{worker.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm text-muted-foreground">Email</label>
                                  <p className="text-foreground text-sm">{worker.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Phone</label>
                                  <p className="text-foreground text-sm">{worker.phone}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm text-muted-foreground">Hire Date</label>
                                  <p className="text-foreground text-sm">{formatDate(worker.hireDate)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Total Pickups</label>
                                  <p className="text-foreground text-sm">{formatNumber(worker.totalPickups)}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Completion Rate</label>
                                <ProgressIndicator
                                  value={worker.completionRate}
                                  max={100}
                                  label="Performance"
                                  color={worker.completionRate > 90 ? 'success' : 'warning'}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
