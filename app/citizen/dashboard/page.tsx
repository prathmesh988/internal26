'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Award,
  AlertCircle,
  TrendingUp,
  Bell,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

// Status badge styling function to ensure subtle, non-oversaturated colors
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

// 20 rows of mock complaints for the "Reading Complaints" tab
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

// 15 rows of mock complaints for the logged-in user (Rajesh Kumar)
const myMockComplaints = [
  { id: 'CMP-1948', category: 'Overflowing Bins', status: 'In Progress', createdOn: '2026-07-09 14:15', lastActivity: 'Worker dispatched', estResolution: 'Today, 18:00' },
  { id: 'CMP-1650', category: 'Missed Pickup', status: 'Under Review', createdOn: '2026-07-08 10:20', lastActivity: 'Assigned to Ward 05 Inspector', estResolution: 'Tomorrow, 12:00' },
  { id: 'CMP-1432', category: 'Illegal Dumping', status: 'Closed', createdOn: '2026-07-06 08:30', lastActivity: 'Site cleared by cleanup crew', estResolution: 'Resolved' },
  { id: 'CMP-1299', category: 'Missed Pickup', status: 'Reopened', createdOn: '2026-07-05 09:12', lastActivity: 'Reopened due to missed lane', estResolution: 'Today, 17:00' },
  { id: 'CMP-0654', category: 'Missed Pickup', status: 'Resolved', createdOn: '2026-06-29 09:00', lastActivity: 'Resolved by replacement truck', estResolution: 'Resolved' },
  { id: 'CMP-0321', category: 'Overflowing Bins', status: 'Closed', createdOn: '2026-06-20 11:45', lastActivity: 'Bin replaced & emptied', estResolution: 'Resolved' },
  { id: 'CMP-0104', category: 'Spillage', status: 'Resolved', createdOn: '2026-06-15 14:30', lastActivity: 'Cleared by local sweeper', estResolution: 'Resolved' }
];

export default function CitizenDashboard() {
  const router = useRouter();

  const citizenData = {
    name: 'Rajesh Kumar',
    rewardPoints: 285,
    complaintsFiled: 7,
    complianceScore: 92,
    unreadNotifications: 2
  };

  return (
    <>
      <SiteHeader
        title="My Dashboard"
        actionLabel="File Complaint"
        onAction={() => router.push('/citizen/file-complaint')}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat Cards with Highlight Pill Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                title: 'Reward Points',
                value: citizenData.rewardPoints,
                sub: 'Keep participating to earn more',
                trend: '+50 this week',
                up: true,
                icon: Award,
                color: 'text-amber-500',
              },
              {
                title: 'Complaints Filed',
                value: citizenData.complaintsFiled,
                sub: '2 active complaints',
                trend: '+1 this month',
                up: true,
                icon: AlertCircle,
                color: 'text-destructive',
              },
              {
                title: 'Compliance Score',
                value: `${citizenData.complianceScore}%`,
                sub: 'Based on activity & surveys',
                trend: '+3% vs last month',
                up: true,
                icon: TrendingUp,
                color: 'text-emerald-500',
              },
              {
                title: 'Notifications',
                value: citizenData.unreadNotifications,
                sub: 'Unread alerts and updates',
                trend: '2 new alerts',
                up: true,
                icon: Bell,
                color: 'text-primary',
              },
            ].map((card) => (
              <Card key={card.title} className="bg-gradient-to-br from-card to-muted/30 shadow-sm border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">{card.title}</CardDescription>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      card.up ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {card.up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                      {card.trend}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums mt-2">{card.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs Container */}
          <Tabs defaultValue="reading-complaints" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="reading-complaints">Reading Complaints</TabsTrigger>
              <TabsTrigger value="your-complaints">Your Complaints</TabsTrigger>
            </TabsList>

            {/* Reading Complaints Tab */}
            <TabsContent value="reading-complaints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Complaints Registry</CardTitle>
                  <CardDescription>Browse recent community complaints filed across all wards.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allMockComplaints.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.ward}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                              {item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.assignedTo}</TableCell>
                          <TableCell className="text-muted-foreground">{item.created}</TableCell>
                          <TableCell className="text-muted-foreground">{item.updated}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Your Complaints Tab */}
            <TabsContent value="your-complaints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Filed Complaints</CardTitle>
                  <CardDescription>Track the resolution status of complaints filed by your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created On</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Activity</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estimated Resolution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myMockComplaints.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.createdOn}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{item.lastActivity}</TableCell>
                          <TableCell className="font-medium text-foreground/80">{item.estResolution}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
}
