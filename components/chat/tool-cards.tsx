'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, AlertTriangle, CheckCircle2, Star, Calendar, ClipboardList, TrendingUp } from 'lucide-react';

interface ToolCardProps {
  toolName: string;
  result: any;
}

export const ToolResultCard: React.FC<ToolCardProps> = ({ toolName, result }) => {
  if (!result) return null;
  if (result.success === false) {
    return (
      <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs flex items-start gap-2">
        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Error Executing Tool</p>
          <p className="mt-0.5">{result.error || 'Unknown error occurred.'}</p>
        </div>
      </div>
    );
  }

  switch (toolName) {
    case 'getPickupSchedule':
      return (
        <Card className="border shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                Schedule: {result.wardName}
              </CardTitle>
              <Badge variant="outline">{result.wardCode}</Badge>
            </div>
            <CardDescription>Today's scheduled garbage pickups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {result.routes.length === 0 ? (
              <p className="text-muted-foreground italic">{result.message}</p>
            ) : (
              result.routes.map((r: any) => (
                <div key={r.id} className="p-2 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Duration: {r.estimatedDuration}m | Dist: {r.distance}km
                    </p>
                  </div>
                  <Badge variant={r.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {r.status.toLowerCase()}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );

    case 'getComplaintStatus':
      return (
        <Card className="border shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <ClipboardList className="size-4 text-amber-500" />
              Complaints Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-56 overflow-y-auto">
            {result.complaints.length === 0 ? (
              <p className="text-muted-foreground italic">{result.message || 'No complaints found.'}</p>
            ) : (
              result.complaints.map((c: any) => (
                <div key={c.id} className="p-2 border rounded-lg bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{c.id}</span>
                    <Badge variant="outline">{c.status.toLowerCase()}</Badge>
                  </div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{c.description}</p>
                  {c.assignedToWorkerName && (
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">
                      Assigned to: {c.assignedToWorkerName}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );

    case 'createComplaint':
      return (
        <Card className="border border-emerald-500/20 bg-emerald-500/5 shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Complaint Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">ID: {result.complaintId}</p>
            <p className="text-foreground">{result.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Status: {result.status.toLowerCase()}</Badge>
              <Badge variant="outline">Ward: {result.ward}</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">
              n8n Dispatch: {result.assignedWorker}
            </p>
          </CardContent>
        </Card>
      );

    case 'getRewardPoints':
      return (
        <Card className="border shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Award className="size-4 text-amber-500" />
                Rewards Balance
              </CardTitle>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                {result.currentTier}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-black text-foreground">{result.points} pts</p>
              <p className="text-[10px] text-muted-foreground">
                {result.remaining > 0 ? `${result.remaining} pts until ${result.nextTier}` : 'Max milestone reached!'}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                style={{ width: `${result.progressPercentage}%` }}
              />
            </div>
            {/* History list */}
            {result.history.length > 0 && (
              <div className="space-y-1.5 border-t pt-2 max-h-32 overflow-y-auto">
                <p className="font-bold text-[10px] text-muted-foreground uppercase">Recent Transactions</p>
                {result.history.map((r: any) => (
                  <div key={r.id} className="flex justify-between items-center text-[10px] py-0.5">
                    <span className="text-muted-foreground truncate max-w-[150px]">{r.reason}</span>
                    <span className="font-bold text-emerald-600">+{r.pointsAwarded} pts</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );

    case 'getDelayedVehicles':
      return (
        <Card className="border border-orange-500/20 bg-orange-500/5 shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="size-4" />
              Delayed / Deviated Fleet
            </CardTitle>
            <CardDescription>Vehicles strayed or behind schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {result.delayedVehicles.length === 0 ? (
              <p className="text-muted-foreground italic">{result.message || 'All systems clear.'}</p>
            ) : (
              result.delayedVehicles.map((v: any) => (
                <div key={v.id} className="p-2 border rounded-lg bg-card flex justify-between items-start">
                  <div>
                    <p className="font-bold text-foreground">{v.registrationNumber}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Driver: {v.driverName} | {v.wardName}
                    </p>
                  </div>
                  <Badge variant="destructive" className="capitalize text-[10px]">
                    {v.isDeviated ? 'deviated' : 'delayed'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );

    case 'getComplaintAnalytics':
      return (
        <Card className="border shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary" />
              Complaints Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-black">{result.totalComplaints} Active Complaints</div>
            <div className="grid grid-cols-3 gap-2 border-t pt-2 text-center">
              <div>
                <p className="text-muted-foreground text-[10px]">Open</p>
                <p className="font-bold">{result.statusBreakdown.OPEN + result.statusBreakdown.ASSIGNED}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">In Progress</p>
                <p className="font-bold">{result.statusBreakdown.IN_PROGRESS}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Resolved</p>
                <p className="font-bold">{result.statusBreakdown.RESOLVED}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'getWardStatistics':
      return (
        <Card className="border shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Star className="size-4 text-amber-500" />
              Ward Cleanliness Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {result.wards.map((w: any) => (
              <div key={w.code} className="flex justify-between items-center py-1 border-b last:border-0">
                <div>
                  <span className="font-bold">{w.code}</span> - <span className="text-muted-foreground">{w.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={w.cleanlinessScore >= 85 ? 'default' : 'secondary'}>
                    {w.cleanlinessScore}/100
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );

    case 'getMissedCheckpointWorkers':
      return (
        <Card className="border border-destructive/20 bg-destructive/5 shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="size-4" />
              Flagged Field Crew Alert
            </CardTitle>
            <CardDescription>Workers currently below route targets or deviated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {result.flaggedWorkers.length === 0 ? (
              <p className="text-muted-foreground italic">No worker exceptions flagged.</p>
            ) : (
              result.flaggedWorkers.map((w: any) => (
                <div key={w.id} className="p-2 border rounded-lg bg-card space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>{w.name} ({w.id})</span>
                    <span className="text-destructive text-[10px] uppercase font-black">{w.complianceIssue}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Rate: {w.completionRate}% | Rating: {w.averageRating}★ | Vehicle: {w.assignedVehicle}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );

    case 'generateDailyReport':
      return (
        <Card className="border shadow-sm text-xs max-w-sm">
          <CardHeader className="pb-2 bg-muted/40">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              Daily Operational Digest
            </CardTitle>
            <CardDescription>Generated: {new Date(result.generatedAt).toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-muted p-2 rounded-lg">
                <p className="text-[9px] text-muted-foreground uppercase">Avg Cleanliness</p>
                <p className="text-lg font-black text-foreground">{result.summary.averageCleanlinessScore}</p>
              </div>
              <div className="bg-muted p-2 rounded-lg">
                <p className="text-[9px] text-muted-foreground uppercase">Active Tickets</p>
                <p className="text-lg font-black text-foreground">{result.summary.totalActiveComplaints}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicles Online:</span>
                <span className="font-bold text-foreground">{result.fleet.activeCount}/{result.fleet.totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delayed/Deviated Fleets:</span>
                <span className="font-bold text-orange-500">{result.fleet.delayedOrDeviatedCount}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 mt-1.5">
                <span className="text-muted-foreground">Worker Alert Issues:</span>
                <span className="font-bold text-destructive">{result.exceptions.workerComplianceAlerts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};
