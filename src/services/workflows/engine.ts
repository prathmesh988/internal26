/**
 * Workflow Simulation Engine
 * Simulates n8n-style workflows for automation
 */

import { generateId, generateComplaint, generateNotification } from '@/services/mock/generators';
import {
  complaintService,
  citizenService,
  workerService,
  vehicleService,
  routeService,
  violationService,
  notificationService,
  rewardService,
} from '../appwrite/client';
import {
  Complaint,
  Notification,
  WorkflowExecution,
  ComplaintStatus,
  ComplaintPriority,
  Reward,
} from '@/types';

// ============================================================================
// WORKFLOW STATE
// ============================================================================

let workflowHistory: WorkflowExecution[] = [];
const MAX_HISTORY = 500;

// ============================================================================
// WORKFLOW EXECUTION HELPERS
// ============================================================================

async function executeWorkflow(
  trigger: string,
  handler: () => Promise<Record<string, unknown>>
): Promise<WorkflowExecution> {
  const execution: WorkflowExecution = {
    id: generateId('WF'),
    trigger: trigger as any,
    status: 'PENDING',
    startedAt: new Date().toISOString(),
    payload: {},
  };

  try {
    execution.status = 'EXECUTING';
    execution.result = await handler();
    execution.status = 'COMPLETED';
  } catch (error) {
    execution.status = 'FAILED';
    execution.error = error instanceof Error ? error.message : String(error);
  } finally {
    execution.completedAt = new Date().toISOString();
    workflowHistory.unshift(execution);

    // Keep history manageable
    if (workflowHistory.length > MAX_HISTORY) {
      workflowHistory = workflowHistory.slice(0, MAX_HISTORY);
    }
  }

  return execution;
}

// ============================================================================
// COMPLAINT WORKFLOWS
// ============================================================================

/**
 * Triggered when a new complaint is created
 * Assigns worker, creates notifications, logs audit
 */
export async function complaintCreatedWorkflow(complaintId: string): Promise<WorkflowExecution> {
  return executeWorkflow('COMPLAINT_CREATED', async () => {
    const complaint = await complaintService.getById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    // Get available workers for the ward
    const workers = await workerService.getByWard(complaint.wardCode);
    const availableWorker = workers.find((w) => w.status === 'ACTIVE');

    if (availableWorker) {
      // Assign worker
      await complaintService.update(complaintId, {
        status: 'ASSIGNED',
        assignedToWorkerId: availableWorker.id,
        assignedToWorkerName: availableWorker.name,
      });

      // Create notification for citizen
      const notification: Notification = {
        id: generateId('NOT'),
        citizenId: complaint.citizenId,
        type: 'COMPLAINT_UPDATE',
        title: 'Complaint Assigned',
        message: `Your complaint has been assigned to ${availableWorker.name}. Expected resolution within 24 hours.`,
        read: false,
        createdAt: new Date().toISOString(),
        relatedComplaintId: complaintId,
        actionUrl: `/citizen/complaints/${complaintId}`,
      };
      await notificationService.create(notification);
    }

    return { complaintId, assigned: !!availableWorker, workerId: availableWorker?.id };
  });
}

/**
 * Triggered when complaint escalation threshold is met
 * Notifies supervisors, increases priority
 */
export async function escalateComplaintWorkflow(complaintId: string, reason: string): Promise<WorkflowExecution> {
  return executeWorkflow('COMPLAINT_ESCALATED', async () => {
    const complaint = await complaintService.getById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    // Increase priority
    const newPriority: ComplaintPriority = complaint.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH';

    await complaintService.update(complaintId, {
      status: 'ESCALATED',
      priority: newPriority,
      escalationCount: complaint.escalationCount + 1,
      escalatedAt: new Date().toISOString(),
      escalationReason: reason,
    });

    // Create escalation notification
    const notification: Notification = {
      id: generateId('NOT'),
      citizenId: complaint.citizenId,
      type: 'ALERT',
      title: 'Complaint Escalated',
      message: `Your complaint has been escalated due to: ${reason}. A supervisor will contact you soon.`,
      read: false,
      createdAt: new Date().toISOString(),
      relatedComplaintId: complaintId,
    };
    await notificationService.create(notification);

    return { complaintId, escalated: true, reason };
  });
}

/**
 * Triggered when complaint is resolved
 * Awards rewards, creates audit trail
 */
export async function complaintResolvedWorkflow(complaintId: string): Promise<WorkflowExecution> {
  return executeWorkflow('COMPLAINT_RESOLVED', async () => {
    const complaint = await complaintService.getById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    await complaintService.update(complaintId, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
    });

    // Award citizen points
    const reward: Reward = {
      id: generateId('RWD'),
      citizenId: complaint.citizenId,
      pointsAwarded: 25,
      reason: 'COMPLAINT',
      createdAt: new Date().toISOString(),
    };
    await rewardService.create(reward);

    // Notify citizen
    const notification: Notification = {
      id: generateId('NOT'),
      citizenId: complaint.citizenId,
      type: 'COMPLAINT_UPDATE',
      title: 'Complaint Resolved',
      message: 'Your complaint has been successfully resolved. You earned 25 reward points!',
      read: false,
      createdAt: new Date().toISOString(),
      relatedComplaintId: complaintId,
    };
    await notificationService.create(notification);

    // Update citizen compliance score
    const citizen = await citizenService.getById(complaint.citizenId);
    if (citizen) {
      await citizenService.update(complaint.citizenId, {
        complianceScore: Math.min(100, citizen.complianceScore + 5),
        complaintsFiled: citizen.complaintsFiled + 1,
      });
    }

    return { complaintId, resolved: true, rewardAwarded: 25 };
  });
}

// ============================================================================
// ROUTE WORKFLOWS
// ============================================================================

/**
 * Triggered when route deviates from planned path
 * Alerts supervisors, logs deviation
 */
export async function routeDeviationWorkflow(
  routeId: string,
  deviationType: string,
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
): Promise<WorkflowExecution> {
  return executeWorkflow('ROUTE_DEVIATION', async () => {
    const route = await routeService.getById(routeId);
    if (!route) throw new Error('Route not found');

    // Add deviation record
    route.deviations.push({
      id: generateId('DEV'),
      type: deviationType as any,
      severity,
      description: `Route deviation detected: ${deviationType}`,
      location: { lat: 0, lng: 0 },
      detectedAt: new Date().toISOString(),
    });

    await routeService.update(routeId, { deviations: route.deviations });

    return { routeId, deviationType, severity };
  });
}

/**
 * Triggered when route is completed
 * Calculates efficiency, updates worker stats
 */
export async function routeCompletedWorkflow(routeId: string): Promise<WorkflowExecution> {
  return executeWorkflow('ROUTE_COMPLETED', async () => {
    const route = await routeService.getById(routeId);
    if (!route || !route.workerId) throw new Error('Route not found');

    const actualDuration = route.actualDuration || Math.random() * 300 + 120;
    const efficiency = Math.min(100, (route.estimatedDuration / actualDuration) * 100);

    await routeService.update(routeId, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      actualDuration,
      efficiency: Math.round(efficiency),
    });

    // Update worker performance
    const worker = await workerService.getById(route.workerId);
    if (worker) {
      const completionIncrease = route.pickupsCompleted || 0;
      await workerService.update(route.workerId, {
        totalPickups: worker.totalPickups + completionIncrease,
        completionRate: Math.min(99, worker.completionRate + Math.random() * 2),
        lastActiveAt: new Date().toISOString(),
      });
    }

    return { routeId, efficiency: Math.round(efficiency), pickupsCompleted: route.pickupsCompleted };
  });
}

// ============================================================================
// CITIZEN WORKFLOWS
// ============================================================================

/**
 * Triggered on scheduled pickup reminder
 * Sends notification to citizens
 */
export async function pickupReminderWorkflow(wardCode: string): Promise<WorkflowExecution> {
  return executeWorkflow('PICKUP_REMINDER', async () => {
    const citizens = await citizenService.getByWard(wardCode);

    const notificationPromises = citizens.map(async (citizen) => {
      const notification: Notification = {
        id: generateId('NOT'),
        citizenId: citizen.id,
        type: 'PICKUP_REMINDER',
        title: 'Waste Pickup Scheduled',
        message: `Waste collection is scheduled for your ward tomorrow at 8:00 AM. Please ensure bins are ready.`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await notificationService.create(notification);
    });

    await Promise.all(notificationPromises);

    return { wardCode, notificationsSent: citizens.length };
  });
}

/**
 * Triggered when citizen completes survey or action
 * Awards reward points
 */
export async function rewardCitizenWorkflow(
  citizenId: string,
  reason: 'SEGREGATION' | 'SURVEY' | 'REFERRAL'
): Promise<WorkflowExecution> {
  return executeWorkflow('REWARD_EARNED', async () => {
    const citizen = await citizenService.getById(citizenId);
    if (!citizen) throw new Error('Citizen not found');

    const pointValues = { SEGREGATION: 50, SURVEY: 25, REFERRAL: 100 };
    const points = pointValues[reason];

    // Create reward
    const reward: Reward = {
      id: generateId('RWD'),
      citizenId,
      pointsAwarded: points,
      reason,
      createdAt: new Date().toISOString(),
    };
    await rewardService.create(reward);

    // Update citizen points
    await citizenService.update(citizenId, {
      rewardPoints: citizen.rewardPoints + points,
    });

    // Create notification
    const notification: Notification = {
      id: generateId('NOT'),
      citizenId,
      type: 'REWARD',
      title: 'Reward Earned!',
      message: `You earned ${points} reward points for ${reason.toLowerCase()}!`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await notificationService.create(notification);

    return { citizenId, pointsAwarded: points, reason };
  });
}

// ============================================================================
// VIOLATION WORKFLOWS
// ============================================================================

/**
 * Triggered when violation is detected
 * Creates notification, assigns for resolution
 */
export async function violationDetectedWorkflow(violationId: string): Promise<WorkflowExecution> {
  return executeWorkflow('VIOLATION_DETECTED', async () => {
    const violation = await violationService.getById(violationId);
    if (!violation) throw new Error('Violation not found');

    // Notify relevant citizen if applicable
    if (violation.citizenId) {
      const notification: Notification = {
        id: generateId('NOT'),
        citizenId: violation.citizenId,
        type: 'ALERT',
        title: 'Waste Management Violation',
        message: `A ${violation.type} violation has been recorded at your location. A fine of ${violation.fineAmount} has been imposed.`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await notificationService.create(notification);
    }

    return { violationId, type: violation.type, fineAmount: violation.fineAmount };
  });
}

// ============================================================================
// SYSTEM WORKFLOWS
// ============================================================================

/**
 * Simulates real-time updates across the system
 * Triggered periodically to update vehicle locations, route statuses
 */
export async function systemHealthCheckWorkflow(): Promise<WorkflowExecution> {
  return executeWorkflow('SYSTEM_HEALTH_CHECK', async () => {
    // Update vehicle locations randomly
    const vehicleResponse = await vehicleService.list(1, 100);
    for (const vehicle of vehicleResponse.data) {
      const newLocation = {
        lat: vehicle.currentLocation.lat + (Math.random() - 0.5) * 0.01,
        lng: vehicle.currentLocation.lng + (Math.random() - 0.5) * 0.01,
      };
      await vehicleService.update(vehicle.id, { currentLocation: newLocation });
    }

    // Update active routes
    const activeRoutes = await routeService.getActiveRoutes();
    for (const route of activeRoutes) {
      const newPickups = Math.min(route.pickupsScheduled, route.pickupsCompleted + Math.floor(Math.random() * 3));
      await routeService.update(route.id, { pickupsCompleted: newPickups });
    }

    return {
      vehiclesUpdated: vehicleResponse.data.length,
      routesUpdated: activeRoutes.length,
      timestamp: new Date().toISOString(),
    };
  });
}

/**
 * Performance alert workflow
 * Triggered when worker performance drops below threshold
 */
export async function performanceAlertWorkflow(workerId: string): Promise<WorkflowExecution> {
  return executeWorkflow('PERFORMANCE_ALERT', async () => {
    const worker = await workerService.getById(workerId);
    if (!worker) throw new Error('Worker not found');

    const alert = {
      workerId,
      workerName: worker.name,
      completionRate: worker.completionRate,
      averageRating: worker.averageRating,
      alertReason:
        worker.completionRate < 80
          ? 'Low completion rate'
          : worker.averageRating < 3.5
            ? 'Low customer rating'
            : 'Performance degradation',
    };

    return alert;
  });
}

// ============================================================================
// WORKFLOW HISTORY
// ============================================================================

export function getWorkflowHistory(): WorkflowExecution[] {
  return [...workflowHistory];
}

export function clearWorkflowHistory(): void {
  workflowHistory = [];
}

// ============================================================================
// REALTIME SIMULATION
// ============================================================================

let realtimeIntervalId: NodeJS.Timeout | null = null;

export function startRealtimeSimulation(interval: number = 30000): void {
  if (realtimeIntervalId) return;

  realtimeIntervalId = setInterval(() => {
    systemHealthCheckWorkflow().catch(console.error);
  }, interval);
}

export function stopRealtimeSimulation(): void {
  if (realtimeIntervalId) {
    clearInterval(realtimeIntervalId);
    realtimeIntervalId = null;
  }
}
