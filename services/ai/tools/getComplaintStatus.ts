import { tool } from 'ai';
import { z } from 'zod';
import { complaintService } from '@/services/appwrite/client';

export const getComplaintStatus = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get status, worker assignment, and timeline of the citizen\'s submitted complaints.',
    parameters: z.object({
      complaintId: z.string().optional(),
    }),
    execute: async ({ complaintId }) => {
      // 1. Role Enforcement
      if (session.userType !== 'CITIZEN') {
        return { success: false, error: 'Unauthorized: Only citizens can check complaint status.' };
      }

      try {
        if (complaintId) {
          // Fetch a specific complaint and verify it belongs to the session user
          const complaint = await complaintService.getById(complaintId);
          if (!complaint) {
            return { success: false, error: 'Complaint not found.' };
          }
          // Identity check: does this complaint belong to this citizen?
          if (complaint.citizenId !== session.userId) {
            return { success: false, error: 'Unauthorized: You can only query your own complaints.' };
          }
          return { success: true, complaints: [complaint] };
        }

        // Fetch all complaints matching this citizenId
        const result = await complaintService.list({ citizenId: session.userId }, 1, 50);
        return {
          success: true,
          complaints: result.data,
          message: result.data.length === 0 ? 'No complaints found on your account.' : undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to query complaint status.',
        };
      }
    },
  });
