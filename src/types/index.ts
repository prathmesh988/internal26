/**
 * Core Domain Types for Waste Management Automation System
 * Single source of truth for all TypeScript interfaces
 */

// ============================================================================
// COMPLAINT / TICKET TYPES
// ============================================================================

export type ComplaintStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplaintCategory = 'MISSED_PICKUP' | 'OVERFLOW' | 'SPILL' | 'ILLEGAL_DUMPING' | 'SEGREGATION' | 'VEHICLE_ISSUE' | 'OTHER';

export interface Complaint {
  id: string;
  citizenId: string;
  ward: string;
  wardCode: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  location: GeoPoint;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  assignedToWorkerId?: string;
  assignedToWorkerName?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  escalationCount: number;
  escalatedAt?: string;
  escalationReason?: string;
  estimatedResolutionTime?: string;
}

// ============================================================================
// CITIZEN TYPES
// ============================================================================

export interface Citizen {
  id: string;
  email: string;
  name: string;
  phone: string;
  ward: string;
  wardCode: string;
  address: string;
  rewardPoints: number;
  completedSurveys: number;
  complaintsFiled: number;
  complianceScore: number; // 0-100
  createdAt: string;
  lastActivityAt: string;
}

export interface Notification {
  id: string;
  citizenId: string;
  type: 'COMPLAINT_UPDATE' | 'PICKUP_REMINDER' | 'REWARD' | 'ALERT' | 'SURVEY';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  relatedComplaintId?: string;
}

export interface Reward {
  id: string;
  citizenId: string;
  pointsAwarded: number;
  reason: 'SEGREGATION' | 'SURVEY' | 'COMPLAINT' | 'COMPLIANCE' | 'REFERRAL';
  createdAt: string;
}

// ============================================================================
// WORKER / STAFF TYPES
// ============================================================================

export type WorkerRole = 'COLLECTOR' | 'SUPERVISOR' | 'OPERATOR' | 'ROUTE_PLANNER' | 'ADMIN';
export type WorkerStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'SUSPENDED';

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: WorkerRole;
  status: WorkerStatus;
  assignedVehicle?: string;
  ward?: string;
  wardCode?: string;
  completionRate: number; // 0-100
  averageRating: number; // 1-5
  totalPickups: number;
  totalComplaints: number;
  hireDate: string;
  lastActiveAt: string;
}

export interface WorkerPerformance {
  workerId: string;
  workerName: string;
  totalPickups: number;
  onTimePickups: number;
  completionRate: number;
  avgRating: number;
  complaintsRaised: number;
  avgResolutionTime: string;
  monthlyTrend: PerformanceTrend[];
}

export interface PerformanceTrend {
  date: string;
  pickups: number;
  rating: number;
}

// ============================================================================
// VEHICLE & ROUTE TYPES
// ============================================================================

export type VehicleStatus = 'IDLE' | 'IN_USE' | 'MAINTENANCE' | 'FUEL' | 'END_OF_DAY';
export type VehicleType = 'COMPACTOR' | 'TIPPER' | 'OPEN_BED' | 'SPECIAL_WASTE';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  capacity: number; // in kg
  currentLoad: number; // in kg
  status: VehicleStatus;
  currentLocation: GeoPoint;
  assignedDriver?: string;
  assignedDriverName?: string;
  route?: string;
  lastFueledAt: string;
  maintenanceDueAt?: string;
  fuelLevel: number; // 0-100
  totalMileage: number;
}

export interface Route {
  id: string;
  name: string;
  ward: string;
  wardCode: string;
  vehicleId?: string;
  workerId?: string;
  workerName?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  scheduledFor: string; // ISO date
  startedAt?: string;
  completedAt?: string;
  checkpoints: RouteCheckpoint[];
  distance: number; // in km
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  pickupsScheduled: number;
  pickupsCompleted: number;
  efficiency: number; // 0-100
  deviations: RouteDeviation[];
}

export interface RouteCheckpoint {
  id: string;
  sequence: number;
  location: GeoPoint;
  address: string;
  expectedTime: string; // ISO time
  actualTime?: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  pickupCount?: number;
  notes?: string;
}

export interface RouteDeviation {
  id: string;
  type: 'TIME_DELAY' | 'ROUTE_CHANGE' | 'MISSED_CHECKPOINT' | 'UNSCHEDULED_STOP';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  location: GeoPoint;
  detectedAt: string;
  resolvedAt?: string;
}

// ============================================================================
// WARD / GEOGRAPHY TYPES
// ============================================================================

export interface Ward {
  id: string;
  code: string;
  name: string;
  zone: string;
  population: number;
  area: number; // in sq km
  complaintCount: number;
  averageResponseTime: number; // in hours
  cleanlinessScore: number; // 0-100
  pickupsScheduledToday: number;
  pickupsCompletedToday: number;
  citizens: number;
  bounds: GeoBounds;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

// ============================================================================
// VIOLATION & COMPLIANCE TYPES
// ============================================================================

export interface Violation {
  id: string;
  citizenId?: string;
  citizenName?: string;
  workerId?: string;
  workerName?: string;
  type: 'IMPROPER_SEGREGATION' | 'OVERFLOW_BIN' | 'UNAUTHORIZED_DUMPING' | 'MISSED_PAYMENT' | 'VEHICLE_VIOLATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  location: GeoPoint;
  ward: string;
  wardCode: string;
  fineAmount: number;
  status: 'OPEN' | 'RESOLVED' | 'APPEALED';
  createdAt: string;
  resolvedAt?: string;
  evidence?: string[]; // URLs to photos
}

export interface WardCompliance {
  wardCode: string;
  wardName: string;
  totalViolations: number;
  violationsThisMonth: number;
  compliancePercentage: number;
  averageResolutionTime: number;
  trend: ComplianceTrend[];
}

export interface ComplianceTrend {
  date: string;
  violations: number;
  resolved: number;
  compliance: number;
}

// ============================================================================
// ANALYTICS & DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  totalComplaints: number;
  complaintsToday: number;
  complaintsResolved: number;
  pendingEscalations: number;
  routeEfficiency: number;
  missedPickups: number;
  citizenParticipation: number;
  wardCleanliness: number;
  workerCompletionRate: number;
  vehicleUtilization: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export type WorkflowTrigger = 
  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_ESCALATED'
  | 'ROUTE_DEVIATION'
  | 'PICKUP_REMINDER'
  | 'REWARD_EARNED'
  | 'VIOLATION_DETECTED'
  | 'PERFORMANCE_ALERT';

export interface WorkflowExecution {
  id: string;
  trigger: WorkflowTrigger;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
}

// ============================================================================
// REALTIME UPDATE TYPES
// ============================================================================

export interface RealtimeUpdate {
  id: string;
  type: 'COMPLAINT_UPDATE' | 'VEHICLE_LOCATION' | 'ROUTE_STATUS' | 'ALERT' | 'NOTIFICATION';
  data: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface ComplaintFormData {
  category: ComplaintCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageFile?: File;
  ward: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  userType: 'CITIZEN' | 'ADMIN' | 'WORKER';
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export interface FilterState {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: ComplaintCategory;
  ward?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
