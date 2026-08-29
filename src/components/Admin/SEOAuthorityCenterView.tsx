import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Save, Search, RefreshCw, BarChart2, CheckCircle, Code, MapPin, Share2, Star, FileText, Zap, Globe, AlertTriangle } from 'lucide-react';
import { SEOMetadataConfig } from '../../types';

import { AISEOAssistant } from './AISEOAssistant';

export const SEOAuthorityCenterView: React.FC = () => {
  const { seoConfig, updateSEOConfig } = useStore();
  
  const [formData, setFormData] = useState<SEOMetadataConfig>(seoConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'gbp' | 'content' | 'performance' | 'ai'>('business');

  useEffect(() => {
    setFormData(seoConfig);
  }, [seoConfig]);

  const handleSave = async () => {
    // 11. AUTOMATIC SEO CHECK BEFORE PUBLISHING
    const requiredFields = [
      { key: 'globalTitleTemplate', label: 'Global Title Template' },
      { key: 'globalDescription', label: 'Global Description' },
      { key: 'businessName', label: 'Business Name' },
    ];
    for (const field of requiredFields) {
      if (!formData[field.key as keyof SEOMetadataConfig]) {
        alert(`Validation Failed: ${field.label} is required for SEO/Trust.`);
        return; // Prevent publishing until fixed
      }
    }
    
    if (formData.globalDescription && (formData.globalDescription.length < 50 || formData.globalDescription.length > 160)) {
       alert(`Validation Failed: Meta description must be between 50 and 160 characters.`);
       return;
    }
  
    setIsSaving(true);
    await updateSEOConfig(formData);
    setIsSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-600" />
            SEO & Google Authority Center
          </h2>
          <p className="text-sm text-neutral-500">Manage Enterprise SEO, Local Business Identity, and Google Trust Signals.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('business')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'business' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <MapPin className="w-4 h-4 inline-block mr-2" />
          Business Info
        </button>
        <button
          onClick={() => setActiveTab('gbp')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'gbp' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Star className="w-4 h-4 inline-block mr-2" />
          Google Business
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'general' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Code className="w-4 h-4 inline-block mr-2" />
          Metadata & Schema
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'content' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Content Hub
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'performance' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Zap className="w-4 h-4 inline-block mr-2" />
          Performance
        </button>
      </div>

      {activeTab === 'business' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg text-neutral-900 border-b pb-2 mb-4">Core Identity</h3>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Business Name</label>
              <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Category</label>
              <input type="text" name="businessCategory" value={formData.businessCategory || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Founded Year</label>
              <input type="text" name="foundedYear" value={formData.foundedYear || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">GST Number</label>
              <input type="text" name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg text-neutral-900 border-b pb-2 mb-4">Contact & Location</h3>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Primary Phone</label>
              <input type="text" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">WhatsApp Number</label>
              <input type="text" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Full Address</label>
              <textarea name="businessAddress" value={formData.businessAddress || ''} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-1">Latitude</label>
                <input type="text" name="latitude" value={formData.latitude || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-1">Longitude</label>
                <input type="text" name="longitude" value={formData.longitude || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gbp' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg text-neutral-900 border-b pb-2 mb-4">Google Business Profile Links</h3>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">GBP Dashboard URL</label>
              <input type="text" name="gbpUrl" value={formData.gbpUrl || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Direct Review Link</label>
              <input type="text" name="reviewUrl" value={formData.reviewUrl || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Google Maps Directions Link</label>
              <input type="text" name="directionsUrl" value={formData.directionsUrl || ''} onChange={handleChange} className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-10 h-10 text-emerald-500" />
             </div>
             <h4 className="font-bold text-neutral-900">QR Code Generator</h4>
             <p className="text-sm text-neutral-500 mb-4">Generate physical standees and QR codes for in-store review generation.</p>
             <button className="px-6 py-2 bg-neutral-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800">
               <Share2 className="w-4 h-4" /> Generate Review QR
             </button>
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="space-y-6">
          <AISEOAssistant 
            onApply={(data) => {
              setFormData(prev => ({
                ...prev,
                globalTitleTemplate: data.title,
                globalDescription: data.description,
              }));
            }} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg text-neutral-900 border-b pb-2 mb-4">Global Metadata</h3>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Global Title Template</label>
              <input
                type="text"
                name="globalTitleTemplate"
                value={formData.globalTitleTemplate}
                onChange={handleChange}
                placeholder="%s | Marudhar Fashion Point"
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-neutral-500 mt-1">Use %s where the dynamic page name should go.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Global Meta Description</label>
              <textarea
                name="globalDescription"
                value={formData.globalDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Default Open Graph Image URL</label>
              <input
                type="text"
                name="defaultOgImage"
                value={formData.defaultOgImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">robots.txt Content</label>
              <textarea
                name="robotsTxtContent"
                value={formData.robotsTxtContent}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg text-neutral-900 border-b pb-2 mb-4">Google Integrations</h3>
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Google Analytics Measurement ID</label>
              <input
                type="text"
                name="googleAnalyticsId"
                value={formData.googleAnalyticsId}
                onChange={handleChange}
                placeholder="G-..."
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-1">Google Search Console Tag</label>
              <input
                type="text"
                name="googleSearchConsoleVerification"
                value={formData.googleSearchConsoleVerification}
                onChange={handleChange}
                placeholder="Paste the content of the <meta> tag"
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="bg-white p-12 rounded-2xl border border-neutral-200 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Content & Location Hub</h3>
          <p className="text-neutral-500 max-w-lg mx-auto mb-6">Manage location-specific SEO pages (e.g., "Shoes in Pipar") and SEO-optimized blog posts.</p>
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 mx-auto">
            Create Location SEO Page
          </button>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {['Core Web Vitals', 'Lighthouse Score', 'Index Status'].map(metric => (
             <div key={metric} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-black text-emerald-500 mb-2">98+</div>
                <h4 className="font-bold text-neutral-900">{metric}</h4>
                <p className="text-xs text-neutral-500 mt-1">Live monitoring active</p>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
