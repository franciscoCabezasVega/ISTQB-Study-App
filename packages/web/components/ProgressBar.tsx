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
  blue: 'bg-gradient-to-r from-indigo-500 to-blue-500',
  green: 'bg-gradient-to-r from-emerald-500 to-green-400',
  red: 'bg-gradient-to-r from-red-500 to-rose-400',
  yellow: 'bg-gradient-to-r from-amber-500 to-yellow-400',
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
    <div className="w-full min-h-[64px] flex flex-col justify-center">
      {label && <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${progressValue}%`, animation: 'progress-fill 0.8s ease-out' }}
        />
      </div>
    </div>
  );
};
