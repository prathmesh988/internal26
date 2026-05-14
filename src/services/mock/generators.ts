/**
 * Mock Data Generators
 * Produces realistic municipal waste management data
 */

import {
  Complaint,
  Citizen,
  Worker,
  Vehicle,
  Route,
  Ward,
  Violation,
  Notification,
  Reward,
  WorkerPerformance,
  WardCompliance,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  WorkerRole,
  VehicleType,
  VehicleStatus,
  RouteCheckpoint,
  GeoPoint,
} from '@/types';

// ============================================================================
// CONSTANTS & SEED DATA
// ============================================================================

const WARDS_DATA = [
  { code: 'W01', name: 'Downtown', zone: 'Central' },
  { code: 'W02', name: 'North Hills', zone: 'North' },
  { code: 'W03', name: 'East Riverside', zone: 'East' },
  { code: 'W04', name: 'South Market', zone: 'South' },
  { code: 'W05', name: 'West Industrial', zone: 'West' },
  { code: 'W06', name: 'Mid Town', zone: 'Central' },
];

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'MISSED_PICKUP',
  'OVERFLOW',
  'SPILL',
  'ILLEGAL_DUMPING',
  'SEGREGATION',
  'VEHICLE_ISSUE',
];

const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

const VIOLATION_TYPES = [
  'IMPROPER_SEGREGATION',
  'OVERFLOW_BIN',
  'UNAUTHORIZED_DUMPING',
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
}

function getRandomWard() {
  return randomElement(WARDS_DATA);
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function getDateHoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function getRandomGeoPoint(): GeoPoint {
  return {
    lat: randomFloat(40.7128 - 0.05, 40.7128 + 0.05),
    lng: randomFloat(-74.006 - 0.05, -74.006 + 0.05),
  };
}

// ============================================================================
// COMPLAINT GENERATORS
// ============================================================================

export function generateComplaint(overrides?: Partial<Complaint>): Complaint {
  const ward = getRandomWard();
  const status = randomElement(COMPLAINT_STATUSES);
  const daysAgo = randomInt(0, 30);

  return {
    id: generateId('CMPL'),
    citizenId: generateId('CIT'),
    ward: ward.name,
    wardCode: ward.code,
    category: randomElement(COMPLAINT_CATEGORIES),
    title: generateComplaintTitle(),
    description: generateComplaintDescription(),
    location: getRandomGeoPoint(),
    status,
    priority: randomElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as ComplaintPriority[]),
    imageUrl: Math.random() > 0.5 ? 'https://via.placeholder.com/400x300?text=Complaint' : undefined,
    createdAt: getDateDaysAgo(daysAgo),
    updatedAt: getDateDaysAgo(Math.max(0, daysAgo - randomInt(0, 5))),
    assignedToWorkerId: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status) ? generateId('WRK') : undefined,
    assignedToWorkerName: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status) ? generateWorkerName() : undefined,
    resolutionNotes: ['RESOLVED', 'CLOSED'].includes(status) ? 'Pickup completed successfully.' : undefined,
    resolvedAt: ['RESOLVED', 'CLOSED'].includes(status) ? getDateDaysAgo(randomInt(0, 5)) : undefined,
    escalationCount: Math.random() > 0.8 ? randomInt(1, 3) : 0,
    escalatedAt: Math.random() > 0.9 ? getDateDaysAgo(randomInt(1, 10)) : undefined,
    escalationReason: Math.random() > 0.9 ? 'Customer dissatisfaction with resolution time' : undefined,
    estimatedResolutionTime: '2 hours',
    ...overrides,
  };
}

export function generateComplaints(count: number): Complaint[] {
  return Array.from({ length: count }, () => generateComplaint());
}

function generateComplaintTitle(): string {
  const titles = [
    'Missed garbage pickup',
    'Bin overflow at collection point',
    'Spill on main street',
    'Illegal dumping near park',
    'Improper waste segregation',
    'Vehicle leaking waste water',
    'Broken collection bin',
    'Double parking blocking pickup',
  ];
  return randomElement(titles);
}

function generateComplaintDescription(): string {
  const descriptions = [
    'The waste bin was not collected as scheduled.',
    'The collection point is overflowing with garbage for 2 days.',
    'There is scattered waste on the street.',
    'Unknown party has dumped construction debris.',
    'Residents not following segregation guidelines.',
    'Vehicle left a trail of waste while driving.',
    'The bin lid is broken and waste spilling out.',
    'Vehicle parked in collection point blocking access.',
  ];
  return randomElement(descriptions);
}

// ============================================================================
// CITIZEN GENERATORS
// ============================================================================

export function generateCitizen(overrides?: Partial<Citizen>): Citizen {
  const ward = getRandomWard();
  return {
    id: generateId('CIT'),
    email: `citizen${Math.random().toString(36).substr(2, 5)}@example.com`,
    name: generateCitizenName(),
    phone: generatePhoneNumber(),
    ward: ward.name,
    wardCode: ward.code,
    address: generateAddress(),
    rewardPoints: randomInt(0, 500),
    completedSurveys: randomInt(0, 20),
    complaintsFiled: randomInt(0, 15),
    complianceScore: randomInt(60, 100),
    createdAt: getDateDaysAgo(randomInt(30, 365)),
    lastActivityAt: getDateDaysAgo(randomInt(0, 7)),
    ...overrides,
  };
}

export function generateCitizens(count: number): Citizen[] {
  return Array.from({ length: count }, () => generateCitizen());
}

function generateCitizenName(): string {
  const firstNames = ['John', 'Maria', 'Rajesh', 'Priya', 'Ahmed', 'Sarah', 'Mohammed', 'Lisa'];
  const lastNames = ['Singh', 'Kumar', 'Sharma', 'Patel', 'Khan', 'Johnson', 'Brown', 'Garcia'];
  return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
}

function generatePhoneNumber(): string {
  return `+1${randomInt(2, 9)}${randomInt(0, 9)}${randomInt(0, 9)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}

function generateAddress(): string {
  const streets = ['Main St', 'Park Ave', 'Oak Road', 'Elm Street', 'Maple Drive', 'Cedar Lane'];
  const number = randomInt(1, 999);
  return `${number} ${randomElement(streets)}`;
}

function generateWorkerName(): string {
  const firstNames = ['James', 'David', 'Robert', 'Michael', 'Christopher', 'Daniel', 'Matthew'];
  const lastNames = ['Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];
  return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
}

// ============================================================================
// WORKER GENERATORS
// ============================================================================

export function generateWorker(overrides?: Partial<Worker>): Worker {
  const ward = getRandomWard();
  return {
    id: generateId('WRK'),
    name: generateWorkerName(),
    email: `worker${Math.random().toString(36).substr(2, 5)}@municipal.gov`,
    phone: generatePhoneNumber(),
    role: randomElement(['COLLECTOR', 'SUPERVISOR', 'OPERATOR'] as WorkerRole[]),
    status: randomElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'ON_LEAVE'] as const),
    assignedVehicle: Math.random() > 0.3 ? generateId('VEH') : undefined,
    ward: ward.name,
    wardCode: ward.code,
    completionRate: randomInt(75, 99),
    averageRating: randomFloat(3.5, 5),
    totalPickups: randomInt(500, 5000),
    totalComplaints: randomInt(0, 50),
    hireDate: getDateDaysAgo(randomInt(180, 1825)),
    lastActiveAt: getDateDaysAgo(randomInt(0, 2)),
    ...overrides,
  };
}

export function generateWorkers(count: number): Worker[] {
  return Array.from({ length: count }, () => generateWorker());
}

// ============================================================================
// VEHICLE GENERATORS
// ============================================================================

export function generateVehicle(overrides?: Partial<Vehicle>): Vehicle {
  const capacity = randomElement([5000, 7000, 10000, 12000]);
  const currentLoad = randomInt(0, capacity);

  return {
    id: generateId('VEH'),
    registrationNumber: generateRegistrationNumber(),
    type: randomElement(['COMPACTOR', 'TIPPER', 'OPEN_BED', 'SPECIAL_WASTE'] as VehicleType[]),
    capacity,
    currentLoad,
    status: randomElement(['IDLE', 'IN_USE', 'MAINTENANCE', 'FUEL'] as VehicleStatus[]),
    currentLocation: getRandomGeoPoint(),
    assignedDriver: Math.random() > 0.3 ? generateId('WRK') : undefined,
    assignedDriverName: Math.random() > 0.3 ? generateWorkerName() : undefined,
    route: Math.random() > 0.5 ? generateId('RTE') : undefined,
    lastFueledAt: getDateDaysAgo(randomInt(0, 3)),
    maintenanceDueAt: Math.random() > 0.8 ? getDateDaysAgo(-randomInt(1, 30)) : undefined,
    fuelLevel: randomInt(20, 100),
    totalMileage: randomInt(5000, 150000),
    ...overrides,
  };
}

export function generateVehicles(count: number): Vehicle[] {
  return Array.from({ length: count }, () => generateVehicle());
}

function generateRegistrationNumber(): string {
  const prefix = randomElement(['MUN', 'WM', 'CORP']);
  return `${prefix}-${randomInt(1000, 9999)}`;
}

// ============================================================================
// ROUTE GENERATORS
// ============================================================================

export function generateRoute(overrides?: Partial<Route>): Route {
  const ward = getRandomWard();
  const status = randomElement(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED'] as const);
  const checkpoints = generateRouteCheckpoints(5);

  return {
    id: generateId('RTE'),
    name: `${ward.code}-Route-${randomInt(1, 5)}`,
    ward: ward.name,
    wardCode: ward.code,
    vehicleId: generateId('VEH'),
    workerId: generateId('WRK'),
    workerName: generateWorkerName(),
    status,
    scheduledFor: getDateDaysAgo(randomInt(0, 3)),
    startedAt: ['IN_PROGRESS', 'COMPLETED'].includes(status) ? getDateHoursAgo(randomInt(2, 8)) : undefined,
    completedAt: status === 'COMPLETED' ? getDateHoursAgo(randomInt(0, 2)) : undefined,
    checkpoints,
    distance: randomFloat(8, 25),
    estimatedDuration: randomInt(120, 480),
    actualDuration: status === 'COMPLETED' ? randomInt(120, 540) : undefined,
    pickupsScheduled: randomInt(15, 50),
    pickupsCompleted: status === 'COMPLETED' ? randomInt(14, 50) : status === 'IN_PROGRESS' ? randomInt(5, 25) : 0,
    efficiency: randomInt(70, 98),
    deviations: [],
    ...overrides,
  };
}

export function generateRoutes(count: number): Route[] {
  return Array.from({ length: count }, () => generateRoute());
}

function generateRouteCheckpoints(count: number): RouteCheckpoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId('CHK'),
    sequence: i + 1,
    location: getRandomGeoPoint(),
    address: generateAddress(),
    expectedTime: new Date(Date.now() + i * 3600000).toISOString(),
    actualTime: Math.random() > 0.4 ? new Date(Date.now() + i * 3600000 + randomInt(-300000, 600000)).toISOString() : undefined,
    status: Math.random() > 0.3 ? 'COMPLETED' : 'PENDING',
    pickupCount: randomInt(2, 15),
    notes: Math.random() > 0.8 ? 'Delayed due to traffic' : undefined,
  }));
}

// ============================================================================
// WARD GENERATORS
// ============================================================================

export function generateWards(): Ward[] {
  return WARDS_DATA.map((ward) => ({
    id: generateId('WRD'),
    code: ward.code,
    name: ward.name,
    zone: ward.zone,
    population: randomInt(25000, 150000),
    area: randomFloat(2, 15),
    complaintCount: randomInt(10, 200),
    averageResponseTime: randomInt(2, 12),
    cleanlinessScore: randomInt(60, 95),
    pickupsScheduledToday: randomInt(30, 100),
    pickupsCompletedToday: randomInt(25, 100),
    citizens: randomInt(5000, 30000),
    bounds: {
      north: 40.7680,
      south: 40.7580,
      east: -73.9776,
      west: -73.9876,
    },
  }));
}

export function getWardByCode(code: string): Ward | undefined {
  const wards = generateWards();
  return wards.find((w) => w.code === code);
}

// ============================================================================
// VIOLATION GENERATORS
// ============================================================================

export function generateViolation(overrides?: Partial<Violation>): Violation {
  const ward = getRandomWard();
  return {
    id: generateId('VIO'),
    citizenId: Math.random() > 0.5 ? generateId('CIT') : undefined,
    citizenName: Math.random() > 0.5 ? generateCitizenName() : undefined,
    workerId: Math.random() > 0.5 ? generateId('WRK') : undefined,
    workerName: Math.random() > 0.5 ? generateWorkerName() : undefined,
    type: randomElement(['IMPROPER_SEGREGATION', 'OVERFLOW_BIN', 'UNAUTHORIZED_DUMPING'] as const),
    severity: randomElement(['LOW', 'MEDIUM', 'HIGH'] as const),
    description: 'Waste not properly segregated at source.',
    location: getRandomGeoPoint(),
    ward: ward.name,
    wardCode: ward.code,
    fineAmount: randomInt(500, 5000),
    status: randomElement(['OPEN', 'RESOLVED', 'RESOLVED'] as const),
    createdAt: getDateDaysAgo(randomInt(0, 60)),
    resolvedAt: Math.random() > 0.4 ? getDateDaysAgo(randomInt(0, 30)) : undefined,
    evidence: ['https://via.placeholder.com/400x300?text=Evidence1', 'https://via.placeholder.com/400x300?text=Evidence2'],
    ...overrides,
  };
}

export function generateViolations(count: number): Violation[] {
  return Array.from({ length: count }, () => generateViolation());
}

// ============================================================================
// NOTIFICATION GENERATORS
// ============================================================================

export function generateNotification(overrides?: Partial<Notification>): Notification {
  return {
    id: generateId('NOT'),
    citizenId: generateId('CIT'),
    type: randomElement(['COMPLAINT_UPDATE', 'PICKUP_REMINDER', 'REWARD', 'ALERT', 'SURVEY'] as const),
    title: 'Waste collection scheduled',
    message: 'Your ward will have waste collection tomorrow at 8 AM',
    read: Math.random() > 0.3,
    createdAt: getDateHoursAgo(randomInt(0, 48)),
    relatedComplaintId: Math.random() > 0.5 ? generateId('CMPL') : undefined,
    ...overrides,
  };
}

export function generateNotifications(count: number): Notification[] {
  return Array.from({ length: count }, () => generateNotification());
}

// ============================================================================
// REWARD GENERATORS
// ============================================================================

export function generateReward(overrides?: Partial<Reward>): Reward {
  return {
    id: generateId('RWD'),
    citizenId: generateId('CIT'),
    pointsAwarded: randomElement([10, 25, 50, 100]),
    reason: randomElement(['SEGREGATION', 'SURVEY', 'COMPLAINT', 'COMPLIANCE', 'REFERRAL'] as const),
    createdAt: getDateDaysAgo(randomInt(0, 30)),
    ...overrides,
  };
}

export function generateRewards(count: number): Reward[] {
  return Array.from({ length: count }, () => generateReward());
}

// ============================================================================
// PERFORMANCE GENERATORS
// ============================================================================

export function generateWorkerPerformance(workerId: string, workerName: string): WorkerPerformance {
  const monthlyTrend = Array.from({ length: 30 }, (_, i) => ({
    date: getDateDaysAgo(30 - i),
    pickups: randomInt(5, 25),
    rating: randomFloat(3.5, 5),
  }));

  return {
    workerId,
    workerName,
    totalPickups: randomInt(500, 5000),
    onTimePickups: randomInt(400, 4500),
    completionRate: randomInt(85, 99),
    avgRating: randomFloat(4, 5),
    complaintsRaised: randomInt(0, 20),
    avgResolutionTime: '2.5 hours',
    monthlyTrend,
  };
}

// ============================================================================
// COMPLIANCE GENERATORS
// ============================================================================

export function generateWardCompliance(wardCode: string, wardName: string): WardCompliance {
  const trend = Array.from({ length: 30 }, (_, i) => ({
    date: getDateDaysAgo(30 - i),
    violations: randomInt(0, 20),
    resolved: randomInt(0, 15),
    compliance: randomInt(60, 95),
  }));

  return {
    wardCode,
    wardName,
    totalViolations: randomInt(50, 300),
    violationsThisMonth: randomInt(5, 50),
    compliancePercentage: randomInt(65, 95),
    averageResolutionTime: randomInt(12, 72),
    trend,
  };
}

// ============================================================================
// DASHBOARD METRICS GENERATOR
// ============================================================================

export function generateDashboardMetrics() {
  return {
    totalComplaints: randomInt(500, 2000),
    complaintsToday: randomInt(10, 100),
    complaintsResolved: randomInt(50, 200),
    pendingEscalations: randomInt(2, 25),
    routeEfficiency: randomInt(75, 95),
    missedPickups: randomInt(2, 20),
    citizenParticipation: randomInt(30, 85),
    wardCleanliness: randomInt(65, 90),
    workerCompletionRate: randomInt(85, 97),
    vehicleUtilization: randomInt(70, 95),
  };
}
