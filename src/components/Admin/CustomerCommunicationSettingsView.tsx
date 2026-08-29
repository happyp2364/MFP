import React, { useState, useEffect } from 'react';
import {
  Globe,
  Languages,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Smartphone,
  Save,
  RotateCcw,
  Check,
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  Copy,
  Info,
  Layers,
  Send,
  ShoppingBag,
  Bell,
  HeartHandshake,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomerLanguage, WebsiteConfig, CustomerCommunicationConfig } from '../../types';
import {
  CUSTOMER_COMMUNICATION_DICTIONARY,
  DEFAULT_CUSTOMER_WHATSAPP_TEMPLATES,
  getCustomerLanguage,
  getCustomerText,
} from '../../utils/customerLanguage';

export const CustomerCommunicationSettingsView: React.FC = () => {
  const { websiteConfig, updateWebsiteConfig, showToast } = useStore();

  const [currentLang, setCurrentLang] = useState<CustomerLanguage>(() => {
    return websiteConfig?.customerCommunication?.language || websiteConfig?.customerLanguage || 'hi';
  });

  const [previewTab, setPreviewTab] = useState<'welcome' | 'cart' | 'checkout' | 'whatsapp'>('welcome');
  const [selectedWhatsAppCategory, setSelectedWhatsAppCategory] = useState<string>('orderConfirmed');
  const [isSaving, setIsSaving] = useState(false);

  // Editable Slogans
  const [hindiSlogans, setHindiSlogans] = useState<string[]>(() => {
    return (
      websiteConfig?.customerCommunication?.slogans?.hi ||
      CUSTOMER_COMMUNICATION_DICTIONARY.slogans.hi
    );
  });
  const [englishSlogans, setEnglishSlogans] = useState<string[]>(() => {
    return (
      websiteConfig?.customerCommunication?.slogans?.en ||
      CUSTOMER_COMMUNICATION_DICTIONARY.slogans.en
    );
  });
  const [newSloganInput, setNewSloganInput] = useState('');

  // Editable Messages
  const [welcomeHi, setWelcomeHi] = useState(
    websiteConfig?.customerCommunication?.welcomeMessage?.hi ||
      CUSTOMER_COMMUNICATION_DICTIONARY.welcome.title.hi
  );
  const [welcomeEn, setWelcomeEn] = useState(
    websiteConfig?.customerCommunication?.welcomeMessage?.en ||
      CUSTOMER_COMMUNICATION_DICTIONARY.welcome.title.en
  );

  const [orderConfirmHi, setOrderConfirmHi] = useState(
    websiteConfig?.customerCommunication?.orderConfirmationMessage?.hi ||
      CUSTOMER_COMMUNICATION_DICTIONARY.checkout.orderPlacedSuccess.hi
  );
  const [orderConfirmEn, setOrderConfirmEn] = useState(
    websiteConfig?.customerCommunication?.orderConfirmationMessage?.en ||
      CUSTOMER_COMMUNICATION_DICTIONARY.checkout.orderPlacedSuccess.en
  );

  const [cartAlmostHi, setCartAlmostHi] = useState(
    websiteConfig?.customerCommunication?.cartAlmostCompleteMessage?.hi ||
      CUSTOMER_COMMUNICATION_DICTIONARY.cart.almostComplete.hi
  );
  const [cartAlmostEn, setCartAlmostEn] = useState(
    websiteConfig?.customerCommunication?.cartAlmostCompleteMessage?.en ||
      CUSTOMER_COMMUNICATION_DICTIONARY.cart.almostComplete.en
  );

  const [limitedStockHi, setLimitedStockHi] = useState(
    websiteConfig?.customerCommunication?.limitedStockAlert?.hi ||
      CUSTOMER_COMMUNICATION_DICTIONARY.offers.hurry.hi
  );
  const [limitedStockEn, setLimitedStockEn] = useState(
    websiteConfig?.customerCommunication?.limitedStockAlert?.en ||
      CUSTOMER_COMMUNICATION_DICTIONARY.offers.hurry.en
  );

  const [friendlyErrorHi, setFriendlyErrorHi] = useState(
    websiteConfig?.customerCommunication?.friendlyErrorMessage?.hi ||
      CUSTOMER_COMMUNICATION_DICTIONARY.toasts.friendlyError.hi
  );
  const [friendlyErrorEn, setFriendlyErrorEn] = useState(
    websiteConfig?.customerCommunication?.friendlyErrorMessage?.en ||
      CUSTOMER_COMMUNICATION_DICTIONARY.toasts.friendlyError.en
  );

  // Sync state if external config updates
  useEffect(() => {
    if (websiteConfig) {
      const activeLang =
        websiteConfig.customerCommunication?.language ||
        websiteConfig.customerLanguage ||
        'hi';
      setCurrentLang(activeLang);
      if (websiteConfig.customerCommunication?.slogans?.hi) {
        setHindiSlogans(websiteConfig.customerCommunication.slogans.hi);
      }
      if (websiteConfig.customerCommunication?.slogans?.en) {
        setEnglishSlogans(websiteConfig.customerCommunication.slogans.en);
      }
    }
  }, [websiteConfig]);

  const handleAddSlogan = (lang: 'hi' | 'en') => {
    if (!newSloganInput.trim()) return;
    if (lang === 'hi') {
      setHindiSlogans([...hindiSlogans, newSloganInput.trim()]);
    } else {
      setEnglishSlogans([...englishSlogans, newSloganInput.trim()]);
    }
    setNewSloganInput('');
  };

  const handleRemoveSlogan = (lang: 'hi' | 'en', index: number) => {
    if (lang === 'hi') {
      setHindiSlogans(hindiSlogans.filter((_, i) => i !== index));
    } else {
      setEnglishSlogans(englishSlogans.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (languageToSave?: CustomerLanguage) => {
    setIsSaving(true);
    const lang = languageToSave || currentLang;

    const updatedCommunication: CustomerCommunicationConfig = {
      language: lang,
      slogans: {
        hi: hindiSlogans,
        en: englishSlogans,
      },
      welcomeMessage: {
        hi: welcomeHi,
        en: welcomeEn,
      },
      orderConfirmationMessage: {
        hi: orderConfirmHi,
        en: orderConfirmEn,
      },
      cartAlmostCompleteMessage: {
        hi: cartAlmostHi,
        en: cartAlmostEn,
      },
      limitedStockAlert: {
        hi: limitedStockHi,
        en: limitedStockEn,
      },
      friendlyErrorMessage: {
        hi: friendlyErrorHi,
        en: friendlyErrorEn,
      },
    };

    const newConfig: WebsiteConfig = {
      ...(websiteConfig || ({} as any)),
      customerLanguage: lang,
      customerCommunication: updatedCommunication,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Admin (Language Settings)',
    };

    try {
      await updateWebsiteConfig(newConfig);
      if (showToast) {
        showToast(
          `Customer communication language set to ${lang === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English'}.`,
          'success'
        );
      }
    } catch (e) {
      if (showToast) {
        showToast('Failed to save language settings.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectLanguage = (lang: CustomerLanguage) => {
    setCurrentLang(lang);
    handleSave(lang);
  };

  const currentSloganPreview =
    currentLang === 'hi'
      ? hindiSlogans[0] || CUSTOMER_COMMUNICATION_DICTIONARY.slogans.hi[0]
      : englishSlogans[0] || CUSTOMER_COMMUNICATION_DICTIONARY.slogans.en[0];

  const activeWhatsAppTpl =
    (DEFAULT_CUSTOMER_WHATSAPP_TEMPLATES as any)[selectedWhatsAppCategory] ||
    DEFAULT_CUSTOMER_WHATSAPP_TEMPLATES.orderConfirmed;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Context Note */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Customer Communication & Language Control
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Website-Wise
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Control the dialogue language for customer touchpoints (welcome notes, marketing
                slogans, order notifications, cart alerts, and WhatsApp messages) without altering
                the English e-commerce navigation.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-xs shrink-0 self-start sm:self-center"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Language Settings'}</span>
          </button>
        </div>
      </div>

      {/* Language Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            Active Customer Dialogue Language
          </label>
          <span className="text-[11px] text-neutral-400">
            Selected: <strong className="text-white">{currentLang === 'hi' ? 'Hindi (हिंदी)' : 'English (UK/Global)'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hindi Option */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('hi')}
            className={`text-left p-5 rounded-3xl border transition-all relative overflow-hidden group ${
              currentLang === 'hi'
                ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/20 shadow-xl shadow-amber-500/5'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🇮🇳</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">Hindi (हिंदी)</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Default & Recommended
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Natural, warm, conversational Indian Hindi for welcome dialogues, promotional
                    slogans, and WhatsApp confirmations.
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  currentLang === 'hi'
                    ? 'bg-amber-500 border-amber-500 text-neutral-950'
                    : 'border-neutral-700 bg-neutral-800'
                }`}
              >
                {currentLang === 'hi' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2 text-[11px] text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Sample: "हर कदम में स्टाइल • आपका स्वागत है ❤️"</span>
            </div>
          </button>

          {/* English Option */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('en')}
            className={`text-left p-5 rounded-3xl border transition-all relative overflow-hidden group ${
              currentLang === 'en'
                ? 'bg-blue-500/10 border-blue-500/60 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/5'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🇬🇧</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">English (Global)</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Professional Standard
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Polished, premium, professional English for international or metro customer
                    demographics.
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  currentLang === 'en'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-neutral-700 bg-neutral-800'
                }`}
              >
                {currentLang === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2 text-[11px] text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Sample: "Style in Every Step • Welcome to Marudhar Fashion Point"</span>
            </div>
          </button>
        </div>
      </div>

      {/* Scope Isolation & Architecture Guarantee Note */}
      <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-neutral-300 font-semibold">
            Tenant Isolation & English UI Protection
          </p>
          <p className="text-[11px] leading-relaxed">
            This setting is isolated strictly to this website's configuration. Primary navigation
            and management views (Home, Shop, Categories, Reviews, Cart, Wishlist, Account,
            Settings) remain in English, ensuring high aesthetic elegance while giving customers a
            friendly conversational experience.
          </p>
        </div>
      </div>

      {/* Live Interactive Customer Preview Panel */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Live Interactive Customer Preview
              </h3>
              <p className="text-[11px] text-neutral-400">
                Simulating customer UI render in <strong className="text-amber-400">{currentLang === 'hi' ? 'Hindi' : 'English'}</strong> mode
              </p>
            </div>
          </div>

          {/* Preview Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setPreviewTab('welcome')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'welcome'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Welcome & Slogan
            </button>
            <button
              onClick={() => setPreviewTab('cart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'cart'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cart & Progress
            </button>
            <button
              onClick={() => setPreviewTab('checkout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'checkout'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Order Confirmation
            </button>
            <button
              onClick={() => setPreviewTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'whatsapp'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              WhatsApp Notification
            </button>
          </div>
        </div>

        {/* Tab 1: Welcome & Slogan */}
        {previewTab === 'welcome' && (
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              {currentLang === 'hi'
                ? CUSTOMER_COMMUNICATION_DICTIONARY.welcome.badge.hi
                : CUSTOMER_COMMUNICATION_DICTIONARY.welcome.badge.en}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentSloganPreview}
              </h1>
              <p className="text-sm text-neutral-400">
                {currentLang === 'hi'
                  ? CUSTOMER_COMMUNICATION_DICTIONARY.welcome.subtext.hi
                  : CUSTOMER_COMMUNICATION_DICTIONARY.welcome.subtext.en}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button className="px-5 py-2.5 bg-[#0B8F63] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#0B8F63]/20">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Men</span>
              </button>
              <button className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-xl text-xs border border-neutral-700">
                {currentLang === 'hi' ? 'कलेक्शन देखें' : 'Explore Collections'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Cart & Progress */}
        {previewTab === 'cart' && (
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-medium">
                {currentLang === 'hi'
                  ? CUSTOMER_COMMUNICATION_DICTIONARY.cart.freeShippingUnlocked.hi
                  : CUSTOMER_COMMUNICATION_DICTIONARY.cart.freeShippingUnlocked.en}
              </span>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  {currentLang === 'hi'
                    ? CUSTOMER_COMMUNICATION_DICTIONARY.cart.almostComplete.hi
                    : CUSTOMER_COMMUNICATION_DICTIONARY.cart.almostComplete.en}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {currentLang === 'hi'
                    ? CUSTOMER_COMMUNICATION_DICTIONARY.sections.openBoxAssurance.hi
                    : CUSTOMER_COMMUNICATION_DICTIONARY.sections.openBoxAssurance.en}
                </p>
              </div>
              <button className="px-4 py-2 bg-[#0B8F63] text-white text-xs font-bold rounded-xl shadow-md">
                Checkout
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Order Confirmation */}
        {previewTab === 'checkout' && (
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
            <div className="text-center space-y-2 py-4">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                {currentLang === 'hi'
                  ? CUSTOMER_COMMUNICATION_DICTIONARY.checkout.orderPlacedSuccess.hi
                  : CUSTOMER_COMMUNICATION_DICTIONARY.checkout.orderPlacedSuccess.en}
              </h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                {currentLang === 'hi'
                  ? CUSTOMER_COMMUNICATION_DICTIONARY.checkout.whatsappConfirmationPrompt.hi
                  : CUSTOMER_COMMUNICATION_DICTIONARY.checkout.whatsappConfirmationPrompt.en}
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs text-neutral-300">
              <span>Payment Mode: COD</span>
              <span className="text-emerald-400 font-semibold">
                {currentLang === 'hi' ? 'सामान देखकर भुगतान करें' : 'Pay After Inspection'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 4: WhatsApp Message */}
        {previewTab === 'whatsapp' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {Object.keys(DEFAULT_CUSTOMER_WHATSAPP_TEMPLATES).map((key) => {
                const item = (DEFAULT_CUSTOMER_WHATSAPP_TEMPLATES as any)[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedWhatsAppCategory(key)}
                    className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                      selectedWhatsAppCategory === key
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-[#075E54]/20 border border-[#075E54]/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Live Text Preview ({currentLang === 'hi' ? 'Hindi' : 'English'})
                </span>
                <span className="text-[10px] text-neutral-400">
                  Target: {activeWhatsAppTpl.title}
                </span>
              </div>

              <pre className="p-4 bg-neutral-950/90 border border-neutral-800 rounded-xl text-neutral-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {(currentLang === 'hi' ? activeWhatsAppTpl.hi : activeWhatsAppTpl.en)
                  .replaceAll('{shopName}', websiteConfig?.businessIdentity?.businessName || 'Marudhar Fashion Point')
                  .replaceAll('{customerName}', 'Rajesh Sharma')
                  .replaceAll('{orderId}', '984210')
                  .replaceAll('{productName}', 'One8 Emerald Leather Loafers')
                  .replaceAll('{finalPrice}', '₹1,999')
                  .replaceAll('{selectedSize}', 'UK 9 / 43')
                  .replaceAll('{selectedColor}', 'Royal Burgundy')
                  .replaceAll('{paymentMethod}', 'Cash on Delivery (COD)')
                  .replaceAll('{deliveryAddress}', '124 Station Road, Near Fort')
                  .replaceAll('{city}', 'Pipar City, Jodhpur')
                  .replaceAll('{state}', 'Rajasthan')
                  .replaceAll('{pincode}', '342601')
                  .replaceAll('{productURL}', 'https://marudharfashionpoint.com')}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Slogans & Taglines Customizer */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Promotional Slogans & Taglines
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              These slogans cycle through the hero banner and customer communication touchpoints.
            </p>
          </div>
        </div>

        {/* Hindi Slogans */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>🇮🇳</span> Hindi Slogans (हिंदी)
          </label>
          <div className="space-y-2">
            {hindiSlogans.map((slogan, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
              >
                <span className="font-medium">{slogan}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlogan('hi', idx)}
                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 rounded-lg transition-colors"
                  title="Remove slogan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSloganInput}
              onChange={(e) => setNewSloganInput(e.target.value)}
              placeholder="नया स्लोगन जोड़ें (जैसे: हर कदम में स्टाइल...)"
              className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => handleAddSlogan('hi')}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Add Slogan
            </button>
          </div>
        </div>

        {/* English Slogans */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <span>🇬🇧</span> English Slogans
          </label>
          <div className="space-y-2">
            {englishSlogans.map((slogan, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
              >
                <span className="font-medium">{slogan}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlogan('en', idx)}
                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 rounded-lg transition-colors"
                  title="Remove slogan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Dialogues Overrides */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Customer Dialogues & Toast Messages
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customize specific greeting and notification text for both Hindi & English.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Message */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Welcome Headline (Hindi)
            </label>
            <input
              type="text"
              value={welcomeHi}
              onChange={(e) => setWelcomeHi(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Welcome Headline (English)
            </label>
            <input
              type="text"
              value={welcomeEn}
              onChange={(e) => setWelcomeEn(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Order Confirmation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Order Placed Success Toast (Hindi)
            </label>
            <input
              type="text"
              value={orderConfirmHi}
              onChange={(e) => setOrderConfirmHi(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Order Placed Success Toast (English)
            </label>
            <input
              type="text"
              value={orderConfirmEn}
              onChange={(e) => setOrderConfirmEn(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Limited Stock */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Limited Stock Alert (Hindi)
            </label>
            <input
              type="text"
              value={limitedStockHi}
              onChange={(e) => setLimitedStockHi(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Limited Stock Alert (English)
            </label>
            <input
              type="text"
              value={limitedStockEn}
              onChange={(e) => setLimitedStockEn(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Friendly Error */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Friendly Error Message (Hindi)
            </label>
            <input
              type="text"
              value={friendlyErrorHi}
              onChange={(e) => setFriendlyErrorHi(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Friendly Error Message (English)
            </label>
            <input
              type="text"
              value={friendlyErrorEn}
              onChange={(e) => setFriendlyErrorEn(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer save action */}
        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition-all shadow-lg text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
