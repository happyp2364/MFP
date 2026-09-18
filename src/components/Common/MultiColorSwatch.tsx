import React from 'react';
import { PRESET_COLOR_PALETTE } from '../../utils/productCategoryDefaults';

export interface MultiColorSwatchProps {
  colorObj: {
    name: string;
    hex?: string;
    isMultiColor?: boolean;
    colorComponents?: Array<{ name: string; hex: string } | string>;
    colorComponentHexes?: string[];
  };
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Canonical map for resolving preset color hexes by name reliably
const CANONICAL_COLOR_MAP: Record<string, string> = {
  ...PRESET_COLOR_PALETTE.reduce((acc, p) => ({ ...acc, [p.name.toLowerCase().trim()]: p.hex }), {}),
  black: '#000000',
  white: '#FFFFFF',
  blue: '#1E40AF',
  'navy blue': '#1E3A8A',
  grey: '#6B7280',
  gray: '#6B7280',
  brown: '#78350F',
  tan: '#D97706',
  green: '#15803D',
  maroon: '#800000',
  red: '#DC2626',
  olive: '#556B2F',
  yellow: '#EAB308',
  orange: '#F97316',
  pink: '#EC4899',
  purple: '#9333EA',
};

function resolveComponentHex(comp: { name: string; hex: string } | string, fallbackHex?: string): string {
  if (typeof comp === 'string') {
    const trimmed = comp.trim();
    if (trimmed.startsWith('#')) return trimmed;
    const lower = trimmed.toLowerCase();
    if (CANONICAL_COLOR_MAP[lower]) return CANONICAL_COLOR_MAP[lower];
    return fallbackHex || '#0B8F63';
  }
  if (comp && typeof comp === 'object') {
    if (comp.hex && comp.hex.startsWith('#')) return comp.hex;
    if (comp.name) {
      const lower = comp.name.toLowerCase().trim();
      if (CANONICAL_COLOR_MAP[lower]) return CANONICAL_COLOR_MAP[lower];
    }
  }
  return fallbackHex || '#0B8F63';
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

  // Extract component colors & hexes robustly
  const components = colorObj.colorComponents || [];
  const hexes = colorObj.colorComponentHexes || [];
  const isMulti = colorObj.isMultiColor || components.length > 1 || hexes.length > 1 || (colorObj.name && colorObj.name.includes('+'));

  let backgroundStyle: React.CSSProperties = {};

  if (isMulti) {
    // Determine the list of component names/objects
    let compList: Array<{ name: string; hex: string } | string> = components;
    if (compList.length === 0 && colorObj.name) {
      compList = colorObj.name.split('+').map(s => s.trim());
    }

    const count = Math.max(compList.length, hexes.length, 2);
    const step = 360 / count;
    const gradStops: string[] = [];

    for (let i = 0; i < count; i++) {
      let resolvedHex = '#000000';
      if (hexes[i] && hexes[i].startsWith('#')) {
        resolvedHex = hexes[i];
      } else if (compList[i]) {
        resolvedHex = resolveComponentHex(compList[i]);
      } else {
        resolvedHex = '#6B7280';
      }

      const startDeg = i * step;
      const endDeg = (i + 1) * step;
      gradStops.push(`${resolvedHex} ${startDeg}deg ${endDeg}deg`);
    }

    backgroundStyle = {
      background: `conic-gradient(${gradStops.join(', ')})`,
    };
  } else {
    const singleHex = colorObj.hex || (hexes[0] && hexes[0].startsWith('#') ? hexes[0] : (components.length > 0 ? resolveComponentHex(components[0]) : '#000000'));
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
      className={`relative rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center shrink-0 ${sizeClasses} ${
        isSelected ? 'ring-2 ring-emerald-600 ring-offset-2 scale-110 shadow-md' : 'hover:scale-105 border border-black/20 shadow-sm'
      } ${className}`}
      style={backgroundStyle}
    >
      {isSelected && (
        <span className="absolute inset-0 rounded-full border-2 border-white pointer-events-none shadow-inner" />
      )}
    </button>
  );
};

