import { OpenBoxDeliveryConfig, Product, CartItem, PaymentMethodType } from '../types';

export interface EvaluationParams {
  config: OpenBoxDeliveryConfig;
  product?: Product | null;
  cartItems?: CartItem[] | null;
  totalAmount?: number | null;
  paymentMethod?: PaymentMethodType | string | null;
}

/**
 * Checks whether Open Box Delivery applies to a product, cart, or order context.
 */
export function isOpenBoxDeliveryApplicable({
  config,
  product,
  cartItems,
  totalAmount,
  paymentMethod,
}: EvaluationParams): boolean {
  if (!config || !config.enabled) return false;

  // 1. Check Minimum Order Value
  if (totalAmount !== undefined && totalAmount !== null && config.minOrderValue > 0) {
    if (totalAmount < config.minOrderValue) return false;
  }

  // 2. Check Payment Eligibility
  if (paymentMethod && config.paymentEligibility && config.paymentEligibility !== 'all') {
    const isCod = paymentMethod === 'COD';
    if (config.paymentEligibility === 'cod_only' && !isCod) return false;
    if (config.paymentEligibility === 'prepaid_only' && isCod) return false;
  }

  // 3. Check Scope (All / Categories / Products)
  if (config.applicabilityScope === 'categories') {
    if (config.applicableCategoryIds && config.applicableCategoryIds.length > 0) {
      if (product) {
        if (!config.applicableCategoryIds.includes(product.category)) return false;
      } else if (cartItems && cartItems.length > 0) {
        const hasMatchingCategory = cartItems.some((item) =>
          config.applicableCategoryIds.includes(item.product.category)
        );
        if (!hasMatchingCategory) return false;
      }
    }
  } else if (config.applicabilityScope === 'products') {
    if (config.applicableProductIds && config.applicableProductIds.length > 0) {
      if (product) {
        if (!config.applicableProductIds.includes(product.id)) return false;
      } else if (cartItems && cartItems.length > 0) {
        const hasMatchingProduct = cartItems.some((item) =>
          config.applicableProductIds.includes(item.product.id)
        );
        if (!hasMatchingProduct) return false;
      }
    }
  }

  return true;
}
