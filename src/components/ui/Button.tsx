'use client';

import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'danger' | 'ghost' | 'dark';

const styles: Record<Variant, string> = {
  primary:
    'bg-apple-accent text-white hover:bg-blue-700 active:scale-95 shadow-sm',
  danger: 'bg-apple-danger text-white hover:bg-red-700 active:scale-95 shadow-sm',
  dark: 'bg-apple-text text-white hover:bg-gray-800 active:scale-95 shadow-sm',
  ghost:
    'bg-transparent text-apple-accent border border-apple-accent/40 hover:bg-apple-accent/10 active:scale-95',
};

export const Button: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ variant = 'primary', className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`}
    />
  );
};
