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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SiteHeader } from '@/components/site-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge, PriorityBadge } from '@/components/shared';
import { useComplaints } from '@/hooks';
import { ComplaintDetailModal } from '@/components/complaint-detail-modal';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  formatDate,
  getComplaintSLA,
  getDaysFromNow,
} from '@/lib/utils-helpers';

const statusStyles: Record<string, string> = {
  OPEN: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  ESCALATED: 'bg-destructive/10 text-destructive border-destructive/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
};

export default function MyComplaintsPage() {
  const { data: allCitizenComplaints } = useComplaints({ citizenId: 'citizen-001' }, 1, 100);

  const complaints = useMemo(() => {
    return (allCitizenComplaints?.data || []).map((c) => ({
      ...c,
      citizen: 'citizen-001',
      officer: c.assignedToWorkerName || 'Unassigned',
      created: formatDate(c.createdAt),
      desc: c.description,
    }));
  }, [allCitizenComplaints]);

  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters State
  const [filters, setFilters] = useState<any>({
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
  });

  const open = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;

  const statCards = [
    { label: 'Total Filed', value: complaints.length, trend: 'All time', up: true, icon: FileText },
    { label: 'Open / Active', value: open, trend: 'Awaiting completion', up: false, icon: AlertCircle },
    { label: 'In Progress', value: inProgress, trend: 'Being handled', up: true, icon: Clock },
    { label: 'Resolved', value: resolved, trend: 'Completed', up: true, icon: CheckCircle },
  ];

  // Dynamic filter application
  const filteredList = useMemo(() => {
    return complaints.filter((c) => {
      if (filters.status !== 'ALL' && c.status !== filters.status) return false;
      if (filters.priority !== 'ALL' && c.priority !== filters.priority) return false;
      if (filters.category !== 'ALL' && c.category !== filters.category) return false;
      return true;
    });
  }, [complaints, filters]);

  // Master list with text search applied
  const masterList = useMemo(() => {
    return complaints.filter((c) => {
      const match = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(match) ||
        c.title.toLowerCase().includes(match) ||
        c.category.toLowerCase().includes(match)
      );
    });
  }, [complaints, searchTerm]);

  return (
    <>
      <SiteHeader
        title="My Complaints"
        actionLabel="File New"
        onAction={() => window.location.href = '/citizen/file-complaint'}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card key={card.label} className="bg-gradient-to-br from-card to-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">{card.label}</CardDescription>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      card.up ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
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

          {/* Replaced standalone layout with Tab selection block */}
          <Tabs defaultValue="filter-complaints" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="filter-complaints">Filter Complaints</TabsTrigger>
              <TabsTrigger value="master-registry">Your Complaints</TabsTrigger>
            </TabsList>

            {/* Filter Complaints Tab */}
            <TabsContent value="filter-complaints" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Filter Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, status: val }))}
                      >
                        <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Statuses</SelectItem>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Priority</Label>
                      <Select
                        value={filters.priority}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, priority: val }))}
                      >
                        <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
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
                      <Label>Category</Label>
                      <Select
                        value={filters.category}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, category: val }))}
                      >
                        <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Categories</SelectItem>
                          <SelectItem value="MISSED_PICKUP">Missed Pickup</SelectItem>
                          <SelectItem value="OVERFLOW">Overflow</SelectItem>
                          <SelectItem value="SPILL">Spillage</SelectItem>
                          <SelectItem value="ILLEGAL_DUMPING">Illegal Dumping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => setFilters({ status: 'ALL', priority: 'ALL', category: 'ALL' })}>
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Filtered list Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Filtered Results</CardTitle>
                  <CardDescription>Found {filteredList.length} complaints matching filters</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Search className="size-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No matching complaints found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredList.map((complaint) => {
                        const ageInHours = getDaysFromNow(complaint.createdAt) * 24;
                        const sla = getComplaintSLA(complaint.priority);
                        const isOverdue = ageInHours > sla;

                        return (
                          <div
                            key={complaint.id}
                            className="py-4 hover:bg-muted/30 -mx-6 px-6 cursor-pointer transition-colors border-b last:border-b-0"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setIsModalOpen(true);
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm truncate">{complaint.title}</p>
                                  {isOverdue && complaint.status !== 'RESOLVED' && (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{complaint.desc}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <PriorityBadge priority={complaint.priority as any} />
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusStyles[complaint.status] || ''}`}>
                                  {complaint.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Filed {formatDate(complaint.createdAt)} · Ward {complaint.wardCode}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Master Registry Tab */}
            <TabsContent value="master-registry" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                  <div>
                    <CardTitle>Your Complete Complaints History</CardTitle>
                    <CardDescription>Master directory logs containing all submissions</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 max-w-xs w-full">
                    <Search className="size-4 text-muted-foreground absolute ml-3" />
                    <Input
                      placeholder="Search title, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {masterList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No complaints found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filed Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {masterList.map((item) => (
                            <TableRow
                              key={item.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                setSelectedComplaint(item);
                                setIsModalOpen(true);
                              }}
                            >
                              <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell className="capitalize text-muted-foreground">{item.category.toLowerCase().replace(/_/g, ' ')}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusStyles[item.status] || ''}`}>
                                  {item.status.replace(/_/g, ' ')}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
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
