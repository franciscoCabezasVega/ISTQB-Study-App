'use client';

import React from 'react';

interface ProgressBarProps {
  current?: number;
  total?: number;
  progress?: number; // 0-100
  label?: string;
  percentage?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  progress: progressProp,
  label = '',
  percentage: _percentage = false,
  color = 'blue',
}) => {
  let progressValue: number;

  if (progressProp !== undefined) {
    // Si se pasa progress directo (0-100)
    progressValue = progressProp;
  } else if (current !== undefined && total !== undefined) {
    // Si se pasan current y total
    progressValue = (current / total) * 100;
  } else {
    progressValue = 0;
  }

  return (
    <div className="w-full">
      {label && <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>}
      <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all duration-300`}
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>
  );
};
