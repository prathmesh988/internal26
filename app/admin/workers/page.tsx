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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SiteHeader } from '@/components/site-header';
import { StatusBadge } from '@/components/shared';
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
  Users,
  TrendingUp,
  AlertTriangle,
  Star,
  Eye,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils-helpers';
import { useWorkers } from '@/hooks';

export default function WorkersPage() {
  const { data: allWorkersData } = useWorkers(1, 100);
  const workers = useMemo(() => {
    return allWorkersData?.data || [];
  }, [allWorkersData]);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Calculable statistics
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((w) => w.status === 'ACTIVE').length;
  const onLeaveWorkers = workers.filter((w) => w.status === 'ON_LEAVE').length;
  const avgRating = (workers.reduce((sum, w) => sum + w.averageRating, 0) / totalWorkers).toFixed(1);
  const avgCompletion = Math.round(workers.reduce((sum, w) => sum + w.completionRate, 0) / totalWorkers);

  const performanceData = useMemo(() => {
    return workers.slice(0, 10).map((w) => ({
      name: w.name.split(' ')[0],
      rating: Math.round(w.averageRating * 10),
    }));
  }, [workers]);

  const roleDistribution = useMemo(() => {
    return workers.reduce((acc: any, w: any) => {
      const existing = acc.find((item: any) => item.name === w.role);
      if (existing) { existing.value++; }
      else { acc.push({ name: w.role, value: 1 }); }
      return acc;
    }, []);
  }, [workers]);

  const statCards = [
    { label: 'Total Workers', value: totalWorkers, trend: '+3%', up: true, icon: Users },
    { label: 'Active', value: activeWorkers, trend: `${onLeaveWorkers} on leave`, up: true, icon: TrendingUp },
    { label: 'Avg Completion', value: `${avgCompletion}%`, trend: '+5%', up: true, icon: TrendingUp },
    { label: 'Avg Rating', value: `${avgRating}/5`, trend: '+0.3', up: true, icon: Star },
  ];

  const lowPerformers = workers.filter((w) => w.completionRate < 80);

  // Search filter
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const match = searchTerm.toLowerCase();
      return (
        w.name.toLowerCase().includes(match) ||
        w.role.toLowerCase().includes(match) ||
        (w.wardCode && w.wardCode.toLowerCase().includes(match))
      );
    });
  }, [workers, searchTerm]);

  // Paginated workers
  const paginatedWorkers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredWorkers.slice(start, start + itemsPerPage);
  }, [filteredWorkers, page]);

  const totalPages = Math.ceil(filteredWorkers.length / itemsPerPage);

  return (
    <>
      <SiteHeader title="Worker Management" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

          {/* Performance Warning Alert */}
          {lowPerformers.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <AlertTriangle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Performance Alert</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lowPerformers.length} worker{lowPerformers.length > 1 ? 's' : ''} with completion rates below 80%. Immediate operational review recommended.
                </p>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <Card>
            <CardHeader>
              <CardTitle>Top Worker Ratings</CardTitle>
              <CardDescription>Performance scores (×10) for top workers</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={performanceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 12 }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="rating" name="Rating ×10" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>



          {/* Interactive tabs */}
          <Tabs defaultValue="active-workers" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="active-workers">Active Workers</TabsTrigger>
              <TabsTrigger value="all-workers">All Workers</TabsTrigger>
            </TabsList>

            {/* Active Workers Tab */}
            <TabsContent value="active-workers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>On-Duty Staff</CardTitle>
                  <CardDescription>Staff members currently on active duty across wards.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pickups</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workers.filter(w => w.status === 'ACTIVE').map((worker) => (
                          <TableRow key={worker.id}>
                            <TableCell className="font-semibold text-foreground">{worker.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs font-medium">{worker.role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{worker.wardCode}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${worker.completionRate > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${worker.completionRate}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground tabular-nums">{worker.completionRate}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 font-semibold text-xs text-foreground/80">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                {worker.averageRating}
                              </div>
                            </TableCell>
                            <TableCell className="tabular-nums text-muted-foreground">{worker.totalPickups}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Workers Tab */}
            <TabsContent value="all-workers" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                  <div>
                    <CardTitle>Staff Directory</CardTitle>
                    <CardDescription>Master registry containing all staff member details.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 max-w-xs w-full">
                    <Search className="size-4 text-muted-foreground absolute ml-3" />
                    <Input
                      placeholder="Search by name, role..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {paginatedWorkers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No workers found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedWorkers.map((worker) => (
                            <TableRow key={worker.id}>
                              <TableCell className="font-semibold text-foreground">{worker.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">{worker.role}</Badge>
                              </TableCell>
                              <TableCell>{worker.wardCode || '—'}</TableCell>
                              <TableCell><StatusBadge status={worker.status} /></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${worker.completionRate > 90 ? 'bg-emerald-500' : worker.completionRate > 80 ? 'bg-amber-500' : 'bg-destructive'}`}
                                      style={{ width: `${worker.completionRate}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground tabular-nums">{worker.completionRate}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="size-3 text-amber-400 fill-amber-400" />
                                  <span className="text-sm font-semibold tabular-nums">{worker.averageRating.toFixed(1)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedWorker(worker)}>
                                      <Eye className="size-3.5" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle>{selectedWorker?.name}</DialogTitle>
                                    </DialogHeader>
                                    {selectedWorker && (
                                      <div className="space-y-4 pt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                                            <p className="text-sm">{selectedWorker.email}</p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                                            <p className="text-sm">{selectedWorker.phone}</p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hire Date</p>
                                            <p className="text-sm">{formatDate(selectedWorker.hireDate)}</p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Pickups</p>
                                            <p className="text-sm font-semibold">{formatNumber(selectedWorker.totalPickups)}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <Button key={i} size="sm" variant={page === i + 1 ? 'default' : 'outline'} onClick={() => setPage(i + 1)}>
                            {i + 1}
                          </Button>
                        ))}
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
}
