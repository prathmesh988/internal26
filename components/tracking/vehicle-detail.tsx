'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/tracking';
import { Truck, User, Phone, MapPin, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
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
                className="text-white"
              >
                {vehicle.status}
              </Badge>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Driver Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Driver Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Driver Name</p>
                  <p className="font-semibold">{vehicle.driverName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-semibold">{vehicle.driverPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Route Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Ward</p>
                  <p className="font-semibold">{route.wardName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Route Progress</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{vehicle.distanceCovered.toFixed(1)}</span>
                    <span className="text-muted-foreground">{route.totalDistance.toFixed(1)} km</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${routeProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkpoint Progress */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Checkpoints
            </h3>
            <div className="space-y-2">
              {route.checkpoints.map((checkpoint, index) => (
                <motion.div
                  key={checkpoint.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 text-sm"
                >
                  {checkpoint.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : checkpoint.status === 'skipped' ? (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex-shrink-0" />
                  )}
                  <span className="flex-1">{checkpoint.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {checkpoint.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Performance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Speed</p>
                <p className="text-xl font-bold">{vehicle.speed}</p>
                <p className="text-xs text-muted-foreground">km/h</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                <p className="text-xl font-bold" style={{ color: GARBAGE_TRUCK_COLORS.collecting }}>
                  {vehicle.efficiency}%
                </p>
              </div>
            </div>

            {/* Capacity */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Capacity Usage</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{(vehicle.capacityUsed / 1000).toFixed(1)}</span>
                  <span className="text-muted-foreground">{vehicle.capacity / 1000} liters</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${capacityUsage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Last update: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
