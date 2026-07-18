'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { AlertCircle, User } from 'lucide-react';
import { ComplaintDetailModal } from '@/components/complaint-detail-modal';

function getStatusBadgeClass(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'UNDER REVIEW':
    case 'UNDER_REVIEW':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'ASSIGNED':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'IN PROGRESS':
    case 'IN_PROGRESS':
      return 'bg-sky-500/10 text-sky-600 border-sky-500/20';
    case 'RESOLVED':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'CLOSED':
      return 'bg-muted text-muted-foreground border-border';
    case 'REOPENED':
      return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

const myMockComplaints = [
  { id: 'CMP-1948', category: 'Overflowing Bins', status: 'In Progress', createdOn: '2026-07-09 14:15', lastActivity: 'Worker dispatched', estResolution: 'Today, 18:00' },
  { id: 'CMP-1650', category: 'Missed Pickup', status: 'Under Review', createdOn: '2026-07-08 10:20', lastActivity: 'Assigned to Ward 05 Inspector', estResolution: 'Tomorrow, 12:00' },
  { id: 'CMP-1432', category: 'Illegal Dumping', status: 'Closed', createdOn: '2026-07-06 08:30', lastActivity: 'Site cleared by cleanup crew', estResolution: 'Resolved' },
  { id: 'CMP-1299', category: 'Missed Pickup', status: 'Reopened', createdOn: '2026-07-05 09:12', lastActivity: 'Reopened due to missed lane', estResolution: 'Today, 17:00' },
  { id: 'CMP-0654', category: 'Missed Pickup', status: 'Resolved', createdOn: '2026-06-29 09:00', lastActivity: 'Resolved by replacement truck', estResolution: 'Resolved' },
  { id: 'CMP-0321', category: 'Overflowing Bins', status: 'Closed', createdOn: '2026-06-20 11:45', lastActivity: 'Bin replaced & emptied', estResolution: 'Resolved' },
  { id: 'CMP-0104', category: 'Spillage', status: 'Resolved', createdOn: '2026-06-15 14:30', lastActivity: 'Cleared by local sweeper', estResolution: 'Resolved' }
];

export default function PersonalComplaintsPage() {
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SiteHeader title="Your Complaints" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-6 px-4 lg:px-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Your Filed Complaints</h2>
            <p className="text-sm text-muted-foreground">
              Track the resolution status of complaints filed by your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {myMockComplaints.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border"
                onClick={() => {
                  setSelectedComplaint({
                    ...item,
                    createdAt: item.createdOn,
                    description: item.lastActivity,
                    priority: 'MEDIUM',
                    assignedToWorkerName: 'Assigned Crew',
                  });
                  setIsModalOpen(true);
                }}
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold truncate max-w-[80%]">
                    {item.category}
                  </CardTitle>
                  <User className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                    <span>ID: {item.id}</span>
                    <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
                    <div className="space-y-1">
                      <span className="font-medium text-foreground block">Last Activity:</span>
                      <p className="text-muted-foreground truncate" title={item.lastActivity}>
                        {item.lastActivity}
                      </p>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="font-medium text-foreground">Created:</span>
                      <span>{item.createdOn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Resolution:</span>
                      <span className="font-semibold text-foreground/95">{item.estResolution}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
