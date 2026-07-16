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
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
