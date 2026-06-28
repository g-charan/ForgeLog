import React from 'react';
import { ActivityIndicator } from 'react-native';
import { TouchableOpacity, Text, View } from '../../tw';

export interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  label: string;
  loading?: boolean;
}

export function Button({
  variant = 'default',
  size = 'default',
  label,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-xl font-medium transition-opacity';
  
  const variants = {
    default: 'bg-blue-600 active:bg-blue-700',
    outline: 'border border-slate-300 bg-white active:bg-slate-50',
    ghost: 'bg-transparent active:bg-slate-100',
  };

  const sizes = {
    default: 'px-4 py-3 min-h-[48px]',
    sm: 'px-3 py-2 min-h-[36px] text-sm',
    lg: 'px-6 py-4 min-h-[56px] text-lg',
  };

  const textVariants = {
    default: 'text-white font-semibold',
    outline: 'text-slate-700 font-semibold',
    ghost: 'text-slate-700 font-medium',
  };

  const opacityClass = disabled || loading ? 'opacity-50' : 'opacity-100';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${opacityClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'default' ? '#fff' : '#000'} className="mr-2" />
      ) : null}
      <Text className={`${textVariants[variant]}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
