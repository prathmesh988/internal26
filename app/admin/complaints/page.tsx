'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { StatusBadge, PriorityBadge } from '@/components/shared';
import { useComplaints, useCitizens, useAsyncAction } from '@/hooks';
import { complaintService } from '@/services/appwrite/client';
import { formatDate } from '@/lib/utils-helpers';
import { ComplaintDetailModal } from '@/components/complaint-detail-modal';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Zap,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';

const statusStyles: Record<string, string> = {
  OPEN: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  UNDER_REVIEW: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  ASSIGNED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  IN_PROGRESS: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
  REOPENED: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

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

// We will load complaints and citizens from Appwrite live DB instead of mock array.

export default function ComplaintsPage() {
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('filtered-complaints');

  // Filters State
  const [filters, setFilters] = useState<any>({
    status: 'ALL',
    priority: 'ALL',
    ward: 'ALL',
    category: 'ALL',
  });

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Build API query parameters
  const queryFilters = useMemo(() => {
    if (activeTab === 'filtered-complaints') {
      return {
        status: filters.status,
        priority: filters.priority,
        category: filters.category,
        ward: filters.ward,
      };
    } else {
      return {
        searchQuery: searchTerm || undefined,
      };
    }
  }, [activeTab, filters, searchTerm]);

  const { data: complaintsData, loading, error, refetch } = useComplaints(queryFilters, page, itemsPerPage);
  const { data: citizensData } = useCitizens(1, 100);

  const citizenMap = useMemo(() => {
    const map = new Map<string, string>();
    if (citizensData?.data) {
      citizensData.data.forEach((c) => map.set(c.id, c.name));
    }
    return map;
  }, [citizensData]);

  const complaintsList = useMemo(() => {
    return (complaintsData?.data || []).map((c) => ({
      ...c,
      citizen: citizenMap.get(c.citizenId) || c.citizenId || 'Anonymous',
      officer: c.assignedToWorkerName || 'Unassigned',
      created: formatDate(c.createdAt),
      desc: c.description,
    }));
  }, [complaintsData, citizenMap]);

  const totalPages = Math.ceil((complaintsData?.total || 0) / itemsPerPage);

  // Stats fetching
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  const fetchStats = async () => {
    try {
      const [totalRes, pendingCount, inProgressCount, resolvedCount] = await Promise.all([
        complaintService.list(undefined, 1, 1),
        complaintService.countByStatus('OPEN'),
        complaintService.countByStatus('IN_PROGRESS'),
        complaintService.countByStatus('RESOLVED'),
      ]);
      setStats({
        total: totalRes.total,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [complaintsData]);

  const { execute: updateStatus } = useAsyncAction(
    async (id: string, newStatus: string) => {
      await complaintService.update(id, { status: newStatus as any });
      refetch();
    }
  );

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateStatus(id, newStatus);
    setSelectedComplaint(null);
  };

  const statCards = [
    { label: 'Total', value: stats.total, trend: '+12.5%', up: true, icon: AlertCircle },
    { label: 'Pending', value: stats.pending, trend: '+5%', up: false, icon: Clock },
    { label: 'In Progress', value: stats.inProgress, trend: '+8%', up: true, icon: Zap },
    { label: 'Resolved', value: stats.resolved, trend: '+15%', up: true, icon: CheckCircle },
  ];

  return (
    <>
      <SiteHeader title="Complaint Management" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat cards header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

          {/* Tabular datasets block */}
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setPage(1); }} className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="filtered-complaints">Filtered Complaints</TabsTrigger>
              <TabsTrigger value="all-complaints">All Complaints</TabsTrigger>
            </TabsList>

            {/* Filtered Complaints Tab */}
            <TabsContent value="filtered-complaints" className="space-y-4">
              {/* Filters Box */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, status: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Statuses</SelectItem>
                          <SelectItem value="OPEN">Pending</SelectItem>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="ASSIGNED">Assigned</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Priority</Label>
                      <Select
                        value={filters.priority}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, priority: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Priorities</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Ward</Label>
                      <Select
                        value={filters.ward}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, ward: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Wards" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Wards</SelectItem>
                          {['W01', 'W02', 'W03', 'W04', 'W05', 'W06'].map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Select
                        value={filters.category}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, category: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Categories</SelectItem>
                          <SelectItem value="MISSED_PICKUP">Missed Pickup</SelectItem>
                          <SelectItem value="OVERFLOWING_BINS">Overflowing Bins</SelectItem>
                          <SelectItem value="SPILLAGE">Spillage</SelectItem>
                          <SelectItem value="ILLEGAL_DUMPING">Illegal Dumping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ status: 'ALL', priority: 'ALL', ward: 'ALL', category: 'ALL' })}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Filtered list table */}
              <Card>
                <CardHeader>
                  <CardTitle>Filtered Results</CardTitle>
                  <CardDescription>Reviewing {complaintsData?.total || 0} complaints matching criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  {complaintsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Search className="size-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No matching complaints</p>
                      <p className="text-xs text-muted-foreground">Adjust filters to broaden search</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Citizen</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Officer</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-[60px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {complaintsList.map((item) => (
                            <TableRow
                              key={item.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                setSelectedComplaint(item);
                                setIsModalOpen(true);
                              }}
                            >
                              <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="font-medium">{item.citizen}</TableCell>
                              <TableCell>{item.ward}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                                  {item.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.officer}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusStyles[item.status] || ''}>
                                  {(item.status || 'OPEN').replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.created}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedComplaint(item);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <Eye className="size-3.5" />
                                </Button>
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

            {/* All Complaints Tab */}
            <TabsContent value="all-complaints" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                  <div>
                    <CardTitle>Master Registry</CardTitle>
                    <CardDescription>Complete registry log of all submitted citizen issues.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 max-w-xs w-full">
                    <Search className="size-4 text-muted-foreground absolute ml-3" />
                    <Input
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {complaintsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Search className="size-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs text-muted-foreground">Adjust text filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Citizen</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Officer</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {complaintsList.map((item) => (
                            <TableRow
                              key={item.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                setSelectedComplaint(item);
                                setIsModalOpen(true);
                              }}
                            >
                              <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="font-medium">{item.citizen}</TableCell>
                              <TableCell>{item.ward}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                                  {item.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.officer}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusStyles[item.status] || ''}>
                                  {(item.status || 'OPEN').replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.created}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination control footer */}
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
