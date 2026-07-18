'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRealtimeTracking } from '@/hooks/use-realtime-tracking';
import { TrackingMap } from '@/components/tracking/tracking-map';
import { MetricsPanel } from '@/components/tracking/metrics-panel';
import { AlertsPanel } from '@/components/tracking/alerts-panel';
import { VehicleDetail } from '@/components/tracking/vehicle-detail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function TrackingDashboardPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();
  const [optMode, setOptMode] = useState<'none' | 'auto' | 'manual'>('none');
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  const {
    vehicles,
    alerts,
    metrics,
    isSimulating,
    simulationSpeed,
    startSimulation,
    stopSimulation,
    setSimulationSpeed,
    resetSimulation,
    resolveAlert,
  } = useRealtimeTracking();

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-screen bg-background" />;
  }

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b"
      >
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Fleet Operations</h1>
              <p className="text-muted-foreground">Real-time waste collection monitoring</p>
            </div>
            <Badge
              variant={isSimulating ? 'default' : 'secondary'}
              className="h-fit animate-pulse"
            >
              {isSimulating ? 'Live' : 'Paused'}
            </Badge>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={isSimulating ? stopSimulation : startSimulation}
              size="sm"
              variant={isSimulating ? 'destructive' : 'default'}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>

            <Button onClick={resetSimulation} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Select value={simulationSpeed.toString()} onValueChange={v => setSimulationSpeed(Number(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="10">10x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <MetricsPanel metrics={metrics} />
        </motion.div>

        {/* Route Optimization Demo Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="border border-primary/20 shadow-sm bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">AI Route Optimization Simulator</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Compare routing sequence options for <strong>Ward 03 - Kalani Nagar</strong> (route-ward-3) collection lanes.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between pt-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  onClick={() => setOptMode('none')}
                  variant={optMode === 'none' ? "default" : "outline"}
                  size="sm"
                  className="font-semibold"
                >
                  Standard Route
                </Button>
                <Button 
                  onClick={() => setOptMode('manual')}
                  variant={optMode === 'manual' ? "default" : "outline"}
                  size="sm"
                  className="font-semibold"
                >
                  Manual Re-routing
                </Button>
                <Button 
                  onClick={() => setOptMode('auto')}
                  variant={optMode === 'auto' ? "default" : "outline"}
                  size="sm"
                  className="font-semibold"
                >
                  Automatic AI Mode
                </Button>
              </div>

              {optMode !== 'none' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-3 gap-4 border-l pl-4 border-border text-xs"
                >
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Distance</span>
                    <span className="text-emerald-500 font-bold text-sm">
                      {optMode === 'auto' ? '-12.4%' : '-5.1%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Est. Time</span>
                    <span className="text-emerald-500 font-bold text-sm">
                      {optMode === 'auto' ? '-8.5 min' : '-3.2 min'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Fuel Cost</span>
                    <span className="text-emerald-500 font-bold text-sm">
                      {optMode === 'auto' ? '-₹340/day' : '-₹120/day'}
                    </span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Map and Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="h-[600px] overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Live Fleet Map
                  </CardTitle>
                  <Badge variant="secondary">{vehicles.length} vehicles</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-70px)]">
                 <TrackingMap
                  vehicles={vehicles}
                  selectedVehicleId={selectedVehicleId}
                  onVehicleClick={setSelectedVehicleId}
                  isDark={theme === 'dark'}
                  optMode={optMode}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Sidebar - Alerts and Vehicle Detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Vehicle Detail */}
            {selectedVehicle && (
              <VehicleDetail
                vehicle={selectedVehicle}
                onClose={() => setSelectedVehicleId(undefined)}
              />
            )}

            {/* Alerts */}
            <div className={selectedVehicle ? '' : 'lg:row-span-2'}>
              <AlertsPanel
                alerts={alerts}
                onResolveAlert={resolveAlert}
                maxVisible={selectedVehicle ? 3 : 8}
              />
            </div>
          </motion.div>
        </div>

        {/* Vehicle List (Optional - Desktop only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="hidden lg:block"
        >
          <Card>
            <CardHeader>
              <CardTitle>Active Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicles.map(vehicle => (
                  <motion.button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedVehicleId === vehicle.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-sm">{vehicle.registrationNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle.currentRoute.wardName}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {vehicle.status}
                      </Badge>
                      <span className="text-xs font-semibold">
                        {(
                          (vehicle.distanceCovered / vehicle.currentRoute.totalDistance) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
