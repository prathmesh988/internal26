import { tool } from 'ai';
import { z } from 'zod';
import { complaintService, wardService, violationService, workerService } from '@/services/appwrite/client';
import { getServerTrackingEngine } from '@/services/tracking/server-tracker';

export const generateDailyReport = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Generate a composed operational daily report covering complaints, fleet status, ward compliance, and exceptions (Admin Only).',
    parameters: z.object({}),
    execute: async () => {
      // 1. Role Authorization
      if (session.userType !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: Access restricted to Administrators only.' };
      }

      try {
        const [complaintsRes, wards, violationsRes, workersRes, trackingEngine] = await Promise.all([
          complaintService.list({}, 1, 200),
          wardService.list(),
          violationService.list(1, 200),
          workerService.list(1, 100),
          getServerTrackingEngine(),
        ]);

        const complaints = complaintsRes.data;
        const violations = violationsRes.data;
        const workers = workersRes.data;
        const vehicles = trackingEngine.getVehicles();

        // 1. Fleet status
        const totalVehicles = vehicles.length;
        const activeVehicles = vehicles.filter((v) => v.status !== 'completed' && v.status !== 'idle').length;
        const delayedVehicles = vehicles.filter((v) => v.status === 'delayed' || v.isDeviated).length;

        // 2. Complaint counts
        const totalComplaints = complaintsRes.total;
        const openComplaints = complaints.filter((c) => c.status === 'OPEN' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
        const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

        // 3. Ward Overview
        const averageCleanliness = wards.length > 0 
          ? Math.round(wards.reduce((sum, w) => sum + w.cleanlinessScore, 0) / wards.length)
          : 100;

        // 4. Exception Highlights
        const workerExceptionsCount = workers.filter((w) => w.completionRate < 85).length;
        const activeViolationsCount = violations.filter((v) => v.status === 'OPEN').length;

        return {
          success: true,
          generatedAt: new Date().toISOString(),
          summary: {
            averageCleanlinessScore: `${averageCleanliness}/100`,
            totalActiveComplaints: openComplaints,
            totalResolvedComplaints: resolvedComplaints,
            totalViolationsRecorded: activeViolationsCount,
          },
          fleet: {
            totalCount: totalVehicles,
            activeCount: activeVehicles,
            delayedOrDeviatedCount: delayedVehicles,
          },
          exceptions: {
            workerComplianceAlerts: workerExceptionsCount,
            activeViolationsAlerts: activeViolationsCount,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate daily operational report.',
        };
      }
    },
  });
