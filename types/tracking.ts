// Vehicle tracking types and interfaces

export type VehicleStatus = 'collecting' | 'idle' | 'delayed' | 'maintenance' | 'completed';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AnomalyType = 'deviation' | 'delay' | 'maintenance_alert' | 'efficiency_drop';

export interface Coordinates {
  latitude: number;
  longitude: number;
}


export interface Route {
  id: string;
  wardCode: string;
  wardName: string;
  startPoint: Coordinates;
  endPoint: Coordinates;
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  coordinates: Coordinates[]; // planned route polyline
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  driverName: string;
  driverPhone: string;
  status: VehicleStatus;
  currentPosition: Coordinates;
  currentRoute: Route;
  speed: number; // km/h
  bearing: number; // degrees 0-360
  capacity: number; // liters
  capacityUsed: number; // liters
  efficiency: number; // percentage
  lastUpdate: number; // timestamp
  estimatedCompletionTime?: number; // timestamp
  distanceCovered: number; // km
  isDeviated: boolean; // whether vehicle is currently off its route
  deviationPath: Coordinates[]; // breadcrumb trail when deviated
}

export interface Alert {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  type: AnomalyType;
  severity: AlertSeverity;
  message: string;
  details: Record<string, any>;
  timestamp: number;
  resolved: boolean;
}

export interface MetricSnapshot {
  activeVehicles: number;
  routesInProgress: number;
  routesCompleted: number;
  delayedPickups: number;
  averageEfficiency: number;
  totalDistanceCovered: number;
  timestamp: number;
}

export interface TrackingState {
  vehicles: Vehicle[];
  routes: Route[];
  alerts: Alert[];
  metrics: MetricSnapshot;
  isSimulating: boolean;
  simulationSpeed: number; // 1x, 2x, 5x multiplier
}

export interface TrackingContextType {
  state: TrackingState;
  updateVehiclePosition: (vehicleId: string, position: Coordinates) => void;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (alertId: string) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
}
