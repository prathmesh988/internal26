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
import { AlertCircle, Sparkles } from 'lucide-react';
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

const allMockComplaints = [
  { id: 'CMP-2094', category: 'Missed Pickup', ward: 'W03', priority: 'Medium', status: 'Pending', assignedTo: 'Amit Shah', created: '2026-07-10 09:30', updated: '5 min ago' },
  { id: 'CMP-1948', category: 'Overflowing Bins', ward: 'W01', priority: 'Critical', status: 'In Progress', assignedTo: 'Rajesh Patil', created: '2026-07-09 14:15', updated: '2 hours ago' },
  { id: 'CMP-1839', category: 'Illegal Dumping', ward: 'W04', priority: 'High', status: 'Assigned', assignedTo: 'Suresh Kumar', created: '2026-07-09 11:00', updated: '4 hours ago' },
  { id: 'CMP-1728', category: 'Spillage', ward: 'W02', priority: 'Low', status: 'Resolved', assignedTo: 'Vikram Singh', created: '2026-07-08 16:45', updated: '1 day ago' },
  { id: 'CMP-1650', category: 'Missed Pickup', ward: 'W05', priority: 'Medium', status: 'Under Review', assignedTo: 'Unassigned', created: '2026-07-08 10:20', updated: '1 day ago' },
  { id: 'CMP-1598', category: 'Overflowing Bins', ward: 'W06', priority: 'Critical', status: 'Resolved', assignedTo: 'Ramesh Chawla', created: '2026-07-07 13:10', updated: '2 days ago' },
  { id: 'CMP-1432', category: 'Illegal Dumping', ward: 'W01', priority: 'High', status: 'Closed', assignedTo: 'Karan Malhotra', created: '2026-07-06 08:30', updated: '3 days ago' },
  { id: 'CMP-1322', category: 'Segregation Issue', ward: 'W03', priority: 'Low', status: 'Assigned', assignedTo: 'Arun Yadav', created: '2026-07-05 15:50', updated: '4 days ago' },
  { id: 'CMP-1299', category: 'Missed Pickup', ward: 'W02', priority: 'Medium', status: 'Reopened', assignedTo: 'Vikram Singh', created: '2026-07-05 09:12', updated: '4 days ago' },
  { id: 'CMP-1104', category: 'Spillage', ward: 'W04', priority: 'Low', status: 'Closed', assignedTo: 'Suresh Kumar', created: '2026-07-04 11:30', updated: '5 days ago' },
  { id: 'CMP-0987', category: 'Overflowing Bins', ward: 'W05', priority: 'High', status: 'Resolved', assignedTo: 'Rajesh Patil', created: '2026-07-03 14:00', updated: '6 days ago' },
  { id: 'CMP-0876', category: 'Illegal Dumping', ward: 'W06', priority: 'Medium', status: 'Resolved', assignedTo: 'Ramesh Chawla', created: '2026-07-02 10:45', updated: '1 week ago' },
  { id: 'CMP-0765', category: 'Segregation Issue', ward: 'W02', priority: 'Low', status: 'Closed', assignedTo: 'Vikram Singh', created: '2026-07-01 16:20', updated: '1 week ago' },
  { id: 'CMP-0654', category: 'Missed Pickup', ward: 'W01', priority: 'Medium', status: 'Resolved', assignedTo: 'Rajesh Patil', created: '2026-06-29 09:00', updated: '1 week ago' },
  { id: 'CMP-0543', category: 'Spillage', ward: 'W03', priority: 'Low', status: 'Resolved', assignedTo: 'Arun Yadav', created: '2026-06-28 15:10', updated: '1 week ago' }
];

export default function CommunityComplaintsPage() {
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SiteHeader title="Community Complaints" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-6 px-4 lg:px-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Recent Complaints Registry</h2>
            <p className="text-sm text-muted-foreground">
              Browse recent community complaints filed across all wards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {allMockComplaints.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border"
                onClick={() => {
                  setSelectedComplaint({
                    ...item,
                    createdAt: item.created,
                    assignedToWorkerName: item.assignedTo,
                    description: `Complaint submitted in Ward ${item.ward}. Priority: ${item.priority}. Last update: ${item.updated}.`,
                  });
                  setIsModalOpen(true);
                }}
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold truncate max-w-[80%]">
                    {item.category}
                  </CardTitle>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                    <span>ID: {item.id}</span>
                    <span>Ward {item.ward}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="border-t pt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Assigned to:</span>
                      <span className="truncate max-w-[120px]">{item.assignedTo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Created:</span>
                      <span>{item.created}</span>
                    </div>
                    <div className="text-[10px] text-right pt-1">
                      Updated {item.updated}
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
