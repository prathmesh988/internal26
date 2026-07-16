import { tool } from 'ai';
import { z } from 'zod';
import { complaintService, citizenService } from '@/services/appwrite/client';
import { complaintCreatedWorkflow } from '@/services/workflows/engine';
import { ComplaintCategory } from '@/types';

export const createComplaint = (session: { userId: string; userType: string }) =>
  tool({
    description: 'File a new waste management complaint. Automatically uses the citizen\'s registered ward and triggers workflow automation.',
    parameters: z.object({
      title: z.string().describe('Short title summarizing the issue (e.g. Overflowing garbage bin in Lane 4)'),
      description: z.string().describe('Detailed description of the waste problem (e.g. location details, how long it has been there)'),
      category: z.enum([
        'MISSED_PICKUP',
        'OVERFLOW',
        'SPILL',
        'ILLEGAL_DUMPING',
        'SEGREGATION',
        'VEHICLE_ISSUE',
        'OTHER',
      ]).describe('The category of the waste complaint'),
    }),
    execute: async ({ title, description, category }) => {
      // 1. Role Enforcement
      if (session.userType !== 'CITIZEN') {
        return { success: false, error: 'Unauthorized: Only citizens can file a new complaint.' };
      }

      try {
        // 2. Identity Binding — fetch user ward details
        const citizen = await citizenService.getById(session.userId);
        if (!citizen) {
          return { success: false, error: 'Citizen profile not found.' };
        }

        // 3. Create complaint record in Appwrite
        const newComplaint = await complaintService.create({
          citizenId: session.userId,
          filedByCitizenId: session.userId,
          ward: citizen.ward,
          wardCode: citizen.wardCode,
          category: category as ComplaintCategory,
          title,
          description,
          status: 'OPEN',
          priority: 'MEDIUM',
          location: { lat: 22.7196, lng: 75.8577 }, // Default Indore coordinates
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // 4. Trigger n8n webhook workflow
        const workflowResult = await complaintCreatedWorkflow(newComplaint.id);

        return {
          success: true,
          complaintId: newComplaint.id,
          title: newComplaint.title,
          status: newComplaint.status,
          category: newComplaint.category,
          ward: newComplaint.ward,
          assignedWorker: workflowResult.status === 'COMPLETED' ? 'Assigned' : 'Pending auto-assignment',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to file complaint.',
        };
      }
    },
  });
