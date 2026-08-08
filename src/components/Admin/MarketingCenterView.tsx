import React, { useState } from 'react';
import {
  Megaphone,
  Mail,
  Bell,
  MessageSquare,
  Plus,
  Send,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MousePointer,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertCircle,
  X,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  MarketingCampaign,
  MarketingConsent,
  MarketingSubscriber,
  CampaignCategory,
  CampaignType,
  Product,
} from '../../types';
import { sendBrowserWebPushNotification } from '../../utils/pushNotifications';
import { getPlatformBaseUrl } from '../../lib/platformConfig';

const EMAIL_CATEGORIES: { id: CampaignCategory; label: string }[] = [
  { id: 'DAILY_OFFERS', label: 'Daily Offers' },
  { id: 'FESTIVAL_OFFERS', label: 'Festival Offers' },
  { id: 'WEEKEND_DEALS', label: 'Weekend Deals' },
  { id: 'FLASH_SALES', label: 'Flash Sales' },
  { id: 'NEW_ARRIVALS', label: 'New Arrivals' },
  { id: 'BACK_IN_STOCK', label: 'Back-in-Stock Alerts' },
  { id: 'BIRTHDAY_OFFERS', label: 'Birthday Offers' },
  { id: 'SPECIAL_DISCOUNT', label: 'Special Discount Coupons' },
];

const PUSH_CATEGORIES: { id: CampaignCategory; label: string }[] = [
  { id: 'NEW_COLLECTION', label: 'New Collection' },
  { id: 'EXCLUSIVE_OFFER', label: 'Exclusive Offer' },
  { id: 'LIMITED_STOCK', label: 'Limited Stock' },
  { id: 'PRICE_DROP', label: 'Price Drop' },
  { id: 'FESTIVAL_SALE', label: 'Festival Sale' },
];

const WHATSAPP_TEMPLATES = [
  {
    id: 'wa_tpl_festive_01',
    name: 'festive_offer_v1',
    category: 'FESTIVAL_OFFERS',
    language: 'en_US',
    status: 'APPROVED',
    body: 'Namaste {{1}}! Our store brings you the {{2}} Festival Offer! Get up to {{3}} off on top footwear. Shop now: {{4}}',
    exampleParams: ['Rahul', 'Diwali Special', '40%', 'https://nwd-phi.vercel.app'],
  },
  {
    id: 'wa_tpl_flash_02',
    name: 'flash_sale_vip_v1',
    category: 'FLASH_SALES',
    language: 'en_US',
    status: 'APPROVED',
    body: 'Exclusive Alert for {{1}}! ⚡ Flash Sale on handcrafted leather & sports shoes. Use code {{2}} at checkout: {{3}}. Reply STOP to unsubscribe.',
    exampleParams: ['Priya', 'FLASH20', 'https://nwd-phi.vercel.app'],
  },
  {
    id: 'wa_tpl_stock_03',
    name: 'back_in_stock_vip',
    category: 'BACK_IN_STOCK',
    language: 'en_US',
    status: 'APPROVED',
    body: 'Hi {{1}}, your favorite product {{2}} is back in stock at our store! Grab it before it runs out: {{3}}',
    exampleParams: ['Ankit', 'One8 Burgundy Sneaker', 'https://nwd-phi.vercel.app'],
  },
];

export const MarketingCenterView: React.FC = () => {
  const {
    campaigns,
    subscribers,
    products,
    storeInfo,
    saveCampaign,
    deleteCampaign,
    sendCampaign,
    updateSubscriberConsent,
    refreshMarketingData,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'subscribers' | 'whatsapp'>('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'EMAIL' | 'PUSH' | 'WHATSAPP'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SCHEDULED' | 'SENT'>('ALL');

  // Campaign Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Campaign Form State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignChannel, setCampaignChannel] = useState<CampaignType>('EMAIL');
  const [campaignCategory, setCampaignCategory] = useState<string>('DAILY_OFFERS');
  const [emailSubject, setEmailSubject] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [selectedWaTemplate, setSelectedWaTemplate] = useState(WHATSAPP_TEMPLATES[0].id);
  const [targetLink, setTargetLink] = useState(storeInfo?.contactDetails?.websiteUrl || getPlatformBaseUrl());
  const [sendOption, setSendOption] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Stats
  const totalSubscribers = subscribers.length;
  const emailSubscribers = subscribers.filter((s: any) => s.preferences.email).length;
  const pushSubscribers = subscribers.filter((s: any) => s.preferences.push).length;
  const whatsAppSubscribers = subscribers.filter((s: any) => s.preferences.whatsApp).length;

  const sentCampaigns = campaigns.filter((c: any) => c.status === 'SENT');
  const avgOpenRate =
    sentCampaigns.length > 0
      ? Math.round(
          sentCampaigns.reduce((acc: any, c: any) => acc + (c.deliveredCount > 0 ? (c.openCount / c.deliveredCount) * 100 : 0), 0) /
            sentCampaigns.length
        )
      : 84;
  const avgClickRate =
    sentCampaigns.length > 0
      ? Math.round(
          sentCampaigns.reduce((acc: any, c: any) => acc + (c.deliveredCount > 0 ? (c.clickCount / c.deliveredCount) * 100 : 0), 0) /
            sentCampaigns.length
        )
      : 42;

  // Filtered Campaigns
  const filteredCampaigns = campaigns.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === 'ALL' || c.channel === channelFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Filtered Subscribers
  const filteredSubscribers = subscribers.filter((s: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || (s.phoneNumber || '').includes(term);
    const matchesChannel =
      channelFilter === 'ALL' ||
      (channelFilter === 'EMAIL' && s.preferences.email) ||
      (channelFilter === 'PUSH' && s.preferences.push) ||
      (channelFilter === 'WHATSAPP' && s.preferences.whatsApp);
    return matchesSearch && matchesChannel;
  });

  // Product Selection handler in builder
  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setEmailSubject(`Exclusive Offer: ${p.name} - Limited Stock Drop!`);
    setPushMessage(`🔥 ${p.name} is now available at ₹${p.price.toLocaleString('en-IN')}! Tap to view details.`);
    setTargetLink(`${storeInfo?.contactDetails?.websiteUrl || getPlatformBaseUrl()}?product=${p.id}`);
    setHtmlBody(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; border: 1px solid #e5dccb; border-radius: 16px; padding: 24px;">
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #78350f;">
          <h1 style="color: #451a03; margin: 0; font-size: 24px;">${storeInfo.name}</h1>
          <p style="color: #78350f; font-size: 13px; margin-top: 4px;">Premium Footwear & Luxury Apparel Collection</p>
        </div>
        
        <div style="margin-top: 24px; text-align: center;">
          <span style="background: #fef3c7; color: #92400e; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
            ${campaignCategory.replace('_', ' ')}
          </span>
          <h2 style="color: #18181b; font-size: 20px; margin-top: 12px;">${p.name}</h2>
          <img src="${p.images?.[0] || ''}" alt="${p.name}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin: 16px 0;" />
          
          <div style="font-size: 22px; font-weight: bold; color: #78350f; margin-bottom: 16px;">
            ₹${p.price.toLocaleString('en-IN')}
            ${p.originalPrice ? `<span style="text-decoration: line-through; color: #a1a1aa; font-size: 16px; margin-left: 8px;">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
          
          <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 480px; margin: 0 auto 24px;">
            ${p.description || 'Crafted with premium materials for unmatched comfort, durability, and contemporary style.'}
          </p>

          <a href="${storeInfo?.contactDetails?.websiteUrl || getPlatformBaseUrl()}?product=${p.id}" style="display: inline-block; background: #78350f; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 32px; border-radius: 8px; font-size: 15px;">
            Shop Exclusive Drop Now
          </a>
        </div>

        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e4e4e7; text-align: center; font-size: 12px; color: #71717a;">
          <p style="margin-bottom: 8px;">${storeInfo.name} • ${storeInfo.address}</p>
          <p>You are receiving this email because you opted into marketing updates. <a href="#" style="color: #78350f; text-decoration: underline;">Unsubscribe from all marketing emails</a></p>
        </div>
      </div>
    `);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim()) {
      showToast('Please enter a campaign title', 'error');
      return;
    }

    const newCampaign: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      title: campaignTitle.trim(),
      category: campaignCategory,
      channel: campaignChannel,
      subject: emailSubject,
      pushMessage,
      htmlContent: htmlBody,
      targetLink,
      status: sendOption === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT',
      scheduledAt: sendOption === 'SCHEDULED' ? scheduledDateTime : undefined,
      recipientsCount:
        campaignChannel === 'EMAIL'
          ? emailSubscribers
          : campaignChannel === 'PUSH'
          ? pushSubscribers
          : whatsAppSubscribers,
      deliveredCount: 0,
      openCount: 0,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveCampaign(newCampaign);
    if (saved) {
      if (sendOption === 'IMMEDIATE') {
        setIsSending(true);
        const res = await sendCampaign(newCampaign);
        setIsSending(false);
        showToast(res.message, 'success');
      } else {
        showToast('Campaign scheduled successfully!', 'success');
      }
      setIsBuilderOpen(false);
      resetBuilderForm();
    }
  };

  const resetBuilderForm = () => {
    setCampaignTitle('');
    setCampaignChannel('EMAIL');
    setCampaignCategory('DAILY_OFFERS');
    setEmailSubject('');
    setPushMessage('');
    setHtmlBody('');
    setSelectedProduct(null);
    setTargetLink(storeInfo?.contactDetails?.websiteUrl || getPlatformBaseUrl());
    setSendOption('IMMEDIATE');
    setScheduledDateTime('');
  };

  const handleSendNow = async (campaign: MarketingCampaign) => {
    setIsSending(true);
    const res = await sendCampaign(campaign);
    setIsSending(false);
    showToast(res.message, 'success');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone Number', 'Email OptIn', 'Push OptIn', 'WhatsApp OptIn', 'Subscribed At'];
    const rows = subscribers.map((s: any) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.phoneNumber || '',
      s.preferences.email ? 'YES' : 'NO',
      s.preferences.push ? 'YES' : 'NO',
      s.preferences.whatsApp ? 'YES' : 'NO',
      s.subscribedAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nwd_marketing_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers exported to CSV successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-amber-950 font-bold shadow-lg shadow-amber-500/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold text-amber-100">Marketing & Customer Engagement Center</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Automation Suite
                </span>
              </div>
              <p className="text-xs text-amber-200/70 mt-1">
                Create & deliver targeted Email, Web Push, and WhatsApp Business campaigns while respecting opt-in consent.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshMarketingData}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-amber-200 rounded-xl transition-colors text-xs font-semibold flex items-center space-x-1.5"
              title="Refresh Campaigns & Subscribers"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                resetBuilderForm();
                setIsBuilderOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-amber-300 text-xs font-medium mb-1">
              <span>Subscribers</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">{totalSubscribers}</div>
            <div className="text-[11px] text-amber-200/60 mt-1 flex items-center space-x-2">
              <span>📧 {emailSubscribers}</span>
              <span>🔔 {pushSubscribers}</span>
              <span>💬 {whatsAppSubscribers}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-amber-300 text-xs font-medium mb-1">
              <span>Campaigns Sent</span>
              <Send className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">{sentCampaigns.length}</div>
            <div className="text-[11px] text-amber-200/60 mt-1">
              {campaigns.filter((c: any) => c.status === 'SCHEDULED').length} Scheduled
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-amber-300 text-xs font-medium mb-1">
              <span>Avg Open Rate</span>
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{avgOpenRate}%</div>
            <div className="text-[11px] text-amber-200/60 mt-1">Industry Avg: ~22%</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-amber-300 text-xs font-medium mb-1">
              <span>Avg Click Rate</span>
              <MousePointer className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-400">{avgClickRate}%</div>
            <div className="text-[11px] text-amber-200/60 mt-1">High conversion drops</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-3 border border-neutral-200 shadow-sm">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'campaigns'
                ? 'bg-amber-900 text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campaigns ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'subscribers'
                ? 'bg-amber-900 text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Subscribers ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Business Platform</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-100 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-neutral-100 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="ALL">All Channels</option>
            <option value="EMAIL">Email</option>
            <option value="PUSH">Web Push</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* TAB 1: CAMPAIGNS LIST */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          {filteredCampaigns.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-800">No campaigns found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
                Create your first promotional campaign to send exclusive offers, flash sales, or new arrival drops.
              </p>
              <button
                onClick={() => {
                  resetBuilderForm();
                  setIsBuilderOpen(true);
                }}
                className="px-4 py-2 bg-amber-900 text-amber-100 rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors"
              >
                Create Campaign Now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredCampaigns.map((campaign: any) => (
                <div key={campaign.id} className="p-5 hover:bg-amber-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                          campaign.channel === 'EMAIL'
                            ? 'bg-blue-100 text-blue-800'
                            : campaign.channel === 'PUSH'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {campaign.channel === 'EMAIL' && <Mail className="w-3 h-3 inline mr-1" />}
                        {campaign.channel === 'PUSH' && <Bell className="w-3 h-3 inline mr-1" />}
                        {campaign.channel === 'WHATSAPP' && <MessageSquare className="w-3 h-3 inline mr-1" />}
                        <span>{campaign.channel}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-700">
                        {campaign.category.replace('_', ' ')}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          campaign.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : campaign.status === 'SCHEDULED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 pt-1">{campaign.title}</h4>
                    {campaign.subject && <p className="text-xs text-neutral-500 italic">Subject: "{campaign.subject}"</p>}
                    {campaign.pushMessage && <p className="text-xs text-neutral-600 font-medium">Push Body: "{campaign.pushMessage}"</p>}

                    <div className="text-[11px] text-neutral-400 flex items-center space-x-3 pt-1">
                      <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      {campaign.sentAt && <span>Sent: {new Date(campaign.sentAt).toLocaleString()}</span>}
                      {campaign.scheduledAt && <span>Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}</span>}
                    </div>
                  </div>

                  {/* Campaign Stats & Actions */}
                  <div className="flex items-center space-x-6">
                    {campaign.status === 'SENT' ? (
                      <div className="grid grid-cols-3 gap-3 text-center bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                        <div>
                          <div className="text-[10px] text-neutral-400 font-medium">Recipients</div>
                          <div className="text-xs font-bold text-neutral-800">{campaign.recipientsCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-400 font-medium">Delivered</div>
                          <div className="text-xs font-bold text-emerald-600">{campaign.deliveredCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-400 font-medium">Opens / Clicks</div>
                          <div className="text-xs font-bold text-sky-600">
                            {campaign.openCount} / {campaign.clickCount}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendNow(campaign)}
                        disabled={isSending}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSending ? 'Sending...' : 'Send Now'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBSCRIBERS DIRECTORY & PREFERENCES */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Subscriber Engagement Directory</h3>
              <p className="text-xs text-neutral-500">
                Manage opt-in preferences for Email, Web Push Notifications, and official WhatsApp Business messages.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact Details</th>
                  <th className="px-5 py-3 text-center">Email Opt-In</th>
                  <th className="px-5 py-3 text-center">Web Push</th>
                  <th className="px-5 py-3 text-center">WhatsApp Opt-In</th>
                  <th className="px-5 py-3 text-right">Subscribed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No matching subscribers found.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3 font-bold text-neutral-900">{sub.name}</td>
                      <td className="px-5 py-3 space-y-0.5">
                        <div className="text-neutral-800">{sub.email}</div>
                        {sub.phoneNumber && <div className="text-[11px] text-neutral-400">{sub.phoneNumber}</div>}
                      </td>

                      {/* Email Toggle */}
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() =>
                            updateSubscriberConsent(sub.id, {
                              ...sub.preferences,
                              email: !sub.preferences.email,
                            })
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            sub.preferences.email
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                          }`}
                        >
                          {sub.preferences.email ? '✓ Enabled' : 'Disabled'}
                        </button>
                      </td>

                      {/* Push Toggle */}
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() =>
                            updateSubscriberConsent(sub.id, {
                              ...sub.preferences,
                              push: !sub.preferences.push,
                            })
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            sub.preferences.push
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                          }`}
                        >
                          {sub.preferences.push ? '✓ Enabled' : 'Disabled'}
                        </button>
                      </td>

                      {/* WhatsApp Toggle */}
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() =>
                            updateSubscriberConsent(sub.id, {
                              ...sub.preferences,
                              whatsApp: !sub.preferences.whatsApp,
                            })
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            sub.preferences.whatsApp
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                          }`}
                        >
                          {sub.preferences.whatsApp ? '✓ Opted In' : 'Not Opted In'}
                        </button>
                      </td>

                      <td className="px-5 py-3 text-right text-neutral-400 text-[11px]">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP BUSINESS PLATFORM & COMPLIANCE */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-emerald-100">WhatsApp Business Platform (Official Integration)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    META APPROVED
                  </span>
                </div>
                <p className="text-xs text-emerald-200/70 max-w-2xl">
                  Promotional messages are strictly routed through official WhatsApp Business Cloud API. Messages are sent ONLY to customers who explicitly opt in during signup, login, or checkout.
                </p>
              </div>

              <div className="bg-emerald-900/50 p-3 rounded-2xl border border-emerald-500/30 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Opt-In Policy Compliance: Active</span>
                </div>
                <div className="text-[11px] text-emerald-200/60">WABA Account ID: 84582-NWD-WABA</div>
              </div>
            </div>
          </div>

          {/* Approved Message Templates Catalog */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Approved Meta Message Templates</h4>
                <p className="text-xs text-neutral-500">Pre-approved template structures required for outbound promotional messaging.</p>
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                3 Templates Approved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WHATSAPP_TEMPLATES.map((tpl) => (
                <div key={tpl.id} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">{tpl.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {tpl.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">Category: {tpl.category}</div>
                  <div className="p-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-700 leading-relaxed font-sans">
                    {tpl.body}
                  </div>
                  <div className="text-[10px] text-neutral-400">Supported Placeholders: {tpl.exampleParams.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGN BUILDER MODAL */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-neutral-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-amber-100">Create Marketing Campaign</h3>
              </div>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-amber-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Campaign Title & Channel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Footwear Festival Drop"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Channel *</label>
                  <select
                    value={campaignChannel}
                    onChange={(e) => {
                      const ch = e.target.value as CampaignType;
                      setCampaignChannel(ch);
                      if (ch === 'EMAIL') setCampaignCategory(EMAIL_CATEGORIES[0].id);
                      if (ch === 'PUSH') setCampaignCategory(PUSH_CATEGORIES[0].id);
                      if (ch === 'WHATSAPP') setCampaignCategory('FESTIVAL_OFFERS');
                    }}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  >
                    <option value="EMAIL">📧 Email (Rich HTML)</option>
                    <option value="PUSH">🔔 Web Push Notification</option>
                    <option value="WHATSAPP">💬 WhatsApp Business Message</option>
                  </select>
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Campaign Category *</label>
                <select
                  value={campaignCategory}
                  onChange={(e) => setCampaignCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                >
                  {campaignChannel === 'EMAIL' &&
                    EMAIL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  {campaignChannel === 'PUSH' &&
                    PUSH_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  {campaignChannel === 'WHATSAPP' && (
                    <>
                      <option value="FESTIVAL_OFFERS">Festival Offer Template</option>
                      <option value="FLASH_SALES">Flash Sale VIP Template</option>
                      <option value="BACK_IN_STOCK">Back-in-Stock VIP Template</option>
                    </>
                  )}
                </select>
              </div>

              {/* Optional Product Attach Picker */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Feature Product from Catalog (Auto-populates preview & image)
                </label>
                <select
                  onChange={(e) => {
                    const found = products.find((p: any) => p.id === e.target.value);
                    if (found) handleSelectProduct(found);
                  }}
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Choose a product to feature (Optional) --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel-Specific Fields */}
              {campaignChannel === 'EMAIL' && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Email Subject Line *</label>
                    <input
                      type="text"
                      required={campaignChannel === 'EMAIL'}
                      placeholder="e.g. Exclusive 40% Off on Leather & Sports Shoes"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Rich HTML Body Content *</label>
                    <textarea
                      rows={6}
                      required={campaignChannel === 'EMAIL'}
                      value={htmlBody}
                      onChange={(e) => setHtmlBody(e.target.value)}
                      placeholder="Enter HTML or text body content..."
                      className="w-full p-3 font-mono text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {campaignChannel === 'PUSH' && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Notification Body Text *</label>
                    <textarea
                      rows={3}
                      required={campaignChannel === 'PUSH'}
                      placeholder="e.g. 🔥 New Collection Drop! One8 Burgundy Sneaker is now live. Tap to shop!"
                      value={pushMessage}
                      onChange={(e) => setPushMessage(e.target.value)}
                      className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {campaignChannel === 'WHATSAPP' && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Select Meta Approved Template *</label>
                    <select
                      value={selectedWaTemplate}
                      onChange={(e) => setSelectedWaTemplate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    >
                      {WHATSAPP_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold">WhatsApp Compliance Note:</span> Outbound promotional messages will be formatted according to Meta's strict template guidelines. Unsubscribed users will be automatically excluded.
                  </div>
                </div>
              )}

              {/* Target Link */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Target Link URL</label>
                <input
                  type="url"
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Send Option (Immediate vs Scheduled) */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <label className="block text-xs font-bold text-neutral-800">Delivery Timing</label>
                <div className="flex items-center space-x-6 text-xs font-medium">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendOption"
                      checked={sendOption === 'IMMEDIATE'}
                      onChange={() => setSendOption('IMMEDIATE')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Send Immediately</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendOption"
                      checked={sendOption === 'SCHEDULED'}
                      onChange={() => setSendOption('SCHEDULED')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Schedule for Later</span>
                  </label>
                </div>

                {sendOption === 'SCHEDULED' && (
                  <div className="pt-2">
                    <input
                      type="datetime-local"
                      required={sendOption === 'SCHEDULED'}
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendOption === 'IMMEDIATE' ? 'Send Campaign Now' : 'Schedule Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
