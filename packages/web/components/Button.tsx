'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = React.memo(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/25',
    secondary: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm shadow-red-600/20 hover:shadow-md hover:shadow-red-600/25',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-600/25',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-xl
        font-semibold
        transition-all
        duration-200
        active:scale-[0.98]
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});
