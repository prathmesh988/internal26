/**
 * Appwrite Service Layer
 * Connects directly to the Appwrite database using the Web SDK client
 */

import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';
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
  ComplaintStatus,
  FilterState,
  PaginatedResponse,
} from '@/types';

// ============================================================================
// APPWRITE CLIENT INITIALIZATION
// ============================================================================

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6a54010f001e2cdc301d');


export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export const DATABASE_ID = '6a540f2e001dfabaccb5';

// Self-executing initialization to handle anonymous session if not logged in
let sessionPromise: Promise<any> | null = null;
export function getOrCreateSession() {
  if (!sessionPromise) {
    sessionPromise = account.get()
      .catch(() => {
        return account.createAnonymousSession()
          .catch(err => {
            console.error("Anonymous session creation failed:", err);
            return null;
          });
      });
  }
  return sessionPromise;
}

if (typeof window !== 'undefined') {
  getOrCreateSession();
}

export { client };

// ============================================================================
// INITIALIZATION & MOCK COMPATIBILITY
// ============================================================================

export function initializeMockStore() {
  // No-op in real DB integration
}

export function getMockStore() {
  return {
    complaints: new Map(),
    citizens: new Map(),
    workers: new Map(),
    vehicles: new Map(),
    routes: new Map(),
    wards: new Map(),
    violations: new Map(),
    notifications: new Map(),
    rewards: new Map(),
  };
}

// ============================================================================
// PARSING & SERIALIZATION UTILITIES
// ============================================================================

function parseJSON(val: any, defaultVal: any = null) {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return defaultVal;
    }
  }
  return val || defaultVal;
}

function stringifyJSON(val: any) {
  if (val && typeof val === 'object') {
    return JSON.stringify(val);
  }
  return val;
}

// ============================================================================
// DATA SCHEMA MAPPERS
// ============================================================================

function mapComplaint(doc: any): Complaint {
  return {
    id: doc.$id,
    citizenId: doc.citizenId,
    ward: doc.ward,
    wardCode: doc.wardCode,
    category: doc.category,
    title: doc.title,
    description: doc.description,
    location: parseJSON(doc.location, { lat: 0, lng: 0 }),
    status: doc.status,
    priority: doc.priority,
    imageUrl: doc.imageUrl || undefined,
    createdAt: doc.$createdAt || doc.createdAt,
    updatedAt: doc.$updatedAt || doc.updatedAt,
    assignedToWorkerId: doc.assignedToWorkerId || undefined,
    assignedToWorkerName: doc.assignedToWorkerName || undefined,
    resolutionNotes: doc.resolutionNotes || undefined,
    resolvedAt: doc.resolvedAt || undefined,
    escalationCount: doc.escalationCount || 0,
    escalatedAt: doc.escalatedAt || undefined,
    escalationReason: doc.escalationReason || undefined,
    estimatedResolutionTime: doc.estimatedResolutionTime || undefined,
  };
}

function mapCitizen(doc: any): Citizen {
  return {
    id: doc.$id,
    email: doc.email,
    name: doc.name,
    phone: doc.phone,
    ward: doc.ward,
    wardCode: doc.wardCode,
    address: doc.address,
    rewardPoints: doc.rewardPoints || 0,
    completedSurveys: doc.completedSurveys || 0,
    complaintsFiled: doc.complaintsFiled || 0,
    complianceScore: doc.complianceScore || 0,
    createdAt: doc.$createdAt || doc.createdAt,
    lastActivityAt: doc.lastActivityAt,
  };
}

function mapWorker(doc: any): Worker {
  return {
    id: doc.$id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    status: doc.status,
    assignedVehicle: doc.assignedVehicle || undefined,
    ward: doc.ward || undefined,
    wardCode: doc.wardCode || undefined,
    completionRate: doc.completionRate || 0,
    averageRating: doc.averageRating || 0,
    totalPickups: doc.totalPickups || 0,
    totalComplaints: doc.totalComplaints || 0,
    hireDate: doc.hireDate,
    lastActiveAt: doc.lastActiveAt,
  };
}

function mapVehicle(doc: any): Vehicle {
  return {
    id: doc.$id,
    registrationNumber: doc.registrationNumber,
    type: doc.type,
    capacity: doc.capacity,
    currentLoad: doc.currentLoad || 0,
    status: doc.status,
    currentLocation: parseJSON(doc.currentLocation, { lat: 0, lng: 0 }),
    assignedDriver: doc.assignedDriver || undefined,
    assignedDriverName: doc.assignedDriverName || undefined,
    route: doc.route || undefined,
    lastFueledAt: doc.lastFueledAt,
    maintenanceDueAt: doc.maintenanceDueAt || undefined,
    fuelLevel: doc.fuelLevel || 0,
    totalMileage: doc.totalMileage || 0,
  };
}

function mapRoute(doc: any): Route {
  return {
    id: doc.$id,
    name: doc.name,
    ward: doc.ward,
    wardCode: doc.wardCode,
    vehicleId: doc.vehicleId || undefined,
    workerId: doc.workerId || undefined,
    workerName: doc.workerName || undefined,
    status: doc.status,
    scheduledFor: doc.scheduledFor,
    startedAt: doc.startedAt || undefined,
    completedAt: doc.completedAt || undefined,
    checkpoints: parseJSON(doc.checkpoints, []),
    distance: doc.distance || 0,
    estimatedDuration: doc.estimatedDuration || 0,
    actualDuration: doc.actualDuration || undefined,
    pickupsScheduled: doc.pickupsScheduled || 0,
    pickupsCompleted: doc.pickupsCompleted || 0,
    efficiency: doc.efficiency || 0,
    deviations: parseJSON(doc.deviations, []),
  };
}

// Bounds type bounds mapping helper
function mapWard(doc: any): Ward {
  return {
    id: doc.$id,
    code: doc.code,
    name: doc.name,
    zone: doc.zone,
    population: doc.population || 0,
    area: doc.area || 0,
    complaintCount: doc.complaintCount || 0,
    averageResponseTime: doc.averageResponseTime || 0,
    cleanlinessScore: doc.cleanlinessScore || 0,
    pickupsScheduledToday: doc.pickupsScheduledToday || 0,
    pickupsCompletedToday: doc.pickupsCompletedToday || 0,
    citizens: doc.citizens || 0,
    bounds: parseJSON(doc.bounds, { north: 0, south: 0, east: 0, west: 0 }),
  };
}

function mapViolation(doc: any): Violation {
  return {
    id: doc.$id,
    citizenId: doc.citizenId || undefined,
    citizenName: doc.citizenName || undefined,
    workerId: doc.workerId || undefined,
    workerName: doc.workerName || undefined,
    type: doc.type,
    severity: doc.severity,
    description: doc.description,
    location: parseJSON(doc.location, { lat: 0, lng: 0 }),
    ward: doc.ward,
    wardCode: doc.wardCode,
    fineAmount: doc.fineAmount || 0,
    status: doc.status,
    createdAt: doc.$createdAt || doc.createdAt,
    resolvedAt: doc.resolvedAt || undefined,
    evidence: parseJSON(doc.evidence, []),
  };
}

function mapNotification(doc: any): Notification {
  return {
    id: doc.$id,
    citizenId: doc.citizenId,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    read: doc.read || false,
    actionUrl: doc.actionUrl || undefined,
    createdAt: doc.$createdAt || doc.createdAt,
    relatedComplaintId: doc.relatedComplaintId || undefined,
  };
}

function mapReward(doc: any): Reward {
  return {
    id: doc.$id,
    citizenId: doc.citizenId,
    pointsAwarded: doc.pointsAwarded || 0,
    reason: doc.reason,
    createdAt: doc.$createdAt || doc.createdAt,
  };
}

// ============================================================================
// COMPLAINT OPERATIONS
// ============================================================================

export const complaintService = {
  async list(filters?: FilterState & { citizenId?: string }, page: number = 1, limit: number = 25): Promise<PaginatedResponse<Complaint>> {
    const q: string[] = [];

    if (filters) {
      if (filters.status && (filters.status as string) !== 'ALL') q.push(Query.equal('status', filters.status));
      if (filters.priority && (filters.priority as string) !== 'ALL') q.push(Query.equal('priority', filters.priority));
      if (filters.category && (filters.category as string) !== 'ALL') q.push(Query.equal('category', filters.category));
      if (filters.ward && (filters.ward as string) !== 'ALL') q.push(Query.equal('wardCode', filters.ward));
      if (filters.citizenId) q.push(Query.equal('citizenId', filters.citizenId));
      if (filters.searchQuery) {
        q.push(Query.or([
          Query.contains('title', filters.searchQuery),
          Query.contains('description', filters.searchQuery)
        ]));
      }
    }

    q.push(Query.orderDesc('createdAt'));
    q.push(Query.limit(limit));
    q.push(Query.offset((page - 1) * limit));

    const response = await databases.listDocuments(DATABASE_ID, 'complaints', q);

    return {
      success: true,
      data: response.documents.map(mapComplaint),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async getById(id: string): Promise<Complaint | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'complaints', id);
      return mapComplaint(doc);
    } catch (e) {
      return null;
    }
  },

  async create(complaint: Partial<Complaint>): Promise<Complaint> {
    const docId = complaint.id || ID.unique();
    const now = new Date().toISOString();
    const data: any = {
      createdAt: now,
      updatedAt: now,
      ...complaint,
      location: stringifyJSON(complaint.location),
      timeline: stringifyJSON((complaint as any).timeline || []),
    };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'complaints', docId, data);
    return mapComplaint(response);
  },

  async update(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
    const data: any = { ...updates };
    if (updates.location) data.location = stringifyJSON(updates.location);
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'complaints', id, data);
    return mapComplaint(response);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(DATABASE_ID, 'complaints', id);
      return true;
    } catch (e) {
      return false;
    }
  },

  async getByWard(wardCode: string): Promise<Complaint[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'complaints', [
      Query.equal('wardCode', wardCode),
      Query.limit(100)
    ]);
    return response.documents.map(mapComplaint);
  },

  async countByStatus(status: ComplaintStatus): Promise<number> {
    const response = await databases.listDocuments(DATABASE_ID, 'complaints', [
      Query.equal('status', status),
      Query.limit(1)
    ]);
    return response.total;
  },
};

// ============================================================================
// CITIZEN OPERATIONS
// ============================================================================

export const citizenService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Citizen>> {
    const response = await databases.listDocuments(DATABASE_ID, 'citizens', [
      Query.orderDesc('createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]);

    return {
      success: true,
      data: response.documents.map(mapCitizen),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async getById(id: string): Promise<Citizen | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'citizens', id);
      return mapCitizen(doc);
    } catch (e) {
      return null;
    }
  },

  async create(citizen: Citizen): Promise<Citizen> {
    const docId = citizen.id || ID.unique();
    const data: any = { ...citizen };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'citizens', docId, data);
    return mapCitizen(response);
  },

  async update(id: string, updates: Partial<Citizen>): Promise<Citizen | null> {
    const data: any = { ...updates };
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'citizens', id, data);
    return mapCitizen(response);
  },

  async getByWard(wardCode: string): Promise<Citizen[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'citizens', [
      Query.equal('wardCode', wardCode),
      Query.limit(100)
    ]);
    return response.documents.map(mapCitizen);
  },
};

// ============================================================================
// WORKER OPERATIONS
// ============================================================================

export const workerService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Worker>> {
    const response = await databases.listDocuments(DATABASE_ID, 'workers', [
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]);

    return {
      success: true,
      data: response.documents.map(mapWorker),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async getById(id: string): Promise<Worker | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'workers', id);
      return mapWorker(doc);
    } catch (e) {
      return null;
    }
  },

  async create(worker: Worker): Promise<Worker> {
    const docId = worker.id || ID.unique();
    const data: any = { ...worker };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'workers', docId, data);
    return mapWorker(response);
  },

  async update(id: string, updates: Partial<Worker>): Promise<Worker | null> {
    const data: any = { ...updates };
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'workers', id, data);
    return mapWorker(response);
  },

  async getByWard(wardCode: string): Promise<Worker[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'workers', [
      Query.equal('wardCode', wardCode),
      Query.limit(100)
    ]);
    return response.documents.map(mapWorker);
  },

  async getActiveWorkers(): Promise<Worker[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'workers', [
      Query.equal('status', 'ACTIVE'),
      Query.limit(100)
    ]);
    return response.documents.map(mapWorker);
  },
};

// ============================================================================
// VEHICLE OPERATIONS
// ============================================================================

export const vehicleService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Vehicle>> {
    const response = await databases.listDocuments(DATABASE_ID, 'vehicles', [
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]);

    return {
      success: true,
      data: response.documents.map(mapVehicle),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async getById(id: string): Promise<Vehicle | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'vehicles', id);
      return mapVehicle(doc);
    } catch (e) {
      return null;
    }
  },

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const docId = vehicle.id || ID.unique();
    const data: any = {
      ...vehicle,
      currentLocation: stringifyJSON(vehicle.currentLocation),
    };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'vehicles', docId, data);
    return mapVehicle(response);
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const data: any = { ...updates };
    if (updates.currentLocation) data.currentLocation = stringifyJSON(updates.currentLocation);
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'vehicles', id, data);
    return mapVehicle(response);
  },

  async getActiveVehicles(): Promise<Vehicle[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'vehicles', [
      Query.equal('status', 'IN_USE'),
      Query.limit(100)
    ]);
    return response.documents.map(mapVehicle);
  },

  async getIdleVehicles(): Promise<Vehicle[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'vehicles', [
      Query.equal('status', 'IDLE'),
      Query.limit(100)
    ]);
    return response.documents.map(mapVehicle);
  },
};

// ============================================================================
// ROUTE OPERATIONS
// ============================================================================

export const routeService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Route>> {
    const response = await databases.listDocuments(DATABASE_ID, 'routes', [
      Query.orderDesc('scheduledFor'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]);

    return {
      success: true,
      data: response.documents.map(mapRoute),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async getById(id: string): Promise<Route | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'routes', id);
      return mapRoute(doc);
    } catch (e) {
      return null;
    }
  },

  async create(route: Route): Promise<Route> {
    const docId = route.id || ID.unique();
    const data: any = {
      ...route,
      checkpoints: stringifyJSON(route.checkpoints),
      deviations: stringifyJSON(route.deviations),
    };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'routes', docId, data);
    return mapRoute(response);
  },

  async update(id: string, updates: Partial<Route>): Promise<Route | null> {
    const data: any = { ...updates };
    if (updates.checkpoints) data.checkpoints = stringifyJSON(updates.checkpoints);
    if (updates.deviations) data.deviations = stringifyJSON(updates.deviations);
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'routes', id, data);
    return mapRoute(response);
  },

  async getByWard(wardCode: string): Promise<Route[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'routes', [
      Query.equal('wardCode', wardCode),
      Query.limit(100)
    ]);
    return response.documents.map(mapRoute);
  },

  async getActiveRoutes(): Promise<Route[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'routes', [
      Query.equal('status', 'IN_PROGRESS'),
      Query.limit(100)
    ]);
    return response.documents.map(mapRoute);
  },

  async getTodayRoutes(): Promise<Route[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await databases.listDocuments(DATABASE_ID, 'routes', [
      Query.startsWith('scheduledFor', today),
      Query.limit(100)
    ]);
    return response.documents.map(mapRoute);
  },
};

// ============================================================================
// WARD OPERATIONS
// ============================================================================

export const wardService = {
  async list(): Promise<Ward[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'wards', [
      Query.limit(100)
    ]);
    return response.documents.map(mapWard);
  },

  async getByCode(code: string): Promise<Ward | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'wards', code);
      return mapWard(doc);
    } catch (e) {
      return null;
    }
  },

  async update(code: string, updates: Partial<Ward>): Promise<Ward | null> {
    const data: any = { ...updates };
    if (updates.bounds) data.bounds = stringifyJSON(updates.bounds);
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'wards', code, data);
    return mapWard(response);
  },
};

// ============================================================================
// VIOLATION OPERATIONS
// ============================================================================

export const violationService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Violation>> {
    const response = await databases.listDocuments(DATABASE_ID, 'violations', [
      Query.orderDesc('createdAt'),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ]);

    return {
      success: true,
      data: response.documents.map(mapViolation),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async getById(id: string): Promise<Violation | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'violations', id);
      return mapViolation(doc);
    } catch (e) {
      return null;
    }
  },

  async create(violation: Violation): Promise<Violation> {
    const docId = violation.id || ID.unique();
    const data: any = {
      ...violation,
      location: stringifyJSON(violation.location),
      evidence: stringifyJSON(violation.evidence),
    };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'violations', docId, data);
    return mapViolation(response);
  },

  async update(id: string, updates: Partial<Violation>): Promise<Violation | null> {
    const data: any = { ...updates };
    if (updates.location) data.location = stringifyJSON(updates.location);
    if (updates.evidence) data.evidence = stringifyJSON(updates.evidence);
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'violations', id, data);
    return mapViolation(response);
  },

  async getByWard(wardCode: string): Promise<Violation[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'violations', [
      Query.equal('wardCode', wardCode),
      Query.limit(100)
    ]);
    return response.documents.map(mapViolation);
  },

  async getOpenViolations(): Promise<Violation[]> {
    const response = await databases.listDocuments(DATABASE_ID, 'violations', [
      Query.equal('status', 'OPEN'),
      Query.limit(100)
    ]);
    return response.documents.map(mapViolation);
  },
};

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const notificationService = {
  async list(citizenId?: string, page: number = 1, limit: number = 25): Promise<PaginatedResponse<Notification>> {
    const q: string[] = [];
    if (citizenId) {
      q.push(Query.equal('citizenId', citizenId));
    }
    q.push(Query.orderDesc('createdAt'));
    q.push(Query.limit(limit));
    q.push(Query.offset((page - 1) * limit));

    const response = await databases.listDocuments(DATABASE_ID, 'notifications', q);

    return {
      success: true,
      data: response.documents.map(mapNotification),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async getById(id: string): Promise<Notification | null> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, 'notifications', id);
      return mapNotification(doc);
    } catch (e) {
      return null;
    }
  },

  async create(notification: Notification): Promise<Notification> {
    const docId = notification.id || ID.unique();
    const data: any = { ...notification };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'notifications', docId, data);
    return mapNotification(response);
  },

  async update(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    const data: any = { ...updates };
    delete data.id;

    const response = await databases.updateDocument(DATABASE_ID, 'notifications', id, data);
    return mapNotification(response);
  },

  async getUnreadCount(citizenId: string): Promise<number> {
    const response = await databases.listDocuments(DATABASE_ID, 'notifications', [
      Query.equal('citizenId', citizenId),
      Query.equal('read', false),
      Query.limit(1)
    ]);
    return response.total;
  },
};

// ============================================================================
// REWARD OPERATIONS
// ============================================================================

export const rewardService = {
  async list(citizenId?: string, page: number = 1, limit: number = 25): Promise<PaginatedResponse<Reward>> {
    const q: string[] = [];
    if (citizenId) {
      q.push(Query.equal('citizenId', citizenId));
    }
    q.push(Query.orderDesc('createdAt'));
    q.push(Query.limit(limit));
    q.push(Query.offset((page - 1) * limit));

    const response = await databases.listDocuments(DATABASE_ID, 'rewards', q);

    return {
      success: true,
      data: response.documents.map(mapReward),
      total: response.total,
      page,
      limit,
      hasMore: (page * limit) < response.total,
    };
  },

  async create(reward: Reward): Promise<Reward> {
    const docId = reward.id || ID.unique();
    const data: any = { ...reward };
    delete data.id;

    const response = await databases.createDocument(DATABASE_ID, 'rewards', docId, data);
    return mapReward(response);
  },

  async getTotalPointsByCitizen(citizenId: string): Promise<number> {
    const response = await databases.listDocuments(DATABASE_ID, 'rewards', [
      Query.equal('citizenId', citizenId),
      Query.limit(100)
    ]);
    return response.documents.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
  },
};
