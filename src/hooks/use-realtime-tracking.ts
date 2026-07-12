'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Vehicle, Route, Alert, MetricSnapshot } from '@/types/tracking';
import { TrackingEngine } from '@/services/tracking/tracking-engine';
import { AlertEngine } from '@/services/tracking/alert-engine';
import { generateVehiclePool } from '@/services/tracking/vehicle-generator';
import { initializeRoutes } from '@/services/tracking/mock-routes';

export interface UseRealtimeTrackingReturn {
  vehicles: Vehicle[];
  alerts: Alert[];
  metrics: MetricSnapshot;
  isSimulating: boolean;
  simulationSpeed: number;
  startSimulation: () => void;
  stopSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  resetSimulation: () => void;
  completeCheckpoint: (vehicleId: string, checkpointId: string) => void;
  skipCheckpoint: (vehicleId: string, checkpointId: string) => void;
  resolveAlert: (alertId: string) => void;
}

const DEFAULT_SIMULATION_INTERVAL = 1000; // 1 second per tick
const UI_UPDATE_THROTTLE = 500; // Throttle UI updates to every 500ms for smooth rendering
const ENGINE_TICK_INTERVAL = 100; // Run engine more frequently for accuracy

export const useRealtimeTracking = (): UseRealtimeTrackingReturn => {
  const engineRef = useRef<TrackingEngine | null>(null);
  const alertEngineRef = useRef<AlertEngine | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUIUpdateRef = useRef<number>(0);
  const tickCountRef = useRef<number>(0);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<MetricSnapshot>({
    activeVehicles: 0,
    routesInProgress: 0,
    routesCompleted: 0,
    checkpointsCompleted: 0,
    totalCheckpoints: 0,
    delayedPickups: 0,
    averageEfficiency: 0,
    totalDistanceCovered: 0,
    timestamp: Date.now(),
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  /**
   * Initialize tracking engine and vehicles
   */
  useEffect(() => {
    const initialVehicles = generateVehiclePool(15);
    const routes = initializeRoutes();

    engineRef.current = new TrackingEngine(initialVehicles, routes);
    alertEngineRef.current = new AlertEngine();

    setVehicles(initialVehicles);
    setMetrics(engineRef.current.getMetrics());
  }, []);

  /**
   * Simulation update loop with buffering
   */
  const updateSimulation = useCallback(() => {
    if (!engineRef.current || !alertEngineRef.current) return;

    // Always update the engine
    engineRef.current.updateSimulation();
    tickCountRef.current++;

    // Only update UI every UI_UPDATE_THROTTLE ms to prevent lag
    const now = Date.now();
    if (now - lastUIUpdateRef.current < UI_UPDATE_THROTTLE) {
      return; // Skip UI update, continue engine updates in background
    }

    lastUIUpdateRef.current = now;

    // Get updated state
    const updatedVehicles = engineRef.current.getVehicles();
    const engineAlerts = engineRef.current.getAlerts(true);

    // Process new alerts through alert engine
    for (const alert of engineAlerts) {
      if (!alertEngineRef.current.getActiveAlerts().find(a => a.id === alert.id)) {
        alertEngineRef.current.addAlert(alert);
      }
    }

    // Update UI state (batched)
    setVehicles([...updatedVehicles]);
    setAlerts(alertEngineRef.current.getActiveAlerts());
    setMetrics(engineRef.current.getMetrics());
  }, []);

  /**
   * Start simulation
   */
  const startSimulation = useCallback(() => {
    if (isSimulating || intervalRef.current) return;

    setIsSimulating(true);
    lastUIUpdateRef.current = Date.now();
    tickCountRef.current = 0;

    // Run engine at fixed interval, UI updates are throttled separately
    intervalRef.current = setInterval(() => {
      updateSimulation();
    }, ENGINE_TICK_INTERVAL / simulationSpeed);
  }, [isSimulating, simulationSpeed, updateSimulation]);

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  /**
   * Update simulation speed
   */
  const handleSetSimulationSpeed = useCallback(
    (speed: number) => {
      setSimulationSpeed(speed);

      if (engineRef.current) {
        engineRef.current.setSimulationSpeed(speed);
      }

      // Restart interval with new speed
      if (isSimulating) {
        stopSimulation();
        setIsSimulating(true);
      }
    },
    [isSimulating, stopSimulation]
  );

  /**
   * Reset simulation
   */
  const resetSimulation = useCallback(() => {
    stopSimulation();
    lastUIUpdateRef.current = 0;
    tickCountRef.current = 0;

    if (engineRef.current) {
      engineRef.current.resetSimulation();
    }
    if (alertEngineRef.current) {
      alertEngineRef.current.clearAlerts();
    }

    setVehicles(engineRef.current?.getVehicles() || []);
    setAlerts([]);
    setMetrics(engineRef.current?.getMetrics() || {
      activeVehicles: 0,
      routesInProgress: 0,
      routesCompleted: 0,
      checkpointsCompleted: 0,
      totalCheckpoints: 0,
      delayedPickups: 0,
      averageEfficiency: 0,
      totalDistanceCovered: 0,
      timestamp: Date.now(),
    });
  }, [stopSimulation]);

  /**
   * Complete checkpoint manually
   */
  const completeCheckpoint = useCallback((vehicleId: string, checkpointId: string) => {
    if (!engineRef.current) return;

    const vehicle = engineRef.current.getVehicles().find(v => v.id === vehicleId);
    if (!vehicle) return;

    const checkpoint = vehicle.currentRoute.checkpoints.find(cp => cp.id === checkpointId);
    if (checkpoint) {
      checkpoint.status = 'completed';
      checkpoint.completedAt = Date.now();
      vehicle.checkpointsCompleted++;

      setVehicles([...engineRef.current.getVehicles()]);
    }
  }, []);

  /**
   * Skip checkpoint manually
   */
  const skipCheckpoint = useCallback((vehicleId: string, checkpointId: string) => {
    if (!engineRef.current) return;

    const vehicle = engineRef.current.getVehicles().find(v => v.id === vehicleId);
    if (!vehicle) return;

    const checkpoint = vehicle.currentRoute.checkpoints.find(cp => cp.id === checkpointId);
    if (checkpoint) {
      checkpoint.status = 'skipped';

      setVehicles([...engineRef.current.getVehicles()]);
    }
  }, []);

  /**
   * Resolve alert
   */
  const resolveAlert = useCallback((alertId: string) => {
    if (alertEngineRef.current) {
      alertEngineRef.current.resolveAlert(alertId);
      setAlerts(alertEngineRef.current.getActiveAlerts());
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    vehicles,
    alerts,
    metrics,
    isSimulating,
    simulationSpeed,
    startSimulation,
    stopSimulation,
    setSimulationSpeed: handleSetSimulationSpeed,
    resetSimulation,
    completeCheckpoint,
    skipCheckpoint,
    resolveAlert,
  };
};
