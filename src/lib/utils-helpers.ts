/**
 * Utility Functions
 * Formatting, calculations, data transformations
 */

import { Complaint, Route } from '@/types';

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function formatDate(dateString: string, format: 'short' | 'long' | 'time' = 'short'): string {
  const date = new Date(dateString);

  if (format === 'time') {
    return date.toLocaleTimeString();
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(dateString, 'short');
}

export function getDaysFromNow(dateString: string): number {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(date.getTime() - now.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function snakeToPascal(str: string): string {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// DISTANCE & LOCATION UTILITIES
// ============================================================================

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinBounds(lat: number, lng: number, bounds: any): boolean {
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

// ============================================================================
// BUSINESS LOGIC UTILITIES
// ============================================================================

export function calculateComplaintAge(createdAt: string): string {
  const days = getDaysFromNow(createdAt);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function getComplaintSLA(priority: string): number {
  const slaMap: Record<string, number> = {
    LOW: 72, // 3 days
    MEDIUM: 48, // 2 days
    HIGH: 24, // 1 day
    CRITICAL: 4, // 4 hours
  };
  return slaMap[priority] || 72;
}

export function calculateRouteEfficiency(
  pickupsCompleted: number,
  pickupsScheduled: number,
  estimatedDuration: number,
  actualDuration: number
): number {
  const completionRate = (pickupsCompleted / pickupsScheduled) * 100;
  const timeEfficiency = (estimatedDuration / actualDuration) * 100;
  return Math.round((completionRate + timeEfficiency) / 2);
}

export function getWardStatusColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function calculateComplianceScore(violations: number, totalActions: number): number {
  if (totalActions === 0) return 100;
  return Math.max(0, 100 - (violations / totalActions) * 100);
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?1?\d{9,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// ============================================================================
// STATUS & COLOR MAPPING
// ============================================================================

export const STATUS_COLORS: Record<string, string> = {
  OPEN: '#ef4444',
  ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#10b981',
  CLOSED: '#6b7280',
  ESCALATED: '#dc2626',
  ACTIVE: '#10b981',
  IDLE: '#9ca3af',
  MAINTENANCE: '#ef4444',
  COMPLETED: '#10b981',
  FAILED: '#dc2626',
  PENDING: '#f59e0b',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#dc2626',
};

// ============================================================================
// EXPORT HELPERS OBJECT
// ============================================================================

export const Utils = {
  date: {
    format: formatDate,
    formatDateTime,
    getTimeAgo,
    getDaysFromNow,
  },
  number: {
    format: formatNumber,
    currency: formatCurrency,
    percentage: formatPercentage,
  },
  string: {
    truncate,
    capitalize,
    snakeToPascal,
    slug: generateSlug,
  },
  location: {
    distance: calculateDistance,
    withinBounds: isWithinBounds,
  },
  business: {
    complaintAge: calculateComplaintAge,
    sla: getComplaintSLA,
    routeEfficiency: calculateRouteEfficiency,
    wardColor: getWardStatusColor,
    complianceScore: calculateComplianceScore,
  },
  array: {
    groupBy,
    sortBy,
    unique,
    chunk,
  },
  validation: {
    email: isValidEmail,
    phone: isValidPhone,
    coordinate: isValidCoordinate,
  },
};
