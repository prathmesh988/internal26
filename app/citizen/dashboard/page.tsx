'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge, PriorityBadge } from '@/components/shared';
import { useNotifications, useComplaints } from '@/hooks';
import {
  FileText,
  AlertCircle,
  Award,
  Bell,
  CheckCircle2,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react';
import { formatDate, getTimeAgo } from '@/lib/utils-helpers';
import { TrendChart } from '@/components/charts';

export default function CitizenDashboard() {
  const { data: notificationsData } = useNotifications('citizen-001', 1, 5);
  const { data: complaintsData } = useComplaints({}, 1, 10);

  // Mock citizen data
  const citizenData = {
    id: 'citizen-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    rewardPoints: 285,
    completedSurveys: 8,
    complaintsFiled: 5,
    complianceScore: 92,
  };

  const notifications = notificationsData?.data || [];
  const myComplaints = (complaintsData?.data || []).slice(0, 5);
  const unresolvedComplaints = myComplaints.filter((c: any) => !['RESOLVED', 'CLOSED'].includes(c.status)).length;

  // Mock reward history
  const recentRewards = [
    { date: new Date(), reason: 'Completed segregation survey', points: 50 },
    { date: new Date(Date.now() - 86400000), reason: 'Proper waste segregation', points: 25 },
    { date: new Date(Date.now() - 172800000), reason: 'Participated in cleanup drive', points: 100 },
  ];

  // Chart data
  const pointsTrendData = Array.from({ length: 30 }, (_, i) => ({
    date: formatDate(new Date(Date.now() - (30 - i) * 86400000).toISOString()),
    value: Math.floor(i * 8) + 100,
  }));

  const recentActivity = [
    {
      id: '1',
      title: 'Complaint Status Updated',
      description: 'Your overflow complaint has been assigned to a worker',
      timestamp: new Date().toISOString(),
      type: 'update',
    },
    {
      id: '2',
      title: 'Reward Earned!',
      description: 'You earned 50 points for completing a segregation survey',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'reward',
    },
    {
      id: '3',
      title: 'Pickup Reminder',
      description: 'Waste collection scheduled for tomorrow at 8 AM in your ward',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'info',
    },
    {
      id: '4',
      title: 'Complaint Resolved',
      description: 'Your spillage complaint has been successfully resolved',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      type: 'resolved',
    },
  ];

  // Metric card component for consistent styling
  const MetricCard = ({ title, value, icon, trend, subtext }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
              {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
            </div>
            <div className="text-primary/80 ml-4">{icon}</div>
          </div>
          {trend && (
            <div className="flex items-center gap-2 text-xs">
              {trend.isPositive ? (
                <ArrowUp className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-600" />
              )}
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {citizenData.name}</p>
      </motion.div>

      {/* Metric Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
        <MetricCard
          title="Reward Points"
          value={citizenData.rewardPoints}
          icon={<Award className="w-8 h-8" />}
          trend={{ value: 12, isPositive: true }}
          subtext="Available for redemption"
        />
        <MetricCard
          title="Complaints Filed"
          value={citizenData.complaintsFiled}
          icon={<FileText className="w-8 h-8" />}
          trend={{ value: 2, isPositive: true }}
          subtext={`${unresolvedComplaints} unresolved`}
        />
        <MetricCard
          title="Compliance Score"
          value={`${citizenData.complianceScore}%`}
          icon={<CheckCircle2 className="w-8 h-8" />}
          trend={{ value: 8, isPositive: true }}
          subtext="Excellent rating"
        />
        <MetricCard
          title="Surveys Completed"
          value={citizenData.completedSurveys}
          icon={<Bell className="w-8 h-8" />}
          subtext="Keep participating!"
        />
      </motion.div>

      {/* Points Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendChart
            data={pointsTrendData}
            title="Reward Points Trend"
            description="Last 30 days"
            lineColor="hsl(var(--primary))"
            height={250}
          />
        </div>

        {/* Recent Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Recent Rewards</CardTitle>
            <CardDescription>Your latest earnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRewards.map((reward, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{reward.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(reward.date.toISOString())}
                  </p>
                </div>
                <Badge className="ml-2 font-bold">+{reward.points}</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/citizen/file-complaint" className="block">
              <Button className="w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                File Complaint
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Award className="w-4 h-4 mr-2" />
              Redeem Rewards
            </Button>
            <Link href="/citizen/my-complaints" className="block">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                My Complaints
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">Recent Activity</CardTitle>
              <CardDescription>Your latest updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {getTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Recent Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-foreground">My Recent Complaints</CardTitle>
          <CardDescription>Your latest filed complaints</CardDescription>
        </CardHeader>
        <CardContent>
          {myComplaints.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground">No complaints filed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myComplaints.map((complaint: any, idx) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{complaint.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {complaint.description?.substring(0, 50)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{complaint.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Description
                            </label>
                            <p className="text-sm mt-2">{complaint.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Status
                              </label>
                              <div className="mt-2">
                                <StatusBadge status={complaint.status} />
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Priority
                              </label>
                              <div className="mt-2">
                                <PriorityBadge priority={complaint.priority} />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Filed on
                            </label>
                            <p className="text-sm mt-2">
                              {formatDate(complaint.createdAt, 'long')}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
