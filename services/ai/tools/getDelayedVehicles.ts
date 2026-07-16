import { tool } from 'ai';
import { z } from 'zod';
import { getServerTrackingEngine } from '@/services/tracking/server-tracker';

export const getDelayedVehicles = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get list of delayed or deviated garbage collection trucks from the real-time simulation engine (Admin Only).',
    parameters: z.object({}),
    execute: async () => {
      // 1. Role Authorization
      if (session.userType !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: Access restricted to Administrators only.' };
      }

      try {
        const engine = getServerTrackingEngine();
        const vehicles = engine.getVehicles();
        const delayed = vehicles.filter((v) => v.status === 'delayed' || v.isDeviated);

        return {
          success: true,
          delayedVehicles: delayed.map((v) => ({
            id: v.id,
            registrationNumber: v.registrationNumber,
            driverName: v.driverName,
            driverPhone: v.driverPhone,
            status: v.status,
            speed: v.speed,
            bearing: v.bearing,
            efficiency: v.efficiency,
            distanceCovered: v.distanceCovered,
            isDeviated: v.isDeviated,
            wardName: v.currentRoute.wardName,
            wardCode: v.currentRoute.wardCode,
            deviationPoints: v.deviationPath?.length || 0,
          })),
          totalDelayed: delayed.length,
          message: delayed.length === 0 ? 'All vehicles are operating normally on their paths.' : undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to query delayed vehicles.',
        };
      }
    },
  });
