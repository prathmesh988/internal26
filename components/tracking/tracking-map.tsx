'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker, Tooltip, useMap, CircleMarker } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { Vehicle } from '@/types/tracking';
import { INDORE_BOUNDS } from '@/services/tracking/mock-routes';
import { GARBAGE_TRUCK_COLORS } from '@/services/tracking/vehicle-generator';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { ComplaintDetailModal } from '@/components/complaint-detail-modal';

// Hardcoded complaint points for density visualization
const hardcodedComplaints = [
  // Ward 01 - Shivaji Nagar
  { lat: 22.7220, lng: 75.8600, weight: 3, wardCode: 'W01' },
  { lat: 22.7235, lng: 75.8615, weight: 4, wardCode: 'W01' },
  // Ward 02 - Aundh
  { lat: 22.7100, lng: 75.8450, weight: 2, wardCode: 'W02' },
  // Ward 03 - Kothrud
  { lat: 22.7050, lng: 75.8650, weight: 5, wardCode: 'W03' },
  { lat: 22.7070, lng: 75.8670, weight: 4, wardCode: 'W03' },
  // Ward 07 - Clustered High Density Zone
  { lat: 22.7300, lng: 75.8750, weight: 10, wardCode: 'W07' },
  { lat: 22.7320, lng: 75.8770, weight: 9, wardCode: 'W07' },
  { lat: 22.7285, lng: 75.8735, weight: 8, wardCode: 'W07' }
];

const matchWard = (selectedWard: string, dataWardCode: string) => {
  if (!selectedWard || !dataWardCode) return false;
  const selNum = selectedWard.replace(/\D/g, '');
  const dataNum = dataWardCode.replace(/\D/g, '');
  return parseInt(selNum, 10) === parseInt(dataNum, 10);
};

const hardcodedClusters = [
  {
    wardName: 'Shivaji Nagar (Ward 01)',
    lat: 22.7228,
    lng: 75.8608,
    complaints: [
      { id: 'CMP-101', title: 'Overflowing commercial garbage pile', description: 'Overspill has blocked the main pavement for 2 days. Tipper skipped Lane 3.', category: 'OVERFLOW', ward: 'Ward 01 - Shivaji Nagar', wardCode: 'W01', status: 'OPEN', priority: 'HIGH', createdAt: '2026-07-16T14:30:00Z', assignedToWorkerName: 'Amit Verma' },
      { id: 'CMP-102', title: 'Missed tipper morning pickup', description: 'Collection vehicle skipped Lane 4 morning route. High odor starting to accumulate.', category: 'MISSED_PICKUP', ward: 'Ward 01 - Shivaji Nagar', wardCode: 'W01', status: 'ASSIGNED', priority: 'MEDIUM', createdAt: '2026-07-16T18:45:00Z', assignedToWorkerName: 'Riya Singh' }
    ]
  },
  {
    wardName: 'Aundh (Ward 02)',
    lat: 22.7100,
    lng: 75.8450,
    complaints: [
      { id: 'CMP-201', title: 'Plastic packaging spill', description: 'Scattered commercial wrappers and box waste near gate 3.', category: 'SPILL', ward: 'Ward 02 - Aundh', wardCode: 'W02', status: 'IN_PROGRESS', priority: 'LOW', createdAt: '2026-07-16T10:15:00Z', assignedToWorkerName: 'Neha Sharma' }
    ]
  },
  {
    wardName: 'Kothrud (Ward 03)',
    lat: 22.7060,
    lng: 75.8660,
    complaints: [
      { id: 'CMP-301', title: 'Hazardous paint dumping', description: 'Several cans of chemical paints dumped illegally next to standard bin slots.', category: 'ILLEGAL_DUMPING', ward: 'Ward 03 - Kothrud', wardCode: 'W03', status: 'ESCALATED', priority: 'CRITICAL', createdAt: '2026-07-16T08:00:00Z', assignedToWorkerName: 'Suresh Yadav' }
    ]
  },
  {
    wardName: 'Hot Zone (Ward 07)',
    lat: 22.7302,
    lng: 75.8752,
    complaints: [
      { id: 'CMP-701', title: 'Multiple market bins overflow', description: 'Sanitation compactor skipped market bins. Over 500kg waste piles up.', category: 'OVERFLOW', ward: 'Ward 07', wardCode: 'W07', status: 'OPEN', priority: 'HIGH', createdAt: '2026-07-16T16:20:00Z', assignedToWorkerName: 'Karan Shah' },
      { id: 'CMP-702', title: 'Illegal industrial dumping', description: 'Unidentified vehicle spotted dumping packaging boxes directly in market lanes.', category: 'ILLEGAL_DUMPING', ward: 'Ward 07', wardCode: 'W07', status: 'ASSIGNED', priority: 'HIGH', createdAt: '2026-07-16T17:10:00Z', assignedToWorkerName: 'Deepak Rao' },
      { id: 'CMP-703', title: 'Non-segregated waste dump', description: 'E-waste lithium-ion batteries and chargers mixed in with green wet scraps.', category: 'SEGREGATION', ward: 'Ward 07', wardCode: 'W07', status: 'OPEN', priority: 'CRITICAL', createdAt: '2026-07-16T19:00:00Z', assignedToWorkerName: 'Sneha Kulkarni' }
    ]
  }
];

interface HeatmapLayerProps {
  points: { lat: number; lng: number; weight: number }[];
  visible: boolean;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, visible }) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!visible) return;

    const heatData = points.map(p => [p.lat, p.lng, p.weight] as [number, number, number]);

    heatLayerRef.current = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      gradient: {
        0.4: '#10b981',  // Green (low density)
        0.65: '#f59e0b', // Yellow (medium density)
        1.0: '#ef4444',  // Red (high density)
      }
    }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, visible]);

  return null;
};

interface TrackingMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicleId: string) => void;
  isDark?: boolean;
  viewMode?: 'admin' | 'citizen';
  selectedWard?: string;
}

// Custom vehicle marker SVG icon — enlarged significantly for maximum visibility
const createVehicleIcon = (status: string, isDark: boolean = false, isSelected: boolean = false) => {
  const colors: Record<string, string> = {
    collecting:  '#10b981',
    idle:        '#6b7280',
    delayed:     '#f97316',
    maintenance: '#ef4444',
    completed:   '#3b82f6',
  };

  const color = colors[status] || '#6b7280';
  const strokeColor = '#1e2937'; // Bold dark border for high contrast
  
  // Cleaner, balanced size for the trucks
  const size = isSelected ? 46 : 36;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      <!-- Shadow -->
      <ellipse cx="18" cy="33" rx="14" ry="4" fill="rgba(0,0,0,0.25)"/>
      <!-- Truck body (compactor) -->
      <rect x="2" y="8" width="24" height="17" rx="3" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>
      <!-- Cabin -->
      <rect x="26" y="11" width="9" height="12" rx="2" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>
      <!-- Windshield -->
      <rect x="28" y="13.5" width="5" height="5" rx="1" fill="#fff" opacity="0.8"/>
      <!-- Wheels -->
      <circle cx="9" cy="26.5" r="5" fill="${strokeColor}"/>
      <circle cx="9" cy="26.5" r="2.2" fill="#fff"/>
      <circle cx="22" cy="26.5" r="5" fill="${strokeColor}"/>
      <circle cx="22" cy="26.5" r="2.2" fill="#fff"/>
      ${isSelected ? `<circle cx="18" cy="18" r="17" fill="none" stroke="${color}" stroke-width="3" opacity="0.8" stroke-dasharray="5, 3"/>` : ''}
    </svg>
  `.trim();

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize:     [size, size],
    iconAnchor:   [size / 2, size],
    popupAnchor:  [0, -size],
  });
};

export const TrackingMap: React.FC<TrackingMapProps> = ({
  vehicles,
  selectedVehicleId: propSelectedVehicleId,
  onVehicleClick,
  isDark = false,
  viewMode = 'admin',
  selectedWard,
}) => {
  const [internalSelectedVehicleId, setInternalSelectedVehicleId] = useState<string | undefined>();
  const selectedVehicleId = propSelectedVehicleId !== undefined ? propSelectedVehicleId : internalSelectedVehicleId;

  const handleVehicleClick = (vehicleId: string) => {
    setInternalSelectedVehicleId(vehicleId);
    onVehicleClick?.(vehicleId);
  };

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCluster, setHoveredCluster] = useState<any>(null);
  const closeTimeoutRef = useRef<any>(null);
  const center: LatLngExpression = [22.7196, 75.8577];
  const zoom = 13;

  // Filter vehicles on client side based on selected ward if viewMode is 'citizen'
  const filteredVehicles = useMemo(() => {
    if (viewMode === 'citizen' && selectedWard) {
      return vehicles.filter(v => matchWard(selectedWard, v.currentRoute.wardCode));
    }
    return vehicles;
  }, [vehicles, viewMode, selectedWard]);

  // Filter heatmap points on client side based on selected ward if viewMode is 'citizen'
  const filteredComplaints = useMemo(() => {
    if (viewMode === 'citizen' && selectedWard) {
      return hardcodedComplaints.filter(c => matchWard(selectedWard, c.wardCode));
    }
    return hardcodedComplaints;
  }, [viewMode, selectedWard]);

  // Filter clusters on client side based on selected ward if viewMode is 'citizen'
  const filteredClusters = useMemo(() => {
    if (viewMode === 'citizen' && selectedWard) {
      return hardcodedClusters.filter(c => 
        c.complaints.some(comp => matchWard(selectedWard, comp.wardCode))
      );
    }
    return hardcodedClusters;
  }, [viewMode, selectedWard]);

  const MapEvents = () => {
    const map = useMap();
    useEffect(() => {
      const handleClose = () => {
        setHoveredCluster(null);
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      };

      const handleMove = () => {
        if (hoveredCluster) {
          const point = map.latLngToContainerPoint([hoveredCluster.lat, hoveredCluster.lng]);
          setHoveredCluster((prev: any) => {
            if (!prev) return null;
            return {
              ...prev,
              x: point.x,
              y: point.y - 10,
            };
          });
        }
      };

      map.on('zoomstart dragstart', handleClose);
      map.on('zoomend moveend', handleMove);
      return () => {
        map.off('zoomstart dragstart', handleClose);
        map.off('zoomend moveend', handleMove);
      };
    }, [map]);
    return null;
  };

  // Deduplicate planned route polylines by route ID
  const routePolylines = useMemo(() => {
    const seen = new Set<string>();
    const result: { routeId: string; coords: LatLngExpression[] }[] = [];
    const sourceVehicles = viewMode === 'citizen' ? filteredVehicles : vehicles;

    for (const vehicle of sourceVehicles) {
      const routeId = vehicle.currentRoute.id;
      if (!seen.has(routeId)) {
        seen.add(routeId);
        const coords: LatLngExpression[] = vehicle.currentRoute.coordinates.map(
          c => [c.latitude, c.longitude] as LatLngExpression
        );
        result.push({ routeId, coords });
      }
    }

    return result;
  }, [vehicles, filteredVehicles, viewMode]);

  // Orange deviation paths — only for deviated vehicles that have breadcrumbs
  const deviationPolylines = useMemo(() => {
    const sourceVehicles = viewMode === 'citizen' ? filteredVehicles : vehicles;
    return sourceVehicles
      .filter(v => v.isDeviated && v.deviationPath && v.deviationPath.length > 1)
      .map(v => ({
        vehicleId: v.id,
        coords: v.deviationPath.map(c => [c.latitude, c.longitude] as LatLngExpression),
      }));
  }, [vehicles, filteredVehicles, viewMode]);

  const tileUrl = isDark
    ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="relative w-full h-full">
      {/* Floating Toggle Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur border rounded-xl p-2.5 px-3 shadow-md flex items-center gap-2">
        <input
          type="checkbox"
          id="toggle-heatmap"
          checked={showHeatmap}
          onChange={(e) => setShowHeatmap(e.target.checked)}
          className="size-4 cursor-pointer accent-primary"
        />
        <label htmlFor="toggle-heatmap" className="text-xs font-bold cursor-pointer select-none text-foreground">
          Show Complaint Heatmap
        </label>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />

        {/* ── Complaint Density Heatmap ── */}
        <HeatmapLayer points={filteredComplaints} visible={showHeatmap} />

        <MapEvents />

        {/* ── Invisible Interactive Cluster Markers for Heatmap ── */}
        {showHeatmap && filteredClusters.map((cluster, idx) => (
          <CircleMarker
            key={`cluster-marker-${idx}`}
            center={[cluster.lat, cluster.lng]}
            radius={20}
            pathOptions={{
              fillColor: 'transparent',
              color: 'transparent',
              fillOpacity: 0,
              stroke: false
            }}
            eventHandlers={{
              mouseover: (e) => {
                const map = e.target._map;
                const point = map.latLngToContainerPoint(e.target.getLatLng());
                setHoveredCluster({
                  ...cluster,
                  x: point.x,
                  y: point.y - 10,
                });
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
              },
              mouseout: () => {
                closeTimeoutRef.current = setTimeout(() => {
                  setHoveredCluster(null);
                }, 300);
              }
            }}
          />
        ))}

        {/* ── Planned route polylines (Extra Bold, Deep Midnight Navy Blue) ── */}
        {routePolylines.map(({ routeId, coords }) => (
          <Polyline
            key={routeId}
            positions={coords}
            color="#1e3a8a"
            weight={8}
            opacity={0.9}
          />
        ))}

        {/* ── Deviation paths (Extra Bold Orange) ── */}
        {deviationPolylines.map(({ vehicleId, coords }) => (
          <Polyline
            key={`dev-${vehicleId}`}
            positions={coords}
            color="#ea580c"
            weight={10}
            opacity={0.95}
          />
        ))}

        {/* ── Vehicle markers ── */}
        {filteredVehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            position={[vehicle.currentPosition.latitude, vehicle.currentPosition.longitude]}
            icon={createVehicleIcon(vehicle.status, isDark, selectedVehicleId === vehicle.id)}
            eventHandlers={{ click: () => handleVehicleClick(vehicle.id) }}
            riseOnHover
            zIndexOffset={selectedVehicleId === vehicle.id ? 1000 : 0}
          >
            <Popup className="vehicle-popup">
              <div className="min-w-[260px] p-2 space-y-2">
                <div>
                  <div className="font-semibold text-base">{vehicle.registrationNumber}</div>
                  {(viewMode !== 'citizen' || selectedVehicleId === vehicle.id) && (
                    <div className="text-xs text-gray-500">{vehicle.driverName}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Ward</div>
                    <div className="font-semibold">{vehicle.currentRoute.wardName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div
                      className="font-semibold capitalize"
                      style={{ color: GARBAGE_TRUCK_COLORS[vehicle.status] }}
                    >
                      {vehicle.isDeviated ? '⚠ Deviated' : vehicle.status}
                    </div>
                  </div>
                  {viewMode !== 'citizen' && (
                    <>
                      <div>
                        <div className="text-gray-500">Speed</div>
                        <div className="font-semibold">{vehicle.speed} km/h</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Efficiency</div>
                        <div className="font-semibold">{vehicle.efficiency}%</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Route progress bar */}
                <div className="text-xs">
                  <div className="text-gray-500 mb-1">Route Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (vehicle.distanceCovered / vehicle.currentRoute.totalDistance) * 100)}%`,
                        backgroundColor: vehicle.isDeviated ? '#f97316' : GARBAGE_TRUCK_COLORS[vehicle.status],
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span>{vehicle.distanceCovered.toFixed(1)} km</span>
                    <span className="text-gray-400">{vehicle.currentRoute.totalDistance.toFixed(1)} km</span>
                  </div>
                </div>
              </div>
            </Popup>

            {/* Tooltip on hover for quick info */}
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              <div className="text-xs font-semibold">
                {vehicle.registrationNumber}
                {vehicle.isDeviated && <span className="ml-1 text-orange-500">⚠ Off-route</span>}
              </div>
              <div className="text-xs text-gray-500">{vehicle.currentRoute.wardName}</div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Interactive Hover Tooltip */}
      {hoveredCluster && (
        <div
          className="absolute z-[1100] bg-background/95 backdrop-blur-md border rounded-xl p-3 shadow-xl text-xs w-64 space-y-2 pointer-events-auto text-foreground transition-all duration-150"
          style={{
            left: `${hoveredCluster.x}px`,
            top: `${hoveredCluster.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            closeTimeoutRef.current = setTimeout(() => {
              setHoveredCluster(null);
            }, 100);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="font-bold border-b pb-1 text-[10px] text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>{hoveredCluster.wardName}</span>
            <span className="bg-destructive/10 text-destructive rounded-full px-1.5 py-0.2 font-mono">
              {hoveredCluster.complaints.length}
            </span>
          </div>
          <div className="space-y-1">
            {hoveredCluster.complaints.map((c: any) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedComplaint(c);
                  setIsModalOpen(true);
                  setHoveredCluster(null);
                }}
                className="w-full text-left p-1.5 px-2 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary transition-all duration-150 flex items-center justify-between font-semibold"
              >
                <span className="truncate max-w-[140px]">{c.title}</span>
                <span className="font-mono text-[9px] text-muted-foreground bg-muted p-0.5 rounded px-1 flex-shrink-0">
                  {c.id}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <ComplaintDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
        }}
        complaint={selectedComplaint}
      />
    </div>
  );
};

export default TrackingMap;
