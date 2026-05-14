'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Animated Card with hover effect
export const AnimatedCard = ({
  children,
  className = '',
  delay = 0,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
    whileTap={{ scale: 0.98 }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// Animated Metric Card with number animation
export const AnimatedMetricCard = ({
  title,
  value,
  icon,
  delay = 0,
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  delay?: number;
}) => (
  <AnimatedCard delay={delay} className="p-6 bg-white rounded-lg border border-slate-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-slate-600 font-medium">{title}</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="text-3xl font-bold text-slate-900 mt-2"
        >
          {typeof value === 'number' ? (
            <CountUp value={value} />
          ) : (
            value
          )}
        </motion.div>
      </div>
      <div className="text-slate-400">{icon}</div>
    </div>
  </AnimatedCard>
);

// Animated Counter
export const CountUp = ({ value }: { value: number }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const duration = 1000;
    const interval = duration / value;
    const timer = setInterval(() => {
      setCount((prev) => (prev < value ? prev + 1 : value));
    }, interval);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

// Animated Table Row
export const AnimatedTableRow = ({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.02)' }}
    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
  >
    {children}
  </motion.tr>
);

// Animated Badge
export const AnimatedBadge = ({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'danger' | 'success';
}) => {
  const variants = {
    default: 'bg-blue-50 text-blue-800',
    secondary: 'bg-slate-100 text-slate-800',
    danger: 'bg-red-50 text-red-800',
    success: 'bg-green-50 text-green-800',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </motion.span>
  );
};

// Animated Button
export const AnimatedButton = ({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  isLoading = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  disabled?: boolean;
  isLoading?: boolean;
}) => {
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 text-slate-900 hover:bg-slate-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
        className="inline-block"
      >
        {isLoading ? '⏳' : children}
      </motion.div>
    </motion.button>
  );
};

// Animated Loading Skeleton
export const SkeletonLoader = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
}: {
  width?: string;
  height?: string;
  className?: string;
}) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={`${width} ${height} bg-slate-200 rounded ${className}`}
  />
);

// Skeleton Grid
export const SkeletonGrid = ({
  count = 4,
  columns = 4,
}: {
  count?: number;
  columns?: number;
}) => (
  <div className={`grid grid-cols-${columns} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-6 bg-white rounded-lg border border-slate-200">
        <SkeletonLoader height="h-8" className="mb-4" />
        <SkeletonLoader height="h-4" className="mb-2" />
        <SkeletonLoader height="h-4" width="w-2/3" />
      </div>
    ))}
  </div>
);

// Animated Page Transition
export const PageTransition = ({
  children,
}: {
  children: ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Animated Success Message
export const AnimatedSuccess = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
  >
    <motion.span
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.5 }}
      className="text-xl"
    >
      ✓
    </motion.span>
    <span className="text-green-800 font-medium">{message}</span>
  </motion.div>
);

// Animated Error Message
export const AnimatedError = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
  >
    <motion.span
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 0.5 }}
      className="text-xl"
    >
      ✕
    </motion.span>
    <span className="text-red-800 font-medium">{message}</span>
  </motion.div>
);

// Staggered Container
export const StaggerContainer = ({
  children,
  staggerDelay = 0.05,
}: {
  children: React.ReactElement[];
  staggerDelay?: number;
}) => (
  <motion.div>
    {React.Children.map(children, (child, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * staggerDelay }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// Animated Dialog Overlay
export const AnimatedDialogOverlay = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// Animated Form Input
export const AnimatedFormInput = ({
  value,
  onChange,
  placeholder = '',
  error = false,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  icon?: any;
}) => (
  <motion.div
    animate={error ? { x: [0, -5, 5, 0] } : {}}
    transition={{ duration: 0.3 }}
    className="relative"
  >
    {Icon && <div className="absolute left-3 top-3 text-slate-400">{<Icon size={18} />}</div>}
    <motion.input
      whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.1)' }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-${Icon ? '10' : '4'} py-2 border rounded-lg transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-slate-900'} focus:outline-none`}
    />
  </motion.div>
);
