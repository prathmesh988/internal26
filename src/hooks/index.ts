/**
 * Custom Hooks for Data Fetching & State Management
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDashboardStore } from '@/store';
import {
  complaintService,
  citizenService,
  workerService,
  vehicleService,
  routeService,
  wardService,
  violationService,
  notificationService,
  initializeMockStore,
} from '@/services/appwrite/client';
import { startRealtimeSimulation, stopRealtimeSimulation } from '@/services/workflows/engine';
import type { Complaint, Citizen, Worker, Vehicle, Route, Ward, Violation, Notification, FilterState, PaginatedResponse } from '@/types';

// ============================================================================
// INITIALIZATION HOOK
// ============================================================================

export function useInitialize() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeMockStore();
      startRealtimeSimulation(5000); // Update every 5 seconds
      setInitialized(true);
    }

    return () => {
      stopRealtimeSimulation();
    };
  }, [initialized]);

  return initialized;
}

// ============================================================================
// COMPLAINTS HOOK
// ============================================================================

export function useComplaints(filters?: FilterState, page: number = 1, limit: number = 25) {
  const [data, setData] = useState<PaginatedResponse<Complaint> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await complaintService.list(filters, page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchComplaints();
  }, [page, limit, JSON.stringify(filters)]);

  return { data, loading, error, refetch: fetchComplaints };
}

export function useComplaint(id: string) {
  const [data, setData] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await complaintService.getById(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch complaint');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { data, loading, error };
}

// ============================================================================
// CITIZENS HOOK
// ============================================================================

export function useCitizens(page: number = 1, limit: number = 25) {
  const [data, setData] = useState<PaginatedResponse<Citizen> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitizens = useCallback(async () => {
    try {
      setLoading(true);
      const result = await citizenService.list(page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch citizens');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchCitizens();
  }, [page, limit]);

  return { data, loading, error, refetch: fetchCitizens };
}

export function useCitizen(id: string) {
  const [data, setData] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await citizenService.getById(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch citizen');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { data, loading, error };
}

// ============================================================================
// WORKERS HOOK
// ============================================================================

export function useWorkers(page: number = 1, limit: number = 25) {
  const [data, setData] = useState<PaginatedResponse<Worker> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await workerService.list(page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchWorkers();
  }, [page, limit]);

  return { data, loading, error, refetch: fetchWorkers };
}

// ============================================================================
// VEHICLES HOOK
// ============================================================================

export function useVehicles(page: number = 1, limit: number = 25) {
  const [data, setData] = useState<PaginatedResponse<Vehicle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const result = await vehicleService.list(page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchVehicles();
  }, [page, limit]);

  return { data, loading, error, refetch: fetchVehicles };
}

export function useActiveVehicles() {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await vehicleService.getActiveVehicles();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch active vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { data, loading, error };
}

// ============================================================================
// ROUTES HOOK
// ============================================================================

export function useRoutes(page: number = 1, limit: number = 25) {
  const [data, setData] = useState<PaginatedResponse<Route> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const result = await routeService.list(page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRoutes();
  }, [page, limit]);

  return { data, loading, error, refetch: fetchRoutes };
}

export function useActiveRoutes() {
  const [data, setData] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await routeService.getActiveRoutes();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch active routes');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { data, loading, error };
}

// ============================================================================
// WARDS HOOK
// ============================================================================

export function useWards() {
  const [data, setData] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await wardService.list();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wards');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { data, loading, error };
}

// ============================================================================
// VIOLATIONS HOOK
// ============================================================================

export function useViolations(page: number = 1, limit: number = 25) {
  const [data, setData] = useState<PaginatedResponse<Violation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await violationService.list(page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch violations');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchViolations();
  }, [page, limit]);

  return { data, loading, error, refetch: fetchViolations };
}

// ============================================================================
// NOTIFICATIONS HOOK
// ============================================================================

export function useNotifications(citizenId?: string, page: number = 1, limit: number = 25) {
  const [data, setData] = useState<PaginatedResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await notificationService.list(citizenId, page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [citizenId, page, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [citizenId, page, limit]);

  return { data, loading, error, refetch: fetchNotifications };
}

// ============================================================================
// ASYNC ACTION HOOK (for mutations)
// ============================================================================

interface UseAsyncActionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsyncAction<T, P extends any[]>(
  action: (...args: P) => Promise<T>,
  options?: UseAsyncActionOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await action(...args);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [action, options]
  );

  return { execute, loading, error, data };
}

// ============================================================================
// POLLING HOOK
// ============================================================================

export function usePolling<T>(
  fetcher: () => Promise<T>,
  interval: number = 5000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        const result = await fetcher();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Polling error');
      } finally {
        setLoading(false);
      }
    };

    poll();
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  }, [fetcher, interval, enabled]);

  return { data, loading, error };
}
