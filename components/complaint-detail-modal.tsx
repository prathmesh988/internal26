'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Tag, MapPin, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComplaintDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: any;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  isOpen,
  onClose,
  complaint,
}) => {
  if (!complaint) return null;

  const priorityColors: Record<string, string> = {
    LOW: 'bg-green-500/10 text-green-500 border-green-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    ASSIGNED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    IN_PROGRESS: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    CLOSED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    ESCALATED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const status = (complaint.status || 'OPEN').toUpperCase();
  const priority = (complaint.priority || 'MEDIUM').toUpperCase();

  const TIMELINE_STAGES = [
    { title: 'Complaint Reported', desc: 'Citizen submitted ticket details' },
    { title: 'AI Complaint Analysis', desc: 'Category and priority validated' },
    { title: 'Ticket Created', desc: 'Registered in municipal database' },
    { title: 'Ward Identified', desc: 'Routed to ward command center' },
    { title: 'Officer Assigned', desc: 'Sanitation officer dispatched' },
    { title: 'Vehicle Assigned', desc: 'Collection truck allocated' },
    { title: 'Worker En Route', desc: 'Crew moving to target location' },
    { title: 'Resolution Uploaded', desc: 'Before/after proof submitted' },
    { title: 'Citizen Verification', desc: 'Awaiting citizen approval' },
    { title: 'Complaint Closed', desc: 'Ticket marked resolved' },
  ];

  const getTimelineActiveStageIndex = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s === 'PENDING' || s === 'OPEN') return 2;
    if (s === 'UNDER REVIEW' || s === 'UNDER_REVIEW') return 3;
    if (s === 'ASSIGNED') return 5;
    if (s === 'IN PROGRESS' || s === 'IN_PROGRESS') return 6;
    if (s === 'REOPENED') return 6;
    if (s === 'RESOLVED') return 8;
    if (s === 'CLOSED') return 9;
    return 2;
  };

  const getStageState = (idx: number, activeIndex: number, isReopened: boolean) => {
    if (isReopened) {
      if (idx === 6) return 'active';
      if (idx < 9) return 'completed';
      return 'pending';
    }
    if (idx < activeIndex) return 'completed';
    if (idx === activeIndex) return 'active';
    return 'pending';
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as any } },
  };

  const isReopened = status === 'REOPENED';
  const activeIndex = getTimelineActiveStageIndex(status);

  const timeFormatted = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleString()
    : 'Recently';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-md rounded-2xl border p-5 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {complaint.id}
            </span>
            <div className="flex gap-1.5">
              <Badge variant="outline" className={statusColors[status] || statusColors.OPEN}>
                {status.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline" className={priorityColors[priority] || priorityColors.MEDIUM}>
                {priority}
              </Badge>
            </div>
          </div>
          <DialogTitle className="text-base font-bold mt-1 text-foreground leading-normal">
            {complaint.title || 'Complaint Details'}
          </DialogTitle>
          <DialogDescription className="sr-only">Detailed inspection of complaint ticket</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="space-y-4 pt-2 text-xs"
            >
              {/* Description */}
              <div className="space-y-1 bg-muted/40 p-3 rounded-xl border">
                <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                  <ClipboardList className="size-3" /> Description
                </p>
                <p className="text-foreground leading-relaxed text-sm font-medium">
                  {complaint.description || complaint.desc || 'No description provided.'}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border">
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <Tag className="size-3" /> Category
                  </p>
                  <p className="font-semibold text-foreground">
                    {(complaint.category || 'Missed Pickup').replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <MapPin className="size-3" /> Location / Ward
                  </p>
                  <p className="font-semibold text-foreground">
                    {complaint.ward || (complaint.wardCode ? `Ward ${complaint.wardCode}` : 'Indore City')}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <Clock className="size-3" /> Submitted
                  </p>
                  <p className="font-semibold text-foreground">{timeFormatted}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <User className="size-3" /> Assignee
                  </p>
                  <p className="font-semibold text-foreground">
                    {complaint.assignedToWorkerName || complaint.officer || 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Resolution Timeline Section */}
              <div className="space-y-2 border-t pt-4">
                <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider flex items-center gap-1">
                  <ClipboardList className="size-3" /> Resolution Timeline
                </p>

                <div className="relative w-full max-w-sm mx-auto bg-muted/10 rounded-xl border p-4 overflow-hidden select-none">
                  <div className="relative w-full h-[400px]">
                    {/* SVG Lines behind the dots */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      {/* Background base track (gray) */}
                      <path
                        d="M 24 20 V 380"
                        fill="none"
                        stroke="rgba(156, 163, 175, 0.2)"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      
                      {/* Active progress track (emerald-500) */}
                      <motion.path
                        d={`M 24 20 V ${isReopened ? 340 : 20 + activeIndex * 40}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      />

                      {/* Fork Loop Track if Reopened (red-500 dashed) */}
                      {isReopened && (
                        <motion.path
                          d="M 24 340 H 90 C 110 340, 110 260, 90 260 H 24"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth={2}
                          strokeDasharray="4 3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 1.2, duration: 1.0, ease: "easeInOut" }}
                        />
                      )}
                    </svg>

                    {/* "Verification Rejected" bubble overlay */}
                    {isReopened && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.8, duration: 0.3 }}
                        className="absolute left-[105px] top-[300px] -translate-y-1/2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-1 px-2 text-[8px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm flex items-center gap-1 z-20"
                      >
                        <span className="size-1 rounded-full bg-destructive animate-pulse" />
                        Verification Rejected
                      </motion.div>
                    )}

                    {/* Staggered Rows */}
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="absolute inset-0 flex flex-col justify-between h-full z-10"
                    >
                      {TIMELINE_STAGES.map((stage, idx) => {
                        const stageState = getStageState(idx, activeIndex, isReopened);
                        
                        return (
                          <motion.div
                            key={stage.title}
                            variants={itemVariants}
                            className="flex items-center h-10 w-full"
                          >
                            {/* Circle Column */}
                            <div className="w-12 flex justify-center flex-shrink-0">
                              <div
                                className={`size-5 rounded-full border flex items-center justify-center font-bold text-[9px] transition-all duration-300 ${
                                  stageState === 'completed'
                                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                    : stageState === 'active'
                                    ? 'bg-background border-primary text-primary ring-4 ring-primary/20 scale-110 font-extrabold animate-pulse'
                                    : 'bg-background border-muted-foreground/30 text-muted-foreground/50'
                                }`}
                              >
                                {stageState === 'completed' ? '✓' : idx + 1}
                              </div>
                            </div>

                            {/* Label Column */}
                            <div className="flex-1 min-w-0 pr-4">
                              <p
                                className={`truncate text-xs ${
                                  stageState === 'completed'
                                    ? 'text-foreground font-semibold'
                                    : stageState === 'active'
                                    ? 'text-primary font-bold'
                                    : 'text-muted-foreground font-medium'
                                }`}
                              >
                                {stage.title}
                              </p>
                              <p
                                className={`truncate text-[9px] ${
                                  stageState === 'completed'
                                    ? 'text-muted-foreground/80'
                                    : stageState === 'active'
                                    ? 'text-primary/70'
                                    : 'text-muted-foreground/40'
                                }`}
                              >
                                {stage.desc}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
