import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Rocket, Calendar, Megaphone, Share2, PenTool, BarChart3, Users, Zap, Save, CheckCircle, RefreshCw, Smartphone,
  Plus, Copy, Pause, Play, Trash2, X, Clock, Mail, Bell, MessageSquare, AlertCircle, Check, Sparkles, ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { MarketingCampaign, CampaignType, CampaignCategory } from '../../types';
import { PUBLIC_SITE_URL } from '../../utils/siteUrl';

export const AIMarketingGrowthView: React.FC = () => {
  const { 
    aiMarketingGrowthConfig, 
    updateAIMarketingGrowthConfig, 
    campaigns, 
    saveCampaign, 
    deleteCampaign, 
    pauseCampaign, 
    resumeCampaign, 
    duplicateCampaign, 
    showToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'social' | 'content' | 'engagement' | 'analytics' | 'recommendations'>('campaigns');
  
  const [isSaving, setIsSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState(aiMarketingGrowthConfig);

  // Per-card action loading state: { [campaignId]: 'pause' | 'resume' | 'duplicate' | 'delete' | null }
  const [actionLoading, setActionLoading] = useState<{ [id: string]: 'pause' | 'resume' | 'duplicate' | 'delete' | null }>({});

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [isContentStudioOpen, setIsContentStudioOpen] = useState(false);
  const [selectedSocialPlatform, setSelectedSocialPlatform] = useState<string | null>(null);

  // Create Campaign Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<string>('FESTIVAL_OFFERS');
  const [newChannel, setNewChannel] = useState<CampaignType>('WHATSAPP');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'SCHEDULED' | 'DRAFT'>('ACTIVE');
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newTargetLink, setNewTargetLink] = useState(PUBLIC_SITE_URL);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Edit Campaign Form State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<string>('FESTIVAL_OFFERS');
  const [editChannel, setEditChannel] = useState<CampaignType>('WHATSAPP');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'DRAFT'>('ACTIVE');
  const [editScheduleDate, setEditScheduleDate] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // AI Content Studio State
  const [studioPrompt, setStudioPrompt] = useState('Festive footwear promotion for Marudhar Fashion Point');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateAIMarketingGrowthConfig(localConfig);
    setIsSaving(false);
    showToast('AI Marketing & Growth settings saved successfully!', 'success');
  };

  const handleSocialToneChange = (tone: any) => {
    setLocalConfig(prev => ({
      ...prev,
      socialMediaTone: tone
    }));
  };

  const toggleEngagement = (key: keyof typeof localConfig.customerEngagement) => {
    setLocalConfig(prev => ({
      ...prev,
      customerEngagement: {
        ...prev.customerEngagement,
        [key]: !prev.customerEngagement[key]
      }
    }));
  };

  const toggleRecommendation = (key: keyof typeof localConfig.recommendationEngine) => {
    setLocalConfig(prev => ({
      ...prev,
      recommendationEngine: {
        ...prev.recommendationEngine,
        [key]: !prev.recommendationEngine[key]
      }
    }));
  };

  // --- Campaign Interactive Actions ---

  const handlePause = async (campaign: MarketingCampaign) => {
    setActionLoading(prev => ({ ...prev, [campaign.id]: 'pause' }));
    try {
      const ok = await pauseCampaign(campaign.id);
      if (ok) {
        showToast(`Campaign "${campaign.title}" paused successfully.`, 'success');
      } else {
        showToast(`Unable to pause campaign "${campaign.title}".`, 'error');
      }
    } catch (e) {
      showToast('An error occurred while pausing campaign.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [campaign.id]: null }));
    }
  };

  const handleResume = async (campaign: MarketingCampaign) => {
    setActionLoading(prev => ({ ...prev, [campaign.id]: 'resume' }));
    try {
      const ok = await resumeCampaign(campaign.id);
      if (ok) {
        showToast(`Campaign "${campaign.title}" resumed & active!`, 'success');
      } else {
        showToast(`Unable to resume campaign "${campaign.title}".`, 'error');
      }
    } catch (e) {
      showToast('An error occurred while resuming campaign.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [campaign.id]: null }));
    }
  };

  const handleDuplicate = async (campaign: MarketingCampaign) => {
    setActionLoading(prev => ({ ...prev, [campaign.id]: 'duplicate' }));
    try {
      const copy = await duplicateCampaign(campaign);
      showToast(`Campaign "${campaign.title}" duplicated as "${copy.title}"!`, 'success');
    } catch (e) {
      showToast('Failed to duplicate campaign.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [campaign.id]: null }));
    }
  };

  const handleOpenEdit = (campaign: MarketingCampaign) => {
    setEditingCampaign(campaign);
    setEditTitle(campaign.title);
    setEditCategory(campaign.category);
    setEditChannel(campaign.channel);
    setEditStatus((campaign.status as any) || 'ACTIVE');
    setEditScheduleDate(campaign.scheduledAt || '');
    setEditMessage(campaign.pushMessage || campaign.htmlContent || campaign.subject || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    if (!editTitle.trim()) {
      showToast('Please enter a campaign title.', 'error');
      return;
    }

    setIsSubmittingEdit(true);
    const updated: MarketingCampaign = {
      ...editingCampaign,
      title: editTitle.trim(),
      category: editCategory,
      channel: editChannel,
      status: editStatus,
      scheduledAt: editScheduleDate || undefined,
      pushMessage: editMessage,
      subject: editMessage,
      updatedAt: new Date().toISOString(),
    };

    const ok = await saveCampaign(updated);
    setIsSubmittingEdit(false);
    if (ok) {
      showToast(`Campaign "${updated.title}" updated successfully!`, 'success');
      setEditingCampaign(null);
    } else {
      showToast('Failed to update campaign.', 'error');
    }
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'delete' }));
    try {
      const ok = await deleteCampaign(id);
      if (ok) {
        showToast(`Campaign "${title}" deleted successfully.`, 'success');
        setEditingCampaign(null);
      } else {
        showToast('Failed to delete campaign.', 'error');
      }
    } catch (e) {
      showToast('Error deleting campaign.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please provide a campaign title.', 'error');
      return;
    }

    setIsSubmittingCreate(true);
    const newId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const created: MarketingCampaign = {
      id: newId,
      title: newTitle.trim(),
      category: newCategory,
      channel: newChannel,
      status: newStatus,
      scheduledAt: newScheduleDate || undefined,
      pushMessage: newMessage,
      subject: newMessage,
      targetLink: newTargetLink || PUBLIC_SITE_URL,
      recipientsCount: 1500,
      deliveredCount: 0,
      openCount: 0,
      clickCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ok = await saveCampaign(created);
    setIsSubmittingCreate(false);
    if (ok) {
      showToast(`Campaign "${created.title}" created successfully!`, 'success');
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewMessage('');
      setNewScheduleDate('');
    } else {
      showToast('Failed to create campaign.', 'error');
    }
  };

  const handleGenerateAIContent = () => {
    setIsGeneratingContent(true);
    setTimeout(() => {
      setGeneratedContent(
        `🔥 Exclusive Drop at Marudhar Fashion Point! 👟\n\nUpgrade your step with our handcrafted premium footwear. Enjoy festive season specials with up to 40% OFF on trending sneakers & formal leather wear.\n\n✨ Free Express Shipping across Rajasthan & India on orders over ₹999!\n\nShop the collection now: ${PUBLIC_SITE_URL}\nUse Code: FESTIVAL40 at checkout!`
      );
      setIsGeneratingContent(false);
      showToast('AI marketing copy generated successfully!', 'success');
    }, 600);
  };

  const getChannelIcon = (channel: CampaignType) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'PUSH':
        return <Bell className="w-3.5 h-3.5 text-amber-600" />;
      case 'WHATSAPP':
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Rocket className="w-8 h-8 text-indigo-600" />
            AI Marketing & Growth Center
          </h2>
          <p className="text-neutral-500 mt-1">Automate campaigns, generate content, and analyze growth.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {[
          { id: 'campaigns', label: 'Campaign Manager', icon: Calendar },
          { id: 'social', label: 'Social Media', icon: Share2 },
          { id: 'content', label: 'AI Content', icon: PenTool },
          { id: 'engagement', label: 'Customer Engagement', icon: Users },
          { id: 'recommendations', label: 'Recommendations', icon: Zap },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Campaign Manager
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage active promotions, schedule automated broadcasts, or duplicate top-performing campaigns.
                </p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-100"
              >
                <Plus className="w-4 h-4" />
                + Create Campaign
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((c) => {
                const isPaused = c.status === 'PAUSED';
                const isActive = c.status === 'ACTIVE';
                const isScheduled = c.status === 'SCHEDULED';
                const isSent = c.status === 'SENT';
                const isCurrentLoading = Boolean(actionLoading[c.id]);

                return (
                  <div 
                    key={c.id} 
                    className="p-4 rounded-xl border border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between bg-white relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          {isActive && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          )}
                          {isPaused && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Paused
                            </span>
                          )}
                          {isScheduled && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Scheduled
                            </span>
                          )}
                          {isSent && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md uppercase">
                              Sent
                            </span>
                          )}
                          {!isActive && !isPaused && !isScheduled && !isSent && (
                            <span className="text-xs font-bold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md uppercase">
                              Draft
                            </span>
                          )}

                          <span className="text-[11px] font-medium px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md flex items-center gap-1">
                            {getChannelIcon(c.channel)}
                            {c.channel || 'WHATSAPP'}
                          </span>
                        </div>

                        {/* Top-Right Action/Edit Button */}
                        <button 
                          onClick={() => handleOpenEdit(c)}
                          className="text-neutral-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Edit Campaign Details"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-bold text-neutral-900 mb-1 text-base">{c.title}</h4>
                      
                      <p className="text-xs text-neutral-500 mb-4 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {c.scheduledAt 
                          ? `Scheduled: ${new Date(c.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
                          : isPaused 
                          ? 'Promotion currently paused' 
                          : 'Active & running for store customers'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      {/* Pause / Resume Button */}
                      {isPaused ? (
                        <button 
                          onClick={() => handleResume(c)}
                          disabled={isCurrentLoading}
                          className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {actionLoading[c.id] === 'resume' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          {actionLoading[c.id] === 'resume' ? 'Resuming...' : 'Resume'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePause(c)}
                          disabled={isCurrentLoading}
                          className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {actionLoading[c.id] === 'pause' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          )}
                          {actionLoading[c.id] === 'pause' ? 'Pausing...' : 'Pause'}
                        </button>
                      )}

                      {/* Duplicate Button */}
                      <button 
                        onClick={() => handleDuplicate(c)}
                        disabled={isCurrentLoading}
                        className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoading[c.id] === 'duplicate' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {actionLoading[c.id] === 'duplicate' ? 'Copying...' : 'Duplicate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b pb-4">
              <Share2 className="w-5 h-5 text-indigo-600" />
              Social Media Center
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-3">AI Content Tone</label>
              <div className="flex flex-wrap gap-2">
                {['Professional', 'Luxury', 'Casual', 'Festival', 'Local', 'Youth'].map(tone => (
                  <button
                    key={tone}
                    onClick={() => handleSocialToneChange(tone)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      localConfig.socialMediaTone === tone 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {['Instagram', 'Facebook', 'WhatsApp', 'YouTube', 'Google Business Profile'].map(platform => (
                <div key={platform} className="p-4 rounded-xl border border-neutral-200 flex items-center justify-between bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-neutral-200 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900">{platform}</h4>
                      <p className="text-xs text-neutral-500">Auto-generate posts & catalog drops</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedSocialPlatform(platform)}
                    className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-sm"
                  >
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6 text-center py-12">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">AI Content Studio</h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-6 text-sm">
              Automatically generate high-converting product descriptions, offer banners, festive headlines, and promotional WhatsApp drafts.
            </p>
            <button 
              onClick={() => setIsContentStudioOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              Launch AI Content Studio
            </button>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b pb-4">
              <Users className="w-5 h-5 text-indigo-600" />
              Customer Engagement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(localConfig.customerEngagement).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                  <div>
                    <h4 className="font-bold text-neutral-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="text-xs text-neutral-500">Automated customer notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={Boolean(value)}
                      onChange={() => toggleEngagement(key as any)}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b pb-4">
              <Zap className="w-5 h-5 text-indigo-600" />
              Recommendation Engine
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 border border-indigo-100 mb-6">
              <div>
                <h4 className="font-bold text-indigo-900">Enable Smart Recommendations</h4>
                <p className="text-sm text-indigo-700">Display personalized product suggestions across the store.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={localConfig.recommendationEngine.enabled}
                  onChange={() => toggleRecommendation('enabled')}
                />
                <div className="w-11 h-6 bg-indigo-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-indigo-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(localConfig.recommendationEngine).filter(([k]) => k !== 'enabled').map(([key, value]) => (
                <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${localConfig.recommendationEngine.enabled ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-100 bg-neutral-50 opacity-50'}`}>
                  <div>
                    <h4 className="font-bold text-neutral-900 capitalize">{key.replace('suggestBy', '').replace(/([A-Z])/g, ' $1').trim()}</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={value as boolean}
                      disabled={!localConfig.recommendationEngine.enabled}
                      onChange={() => toggleRecommendation(key as any)}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
             <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 border-b pb-4">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Growth Analytics Dashboard
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Visitors', value: '12.4K', trend: '+14%' },
                { label: 'Conversion Rate', value: '3.2%', trend: '+0.5%' },
                { label: 'Avg Order Value', value: '₹2,450', trend: '+5%' },
                { label: 'Cart Abandonment', value: '68%', trend: '-2%' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-neutral-900">{stat.value}</p>
                  <p className={`text-xs font-bold mt-1 ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.trend} vs last month
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <h4 className="font-bold text-neutral-900 mb-6">Traffic & Conversions</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Mon', visitors: 4000, conversions: 240 },
                    { name: 'Tue', visitors: 3000, conversions: 139 },
                    { name: 'Wed', visitors: 2000, conversions: 980 },
                    { name: 'Thu', visitors: 2780, conversions: 390 },
                    { name: 'Fri', visitors: 1890, conversions: 480 },
                    { name: 'Sat', visitors: 2390, conversions: 380 },
                    { name: 'Sun', visitors: 3490, conversions: 430 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar yAxisId="left" dataKey="visitors" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="conversions" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- CREATE CAMPAIGN MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Create New Campaign
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Campaign Title *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Diwali Super Festive Sale, Weekend Sneaker Rush"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Channel
                  </label>
                  <select 
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as CampaignType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  >
                    <option value="WHATSAPP">WhatsApp Broadcast</option>
                    <option value="EMAIL">Email Newsletter</option>
                    <option value="PUSH">Browser Web Push</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  >
                    <option value="FESTIVAL_OFFERS">Festival Offers</option>
                    <option value="NEW_ARRIVALS">New Arrivals</option>
                    <option value="FLASH_SALES">Flash Sales</option>
                    <option value="SPECIAL_DISCOUNT">Special Discount</option>
                    <option value="DAILY_OFFERS">Daily Offers</option>
                    <option value="WEEKEND_DEALS">Weekend Deals</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Initial Status
                  </label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  >
                    <option value="ACTIVE">Active (Live Now)</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Schedule Date
                  </label>
                  <input 
                    type="date"
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Campaign Message / Offer Body
                </label>
                <textarea 
                  rows={3}
                  placeholder="Special discount message, promo details, or offer description..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingCreate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isSubmittingCreate ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CAMPAIGN MODAL (TRIGGERED BY TOP-RIGHT ACTION ICON) --- */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-600" />
                Edit Campaign Details
              </h3>
              <button 
                onClick={() => setEditingCampaign(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Campaign Title *
                </label>
                <input 
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Channel
                  </label>
                  <select 
                    value={editChannel}
                    onChange={(e) => setNewChannel(e.target.value as CampaignType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  >
                    <option value="WHATSAPP">WhatsApp Broadcast</option>
                    <option value="EMAIL">Email Newsletter</option>
                    <option value="PUSH">Browser Web Push</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  >
                    <option value="FESTIVAL_OFFERS">Festival Offers</option>
                    <option value="NEW_ARRIVALS">New Arrivals</option>
                    <option value="FLASH_SALES">Flash Sales</option>
                    <option value="SPECIAL_DISCOUNT">Special Discount</option>
                    <option value="DAILY_OFFERS">Daily Offers</option>
                    <option value="WEEKEND_DEALS">Weekend Deals</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Schedule Date
                  </label>
                  <input 
                    type="date"
                    value={editScheduleDate ? editScheduleDate.split('T')[0] : ''}
                    onChange={(e) => setEditScheduleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Offer Content / Message
                </label>
                <textarea 
                  rows={3}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <button 
                  type="button"
                  onClick={() => handleDeleteCampaign(editingCampaign.id, editingCampaign.title)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setEditingCampaign(null)}
                    className="px-4 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AI CONTENT STUDIO MODAL --- */}
      {isContentStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Content Studio
              </h3>
              <button 
                onClick={() => setIsContentStudioOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Content Goal / Campaign Prompt
                </label>
                <input 
                  type="text"
                  value={studioPrompt}
                  onChange={(e) => setStudioPrompt(e.target.value)}
                  placeholder="e.g. Festive discount on party footwear, Summer sneaker clearance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleGenerateAIContent}
                  disabled={isGeneratingContent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {isGeneratingContent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGeneratingContent ? 'Generating Copy...' : 'Generate with AI'}
                </button>
              </div>

              {generatedContent && (
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-900 uppercase">Generated AI Marketing Copy</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        showToast('Copied marketing copy to clipboard!', 'success');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Text
                    </button>
                  </div>
                  <p className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed font-mono bg-white p-3 rounded-lg border border-indigo-100">
                    {generatedContent}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 mt-6">
              <button 
                onClick={() => setIsContentStudioOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIGURE SOCIAL MEDIA PLATFORM MODAL --- */}
      {selectedSocialPlatform && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                Configure {selectedSocialPlatform}
              </h3>
              <button 
                onClick={() => setSelectedSocialPlatform(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Automated Catalog Sync</h4>
                  <p className="text-xs text-neutral-500">Auto-post newly added footwear products</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Festival & Offer Broadcasts</h4>
                  <p className="text-xs text-neutral-500">Post flash deals and coupon codes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Posting Frequency
                </label>
                <select className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-sm bg-white font-medium">
                  <option>1 post per day (Optimal)</option>
                  <option>2 posts per day</option>
                  <option>3 posts per week</option>
                  <option>Weekly summary only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 mt-6">
              <button 
                onClick={() => setSelectedSocialPlatform(null)}
                className="px-4 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  showToast(`${selectedSocialPlatform} integration settings updated!`, 'success');
                  setSelectedSocialPlatform(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md"
              >
                Save Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
