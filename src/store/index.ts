/**
 * Global State Management with Zustand
 * Manages UI state, filters, and real-time updates
 */

import { create } from 'zustand';
import { Complaint, Citizen, Worker, Vehicle, Route, Notification, FilterState } from '@/types';

// ============================================================================
// DASHBOARD STATE
// ============================================================================

interface DashboardState {
  complaints: Complaint[];
  citizens: Citizen[];
  workers: Worker[];
  vehicles: Vehicle[];
  routes: Route[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setComplaints: (complaints: Complaint[]) => void;
  setCitizens: (citizens: Citizen[]) => void;
  setWorkers: (workers: Worker[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setRoutes: (routes: Route[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Updates
  updateComplaint: (complaint: Complaint) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  updateRoute: (route: Route) => void;
  addNotification: (notification: Notification) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  complaints: [],
  citizens: [],
  workers: [],
  vehicles: [],
  routes: [],
  notifications: [],
  isLoading: false,
  error: null,

  setComplaints: (complaints) => set({ complaints }),
  setCitizens: (citizens) => set({ citizens }),
  setWorkers: (workers) => set({ workers }),
  setVehicles: (vehicles) => set({ vehicles }),
  setRoutes: (routes) => set({ routes }),
  setNotifications: (notifications) => set({ notifications }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  updateComplaint: (complaint) =>
    set((state) => ({
      complaints: state.complaints.map((c) => (c.id === complaint.id ? complaint : c)),
    })),

  updateVehicle: (vehicle) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v)),
    })),

  updateRoute: (route) =>
    set((state) => ({
      routes: state.routes.map((r) => (r.id === route.id ? route : r)),
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
}));

// ============================================================================
// FILTER STATE
// ============================================================================

interface FilterStoreState {
  complaintFilters: FilterState;
  setComplaintFilters: (filters: FilterState) => void;
  resetComplaintFilters: () => void;

  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

const defaultFilters: FilterState = {
  status: undefined,
  priority: undefined,
  category: undefined,
  ward: undefined,
  searchQuery: '',
};

export const useFilterStore = create<FilterStoreState>((set) => ({
  complaintFilters: defaultFilters,
  currentPage: 1,
  pageSize: 25,

  setComplaintFilters: (filters) => set({ complaintFilters: filters, currentPage: 1 }),
  resetComplaintFilters: () => set({ complaintFilters: defaultFilters, currentPage: 1 }),

  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
}));

// ============================================================================
// USER STATE
// ============================================================================

interface UserState {
  userType: 'CITIZEN' | 'ADMIN' | 'WORKER' | null;
  userId: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;

  login: (userType: 'CITIZEN' | 'ADMIN' | 'WORKER', userId: string, email: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userType: null,
  userId: null,
  userEmail: null,
  isAuthenticated: false,

  login: (userType, userId, email) =>
    set({
      userType,
      userId,
      userEmail: email,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      userType: null,
      userId: null,
      userEmail: null,
      isAuthenticated: false,
    }),
}));

// ============================================================================
// UI STATE
// ============================================================================

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  selectedWard: string | null;
  selectedComplaintId: string | null;
  dialogOpen: boolean;
  dialogType: 'NEW_COMPLAINT' | 'EDIT_COMPLAINT' | 'VIEW_DETAILS' | null;

  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSelectedWard: (ward: string | null) => void;
  setSelectedComplaintId: (id: string | null) => void;
  openDialog: (type: UIState['dialogType']) => void;
  closeDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  selectedWard: null,
  selectedComplaintId: null,
  dialogOpen: false,
  dialogType: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setSelectedWard: (ward) => set({ selectedWard: ward }),
  setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),
  openDialog: (type) => set({ dialogOpen: true, dialogType: type }),
  closeDialog: () => set({ dialogOpen: false, dialogType: null }),
}));

// ============================================================================
// REALTIME STATE
// ============================================================================

interface RealtimeState {
  isConnected: boolean;
  lastUpdate: string | null;
  updateCount: number;

  setConnected: (connected: boolean) => void;
  recordUpdate: () => void;
  reset: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  lastUpdate: null,
  updateCount: 0,

  setConnected: (connected) => set({ isConnected: connected }),
  recordUpdate: () =>
    set((state) => ({
      lastUpdate: new Date().toISOString(),
      updateCount: state.updateCount + 1,
    })),
  reset: () => set({ isConnected: false, lastUpdate: null, updateCount: 0 }),
}));
