'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = React.memo(({ children, className = '' }) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800/90
        rounded-2xl
        shadow-md dark:shadow-gray-950/30
        border border-gray-100 dark:border-gray-700/50
        p-6
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-0.5
        h-full
        flex flex-col
        min-h-[200px]
        backdrop-blur-sm
        ${className}
      `}
      style={{
        contentVisibility: 'auto',
        contain: 'layout style paint',
      }}
    >
      {children}
    </div>
  );
});
