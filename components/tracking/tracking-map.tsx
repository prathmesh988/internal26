'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker, Tooltip } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { Vehicle, Checkpoint } from '@/types/tracking';
import { INDORE_BOUNDS } from '@/services/tracking/mock-routes';
import { GARBAGE_TRUCK_COLORS } from '@/services/tracking/vehicle-generator';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

interface TrackingMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicleId: string) => void;
  isDark?: boolean;
}

// Custom vehicle marker SVG icon
const createVehicleIcon = (status: string, isDark: boolean = false) => {
  const colors: Record<string, string> = {
    collecting: '#10b981',
    idle: '#6b7280',
    delayed: '#f59e0b',
    maintenance: '#ef4444',
    completed: '#3b82f6',
  };

  const color = colors[status] || '#6b7280';
  const strokeColor = isDark ? '#f3f4f6' : '#1f2937';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- Truck body -->
      <rect x="4" y="10" width="20" height="10" rx="2" fill="${color}" stroke="${strokeColor}" stroke-width="1.5"/>
      <!-- Truck cabin -->
      <rect x="24" y="12" width="6" height="6" rx="1" fill="${color}" stroke="${strokeColor}" stroke-width="1.5"/>
      <!-- Wheel 1 -->
      <circle cx="10" cy="21" r="2.5" fill="${strokeColor}"/>
      <!-- Wheel 2 -->
      <circle cx="22" cy="21" r="2.5" fill="${strokeColor}"/>
      <!-- Status pulse -->
      <circle cx="16" cy="15" r="8" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>
    </svg>
  `.trim();

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Checkpoint marker icon
const checkpointIcons = {
  pending: new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjZWFiMzA4IiBzdHJva2U9IiNkOTc3MDYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
  completed: new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjMTBiOTgxIiBzdHJva2U9IiMwNjc2NjciIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik05IDE0bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
  skipped: new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAKICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjZWY0NDQ0IiBzdHJva2U9IiNkYzI2MjYiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik05IDExaDBtNiAwaDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }),
};

export const TrackingMap: React.FC<TrackingMapProps> = ({
  vehicles,
  selectedVehicleId,
  onVehicleClick,
  isDark = false,
}) => {
  const center: LatLngExpression = [22.7196, 75.8577]; // Indore center
  const zoom = 13;

  // Route polylines
  const routePolylines = useMemo(() => {
    const routes = new Map();

    for (const vehicle of vehicles) {
      const routeId = vehicle.currentRoute.id;
      if (!routes.has(routeId)) {
        const coordinates: LatLngExpression[] = vehicle.currentRoute.coordinates.map(
          coord => [coord.latitude, coord.longitude] as LatLngExpression
        );
        routes.set(routeId, coordinates);
      }
    }

    return routes;
  }, [vehicles]);

  // Tile layer style based on theme
  const tileUrl = isDark
    ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} />

      {/* Route polylines */}
      {Array.from(routePolylines.entries()).map(([routeId, coordinates]) => (
        <Polyline
          key={routeId}
          positions={coordinates}
          color={isDark ? '#3b82f6' : '#2563eb'}
          weight={3}
          opacity={0.6}
          dashArray="5, 5"
        />
      ))}

      {/* Checkpoints */}
      {vehicles.map(vehicle =>
        vehicle.currentRoute.checkpoints.map(checkpoint => (
          <Marker
            key={checkpoint.id}
            position={[checkpoint.coordinates.latitude, checkpoint.coordinates.longitude]}
            icon={checkpointIcons[checkpoint.status as keyof typeof checkpointIcons] || checkpointIcons.pending}
            interactive={false}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-xs">
                <div className="font-semibold">{checkpoint.name}</div>
                <div className="text-gray-600">Status: {checkpoint.status}</div>
              </div>
            </Tooltip>
          </Marker>
        ))
      )}

      {/* Vehicles */}
      {vehicles.map(vehicle => (
        <Marker
          key={vehicle.id}
          position={[vehicle.currentPosition.latitude, vehicle.currentPosition.longitude]}
          icon={createVehicleIcon(vehicle.status, isDark)}
          eventHandlers={{
            click: () => onVehicleClick?.(vehicle.id),
          }}
          riseOnHover
          zIndexOffset={selectedVehicleId === vehicle.id ? 1000 : 0}
        >
          <Popup className="vehicle-popup">
            <div className="min-w-[280px] p-2">
              <div className="font-semibold text-lg">{vehicle.registrationNumber}</div>
              <div className="text-xs text-gray-600 mb-2">{vehicle.driverName}</div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <div className="text-gray-600">Ward</div>
                  <div className="font-semibold">{vehicle.currentRoute.wardName}</div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <div
                    className="font-semibold capitalize"
                    style={{ color: GARBAGE_TRUCK_COLORS[vehicle.status] }}
                  >
                    {vehicle.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <div className="text-gray-600">Speed</div>
                  <div className="font-semibold">{vehicle.speed} km/h</div>
                </div>
                <div>
                  <div className="text-gray-600">Efficiency</div>
                  <div className="font-semibold">{vehicle.efficiency}%</div>
                </div>
              </div>

              <div className="text-xs mb-2">
                <div className="text-gray-600">Checkpoints</div>
                <div className="font-semibold">
                  {vehicle.checkpointsCompleted} / {vehicle.totalCheckpoints}
                </div>
              </div>

              <div className="text-xs">
                <div className="text-gray-600">Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(vehicle.distanceCovered / vehicle.currentRoute.totalDistance) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TrackingMap;
