'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import {
  Award,
  AlertCircle,
  TrendingUp,
  Bell,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import InteractiveFlow from '@/components/flow/InteractiveFlow';

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
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {citizenData.name}!</h1>
            <p className="text-muted-foreground text-sm">
              Here is a summary of your account activity, rewards status, and active updates.
            </p>
          </div>

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
            ].map((card) => {
              const Icon = card.icon;
              return (
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
                    <div className="flex items-center justify-between mt-2">
                      <CardTitle className="text-3xl font-bold tabular-nums">{card.value}</CardTitle>
                      <Icon className={`size-5 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Interactive Flow Illustration */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Complaint Resolution Workflow</CardTitle>
                <CardDescription>
                  Interact with the simulator nodes to visualize how municipal complaints route from submission to dispatch and rewards crediting.
                </CardDescription>
              </div>
              <Info className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <InteractiveFlow />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
