/**
 * Shared UI Components
 * Reusable components across the application
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// STATUS BADGE
// ============================================================================

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: React.ReactNode;
}

export function StatusBadge({ status, variant = 'default', icon }: StatusBadgeProps) {
  const statusStyles: Record<string, { variant: any; color: string }> = {
    OPEN: { variant: 'outline', color: 'text-blue-600' },
    ASSIGNED: { variant: 'secondary', color: 'text-yellow-600' },
    IN_PROGRESS: { variant: 'secondary', color: 'text-blue-600' },
    RESOLVED: { variant: 'default', color: 'text-green-600' },
    CLOSED: { variant: 'outline', color: 'text-gray-600' },
    ESCALATED: { variant: 'destructive', color: 'text-red-600' },
    ACTIVE: { variant: 'default', color: 'text-green-600' },
    IDLE: { variant: 'outline', color: 'text-gray-600' },
    IN_USE: { variant: 'secondary', color: 'text-blue-600' },
    MAINTENANCE: { variant: 'destructive', color: 'text-red-600' },
    COMPLETED: { variant: 'default', color: 'text-green-600' },
    FAILED: { variant: 'destructive', color: 'text-red-600' },
    PENDING: { variant: 'outline', color: 'text-yellow-600' },
  };

  const style = statusStyles[status] || { variant: 'default', color: 'text-gray-600' };

  return (
    <Badge variant={style.variant} className={cn('gap-1', style.color)}>
      {icon}
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

// ============================================================================
// PRIORITY BADGE
// ============================================================================

export interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityStyles: Record<string, { variant: any; icon: React.ReactNode }> = {
    LOW: { variant: 'outline', icon: <CheckCircle className="w-3 h-3" /> },
    MEDIUM: { variant: 'secondary', icon: <AlertCircle className="w-3 h-3" /> },
    HIGH: { variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
    CRITICAL: { variant: 'destructive', icon: <Zap className="w-3 h-3" /> },
  };

  const style = priorityStyles[priority];

  return (
    <Badge variant={style.variant} className="gap-1">
      {style.icon}
      {priority}
    </Badge>
  );
}

// ============================================================================
// METRIC CARD
// ============================================================================

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function MetricCard({ title, value, unit, description, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">
            {value}
            {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
          </div>
        </div>
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        {trend && (
          <div className={cn('text-xs font-semibold mt-2', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ACTIVITY CARD
// ============================================================================

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  action?: { label: string; href: string };
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
}

export function ActivityFeed({ items, title = 'Recent Activity' }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
              <div className="flex-shrink-0 text-muted-foreground">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(item.timestamp).toLocaleString()}</p>
                {item.action && (
                  <a href={item.action.href} className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    {item.action.label} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STAT ROW
// ============================================================================

export interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
}

export function StatRow({ label, value, unit, icon, highlighted }: StatRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-3 px-4 rounded-lg', highlighted ? 'bg-blue-50' : 'bg-gray-50')}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="font-bold text-lg">
        {value}
        {unit && <span className="text-xs ml-1 font-normal">{unit}</span>}
      </span>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="text-muted-foreground mb-4 scale-150">{icon}</div>}
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-2 text-center">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// STAT GRID
// ============================================================================

export interface StatGridProps {
  stats: StatRowProps[];
  columns?: number;
}

export function StatGrid({ stats, columns = 2 }: StatGridProps) {
  return (
    <div className={cn('grid gap-3', `grid-cols-${columns}`, 'md:grid-cols-3', 'lg:grid-cols-4')}>
      {stats.map((stat, idx) => (
        <StatRow key={idx} {...stat} />
      ))}
    </div>
  );
}

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

export interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'success' | 'warning' | 'danger' | 'info';
  showPercent?: boolean;
}

export function ProgressIndicator({
  value,
  max = 100,
  label,
  color = 'info',
  showPercent = true,
}: ProgressIndicatorProps) {
  const percent = (value / max) * 100;

  const colorClass = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  }[color];

  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          {showPercent && <span className="text-sm text-muted-foreground">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn('h-full transition-all', colorClass)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// ============================================================================
// ALERT BANNER
// ============================================================================

export interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}

export function AlertBanner({ type, title, message, action, onClose }: AlertBannerProps) {
  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
  }[type];

  const textColor = {
    info: 'text-blue-900',
    warning: 'text-yellow-900',
    error: 'text-red-900',
    success: 'text-green-900',
  }[type];

  const Icon =
    {
      info: AlertCircle,
      warning: AlertTriangle,
      error: AlertCircle,
      success: CheckCircle,
    }[type] || AlertCircle;

  return (
    <div className={cn('border rounded-lg p-4 flex items-start gap-4', bgColor)}>
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', textColor)} />
      <div className="flex-1">
        <h4 className={cn('font-semibold', textColor)}>{title}</h4>
        {message && <p className={cn('text-sm mt-1', textColor)}>{message}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium hover:underline"
          >
            {action.label}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
