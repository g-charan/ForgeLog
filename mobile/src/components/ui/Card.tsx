import React from 'react';
import { View, Text } from '../../tw';

export function Card({ className = '', children, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${className}`} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ className = '', children, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View className={`mb-4 ${className}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ className = '', children, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={`text-xl font-bold text-slate-900 ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function CardDescription({ className = '', children, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={`text-slate-500 text-sm mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </Text>
  );
}
