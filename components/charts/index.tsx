/**
 * Chart Components using Recharts
 * Real-time operational dashboards
 */

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// ============================================================================
// LINE CHART - TRENDS
// ============================================================================

export interface TrendChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  description?: string;
  lineColor?: string;
  height?: number;
}

export function TrendChart({
  data,
  title,
  description,
  lineColor = '#3b82f6',
  height = 300,
}: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MULTI-LINE CHART
// ============================================================================

export interface MultiLineChartProps {
  data: Record<string, unknown>[];
  title: string;
  description?: string;
  lines: Array<{ dataKey: string; color: string; name: string }>;
  height?: number;
}

export function MultiLineChart({
  data,
  title,
  description,
  lines,
  height = 300,
}: MultiLineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Legend />
            {lines.map((line, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// BAR CHART
// ============================================================================

export interface BarChartProps {
  data: Record<string, unknown>[];
  title: string;
  description?: string;
  dataKey: string;
  barColor?: string;
  height?: number;
}

export function BarChartComponent({
  data,
  title,
  description,
  dataKey,
  barColor = '#3b82f6',
  height = 300,
}: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Bar dataKey={dataKey} fill={barColor} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PIE CHART
// ============================================================================

export interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  description?: string;
  height?: number;
}

export function PieChartComponent({ data, title, description, height = 300 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPARISON CHART
// ============================================================================

export interface ComparisonChartProps {
  data: Array<{ name: string; actual: number; target: number }>;
  title: string;
  description?: string;
  height?: number;
}

export function ComparisonChart({
  data,
  title,
  description,
  height = 300,
}: ComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Legend />
            <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[8, 8, 0, 0]} />
            <Bar dataKey="target" fill="#10b981" name="Target" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DISTRIBUTION SCATTER CHART
// ============================================================================

export interface ScatterChartProps {
  data: Array<{ x: number; y: number; name?: string }>;
  title: string;
  description?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}

export function DistributionScatterChart({
  data,
  title,
  description,
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis',
  height = 300,
}: ScatterChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name={xAxisLabel} stroke="#666" />
            <YAxis type="number" dataKey="y" name={yAxisLabel} stroke="#666" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Data Points" data={data} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STACKED BAR CHART
// ============================================================================

export interface StackedBarChartProps {
  data: Record<string, unknown>[];
  title: string;
  description?: string;
  dataKeys: Array<{ key: string; color: string; name: string }>;
  height?: number;
}

export function StackedBarChart({
  data,
  title,
  description,
  dataKeys,
  height = 300,
}: StackedBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Legend />
            {dataKeys.map((item, idx) => (
              <Bar
                key={idx}
                dataKey={item.key}
                stackId="a"
                fill={item.color}
                name={item.name}
                radius={idx === 0 ? [8, 8, 0, 0] : []}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GAUGE CHART (Simple Progress-based)
// ============================================================================

export interface GaugeChartProps {
  title: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
  height?: number;
}

export function GaugeChart({
  title,
  value,
  max = 100,
  unit = '%',
  color = '#3b82f6',
  height = 250,
}: GaugeChartProps) {
  const percent = (value / max) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="relative w-32 h-32 mb-4">
          <svg width="100%" height="100%" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={`${(percent / 100) * 314} 314`}
              transform="rotate(-90 60 60)"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{unit}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
