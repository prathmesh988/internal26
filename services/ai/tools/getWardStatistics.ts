import { tool } from 'ai';
import { z } from 'zod';
import { wardService, violationService } from '@/services/appwrite/client';

export const getWardStatistics = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get statistics, cleanliness ratings, populations, and violation counts aggregated by municipal ward (Admin Only).',
    parameters: z.object({}),
    execute: async () => {
      // 1. Role Authorization
      if (session.userType !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: Access restricted to Administrators only.' };
      }

      try {
        const [wards, violationsResult] = await Promise.all([
          wardService.list(),
          violationService.list(1, 200),
        ]);

        const violations = violationsResult.data;

        // Group violations count by wardCode
        const violationCounts: Record<string, number> = {};
        for (const v of violations) {
          if (v.wardCode) {
            violationCounts[v.wardCode] = (violationCounts[v.wardCode] || 0) + 1;
          }
        }

        const wardStats = wards.map((w) => ({
          code: w.code,
          name: w.name,
          zone: w.zone,
          cleanlinessScore: w.cleanlinessScore,
          activeComplaintsCount: w.complaintCount,
          citizensCount: w.citizens,
          population: w.population,
          areaSqKm: w.area,
          violationsCount: violationCounts[w.code] || 0,
        }));

        return {
          success: true,
          wards: wardStats,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to query ward statistics.',
        };
      }
    },
  });
