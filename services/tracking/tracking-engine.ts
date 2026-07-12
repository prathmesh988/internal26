// Main tracking engine for vehicle movement simulation and state management

import { 
  Vehicle, 
  Route, 
  Checkpoint, 
  VehicleStatus, 
  CheckpointStatus,
  Coordinates,
  Alert,
  AnomalyType,
  AlertSeverity,
} from '@/types/tracking';
import { calculatePointBetween, calculateBearing } from './mock-routes';

export class TrackingEngine {
  private vehicles: Vehicle[];
  private routes: Route[];
  private alerts: Alert[];
  private simulationTick: number = 0;
  private simulationSpeed: number = 1;
  private isRunning: boolean = false;
  private anomalyProbability: number = 0.02; // 2% chance per tick
  private lastAnomalies: Map<string, number> = new Map(); // Track last anomaly time per vehicle

  constructor(vehicles: Vehicle[], routes: Route[]) {
    this.vehicles = vehicles;
    this.routes = routes;
    this.alerts = [];
  }

  /**
   * Main simulation tick - updates all vehicle positions and states
   */
  public updateSimulation(): void {
    this.simulationTick++;

    // Update each vehicle's position and state
    for (const vehicle of this.vehicles) {
      this.updateVehicleMovement(vehicle);
      this.updateVehicleRoute(vehicle);
      this.detectAnomalies(vehicle);
      this.updateVehicleEfficiency(vehicle);
    }
  }

  /**
   * Update vehicle position along current route
   */
  private updateVehicleMovement(vehicle: Vehicle): void {
    const route = vehicle.currentRoute;
    if (!route || route.coordinates.length < 2) return;

    // Calculate speed variation (realistic movement)
    // For demo: all vehicles move, even idle ones (at reduced speed)
    const baseSpeed = vehicle.status === 'collecting' ? 15 : vehicle.status === 'idle' ? 5 : vehicle.status === 'delayed' ? 10 : 20;
    const speedVariation = (Math.sin(this.simulationTick * 0.1) * 0.2 + 0.8); // 0.8-1.2 multiplier
    const currentSpeed = baseSpeed * speedVariation * this.simulationSpeed;

    // Distance moved in this tick (in km)
    // Assuming 1 tick = 1 second at real-time
    const distanceThisTick = (currentSpeed / 3600) * this.simulationSpeed; // Convert km/h to km/s and apply speed multiplier

    // Update total distance covered
    vehicle.distanceCovered += distanceThisTick;

    // Calculate progress along route (0 to 1)
    const maxDistance = route.totalDistance;
    let routeProgress = vehicle.distanceCovered / maxDistance;

    if (routeProgress > 1) {
      routeProgress = 1;
      vehicle.status = 'completed';
      vehicle.speed = 0;
    }

    // Get new position along route
    if (route.coordinates.length > 0) {
      const routeIndex = Math.floor(routeProgress * (route.coordinates.length - 1));
      const nextIndex = Math.min(routeIndex + 1, route.coordinates.length - 1);

      const currentWaypoint = route.coordinates[routeIndex];
      const nextWaypoint = route.coordinates[nextIndex];

      // Interpolate between waypoints
      const waypointProgress = 
        (routeProgress * (route.coordinates.length - 1) - routeIndex) || 0;

      vehicle.currentPosition = calculatePointBetween(
        currentWaypoint,
        nextWaypoint,
        waypointProgress
      );

      // Calculate bearing
      vehicle.bearing = calculateBearing(currentWaypoint, nextWaypoint);
    }

    vehicle.speed = Math.floor(currentSpeed);
    vehicle.lastUpdate = Date.now();
  }

  /**
   * Update checkpoint completion based on vehicle progress
   */
  private updateVehicleRoute(vehicle: Vehicle): void {
    const route = vehicle.currentRoute;
    if (!route) return;

    const routeProgress = vehicle.distanceCovered / route.totalDistance;

    // Auto-complete checkpoints as vehicle progresses
    for (let i = 0; i < route.checkpoints.length; i++) {
      const checkpoint = route.checkpoints[i];
      const expectedProgress = (i + 1) / route.checkpoints.length;

      if (routeProgress >= expectedProgress && checkpoint.status === 'pending') {
        // Mark checkpoint as completed
        checkpoint.status = 'completed';
        checkpoint.completedAt = Date.now();
        checkpoint.actualTime = (expectedProgress * route.estimatedDuration * 60);
        
        vehicle.checkpointsCompleted = i + 1;
      }
    }
  }

  /**
   * Detect anomalies and generate alerts
   */
  private detectAnomalies(vehicle: Vehicle): void {
    const vehicleLastAnomaly = this.lastAnomalies.get(vehicle.id) || 0;
    const timeSinceLastAnomaly = this.simulationTick - vehicleLastAnomaly;

    // Only generate new anomalies if enough time has passed (avoid spam)
    if (timeSinceLastAnomaly < 100) return;

    if (Math.random() > (1 - this.anomalyProbability * this.simulationSpeed)) {
      const anomalies: AnomalyType[] = ['deviation', 'delay', 'missed_checkpoint'];
      const selectedAnomaly = anomalies[Math.floor(Math.random() * anomalies.length)];

      this.lastAnomalies.set(vehicle.id, this.simulationTick);

      switch (selectedAnomaly) {
        case 'deviation':
          this.generateDeviation(vehicle);
          break;
        case 'delay':
          this.generateDelay(vehicle);
          break;
        case 'missed_checkpoint':
          this.generateMissedCheckpoint(vehicle);
          break;
      }
    }

    // Auto-resolve alerts after some time
    this.autoResolveAlerts();
  }

  private generateDeviation(vehicle: Vehicle): void {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registrationNumber,
      type: 'deviation',
      severity: 'warning',
      message: `${vehicle.registrationNumber} deviated from ${vehicle.currentRoute.wardName} route`,
      details: {
        ward: vehicle.currentRoute.wardName,
        deviation: `${(Math.random() * 500 + 50).toFixed(0)}m off-route`,
      },
      timestamp: Date.now(),
      resolved: false,
    };

    this.alerts.push(alert);
    vehicle.status = 'delayed';
  }

  private generateDelay(vehicle: Vehicle): void {
    const delayMinutes = Math.floor(Math.random() * 25) + 5; // 5-30 minutes

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registrationNumber,
      type: 'delay',
      severity: 'warning',
      message: `${vehicle.registrationNumber} delayed by ${delayMinutes} minutes in ${vehicle.currentRoute.wardName}`,
      details: {
        ward: vehicle.currentRoute.wardName,
        delayMinutes,
      },
      timestamp: Date.now(),
      resolved: false,
    };

    this.alerts.push(alert);
    vehicle.status = 'delayed';
  }

  private generateMissedCheckpoint(vehicle: Vehicle): void {
    const route = vehicle.currentRoute;
    const pendingCheckpoints = route.checkpoints.filter(cp => cp.status === 'pending');

    if (pendingCheckpoints.length > 0) {
      const checkpoint = pendingCheckpoints[0];
      checkpoint.status = 'skipped';

      const alert: Alert = {
        id: `alert-${Date.now()}-${Math.random()}`,
        vehicleId: vehicle.id,
        vehicleRegistration: vehicle.registrationNumber,
        type: 'missed_checkpoint',
        severity: 'critical',
        message: `Checkpoint skipped: "${checkpoint.name}" near ${route.wardName}`,
        details: {
          checkpoint: checkpoint.name,
          ward: route.wardName,
          coordinates: checkpoint.coordinates,
        },
        timestamp: Date.now(),
        resolved: false,
      };

      this.alerts.push(alert);
    }
  }

  private updateVehicleEfficiency(vehicle: Vehicle): void {
    // Efficiency decreases slightly over time, represents wear and delays
    const baseEfficiency = 85;
    const routeProgress = vehicle.distanceCovered / vehicle.currentRoute.totalDistance;
    const randomVariation = Math.sin(this.simulationTick * 0.05) * 10;

    vehicle.efficiency = Math.max(30, Math.min(100, baseEfficiency - routeProgress * 30 + randomVariation));
  }

  private autoResolveAlerts(): void {
    const alertTimeout = 300; // ticks (roughly 5 minutes at 1 tick per second)

    for (const alert of this.alerts) {
      if (!alert.resolved && this.simulationTick - Math.floor(alert.timestamp / 1000) > alertTimeout) {
        alert.resolved = true;
      }
    }
  }

  /**
   * Public getter methods
   */
  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public getAlerts(unresolved: boolean = false): Alert[] {
    if (unresolved) {
      return this.alerts.filter(a => !a.resolved);
    }
    return this.alerts;
  }

  public getMetrics() {
    const activeVehicles = this.vehicles.filter(v => v.status !== 'completed').length;
    const completedRoutes = this.vehicles.filter(v => v.status === 'completed').length;
    const delayedVehicles = this.vehicles.filter(v => v.status === 'delayed').length;

    const totalCheckpoints = this.vehicles.reduce((sum, v) => sum + v.totalCheckpoints, 0);
    const completedCheckpoints = this.vehicles.reduce((sum, v) => sum + v.checkpointsCompleted, 0);

    const avgEfficiency =
      this.vehicles.length > 0
        ? Math.round(this.vehicles.reduce((sum, v) => sum + v.efficiency, 0) / this.vehicles.length)
        : 0;

    const totalDistance = this.vehicles.reduce((sum, v) => sum + v.distanceCovered, 0);

    return {
      activeVehicles,
      routesInProgress: activeVehicles,
      routesCompleted: completedRoutes,
      checkpointsCompleted: completedCheckpoints,
      totalCheckpoints,
      delayedPickups: delayedVehicles,
      averageEfficiency: avgEfficiency,
      totalDistanceCovered: Math.round(totalDistance * 100) / 100,
      timestamp: Date.now(),
    };
  }

  public setSimulationSpeed(speed: number): void {
    this.simulationSpeed = speed;
  }

  public setRunning(running: boolean): void {
    this.isRunning = running;
  }

  public isSimulating(): boolean {
    return this.isRunning;
  }

  public getSimulationTick(): number {
    return this.simulationTick;
  }

  public resetSimulation(): void {
    this.simulationTick = 0;
    this.alerts = [];
    this.lastAnomalies.clear();
  }
}
