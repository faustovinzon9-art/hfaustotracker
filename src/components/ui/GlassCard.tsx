import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-morphism rounded-apple p-6 transition-all duration-300 ${className} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      {children}
    </div>
  );
};
