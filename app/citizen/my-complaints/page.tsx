'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, PriorityBadge, MetricCard, EmptyState } from '@/components/shared';
import { PageTransition } from '@/components/animated';
import { useComplaints } from '@/hooks';
import { FileText, CheckCircle, Clock, AlertCircle, Eye, Search } from 'lucide-react';
import { formatDate, calculateComplaintAge, getComplaintSLA } from '@/lib/utils-helpers';

export default function MyComplaintsPage() {
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const { data, loading } = useComplaints(filters, page, 10);

  const complaints = data?.data || [];
  const total = data?.total || 0;

  const open = complaints.filter((c: any) => c.status === 'OPEN').length;
  const inProgress = complaints.filter((c: any) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c: any) => c.status === 'RESOLVED').length;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Complaints</h1>
          <p className="text-slate-600">View and track all your filed complaints</p>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <MetricCard
              title="Total"
              value={total}
              icon={<FileText className="w-5 h-5 text-red-500" />}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <MetricCard
              title="Open"
              value={open}
              icon={<AlertCircle className="w-5 h-5 text-yellow-500" />}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <MetricCard
              title="In Progress"
              value={inProgress}
              icon={<Clock className="w-5 h-5 text-blue-500" />}
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <MetricCard
              title="Resolved"
              value={resolved}
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            />
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Filter</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Status</label>
              <Select onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Priority</label>
              <Select onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Category</label>
              <Select onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MISSED_PICKUP">Missed Pickup</SelectItem>
                  <SelectItem value="OVERFLOW">Overflow</SelectItem>
                  <SelectItem value="SPILL">Spillage</SelectItem>
                  <SelectItem value="ILLEGAL_DUMPING">Illegal Dumping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => {
              setFilters({});
              setPage(1);
            }}
            variant="outline"
            className="mt-4"
          >
            Reset Filters
          </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complaints List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Complaints</CardTitle>
            </CardHeader>
            <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={<Search className="w-12 h-12 text-slate-400" />}
              title="No complaints found"
              description="Try adjusting your filters or file a new complaint"
            />
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint: any) => {
                const age = calculateComplaintAge(complaint.createdAt);
                const sla = getComplaintSLA(complaint.priority);
                const isOverdue = age > sla;

                return (
                  <Dialog key={complaint.id}>
                    <DialogTrigger asChild>
                      <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{complaint.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{complaint.description}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <StatusBadge status={complaint.status} />
                            <PriorityBadge priority={complaint.priority} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Filed on {formatDate(complaint.createdAt)}</span>
                          {isOverdue && complaint.status !== 'RESOLVED' && (
                            <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                          )}
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{complaint.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-600 font-medium">Description</label>
                          <p className="text-sm text-slate-900 mt-1">{complaint.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-slate-600 font-medium">Status</label>
                            <StatusBadge status={complaint.status} />
                          </div>
                          <div>
                            <label className="text-sm text-slate-600 font-medium">Priority</label>
                            <PriorityBadge priority={complaint.priority} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-slate-600 font-medium">Ward</label>
                            <p className="text-sm text-slate-900 mt-1">{complaint.wardCode}</p>
                          </div>
                          <div>
                            <label className="text-sm text-slate-600 font-medium">Category</label>
                            <Badge variant="secondary">{complaint.category}</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-slate-600 font-medium">Filed On</label>
                          <p className="text-sm text-slate-900 mt-1">
                            {formatDate(complaint.createdAt, 'long')}
                          </p>
                        </div>
                        {complaint.assignedToWorkerName && (
                          <div>
                            <label className="text-sm text-slate-600 font-medium">Assigned To</label>
                            <p className="text-sm text-slate-900 mt-1">{complaint.assignedToWorkerName}</p>
                          </div>
                        )}
                        {complaint.status === 'RESOLVED' && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              ✓ This complaint has been resolved. Thank you for your feedback!
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {Math.ceil(total / 10) > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(3, Math.ceil(total / 10)) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                disabled={page === Math.ceil(total / 10)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
