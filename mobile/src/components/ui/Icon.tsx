import React from 'react';
import { LucideProps } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useCssElement } from 'react-native-css';

export function Icon({
  as: IconComponent,
  size = 24,
  color,
  className = '',
  ...props
}: { as: React.ElementType<LucideProps>; className?: string } & LucideProps) {
  // Use Text to allow color extraction, as View doesn't support text color properties natively
  const resolvedProps = useCssElement(Text, { className }, { className: "style" });
  const flattenedStyle = StyleSheet.flatten(resolvedProps.style) || {};
  
  // Extract the color from the resolved text style (e.g., text-blue-500)
  const resolvedColor = color || flattenedStyle.color || '#000';

  return (
    <IconComponent
      size={size}
      color={resolvedColor}
      style={flattenedStyle}
      {...props}
    />
  );
}
