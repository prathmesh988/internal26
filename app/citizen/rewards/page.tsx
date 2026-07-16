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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserStore } from '@/store';
import { citizenService, rewardService } from '@/services/appwrite/client';
import type { Citizen, Reward } from '@/types';
import {
  Award,
  Star,
  ClipboardList,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Gift,
  Users,
  ArrowUp,
} from 'lucide-react';

// ── Tier config ──────────────────────────────────────────────────────────────

const TIERS = [
  { name: 'Bronze',   min: 0,    color: 'text-amber-700',   bg: 'bg-amber-700/10',   border: 'border-amber-700/20' },
  { name: 'Silver',   min: 250,  color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  { name: 'Gold',     min: 600,  color: 'text-yellow-500',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
  { name: 'Platinum', min: 1200, color: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/20' },
];

function getTier(points: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) return { tier: TIERS[i], index: i };
  }
  return { tier: TIERS[0], index: 0 };
}

function getTierProgress(points: number) {
  const { tier, index } = getTier(points);
  const next = TIERS[index + 1];
  if (!next) return { tier, next: null, pct: 100, remaining: 0 };
  const pct = Math.round(((points - tier.min) / (next.min - tier.min)) * 100);
  return { tier, next, pct, remaining: next.min - points };
}

// ── Reason label helpers ─────────────────────────────────────────────────────

const REASON_LABELS: Record<string, string> = {
  SEGREGATION: 'Proper Segregation',
  SURVEY:      'Survey Completed',
  COMPLAINT:   'Complaint Filed',
  COMPLIANCE:  'Compliance Bonus',
  REFERRAL:    'Referral Reward',
};

const REASON_ICONS: Record<string, React.ReactNode> = {
  SEGREGATION: <CheckCircle2 className="size-4 text-emerald-500" />,
  SURVEY:      <ClipboardList className="size-4 text-blue-500" />,
  COMPLAINT:   <Star className="size-4 text-amber-500" />,
  COMPLIANCE:  <TrendingUp className="size-4 text-purple-500" />,
  REFERRAL:    <Users className="size-4 text-pink-500" />,
};

const REASON_POINTS: Record<string, number> = {
  COMPLAINT:   10,
  SEGREGATION: 15,
  SURVEY:      30,
  COMPLIANCE:  25,
  REFERRAL:    50,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const { userId } = useUserStore();
  const [citizen,  setCitizen]  = useState<Citizen | null>(null);
  const [rewards,  setRewards]  = useState<Reward[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      citizenService.getById(userId),
      rewardService.list(userId, 1, 50),
    ])
      .then(([cit, rwd]) => {
        setCitizen(cit);
        setRewards(rwd.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const points = citizen?.rewardPoints ?? 0;
  const { tier, next, pct, remaining } = useMemo(() => getTierProgress(points), [points]);

  if (loading) {
    return (
      <>
        <SiteHeader title="Rewards" />
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Rewards" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Points',
                value: points,
                sub: `${tier.name} tier`,
                icon: <Award className="size-5 text-amber-500" />,
                badge: `${next ? `${remaining} to ${next.name}` : 'Max tier'}`,
              },
              {
                label: 'Complaints Filed',
                value: citizen?.complaintsFiled ?? 0,
                sub: `+${(citizen?.complaintsFiled ?? 0) * REASON_POINTS.COMPLAINT} pts earned`,
                icon: <Star className="size-5 text-amber-400" />,
                badge: `+${REASON_POINTS.COMPLAINT} pts each`,
              },
              {
                label: 'Surveys Completed',
                value: citizen?.completedSurveys ?? 0,
                sub: `+${(citizen?.completedSurveys ?? 0) * REASON_POINTS.SURVEY} pts earned`,
                icon: <ClipboardList className="size-5 text-blue-500" />,
                badge: `+${REASON_POINTS.SURVEY} pts each`,
              },
            ].map((card) => (
              <Card key={card.label} className="bg-gradient-to-br from-card to-muted/30 border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">{card.label}</CardDescription>
                    <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-600">
                      <ArrowUp className="size-3" />
                      {card.badge}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums mt-2">{card.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {card.icon}
                    {card.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Tier Progress ─────────────────────────────────────────────── */}
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Tier</CardTitle>
                  <CardDescription>
                    {next
                      ? `${remaining} more points to reach ${next.name}`
                      : 'You have reached the highest tier!'}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`text-sm font-semibold px-3 py-1 ${tier.color} ${tier.border} ${tier.bg}`}
                >
                  {tier.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* Tier labels */}
              <div className="flex justify-between">
                {TIERS.map((t) => (
                  <div key={t.name} className="flex flex-col items-center gap-1">
                    <span className={`text-xs font-semibold ${points >= t.min ? t.color : 'text-muted-foreground'}`}>
                      {t.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{t.min} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Earn More + History ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Earn More */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="size-5 text-amber-500" />
                  How to Earn Points
                </CardTitle>
                <CardDescription>Every action you take earns you points.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {[
                    { reason: 'COMPLAINT',   label: 'File a Complaint',           pts: REASON_POINTS.COMPLAINT },
                    { reason: 'SEGREGATION', label: 'Proper Waste Segregation',   pts: REASON_POINTS.SEGREGATION },
                    { reason: 'SURVEY',      label: 'Complete a Survey',          pts: REASON_POINTS.SURVEY },
                    { reason: 'COMPLIANCE',  label: 'Monthly Compliance Bonus',   pts: REASON_POINTS.COMPLIANCE },
                    { reason: 'REFERRAL',    label: 'Refer a Neighbour',          pts: REASON_POINTS.REFERRAL },
                  ].map((item) => (
                    <div key={item.reason} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2.5">
                        {REASON_ICONS[item.reason]}
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">+{item.pts}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transaction history */}
            <Card className="lg:col-span-2 border shadow-sm">
              <CardHeader>
                <CardTitle>Points History</CardTitle>
                <CardDescription>
                  {rewards.length > 0
                    ? `${rewards.length} transaction${rewards.length > 1 ? 's' : ''} — all time`
                    : 'No points earned yet. Start by filing a complaint!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rewards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                    <Award className="size-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No rewards yet.</p>
                    <p className="text-xs text-muted-foreground">File a complaint or complete a survey to earn your first points.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">When</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewards.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {REASON_ICONS[r.reason]}
                                <span className="text-sm">{REASON_LABELS[r.reason] ?? r.reason}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{timeAgo(r.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-emerald-600 tabular-nums">+{r.pointsAwarded}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </>
  );
}
