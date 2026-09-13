import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'text' | 'rect' | 'circle' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  variant = 'rect',
  className = '',
  style,
  ...rest
}) => {
  const getRadius = () => {
    if (borderRadius !== undefined) return borderRadius;
    switch (variant) {
      case 'circle': return '50%';
      case 'text': return '4px';
      case 'card': return '12px';
      case 'rect':
      default: return '8px';
    }
  };

  const getDefaultHeight = () => {
    if (height !== undefined) return height;
    switch (variant) {
      case 'text': return '1rem';
      case 'circle': return width || '40px';
      case 'card': return '140px';
      case 'rect':
      default: return '2rem';
    }
  };

  return (
    <div
      className={`rpg-skeleton ${className}`}
      style={{
        width: width ?? '100%',
        height: getDefaultHeight(),
        borderRadius: getRadius(),
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
};
