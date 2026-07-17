// Mock Indore routes — no checkpoints; garbage trucks collect street-by-street

import { Route, Coordinates } from '@/types/tracking';

// Indore city center
const INDORE_CENTER: Coordinates = {
  latitude: 22.7196,
  longitude: 75.8577,
};

// Generate a winding polyline that looks like a street route
const generatePolyline = (start: Coordinates, end: Coordinates, points: number = 20): Coordinates[] => {
  const line: Coordinates[] = [start];

  for (let i = 1; i < points - 1; i++) {
    const t = i / (points - 1);
    // Add realistic winding variation (simulating actual streets)
    const latVariance = Math.sin(i * 1.2) * 0.0008;
    const lngVariance = Math.cos(i * 0.9) * 0.0006;

    line.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t + latVariance,
      longitude: start.longitude + (end.longitude - start.longitude) * t + lngVariance,
    });
  }

  line.push(end);
  return line;
};

// Haversine distance in km
const calculateDistance = (start: Coordinates, end: Coordinates): number => {
  const R = 6371;
  const dLat = ((end.latitude - start.latitude) * Math.PI) / 180;
  const dLon = ((end.longitude - start.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start.latitude * Math.PI) / 180) *
      Math.cos((end.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const mockRoutes: Omit<Route, 'totalDistance' | 'coordinates'>[] = [
  {
    id: 'route-ward-1',
    wardCode: 'W01',
    wardName: 'Ward 01 - Sirpur',
    startPoint: { latitude: 22.7050, longitude: 75.8200 },
    endPoint:   { latitude: 22.7150, longitude: 75.8300 },
    estimatedDuration: 90,
  },
  {
    id: 'route-ward-2',
    wardCode: 'W02',
    wardName: 'Ward 02 - Chandan Nagar',
    startPoint: { latitude: 22.6950, longitude: 75.8250 },
    endPoint:   { latitude: 22.7050, longitude: 75.8350 },
    estimatedDuration: 75,
  },
  {
    id: 'route-ward-3',
    wardCode: 'W03',
    wardName: 'Ward 03 - Kalani Nagar',
    startPoint: { latitude: 22.7300, longitude: 75.8300 },
    endPoint:   { latitude: 22.7400, longitude: 75.8400 },
    estimatedDuration: 105,
  },
  {
    id: 'route-ward-4',
    wardCode: 'W04',
    wardName: 'Ward 04 - Sukhdev Nagar',
    startPoint: { latitude: 22.7350, longitude: 75.8350 },
    endPoint:   { latitude: 22.7450, longitude: 75.8450 },
    estimatedDuration: 80,
  },
  {
    id: 'route-ward-5',
    wardCode: 'W05',
    wardName: 'Ward 05 - Raj Nagar',
    startPoint: { latitude: 22.7400, longitude: 75.8450 },
    endPoint:   { latitude: 22.7500, longitude: 75.8550 },
    estimatedDuration: 90,
  },
  {
    id: 'route-ward-6',
    wardCode: 'W06',
    wardName: 'Ward 06 - Malharganj',
    startPoint: { latitude: 22.7250, longitude: 75.8500 },
    endPoint:   { latitude: 22.7350, longitude: 75.8600 },
    estimatedDuration: 85,
  }
];

// Initialize routes with calculated distances and winding polylines
export const initializeRoutes = (): Route[] => {
  return mockRoutes.map(route => {
    const distance = calculateDistance(route.startPoint, route.endPoint);
    const coordinates = generatePolyline(route.startPoint, route.endPoint, 20);

    return {
      ...route,
      totalDistance: parseFloat(distance.toFixed(2)),
      coordinates,
    };
  });
};

export const getRouteById = (routeId: string): Route | undefined => {
  return initializeRoutes().find(r => r.id === routeId);
};

export const getRandomRoute = (): Route => {
  const routes = initializeRoutes();
  return routes[Math.floor(Math.random() * routes.length)];
};

export const calculatePointBetween = (start: Coordinates, end: Coordinates, progress: number): Coordinates => ({
  latitude: start.latitude + (end.latitude - start.latitude) * progress,
  longitude: start.longitude + (end.longitude - start.longitude) * progress,
});

export const calculateBearing = (from: Coordinates, to: Coordinates): number => {
  const dLon = to.longitude - from.longitude;
  const dLat = to.latitude - from.latitude;
  return (Math.atan2(dLon, dLat) * 180) / Math.PI;
};

export const INDORE_BOUNDS = {
  north: 22.76,
  south: 22.68,
  east: 75.90,
  west: 75.80,
};
