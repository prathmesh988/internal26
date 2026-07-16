import { tool } from 'ai';
import { z } from 'zod';
import { workerService } from '@/services/appwrite/client';
import { getServerTrackingEngine } from '@/services/tracking/server-tracker';

export const getMissedCheckpointWorkers = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get route compliance and performance logs of field workers, highlighting any on delayed/deviated routes or with low completion rates (Admin Only).',
    parameters: z.object({}),
    execute: async () => {
      // 1. Role Authorization
      if (session.userType !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: Access restricted to Administrators only.' };
      }

      try {
        const [workersResult, trackingEngine] = await Promise.all([
          workerService.list(1, 100),
          getServerTrackingEngine(),
        ]);

        const workers = workersResult.data;
        const vehicles = trackingEngine.getVehicles();

        // Identify deviated vehicles
        const deviatedVehicleRegs = new Set(
          vehicles.filter((v) => v.isDeviated).map((v) => v.registrationNumber)
        );

        const complianceReport = workers.map((w) => {
          const isAssignedToDeviated = w.assignedVehicle ? deviatedVehicleRegs.has(w.assignedVehicle) : false;
          
          return {
            id: w.id,
            name: w.name,
            role: w.role,
            status: w.status,
            completionRate: w.completionRate, // e.g. 0-100%
            averageRating: w.averageRating,     // 1.0-5.0
            totalPickups: w.totalPickups,
            totalComplaintsAgainst: w.totalComplaints,
            assignedVehicle: w.assignedVehicle || 'None',
            isCurrentlyDeviated: isAssignedToDeviated,
            complianceIssue: w.completionRate < 85 
              ? 'Low completion rate' 
              : isAssignedToDeviated 
              ? 'Assigned to active deviated route' 
              : w.totalComplaints > 2 
              ? 'High citizen complaints count' 
              : 'Compliant',
          };
        });

        // Filter to highlight exceptions (non-compliant or deviated workers)
        const exceptions = complianceReport.filter((r) => r.complianceIssue !== 'Compliant');

        return {
          success: true,
          totalWorkersChecked: complianceReport.length,
          totalExceptions: exceptions.length,
          flaggedWorkers: exceptions,
          allWorkers: complianceReport,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to query worker compliance.',
        };
      }
    },
  });
