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
import { SiteHeader } from '@/components/site-header';
import { complaintService } from '@/services/appwrite/client';
import type { Complaint } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { ComplaintDetailModal } from '@/components/complaint-detail-modal';

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

export default function DashboardComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    complaintService.list(undefined, 1, 100)
      .then((res) => setComplaints(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const recentComplaints = useMemo(() => complaints.slice(0, 15), [complaints]);

  if (loading) {
    return (
      <>
        <SiteHeader title="Recent Complaints" />
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Recent Complaints" />

        <div className="flex flex-col gap-4 py-6 px-4 lg:px-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Recent Complaint Submissions</h2>
            <p className="text-sm text-muted-foreground">
              {complaints.length} total complaints — showing the most recent {recentComplaints.length}.
            </p>
          </div>

          {recentComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No complaints found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentComplaints.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border"
                  onClick={() => {
                    setSelectedComplaint(item);
                    setIsModalOpen(true);
                  }}
                >
                  <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-[80%]">
                      {item.title}
                    </CardTitle>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                      <span>ID: {item.id.slice(0, 8)}…</span>
                      <span>{item.wardCode}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                        {(item.status || 'OPEN').replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="border-t pt-2 space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Category:</span>
                        <span>{formatCategory(item.category)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Assigned to:</span>
                        <span className="truncate max-w-[120px]">
                          {(item as any).assignedToWorkerName || 'Unassigned'}
                        </span>
                      </div>
                      <div className="text-[10px] text-right pt-1">
                        {timeAgo(item.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
