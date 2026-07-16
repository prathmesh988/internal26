// Alert engine for managing operational alerts and notifications

import { Alert, AlertSeverity, AnomalyType } from '@/types/tracking';

export interface AlertFormatter {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export class AlertEngine {
  private alerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private maxAlertHistory: number = 100;

  /**
   * Format alert for display
   */
  public formatAlert(alert: Alert): AlertFormatter {
    const formatters: Record<AnomalyType, (alert: Alert) => AlertFormatter> = {
      deviation: this.formatDeviation.bind(this),
      delay: this.formatDelay.bind(this),
      maintenance_alert: this.formatMaintenanceAlert.bind(this),
      efficiency_drop: this.formatEfficiencyDrop.bind(this),
    };

    return formatters[alert.type](alert);
  }

  private formatDeviation(alert: Alert): AlertFormatter {
    return {
      title: '🚨 Route Deviation',
      description: alert.message,
      icon: 'AlertTriangle',
      color: 'warning',
    };
  }

  private formatDelay(alert: Alert): AlertFormatter {
    const minutes = alert.details.delayMinutes || 'unknown';
    return {
      title: '⏱️ Pickup Delayed',
      description: `${minutes}m delay in ${alert.details.ward || 'route'}`,
      icon: 'Clock',
      color: 'warning',
    };
  }

  private formatMaintenanceAlert(alert: Alert): AlertFormatter {
    return {
      title: '🔧 Maintenance Required',
      description: alert.message,
      icon: 'Wrench',
      color: 'destructive',
    };
  }

  private formatEfficiencyDrop(alert: Alert): AlertFormatter {
    return {
      title: '📉 Efficiency Drop',
      description: `Vehicle efficiency below ${alert.details.threshold}%`,
      icon: 'TrendingDown',
      color: 'warning',
    };
  }

  /**
   * Add alert to tracking
   */
  public addAlert(alert: Alert): void {
    this.alerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Keep history size limited
    if (this.alertHistory.length > this.maxAlertHistory) {
      this.alertHistory.shift();
    }
  }

  /**
   * Resolve alert
   */
  public resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => !a.resolved).slice(-20);
  }

  /**
   * Get alerts by severity
   */
  public getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.severity === severity && !a.resolved);
  }

  /**
   * Get alerts by vehicle
   */
  public getVehicleAlerts(vehicleId: string): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.vehicleId === vehicleId && !a.resolved);
  }

  /**
   * Get alert statistics
   */
  public getAlertStats() {
    const alerts = Array.from(this.alerts.values()).filter(a => !a.resolved);

    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      byType: {
        deviation: alerts.filter(a => a.type === 'deviation').length,
        delay: alerts.filter(a => a.type === 'delay').length,
        maintenance: alerts.filter(a => a.type === 'maintenance_alert').length,
        efficiency: alerts.filter(a => a.type === 'efficiency_drop').length,
      },
    };
  }

  /**
   * Clear all alerts
   */
  public clearAlerts(): void {
    this.alerts.clear();
  }

  /**
   * Get alert history
   */
  public getHistory(limit: number = 50): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get severity color
   */
  public getSeverityColor(severity: AlertSeverity): string {
    const colors: Record<AlertSeverity, string> = {
      info: 'text-blue-500',
      warning: 'text-amber-500',
      critical: 'text-red-600',
    };
    return colors[severity];
  }

  /**
   * Get severity badge variant
   */
  public getSeverityBadgeVariant(severity: AlertSeverity): string {
    const variants: Record<AlertSeverity, string> = {
      info: 'secondary',
      warning: 'default',
      critical: 'destructive',
    };
    return variants[severity];
  }
}

/**
 * Generate realistic alert messages
 */
export const generateAlertMessage = (type: AnomalyType, details: Record<string, any>): string => {
  const messages: Record<AnomalyType, (d: any) => string> = {
    deviation: (d) => `Vehicle deviated ${d.deviation || '50m'} from assigned route in ${d.ward}`,
    delay: (d) => `Pickup delayed by ${d.delayMinutes || 15} minutes in ${d.ward}`,
    maintenance_alert: (d) => `Vehicle requires maintenance: ${d.issue || 'general maintenance'}`,
    efficiency_drop: (d) => `Vehicle efficiency dropped to ${d.efficiency || 45}%`,
  };

  return messages[type](details);
};
