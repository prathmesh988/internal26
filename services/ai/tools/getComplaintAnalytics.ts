import { tool } from 'ai';
import { z } from 'zod';
import { complaintService } from '@/services/appwrite/client';

export const getComplaintAnalytics = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get aggregated statistical breakdown of citizen complaints by category, priority, and status counts (Admin Only).',
    parameters: z.object({}),
    execute: async () => {
      // 1. Role Authorization
      if (session.userType !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: Access restricted to Administrators only.' };
      }

      try {
        const result = await complaintService.list({}, 1, 200);
        const complaints = result.data;

        const total = result.total;
        const statusCounts: Record<string, number> = {
          OPEN: 0,
          ASSIGNED: 0,
          IN_PROGRESS: 0,
          RESOLVED: 0,
          CLOSED: 0,
          ESCALATED: 0,
        };

        const categoryCounts: Record<string, number> = {};
        const priorityCounts: Record<string, number> = {};

        for (const c of complaints) {
          if (c.status) {
            statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
          }
          if (c.category) {
            categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
          }
          if (c.priority) {
            priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
          }
        }

        return {
          success: true,
          totalComplaints: total,
          statusBreakdown: statusCounts,
          categoryBreakdown: categoryCounts,
          priorityBreakdown: priorityCounts,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to query complaints analytics.',
        };
      }
    },
  });
