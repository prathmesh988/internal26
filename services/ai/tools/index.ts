import { getPickupSchedule } from './getPickupSchedule';
import { getSegregationGuide } from './getSegregationGuide';
import { getComplaintStatus } from './getComplaintStatus';
import { createComplaint } from './createComplaint';
import { getRewardPoints } from './getRewardPoints';
import { getDelayedVehicles } from './getDelayedVehicles';
import { getComplaintAnalytics } from './getComplaintAnalytics';
import { getWardStatistics } from './getWardStatistics';
import { getMissedCheckpointWorkers } from './getMissedCheckpointWorkers';
import { generateDailyReport } from './generateDailyReport';

export function getChatTools(session: { userId: string; userType: string }) {
  return {
    getPickupSchedule: getPickupSchedule(session),
    getSegregationGuide: getSegregationGuide(session),
    getComplaintStatus: getComplaintStatus(session),
    createComplaint: createComplaint(session),
    getRewardPoints: getRewardPoints(session),
    getDelayedVehicles: getDelayedVehicles(session),
    getComplaintAnalytics: getComplaintAnalytics(session),
    getWardStatistics: getWardStatistics(session),
    getMissedCheckpointWorkers: getMissedCheckpointWorkers(session),
    generateDailyReport: generateDailyReport(session),
  };
}
