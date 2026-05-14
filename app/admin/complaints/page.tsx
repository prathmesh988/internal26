'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  StatusBadge,
  PriorityBadge,
  MetricCard,
  EmptyState,
} from '@/components/shared';
import { useComplaints, useAsyncAction } from '@/hooks';
import { complaintService } from '@/services/appwrite/client';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Zap,
  Search,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils-helpers';

export default function ComplaintsPage() {
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const { data, loading, error, refetch } = useComplaints(filters, page, 25);

  // Action hooks
  const { execute: updateStatus, loading: updatingStatus } = useAsyncAction(
    (id: string, status: string) => complaintService.update(id, { status: status as any }),
    { onSuccess: () => refetch() }
  );

  const { execute: escalate, loading: escalating } = useAsyncAction(
    (id: string) => complaintService.update(id, { status: 'ESCALATED' }),
    { onSuccess: () => refetch() }
  );

  const complaints = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Complaint Management</h1>
        <p className="text-muted-foreground">Track and manage all citizen complaints</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Complaints"
          value={total}
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
        />
        <MetricCard
          title="Open"
          value={complaints.filter((c: any) => c.status === 'OPEN').length}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
        <MetricCard
          title="In Progress"
          value={complaints.filter((c: any) => c.status === 'IN_PROGRESS').length}
          icon={<Zap className="w-5 h-5 text-blue-500" />}
        />
        <MetricCard
          title="Resolved"
          value={complaints.filter((c: any) => c.status === 'RESOLVED').length}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="ESCALATED">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
              <Select onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Ward</label>
              <Select onValueChange={(value) => setFilters({ ...filters, ward: value })}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {['W01', 'W02', 'W03', 'W04', 'W05', 'W06'].map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Category</label>
              <Select onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="MISSED_PICKUP">Missed Pickup</SelectItem>
                  <SelectItem value="OVERFLOW">Overflow</SelectItem>
                  <SelectItem value="SPILL">Spill</SelectItem>
                  <SelectItem value="ILLEGAL_DUMPING">Illegal Dumping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
              variant="outline"
              className="text-foreground/80"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">All Complaints ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={<Search className="w-12 h-12 text-muted-foreground" />}
              title="No complaints found"
              description="Try adjusting your filters"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Title</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Ward</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Priority</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Assigned To</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Filed</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint: any) => (
                    <tr key={complaint.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="py-3 px-4 text-foreground/80 font-mono text-xs">{complaint.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-foreground/80">{complaint.title}</td>
                      <td className="py-3 px-4 text-foreground/80">{complaint.wardCode}</td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={complaint.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {complaint.assignedToWorkerName || '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {formatDate(complaint.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => setSelectedComplaint(complaint)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Complaint Details</DialogTitle>
                              </DialogHeader>
                              {selectedComplaint && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">Title</label>
                                    <p className="text-foreground">{selectedComplaint.title}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Description</label>
                                    <p className="text-foreground text-sm">{selectedComplaint.description}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm text-muted-foreground">Status</label>
                                      <StatusBadge status={selectedComplaint.status} />
                                    </div>
                                    <div>
                                      <label className="text-sm text-muted-foreground">Priority</label>
                                      <PriorityBadge priority={selectedComplaint.priority} />
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-6">
                                    {selectedComplaint.status !== 'RESOLVED' && (
                                      <>
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => {
                                            updateStatus(selectedComplaint.id, 'RESOLVED');
                                            setSelectedComplaint(null);
                                          }}
                                          disabled={updatingStatus}
                                        >
                                          Mark Resolved
                                        </Button>
                                        {selectedComplaint.escalationCount < 2 && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              escalate(selectedComplaint.id);
                                              setSelectedComplaint(null);
                                            }}
                                            disabled={escalating}
                                          >
                                            Escalate
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="text-slate-300"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                      className={page === pageNum ? 'bg-blue-600' : 'text-slate-300'}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              className="text-foreground/80"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
