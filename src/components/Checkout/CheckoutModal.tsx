import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Wallet,
  Truck,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Lock,
  RefreshCw,
  FileText,
  MessageCircle,
  Loader2,
  XCircle,
  Clock,
  Info,
  Upload,
  Ticket,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CartItem, ShippingAddressInfo, PaymentMethodType, CustomerOrder, MarketingConsent } from '../../types';
import { getCartItemPrice } from '../../utils/variantUtils';
import { generateUPILink, getQRCodeImageUrl, cleanAndSanitizeUPIId, isValidUPIIdFormat } from '../../utils/qrCode';
import { generateOrderWhatsAppLink } from '../../utils/whatsapp';
import { InvoiceModal } from '../Customer/InvoiceModal';
import { OpenBoxDeliveryBadge } from '../Common/OpenBoxDeliveryBadge';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import { calculateOrderTax } from '../../utils/taxUtils';
import {
  createRazorpayServerOrder,
  verifyRazorpayServerPayment,
  openRazorpayCheckoutModal,
} from '../../services/razorpayService';
import { db } from '../../lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: (orderId: string) => void;
}

export type CheckoutStep =
  | 'SHIPPING'
  | 'PAYMENT'
  | 'VERIFYING'
  | 'PAYMENT_FAILED'
  | 'SUCCESS';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
}) => {
  const {
    paymentSettings,
    customerProfile,
    customerUser,
    placeOrderAndPay,
    storeInfo,
    orders,
    updateCustomerMarketingConsent,
    coupons,
    validateCoupon,
    triggerGlobalCelebration,
  } = useStore();

  const [step, setStep] = useState<CheckoutStep>('SHIPPING');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Marketing consent state for checkout
  const [checkoutConsent, setCheckoutConsent] = useState<MarketingConsent>(() => {
    return customerProfile?.marketingConsent || { accepted: true, email: true, push: true, whatsApp: false, updatedAt: new Date().toISOString() };
  });

  // Verification progress animation state
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStageText, setVerificationStageText] = useState('Initiating Payment Verification...');
  const [failedReason, setFailedReason] = useState<string>('');

  // Created Order & Invoice Modal State
  const [createdOrder, setCreatedOrder] = useState<CustomerOrder | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Double-submit protection guard
  const isProcessingRef = useRef(false);
  const processedPaymentIdsRef = useRef<Set<string>>(new Set());

  // Address Form
  const [shippingInfo, setShippingInfo] = useState<ShippingAddressInfo>({
    name: customerProfile?.name || '',
    phone: customerProfile?.phoneNumber || '',
    email: customerProfile?.email || '',
    street: '',
    city: 'Bhilwara',
    state: 'Rajasthan',
    pincode: '311001',
    landmark: '',
  });

  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  // Coupon Promotion Engine states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<import('../../types').PromoCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [freeShippingPromo, setFreeShippingPromo] = useState(false);
  const [freeGiftPromo, setFreeGiftPromo] = useState<string | null>(null);

  // Payment Selection states (moved to top for Rules of Hooks compliance)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('ONLINE_UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string | null>(null);

  // Card details states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Netbanking / Wallet selection states
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Screenshot ref and upload state
  const screenshotFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  // Reset all state variables
  const resetCheckoutState = () => {
    setStep('SHIPPING');
    setSelectedMethod('ONLINE_UPI');
    setCopiedUPI(false);
    setIsSubmitting(false);
    setErrorMessage(null);
    setVerificationProgress(0);
    setVerificationStageText('Initiating Payment Verification...');
    setFailedReason('');
    setCreatedOrder(null);
    setShowInvoiceModal(false);
    setCompletedOrderId(null);
    setPaymentRef('');
    setPaymentScreenshotName(null);
    isProcessingRef.current = false;

    // Reset coupon states
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFreeShippingPromo(false);
    setFreeGiftPromo(null);
    setCouponSuccess(null);
    setCouponError(null);
    setCouponCodeInput('');
    
    // Clear any potential stored flags safely
    try {
      localStorage.removeItem('mfp_checkout_stale_success');
      localStorage.removeItem('mfp_last_order_id');
      localStorage.removeItem('mfp_payment_success');
      localStorage.removeItem('mfp_checkout_session');
      
      sessionStorage.removeItem('mfp_checkout_stale_success');
      sessionStorage.removeItem('mfp_last_order_id');
      sessionStorage.removeItem('mfp_payment_success');
      sessionStorage.removeItem('mfp_checkout_session');
    } catch {
      // ignore storage access restriction
    }
  };

  // Perform full validation check
  const verifySessionNow = async (): Promise<boolean> => {
    try {
      // 1. At least one valid product exists.
      if (!cartItems || cartItems.length === 0) {
        setErrorMessage('Your cart is empty. Please add products to proceed.');
        return false;
      }

      // 2. Check address completeness if we are beyond SHIPPING stage
      if (step !== 'SHIPPING') {
        if (
          !shippingInfo.name.trim() ||
          !shippingInfo.phone.trim() ||
          !shippingInfo.street.trim() ||
          !shippingInfo.pincode.trim()
        ) {
          setErrorMessage('Please complete all required shipping details first.');
          return false;
        }
      }

      // 3. Product still exists in Firestore and is in stock.
      for (const item of cartItems) {
        if (!item.product || !item.product.id) {
          setErrorMessage('Invalid product details found in checkout.');
          return false;
        }

        const prodRef = doc(db, 'products', item.product.id);
        const prodSnap = await getDoc(prodRef);

        if (!prodSnap.exists()) {
          setErrorMessage(`Product "${item.product.name}" no longer exists in our store.`);
          return false;
        }

        const liveProduct = prodSnap.data() as import('../../types').Product;

        if (liveProduct.status === 'hidden') {
          setErrorMessage(`Product "${liveProduct.name}" is currently unavailable.`);
          return false;
        }

        if (liveProduct.status === 'out_of_stock' || !liveProduct.inStock) {
          setErrorMessage(`Product "${liveProduct.name}" is out of stock.`);
          return false;
        }

        if (item.selectedSize && liveProduct.sizeStocks && liveProduct.sizeStocks.length > 0) {
          const sizeStock = liveProduct.sizeStocks.find((s) => s.size === item.selectedSize);
          if (sizeStock) {
            if (!sizeStock.inStock || !sizeStock.isAvailable) {
              setErrorMessage(`Size "${item.selectedSize}" for product "${liveProduct.name}" is out of stock.`);
              return false;
            }
            if (sizeStock.stockQuantity < item.quantity) {
              setErrorMessage(`Only ${sizeStock.stockQuantity} items available for "${liveProduct.name}" in size "${item.selectedSize}".`);
              return false;
            }
          }
        }
      }
      return true;
    } catch (err: any) {
      console.error('Session validation error:', err);
      setErrorMessage('Validation error: ' + (err.message || 'Could not verify product availability.'));
      return false;
    }
  };

  // Run validation and clean up on open/close
  useEffect(() => {
    if (!isOpen) {
      resetCheckoutState();
    } else {
      resetCheckoutState(); // Reset everything when first opened to clear stale state from any previous run
      const validateOnOpen = async () => {
        const ok = await verifySessionNow();
        if (!ok) {
          console.warn('Initial checkout validation failed');
        }
      };
      validateOnOpen();
    }
  }, [isOpen]);

  // Clean up on unmount as well
  useEffect(() => {
    return () => {
      resetCheckoutState();
    };
  }, []);

  // Reset and close checkout modal if user logs out
  useEffect(() => {
    if (isOpen && !customerUser) {
      resetCheckoutState();
      onClose();
    }
  }, [customerUser, isOpen]);

  // Security check to prevent users from manually forcing Step 4 success screen
  useEffect(() => {
    if (step === 'SUCCESS') {
      const verifySuccessState = async () => {
        if (!completedOrderId || !createdOrder || createdOrder.id !== completedOrderId) {
          console.error('Security Gate: success state accessed without valid completed order details.');
          setStep('SHIPPING');
          setErrorMessage('Access denied: Invalid or incomplete checkout session.');
          return;
        }

        try {
          const orderRef = doc(db, 'orders', completedOrderId);
          const orderSnap = await getDoc(orderRef);
          if (!orderSnap.exists()) {
            console.error('Security Gate: order document does not exist in Firestore.');
            setStep('SHIPPING');
            setErrorMessage('Access denied: Order document was not successfully created.');
          }
        } catch (e) {
          console.error('Security Gate: failed to verify order in Firestore', e);
          setStep('SHIPPING');
          setErrorMessage('Access denied: Unable to verify order status.');
        }
      };
      verifySuccessState();
    }
  }, [step, completedOrderId, createdOrder]);

  // Pre-fill address if customer has default saved address
  useEffect(() => {
    if (customerProfile?.savedAddresses && customerProfile.savedAddresses.length > 0) {
      const def = customerProfile.savedAddresses.find((a) => a.isDefault) || customerProfile.savedAddresses[0];
      setShippingInfo({
        name: def.name || customerProfile.name || '',
        phone: def.phone || customerProfile.phoneNumber || '',
        email: customerProfile.email || '',
        street: def.street || '',
        city: def.city || 'Bhilwara',
        state: def.state || 'Rajasthan',
        pincode: def.pincode || '311001',
        landmark: '',
      });
    } else if (customerProfile) {
      setShippingInfo((prev) => ({
        ...prev,
        name: customerProfile.name || prev.name,
        email: customerProfile.email || prev.email,
        phone: customerProfile.phoneNumber || prev.phone,
      }));
    }
  }, [customerProfile]);

  // Payment Selection
  // (States moved to top component header)

  // Card details
  // (States moved to top component header)

  // Netbanking / Wallet selection
  // (States moved to top component header)

  const handleApplyCoupon = (codeToApply: string) => {
    setCouponError(null);
    setCouponSuccess(null);

    if (!codeToApply.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const cleanCode = codeToApply.trim().toUpperCase();
    const result = validateCoupon(cleanCode, cartItems);

    if (result.valid) {
      const matchedCoupon = coupons.find(c => c.code.toUpperCase() === cleanCode)!;
      setAppliedCoupon(matchedCoupon);
      setDiscountAmount(result.discountAmount || 0);
      setFreeShippingPromo(!!result.freeShipping);
      setFreeGiftPromo(result.freeGift ? result.giftName || 'Special Gift Item' : null);

      let successMsg = `Coupon "${cleanCode}" applied successfully!`;
      if (result.discountAmount) successMsg += ` ₹${result.discountAmount} discount applied.`;
      if (result.freeShipping) successMsg += ` Free Shipping applied.`;
      if (result.freeGift) successMsg += ` Free Gift: "${result.giftName}" included!`;
      setCouponSuccess(successMsg);
      setCouponCodeInput(cleanCode);
    } else {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setFreeShippingPromo(false);
      setFreeGiftPromo(null);
      setCouponError(result.reason || 'Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFreeShippingPromo(false);
    setFreeGiftPromo(null);
    setCouponSuccess(null);
    setCouponError(null);
    setCouponCodeInput('');
  };

  // Auto-apply coupons if available, eligible and no coupon is manually applied
  useEffect(() => {
    if (isOpen && coupons && coupons.length > 0 && !appliedCoupon) {
      // Prioritize scratched coupon code if found in local storage
      let scratchedCode: string | null = null;
      try {
        scratchedCode = localStorage.getItem('mfp_scratched_coupon');
      } catch {}

      if (scratchedCode) {
        const valResult = validateCoupon(scratchedCode, cartItems);
        if (valResult.valid) {
          handleApplyCoupon(scratchedCode);
          try {
            localStorage.removeItem('mfp_scratched_coupon');
          } catch {}
          return;
        }
      }

      const autoCoupons = coupons.filter(c => c.status === 'active' && c.autoApply);
      let bestCoupon: import('../../types').PromoCoupon | null = null;
      let bestDiscount = -1;

      for (const coupon of autoCoupons) {
        const valResult = validateCoupon(coupon.code, cartItems);
        if (valResult.valid) {
          const disc = valResult.discountAmount || 0;
          if (disc > bestDiscount) {
            bestDiscount = disc;
            bestCoupon = coupon;
          }
        }
      }

      if (bestCoupon) {
        handleApplyCoupon(bestCoupon.code);
      }
    }
  }, [isOpen, coupons, cartItems]);

  if (!isOpen) return null;

  // Price calculations using centralized authoritative tax engine
  const subtotal = cartItems.reduce((acc, item) => acc + getCartItemPrice(item) * item.quantity, 0);
  const freeThreshold = paymentSettings.freeShippingMinAmount !== undefined ? paymentSettings.freeShippingMinAmount : 999;
  const isExplicitFreeShipping = Boolean(freeShippingPromo || appliedCoupon?.type === 'FREE_SHIPPING');

  const orderItemsForTax = cartItems.map(item => ({ product: item.product, quantity: item.quantity }));
  const taxResult = calculateOrderTax(
    orderItemsForTax,
    discountAmount,
    paymentSettings.flatShippingRate,
    paymentSettings,
    selectedMethod,
    isExplicitFreeShipping
  );

  const shippingFee = taxResult.deliveryCharge;
  const taxAmount = taxResult.totalTax;
  const taxableAmount = taxResult.taxableAmount;
  const cgstAmount = taxResult.cgstAmount;
  const sgstAmount = taxResult.sgstAmount;
  const igstAmount = taxResult.igstAmount;
  const convenienceFee = taxResult.convenienceFee;

  // Authoritative GST-inclusive payable amount: Subtotal - Discount + Delivery Fee + Convenience Fee
  const totalAmount = taxResult.grandTotal;

  // Manual QR / UPI amount is strictly ₹0 convenience fee
  const manualQrPayable = Math.max(0, subtotal - discountAmount + shippingFee);

  // Dynamic UPI Link & QR Image
  const dynamicOrderId = completedOrderId || `MFP${1025 + Math.floor(Math.random() * 8000)}`;
  const sanitizedUpiId = cleanAndSanitizeUPIId(paymentSettings.upiId);
  const isUpiValid = isValidUPIIdFormat(sanitizedUpiId);

  const upiLink = generateUPILink(
    sanitizedUpiId,
    paymentSettings.merchantName,
    manualQrPayable,
    dynamicOrderId
  );
  const qrImageUrl = getQRCodeImageUrl(upiLink, 320);

  const handleCopyUPI = () => {
    if (sanitizedUpiId) {
      navigator.clipboard.writeText(sanitizedUpiId);
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    }
  };

  // (Ref and upload state moved to top component header)

  const handleTriggerScreenshotPicker = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isUploadingScreenshot && screenshotFileInputRef.current) {
      screenshotFileInputRef.current.click();
    }
  };

  const handleScreenshotSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingScreenshot(true);
    try {
      await optimizeImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
      setPaymentScreenshotName(file.name);
      if (!paymentRef) {
        setPaymentRef(`IMG-${Date.now().toString().slice(-6)}`);
      }
    } catch (err) {
      console.warn('Screenshot upload fallback:', err);
      setPaymentScreenshotName(file.name);
      if (!paymentRef) {
        setPaymentRef(`IMG-${Date.now().toString().slice(-6)}`);
      }
    } finally {
      setIsUploadingScreenshot(false);
      if (screenshotFileInputRef.current) {
        screenshotFileInputRef.current.value = '';
      }
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !shippingInfo.name.trim() ||
      !shippingInfo.phone.trim() ||
      !shippingInfo.street.trim() ||
      !shippingInfo.pincode.trim()
    ) {
      setErrorMessage('Please complete all required shipping details before proceeding.');
      return;
    }

    setIsSubmitting(true);
    const ok = await verifySessionNow();
    setIsSubmitting(false);
    if (!ok) return;

    // Save marketing consent preference
    updateCustomerMarketingConsent(checkoutConsent);

    setStep('PAYMENT');
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Payment First, Order Next Verification Pipeline
   */
  const handleStartPaymentVerification = async (explicitPayId?: string) => {
    if (isProcessingRef.current || isSubmitting) return;

    setErrorMessage(null);
    setFailedReason('');
    isProcessingRef.current = true;
    setIsSubmitting(true);
    setStep('VERIFYING');
    setVerificationProgress(5);
    setVerificationStageText('Verifying live stock and product details...');

    // 1. Live stock and product exist checking in database
    const sessionOk = await verifySessionNow();
    if (!sessionOk) {
      setStep('SHIPPING');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    // 2. Validate Address completeness
    if (
      !shippingInfo.name.trim() ||
      !shippingInfo.phone.trim() ||
      !shippingInfo.street.trim() ||
      !shippingInfo.pincode.trim()
    ) {
      setErrorMessage('Please complete all required shipping details before proceeding.');
      setStep('SHIPPING');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    // 3. Validate payment method selected
    if (!selectedMethod) {
      setErrorMessage('Please select a payment method.');
      setStep('PAYMENT');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    // 4. Validate payment reference if manual QR / bank transfer is selected
    if ((selectedMethod === 'QR_SCAN' || selectedMethod === 'UPI') && !explicitPayId && !paymentRef.trim()) {
      setErrorMessage('Please enter 12-digit UTR Transaction Reference Number or upload screenshot.');
      setStep('PAYMENT');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    setVerificationProgress(20);
    setVerificationStageText('Connecting to Secure Gateway Node...');

    const targetRef = explicitPayId || paymentRef.trim() || `pay_${Date.now()}`;

    try {
      // Step 1: Gateway Handshake
      await new Promise((res) => setTimeout(res, 400));
      setVerificationProgress(40);
      setVerificationStageText('Validating Payment Reference & Signature Integrity...');

      // Step 2: Anti-Replay Check
      await new Promise((res) => setTimeout(res, 400));
      setVerificationProgress(70);
      setVerificationStageText('Checking Anti-Replay Ledger & Anti-Fraud Locks...');

      // Step 3: Execute Secure Verification & Order Placement
      await new Promise((res) => setTimeout(res, 400));
      setVerificationProgress(90);
      setVerificationStageText('Confirming Settlement Authorization...');

      const extraDetails = {
        cardNumber,
        cardExpiry,
        cardCvv,
        cardName,
        selectedBank,
        selectedWallet,
      };

      const res = await placeOrderAndPay(
        cartItems,
        shippingInfo,
        selectedMethod,
        {
          ...extraDetails,
          targetRef,
          subtotal,
          shippingFee,
        },
        appliedCoupon?.code || undefined,
        discountAmount,
        paymentSettings
      );

      if (res.success && res.orderId) {
        setVerificationProgress(100);
        setCompletedOrderId(res.orderId);

        // Find newly created order object for invoice & WhatsApp
        const matchedOrder = orders.find((o) => o.id === res.orderId) || {
          id: res.orderId,
          orderNumber: parseInt(res.orderId.replace('#MFP', ''), 10) || 1025,
          userId: customerProfile?.uid,
          customerName: shippingInfo.name,
          customerPhone: shippingInfo.phone,
          customerEmail: shippingInfo.email,
          shippingAddress: shippingInfo,
          items: cartItems,
          subtotal,
          shippingFee,
          discountAmount: discountAmount,
          taxAmount,
          totalAmount,
          paymentMethod: selectedMethod,
          paymentStatus: (selectedMethod === 'COD' || selectedMethod === 'QR_SCAN' || selectedMethod === 'UPI') ? 'PENDING' : 'PAID',
          orderStatus: 'PENDING',
          transactionId: `TXN-${Date.now()}`,
          paymentReference: targetRef,
          paymentTimestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as CustomerOrder;

        setCreatedOrder(matchedOrder);
        setStep('SUCCESS');
        triggerGlobalCelebration();
        onOrderComplete(res.orderId);
      } else {
        setFailedReason(res.message || 'Payment verification failed. Please verify your reference details.');
        setStep('PAYMENT_FAILED');
      }
    } catch (err: any) {
      console.error('Payment verification exception:', err);
      setFailedReason(err.message || 'An unexpected gateway error occurred during payment verification.');
      setStep('PAYMENT_FAILED');
    } finally {
      setIsSubmitting(false);
      isProcessingRef.current = false;
    }
  };

  /**
   * Launch Official Razorpay Payment Gateway Checkout or Fallback
   */
  const handleLaunchOfficialGatewayCheckout = async () => {
    // 1. Double-click / concurrent invocation guard
    if (isSubmitting || isProcessingRef.current) {
      return;
    }

    // 2. Cash on delivery or Manual Offline QR verification
    if (selectedMethod === 'COD' || selectedMethod === 'QR_SCAN') {
      await handleStartPaymentVerification();
      return;
    }

    isProcessingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 3. Pre-verify inventory & stock
      const isSessionValid = await verifySessionNow();
      if (!isSessionValid) {
        setIsSubmitting(false);
        isProcessingRef.current = false;
        return;
      }

      // 4. Create Authoritative Razorpay Order on the Server
      const orderData = await createRazorpayServerOrder({
        paymentMethod: selectedMethod,
        enableConvenienceFee: paymentSettings.enableConvenienceFee,
        convenienceFeePercent: paymentSettings.convenienceFeePercent,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: getCartItemPrice(item),
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        shippingInfo,
        couponCode: appliedCoupon?.code,
        discountAmount,
        flatShippingRate: paymentSettings.flatShippingRate ?? 0,
        freeShippingMinAmount: paymentSettings.freeShippingMinAmount ?? 999,
        shippingFee,
        subtotal,
        totalAmount,
        isFreeShipping: shippingFee === 0,
        notes: {
          store: 'Marudhar Fashion Point',
          customerName: shippingInfo.name,
          customerPhone: shippingInfo.phone,
        },
      });

      // 5. Pre-Launch Consistency Guard: Strict check before opening Razorpay modal
      const rzpAmountInRupees = orderData.amount / 100;
      const expectedAmount = totalAmount;
      if (Math.abs(rzpAmountInRupees - expectedAmount) > 0.01) {
        console.error(`[Razorpay Amount Mismatch Guard] Website displayed: ₹${expectedAmount}, Razorpay Order: ₹${rzpAmountInRupees} (${orderData.amount} paise)`);
        setErrorMessage(
          `पेमेंट राशि में अंतर (Pricing Mismatch): वेबसाइट पर ₹${expectedAmount} दिखाया गया है, लेकिन पेमेंट गेटवे ₹${rzpAmountInRupees} प्राप्त कर रहा है। सुरक्षा कारणों से पेमेंट रोक दी गई है।`
        );
        setIsSubmitting(false);
        isProcessingRef.current = false;
        return;
      }

      // 6. Open Razorpay Standard Checkout
      await openRazorpayCheckoutModal({
        orderId: orderData.orderId,
        amountInPaise: orderData.amount,
        keyId: orderData.keyId,
        customerName: shippingInfo.name,
        customerEmail: shippingInfo.email,
        customerPhone: shippingInfo.phone,
        themeColor: '#0B8F63',
        onSuccess: async (paymentResponse) => {
          // Idempotency: Prevent processing identical payment callback twice
          if (processedPaymentIdsRef.current.has(paymentResponse.razorpay_payment_id)) {
            return;
          }
          processedPaymentIdsRef.current.add(paymentResponse.razorpay_payment_id);

          try {
            setStep('VERIFYING');
            setVerificationProgress(35);
            setVerificationStageText('Cryptographically verifying Razorpay payment signature on secure server...');

            // Step 6: Cryptographic HMAC SHA256 Signature Verification via Server
            const verifyResult = await verifyRazorpayServerPayment({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              customerName: shippingInfo.name,
              customerEmail: shippingInfo.email,
              customerPhone: shippingInfo.phone,
              amount: totalAmount,
            });

            if (!verifyResult.verified || verifyResult.status !== 'PAID') {
              setFailedReason(verifyResult.message || 'Cryptographic payment verification failed on server.');
              setStep('PAYMENT_FAILED');
              setIsSubmitting(false);
              return;
            }

            setVerificationProgress(75);
            setVerificationStageText('Payment verified & captured! Finalizing order record in database...');

            // Step 6: Record Paid Order in Firestore
            const res = await placeOrderAndPay(
              cartItems,
              shippingInfo,
              'ONLINE_UPI',
              {
                targetRef: paymentResponse.razorpay_payment_id,
                subtotal,
                shippingFee,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              },
              appliedCoupon?.code || undefined,
              discountAmount,
              paymentSettings
            );

            if (res.success && res.orderId) {
              setVerificationProgress(100);
              setCompletedOrderId(res.orderId);

              const matchedOrder: CustomerOrder = orders.find((o) => o.id === res.orderId) || {
                id: res.orderId,
                orderNumber: parseInt(res.orderId.replace('#MFP', '').replace('ord_', ''), 10) || 1025,
                userId: customerProfile?.uid,
                customerName: shippingInfo.name,
                customerPhone: shippingInfo.phone,
                customerEmail: shippingInfo.email,
                shippingAddress: shippingInfo,
                items: cartItems,
                subtotal,
                shippingFee,
                discountAmount,
                convenienceFee,
                taxAmount,
                taxableAmount,
                cgstAmount,
                sgstAmount,
                igstAmount,
                totalAmount,
                paymentMethod: 'ONLINE_UPI',
                paymentStatus: 'PAID',
                paymentVerificationStatus: 'verified',
                orderStatus: 'PENDING',
                transactionId: paymentResponse.razorpay_payment_id,
                paymentReference: paymentResponse.razorpay_payment_id,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
                paymentTimestamp: new Date().toISOString(),
                couponCode: appliedCoupon?.code,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as CustomerOrder;

              setCreatedOrder(matchedOrder);
              setStep('SUCCESS');
              triggerGlobalCelebration();
              onOrderComplete(res.orderId);
            } else {
              setFailedReason(res.message || 'Payment received, but database write failed. Please contact store support.');
              setStep('PAYMENT_FAILED');
            }
          } catch (verifyErr: any) {
            console.error('Server signature verification exception:', verifyErr);
            setFailedReason(verifyErr.message || 'Security verification failed for Razorpay transaction.');
            setStep('PAYMENT_FAILED');
          } finally {
            setIsSubmitting(false);
            isProcessingRef.current = false;
          }
        },
        onFailure: (err) => {
          setIsSubmitting(false);
          isProcessingRef.current = false;
          setFailedReason(err?.message || 'Payment was declined or cancelled by the user.');
          setStep('PAYMENT_FAILED');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          isProcessingRef.current = false;
        },
      });
    } catch (err: any) {
      console.error('Razorpay checkout initiation error:', err);
      setIsSubmitting(false);
      isProcessingRef.current = false;
      setErrorMessage(err?.message || 'Unable to start Razorpay payment. Please check your connection or choose Cash on Delivery.');
    }
  };

  const handleOpenWhatsAppConfirmedOrder = () => {
    if (!createdOrder) return;
    const link = generateOrderWhatsAppLink(createdOrder);
    try {
      const opened = window.open(link, '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.location.href = link;
      }
    } catch {
      window.location.href = link;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-950/70 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-t-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-neutral-200/80 my-0 sm:my-auto flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-neutral-900 text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  सुरक्षित भुगतान
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                  <Lock className="w-2.5 h-2.5" /> 100% सुरक्षित
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-medium truncate">
                मरुधर फैशन पॉइंट • 100% सुरक्षित और एन्क्रिप्टेड
              </p>
            </div>
          </div>
          {step !== 'VERIFYING' && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="bg-neutral-50 px-4 sm:px-6 py-2.5 border-b border-neutral-200/80 flex items-center justify-between text-xs shrink-0 select-none">
          {/* 1. पता */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                step === 'SHIPPING'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {step === 'SHIPPING' ? '1' : <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span
              className={`font-semibold tracking-tight text-xs ${
                step === 'SHIPPING' ? 'text-neutral-900 font-bold' : 'text-neutral-700'
              }`}
            >
              पता
            </span>
          </div>

          <div
            className={`h-[1.5px] flex-1 mx-2 sm:mx-3 transition-colors ${
              step !== 'SHIPPING' ? 'bg-emerald-600' : 'bg-neutral-200'
            }`}
          />

          {/* 2. भुगतान */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                step === 'PAYMENT'
                  ? 'bg-amber-800 text-white ring-2 ring-amber-800/20 shadow-xs'
                  : step === 'VERIFYING' || step === 'PAYMENT_FAILED' || step === 'SUCCESS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {step === 'VERIFYING' || step === 'PAYMENT_FAILED' || step === 'SUCCESS' ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : (
                '2'
              )}
            </span>
            <span
              className={`font-semibold tracking-tight text-xs ${
                step === 'PAYMENT'
                  ? 'text-amber-900 font-bold'
                  : step === 'VERIFYING' || step === 'PAYMENT_FAILED' || step === 'SUCCESS'
                  ? 'text-neutral-700'
                  : 'text-neutral-400'
              }`}
            >
              भुगतान
            </span>
          </div>

          <div
            className={`h-[1.5px] flex-1 mx-2 sm:mx-3 transition-colors ${
              step === 'VERIFYING' || step === 'PAYMENT_FAILED' || step === 'SUCCESS'
                ? 'bg-emerald-600'
                : 'bg-neutral-200'
            }`}
          />

          {/* 3. सत्यापन */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                step === 'VERIFYING'
                  ? 'bg-amber-800 text-white animate-pulse ring-2 ring-amber-800/20'
                  : step === 'PAYMENT_FAILED'
                  ? 'bg-rose-600 text-white'
                  : step === 'SUCCESS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {step === 'SUCCESS' ? <Check className="w-3 h-3 stroke-[3]" /> : '3'}
            </span>
            <span
              className={`font-semibold tracking-tight text-xs ${
                step === 'VERIFYING'
                  ? 'text-amber-900 font-bold'
                  : step === 'PAYMENT_FAILED'
                  ? 'text-rose-700 font-bold'
                  : step === 'SUCCESS'
                  ? 'text-neutral-700'
                  : 'text-neutral-400'
              }`}
            >
              सत्यापन
            </span>
          </div>

          <div
            className={`h-[1.5px] flex-1 mx-2 sm:mx-3 transition-colors ${
              step === 'SUCCESS' ? 'bg-emerald-600' : 'bg-neutral-200'
            }`}
          />

          {/* 4. पुष्टि */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                step === 'SUCCESS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {step === 'SUCCESS' ? <Check className="w-3 h-3 stroke-[3]" /> : '4'}
            </span>
            <span
              className={`font-semibold tracking-tight text-xs ${
                step === 'SUCCESS' ? 'text-emerald-800 font-bold' : 'text-neutral-400'
              }`}
            >
              पुष्टि
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1">

        {/* STEP 1: SHIPPING ADDRESS */}
        {step === 'SHIPPING' && (
          <form onSubmit={handleShippingSubmit} className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              डिलीवरी का पता • Shipping & Delivery Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1 font-medium">पूरा नाम • Full Name *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">मोबाइल नंबर • Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  placeholder="+91 98290 12345"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-600 mb-1 font-medium">ईमेल • Email Address *</label>
                <input
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-600 mb-1 font-medium">
                  मकान नं. व गली / पता • House / Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.street}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                  placeholder="House No. 12, Main Market Road"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">शहर / जिला • City / District *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">राज्य • State *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">पिन कोड • PIN Code *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.pincode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                  placeholder="311001"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">
                  नजदीकी स्थान • Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={shippingInfo.landmark}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, landmark: e.target.value })}
                  placeholder="Near Clock Tower"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Optional Customer Marketing Consent Section */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 mt-4 text-xs">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkoutConsent.email || checkoutConsent.push || checkoutConsent.whatsApp}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setCheckoutConsent({ accepted: checked, email: checked, push: checked, whatsApp: checked, updatedAt: new Date().toISOString() });
                  }}
                  className="mt-0.5 w-4 h-4 text-amber-600 border-neutral-300 rounded focus:ring-amber-500"
                />
                <span className="font-bold text-neutral-900 leading-snug">
                  ☑ I would like to receive exclusive offers, new arrivals, festival deals, and important updates.
                </span>
              </label>

              {(checkoutConsent.email || checkoutConsent.push || checkoutConsent.whatsApp) && (
                <div className="pt-2 border-t border-amber-200/60 flex flex-wrap gap-4 text-[11px] text-neutral-700 font-medium">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutConsent.email}
                      onChange={(e) => setCheckoutConsent({ ...checkoutConsent, email: e.target.checked })}
                      className="w-3.5 h-3.5 text-amber-600 rounded"
                    />
                    <span>📧 Email</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutConsent.push}
                      onChange={(e) => setCheckoutConsent({ ...checkoutConsent, push: e.target.checked })}
                      className="w-3.5 h-3.5 text-amber-600 rounded"
                    />
                    <span>🔔 Website Push</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutConsent.whatsApp}
                      onChange={(e) => setCheckoutConsent({ ...checkoutConsent, whatsApp: e.target.checked })}
                      className="w-3.5 h-3.5 text-emerald-600 rounded"
                    />
                    <span className="text-emerald-800 font-bold">💬 WhatsApp VIP</span>
                  </label>
                </div>
              )}
            </div>

            {/* 🎟️ ENTERPRISE COUPON PROMOTION BOX */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3.5 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-neutral-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Ticket className="w-4 h-4 text-emerald-600" />
                  <span>Promo Codes & Coupons</span>
                </h4>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Remove Coupon
                  </button>
                )}
              </div>

              {/* Input Form */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase placeholder-neutral-400 outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-75 disabled:bg-neutral-100"
                />
                {!appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponCodeInput)}
                    className="bg-neutral-900 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    Apply
                  </button>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Applied</span>
                  </div>
                )}
              </div>

              {/* Feedback messages */}
              {couponError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-medium text-rose-800 flex items-start gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{couponError}</span>
                </div>
              )}
              {couponSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{couponSuccess}</span>
                </div>
              )}

              {/* Available Coupons & Intelligent Recommendation engine */}
              {coupons && coupons.filter(c => c.status === 'active' && c.visibility === 'public').length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                    Recommended Deals For You
                  </div>
                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                    {coupons
                      .filter(c => c.status === 'active' && c.visibility === 'public')
                      .map((coupon) => {
                        const check = validateCoupon(coupon.code, cartItems);
                        const isCurrentlyApplied = appliedCoupon?.code === coupon.code;
                        
                        return (
                          <div
                            key={coupon.id}
                            onClick={() => !isCurrentlyApplied && handleApplyCoupon(coupon.code)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isCurrentlyApplied
                                ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500'
                                : check.valid
                                ? 'bg-neutral-50/60 hover:bg-neutral-50 border-neutral-200 hover:border-emerald-500'
                                : 'bg-neutral-50/30 opacity-70 border-neutral-100 hover:border-neutral-200 cursor-not-allowed'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-extrabold text-[10px] bg-neutral-100 border border-neutral-300 text-neutral-800 px-1.5 py-0.2 rounded uppercase">
                                  {coupon.code}
                                </span>
                                {coupon.featured && (
                                  <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1 rounded uppercase">
                                    ★ Featured
                                  </span>
                                )}
                              </div>
                              <div className="font-bold text-neutral-800 text-[10px]">{coupon.name}</div>
                              {coupon.description && (
                                <div className="text-[9px] text-neutral-600 font-medium leading-snug">{coupon.description}</div>
                              )}
                              
                              {/* Detailed real-time eligibility feedback */}
                              {!check.valid && check.reason && (
                                <div className="text-[9px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                                  <Info className="w-3 h-3 text-amber-500" />
                                  <span>{check.reason}</span>
                                </div>
                              )}
                              {check.valid && !isCurrentlyApplied && (
                                <div className="text-[9px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>Eligible - Click to Apply!</span>
                                </div>
                              )}
                              {isCurrentlyApplied && (
                                <div className="text-[9px] font-extrabold text-emerald-700 mt-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 animate-pulse" />
                                  <span>Active Promo Applied</span>
                                </div>
                              )}
                            </div>

                            {/* Badge showing potential savings */}
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-extrabold text-[#0B8F63] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                                {coupon.type === 'PERCENTAGE' && `${coupon.discountValue}% OFF`}
                                {coupon.type === 'FLAT' && `₹${coupon.discountValue} OFF`}
                                {coupon.type === 'BUY_X_GET_Y' && `B${coupon.discountValue}G1`}
                                {coupon.type === 'FREE_SHIPPING' && `FREE DEL`}
                                {coupon.type === 'FREE_GIFT' && `GIFT`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="mt-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>कुल मूल्य • Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-semibold text-neutral-900">₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>कूपन छूट • Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              {freeGiftPromo && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>मुफ्त उपहार • Free Promo Gift</span>
                  <span>🎁 {freeGiftPromo}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>डिलीवरी शुल्क • Delivery Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span>मुफ्त • FREE</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        {isExplicitFreeShipping
                          ? 'कूपन • Coupon'
                          : (subtotal - discountAmount) >= freeThreshold
                          ? '₹999+ ऑर्डर'
                          : 'स्टोर ऑफर'}
                      </span>
                    </span>
                  ) : (
                    <span className="font-semibold text-neutral-900 font-mono">₹{shippingFee}</span>
                  )}
                </span>
              </div>
              {convenienceFee > 0 ? (
                <div className="flex justify-between text-amber-900 font-medium">
                  <span>सुविधा शुल्क • Convenience Fee ({paymentSettings.convenienceFeePercent ?? 2}%)</span>
                  <span className="font-mono font-bold">
                    +₹{convenienceFee % 1 === 0 ? convenienceFee.toLocaleString('en-IN') : convenienceFee.toFixed(2)}
                  </span>
                </div>
              ) : (
                paymentSettings.enableConvenienceFee !== false && (
                  <div className="flex justify-between text-neutral-600">
                    <span>सुविधा शुल्क • Convenience Fee</span>
                    <span className="text-emerald-700 font-semibold">₹0</span>
                  </div>
                )
              )}
              {taxResult.gstEnabled && (
                <div className="flex justify-between text-neutral-500 text-[11px] pt-1 border-t border-dashed border-neutral-200">
                  <span>जीएसटी • GST ({taxResult.gstRate}%)</span>
                  <span className="text-neutral-500 font-medium">कीमत में शामिल • Included in Price (₹{taxAmount.toLocaleString('en-IN')})</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200 text-sm">
                <span>कुल भुगतान राशि • Total Payable</span>
                <span className="text-amber-800 font-extrabold text-base font-mono">
                  ₹{totalAmount % 1 === 0 ? totalAmount.toLocaleString('en-IN') : totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Open Box Delivery Feature Badge */}
            <OpenBoxDeliveryBadge cartItems={cartItems} totalAmount={totalAmount} variant="checkout" />

            <button
              type="submit"
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <span>भुगतान के लिए आगे बढ़ें • Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: PAYMENT METHOD */}
        {step === 'PAYMENT' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  भुगतान का तरीका चुनें
                </h3>
                <p className="text-[11px] text-neutral-500 font-medium">
                  100% सुरक्षित और तेज़ ऑनलाइन या कैश भुगतान
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('SHIPPING')}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-neutral-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>पता बदलें (Edit)</span>
              </button>
            </div>

            {/* Selectable Payment Method Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {paymentSettings.enableUPI !== false && (
                <div
                  onClick={() => setSelectedMethod('ONLINE_UPI')}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedMethod === 'ONLINE_UPI' || selectedMethod === 'CARD'
                      ? 'border-neutral-900 bg-neutral-50/90 shadow-xs ring-1 ring-neutral-900/10'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        selectedMethod === 'ONLINE_UPI' || selectedMethod === 'CARD'
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                          UPI / ऑनलाइन भुगतान
                        </h4>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-1.5 py-0.2 rounded">
                          Fast &amp; Safe
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                        Google Pay • PhonePe • Paytm • Cards
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedMethod === 'ONLINE_UPI' || selectedMethod === 'CARD'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {(selectedMethod === 'ONLINE_UPI' || selectedMethod === 'CARD') && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                </div>
              )}

              {paymentSettings.enableCOD !== false && (
                <div
                  onClick={() => setSelectedMethod('COD')}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedMethod === 'COD'
                      ? 'border-neutral-900 bg-neutral-50/90 shadow-xs ring-1 ring-neutral-900/10'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        selectedMethod === 'COD'
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                        कैश ऑन डिलीवरी
                      </h4>
                      <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                        डिलीवरी के समय भुगतान करें
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedMethod === 'COD'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {selectedMethod === 'COD' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              )}

              {paymentSettings.enableQR === true && paymentSettings.gatewayProvider !== 'RAZORPAY' && (
                <div
                  onClick={() => setSelectedMethod('QR_SCAN')}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedMethod === 'QR_SCAN' || selectedMethod === 'UPI'
                      ? 'border-neutral-900 bg-neutral-50/90 shadow-xs ring-1 ring-neutral-900/10'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        selectedMethod === 'QR_SCAN' || selectedMethod === 'UPI'
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                        बैंक ट्रांसफर / QR
                      </h4>
                      <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                        मैनुअल भुगतान • UTR सत्यापन
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedMethod === 'QR_SCAN' || selectedMethod === 'UPI'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {(selectedMethod === 'QR_SCAN' || selectedMethod === 'UPI') && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TAB CONTENT: ONLINE UPI / RAZORPAY STANDARD GATEWAY (Compact Professional Trust Card) */}
            {(selectedMethod === 'ONLINE_UPI' || selectedMethod === 'CARD') && (
              <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-xs sm:text-sm">Razorpay सुरक्षित भुगतान</span>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-600 bg-white border border-neutral-200 px-2 py-0.5 rounded-md">
                    100% Encrypted
                  </span>
                </div>

                <p className="text-neutral-600 text-xs leading-relaxed">
                  UPI, Cards, Net Banking और Wallets से सुरक्षित भुगतान करें.
                </p>

                <div className="pt-2 border-t border-neutral-200/70 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>सुरक्षित भुगतान</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>तुरंत भुगतान सत्यापन</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>UPI और Cards समर्थित</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MANUAL OFFLINE QR SCAN */}
            {(selectedMethod === 'QR_SCAN' || selectedMethod === 'UPI') && (
              <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200/90 space-y-5">
                {paymentSettings.paymentEnabled === false ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-medium">
                    Online payments are temporarily paused by store administration. Please select
                    Cash on Delivery or another method.
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong>Manual Offline Transfer:</strong> Scan the QR code or send payment to the merchant UPI ID. After completing payment in your bank app, enter your 12-digit UTR below. An administrator will verify the payment before dispatch.
                      </p>
                    </div>

                    {/* 1. Large UPI QR Code Displayed Prominently */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-200/80 text-center shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-100 pb-2.5">
                        <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-amber-700" />
                          Manual Bank UPI QR
                        </span>
                        <span className="font-extrabold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 text-xs">
                          Amount: ₹{totalAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Prominent Large QR Code Card */}
                      <div className="inline-block p-3.5 bg-gradient-to-b from-white to-amber-50/30 rounded-2xl border-2 border-amber-300/80 shadow-md my-1">
                        <img
                          src={paymentSettings.qrCodeCustomImage || qrImageUrl}
                          alt="Manual UPI QR Code"
                          className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-xl bg-white p-1 border border-neutral-100"
                        />
                        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-amber-950 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>{paymentSettings.merchantName || 'Marudhar Fashion Point'}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-500 font-medium">
                        Scan with GPay, PhonePe, Paytm, BHIM or any Banking UPI App
                      </p>
                    </div>

                    {/* 2. UPI ID below QR Code with Copy Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white rounded-xl border border-neutral-200/90 gap-3 shadow-sm">
                      <div className="text-left w-full sm:w-auto">
                        <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider block">
                          Merchant UPI ID
                        </span>
                        <span className="font-mono font-bold text-sm text-neutral-900 select-all">
                          {sanitizedUpiId || 'Not Configured'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className="w-full sm:w-auto px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
                      >
                        {copiedUPI ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Clear 5-Step Instructions */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200/90 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-700" />
                        Step-by-Step Payment Instructions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] text-neutral-700">
                        <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 space-y-0.5">
                          <div className="font-extrabold text-amber-800 text-[10px] uppercase">Step 1</div>
                          <p className="leading-snug font-semibold text-neutral-800">Scan the QR Code.</p>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 space-y-0.5">
                          <div className="font-extrabold text-amber-800 text-[10px] uppercase">Step 2</div>
                          <p className="leading-snug font-semibold text-neutral-800">Complete the payment.</p>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 space-y-0.5">
                          <div className="font-extrabold text-amber-800 text-[10px] uppercase">Step 3</div>
                          <p className="leading-snug font-semibold text-neutral-800">Return to the website.</p>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 space-y-0.5">
                          <div className="font-extrabold text-amber-800 text-[10px] uppercase">Step 4</div>
                          <p className="leading-snug font-semibold text-neutral-800">Enter UTR / Ref Number (or upload screenshot).</p>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 space-y-0.5">
                          <div className="font-extrabold text-amber-800 text-[10px] uppercase">Step 5</div>
                          <p className="leading-snug font-semibold text-neutral-800">Wait for payment verification.</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 Verification Details: UTR Input & Optional Screenshot Upload */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200/90 space-y-3">
                      <div>
                        <label className="block text-xs text-neutral-900 mb-1 font-bold flex items-center justify-between">
                          <span>Enter UTR / Transaction Reference Number *</span>
                          <span className="text-[10px] font-normal text-neutral-500">12-Digit Banking Ref</span>
                        </label>
                        <input
                          type="text"
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder="Enter 12-digit UTR (e.g. 420918239012)"
                          className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                        />
                      </div>

                      {/* Optional Screenshot Upload */}
                      <div className="pt-1 border-t border-neutral-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-neutral-600 font-medium">
                            Optional Payment Screenshot:
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              ref={screenshotFileInputRef}
                              id="payment-screenshot-file-input"
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                              onChange={handleScreenshotSelect}
                              onClick={(e) => e.stopPropagation()}
                              className="sr-only opacity-0 absolute w-0 h-0 pointer-events-none -z-10"
                              tabIndex={-1}
                              aria-hidden="true"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTriggerScreenshotPicker();
                              }}
                              disabled={isUploadingScreenshot}
                              className="cursor-pointer px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              {isUploadingScreenshot ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-amber-700" />
                                  <span>{paymentScreenshotName ? 'Change Screenshot' : 'Upload Screenshot'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        {paymentScreenshotName && (
                          <div className="mt-1.5 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Attached: {paymentScreenshotName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT: COD */}
            {selectedMethod === 'COD' && (
              <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-3.5 sm:p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs sm:text-sm">
                  <Truck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>कैश ऑन डिलीवरी (COD)</span>
                </div>
                <p className="text-neutral-600 leading-relaxed text-[11px] sm:text-xs">
                  डिलीवरी के समय कूरियर एजेंट को ₹{totalAmount.toLocaleString()} का भुगतान नकद या मोबाइल यूपीआई स्कैनर द्वारा करें।
                </p>
              </div>
            )}

            {/* Compact Premium Order Total Card */}
            <div className="bg-neutral-50/90 rounded-xl border border-neutral-200/80 p-3.5 sm:p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-mono font-medium text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <span>Delivery</span>
                  {shippingFee === 0 && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded font-medium">
                      {isExplicitFreeShipping
                        ? 'Coupon FREE'
                        : (subtotal - discountAmount) >= freeThreshold
                        ? '₹999+ Free'
                        : 'Store Offer'}
                    </span>
                  )}
                </div>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    <span className="font-mono font-medium text-neutral-900">₹{shippingFee}</span>
                  )}
                </span>
              </div>

              {convenienceFee > 0 ? (
                <div className="flex justify-between items-center text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <span>Convenience Fee ({paymentSettings.convenienceFeePercent ?? 2}%)</span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.2 rounded font-medium">
                      Online Payment
                    </span>
                  </div>
                  <span className="font-mono font-bold">
                    +₹{convenienceFee % 1 === 0 ? convenienceFee.toLocaleString('en-IN') : convenienceFee.toFixed(2)}
                  </span>
                </div>
              ) : (
                paymentSettings.enableConvenienceFee !== false && (
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Convenience Fee</span>
                    <span className="text-emerald-700 font-semibold">₹0</span>
                  </div>
                )
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-medium">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span className="font-mono font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {freeGiftPromo && (
                <div className="flex justify-between items-center text-emerald-700 text-[11px] font-medium">
                  <span>Free Gift Promo</span>
                  <span className="font-semibold">🎁 {freeGiftPromo}</span>
                </div>
              )}

              {taxResult.gstEnabled && (
                <div className="flex justify-between items-center text-neutral-500 text-[11px] pt-1.5 border-t border-dashed border-neutral-200">
                  <span>GST ({taxResult.gstRate}%)</span>
                  <span className="text-neutral-500">कीमत में शामिल (Included in price)</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2.5 border-t border-neutral-200/90 text-sm">
                <span className="font-bold text-neutral-900">Total Payable</span>
                <span className="font-bold text-base sm:text-lg text-neutral-900 font-mono tracking-tight">
                  ₹{totalAmount % 1 === 0 ? totalAmount.toLocaleString('en-IN') : totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Open Box Delivery Feature Badge */}
            <OpenBoxDeliveryBadge cartItems={cartItems} totalAmount={totalAmount} paymentMethod={selectedMethod} variant="checkout" />

            {/* Sticky Bottom CTA Container */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-4 sm:px-6 border-t border-neutral-200/80 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 mt-4">
              <button
                type="button"
                onClick={handleLaunchOfficialGatewayCheckout}
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${
                  selectedMethod === 'COD'
                    ? 'bg-amber-800 hover:bg-amber-900 text-white'
                    : 'bg-neutral-900 hover:bg-black text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>कृपया प्रतीक्षा करें... (Processing)</span>
                  </>
                ) : selectedMethod === 'COD' ? (
                  <>
                    <Truck className="w-4 h-4 text-amber-300" />
                    <span>ऑर्डर कन्फर्म करें (COD) • ₹{totalAmount.toLocaleString()}</span>
                  </>
                ) : selectedMethod === 'QR_SCAN' ? (
                  <>
                    <QrCode className="w-4 h-4 text-emerald-300" />
                    <span>UTR सत्यापन के लिए भेजें • ₹{totalAmount.toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Razorpay से भुगतान करें • ₹{totalAmount.toLocaleString()}</span>
                  </>
                )}
              </button>
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 font-medium">
                <Lock className="w-2.5 h-2.5 text-neutral-400" />
                <span>100% सुरक्षित और एन्क्रिप्टेड भुगतान • Marudhar Fashion Point</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFYING PAYMENT (LIVE ANIMATED STAGE) */}
        {step === 'VERIFYING' && (
          <div className="p-10 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-amber-200 rounded-full" />
              <div
                className="absolute inset-0 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"
              />
              <ShieldCheck className="w-8 h-8 text-amber-700" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Verifying Payment Status
              </span>
              <h3 className="text-lg font-serif font-bold text-neutral-900">
                {verificationStageText}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Please do not close or refresh this page. We are securely validating your transaction
                reference with the banking network.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto space-y-1.5">
              <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-700 h-full transition-all duration-300 ease-out"
                  style={{ width: `${verificationProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-600 font-medium font-mono">
                <span>Verification Stage</span>
                <span>{verificationProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3.1: PAYMENT VERIFICATION FAILED */}
        {step === 'PAYMENT_FAILED' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                Payment Verification Failed
              </span>
              <h3 className="text-lg font-serif font-bold text-neutral-900">
                Order Placement Prevented
              </h3>
              <p className="text-xs text-red-600 font-semibold mt-2 max-w-md mx-auto bg-red-50 p-3 rounded-xl border border-red-200">
                {failedReason}
              </p>
              <p className="text-[11px] text-neutral-500 mt-2 max-w-md mx-auto">
                Your order has <strong>NOT</strong> been placed and no inventory was deducted. Please check your transaction reference or choose another payment method.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('PAYMENT')}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment Verification</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('COD');
                  setStep('PAYMENT');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Switch to Pay on Delivery</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1">
                Payment Verified & Order Confirmed
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">
                Thank You For Your Order!
              </h3>
              <p className="text-sm font-bold text-amber-900 mt-1">
                Order ID: {completedOrderId}
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                Your payment was verified successfully. Inventory has been locked and your order is queued for processing.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-neutral-600">
                <span>Customer:</span>
                <span className="font-semibold text-neutral-900">{shippingInfo.name}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Total Paid:</span>
                <span className="font-bold text-emerald-700">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Payment Mode:</span>
                <span className="font-semibold text-neutral-800">{selectedMethod}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Address:</span>
                <span className="font-medium text-neutral-800 text-right max-w-[200px]">
                  {shippingInfo.street}, {shippingInfo.city}, {shippingInfo.pincode}
                </span>
              </div>
              {createdOrder?.isOpenBoxDelivery && (
                <div className="flex justify-between items-center text-[#0B8F63] font-bold pt-1 border-t border-neutral-200">
                  <span>Open Box Delivery:</span>
                  <span className="bg-[#0B8F63]/10 px-2 py-0.5 rounded text-[11px] border border-[#0B8F63]/20">
                    📦 Enabled (Inspect Before OTP)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons Post Verification */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span>View / Print Invoice</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppConfirmedOrder}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-4 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        </div>
      </div>

      {/* Invoice Modal Popup */}
      {showInvoiceModal && createdOrder && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          order={createdOrder}
          storeInfo={storeInfo}
        />
      )}
    </div>
  );
};
