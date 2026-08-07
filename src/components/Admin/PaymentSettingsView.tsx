import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  QrCode,
  Save,
  ShieldCheck,
  Check,
  Smartphone,
  Copy,
  CheckCircle2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  RotateCcw,
  Building2,
  FileText,
  IndianRupee,
  Truck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PaymentSettings } from '../../types';
import { generateUPILink, getQRCodeImageUrl, cleanAndSanitizeUPIId, isValidUPIIdFormat } from '../../utils/qrCode';
import { getPlatformConfig } from '../../lib/platformConfig';

export const PaymentSettingsView: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, showToast } = useStore();
  const platform = getPlatformConfig();

  // Local Form State
  const [upiId, setUpiId] = useState(paymentSettings.upiId || 'store@upi');
  const [merchantName, setMerchantName] = useState(paymentSettings.merchantName || platform.platformDisplayName);
  const [paymentEnabled, setPaymentEnabled] = useState(paymentSettings.paymentEnabled !== false);
  const [paymentInstructions, setPaymentInstructions] = useState(
    paymentSettings.paymentInstructions ||
      'Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM UPI app. Select payment method and authorize.'
  );
  const [minOrderAmount, setMinOrderAmount] = useState<number>(paymentSettings.minOrderAmount ?? 1);
  const [maxOrderAmount, setMaxOrderAmount] = useState<number>(paymentSettings.maxOrderAmount ?? 0);

  // Gateway Credentials
  const [gatewayProvider, setGatewayProvider] = useState<'RAZORPAY' | 'PHONEPE' | 'CASHFREE' | 'PAYU' | 'DIRECT_UPI_QR'>(
    paymentSettings.gatewayProvider || 'RAZORPAY'
  );
  const [keyId, setKeyId] = useState<string>(paymentSettings.keyId || paymentSettings.apiKey || '');
  const [keySecret, setKeySecret] = useState<string>(paymentSettings.keySecret || paymentSettings.apiSecret || '');
  const [merchantId, setMerchantId] = useState<string>(paymentSettings.merchantId || '');
  const [isTestMode, setIsTestMode] = useState<boolean>(paymentSettings.isTestMode !== false);
  const [showSecret, setShowSecret] = useState(false);

  // Payment Method Toggles
  const [enableUPI, setEnableUPI] = useState<boolean>(paymentSettings.enableUPI !== false);
  const [enableCards, setEnableCards] = useState<boolean>(paymentSettings.enableCards !== false);
  const [enableNetBanking, setEnableNetBanking] = useState<boolean>(paymentSettings.enableNetBanking !== false);
  const [enableWallets, setEnableWallets] = useState<boolean>(paymentSettings.enableWallets !== false);
  const [enableCOD, setEnableCOD] = useState<boolean>(paymentSettings.enableCOD !== false);

  // Action Button Customization Settings
  const [enableBuyNow, setEnableBuyNow] = useState<boolean>(paymentSettings.enableBuyNow !== false);
  const [enableBuyWhatsApp, setEnableBuyWhatsApp] = useState<boolean>(paymentSettings.enableBuyWhatsApp !== false);
  const [enableAddToCart, setEnableAddToCart] = useState<boolean>(paymentSettings.enableAddToCart !== false);
  const [buyNowButtonText, setBuyNowButtonText] = useState<string>(paymentSettings.buyNowButtonText || 'BUY NOW');
  const [buyNowButtonColor, setBuyNowButtonColor] = useState<string>(paymentSettings.buyNowButtonColor || '#0B8F63');
  const [buyWhatsAppButtonText, setBuyWhatsAppButtonText] = useState<string>(paymentSettings.buyWhatsAppButtonText || 'BUY ON WHATSAPP');
  const [buyWhatsAppButtonColor, setBuyWhatsAppButtonColor] = useState<string>(paymentSettings.buyWhatsAppButtonColor || '#25D366');
  const [addToBagButtonText, setAddToBagButtonText] = useState<string>(paymentSettings.addToBagButtonText || 'ADD TO BAG');
  const [addToBagButtonColor, setAddToBagButtonColor] = useState<string>(paymentSettings.addToBagButtonColor || '#171717');

  // Convenience Fee & Pricing Settings
  const [enableConvenienceFee, setEnableConvenienceFee] = useState<boolean>(
    paymentSettings.enableConvenienceFee !== false
  );
  const [convenienceFeePercent, setConvenienceFeePercent] = useState<number>(
    paymentSettings.convenienceFeePercent ?? 2
  );
  const [applyFeeToOnlineOnly, setApplyFeeToOnlineOnly] = useState<boolean>(
    paymentSettings.applyFeeToOnlineOnly !== false
  );
  const [previewSubtotal, setPreviewSubtotal] = useState<number>(1000);

  // Shipping & Return Policy Settings
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState<number>(
    paymentSettings.freeShippingMinAmount ?? 999
  );
  const [flatShippingRate, setFlatShippingRate] = useState<number>(
    paymentSettings.flatShippingRate ?? 80
  );
  const [noReturnPolicyEnabled, setNoReturnPolicyEnabled] = useState<boolean>(
    paymentSettings.noReturnPolicyEnabled !== false
  );
  const [noExchangePolicyEnabled, setNoExchangePolicyEnabled] = useState<boolean>(
    paymentSettings.noExchangePolicyEnabled !== false
  );
  const [policyText, setPolicyText] = useState<string>(
    paymentSettings.policyText || 'No Return & No Exchange Policy'
  );
  const [deliveryMessage, setDeliveryMessage] = useState<string>(
    paymentSettings.deliveryMessage || '🚚 Fast & Express Delivery Across India'
  );
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>(
    paymentSettings.estimatedDeliveryTime || '3-5 Business Days'
  );

  // Gateway Probe / Test State
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [testProbeResult, setTestProbeResult] = useState<{ success: boolean; message: string } | null>(null);

  // Payment Transactions Ledger
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  // Refund Modal State
  const [refundTx, setRefundTx] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('Customer order cancellation');
  const [isRefunding, setIsRefunding] = useState(false);

  // QR Mode: 'AUTO' or 'CUSTOM'
  const [qrMode, setQrMode] = useState<'AUTO' | 'CUSTOM'>(
    paymentSettings.qrCodeCustomImage ? 'CUSTOM' : 'AUTO'
  );
  const [customQrImage, setCustomQrImage] = useState<string>(paymentSettings.qrCodeCustomImage || '');

  // UI status states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch transactions from server
  const loadTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const res = await fetch('/api/payment/transactions');
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.warn('Failed to load transaction history:', e);
    } finally {
      setIsLoadingTx(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Sync form state when remote Firestore paymentSettings changes
  useEffect(() => {
    if (saveStatus === 'SAVING') return;
    setUpiId(paymentSettings.upiId || 'store@upi');
    setMerchantName(paymentSettings.merchantName || platform.platformDisplayName);
    setPaymentEnabled(paymentSettings.paymentEnabled !== false);
    setGatewayProvider(paymentSettings.gatewayProvider || 'RAZORPAY');
    setKeyId(paymentSettings.keyId || paymentSettings.apiKey || '');
    setKeySecret(paymentSettings.keySecret || paymentSettings.apiSecret || '');
    setMerchantId(paymentSettings.merchantId || '');
    setIsTestMode(paymentSettings.isTestMode !== false);
    setEnableUPI(paymentSettings.enableUPI !== false);
    setEnableCards(paymentSettings.enableCards !== false);
    setEnableNetBanking(paymentSettings.enableNetBanking !== false);
    setEnableWallets(paymentSettings.enableWallets !== false);
    setEnableCOD(paymentSettings.enableCOD !== false);
    setEnableBuyNow(paymentSettings.enableBuyNow !== false);
    setEnableBuyWhatsApp(paymentSettings.enableBuyWhatsApp !== false);
    setEnableAddToCart(paymentSettings.enableAddToCart !== false);
    setBuyNowButtonText(paymentSettings.buyNowButtonText || 'BUY NOW');
    setBuyNowButtonColor(paymentSettings.buyNowButtonColor || '#0B8F63');
    setBuyWhatsAppButtonText(paymentSettings.buyWhatsAppButtonText || 'BUY ON WHATSAPP');
    setBuyWhatsAppButtonColor(paymentSettings.buyWhatsAppButtonColor || '#25D366');
    setAddToBagButtonText(paymentSettings.addToBagButtonText || 'ADD TO BAG');
    setAddToBagButtonColor(paymentSettings.addToBagButtonColor || '#171717');
    setEnableConvenienceFee(paymentSettings.enableConvenienceFee !== false);
    setConvenienceFeePercent(paymentSettings.convenienceFeePercent ?? 2);
    setApplyFeeToOnlineOnly(paymentSettings.applyFeeToOnlineOnly !== false);
    setMinOrderAmount(paymentSettings.minOrderAmount ?? 1);
    setMaxOrderAmount(paymentSettings.maxOrderAmount ?? 0);
    setFreeShippingMinAmount(paymentSettings.freeShippingMinAmount ?? 999);
    setFlatShippingRate(paymentSettings.flatShippingRate ?? 80);
    setNoReturnPolicyEnabled(paymentSettings.noReturnPolicyEnabled !== false);
    setNoExchangePolicyEnabled(paymentSettings.noExchangePolicyEnabled !== false);
    setPolicyText(paymentSettings.policyText || 'No Return & No Exchange Policy');
    setDeliveryMessage(paymentSettings.deliveryMessage || '🚚 Fast & Express Delivery Across India');
    setEstimatedDeliveryTime(paymentSettings.estimatedDeliveryTime || '3-5 Business Days');
    if (paymentSettings.qrCodeCustomImage) {
      setCustomQrImage(paymentSettings.qrCodeCustomImage);
      setQrMode('CUSTOM');
    }
  }, [paymentSettings]);

  // VPA Validation Regex
  const isVpaValid = useMemo(() => {
    return isValidUPIIdFormat(upiId);
  }, [upiId]);

  // Auto-generated dynamic UPI link & QR image URL
  const autoGeneratedUpiLink = useMemo(() => {
    return generateUPILink(
      cleanAndSanitizeUPIId(upiId) || 'store@upi',
      merchantName || platform.platformDisplayName,
      2499,
      'NWD1025'
    );
  }, [upiId, merchantName]);

  const autoGeneratedQrUrl = useMemo(() => {
    return getQRCodeImageUrl(autoGeneratedUpiLink, 300);
  }, [autoGeneratedUpiLink]);

  // Effective QR Code image URL to use
  const effectiveQrImage = qrMode === 'CUSTOM' && customQrImage ? customQrImage : autoGeneratedQrUrl;

  // Handle Custom QR Code Image Upload
  const handleCustomQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('Image size exceeds 3MB limit. Please upload a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomQrImage(result);
      setQrMode('CUSTOM');
      setSaveStatus('IDLE');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomQr = () => {
    setCustomQrImage('');
    setQrMode('AUTO');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSaveStatus('IDLE');
  };

  // Perform Save Action
  const executeSave = async () => {
    if (!isVpaValid) {
      setSaveStatus('ERROR');
      setErrorMessage('Please enter a valid UPI ID (e.g. merchant@oksbi).');
      return;
    }

    if (!merchantName.trim()) {
      setSaveStatus('ERROR');
      setErrorMessage('Please enter your Business / Store Name.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('SAVING');
    setErrorMessage(null);

    const updatedSettings: Partial<PaymentSettings> = {
      upiId: cleanAndSanitizeUPIId(upiId),
      merchantName: merchantName.trim(),
      upiName: merchantName.trim(),
      paymentEnabled,
      paymentInstructions: paymentInstructions.trim(),
      minOrderAmount: Math.max(0, Number(minOrderAmount) || 0),
      maxOrderAmount: Math.max(0, Number(maxOrderAmount) || 0),
      qrCodeCustomImage: qrMode === 'CUSTOM' ? customQrImage : '',
      qrCodeUrl: autoGeneratedQrUrl,
      gatewayProvider,
      keyId: keyId.trim(),
      keySecret: keySecret.trim(),
      apiKey: keyId.trim(),
      apiSecret: keySecret.trim(),
      merchantId: merchantId.trim(),
      isTestMode,
      enableUPI,
      enableCards,
      enableNetBanking,
      enableWallets,
      enableCOD,
      enableBuyNow,
      enableBuyWhatsApp,
      enableAddToCart,
      buyNowButtonText: buyNowButtonText.trim(),
      buyNowButtonColor: buyNowButtonColor.trim(),
      buyWhatsAppButtonText: buyWhatsAppButtonText.trim(),
      buyWhatsAppButtonColor: buyWhatsAppButtonColor.trim(),
      addToBagButtonText: addToBagButtonText.trim(),
      addToBagButtonColor: addToBagButtonColor.trim(),
      enableConvenienceFee,
      convenienceFeePercent: Math.min(10, Math.max(0, Number(convenienceFeePercent) || 0)),
      applyFeeToOnlineOnly,
      freeShippingMinAmount: Math.max(0, Number(freeShippingMinAmount) || 0),
      flatShippingRate: Math.max(0, Number(flatShippingRate) || 0),
      standardDeliveryCharge: Math.max(0, Number(flatShippingRate) || 0),
      noReturnPolicyEnabled,
      noExchangePolicyEnabled,
      policyText: policyText.trim(),
      deliveryMessage: deliveryMessage.trim(),
      estimatedDeliveryTime: estimatedDeliveryTime.trim(),
      enableQR: true,
    };

    try {
      const startTime = Date.now();
      const success = await updatePaymentSettings(updatedSettings);

      // Ensure slight natural feel (min 300ms) but ultra fast
      const elapsed = Date.now() - startTime;
      if (elapsed < 300) {
        await new Promise((res) => setTimeout(res, 300 - elapsed));
      }

      if (success) {
        setIsSaving(false);
        setSaveStatus('SUCCESS');
        setTimeout(() => {
          setSaveStatus((prev) => (prev === 'SUCCESS' ? 'IDLE' : prev));
        }, 4000);
      } else {
        setIsSaving(false);
        setSaveStatus('ERROR');
        setErrorMessage('Failed to save payment settings to database. Please try again.');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setIsSaving(false);
      setSaveStatus('ERROR');
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    }
  };

  // Test Connection Probe
  const executeGatewayProbe = async () => {
    setIsTestingGateway(true);
    setTestProbeResult(null);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100, // ₹1 test probe
          customerName: 'Gateway Probe Test',
          keyId: keyId.trim(),
          keySecret: keySecret.trim(),
          gatewayProvider,
          isTestMode,
        }),
      });

      const data = await res.json();
      if (data.success && data.orderId) {
        setTestProbeResult({
          success: true,
          message: `✓ Gateway Connection Successful! Order Session created with ID: ${data.orderId}`,
        });
      } else {
        setTestProbeResult({
          success: false,
          message: data.message || 'Gateway Probe Failed. Please verify Key ID and Key Secret.',
        });
      }
    } catch (err: any) {
      setTestProbeResult({
        success: false,
        message: 'Network error reaching payment gateway server endpoint.',
      });
    } finally {
      setIsTestingGateway(false);
    }
  };

  // Execute Refund
  const executeRefund = async () => {
    if (!refundTx || !refundTx.paymentId) return;
    setIsRefunding(true);

    try {
      const res = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: refundTx.paymentId,
          amount: refundAmount || refundTx.amount,
          reason: refundReason,
          keyId: keyId.trim(),
          keySecret: keySecret.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✓ Refund Processed Successfully! Refund ID: ${data.refundId}`, 'success');
        setRefundTx(null);
        loadTransactions();
      } else {
        showToast(`Refund failed: ${data.message}`, 'error');
      }
    } catch (err: any) {
      showToast(`Refund Error: ${err.message}`, 'error');
    } finally {
      setIsRefunding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSave();
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  return (
    <div className="space-y-6 text-xs max-w-7xl mx-auto">
      
      {/* Top Header & Status Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B8F63] flex items-center justify-center shrink-0 shadow-inner">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-heading font-bold text-base text-neutral-900">
                Online Payment & UPI Configuration
              </h2>
              {paymentEnabled ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                  Paused
                </span>
              )}
            </div>
            <p className="text-neutral-500 text-[11px] mt-0.5">
              Manage instant UPI payments, merchant VPA, automatic QR code generation, and customer checkout instructions.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={executeSave}
            disabled={isSaving}
            className="px-6 py-3 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Saving payment settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Payment Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Banners */}
      {saveStatus === 'SAVING' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
          <RefreshCw className="w-4 h-4 text-[#0B8F63] animate-spin shrink-0" />
          <span>Saving payment settings to Firebase Firestore database... Please wait.</span>
        </div>
      )}

      {saveStatus === 'SUCCESS' && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#0B8F63] shrink-0" />
          <span>✓ Payment settings updated successfully. Your website is now live with the latest UPI configuration.</span>
        </div>
      )}

      {saveStatus === 'ERROR' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage || 'Failed to save settings. Please try again.'}</span>
          </div>
          <button
            type="button"
            onClick={executeSave}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Settings Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core UPI Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Official Production Payment Gateway Credentials */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                    Production Payment Gateway Config
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-normal">
                    Connect Razorpay, PhonePe, Cashfree, or PayU for instant automated checkout.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-neutral-600">Mode:</span>
                <button
                  type="button"
                  onClick={() => setIsTestMode(!isTestMode)}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                    isTestMode
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {isTestMode ? 'Sandbox / Test Mode' : '⚡ Live Production'}
                </button>
              </div>
            </div>

            {/* Gateway Provider Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'RAZORPAY', name: 'Razorpay', subtitle: 'UPI, Cards, Banks, Wallets' },
                { id: 'PHONEPE', name: 'PhonePe Gateway', subtitle: 'Direct PhonePe PG' },
                { id: 'CASHFREE', name: 'Cashfree', subtitle: 'Instant Settlements' },
                { id: 'PAYU', name: 'PayU Money', subtitle: 'Cards & NetBanking' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setGatewayProvider(p.id as any)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    gatewayProvider === p.id
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-sm font-bold'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  <span className="font-bold text-xs">{p.name}</span>
                  <span className="text-[10px] text-neutral-500 font-normal mt-1">{p.subtitle}</span>
                </button>
              ))}
            </div>

            {/* Credential Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Key ID / Client ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={keyId}
                  onChange={(e) => setKeyId(e.target.value)}
                  placeholder="rzp_test_... or rzp_live_..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3.5 font-mono text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <p className="text-[10px] text-neutral-500">Provided in your {gatewayProvider} merchant dashboard API keys page.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                  <span>Key Secret / Salt Key <span className="text-rose-500">*</span></span>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[10px] text-emerald-700 hover:underline font-normal"
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </label>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={keySecret}
                  onChange={(e) => setKeySecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3.5 font-mono text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <p className="text-[10px] text-neutral-500">Keep secret. Used for server-side cryptographic HMAC SHA256 signature verification.</p>
              </div>
            </div>

            {/* Test Connection Probe Button */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
              <button
                type="button"
                onClick={executeGatewayProbe}
                disabled={isTestingGateway}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                {isTestingGateway ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Testing Gateway Handshake...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Test Gateway Connection</span>
                  </>
                )}
              </button>

              {testProbeResult && (
                <div
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    testProbeResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testProbeResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Enabled Payment Methods */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider border-b border-neutral-100 pb-2.5 flex items-center justify-between">
              <span>Supported Payment Methods on Checkout</span>
              <span className="text-[10px] text-neutral-400 font-normal">Customer checkout options</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={enableUPI}
                  onChange={(e) => setEnableUPI(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>UPI Apps (PhonePe, GPay, Paytm)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={enableCards}
                  onChange={(e) => setEnableCards(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Debit & Credit Cards</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={enableNetBanking}
                  onChange={(e) => setEnableNetBanking(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Net Banking (50+ Banks)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={enableWallets}
                  onChange={(e) => setEnableWallets(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Mobile Wallets</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={enableCOD}
                  onChange={(e) => setEnableCOD(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Pay on Delivery (COD)</span>
              </label>
            </div>
          </div>

          {/* Section 2B: Payment Pricing & Convenience Fee Settings */}
          <div className="p-5 bg-white rounded-2xl border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2.5">
                <IndianRupee className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                    Payment Pricing & Convenience Fee Settings
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-normal">
                    Configure convenience fee rules based on customer payment method selection.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableConvenienceFee}
                  onChange={(e) => {
                    setEnableConvenienceFee(e.target.checked);
                    setSaveStatus('IDLE');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                <span className="ml-2.5 text-xs font-bold text-neutral-800">
                  {enableConvenienceFee ? 'Convenience Fee Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {enableConvenienceFee && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Fee Percentage Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Convenience Fee Percentage (%)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={convenienceFeePercent}
                        onChange={(e) => {
                          const val = Math.min(10, Math.max(0, parseFloat(e.target.value) || 0));
                          setConvenienceFeePercent(val);
                          setSaveStatus('IDLE');
                        }}
                        className="w-full bg-amber-50/50 border border-amber-200 rounded-xl py-2.5 px-3.5 font-bold text-amber-950 focus:ring-2 focus:ring-amber-600 outline-none text-xs"
                      />
                      <span className="absolute right-3.5 text-xs font-bold text-amber-800">%</span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Configurable rate between <strong>0% and 10%</strong> (Default: 2%).
                    </p>
                  </div>

                  {/* Apply fee to online payments only toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Rule Application Strategy
                    </label>
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer font-bold text-xs">
                      <input
                        type="checkbox"
                        checked={applyFeeToOnlineOnly}
                        onChange={(e) => {
                          setApplyFeeToOnlineOnly(e.target.checked);
                          setSaveStatus('IDLE');
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>Apply fee ONLY to Online Payments (Exclude Scan QR / Manual UPI)</span>
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      When checked, QR Payments are 100% free with ₹0 convenience fee.
                    </p>
                  </div>

                </div>

                {/* Live Interactive Pricing Calculation Preview */}
                <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>Live Payment Calculation Preview</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800">Test Subtotal:</span>
                      <div className="relative flex items-center">
                        <span className="absolute left-2 text-[10px] font-bold text-amber-700">₹</span>
                        <input
                          type="number"
                          value={previewSubtotal}
                          onChange={(e) => setPreviewSubtotal(Math.max(1, Number(e.target.value) || 0))}
                          className="w-20 pl-4 pr-1.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-950 text-right outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* QR Payment Box */}
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950">Scan QR Code (Manual UPI)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          ₹0 FEE
                        </span>
                      </div>
                      <div className="space-y-1 text-neutral-600 text-[11px] border-t border-neutral-100 pt-1.5">
                        <div className="flex justify-between">
                          <span>Product Subtotal:</span>
                          <span className="font-mono font-bold text-neutral-900">₹{previewSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Convenience Fee (Excluded):</span>
                          <span className="font-mono">₹0</span>
                        </div>
                        <div className="flex justify-between text-xs font-extrabold text-neutral-900 pt-1 border-t border-neutral-200">
                          <span>Total Customer Pays:</span>
                          <span className="font-mono text-emerald-700">₹{previewSubtotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Online Payment (Cashfree) Box */}
                    <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">Pay Online (Cashfree)</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                          {convenienceFeePercent}% FEE
                        </span>
                      </div>
                      <div className="space-y-1 text-neutral-600 text-[11px] border-t border-neutral-100 pt-1.5">
                        <div className="flex justify-between">
                          <span>Product Subtotal:</span>
                          <span className="font-mono font-bold text-neutral-900">₹{previewSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-amber-900 font-bold">
                          <span>Convenience Fee ({convenienceFeePercent}%):</span>
                          <span className="font-mono">+₹{Math.round((previewSubtotal * convenienceFeePercent) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-extrabold text-neutral-900 pt-1 border-t border-neutral-200">
                          <span>Total Customer Pays:</span>
                          <span className="font-mono text-amber-900">
                            ₹{(previewSubtotal + Math.round((previewSubtotal * convenienceFeePercent) / 100)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2C: Shipping & Return Policy Settings */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                    Shipping & Return Policy Settings
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-normal">
                    Configure delivery charges, free delivery thresholds, and return policies displayed across the website.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                Live Auto-Applied
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Delivery Minimum Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Free Delivery Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  value={freeShippingMinAmount}
                  onChange={(e) => setFreeShippingMinAmount(Number(e.target.value))}
                  placeholder="999"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3.5 font-mono text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <p className="text-[10px] text-neutral-500">
                  Orders equal to or above this amount receive 🚚 FREE DELIVERY. Default: ₹999.
                </p>
              </div>

              {/* Standard Delivery Charge */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Standard Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  value={flatShippingRate}
                  onChange={(e) => setFlatShippingRate(Number(e.target.value))}
                  placeholder="80"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3.5 font-mono text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <p className="text-[10px] text-neutral-500">
                  Delivery fee applied to orders below the Free Delivery threshold. Default: ₹80.
                </p>
              </div>

              {/* Policy Toggles */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 block">
                  Return & Exchange Policy Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={noReturnPolicyEnabled}
                      onChange={(e) => setNoReturnPolicyEnabled(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span className="text-rose-900">❌ No Return Policy</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={noExchangePolicyEnabled}
                      onChange={(e) => setNoExchangePolicyEnabled(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span className="text-rose-900">❌ No Exchange Policy</span>
                  </label>
                </div>
              </div>

              {/* Estimated Delivery Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  value={estimatedDeliveryTime}
                  onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                  placeholder="3-5 Business Days"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <p className="text-[10px] text-neutral-500">Displayed in order emails, WhatsApp receipts, and checkout pages.</p>
              </div>

              {/* Policy Heading Text */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-neutral-800 block">
                  Policy Display Title
                </label>
                <input
                  type="text"
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  placeholder="No Return & No Exchange Policy"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Delivery Message */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-neutral-800 block">
                  Delivery Banner Message
                </label>
                <input
                  type="text"
                  value={deliveryMessage}
                  onChange={(e) => setDeliveryMessage(e.target.value)}
                  placeholder="🚚 Fast & Express Delivery Across India"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: UPI ID & Business Details */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider border-b border-neutral-100 pb-2.5 flex items-center justify-between">
              <span>UPI Credentials & Business Name</span>
              <span className="text-[10px] text-neutral-400 font-normal lowercase">Required for manual UPI payments</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* UPI ID Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <span>UPI ID (VPA) *</span>
                  </label>
                  {isVpaValid ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#0B8F63]" />
                      Valid UPI VPA
                    </span>
                  ) : upiId.trim().length > 0 ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      Invalid Format (e.g. name@bank)
                    </span>
                  ) : null}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setSaveStatus('IDLE');
                    }}
                    placeholder="e.g. merchant@oksbi"
                    className="w-full bg-emerald-50/40 border border-emerald-300/80 rounded-xl py-3 px-3.5 font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-[#0B8F63] focus:bg-white outline-none text-xs transition-all"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Example: <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-800 font-bold">merchant@oksbi</code> or <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-800 font-bold">98290XXXXX@ybl</code>
                </p>
              </div>

              {/* Business Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Business / Store Display Name *
                </label>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={merchantName}
                    onChange={(e) => {
                      setMerchantName(e.target.value);
                      setSaveStatus('IDLE');
                    }}
                    placeholder={platform.platformDisplayName}
                    className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-10 pr-3.5 font-semibold text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none text-xs"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Displayed on the customer's UPI app payment screen.
                </p>
              </div>

            </div>
          </div>

          {/* Section 3: QR Code Configuration (Auto vs Custom) */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#0B8F63]" />
                <span>UPI QR Code Generation</span>
              </h3>
              <span className="text-[10px] text-neutral-500 font-medium">Automatic or Custom Upload</span>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setQrMode('AUTO');
                  setSaveStatus('IDLE');
                }}
                className={`p-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  qrMode === 'AUTO'
                    ? 'border-[#0B8F63] bg-emerald-50/80 text-[#0B8F63] shadow-sm'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate Dynamic QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQrMode('CUSTOM');
                  setSaveStatus('IDLE');
                }}
                className={`p-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  qrMode === 'CUSTOM'
                    ? 'border-[#0B8F63] bg-emerald-50/80 text-[#0B8F63] shadow-sm'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Custom QR Image</span>
              </button>
            </div>

            {/* Auto Mode Info */}
            {qrMode === 'AUTO' && (
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-neutral-700 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0B8F63] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Automatic QR Code active:</strong> The QR code automatically regenerates whenever you update your UPI ID or Business Name. Customers scan it directly on checkout with 100% accuracy.
                </p>
              </div>
            )}

            {/* Custom Upload Box */}
            {qrMode === 'CUSTOM' && (
              <div className="space-y-3 pt-1">
                <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-4 text-center hover:border-[#0B8F63] transition-colors bg-neutral-50/50">
                  {customQrImage ? (
                    <div className="space-y-3">
                      <img
                        src={customQrImage}
                        alt="Custom Uploaded QR"
                        className="w-36 h-36 mx-auto object-contain rounded-xl border border-neutral-200 bg-white p-2 shadow-md"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveCustomQr}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer space-y-2 py-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0B8F63] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-neutral-800 text-xs">
                        Click or drag custom QR image to upload
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        PNG, JPG, or WEBP (Max 3MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomQrUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Payment Instructions & Limits */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider border-b border-neutral-100 pb-2.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B8F63]" />
              <span>Checkout Instructions & Order Limits</span>
            </h3>

            {/* Instructions textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 block">
                Payment Instructions for Customer
              </label>
              <textarea
                rows={3}
                value={paymentInstructions}
                onChange={(e) => {
                  setPaymentInstructions(e.target.value);
                  setSaveStatus('IDLE');
                }}
                placeholder="Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM UPI app..."
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500">
                Shown to customers during checkout under the QR code image.
              </p>
            </div>

            {/* Min / Max limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Minimum Order Amount (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={minOrderAmount}
                    onChange={(e) => {
                      setMinOrderAmount(parseFloat(e.target.value) || 0);
                      setSaveStatus('IDLE');
                    }}
                    placeholder="1"
                    className="w-full bg-white border border-neutral-200 rounded-xl py-2.5 pl-8 pr-3.5 font-bold text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Maximum Order Amount (₹) <span className="text-[10px] text-neutral-400 font-normal">(0 = Unlimited)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={maxOrderAmount}
                    onChange={(e) => {
                      setMaxOrderAmount(parseFloat(e.target.value) || 0);
                      setSaveStatus('IDLE');
                    }}
                    placeholder="0"
                    className="w-full bg-white border border-neutral-200 rounded-xl py-2.5 pl-8 pr-3.5 font-bold text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Dynamic QR Preview Card */}
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 rounded-2xl text-white shadow-xl space-y-4 sticky top-4 border border-neutral-800">
            
            <div className="flex items-center justify-between text-emerald-400 font-serif-heading font-bold text-sm border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0B8F63]" />
                <span>Live Dynamic QR Preview</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
                REALTIME
              </span>
            </div>

            <p className="text-neutral-300 text-[11px] leading-relaxed">
              This is how your UPI QR Code and business name will render automatically during customer checkout:
            </p>

            {/* QR Card Frame */}
            <div className="bg-white p-4 rounded-2xl text-neutral-900 text-center shadow-2xl border border-neutral-200 space-y-2">
              <div className="relative inline-block">
                <img
                  src={effectiveQrImage}
                  alt="Dynamic UPI QR Code Preview"
                  className="w-48 h-48 mx-auto object-contain rounded-xl bg-white p-1 border border-neutral-100"
                />
                {qrMode === 'CUSTOM' && (
                  <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                    CUSTOM
                  </span>
                )}
              </div>

              <div>
                <p className="font-extrabold text-sm text-neutral-900">{merchantName || platform.platformDisplayName}</p>
                <p className="font-mono text-xs text-[#0B8F63] font-bold mt-0.5">{upiId || 'store@upi'}</p>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0B8F63] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedUPI ? <Check className="w-3.5 h-3.5 text-[#0B8F63]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUPI ? 'VPA Copied!' : 'Copy UPI VPA'}</span>
                </button>
              </div>
            </div>

            {/* Sample Order Calculation */}
            <div className="p-3.5 bg-neutral-800/80 rounded-xl space-y-2 text-[11px] text-neutral-300 border border-neutral-700/60">
              <div className="flex justify-between">
                <span>Sample Order ID:</span>
                <span className="font-mono font-bold text-white">#NWD1025</span>
              </div>
              <div className="flex justify-between">
                <span>Sample Amount:</span>
                <span className="font-mono font-bold text-emerald-400">₹2,499.00</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-400">
                  {paymentEnabled ? 'Ready for Checkout' : 'Payments Paused'}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-neutral-400 text-center font-medium leading-relaxed italic">
              ⚡ Changes saved here sync instantly across all devices and checkout sessions via Firebase.
            </div>

          </div>
        </div>

      </form>

      {/* Payment Transactions Ledger & Refund Management Section */}
      <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-4 mt-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                Verified Gateway Transactions Ledger & Refunds
              </h3>
              <p className="text-[11px] text-neutral-500 font-normal">
                Real-time record of all verified payment transactions, payment IDs, and instant refund processing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadTransactions}
            disabled={isLoadingTx}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
            <p className="font-bold text-xs text-neutral-700">No Online Gateway Transactions Recorded Yet</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              When customers complete checkout via Razorpay, PhonePe, Cards, or Netbanking, verified transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Method / Gateway</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment ID / Ref</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-[11px] font-mono text-neutral-500">
                      {new Date(tx.verifiedAt || Date.now()).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-bold font-mono text-neutral-900">{tx.orderId}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-neutral-900">{tx.customerName}</div>
                      <div className="text-[10px] text-neutral-500">{tx.customerPhone || tx.customerEmail}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-bold text-[10px]">
                        {tx.paymentMethod} ({tx.gatewayProvider})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800">₹{tx.amount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-700 select-all">{tx.paymentId}</td>
                    <td className="py-2.5 px-3">
                      {tx.refunded || tx.paymentStatus === 'REFUNDED' ? (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-full">
                          REFUNDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                          PAID & VERIFIED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!tx.refunded && tx.paymentStatus !== 'REFUNDED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setRefundTx(tx);
                            setRefundAmount(tx.amount);
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Initiate Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 uppercase">Process Gateway Refund</h3>
              <button onClick={() => setRefundTx(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1 text-purple-900">
              <div><strong>Payment ID:</strong> <span className="font-mono">{refundTx.paymentId}</span></div>
              <div><strong>Customer:</strong> {refundTx.customerName}</div>
              <div><strong>Original Payment:</strong> ₹{refundTx.amount?.toLocaleString()}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">Reason for Refund *</label>
                <textarea
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for processing refund..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-neutral-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setRefundTx(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRefund}
                disabled={isRefunding}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                {isRefunding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
