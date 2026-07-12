'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/types/tracking';
import { AlertTriangle, Clock, XCircle, CheckCircle, X } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  onResolveAlert: (alertId: string) => void;
  maxVisible?: number;
}

const AlertIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons: Record<string, React.ReactNode> = {
    deviation: <AlertTriangle className="w-4 h-4" />,
    delay: <Clock className="w-4 h-4" />,
    missed_checkpoint: <XCircle className="w-4 h-4" />,
    maintenance_alert: <AlertTriangle className="w-4 h-4" />,
    efficiency_drop: <AlertTriangle className="w-4 h-4" />,
  };

  return <>{icons[type] || <AlertTriangle className="w-4 h-4" />}</>;
};

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    critical: 'bg-red-50 border-red-200 text-red-900',
  };
  return colors[severity] || colors.info;
};

const getBadgeVariant = (severity: string) => {
  const variants: Record<string, any> = {
    info: 'secondary',
    warning: 'default',
    critical: 'destructive',
  };
  return variants[severity] || 'secondary';
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onResolveAlert,
  maxVisible = 5,
}) => {
  const visibleAlerts = alerts.slice(0, maxVisible);
  const hasMore = alerts.length > maxVisible;

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Operational Alerts</CardTitle>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8 text-muted-foreground"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              <span>All systems operational</span>
            </motion.div>
          ) : (
            visibleAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <div
                  className={`rounded-lg border-l-4 p-3 space-y-2 transition-all ${getSeverityColor(
                    alert.severity
                  )}`}
                  style={{
                    borderLeft: `4px solid ${
                      alert.severity === 'critical'
                        ? '#ef4444'
                        : alert.severity === 'warning'
                        ? '#f59e0b'
                        : '#3b82f6'
                    }`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="mt-0.5">
                        <AlertIcon type={alert.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{alert.vehicleRegistration}</div>
                        <div className="text-xs mt-1 line-clamp-2">{alert.message}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onResolveAlert(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getBadgeVariant(alert.severity)} className="text-xs">
                      {alert.severity}
                    </Badge>
                    <span className="text-xs opacity-70">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-2 border-t text-center text-xs text-muted-foreground"
          >
            +{alerts.length - maxVisible} more alerts
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
