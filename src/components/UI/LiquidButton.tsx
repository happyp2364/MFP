import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'emerald' | 'dark' | 'gold' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  style,
  ...props
}) => {
  const { buttonThemeConfig } = useStore();
  const cfg = buttonThemeConfig;

  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!cfg.enableRipple || disabled || isLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev.slice(-3), { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  // Border Radius class
  const radiusClass = cfg.borderRadius || 'rounded-2xl';

  // Sizing styles
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] gap-1',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base gap-2.5',
    xl: 'px-8 py-4 text-base sm:text-lg gap-3',
  }[size];

  // Variant base style overrides
  const variantClasses = {
    emerald: 'btn-liquid-emerald',
    dark: 'btn-liquid-dark',
    gold: 'btn-liquid-gold',
    ghost: 'btn-liquid-ghost',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-700 text-white border border-white/20 shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-red-600',
    outline:
      'bg-transparent border-2 border-[#0B8F63] text-[#0B8F63] hover:bg-[#0B8F63]/10 shadow-sm',
  }[variant];

  // Custom inline style overrides if admin customized primary colors
  const customInlineStyles: React.CSSProperties = {
    borderRadius:
      cfg.borderRadius === 'rounded-full'
        ? '9999px'
        : cfg.borderRadius === 'rounded-3xl'
        ? '1.5rem'
        : cfg.borderRadius === 'rounded-2xl'
        ? '1rem'
        : cfg.borderRadius === 'rounded-xl'
        ? '0.75rem'
        : '0.5rem',
    ...style,
  };

  if (variant === 'emerald' && cfg.primaryColor && cfg.primaryColor !== '#0B8F63') {
    customInlineStyles.background = `linear-gradient(135deg, ${cfg.primaryColor} 0%, ${cfg.primaryColor}dd 100%)`;
  }

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      style={customInlineStyles}
      className={`btn-liquid-base ${radiusClass} ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${
        cfg.enableHoverAnimation ? 'hover:scale-[1.02]' : ''
      } ${className}`}
    >
      {/* Liquid Shimmer Light Reflection Overlay */}
      {cfg.enableLiquidHighlight && (
        <span className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-80" />
        </span>
      )}

      {/* Dynamic Pointer Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute bg-white/40 rounded-full animate-ping pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: r.x,
            top: r.y,
            width: 40,
            height: 40,
          }}
        />
      ))}

      {/* Loading Spinner */}
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}

      <span className="relative z-10 font-extrabold tracking-tight whitespace-nowrap">
        {children}
      </span>

      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
