// Main tracking engine — door-to-door collection model (no checkpoints)
// Vehicles follow a route polyline; deviation is detected and shown as orange path

import {
  Vehicle,
  Route,
  VehicleStatus,
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
  private lastAnomalies: Map<string, number> = new Map();

  constructor(vehicles: Vehicle[], routes: Route[]) {
    this.vehicles = vehicles;
    this.routes = routes;
    this.alerts = [];
  }

  /**
   * Main simulation tick — updates all vehicle positions and states
   */
  public updateSimulation(): void {
    this.simulationTick++;

    for (const vehicle of this.vehicles) {
      this.updateVehicleMovement(vehicle);
      this.detectAnomalies(vehicle);
      this.updateVehicleEfficiency(vehicle);
    }
  }

  /**
   * Move the vehicle along its planned route polyline.
   * If deviated, add the current position to the deviationPath breadcrumb.
   */
  private updateVehicleMovement(vehicle: Vehicle): void {
    const route = vehicle.currentRoute;
    if (!route || route.coordinates.length < 2) return;

    const baseSpeed = vehicle.status === 'collecting'
      ? 15
      : vehicle.status === 'idle'
      ? 5
      : vehicle.status === 'delayed'
      ? 10
      : 20;

    const speedVariation = Math.sin(this.simulationTick * 0.1) * 0.2 + 0.8;
    const currentSpeed = baseSpeed * speedVariation * this.simulationSpeed;

    const distanceThisTick = (currentSpeed / 3600) * this.simulationSpeed;
    vehicle.distanceCovered += distanceThisTick;

    const maxDistance = route.totalDistance;
    let routeProgress = vehicle.distanceCovered / maxDistance;

    if (routeProgress > 1) {
      routeProgress = 1;
      vehicle.status = 'completed';
      vehicle.speed = 0;
      vehicle.isDeviated = false;
      vehicle.deviationPath = [];
    }

    if (route.coordinates.length > 0) {
      const routeIndex = Math.floor(routeProgress * (route.coordinates.length - 1));
      const nextIndex = Math.min(routeIndex + 1, route.coordinates.length - 1);

      const currentWaypoint = route.coordinates[routeIndex];
      const nextWaypoint = route.coordinates[nextIndex];

      const waypointProgress =
        (routeProgress * (route.coordinates.length - 1) - routeIndex) || 0;

      // When deviated, add lateral offset to simulate going off-route
      const basePos = calculatePointBetween(currentWaypoint, nextWaypoint, waypointProgress);
      if (vehicle.isDeviated) {
        const pathLen = vehicle.deviationPath ? vehicle.deviationPath.length : 0;
        const latOffset = 0.0003 * Math.min(18, pathLen + 1);
        const lngOffset = -0.0002 * Math.min(18, pathLen + 1);
        vehicle.currentPosition = {
          latitude: basePos.latitude + latOffset,
          longitude: basePos.longitude + lngOffset,
        };
        // Record breadcrumb for orange deviation path
        vehicle.deviationPath = [...(vehicle.deviationPath || []), vehicle.currentPosition];
        // Cap breadcrumb length to avoid memory growth
        if (vehicle.deviationPath.length > 50) {
          vehicle.deviationPath = vehicle.deviationPath.slice(-50);
        }
      } else {
        vehicle.currentPosition = basePos;
        // Clear deviation path when back on route
        if (vehicle.deviationPath.length > 0) {
          vehicle.deviationPath = [];
        }
      }

      vehicle.bearing = calculateBearing(currentWaypoint, nextWaypoint);
    }

    vehicle.speed = Math.floor(currentSpeed);
    vehicle.lastUpdate = Date.now();
  }

  /**
   * Detect anomalies and generate alerts
   */
  private detectAnomalies(vehicle: Vehicle): void {
    const vehicleLastAnomaly = this.lastAnomalies.get(vehicle.id) || 0;
    const timeSinceLastAnomaly = this.simulationTick - vehicleLastAnomaly;

    if (timeSinceLastAnomaly < 100) return;

    if (Math.random() > (1 - this.anomalyProbability * this.simulationSpeed)) {
      const anomalies: AnomalyType[] = ['deviation', 'delay'];
      const selectedAnomaly = anomalies[Math.floor(Math.random() * anomalies.length)];

      this.lastAnomalies.set(vehicle.id, this.simulationTick);

      switch (selectedAnomaly) {
        case 'deviation':
          this.generateDeviation(vehicle);
          break;
        case 'delay':
          this.generateDelay(vehicle);
          break;
      }
    }

    this.autoResolveAlerts();
  }

  private generateDeviation(vehicle: Vehicle): void {
    vehicle.isDeviated = true;
    vehicle.status = 'delayed';

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
  }

  private generateDelay(vehicle: Vehicle): void {
    const delayMinutes = Math.floor(Math.random() * 25) + 5;

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registrationNumber,
      type: 'delay',
      severity: 'warning',
      message: `${vehicle.registrationNumber} delayed by ${delayMinutes} min in ${vehicle.currentRoute.wardName}`,
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

  private updateVehicleEfficiency(vehicle: Vehicle): void {
    const baseEfficiency = 85;
    const routeProgress = vehicle.distanceCovered / vehicle.currentRoute.totalDistance;
    const randomVariation = Math.sin(this.simulationTick * 0.05) * 10;
    const deviationPenalty = vehicle.isDeviated ? -10 : 0;

    vehicle.efficiency = Math.max(
      30,
      Math.min(100, baseEfficiency - routeProgress * 30 + randomVariation + deviationPenalty)
    );
  }

  private autoResolveAlerts(): void {
    const alertTimeout = 300;

    for (const alert of this.alerts) {
      if (!alert.resolved && this.simulationTick - Math.floor(alert.timestamp / 1000) > alertTimeout) {
        alert.resolved = true;
        // Also clear deviation flag when alert auto-resolves
        const vehicle = this.vehicles.find(v => v.id === alert.vehicleId);
        if (vehicle && alert.type === 'deviation') {
          vehicle.isDeviated = false;
          vehicle.status = 'collecting';
        }
      }
    }
  }

  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public getAlerts(unresolved: boolean = false): Alert[] {
    if (unresolved) return this.alerts.filter(a => !a.resolved);
    return this.alerts;
  }

  public getMetrics() {
    const activeVehicles  = this.vehicles.filter(v => v.status !== 'completed').length;
    const completedRoutes = this.vehicles.filter(v => v.status === 'completed').length;
    const delayedVehicles = this.vehicles.filter(v => v.status === 'delayed').length;

    const avgEfficiency = this.vehicles.length > 0
      ? Math.round(this.vehicles.reduce((sum, v) => sum + v.efficiency, 0) / this.vehicles.length)
      : 0;

    const totalDistance = this.vehicles.reduce((sum, v) => sum + v.distanceCovered, 0);

    return {
      activeVehicles,
      routesInProgress: activeVehicles,
      routesCompleted: completedRoutes,
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
    for (const v of this.vehicles) {
      v.isDeviated = false;
      v.deviationPath = [];
    }
  }
}
