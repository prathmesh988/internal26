// Vehicle data generator for realistic garbage truck simulation
// No checkpoints — Indian garbage trucks collect door-to-door along a street route

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
  const lastName  = DRIVER_LAST_NAMES[Math.floor(Math.random() * DRIVER_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

export const generateVehiclePool = (count: number = 18): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const routes = initializeRoutes();

  for (let i = 0; i < count; i++) {
    const route = routes[i % routes.length];
    const routeProgress = Math.random();

    let currentPos = {
      latitude: route.startPoint.latitude +
        (route.endPoint.latitude - route.startPoint.latitude) * routeProgress +
        (Math.random() - 0.5) * 0.002,
      longitude: route.startPoint.longitude +
        (route.endPoint.longitude - route.startPoint.longitude) * routeProgress +
        (Math.random() - 0.5) * 0.002,
    };

    // 95% collecting, a small % delayed or idle
    const statuses: VehicleStatus[] = ['collecting', 'idle', 'delayed', 'completed'];
    const statusWeights = [0.93, 0.03, 0.03, 0.01];
    let selectedStatus: VehicleStatus = 'collecting';
    let cumulative = 0;
    const rand = Math.random();
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (rand <= cumulative) {
        selectedStatus = statuses[j];
        break;
      }
    }

    let isDeviated = selectedStatus === 'delayed';
    let deviationPath: Coordinates[] = [];

    // Force vehicle-3 and vehicle-7 to be deviated with a pre-populated divergent path
    if (i === 2 || i === 6) {
      isDeviated = true;
      selectedStatus = 'delayed';
      const progressIndex = Math.floor(routeProgress * (route.coordinates.length - 1));
      const startIdx = Math.max(0, progressIndex - 12);
      
      for (let k = startIdx; k <= progressIndex; k++) {
        const baseCoord = route.coordinates[k];
        const offsetMultiplier = k - startIdx;
        deviationPath.push({
          latitude: baseCoord.latitude + 0.0003 * offsetMultiplier,
          longitude: baseCoord.longitude - 0.0002 * offsetMultiplier,
        });
      }
      if (deviationPath.length > 0) {
        currentPos = deviationPath[deviationPath.length - 1];
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
      speed: selectedStatus === 'idle' ? 0 : Math.floor(Math.random() * 35) + 15,
      bearing: Math.floor(Math.random() * 360),
      capacity: 15000,
      capacityUsed: Math.floor(Math.random() * 15000),
      efficiency: Math.floor(Math.random() * 35) + 65,
      lastUpdate: Date.now(),
      distanceCovered: route.totalDistance * routeProgress,
      estimatedCompletionTime: selectedStatus === 'completed'
        ? Date.now()
        : Date.now() + ((1 - routeProgress) * route.estimatedDuration * 60 * 1000),
      isDeviated,
      deviationPath,
    });
  }

  return vehicles;
};

export const getDriverDetails = (driverName: string): { name: string; badge: string } => {
  const initials = driverName.split(' ').map(n => n[0]).join('').toUpperCase();
  return { name: driverName, badge: initials };
};

export const GARBAGE_TRUCK_COLORS: Record<string, string> = {
  collecting:  '#10b981', // green
  idle:        '#6b7280', // gray
  delayed:     '#f97316', // orange
  maintenance: '#ef4444', // red
  completed:   '#3b82f6', // blue
};
