import React, { useState, useEffect, useRef } from 'react';
import { CustomerOrder } from '../../types';
import { useOrders } from '../../context/OrderContext';
import {
  createRazorpayServerOrder,
  openRazorpayCheckoutModal,
  verifyRazorpayServerPayment,
} from '../../services/razorpayService';
import { getActiveStorePhone, sanitizeWhatsAppText } from '../../utils/whatsapp';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Lock,
  ExternalLink,
  ShoppingBag,
  CreditCard,
  QrCode,
  RefreshCw,
  Info,
} from 'lucide-react';

interface OrderPaymentPageProps {
  orderId: string;
  onBackHome?: () => void;
}

export const OrderPaymentPage: React.FC<OrderPaymentPageProps> = ({ orderId, onBackHome }) => {
  const { getOrderById, markOrderAsPaid } = useOrders();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Payment Execution State
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // 1. Authoritatively Fetch Order Data on Mount or ID change
  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderId) {
        setIsLoading(false);
        setFetchError('कोई ऑर्डर आईडी प्रदान नहीं की गई है। (No Order ID provided)');
        return;
      }

      setIsLoading(true);
      setFetchError(null);

      try {
        const fetchedOrder = await getOrderById(orderId);
        if (!isMounted) return;

        if (fetchedOrder) {
          setOrder(fetchedOrder);
          if (fetchedOrder.paymentStatus === 'PAID') {
            setIsSuccess(true);
            setVerifiedPaymentId(fetchedOrder.razorpayPaymentId || fetchedOrder.transactionId || '');
          }
        } else {
          setFetchError(
            `ऑर्डर #${orderId} नहीं मिला। कृपया लिंक की जांच करें या स्टोर से संपर्क करें।`
          );
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[OrderPaymentPage] Error loading order:', err);
        setFetchError('ऑर्डर लोड करने में समस्या आई। कृपया पुनः प्रयास करें।');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, getOrderById]);

  // Handle WhatsApp Support Inquiry
  const handleContactWhatsApp = (customMsg?: string) => {
    const storePhone = getActiveStorePhone().replace(/\D/g, '');
    const text =
      customMsg ||
      `नमस्ते मरुधर फैशन पॉइंट 🙏\n\nमुझे अपने ऑर्डर के संबंध में सहायता चाहिए:\nOrder ID: ${order?.id || orderId}\nकुल राशि: ₹${order?.totalAmount || ''}`;
    const cleanText = sanitizeWhatsAppText(text);
    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(cleanText)}`, '_blank');
  };

  // Handle WhatsApp Confirmation after successful payment
  const handleSendPaidConfirmationOnWhatsApp = () => {
    if (!order) return;
    const storePhone = getActiveStorePhone().replace(/\D/g, '');
    const text = `🛍️ भुगतान कन्फर्मेशन — मरुधर फैशन पॉइंट

नमस्ते 🙏 मैंने अपने ऑर्डर का भुगतान सफलतापूर्वक कर दिया है:

Order ID: ${order.id}
Payment ID: ${verifiedPaymentId || order.razorpayPaymentId || 'N/A'}
कुल भुगतान: ₹${order.totalAmount.toLocaleString('en-IN')}

कृपया मेरा ऑर्डर कन्फर्म करें। धन्यवाद!`;
    const cleanText = sanitizeWhatsAppText(text);
    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(cleanText)}`, '_blank');
  };

  // 2. Launch Existing Razorpay Standard Checkout Flow
  const handleInitiatePayment = async () => {
    if (!order) return;

    // Edge Case: Order Already Paid
    if (order.paymentStatus === 'PAID' || isSuccess) {
      setPaymentError('इस ऑर्डर का भुगतान पहले ही हो चुका है।');
      return;
    }

    // Edge Case: Order Cancelled
    if (order.orderStatus === 'CANCELLED') {
      setPaymentError('यह ऑर्डर रद्द (Cancelled) हो चुका है। इसका भुगतान नहीं किया जा सकता।');
      return;
    }

    // Double-click protection
    if (isPaying || isProcessingRef.current) return;

    setIsPaying(true);
    isProcessingRef.current = true;
    setPaymentError(null);

    try {
      // 1. Create Server-Authoritative Razorpay Order
      // Passes orderId so server authoritatively binds the exact order amount
      const orderPayload = {
        orderId: order.id,
        amount: order.totalAmount,
        subtotal: order.subtotal || order.totalAmount,
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee ?? 0,
        isFreeShipping: (order.shippingFee ?? 0) === 0,
        paymentMethod: 'ONLINE_UPI',
        enableConvenienceFee: false, // Already baked into order total if any
        items: (order.items || []).map((item) => ({
          productId: item.product?.id,
          productName: item.product?.name,
          quantity: item.quantity,
          price: item.product?.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        shippingInfo: {
          name: order.customerName || 'WhatsApp Customer',
          email: order.customerEmail || 'orders@marudharfashionpoint.com',
          phone: order.customerPhone || '9782482250',
          city: order.shippingAddress?.city || 'Jodhpur',
          state: order.shippingAddress?.state || 'Rajasthan',
          pincode: order.shippingAddress?.pincode || '342001',
        },
        discountAmount: order.discountAmount || 0,
        flatShippingRate: order.shippingFee ?? 0,
        convenienceFee: order.convenienceFee ?? 0,
        notes: {
          orderId: order.id,
          source: order.source || 'WHATSAPP',
          store: 'मरुधर फैशन पॉइंट',
        },
      };

      const serverOrderRes = await createRazorpayServerOrder(orderPayload);

      if (!serverOrderRes || !serverOrderRes.orderId) {
        throw new Error(serverOrderRes?.message || 'सर्वर पर पेमेंट ऑर्डर तैयार नहीं हो सका।');
      }

      // Pre-Launch Consistency Guard: Strict verification before showing Razorpay popup
      const rzpAmountInRupees = serverOrderRes.amount / 100;
      const expectedAmount = order.totalAmount;
      if (Math.abs(rzpAmountInRupees - expectedAmount) > 0.01) {
        console.error(`[OrderPaymentPage Amount Mismatch Guard] Order total: ₹${expectedAmount}, Razorpay Order: ₹${rzpAmountInRupees} (${serverOrderRes.amount} paise)`);
        setPaymentError(
          `पेमेंट राशि में अंतर (Pricing Mismatch): ऑर्डर राशि ₹${expectedAmount} है, लेकिन पेमेंट गेटवे ₹${rzpAmountInRupees} मांग रहा है। सुरक्षा कारणों से पेमेंट रोक दी गई है।`
        );
        setIsPaying(false);
        isProcessingRef.current = false;
        return;
      }

      // 2. Open Existing Razorpay Standard Checkout Modal
      await openRazorpayCheckoutModal({
        orderId: serverOrderRes.orderId,
        amountInPaise: serverOrderRes.amount,
        keyId: serverOrderRes.keyId,
        customerName: order.customerName || 'Customer',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        themeColor: '#0B8F63',
        onSuccess: async (paymentData) => {
          try {
            // 3. Cryptographic Server-Side Signature Verification
            const verifyRes = await verifyRazorpayServerPayment({
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_signature: paymentData.razorpay_signature,
              amount: order.totalAmount,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
            });

            if (verifyRes.success && verifyRes.verified) {
              // 4. Update Firestore Order to PAID
              await markOrderAsPaid(order.id, {
                razorpayPaymentId: paymentData.razorpay_payment_id,
                razorpayOrderId: paymentData.razorpay_order_id,
                razorpaySignature: paymentData.razorpay_signature,
              });

              setVerifiedPaymentId(paymentData.razorpay_payment_id);
              setIsSuccess(true);
              setPaymentError(null);

              // Update local state snapshot
              setOrder((prev) =>
                prev
                  ? {
                      ...prev,
                      paymentStatus: 'PAID',
                      paymentVerificationStatus: 'verified',
                      razorpayPaymentId: paymentData.razorpay_payment_id,
                      razorpayOrderId: paymentData.razorpay_order_id,
                      transactionId: paymentData.razorpay_payment_id,
                    }
                  : null
              );
            } else {
              setPaymentError('पेमेंट वेरिफिकेशन असफल रहा। कृपया स्टोर से संपर्क करें।');
            }
          } catch (vErr: any) {
            console.error('[OrderPaymentPage] Verification error:', vErr);
            setPaymentError(
              vErr.message || 'पेमेंट सत्यापन में समस्या आई। यदि राशि कट गई है तो स्टोर से संपर्क करें।'
            );
          } finally {
            setIsPaying(false);
            isProcessingRef.current = false;
          }
        },
        onFailure: (err) => {
          console.warn('[OrderPaymentPage] Razorpay payment failure:', err);
          setPaymentError(
            err?.description || 'भुगतान पूरा नहीं हुआ। आप दोबारा भुगतान करने का प्रयास कर सकते हैं।'
          );
          setIsPaying(false);
          isProcessingRef.current = false;
        },
        onDismiss: () => {
          setPaymentError('भुगतान पूरा नहीं हुआ। आप दोबारा भुगतान करने का प्रयास कर सकते हैं।');
          setIsPaying(false);
          isProcessingRef.current = false;
        },
      });
    } catch (err: any) {
      console.error('[OrderPaymentPage] Payment initiation error:', err);
      setPaymentError(err.message || 'पेमेंट गेटवे शुरू करने में समस्या आई। कृपया पुनः प्रयास करें।');
      setIsPaying(false);
      isProcessingRef.current = false;
    }
  };

  // -------------------------------------------------------------
  // VIEW: LOADING SKELETON
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-neutral-900">ऑर्डर विवरण लोड हो रहा है...</h2>
            <p className="text-xs text-neutral-500">मरुधर फैशन पॉइंट • सुरक्षित भुगतान पेज</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ERROR / NOT FOUND
  // -------------------------------------------------------------
  if (fetchError || !order) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center space-y-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-neutral-900">ऑर्डर नहीं मिला (Order Not Found)</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {fetchError || 'यह ऑर्डर आईडी मान्य नहीं है या ऑर्डर मौजूद नहीं है।'}
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 border border-neutral-200 text-left">
            <p className="font-semibold text-neutral-800 mb-1">मदद की आवश्यकता है?</p>
            <p>यदि आपने WhatsApp पर ऑर्डर दिया था, तो कृपया अपना ऑर्डर नंबर चेक करें या स्टोर सपोर्ट से संपर्क करें।</p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleContactWhatsApp()}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp पर स्टोर से संपर्क करें
            </button>

            {onBackHome && (
              <button
                onClick={onBackHome}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl text-xs border border-neutral-300 transition-colors"
              >
                वेबसाइट पर वापस जाएं
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: SUCCESS CONFIRMATION SCREEN
  // -------------------------------------------------------------
  if (isSuccess || order.paymentStatus === 'PAID') {
    const displayTxId = verifiedPaymentId || order.razorpayPaymentId || order.transactionId || 'PAID-VERIFIED';

    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center space-y-6">
          {/* Brand header */}
          <div className="border-b border-neutral-100 pb-3">
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
              मरुधर फैशन पॉइंट
            </span>
          </div>

          {/* Success Badge */}
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-neutral-900">भुगतान सफल!</h2>
            <p className="text-xs text-emerald-700 font-medium">Payment Successful & Verified</p>
            <p className="text-xs text-neutral-500 pt-1">
              धन्यवाद! आपका भुगतान सफलतापूर्वक प्राप्त हो गया है।
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">ऑर्डर नंबर (Order ID):</span>
              <span className="font-mono font-bold text-neutral-900">{order.id}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">भुगतान राशि (Amount Paid):</span>
              <span className="font-bold text-base text-emerald-700">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">पेमेंट स्थिति (Status):</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]">
                भुगतान पूर्ण • PAID
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-500">ट्रांजैक्शन आईडी (Tx ID):</span>
              <span className="font-mono text-[11px] text-neutral-700 truncate max-w-[170px]">
                {displayTxId}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSendPaidConfirmationOnWhatsApp}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp पर ऑर्डर विवरण देखें
            </button>

            {onBackHome && (
              <button
                onClick={onBackHome}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold rounded-xl text-xs border border-neutral-300 transition-colors"
              >
                दुकान पर वापस जाएं (Continue Shopping)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: CANCELLED ORDER (Cannot Pay)
  // -------------------------------------------------------------
  if (order.orderStatus === 'CANCELLED') {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-center space-y-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-neutral-900">यह ऑर्डर रद्द हो चुका है</h2>
            <p className="text-xs text-red-600 font-medium">Order Cancelled</p>
            <p className="text-xs text-neutral-500 pt-1">
              Order #{order.id} को रद्द कर दिया गया है। इस ऑर्डर के लिए भुगतान स्वीकार नहीं किया जा सकता।
            </p>
          </div>

          <button
            onClick={() => handleContactWhatsApp()}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp पर स्टोर से बात करें
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: MAIN PENDING PAYMENT PAGE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-100 py-6 px-3 sm:px-4">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Top Header & Brand */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackHome && (
              <button
                onClick={onBackHome}
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
                title="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-sm font-black text-neutral-900 tracking-tight">
                मरुधर फैशन पॉइंट
              </h1>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                सुरक्षित भुगतान • Secure Checkout
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-mono">100% Secure</span>
          </div>
        </div>

        {/* Order Status Banner */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-xs font-bold text-amber-900">भुगतान बाकी है</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Order ID: <span className="font-mono font-bold text-neutral-900">{order.id}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded">
              PENDING
            </span>
          </div>
        </div>

        {/* Payment Error / Re-try Banner */}
        {paymentError && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200 flex items-start gap-2.5 text-xs text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{paymentError}</p>
              <p className="text-[11px] text-red-700">
                यदि आप दोबारा भुगतान करना चाहते हैं, तो कृपया नीचे दिए गए बटन पर क्लिक करें।
              </p>
            </div>
          </div>
        )}

        {/* Order Items Breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <ShoppingBag className="w-3.5 h-3.5 text-neutral-600" />
              <span>ऑर्डर किए गए उत्पाद ({order.items?.length || 0})</span>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {(order.items || []).map((item, idx) => {
              const imageSrc =
                (item.product?.images && item.product.images.length > 0
                  ? item.product.images[0]
                  : (item.product as any)?.image) || CLEAN_IMAGE_COMING_SOON_SVG;

              return (
                <div key={idx} className="py-2.5 flex items-center gap-3">
                  <img
                    src={imageSrc}
                    alt={item.product?.name || 'Product'}
                    className="w-12 h-12 object-cover rounded-lg bg-neutral-50 border border-neutral-200 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CLEAN_IMAGE_COMING_SOON_SVG;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedColor && item.selectedColor !== 'Standard' && (
                        <span>Color: {item.selectedColor}</span>
                      )}
                      <span>× {item.quantity}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      ₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bill Summary Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-neutral-600">
            <span>उप-कुल (Subtotal):</span>
            <span className="font-mono font-semibold text-neutral-900">
              ₹{(order.subtotal ?? 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center text-neutral-600">
            <span>डिलीवरी शुल्क (Delivery):</span>
            <span className="font-mono font-semibold text-neutral-900">
              {(order.shippingFee ?? 0) <= 0 ? (
                <span className="text-emerald-700 font-bold">मुफ्त (FREE)</span>
              ) : (
                `₹${(order.shippingFee ?? 0).toLocaleString('en-IN')}`
              )}
            </span>
          </div>

          {typeof order.discountAmount === 'number' && order.discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-700">
              <span>छूट (Discount):</span>
              <span className="font-mono font-bold">
                -₹{order.discountAmount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {typeof order.convenienceFee === 'number' && order.convenienceFee > 0 && (
            <div className="flex justify-between items-center text-amber-900">
              <span>सुविधा शुल्क (Convenience Fee):</span>
              <span className="font-mono font-semibold">
                +₹{order.convenienceFee.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="border-t border-neutral-200 pt-2.5 flex justify-between items-center">
            <span className="text-sm font-black text-neutral-900">कुल देय राशि (Total Payable):</span>
            <span className="text-lg font-black text-emerald-800 font-mono">
              ₹{(order.totalAmount ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2">
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-neutral-700">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Razorpay Standard Checkout द्वारा 100% सुरक्षित भुगतान</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-medium">
            <span className="flex items-center gap-1">
              <QrCode className="w-3 h-3" /> UPI (GPay/PhonePe/Paytm)
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> कार्ड्स व नेट बैंकिंग
            </span>
          </div>
        </div>

        {/* Primary CTA: Pay Now Button */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleInitiatePayment}
            disabled={isPaying}
            className={`w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              isPaying ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isPaying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>सुरक्षित पेमेंट गेटवे खुल रहा है...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Razorpay से सुरक्षित भुगतान करें • ₹{(order.totalAmount ?? 0).toLocaleString('en-IN')}</span>
              </>
            )}
          </button>

          {/* Help & Support Button */}
          <button
            onClick={() => handleContactWhatsApp()}
            className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl text-xs border border-neutral-200 flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>कोई सहायता चाहिए? WhatsApp पर बात करें</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-center text-neutral-400 pt-2">
          मरुधर फैशन पॉइंट • जोधपुर, राजस्थान • आधिकारिक सुरक्षित भुगतान पोर्टल
        </p>
      </div>
    </div>
  );
};
