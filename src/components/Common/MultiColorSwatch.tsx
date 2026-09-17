import React from 'react';

export interface MultiColorSwatchProps {
  colorObj: {
    name: string;
    hex?: string;
    isMultiColor?: boolean;
    colorComponents?: Array<{ name: string; hex: string } | string>;
  };
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MultiColorSwatch: React.FC<MultiColorSwatchProps> = ({
  colorObj,
  size = 'md',
  isSelected = false,
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }[size];

  // Extract component colors
  const components = colorObj.colorComponents || [];
  const isMulti = colorObj.isMultiColor || components.length > 1;

  let backgroundStyle: React.CSSProperties = {};

  if (isMulti && components.length > 0) {
    const count = components.length;
    const step = 360 / count;
    const gradStops: string[] = [];
    
    components.forEach((comp, idx) => {
      const hex = typeof comp === 'string' ? (comp.startsWith('#') ? comp : '#000000') : (comp.hex || '#000000');
      const startDeg = idx * step;
      const endDeg = (idx + 1) * step;
      gradStops.push(`${hex} ${startDeg}deg ${endDeg}deg`);
    });

    backgroundStyle = {
      background: `conic-gradient(${gradStops.join(', ')})`,
    };
  } else {
    const singleHex = colorObj.hex || (components.length > 0 ? (typeof components[0] === 'string' ? components[0] : components[0].hex) : '#000000');
    backgroundStyle = {
      backgroundColor: singleHex.startsWith('#') ? singleHex : '#000000',
    };
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={colorObj.name}
      aria-label={colorObj.name}
      className={`relative rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center ${sizeClasses} ${
        isSelected ? 'ring-2 ring-emerald-600 ring-offset-2 scale-110 shadow-md' : 'hover:scale-105 border border-black/15 shadow-sm'
      } ${className}`}
      style={backgroundStyle}
    >
      {isSelected && (
        <span className="absolute inset-0 rounded-full border-2 border-white pointer-events-none" />
      )}
    </button>
  );
};
