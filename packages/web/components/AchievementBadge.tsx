'use client';

import React from 'react';
import { Achievement } from '@istqb-app/shared';
import { useTranslation } from '@/lib/useTranslation';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ 
  achievement, 
  unlocked = false, 
  unlockedAt,
  size = 'md' 
}: AchievementBadgeProps) {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const iconSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex">
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full flex items-center justify-center
            transition-all duration-300
            ${unlocked
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/50 border-2 border-yellow-300'
              : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 opacity-60 grayscale'
            }
          `}
          title={achievement.name}
        >
          <span className={iconSizeClasses[size]}>
            {achievement.icon || '🏆'}
          </span>
        </div>
        {unlocked && (
          <div className="absolute -top-2 -right-2 text-2xl filter drop-shadow-lg">
            👑
          </div>
        )}
      </div>
      {size !== 'sm' && (
        <div className="mt-3 text-center max-w-xs">
          <div className={`text-sm font-medium ${unlocked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'}`}>
            {achievement.name}
          </div>
          {achievement.description && size === 'lg' && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {achievement.description}
            </div>
          )}
          {unlockedAt && size === 'lg' && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
              ✓ {t('achievements.unlocked')} - {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
