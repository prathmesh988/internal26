'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/tracking';
import { Truck, User, Phone, MapPin, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { GARBAGE_TRUCK_COLORS } from '@/services/tracking/vehicle-generator';

interface VehicleDetailProps {
  vehicle: Vehicle | null;
  onClose?: () => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle, onClose }) => {
  if (!vehicle) {
    return null;
  }

  const route = vehicle.currentRoute;
  const routeProgress = (vehicle.distanceCovered / route.totalDistance) * 100;
  const capacityUsage = (vehicle.capacityUsed / vehicle.capacity) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-primary" />
                <CardTitle>{vehicle.registrationNumber}</CardTitle>
              </div>
              <Badge
                style={{ backgroundColor: GARBAGE_TRUCK_COLORS[vehicle.status] }}
                className="text-white font-semibold"
              >
                {vehicle.isDeviated ? 'deviated' : vehicle.status}
              </Badge>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                ✕
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Driver Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Driver Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Driver Name</p>
                  <p className="font-semibold text-sm">{vehicle.driverName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Contact</p>
                  <p className="font-semibold text-sm">{vehicle.driverPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Route Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Ward Code / Name</p>
                  <p className="font-semibold text-sm">{route.wardCode} - {route.wardName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Route Progress</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{vehicle.distanceCovered.toFixed(1)} km</span>
                    <span className="text-muted-foreground">{route.totalDistance.toFixed(1)} km</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${vehicle.isDeviated ? 'bg-orange-500' : 'bg-gradient-to-r from-primary to-primary/80'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, routeProgress)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Path Status & Deviations */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Route Path Status
            </h3>
            {vehicle.isDeviated ? (
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Deviation Alert</p>
                  <p className="mt-1 leading-relaxed">
                    Vehicle has strayed from the assigned planned path. An orange deviation line is active to track its actual coordinates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg p-3 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">On Planned Path</p>
                  <p className="mt-1 leading-relaxed">
                    The vehicle is following its assigned ward collection route correctly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Performance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Speed</p>
                <p className="text-xl font-bold">{vehicle.speed} <span className="text-xs font-normal text-muted-foreground">km/h</span></p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">Efficiency</p>
                <p className="text-xl font-bold text-emerald-600">{vehicle.efficiency}%</p>
              </div>
            </div>

            {/* Capacity */}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Capacity Usage</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{(vehicle.capacityUsed / 1000).toFixed(1)} tons</span>
                  <span className="text-muted-foreground">{(vehicle.capacity / 1000).toFixed(1)} tons capacity</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, capacityUsage)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="pt-3 border-t">
            <p className="text-[10px] text-muted-foreground">
              Last update: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
