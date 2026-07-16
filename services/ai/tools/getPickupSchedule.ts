import { tool } from 'ai';
import { z } from 'zod';
import { citizenService, routeService } from '@/services/appwrite/client';

export const getPickupSchedule = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get the planned waste collection schedule and route timings for the citizen\'s assigned ward.',
    parameters: z.object({}),
    execute: async () => {
      // 1. Role Enforcement
      if (session.userType !== 'CITIZEN') {
        return { success: false, error: 'Unauthorized: Only citizens can query their pickup schedule.' };
      }

      try {
        // 2. Identity Binding
        const citizen = await citizenService.getById(session.userId);
        if (!citizen) {
          return { success: false, error: 'Citizen profile not found.' };
        }

        const routes = await routeService.getByWard(citizen.wardCode);
        
        return {
          success: true,
          wardName: citizen.ward,
          wardCode: citizen.wardCode,
          routes: routes.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status,
            scheduledFor: r.scheduledFor,
            startedAt: r.startedAt || null,
            completedAt: r.completedAt || null,
            distance: r.distance,
            estimatedDuration: r.estimatedDuration,
            pickupsScheduled: r.pickupsScheduled,
            pickupsCompleted: r.pickupsCompleted,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch pickup schedule.',
        };
      }
    },
  });
