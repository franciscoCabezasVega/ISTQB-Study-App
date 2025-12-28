import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Skeleton para Card
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md ${className}`}>
      <Skeleton height={24} className="mb-4" width="60%" />
      <Skeleton height={16} className="mb-2" width="100%" />
      <Skeleton height={16} className="mb-2" width="90%" />
      <Skeleton height={16} width="70%" />
    </div>
  );
};

// Skeleton para estadísticas
export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
      <Skeleton height={16} className="mb-2" width="70%" />
      <Skeleton height={40} width="50%" />
    </div>
  );
};

// Skeleton para pregunta
export const QuestionSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
      <Skeleton height={20} className="mb-4" width="40%" />
      <Skeleton height={24} className="mb-6" width="90%" />
      
      {/* Opciones */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-3">
          <Skeleton height={48} width="100%" />
        </div>
      ))}
      
      <div className="mt-6 flex justify-end">
        <Skeleton height={40} width={120} />
      </div>
    </div>
  );
};

// Skeleton para logro
export const AchievementSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1">
          <Skeleton height={20} className="mb-2" width="60%" />
          <Skeleton height={16} width="80%" />
        </div>
      </div>
    </div>
  );
};

// Skeleton para barra de progreso
export const ProgressBarSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
      <div className="flex justify-between mb-2">
        <Skeleton height={20} width="40%" />
        <Skeleton height={20} width="15%" />
      </div>
      <Skeleton height={24} width="100%" />
    </div>
  );
};

export default Skeleton;
