// Mock Indore routes with realistic coordinates and checkpoints

import { Route, Checkpoint, Coordinates } from '@/types/tracking';

// Indore city center approximately
const INDORE_CENTER: Coordinates = {
  latitude: 22.7196,
  longitude: 75.8577,
};

// Generate mock checkpoints for a route
const generateCheckpoints = (wardName: string, startCoord: Coordinates, endCoord: Coordinates, count: number = 5): Checkpoint[] => {
  const checkpoints: Checkpoint[] = [];
  
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    checkpoints.push({
      id: `checkpoint-${wardName}-${i}`,
      name: `Collection Point ${i + 1}`,
      coordinates: {
        latitude: startCoord.latitude + (endCoord.latitude - startCoord.latitude) * progress,
        longitude: startCoord.longitude + (endCoord.longitude - startCoord.longitude) * progress,
      },
      status: 'pending',
      expectedTime: (i + 1) * 12, // 12 minutes between checkpoints
    });
  }
  
  return checkpoints;
};

// Generate route polyline between two points
const generatePolyline = (start: Coordinates, end: Coordinates, points: number = 10): Coordinates[] => {
  const line: Coordinates[] = [start];
  
  for (let i = 1; i < points - 1; i++) {
    const t = i / (points - 1);
    // Add slight variation to make it realistic
    const variance = Math.sin(i) * 0.001;
    
    line.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t + variance,
      longitude: start.longitude + (end.longitude - start.longitude) * t + variance,
    });
  }
  
  line.push(end);
  return line;
};

// Calculate distance in km using Haversine formula
const calculateDistance = (start: Coordinates, end: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((end.latitude - start.latitude) * Math.PI) / 180;
  const dLon = ((end.longitude - start.longitude) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start.latitude * Math.PI) / 180) * Math.cos((end.latitude * Math.PI) / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const mockRoutes: Route[] = [
  {
    id: 'route-ward-1',
    wardCode: 'W-001',
    wardName: 'Rajendra Nagar',
    startPoint: { latitude: 22.7196, longitude: 75.8577 },
    endPoint: { latitude: 22.7250, longitude: 75.8650 },
    checkpoints: generateCheckpoints('W-001', 
      { latitude: 22.7196, longitude: 75.8577 },
      { latitude: 22.7250, longitude: 75.8650 }, 6),
    totalDistance: 0,
    estimatedDuration: 90,
    coordinates: [],
  },
  {
    id: 'route-ward-2',
    wardCode: 'W-002',
    wardName: 'Banganga',
    startPoint: { latitude: 22.7100, longitude: 75.8500 },
    endPoint: { latitude: 22.7150, longitude: 75.8600 },
    checkpoints: generateCheckpoints('W-002',
      { latitude: 22.7100, longitude: 75.8500 },
      { latitude: 22.7150, longitude: 75.8600 }, 5),
    totalDistance: 0,
    estimatedDuration: 75,
    coordinates: [],
  },
  {
    id: 'route-ward-3',
    wardCode: 'W-003',
    wardName: 'Khajrana',
    startPoint: { latitude: 22.7300, longitude: 75.8400 },
    endPoint: { latitude: 22.7350, longitude: 75.8500 },
    checkpoints: generateCheckpoints('W-003',
      { latitude: 22.7300, longitude: 75.8400 },
      { latitude: 22.7350, longitude: 75.8500 }, 7),
    totalDistance: 0,
    estimatedDuration: 105,
    coordinates: [],
  },
  {
    id: 'route-ward-4',
    wardCode: 'W-004',
    wardName: 'Malharganj',
    startPoint: { latitude: 22.7050, longitude: 75.8700 },
    endPoint: { latitude: 22.7100, longitude: 75.8800 },
    checkpoints: generateCheckpoints('W-004',
      { latitude: 22.7050, longitude: 75.8700 },
      { latitude: 22.7100, longitude: 75.8800 }, 5),
    totalDistance: 0,
    estimatedDuration: 80,
    coordinates: [],
  },
  {
    id: 'route-ward-5',
    wardCode: 'W-005',
    wardName: 'Choti Gwaltoli',
    startPoint: { latitude: 22.7400, longitude: 75.8300 },
    endPoint: { latitude: 22.7450, longitude: 75.8400 },
    checkpoints: generateCheckpoints('W-005',
      { latitude: 22.7400, longitude: 75.8300 },
      { latitude: 22.7450, longitude: 75.8400 }, 6),
    totalDistance: 0,
    estimatedDuration: 90,
    coordinates: [],
  },
  {
    id: 'route-ward-6',
    wardCode: 'W-006',
    wardName: 'New Palasia',
    startPoint: { latitude: 22.7250, longitude: 75.8450 },
    endPoint: { latitude: 22.7300, longitude: 75.8550 },
    checkpoints: generateCheckpoints('W-006',
      { latitude: 22.7250, longitude: 75.8450 },
      { latitude: 22.7300, longitude: 75.8550 }, 5),
    totalDistance: 0,
    estimatedDuration: 85,
    coordinates: [],
  },
  {
    id: 'route-ward-7',
    wardCode: 'W-007',
    wardName: 'South Indore',
    startPoint: { latitude: 22.7000, longitude: 75.8350 },
    endPoint: { latitude: 22.7050, longitude: 75.8450 },
    checkpoints: generateCheckpoints('W-007',
      { latitude: 22.7000, longitude: 75.8350 },
      { latitude: 22.7050, longitude: 75.8450 }, 6),
    totalDistance: 0,
    estimatedDuration: 95,
    coordinates: [],
  },
  {
    id: 'route-ward-8',
    wardCode: 'W-008',
    wardName: 'Pardesipura',
    startPoint: { latitude: 22.7350, longitude: 75.8650 },
    endPoint: { latitude: 22.7400, longitude: 75.8750 },
    checkpoints: generateCheckpoints('W-008',
      { latitude: 22.7350, longitude: 75.8650 },
      { latitude: 22.7400, longitude: 75.8750 }, 5),
    totalDistance: 0,
    estimatedDuration: 80,
    coordinates: [],
  },
];

// Initialize routes with calculated distances and polylines
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
  const routes = initializeRoutes();
  return routes.find(r => r.id === routeId);
};

export const getRandomRoute = (): Route => {
  const routes = initializeRoutes();
  return routes[Math.floor(Math.random() * routes.length)];
};

export const calculatePointBetween = (start: Coordinates, end: Coordinates, progress: number): Coordinates => {
  return {
    latitude: start.latitude + (end.latitude - start.latitude) * progress,
    longitude: start.longitude + (end.longitude - start.longitude) * progress,
  };
};

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
