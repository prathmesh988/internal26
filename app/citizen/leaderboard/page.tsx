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
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SiteHeader } from '@/components/site-header';
import {
  Trophy,
  Medal,
  ArrowUp,
  ArrowDown,
  Star,
  Users,
  AlertTriangle,
  Flame
} from 'lucide-react';

const wardLeaderboard = [
  {
    rank: 1,
    ward: 'W02 (Chandan Nagar)',
    resolutionRate: '98%',
    cleanlinessScore: 92,
    activeComplaints: 2,
    trend: 'up',
    trendText: '+5% this week',
    topContributor: 'Priti More',
    commonIssue: 'Spillage',
    isHome: false,
  },
  {
    rank: 2,
    ward: 'W05 (Raj Nagar)',
    resolutionRate: '95%',
    cleanlinessScore: 89,
    activeComplaints: 4,
    trend: 'up',
    trendText: '+3% this week',
    topContributor: 'Geeta Deshmukh',
    commonIssue: 'Missed Pickup',
    isHome: false,
  },
  {
    rank: 3,
    ward: 'W01 (Sirpur)',
    resolutionRate: '89%',
    cleanlinessScore: 85,
    activeComplaints: 7,
    trend: 'down',
    trendText: '-2% this week',
    topContributor: 'Aisha Khan',
    commonIssue: 'Overflow',
    isHome: false,
  },
  {
    rank: 4,
    ward: 'W03 (Kalani Nagar)',
    resolutionRate: '85%',
    cleanlinessScore: 82,
    activeComplaints: 12,
    trend: 'up',
    trendText: '+8% this week',
    topContributor: 'Siddharth Jain',
    commonIssue: 'Illegal Dumping',
    isHome: true,
  },
  {
    rank: 5,
    ward: 'W04 (Sukhdev Nagar)',
    resolutionRate: '82%',
    cleanlinessScore: 78,
    activeComplaints: 15,
    trend: 'down',
    trendText: '-1% this week',
    topContributor: 'Simran Kaur',
    commonIssue: 'Spillage',
    isHome: false,
  },
  {
    rank: 6,
    ward: 'W06 (Malharganj)',
    resolutionRate: '75%',
    cleanlinessScore: 71,
    activeComplaints: 21,
    trend: 'down',
    trendText: '-4% this week',
    topContributor: 'Aditi Ghosh',
    commonIssue: 'Segregation',
    isHome: false,
  },
];

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <>
      <SiteHeader
        title="Ward Leaderboard"
        actionLabel="File Complaint"
        onAction={() => router.push('/citizen/file-complaint')}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">City-Wide Performance Rankings</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    See how your ward compares in cleanliness, issue resolution, and community engagement.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 text-center py-4">Rank</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4">Ward</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4">Cleanliness</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4">Resolution Rate</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4">Top Contributor</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 text-right">Most Common Issue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wardLeaderboard.map((item) => (
                    <TableRow
                      key={item.ward}
                      className={`transition-colors h-16 ${
                        item.isHome ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <TableCell className="font-bold text-center">
                        {item.rank === 1 && <Trophy className="size-6 text-amber-500 mx-auto drop-shadow-sm" />}
                        {item.rank === 2 && <Medal className="size-6 text-slate-400 mx-auto drop-shadow-sm" />}
                        {item.rank === 3 && <Medal className="size-6 text-amber-700 mx-auto drop-shadow-sm" />}
                        {item.rank > 3 && <span className="text-muted-foreground text-lg">{item.rank}</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-base ${item.isHome ? 'text-primary' : 'text-foreground'}`}>
                              {item.ward}
                            </span>
                            {item.isHome && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider px-1.5 py-0 h-5">
                                Your Ward
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            {item.trend === 'up' ? (
                              <ArrowUp className="size-3 text-emerald-500" />
                            ) : (
                              <ArrowDown className="size-3 text-destructive" />
                            )}
                            <span className={item.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                              {item.trendText}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Star className="size-4 fill-emerald-500 text-emerald-500" />
                          <span className="font-bold text-base">{item.cleanlinessScore}</span>
                          <span className="text-muted-foreground text-xs">/100</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`px-2 py-1 ${item.resolutionRate >= '85%' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                          <span className="font-semibold">{item.resolutionRate}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="size-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground/80">{item.topContributor}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.commonIssue === 'Overflow' && <Flame className="size-4 text-orange-500" />}
                          {item.commonIssue !== 'Overflow' && <AlertTriangle className="size-4 text-amber-500" />}
                          <span className="text-sm font-medium text-muted-foreground">{item.commonIssue}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
