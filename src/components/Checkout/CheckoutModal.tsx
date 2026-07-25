import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CartItem, ShippingAddressInfo, PaymentMethodType } from '../../types';
import { generateUPILink, getQRCodeImageUrl } from '../../utils/qrCode';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
}) => {
  const { paymentSettings, customerProfile, placeOrderAndPay } = useStore();

  const [step, setStep] = useState<'SHIPPING' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('SHIPPING');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Netbanking / Wallet selection
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Price calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= (paymentSettings.freeShippingMinAmount || 999) ? 0 : paymentSettings.flatShippingRate || 0;
  const gstPercent = paymentSettings.gstPercent || 5;
  const taxAmount = Math.round((subtotal * gstPercent) / 100);
  const totalAmount = Math.max(0, subtotal + shippingFee + taxAmount);

  // Dynamic UPI Link & QR Image
  const dynamicOrderId = completedOrderId || `MFP${1025 + Math.floor(Math.random() * 8000)}`;
  const upiLink = generateUPILink(
    paymentSettings.upiId,
    paymentSettings.merchantName,
    totalAmount,
    dynamicOrderId
  );
  const qrImageUrl = getQRCodeImageUrl(upiLink, 280);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(paymentSettings.upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!shippingInfo.name.trim() || !shippingInfo.phone.trim() || !shippingInfo.street.trim() || !shippingInfo.pincode.trim()) {
      setErrorMessage('Please complete all required shipping details.');
      return;
    }

    setStep('PAYMENT');
  };

  const handlePaymentSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    setStep('PROCESSING');

    try {
      // Simulate gateway latency & security check
      await new Promise((res) => setTimeout(res, 1500));

      const generatedRef = paymentRef.trim() || `REF-${Date.now().toString().slice(-8)}`;

      const res = await placeOrderAndPay(
        shippingInfo,
        cartItems,
        subtotal,
        shippingFee,
        0,
        selectedMethod,
        generatedRef
      );

      if (res.success && res.orderId) {
        setCompletedOrderId(res.orderId);
        setStep('SUCCESS');
        onOrderComplete(res.orderId);
      } else {
        setErrorMessage(res.message || 'Payment verification failed. Please try again.');
        setStep('PAYMENT');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during payment processing.');
      setStep('PAYMENT');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100/50 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 px-6 py-4 text-white flex items-center justify-between border-b border-amber-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-amber-100">
                Secure Checkout
              </h2>
              <p className="text-xs text-amber-200/70">
                Marudhar Fashion Point • Official Store
              </p>
            </div>
          </div>
          {step !== 'PROCESSING' && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-amber-50/60 px-6 py-2.5 border-b border-amber-100 flex items-center justify-between text-xs font-medium text-amber-900">
          <div className={`flex items-center space-x-1.5 ${step === 'SHIPPING' ? 'text-amber-700 font-bold' : 'text-neutral-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'SHIPPING' ? 'bg-amber-700 text-white' : 'bg-neutral-200 text-neutral-700'}`}>1</span>
            <span>Shipping</span>
          </div>
          <div className="w-8 h-[1px] bg-neutral-300" />
          <div className={`flex items-center space-x-1.5 ${step === 'PAYMENT' || step === 'PROCESSING' ? 'text-amber-700 font-bold' : 'text-neutral-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'PAYMENT' || step === 'PROCESSING' ? 'bg-amber-700 text-white' : 'bg-neutral-200 text-neutral-700'}`}>2</span>
            <span>Payment</span>
          </div>
          <div className="w-8 h-[1px] bg-neutral-300" />
          <div className={`flex items-center space-x-1.5 ${step === 'SUCCESS' ? 'text-emerald-700 font-bold' : 'text-neutral-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}>3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: SHIPPING ADDRESS */}
        {step === 'SHIPPING' && (
          <form onSubmit={handleShippingSubmit} className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Shipping & Delivery Address
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
                <label className="block text-neutral-600 mb-1 font-medium">House / Street Address *</label>
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
                <label className="block text-neutral-600 mb-1 font-medium">Landmark (Optional)</label>
                <input
                  type="text"
                  value={shippingInfo.landmark}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, landmark: e.target.value })}
                  placeholder="Near Clock Tower"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Order Summary Snapshot */}
            <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GST ({gstPercent}%)</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 pt-1.5 border-t border-neutral-200 text-sm">
                <span>Total Amount Payable</span>
                <span className="text-amber-800">₹{totalAmount.toLocaleString()}</span>
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
                      ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-amber-700" />
                  <span>UPI / QR</span>
                </button>
              )}

              {paymentSettings.enableCards && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARD')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'CARD'
                      ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-700" />
                  <span>Card</span>
                </button>
              )}

              {paymentSettings.enableNetBanking && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('NET_BANKING')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'NET_BANKING'
                      ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-amber-700" />
                  <span>Netbanking</span>
                </button>
              )}

              {paymentSettings.enableWallets && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('WALLET')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'WALLET'
                      ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-amber-700" />
                  <span>Wallets</span>
                </button>
              )}

              {paymentSettings.enableCOD && (
                <button
                  type="button"
                  onClick={() => setSelectedMethod('COD')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    selectedMethod === 'COD'
                      ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <Truck className="w-5 h-5 text-amber-700" />
                  <span>Pay on Delivery</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: UPI / QR SCAN */}
            {selectedMethod === 'UPI' && (
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-xs font-medium text-neutral-600">
                    Scan with GPay, PhonePe, Paytm, or any UPI App to pay{' '}
                    <strong className="text-amber-900 font-bold">₹{totalAmount.toLocaleString()}</strong>
                  </p>

                  <div className="inline-block p-2 bg-white rounded-xl shadow-md border border-amber-200">
                    <img
                      src={qrImageUrl}
                      alt="UPI QR Code"
                      className="w-44 h-44 mx-auto object-contain rounded-lg"
                    />
                    <div className="mt-1.5 flex items-center justify-center space-x-1 text-[11px] text-amber-900 font-medium">
                      <QrCode className="w-3.5 h-3.5 text-amber-700" />
                      <span>{paymentSettings.merchantName}</span>
                    </div>
                  </div>
                </div>

                {/* UPI ID Copy box */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-neutral-200 text-xs">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Merchant UPI ID:</span>
                    <span className="font-mono font-bold text-neutral-800">{paymentSettings.upiId}</span>
                  </div>
                  <button
                    onClick={handleCopyUPI}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUPI ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>

                {/* Open UPI App Button */}
                <a
                  href={upiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open UPI App (GPay / PhonePe / Paytm)</span>
                </a>

                {/* Optional Payment Ref */}
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">
                    UPI Reference / UTR Number (Optional verification ref)
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="12-digit UTR/Ref ID (e.g. 420918239012)"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: DEBIT / CREDIT CARD */}
            {selectedMethod === 'CARD' && (
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-600 mb-1 font-medium">Card Number</label>
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
                  <label className="block text-neutral-600 mb-1 font-medium">Cardholder Name</label>
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
                    <label className="block text-neutral-600 mb-1 font-medium">Expiry (MM/YY)</label>
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
                    <label className="block text-neutral-600 mb-1 font-medium">CVV</label>
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
                  <span>256-Bit SSL Encryption via {paymentSettings.gatewayProvider} Gateway</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NET BANKING */}
            {selectedMethod === 'NET_BANKING' && (
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
                <label className="block text-neutral-600 font-medium">Select Your Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                        selectedBank === b
                          ? 'border-amber-700 bg-amber-100 text-amber-900'
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
                <label className="block text-neutral-600 font-medium">Select Wallet</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'Mobikwik'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                        selectedWallet === w
                          ? 'border-amber-700 bg-amber-100 text-amber-900'
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
                  You can pay ₹{totalAmount.toLocaleString()} via Cash or Mobile Scanner to the courier agent upon arrival.
                </p>
              </div>
            )}

            {/* Final Pay Button */}
            <button
              type="button"
              onClick={handlePaymentSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <span>Verify & Complete Payment (₹{totalAmount.toLocaleString()})</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: PROCESSING */}
        {step === 'PROCESSING' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-neutral-900">
              Verifying Payment & Creating Order...
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Please wait while our secure gateway verifies your transaction reference and locks inventory.
            </p>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-neutral-900">
                Order Confirmed!
              </h3>
              <p className="text-sm font-semibold text-amber-800 mt-1">
                Order ID: {completedOrderId}
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                Thank you for shopping with Marudhar Fashion Point. A confirmation notification has been recorded and stock reserves updated.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-neutral-600">
                <span>Customer:</span>
                <span className="font-semibold text-neutral-900">{shippingInfo.name}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Amount Paid:</span>
                <span className="font-semibold text-emerald-700">₹{totalAmount.toLocaleString()}</span>
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

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold text-xs transition-colors shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
