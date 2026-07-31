import React from 'react';
import {
  Package,
  ShieldCheck,
  Box,
  CheckCircle2,
  Truck,
  Eye,
  Lock,
  Award,
  Sparkles,
} from 'lucide-react';
import { OpenBoxDeliveryConfig, Product, CartItem, PaymentMethodType } from '../../types';
import { useStore } from '../../context/StoreContext';
import { isOpenBoxDeliveryApplicable } from '../../utils/openBoxDeliveryUtils';

interface OpenBoxDeliveryBadgeProps {
  config?: OpenBoxDeliveryConfig;
  product?: Product;
  cartItems?: CartItem[];
  totalAmount?: number;
  paymentMethod?: PaymentMethodType;
  variant?: 'full' | 'compact' | 'checkout' | 'inline' | 'banner';
  className?: string;
}

export const OpenBoxDeliveryBadge: React.FC<OpenBoxDeliveryBadgeProps> = ({
  config: propConfig,
  product,
  cartItems,
  totalAmount,
  paymentMethod,
  variant = 'full',
  className = '',
}) => {
  const { openBoxDeliveryConfig } = useStore();
  const activeConfig = propConfig || openBoxDeliveryConfig;

  if (!activeConfig || !activeConfig.enabled) return null;

  // Check eligibility if product or cartItems provided
  if (product || cartItems || totalAmount !== undefined || paymentMethod) {
    const isApplicable = isOpenBoxDeliveryApplicable({
      config: activeConfig,
      cartItems,
      product,
      totalAmount,
      paymentMethod,
    });
    if (!isApplicable) return null;
  }

  const renderIcon = (iconName: string, iconClass: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck className={iconClass} />;
      case 'box':
        return <Box className={iconClass} />;
      case 'check':
        return <CheckCircle2 className={iconClass} />;
      case 'truck':
        return <Truck className={iconClass} />;
      case 'eye':
        return <Eye className={iconClass} />;
      case 'lock':
        return <Lock className={iconClass} />;
      case 'award':
        return <Award className={iconClass} />;
      case 'package':
      default:
        return <Package className={iconClass} />;
    }
  };

  // Badge Color Style
  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-500 text-white';
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'indigo':
        return 'bg-indigo-600 text-white';
      case 'purple':
        return 'bg-purple-600 text-white';
      case 'rose':
        return 'bg-rose-600 text-white';
      case 'dark':
        return 'bg-neutral-900 text-white';
      case 'emerald':
      default:
        return 'bg-[#0B8F63] text-white';
    }
  };

  // Background Style
  const getBgContainerStyle = (bg: string) => {
    switch (bg) {
      case 'amber-light':
        return 'bg-amber-50/90 border-amber-200/90 text-amber-950';
      case 'blue-light':
        return 'bg-blue-50/90 border-blue-200/90 text-blue-950';
      case 'neutral-light':
        return 'bg-neutral-50/90 border-neutral-200 text-neutral-900';
      case 'dark-slate':
        return 'bg-neutral-900 border-neutral-800 text-white';
      case 'emerald-light':
      default:
        return 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950';
    }
  };

  // Border Style
  const getBorderStyle = (border: string) => {
    switch (border) {
      case 'solid':
        return 'border';
      case 'dotted':
        return 'border-2 border-dotted';
      case 'none':
        return 'border-0';
      case 'dashed':
      default:
        return 'border-2 border-dashed';
    }
  };

  // Text Color Accent
  const getTextColorStyle = (tc: string) => {
    switch (tc) {
      case 'dark':
        return 'text-neutral-900 font-bold';
      case 'emerald':
        return 'text-[#0B8F63] font-bold';
      case 'amber':
        return 'text-amber-800 font-bold';
      case 'indigo':
        return 'text-indigo-800 font-bold';
      case 'default':
      default:
        return '';
    }
  };

  const badgeColorClass = getBadgeStyle(activeConfig.badgeColor);
  const containerBgClass = getBgContainerStyle(activeConfig.backgroundColor);
  const borderClass = getBorderStyle(activeConfig.borderStyle);
  const textColorClass = getTextColorStyle(activeConfig.textColor);

  // Variant 1: Compact (pill tag for headers / list items / cards)
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs transition-all ${containerBgClass} ${borderClass} ${className}`}
      >
        <span className={`p-1 rounded-full ${badgeColorClass}`}>
          {renderIcon(activeConfig.icon, 'w-3 h-3')}
        </span>
        <span className={`truncate max-w-[200px] ${textColorClass}`}>
          {activeConfig.heading || 'Open Box Delivery'}
        </span>
      </div>
    );
  }

  // Variant 2: Inline / Banner (Single-line row with icon and description)
  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${containerBgClass} ${borderClass} ${className}`}
      >
        <span className={`p-1.5 rounded-lg shrink-0 ${badgeColorClass}`}>
          {renderIcon(activeConfig.icon, 'w-3.5 h-3.5')}
        </span>
        <div className="min-w-0 flex-1">
          <span className={`font-bold block text-[11px] leading-tight ${textColorClass}`}>
            {activeConfig.heading}
          </span>
          {activeConfig.description && (
            <span className="text-[10px] opacity-80 block truncate">
              {activeConfig.description}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant 3: Checkout (Highlighted badge card for payment & checkout screens)
  if (variant === 'checkout') {
    return (
      <div
        className={`p-3.5 rounded-xl transition-all shadow-xs ${containerBgClass} ${borderClass} ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 shadow-sm ${badgeColorClass}`}>
            {renderIcon(activeConfig.icon, 'w-4 h-4')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className={`text-xs font-bold tracking-tight ${textColorClass}`}>
                {activeConfig.heading || 'Open Box Delivery Available'}
              </h4>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
                Verified
              </span>
            </div>
            <p className="text-[11px] leading-snug opacity-90">
              {activeConfig.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Variant 4: Banner (Promotional top card)
  if (variant === 'banner') {
    return (
      <div
        className={`relative overflow-hidden p-3 rounded-2xl ${containerBgClass} ${borderClass} ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl ${badgeColorClass} shrink-0`}>
              {renderIcon(activeConfig.icon, 'w-4 h-4')}
            </div>
            <div>
              <span className={`text-xs font-bold block ${textColorClass}`}>
                {activeConfig.heading}
              </span>
              <p className="text-[10px] opacity-85 leading-tight line-clamp-1">
                {activeConfig.description}
              </p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
        </div>
      </div>
    );
  }

  // Default Full Card (Product page / Order details card)
  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl transition-all shadow-xs ${containerBgClass} ${borderClass} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl shrink-0 shadow-sm ${badgeColorClass}`}>
          {renderIcon(activeConfig.icon, 'w-5 h-5')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={`text-xs sm:text-sm font-bold tracking-tight ${textColorClass}`}>
              {activeConfig.heading || 'Open Box Delivery Available'}
            </h4>
            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white tracking-wider">
              100% Safe
            </span>
          </div>
          <p className="text-[11px] sm:text-xs leading-snug opacity-90">
            {activeConfig.description}
          </p>
        </div>
      </div>
    </div>
  );
};
