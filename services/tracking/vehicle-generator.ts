// Vehicle data generator for realistic garbage truck simulation

import { Vehicle, VehicleStatus, Coordinates } from '@/types/tracking';
import { initializeRoutes } from './mock-routes';

const DRIVER_FIRST_NAMES = [
  'Rajesh', 'Suresh', 'Viresh', 'Anil', 'Manoj',
  'Ramesh', 'Dinesh', 'Rohit', 'Sandeep', 'Pradeep',
  'Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta',
  'Verma', 'Yadav', 'Rao', 'Joshi', 'Kapoor',
];

const DRIVER_LAST_NAMES = [
  'Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta',
  'Verma', 'Yadav', 'Rao', 'Joshi', 'Kapoor',
  'Nair', 'Reddy', 'Bhat', 'Iyer', 'Menon',
];

const VEHICLE_PREFIXES = ['WM', 'SWM', 'WS', 'CR', 'GC'];

const generatePhoneNumber = (): string => {
  return `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`.slice(0, 13);
};

const generateVehicleId = (): string => {
  const prefix = VEHICLE_PREFIXES[Math.floor(Math.random() * VEHICLE_PREFIXES.length)];
  const number = String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}-${number}`;
};

const generateDriverName = (): string => {
  const firstName = DRIVER_FIRST_NAMES[Math.floor(Math.random() * DRIVER_FIRST_NAMES.length)];
  const lastName = DRIVER_LAST_NAMES[Math.floor(Math.random() * DRIVER_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

const getRandomStatus = (): VehicleStatus => {
  const statuses: VehicleStatus[] = ['collecting', 'idle', 'delayed', 'maintenance', 'completed'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

export const generateVehicles = (count: number = 15): Vehicle[] => {
  const routes = initializeRoutes();
  const vehicles: Vehicle[] = [];
  
  for (let i = 0; i < count; i++) {
    const route = routes[i % routes.length];
    const checkpointsCompleted = Math.floor(Math.random() * (route.checkpoints.length + 1));
    
    vehicles.push({
      id: `vehicle-${i + 1}`,
      registrationNumber: generateVehicleId(),
      driverName: generateDriverName(),
      driverPhone: generatePhoneNumber(),
      status: getRandomStatus(),
      currentPosition: {
        latitude: route.startPoint.latitude + (Math.random() - 0.5) * 0.01,
        longitude: route.startPoint.longitude + (Math.random() - 0.5) * 0.01,
      },
      currentRoute: route,
      checkpointsCompleted,
      totalCheckpoints: route.checkpoints.length,
      speed: Math.floor(Math.random() * 40) + 10, // 10-50 km/h
      bearing: Math.floor(Math.random() * 360),
      capacity: 15000, // liters (15 cubic meters typical for garbage truck)
      capacityUsed: Math.floor(Math.random() * 15000),
      efficiency: Math.floor(Math.random() * 40) + 60, // 60-100%
      lastUpdate: Date.now(),
      distanceCovered: Math.floor(Math.random() * (route.totalDistance * 100)) / 100,
    });
  }
  
  return vehicles;
};

export const generateVehiclePool = (count: number = 18): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const routes = initializeRoutes();
  
  for (let i = 0; i < count; i++) {
    const route = routes[i % routes.length];
    const routeProgress = Math.random();
    const checkpointsCompleted = Math.floor(route.checkpoints.length * routeProgress);
    
    const currentPos = {
      latitude: route.startPoint.latitude + 
        (route.endPoint.latitude - route.startPoint.latitude) * routeProgress +
        (Math.random() - 0.5) * 0.002,
      longitude: route.startPoint.longitude + 
        (route.endPoint.longitude - route.startPoint.longitude) * routeProgress +
        (Math.random() - 0.5) * 0.002,
    };
    
    const statuses: VehicleStatus[] = ['collecting', 'idle', 'delayed', 'completed'];
    const statusWeights = [0.95, 0.02, 0.02, 0.01]; // 95% collecting for demo
    let selectedStatus: VehicleStatus = 'collecting';
    const rand = Math.random();
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (rand <= cumulative) {
        selectedStatus = statuses[j];
        break;
      }
    }
    
    vehicles.push({
      id: `vehicle-${i + 1}`,
      registrationNumber: generateVehicleId(),
      driverName: generateDriverName(),
      driverPhone: generatePhoneNumber(),
      status: selectedStatus,
      currentPosition: currentPos,
      currentRoute: route,
      checkpointsCompleted,
      totalCheckpoints: route.checkpoints.length,
      speed: selectedStatus === 'idle' ? 0 : Math.floor(Math.random() * 35) + 15,
      bearing: Math.floor(Math.random() * 360),
      capacity: 15000,
      capacityUsed: Math.floor(Math.random() * 15000),
      efficiency: Math.floor(Math.random() * 35) + 65,
      lastUpdate: Date.now(),
      distanceCovered: route.totalDistance * routeProgress,
      estimatedCompletionTime: selectedStatus === 'completed' ? Date.now() : Date.now() + ((1 - routeProgress) * route.estimatedDuration * 60 * 1000),
    });
  }
  
  return vehicles;
};

export const getDriverDetails = (driverName: string): { name: string; badge: string } => {
  const initials = driverName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  return {
    name: driverName,
    badge: initials,
  };
};

export const GARBAGE_TRUCK_COLORS = {
  collecting: '#10b981', // green
  idle: '#6b7280', // gray
  delayed: '#f59e0b', // amber
  maintenance: '#ef4444', // red
  completed: '#3b82f6', // blue
};
