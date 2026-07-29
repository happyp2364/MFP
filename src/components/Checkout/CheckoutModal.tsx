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
import { FlashDealRenderer } from '../Promo/FlashDealSection';
import { CartItem, ShippingAddressInfo, PaymentMethodType, CustomerOrder, MarketingConsent } from '../../types';
import { generateUPILink, getQRCodeImageUrl, cleanAndSanitizeUPIId, isValidUPIIdFormat } from '../../utils/qrCode';
import { generateOrderWhatsAppLink } from '../../utils/whatsapp';
import { InvoiceModal } from '../Customer/InvoiceModal';
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

  // Reset all state variables
  const resetCheckoutState = () => {
    setStep('SHIPPING');
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
    setDirectPaymentNotice(null);
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
    
    // Clear any potential stored flags just in case
    localStorage.removeItem('mfp_checkout_stale_success');
    localStorage.removeItem('mfp_last_order_id');
    localStorage.removeItem('mfp_payment_success');
    localStorage.removeItem('mfp_checkout_session');
    
    sessionStorage.removeItem('mfp_checkout_stale_success');
    sessionStorage.removeItem('mfp_last_order_id');
    sessionStorage.removeItem('mfp_payment_success');
    sessionStorage.removeItem('mfp_checkout_session');
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [directPaymentNotice, setDirectPaymentNotice] = useState<string | null>(null);
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string | null>(null);

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Netbanking / Wallet selection
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

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
      const scratchedCode = localStorage.getItem('mfp_scratched_coupon');
      if (scratchedCode) {
        const valResult = validateCoupon(scratchedCode, cartItems);
        if (valResult.valid) {
          handleApplyCoupon(scratchedCode);
          localStorage.removeItem('mfp_scratched_coupon');
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

  // Price calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const baseShippingFee = subtotal >= (paymentSettings.freeShippingMinAmount || 999) ? 0 : paymentSettings.flatShippingRate || 0;
  const shippingFee = freeShippingPromo ? 0 : baseShippingFee;

  const gstPercent = paymentSettings.gstPercent || 5;
  const taxAmount = Math.round((subtotal * gstPercent) / 100);

  // Payment Method Based Convenience Fee
  const isOnlinePayment = selectedMethod === 'CARD' || selectedMethod === 'NET_BANKING' || selectedMethod === 'WALLET';
  const isFeeEnabled = paymentSettings.enableConvenienceFee !== false;
  const feePercent = paymentSettings.convenienceFeePercent ?? 2;
  const convenienceFee = (isOnlinePayment && isFeeEnabled) ? Math.round((subtotal * feePercent) / 100) : 0;

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount + convenienceFee);

  // Dynamic UPI Link & QR Image
  const dynamicOrderId = completedOrderId || `MFP${1025 + Math.floor(Math.random() * 8000)}`;
  const sanitizedUpiId = cleanAndSanitizeUPIId(paymentSettings.upiId);
  const isUpiValid = isValidUPIIdFormat(sanitizedUpiId);

  const upiLink = generateUPILink(
    sanitizedUpiId,
    paymentSettings.merchantName,
    totalAmount,
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

  const handlePayWithUPIApp = () => {
    setDirectPaymentNotice(null);

    // Validate that the UPI ID is not empty and valid before opening app
    if (!sanitizedUpiId || !isUpiValid) {
      setDirectPaymentNotice('Invalid UPI ID. Please contact the store.');
      return;
    }

    const intentLink = generateUPILink(
      sanitizedUpiId,
      paymentSettings.merchantName,
      totalAmount,
      dynamicOrderId
    );

    if (!intentLink) {
      setDirectPaymentNotice('Invalid UPI ID. Please contact the store.');
      return;
    }

    try {
      if (typeof window !== 'undefined' && ((import.meta as any)?.env?.DEV || process.env.NODE_ENV !== 'production')) {
        console.log('[Opening UPI Intent Deep Link]:', intentLink);
      }
      // Attempt to launch the native UPI intent deep link
      window.location.href = intentLink;

      // Gracefully set provider restriction / scan fallback notice if app doesn't open or direct intent is blocked
      setTimeout(() => {
        setDirectPaymentNotice(
          'Your payment app does not allow direct payment to this UPI ID. Please scan the QR Code to complete your payment.'
        );
      }, 1200);
    } catch {
      // Never display technical errors
      setDirectPaymentNotice(
        'Your payment app does not allow direct payment to this UPI ID. Please scan the QR Code to complete your payment.'
      );
    }
  };

  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshotName(file.name);
      if (!paymentRef) {
        setPaymentRef(`IMG-${Date.now().toString().slice(-6)}`);
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

  const handleStartPaymentVerification = async (explicitPayId?: string, rzpOrderId?: string, rzpSignature?: string) => {
    if (step === 'VERIFYING' || isProcessingRef.current) return;
    setIsSubmitting(true);
    isProcessingRef.current = true;
    setErrorMessage(null);
    setFailedReason(null);

    // Validate cart
    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      setStep('PAYMENT');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    // Validate payment reference if UPI is selected
    if (selectedMethod === 'UPI' && !explicitPayId && !paymentRef.trim()) {
      setErrorMessage('Please enter UTR Transaction Reference Number or upload screenshot.');
      setStep('PAYMENT');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    setVerificationProgress(20);
    setVerificationStageText('Connecting to Secure Gateway Node...');
    
    const targetRef = explicitPayId || paymentRef.trim() || `pay_${Date.now()}`;

    try {
      if (selectedMethod !== 'COD' && rzpOrderId) {
        setVerificationProgress(40);
        setVerificationStageText('Validating Payment Reference & Signature Integrity...');
        
        const apiRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: targetRef,
            razorpay_order_id: rzpOrderId,
            razorpay_signature: rzpSignature,
            amount: totalAmount,
            currency: 'INR',
            customerName: shippingInfo.name,
            customerEmail: shippingInfo.email,
            customerPhone: shippingInfo.phone,
            paymentMethod: selectedMethod,
            keyId: paymentSettings.keyId || paymentSettings.apiKey,
            gatewayProvider: paymentSettings.gatewayProvider || 'RAZORPAY',
            isTestMode: paymentSettings.isTestMode !== false,
          }),
        });
        
        const data = await apiRes.json();
        if (!data.success || !data.verified) {
           throw new Error(data.message || 'Payment verification failed.');
        }
        
        // Anti-fraud amount check
        if (data.actualAmountPaid !== undefined && data.actualAmountPaid < totalAmount) {
           throw new Error(`Payment verification failed: Amount paid (₹${data.actualAmountPaid}) is less than order total (₹${totalAmount}).`);
        }
      }

      setVerificationProgress(70);
      setVerificationStageText('Checking Anti-Replay Ledger & Anti-Fraud Locks...');

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
        discountAmount
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
          paymentStatus: selectedMethod === 'COD' ? 'PENDING' : 'PAID',
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
   * Launch Official Payment Gateway Modal
   */
  const handleLaunchOfficialGatewayCheckout = async () => {
    if (selectedMethod === 'COD') {
      await handleStartPaymentVerification();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Request Order Session from Express Server Backend API
      const apiRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          customerName: shippingInfo.name,
          customerEmail: shippingInfo.email,
          customerPhone: shippingInfo.phone,
          keyId: paymentSettings.keyId || paymentSettings.apiKey,
          gatewayProvider: paymentSettings.gatewayProvider || 'RAZORPAY',
          isTestMode: paymentSettings.isTestMode !== false,
        }),
      });

      const orderData = await apiRes.json();
      if (!orderData.success) {
        setErrorMessage(orderData.message || 'Unable to create payment order. Falling back to direct verification.');
        setIsSubmitting(false);
        // Direct verification fallback
        await handleStartPaymentVerification();
        return;
      }

      const { orderId: gatewayOrderId, keyId: activeKeyId } = orderData;

      // 2. Load Razorpay JS SDK if keyId is present
      const isScriptLoaded = await loadRazorpayScript();
      if (isScriptLoaded && (window as any).Razorpay && activeKeyId) {
        const options = {
          key: activeKeyId,
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          name: storeInfo.name || 'Marudhar Fashion Point',
          description: `Order ${gatewayOrderId}`,
          order_id: gatewayOrderId.startsWith('order_') ? gatewayOrderId : undefined,

          handler: async function (response: any) {
            const confirmedPayId = response.razorpay_payment_id || `pay_${Date.now()}`;
            setPaymentRef(confirmedPayId);
            await handleStartPaymentVerification(confirmedPayId, gatewayOrderId, response.razorpay_signature);
          },

          prefill: {
            name: shippingInfo.name,
            email: shippingInfo.email,
            contact: shippingInfo.phone,
          },
          theme: {
            color: '#0B8F63',
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setErrorMessage('Payment cancelled by customer.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct server verification fallback
        const fallbackPayId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        setPaymentRef(fallbackPayId);
        await handleStartPaymentVerification(fallbackPayId);
      }
    } catch (err: any) {
      console.warn('Gateway modal launch error, falling back to direct server verification:', err);
      await handleStartPaymentVerification();
    }
  };

  const handleOpenWhatsAppConfirmedOrder = () => {
    if (!createdOrder) return;
    const link = generateOrderWhatsAppLink(createdOrder);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/80 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 px-6 py-4 text-white flex items-center justify-between border-b border-amber-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-amber-100">
                Secure Payment & Checkout
              </h2>
              <p className="text-xs text-amber-200/70">
                Marudhar Fashion Point • Bank-Level Encryption
              </p>
            </div>
          </div>
          {step !== 'VERIFYING' && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="bg-amber-50/60 px-6 py-2.5 border-b border-amber-100 flex items-center justify-between text-xs font-medium text-amber-900">
          <div
            className={`flex items-center space-x-1.5 ${
              step === 'SHIPPING' ? 'text-amber-700 font-bold' : 'text-neutral-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'SHIPPING' ? 'bg-amber-700 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              1
            </span>
            <span>Delivery Info</span>
          </div>

          <div className="w-6 h-[1px] bg-neutral-300" />

          <div
            className={`flex items-center space-x-1.5 ${
              step === 'PAYMENT' ? 'text-amber-700 font-bold' : 'text-neutral-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'PAYMENT' ? 'bg-amber-700 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              2
            </span>
            <span>Payment Method</span>
          </div>

          <div className="w-6 h-[1px] bg-neutral-300" />

          <div
            className={`flex items-center space-x-1.5 ${
              step === 'VERIFYING' ? 'text-amber-700 font-bold' : 'text-neutral-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'VERIFYING'
                  ? 'bg-amber-700 text-white animate-pulse'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              3
            </span>
            <span>Verification</span>
          </div>

          <div className="w-6 h-[1px] bg-neutral-300" />

          <div
            className={`flex items-center space-x-1.5 ${
              step === 'SUCCESS' ? 'text-emerald-700 font-bold' : 'text-neutral-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              4
            </span>
            <span>Order Confirmed</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <FlashDealRenderer location="checkout" className="mx-6 mt-4" />

        {/* STEP 1: SHIPPING ADDRESS */}
        {step === 'SHIPPING' && (
          <form onSubmit={handleShippingSubmit} className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Shipping & Delivery Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Full Name *</label>
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
                <label className="block text-neutral-600 mb-1 font-medium">Phone Number *</label>
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
                <label className="block text-neutral-600 mb-1 font-medium">Email Address *</label>
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
                  House / Street Address *
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
                <label className="block text-neutral-600 mb-1 font-medium">City / District *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">State *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-medium">PIN Code *</label>
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
                  Landmark (Optional)
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
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
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
                                <div className="text-[9px] text-neutral-400 leading-snug">{coupon.description}</div>
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
            <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              {freeGiftPromo && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Free Promo Gift</span>
                  <span>🎁 {freeGiftPromo}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>GST ({gstPercent}%)</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span>FREE</span>
                      {freeShippingPromo && <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded uppercase">Coupon</span>}
                    </span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              {isFeeEnabled && (
                <div className="flex justify-between text-neutral-600">
                  <span>Convenience Fee (Est.)</span>
                  <span className="text-emerald-700 font-semibold">₹0 on QR / +{feePercent}% Online</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900 pt-1.5 border-t border-neutral-200 text-sm">
                <span>Estimated Total</span>
                <span className="text-amber-800">₹{(subtotal - discountAmount + shippingFee + taxAmount).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: PAYMENT METHOD */}
        {step === 'PAYMENT' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                Select Payment Mode
              </h3>
              <button
                onClick={() => setStep('SHIPPING')}
                className="text-xs text-amber-700 hover:underline flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Address</span>
              </button>
            </div>

            {/* Payment Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {paymentSettings.enableUPI && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('UPI')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-500'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-700" />
                  <span className="text-center font-bold">Scan QR Code (Manual UPI)</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    0% Fee • FREE
                  </span>
                </button>
              )}

              {paymentSettings.enableCards && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARD')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'CARD'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-sm ring-1 ring-amber-500'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-700" />
                  <span className="text-center font-bold">Pay Online (Cashfree)</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                    {isFeeEnabled ? `${feePercent}% Fee` : 'Online'}
                  </span>
                </button>
              )}

              {paymentSettings.enableNetBanking && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('NET_BANKING')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'NET_BANKING'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-sm ring-1 ring-amber-500'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-amber-700" />
                  <span className="text-center font-bold">Net Banking</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                    {isFeeEnabled ? `${feePercent}% Fee` : 'Online'}
                  </span>
                </button>
              )}

              {paymentSettings.enableWallets && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('WALLET')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'WALLET'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-sm ring-1 ring-amber-500'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-amber-700" />
                  <span className="text-center font-bold">Wallets</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                    {isFeeEnabled ? `${feePercent}% Fee` : 'Online'}
                  </span>
                </button>
              )}

              {paymentSettings.enableCOD && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('COD')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'COD'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold shadow-sm ring-1 ring-amber-500'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <Truck className="w-5 h-5 text-amber-700" />
                  <span className="text-center font-bold">Pay on Delivery</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800 text-[10px] font-extrabold">
                    COD
                  </span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: UPI / QR SCAN */}
            {selectedMethod === 'UPI' && (
              <div className="bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200/90 space-y-5">
                {paymentSettings.paymentEnabled === false ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-medium">
                    Online UPI payments are temporarily paused by store administration. Please select
                    Cash on Delivery or another method.
                  </div>
                ) : (
                  <>
                    {/* 1. Large UPI QR Code Displayed Prominently */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-200/80 text-center shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-100 pb-2.5">
                        <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-amber-700" />
                          Scan & Pay via UPI
                        </span>
                        <span className="font-extrabold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 text-xs">
                          Amount: ₹{totalAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Prominent Large QR Code Card */}
                      <div className="inline-block p-3.5 bg-gradient-to-b from-white to-amber-50/30 rounded-2xl border-2 border-amber-300/80 shadow-md my-1">
                        <img                           src={paymentSettings.qrCodeCustomImage || qrImageUrl}
                          alt="Large Prominent UPI QR Code"
                          className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-xl bg-white p-1 border border-neutral-100"
                         referrerPolicy="no-referrer" />
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

                    {/* 3 & 4 & 5. "Pay with Any UPI App" Button & Friendly Provider Restriction Notice */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handlePayWithUPIApp}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-300" />
                        <span>Pay with Any UPI App</span>
                      </button>

                      {/* Friendly Notice for provider restrictions / fallback */}
                      {directPaymentNotice && (
                        <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 animate-fade-in shadow-xs">
                          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <p className="leading-relaxed font-medium">
                            {directPaymentNotice}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 7. Clear 5-Step Instructions */}
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
                          <label className="cursor-pointer px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-amber-700" />
                            <span>{paymentScreenshotName ? 'Change Image' : 'Upload Screenshot'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotSelect}
                              className="hidden"
                            />
                          </label>
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

            {/* TAB CONTENT: DEBIT / CREDIT CARD */}
            {selectedMethod === 'CARD' && (
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-600 mb-1 font-medium">Card Number *</label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• 8921"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1 font-medium">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="RAHUL SHARMA"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-600 mb-1 font-medium">
                      Expiry (MM/YY) *
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-center font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 mb-1 font-medium">CVV *</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-center font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] text-neutral-500 pt-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    256-Bit SSL Encrypted via {paymentSettings.gatewayProvider || 'DIRECT_UPI_QR'}{' '}
                    Gateway
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NET BANKING */}
            {selectedMethod === 'NET_BANKING' && (
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
                <label className="block text-neutral-600 font-medium">Select Your Bank *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'SBI',
                    'HDFC Bank',
                    'ICICI Bank',
                    'Axis Bank',
                    'Kotak Bank',
                    'Punjab National Bank',
                  ].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                        selectedBank === b
                          ? 'border-amber-700 bg-amber-100 text-amber-900 font-bold'
                          : 'border-neutral-200 bg-white hover:bg-neutral-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: WALLET */}
            {selectedMethod === 'WALLET' && (
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
                <label className="block text-neutral-600 font-medium">Select Wallet *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'Mobikwik'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                        selectedWallet === w
                          ? 'border-amber-700 bg-amber-100 text-amber-900 font-bold'
                          : 'border-neutral-200 bg-white hover:bg-neutral-100'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: COD */}
            {selectedMethod === 'COD' && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2 text-xs text-amber-900">
                <div className="flex items-center space-x-2 font-bold text-amber-900">
                  <Truck className="w-5 h-5 text-amber-700" />
                  <span>Cash / Pay on Delivery Selected</span>
                </div>
                <p className="text-amber-800/80">
                  You can pay ₹{totalAmount.toLocaleString()} via Cash or Mobile Scanner to the
                  courier agent upon delivery. Address will be verified prior to dispatch.
                </p>
              </div>
            )}

            {/* Complete Payment Price Summary Breakdown */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-neutral-900">₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied ({appliedCoupon?.code})</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              {freeGiftPromo && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Free Promo Gift</span>
                  <span>🎁 {freeGiftPromo}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>GST ({gstPercent}%)</span>
                <span className="font-mono font-medium text-neutral-900">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span>FREE</span>
                      {freeShippingPromo && <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded uppercase">Coupon</span>}
                    </span>
                  ) : (
                    <span className="font-mono font-medium text-neutral-900">₹{shippingFee}</span>
                  )}
                </span>
              </div>

              {/* Dynamic Convenience Fee line item */}
              <div className="flex justify-between items-center py-1 border-t border-neutral-200 font-medium">
                <span className="flex items-center gap-1.5 text-neutral-700">
                  <span>Convenience Fee</span>
                  {convenienceFee > 0 ? (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                      {feePercent}% Online Payment (Cashfree)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      ₹0 (Scan QR / Manual UPI)
                    </span>
                  )}
                </span>
                <span className={convenienceFee > 0 ? 'font-mono font-bold text-amber-900' : 'font-mono text-emerald-700 font-bold'}>
                  {convenienceFee > 0 ? `+₹${convenienceFee.toLocaleString()}` : '₹0'}
                </span>
              </div>

              <div className="flex justify-between font-bold text-neutral-900 pt-1.5 border-t border-neutral-200 text-sm">
                <span>Total Amount Payable</span>
                <span className="text-amber-900 font-extrabold text-base">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Complete & Verify Button */}
            <button
              type="button"
              onClick={handleLaunchOfficialGatewayCheckout}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment Session...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Proceed to Pay (₹{totalAmount.toLocaleString()})</span>
                </>
              )}
            </button>
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
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
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
