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
  // Ward 01 - Sirpur
  { lat: 22.7060, lng: 75.8210, weight: 3, wardCode: 'W01' },
  { lat: 22.7075, lng: 75.8225, weight: 4, wardCode: 'W01' },
  // Ward 02 - Chandan Nagar
  { lat: 22.6960, lng: 75.8260, weight: 2, wardCode: 'W02' },
  // Ward 03 - Kalani Nagar
  { lat: 22.7310, lng: 75.8310, weight: 5, wardCode: 'W03' },
  { lat: 22.7330, lng: 75.8330, weight: 4, wardCode: 'W03' },
  // Ward 04 - Sukhdev Nagar
  { lat: 22.7360, lng: 75.8360, weight: 10, wardCode: 'W04' },
  { lat: 22.7380, lng: 75.8380, weight: 9, wardCode: 'W04' },
  { lat: 22.7345, lng: 75.8345, weight: 8, wardCode: 'W04' }
];

const matchWard = (selectedWard: string, dataWardCode: string) => {
  if (!selectedWard || !dataWardCode) return false;
  const selNum = selectedWard.replace(/\D/g, '');
  const dataNum = dataWardCode.replace(/\D/g, '');
  return parseInt(selNum, 10) === parseInt(dataNum, 10);
};

const hardcodedClusters = [
  {
    wardName: 'Ward 01 - Sirpur',
    lat: 22.7058,
    lng: 75.8208,
    complaints: [
      { id: 'CMP-101', title: 'Overflowing commercial garbage pile', description: 'Overspill has blocked the main pavement for 2 days. Tipper skipped Lane 3.', category: 'OVERFLOW', ward: 'Ward 01 - Sirpur', wardCode: 'W01', status: 'OPEN', priority: 'HIGH', createdAt: '2026-07-16T14:30:00Z', assignedToWorkerName: 'Amit Verma' },
      { id: 'CMP-102', title: 'Missed tipper morning pickup', description: 'Collection vehicle skipped Lane 4 morning route. High odor starting to accumulate.', category: 'MISSED_PICKUP', ward: 'Ward 01 - Sirpur', wardCode: 'W01', status: 'ASSIGNED', priority: 'MEDIUM', createdAt: '2026-07-16T18:45:00Z', assignedToWorkerName: 'Riya Singh' }
    ]
  },
  {
    wardName: 'Ward 02 - Chandan Nagar',
    lat: 22.6960,
    lng: 75.8260,
    complaints: [
      { id: 'CMP-201', title: 'Plastic packaging spill', description: 'Scattered commercial wrappers and box waste near gate 3.', category: 'SPILL', ward: 'Ward 02 - Chandan Nagar', wardCode: 'W02', status: 'IN_PROGRESS', priority: 'LOW', createdAt: '2026-07-16T10:15:00Z', assignedToWorkerName: 'Neha Sharma' }
    ]
  },
  {
    wardName: 'Ward 03 - Kalani Nagar',
    lat: 22.7310,
    lng: 75.8310,
    complaints: [
      { id: 'CMP-301', title: 'Hazardous paint dumping', description: 'Several cans of chemical paints dumped illegally next to standard bin slots.', category: 'ILLEGAL_DUMPING', ward: 'Ward 03 - Kalani Nagar', wardCode: 'W03', status: 'ESCALATED', priority: 'CRITICAL', createdAt: '2026-07-16T08:00:00Z', assignedToWorkerName: 'Suresh Yadav' }
    ]
  },
  {
    wardName: 'Ward 04 - Sukhdev Nagar',
    lat: 22.7362,
    lng: 75.8362,
    complaints: [
      { id: 'CMP-701', title: 'Multiple market bins overflow', description: 'Sanitation compactor skipped market bins. Over 500kg waste piles up.', category: 'OVERFLOW', ward: 'Ward 04 - Sukhdev Nagar', wardCode: 'W04', status: 'OPEN', priority: 'HIGH', createdAt: '2026-07-16T16:20:00Z', assignedToWorkerName: 'Karan Shah' },
      { id: 'CMP-702', title: 'Illegal industrial dumping', description: 'Unidentified vehicle spotted dumping packaging boxes directly in market lanes.', category: 'ILLEGAL_DUMPING', ward: 'Ward 04 - Sukhdev Nagar', wardCode: 'W04', status: 'ASSIGNED', priority: 'HIGH', createdAt: '2026-07-16T17:10:00Z', assignedToWorkerName: 'Deepak Rao' },
      { id: 'CMP-703', title: 'Non-segregated waste dump', description: 'E-waste lithium-ion batteries and chargers mixed in with green wet scraps.', category: 'SEGREGATION', ward: 'Ward 04 - Sukhdev Nagar', wardCode: 'W04', status: 'OPEN', priority: 'CRITICAL', createdAt: '2026-07-16T19:00:00Z', assignedToWorkerName: 'Sneha Kulkarni' }
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
  isOptimized?: boolean;
  optMode?: 'none' | 'auto' | 'manual';
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
  isOptimized = false,
  optMode = 'none',
}) => {
  const [internalSelectedVehicleId, setInternalSelectedVehicleId] = useState<string | undefined>();
  const selectedVehicleId = propSelectedVehicleId !== undefined ? propSelectedVehicleId : internalSelectedVehicleId;

  const handleVehicleClick = (vehicleId: string) => {
    setInternalSelectedVehicleId(vehicleId);
    onVehicleClick?.(vehicleId);
  };

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [showDeviatedOnly, setShowDeviatedOnly] = useState<boolean>(false);

  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCluster, setHoveredCluster] = useState<any>(null);
  const closeTimeoutRef = useRef<any>(null);
  const center: LatLngExpression = [22.7196, 75.8577];
  const zoom = 13;

  // Filter vehicles on client side based on selected ward or deviation state
  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    
    const activeWard = viewMode === 'citizen' ? selectedWard : (selectedWardFilter === 'all' ? undefined : selectedWardFilter);
    if (activeWard) {
      result = result.filter(v => matchWard(activeWard, v.currentRoute.wardCode));
    }
    
    if (showDeviatedOnly) {
      result = result.filter(v => v.isDeviated);
    }
    
    return result;
  }, [vehicles, viewMode, selectedWard, selectedWardFilter, showDeviatedOnly]);

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
    const result: { routeId: string; coords: LatLngExpression[]; isOptimizedRoute?: boolean; optColor?: string }[] = [];
    const sourceVehicles = filteredVehicles;

    for (const vehicle of sourceVehicles) {
      const routeId = vehicle.currentRoute.id;
      if (!seen.has(routeId)) {
        seen.add(routeId);
        
        let coords: LatLngExpression[];
        let isOpt = false;
        let optColor = "#1e3a8a";
        
        if (optMode === 'auto' && routeId === 'route-ward-3') {
          coords = [
            [22.7300, 75.8300],
            [22.7320, 75.8315],
            [22.7340, 75.8340],
            [22.7365, 75.8365],
            [22.7385, 75.8385],
            [22.7400, 75.8400]
          ];
          isOpt = true;
          optColor = "#10b981"; // green
        } else if (optMode === 'manual' && routeId === 'route-ward-3') {
          coords = [
            [22.7300, 75.8300],
            [22.7310, 75.8310],
            [22.7335, 75.8325],
            [22.7360, 75.8350],
            [22.7375, 75.8380],
            [22.7400, 75.8400]
          ];
          isOpt = true;
          optColor = "#f97316"; // orange/amber
        } else {
          coords = vehicle.currentRoute.coordinates.map(
            c => [c.latitude, c.longitude] as LatLngExpression
          );
        }

        result.push({ routeId, coords, isOptimizedRoute: isOpt, optColor });
      }
    }

    return result;
  }, [vehicles, filteredVehicles, viewMode, optMode]);

  // Orange deviation paths — only for deviated vehicles that have breadcrumbs
  const deviationPolylines = useMemo(() => {
    const sourceVehicles = filteredVehicles;
    return sourceVehicles
      .filter(v => v.isDeviated && v.deviationPath && v.deviationPath.length > 1)
      .map(v => ({
        vehicleId: v.id,
        coords: v.deviationPath.map(c => [c.latitude, c.longitude] as LatLngExpression),
      }));
  }, [filteredVehicles]);

  const tileUrl = isDark
    ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="relative w-full h-full">
      {/* Floating Toggle & Filter Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur border rounded-xl p-3 shadow-md flex flex-col gap-2.5 min-w-[210px] max-w-[240px]">
        {/* Heatmap Toggle */}
        <div className="flex items-center gap-2">
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

        {/* Deviated Only Toggle */}
        {viewMode !== 'citizen' && (
          <div className="flex items-center gap-2 border-t pt-2 border-border/55">
            <input
              type="checkbox"
              id="toggle-deviated"
              checked={showDeviatedOnly}
              onChange={(e) => setShowDeviatedOnly(e.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            <label htmlFor="toggle-deviated" className="text-xs font-bold cursor-pointer select-none text-foreground">
              Off-Route / Deviated Only
            </label>
          </div>
        )}

        {/* Ward Selector */}
        {viewMode !== 'citizen' && (
          <div className="flex flex-col gap-1 border-t pt-2 border-border/55">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Filter by Ward
            </label>
            <select
              value={selectedWardFilter}
              onChange={(e) => setSelectedWardFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border bg-background text-foreground font-semibold cursor-pointer outline-none hover:bg-muted/30 transition-colors"
            >
              <option value="all">All Wards</option>
              <option value="W01">Ward 01 - Sirpur</option>
              <option value="W02">Ward 02 - Chandan Nagar</option>
              <option value="W03">Ward 03 - Kalani Nagar</option>
              <option value="W04">Ward 04 - Sukhdev Nagar</option>
              <option value="W05">Ward 05 - Raj Nagar</option>
              <option value="W06">Ward 06 - Malharganj</option>
            </select>
          </div>
        )}
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

        {/* ── Planned route polylines (Extra Bold, Deep Midnight Navy Blue / Green or Orange for optimized) ── */}
        {routePolylines.map(({ routeId, coords, isOptimizedRoute, optColor }) => (
          <Polyline
            key={routeId}
            positions={coords}
            color={optColor || "#1e3a8a"}
            weight={isOptimizedRoute ? 10 : 8}
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
