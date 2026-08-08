import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Rocket, Calendar, Megaphone, Share2, PenTool, BarChart3, Users, Zap, Save, CheckCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const AIMarketingGrowthView: React.FC = () => {
  const { aiMarketingGrowthConfig, updateAIMarketingGrowthConfig } = useStore();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'social' | 'content' | 'engagement' | 'analytics' | 'recommendations'>('campaigns');
  
  const [isSaving, setIsSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState(aiMarketingGrowthConfig);

  const handleSave = async () => {
    setIsSaving(true);
    await updateAIMarketingGrowthConfig(localConfig);
    setIsSaving(false);
  };

  const handleSocialToneChange = (tone: any) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      socialMediaTone: tone
    }));
  };

  const toggleEngagement = (key: keyof typeof localConfig.customerEngagement) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      customerEngagement: {
        ...prev.customerEngagement,
        [key]: !prev.customerEngagement[key]
      }
    }));
  };

  const toggleRecommendation = (key: keyof typeof localConfig.recommendationEngine) => {
    setLocalConfig((prev: any) => ({
      ...prev,
      recommendationEngine: {
        ...prev.recommendationEngine,
        [key]: !prev.recommendationEngine[key]
      }
    }));
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
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Campaign Manager
              </h3>
              <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                + Create Campaign
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Festival Offers', 'New Arrivals', 'Flash Sales', 'Best Sellers'].map((c, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-200 hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md uppercase">Active</span>
                    <button className="text-neutral-400 hover:text-indigo-600"><PenTool className="w-4 h-4" /></button>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-1">{c}</h4>
                  <p className="text-xs text-neutral-500 mb-4">Scheduled for next week</p>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition-colors">Pause</button>
                    <button className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition-colors">Duplicate</button>
                  </div>
                </div>
              ))}
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
                      <p className="text-xs text-neutral-500">Auto-generate posts</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50">
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
            <h3 className="text-xl font-bold text-neutral-900 mb-2">AI Content Generator</h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-6">
              Automatically generate product descriptions, offer banners, headlines, captions, and blog drafts using our advanced AI.
            </p>
            <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
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
    </div>
  );
};
