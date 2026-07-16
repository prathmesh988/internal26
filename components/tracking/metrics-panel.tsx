'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricSnapshot } from '@/types/tracking';
import { Truck, CheckCircle, Clock, Zap } from 'lucide-react';

interface MetricsPanelProps {
  metrics: MetricSnapshot;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  unit?: string;
}> = ({ title, value, icon, trend, unit }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="p-2 bg-muted rounded-lg text-primary">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value}
          {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </div>
        {trend !== undefined && (
          <div className={`text-xs mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Active Vehicles"
        value={metrics.activeVehicles}
        icon={<Truck className="w-4 h-4" />}
      />

      <MetricCard
        title="Routes Completed"
        value={metrics.routesCompleted}
        icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
      />

      <MetricCard
        title="Delayed / Deviated"
        value={metrics.delayedPickups}
        icon={<Clock className="w-4 h-4 text-orange-500" />}
      />

      <MetricCard
        title="Avg Efficiency"
        value={metrics.averageEfficiency}
        icon={<Zap className="w-4 h-4 text-yellow-500" />}
        unit="%"
      />

      <MetricCard
        title="Total Distance"
        value={metrics.totalDistanceCovered.toFixed(1)}
        icon={<Truck className="w-4 h-4 text-sky-500" />}
        unit="km"
      />
    </div>
  );
};
