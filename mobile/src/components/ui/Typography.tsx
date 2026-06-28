import React from 'react';
import { Text as TWText } from '../../tw';

export function H1({ className = '', children, ...props }: React.ComponentProps<typeof TWText>) {
  return (
    <TWText className={`text-3xl font-extrabold text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </TWText>
  );
}

export function H2({ className = '', children, ...props }: React.ComponentProps<typeof TWText>) {
  return (
    <TWText className={`text-2xl font-bold text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </TWText>
  );
}

export function P({ className = '', children, ...props }: React.ComponentProps<typeof TWText>) {
  return (
    <TWText className={`text-base text-slate-600 leading-relaxed ${className}`} {...props}>
      {children}
    </TWText>
  );
}

export function Muted({ className = '', children, ...props }: React.ComponentProps<typeof TWText>) {
  return (
    <TWText className={`text-sm text-slate-400 ${className}`} {...props}>
      {children}
    </TWText>
  );
}
