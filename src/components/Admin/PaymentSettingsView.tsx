import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Save,
  ShieldCheck,
  Check,
  Smartphone,
  Building2,
  Wallet,
  Truck,
  Copy,
  CheckCircle2,
  RefreshCw,
  Percent,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PaymentSettings } from '../../types';
import { generateUPILink, getQRCodeImageUrl } from '../../utils/qrCode';

export const PaymentSettingsView: React.FC = () => {
  const { paymentSettings, updatePaymentSettings } = useStore();

  const [form, setForm] = useState<PaymentSettings>({ ...paymentSettings });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);

  const previewUpiLink = generateUPILink(
    form.upiId,
    form.merchantName,
    2499,
    'MFP1025'
  );
  const previewQrUrl = getQRCodeImageUrl(previewUpiLink, 220);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updatePaymentSettings(form);
    setIsSaving(false);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(form.upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs">
      
      {/* Title Header */}
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-sm text-amber-950 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Online Payment & UPI Configuration</span>
          </h3>
          <p className="text-amber-800/80 text-[11px] mt-0.5">
            Configure Merchant UPI ID, Gateway keys, enabled payment channels, taxes, and shipping rates.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: UPI & Gateway Fields */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Section 1: Merchant & UPI ID */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-amber-900 border-b border-neutral-100 pb-2">
              Merchant Details & UPI Configuration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">
                  Merchant / Store Name
                </label>
                <input
                  type="text"
                  required
                  value={form.merchantName}
                  onChange={(e) => setForm({ ...form, merchantName: e.target.value })}
                  placeholder="Marudhar Fashion Point"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">
                  UPI ID (e.g. Google Pay / PhonePe VPA) *
                </label>
                <input
                  type="text"
                  required
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  placeholder="marudharfashion@upi"
                  className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono font-bold text-amber-900"
                />
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 italic">
              * Updating the UPI ID automatically updates all dynamic UPI payment links, QR codes, and checkout buttons in real time across the entire website.
            </p>
          </div>

          {/* Section 2: Payment Gateways */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-amber-900 border-b border-neutral-100 pb-2">
              Payment Gateway Integration (Razorpay / PayU / Cashfree)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">Gateway Provider</label>
                <select
                  value={form.gatewayProvider}
                  onChange={(e) => setForm({ ...form, gatewayProvider: e.target.value as any })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="DIRECT_UPI_QR">Direct UPI & QR Code (Zero Fees)</option>
                  <option value="RAZORPAY">Razorpay Gateway</option>
                  <option value="PAYU">PayU Money Gateway</option>
                  <option value="CASHFREE">Cashfree Payments</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">Gateway Mode</label>
                <select
                  value={form.isTestMode ? 'TEST' : 'LIVE'}
                  onChange={(e) => setForm({ ...form, isTestMode: e.target.value === 'TEST' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-amber-900"
                >
                  <option value="LIVE">Live Production Mode</option>
                  <option value="TEST">Sandbox / Test Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">API Key / Client ID</label>
                <input
                  type="text"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder="rzp_live_..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">API Secret Key</label>
                <input
                  type="password"
                  value={form.apiSecret}
                  onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Enabled Payment Channels Toggles */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-amber-900 border-b border-neutral-100 pb-2">
              Enable / Disable Payment Channels
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100">
                <span className="font-semibold text-neutral-800">UPI Payments</span>
                <input
                  type="checkbox"
                  checked={form.enableUPI}
                  onChange={(e) => setForm({ ...form, enableUPI: e.target.checked })}
                  className="w-4 h-4 text-amber-700 rounded focus:ring-amber-500"
                />
              </label>

              <label className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100">
                <span className="font-semibold text-neutral-800">QR Code Scan</span>
                <input
                  type="checkbox"
                  checked={form.enableQR}
                  onChange={(e) => setForm({ ...form, enableQR: e.target.checked })}
                  className="w-4 h-4 text-amber-700 rounded focus:ring-amber-500"
                />
              </label>

              <label className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100">
                <span className="font-semibold text-neutral-800">Debit / Credit Cards</span>
                <input
                  type="checkbox"
                  checked={form.enableCards}
                  onChange={(e) => setForm({ ...form, enableCards: e.target.checked })}
                  className="w-4 h-4 text-amber-700 rounded focus:ring-amber-500"
                />
              </label>

              <label className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100">
                <span className="font-semibold text-neutral-800">Net Banking</span>
                <input
                  type="checkbox"
                  checked={form.enableNetBanking}
                  onChange={(e) => setForm({ ...form, enableNetBanking: e.target.checked })}
                  className="w-4 h-4 text-amber-700 rounded focus:ring-amber-500"
                />
              </label>

              <label className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100">
                <span className="font-semibold text-neutral-800">Mobile Wallets</span>
                <input
                  type="checkbox"
                  checked={form.enableWallets}
                  onChange={(e) => setForm({ ...form, enableWallets: e.target.checked })}
                  className="w-4 h-4 text-amber-700 rounded focus:ring-amber-500"
                />
              </label>

              <label className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100">
                <span className="font-semibold text-neutral-800">Cash on Delivery</span>
                <input
                  type="checkbox"
                  checked={form.enableCOD}
                  onChange={(e) => setForm({ ...form, enableCOD: e.target.checked })}
                  className="w-4 h-4 text-amber-700 rounded focus:ring-amber-500"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Taxes & Shipping Rates */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-amber-900 border-b border-neutral-100 pb-2">
              Tax Rates & Shipping Fees
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">GST Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  value={form.gstPercent}
                  onChange={(e) => setForm({ ...form, gstPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">Flat Shipping Rate (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.flatShippingRate}
                  onChange={(e) => setForm({ ...form, flatShippingRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">Free Shipping Above (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.freeShippingMinAmount}
                  onChange={(e) => setForm({ ...form, freeShippingMinAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-emerald-800"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Dynamic QR Preview Card */}
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-b from-amber-950 via-neutral-900 to-amber-950 rounded-2xl text-white shadow-xl space-y-4 sticky top-4">
            <div className="flex items-center space-x-2 text-amber-400 font-serif font-bold text-sm">
              <QrCode className="w-5 h-5" />
              <span>Live Dynamic QR Preview</span>
            </div>

            <p className="text-amber-200/80 text-[11px] leading-relaxed">
              This dynamic QR code renders automatically on customer checkouts based on your entered UPI ID below:
            </p>

            <div className="bg-white p-3 rounded-2xl text-neutral-900 text-center shadow-lg border border-amber-400/30">
              <img
                src={previewQrUrl}
                alt="Dynamic UPI QR"
                className="w-48 h-48 mx-auto object-contain rounded-xl"
              />
              <p className="font-bold text-xs text-neutral-900 mt-2">{form.merchantName}</p>
              <p className="font-mono text-[11px] text-amber-800 font-bold">{form.upiId}</p>
            </div>

            <div className="p-3 bg-white/10 rounded-xl space-y-1.5 text-[11px] text-amber-200">
              <div className="flex justify-between">
                <span>Sample Order:</span>
                <span className="font-mono font-bold text-white">#MFP1025</span>
              </div>
              <div className="flex justify-between">
                <span>Sample Amount:</span>
                <span className="font-mono font-bold text-emerald-400">₹2,499</span>
              </div>
              <div className="flex justify-between">
                <span>Dynamic UPI URL:</span>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="text-amber-400 hover:underline flex items-center space-x-1"
                >
                  {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUPI ? 'Copied' : 'Copy VPA'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </form>
  );
};
