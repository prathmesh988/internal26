import { tool } from 'ai';
import { z } from 'zod';
import { citizenService, rewardService } from '@/services/appwrite/client';

export const getRewardPoints = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get total reward points balance, current tier level, points to next milestone, and recent points history.',
    parameters: z.object({}),
    execute: async () => {
      // 1. Role Enforcement
      if (session.userType !== 'CITIZEN') {
        return { success: false, error: 'Unauthorized: Only citizens can view their rewards ledger.' };
      }

      try {
        // 2. Identity Binding
        const citizen = await citizenService.getById(session.userId);
        if (!citizen) {
          return { success: false, error: 'Citizen profile not found.' };
        }

        const rewardsList = await rewardService.list(session.userId, 1, 10);

        // Compute tier milestones locally
        const points = citizen.rewardPoints || 0;
        let currentTier = 'Bronze';
        let nextTier = 'Silver';
        let remaining = 250 - points;
        let pct = Math.round((points / 250) * 100);

        if (points >= 1200) {
          currentTier = 'Platinum';
          nextTier = 'Maximum Milestone';
          remaining = 0;
          pct = 100;
        } else if (points >= 600) {
          currentTier = 'Gold';
          nextTier = 'Platinum';
          remaining = 1200 - points;
          pct = Math.round(((points - 600) / 600) * 100);
        } else if (points >= 250) {
          currentTier = 'Silver';
          nextTier = 'Gold';
          remaining = 600 - points;
          pct = Math.round(((points - 250) / 350) * 100);
        }

        return {
          success: true,
          points,
          currentTier,
          nextTier,
          remaining,
          progressPercentage: pct,
          history: rewardsList.data.map((r) => ({
            id: r.id,
            pointsAwarded: r.pointsAwarded,
            reason: r.reason,
            createdAt: r.createdAt,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to query rewards points.',
        };
      }
    },
  });
