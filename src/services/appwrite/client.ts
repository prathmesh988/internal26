/**
 * Mock Appwrite Service Layer
 * Simulates Appwrite database operations with in-memory storage
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
  ComplaintStatus,
  FilterState,
  PaginatedResponse,
} from '@/types';
import {
  generateComplaints,
  generateCitizens,
  generateWorkers,
  generateVehicles,
  generateRoutes,
  generateWards,
  generateViolations,
  generateNotifications,
  generateRewards,
} from '../mock/generators';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

interface MockStore {
  complaints: Map<string, Complaint>;
  citizens: Map<string, Citizen>;
  workers: Map<string, Worker>;
  vehicles: Map<string, Vehicle>;
  routes: Map<string, Route>;
  wards: Map<string, Ward>;
  violations: Map<string, Violation>;
  notifications: Map<string, Notification>;
  rewards: Map<string, Reward>;
}

const store: MockStore = {
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

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeMockStore() {
  // Populate initial data
  generateComplaints(150).forEach((c) => store.complaints.set(c.id, c));
  generateCitizens(100).forEach((c) => store.citizens.set(c.id, c));
  generateWorkers(50).forEach((w) => store.workers.set(w.id, w));
  generateVehicles(25).forEach((v) => store.vehicles.set(v.id, v));
  generateRoutes(40).forEach((r) => store.routes.set(r.id, r));
  generateWards().forEach((w) => store.wards.set(w.code, w));
  generateViolations(75).forEach((v) => store.violations.set(v.id, v));
  generateNotifications(100).forEach((n) => store.notifications.set(n.id, n));
  generateRewards(200).forEach((r) => store.rewards.set(r.id, r));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function applyFilters<T>(items: T[], filters: FilterState, filterFn: (item: T, filters: FilterState) => boolean): T[] {
  return items.filter((item) => filterFn(item, filters));
}

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = items.slice(start, end);

  return {
    success: true,
    data,
    total,
    page,
    limit,
    hasMore: end < total,
  };
}

// ============================================================================
// COMPLAINT OPERATIONS
// ============================================================================

export const complaintService = {
  async list(filters?: FilterState, page: number = 1, limit: number = 25): Promise<PaginatedResponse<Complaint>> {
    let complaints = Array.from(store.complaints.values());

    if (filters) {
      complaints = applyFilters(complaints, filters, (complaint, f) => {
        if (f.status && complaint.status !== f.status) return false;
        if (f.priority && complaint.priority !== f.priority) return false;
        if (f.category && complaint.category !== f.category) return false;
        if (f.ward && complaint.ward !== f.ward) return false;
        if (f.searchQuery) {
          const query = f.searchQuery.toLowerCase();
          if (!complaint.title.toLowerCase().includes(query) && !complaint.description.toLowerCase().includes(query)) {
            return false;
          }
        }
        return true;
      });
    }

    // Sort by creation date
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return paginate(complaints, page, limit);
  },

  async getById(id: string): Promise<Complaint | null> {
    return store.complaints.get(id) || null;
  },

  async create(complaint: Complaint): Promise<Complaint> {
    store.complaints.set(complaint.id, complaint);
    return complaint;
  },

  async update(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
    const complaint = store.complaints.get(id);
    if (!complaint) return null;

    const updated = { ...complaint, ...updates, updatedAt: new Date().toISOString() };
    store.complaints.set(id, updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    return store.complaints.delete(id);
  },

  async getByWard(wardCode: string): Promise<Complaint[]> {
    return Array.from(store.complaints.values()).filter((c) => c.wardCode === wardCode);
  },

  async countByStatus(status: ComplaintStatus): Promise<number> {
    return Array.from(store.complaints.values()).filter((c) => c.status === status).length;
  },
};

// ============================================================================
// CITIZEN OPERATIONS
// ============================================================================

export const citizenService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Citizen>> {
    const citizens = Array.from(store.citizens.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return paginate(citizens, page, limit);
  },

  async getById(id: string): Promise<Citizen | null> {
    return store.citizens.get(id) || null;
  },

  async create(citizen: Citizen): Promise<Citizen> {
    store.citizens.set(citizen.id, citizen);
    return citizen;
  },

  async update(id: string, updates: Partial<Citizen>): Promise<Citizen | null> {
    const citizen = store.citizens.get(id);
    if (!citizen) return null;

    const updated = { ...citizen, ...updates };
    store.citizens.set(id, updated);
    return updated;
  },

  async getByWard(wardCode: string): Promise<Citizen[]> {
    return Array.from(store.citizens.values()).filter((c) => c.wardCode === wardCode);
  },
};

// ============================================================================
// WORKER OPERATIONS
// ============================================================================

export const workerService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Worker>> {
    const workers = Array.from(store.workers.values());
    return paginate(workers, page, limit);
  },

  async getById(id: string): Promise<Worker | null> {
    return store.workers.get(id) || null;
  },

  async create(worker: Worker): Promise<Worker> {
    store.workers.set(worker.id, worker);
    return worker;
  },

  async update(id: string, updates: Partial<Worker>): Promise<Worker | null> {
    const worker = store.workers.get(id);
    if (!worker) return null;

    const updated = { ...worker, ...updates, lastActiveAt: new Date().toISOString() };
    store.workers.set(id, updated);
    return updated;
  },

  async getByWard(wardCode: string): Promise<Worker[]> {
    return Array.from(store.workers.values()).filter((w) => w.wardCode === wardCode);
  },

  async getActiveWorkers(): Promise<Worker[]> {
    return Array.from(store.workers.values()).filter((w) => w.status === 'ACTIVE');
  },
};

// ============================================================================
// VEHICLE OPERATIONS
// ============================================================================

export const vehicleService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Vehicle>> {
    const vehicles = Array.from(store.vehicles.values());
    return paginate(vehicles, page, limit);
  },

  async getById(id: string): Promise<Vehicle | null> {
    return store.vehicles.get(id) || null;
  },

  async create(vehicle: Vehicle): Promise<Vehicle> {
    store.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const vehicle = store.vehicles.get(id);
    if (!vehicle) return null;

    const updated = { ...vehicle, ...updates };
    store.vehicles.set(id, updated);
    return updated;
  },

  async getActiveVehicles(): Promise<Vehicle[]> {
    return Array.from(store.vehicles.values()).filter((v) => v.status === 'IN_USE');
  },

  async getIdleVehicles(): Promise<Vehicle[]> {
    return Array.from(store.vehicles.values()).filter((v) => v.status === 'IDLE');
  },
};

// ============================================================================
// ROUTE OPERATIONS
// ============================================================================

export const routeService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Route>> {
    const routes = Array.from(store.routes.values()).sort((a, b) =>
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    );
    return paginate(routes, page, limit);
  },

  async getById(id: string): Promise<Route | null> {
    return store.routes.get(id) || null;
  },

  async create(route: Route): Promise<Route> {
    store.routes.set(route.id, route);
    return route;
  },

  async update(id: string, updates: Partial<Route>): Promise<Route | null> {
    const route = store.routes.get(id);
    if (!route) return null;

    const updated = { ...route, ...updates };
    store.routes.set(id, updated);
    return updated;
  },

  async getByWard(wardCode: string): Promise<Route[]> {
    return Array.from(store.routes.values()).filter((r) => r.wardCode === wardCode);
  },

  async getActiveRoutes(): Promise<Route[]> {
    return Array.from(store.routes.values()).filter((r) => r.status === 'IN_PROGRESS');
  },

  async getTodayRoutes(): Promise<Route[]> {
    const today = new Date().toDateString();
    return Array.from(store.routes.values()).filter((r) => new Date(r.scheduledFor).toDateString() === today);
  },
};

// ============================================================================
// WARD OPERATIONS
// ============================================================================

export const wardService = {
  async list(): Promise<Ward[]> {
    return Array.from(store.wards.values());
  },

  async getByCode(code: string): Promise<Ward | null> {
    return store.wards.get(code) || null;
  },

  async update(code: string, updates: Partial<Ward>): Promise<Ward | null> {
    const ward = store.wards.get(code);
    if (!ward) return null;

    const updated = { ...ward, ...updates };
    store.wards.set(code, updated);
    return updated;
  },
};

// ============================================================================
// VIOLATION OPERATIONS
// ============================================================================

export const violationService = {
  async list(page: number = 1, limit: number = 25): Promise<PaginatedResponse<Violation>> {
    const violations = Array.from(store.violations.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return paginate(violations, page, limit);
  },

  async getById(id: string): Promise<Violation | null> {
    return store.violations.get(id) || null;
  },

  async create(violation: Violation): Promise<Violation> {
    store.violations.set(violation.id, violation);
    return violation;
  },

  async update(id: string, updates: Partial<Violation>): Promise<Violation | null> {
    const violation = store.violations.get(id);
    if (!violation) return null;

    const updated = { ...violation, ...updates };
    store.violations.set(id, updated);
    return updated;
  },

  async getByWard(wardCode: string): Promise<Violation[]> {
    return Array.from(store.violations.values()).filter((v) => v.wardCode === wardCode);
  },

  async getOpenViolations(): Promise<Violation[]> {
    return Array.from(store.violations.values()).filter((v) => v.status === 'OPEN');
  },
};

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const notificationService = {
  async list(citizenId?: string, page: number = 1, limit: number = 25): Promise<PaginatedResponse<Notification>> {
    let notifications = Array.from(store.notifications.values());

    if (citizenId) {
      notifications = notifications.filter((n) => n.citizenId === citizenId);
    }

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return paginate(notifications, page, limit);
  },

  async getById(id: string): Promise<Notification | null> {
    return store.notifications.get(id) || null;
  },

  async create(notification: Notification): Promise<Notification> {
    store.notifications.set(notification.id, notification);
    return notification;
  },

  async update(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    const notification = store.notifications.get(id);
    if (!notification) return null;

    const updated = { ...notification, ...updates };
    store.notifications.set(id, updated);
    return updated;
  },

  async getUnreadCount(citizenId: string): Promise<number> {
    return Array.from(store.notifications.values()).filter((n) => n.citizenId === citizenId && !n.read).length;
  },
};

// ============================================================================
// REWARD OPERATIONS
// ============================================================================

export const rewardService = {
  async list(citizenId?: string, page: number = 1, limit: number = 25): Promise<PaginatedResponse<Reward>> {
    let rewards = Array.from(store.rewards.values());

    if (citizenId) {
      rewards = rewards.filter((r) => r.citizenId === citizenId);
    }

    rewards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return paginate(rewards, page, limit);
  },

  async create(reward: Reward): Promise<Reward> {
    store.rewards.set(reward.id, reward);
    return reward;
  },

  async getTotalPointsByCitizen(citizenId: string): Promise<number> {
    return Array.from(store.rewards.values())
      .filter((r) => r.citizenId === citizenId)
      .reduce((sum, r) => sum + r.pointsAwarded, 0);
  },
};

// ============================================================================
// EXPORT STORE REFERENCE (for realtime updates)
// ============================================================================

export function getMockStore(): MockStore {
  return store;
}
