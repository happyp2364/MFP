import React, { useState, useEffect } from 'react';
import { Globe, Server, ShieldCheck, Mail, Link as LinkIcon, CheckCircle2, XCircle, RefreshCw, Crown } from 'lucide-react';
import { Tenant } from '../../types';
import { sanitizeSlug, isValidSlug, isSlugAvailable } from '../../lib/tenantIsolation';
import { buildWebsiteUrl, buildAdminLoginUrl, getPlatformConfig } from '../../lib/platformConfig';

interface ProvisionWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvision: (tenantData: Partial<Tenant>) => Promise<void>;
  existingTenants?: Tenant[];
}

export const ProvisionWebsiteModal: React.FC<ProvisionWebsiteModalProps> = ({
  isOpen,
  onClose,
  onProvision,
  existingTenants = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerEmail: '',
    domain: '',
    plan: 'free',
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug proposal from website name if user hasn't typed custom slug
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const generated = sanitizeSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug: generated }));
      if (generated) {
        checkSlugStatus(generated);
      } else {
        setAvailabilityStatus('idle');
        setAvailabilityMessage('');
      }
    }
  }, [formData.name, slugManuallyEdited]);

  if (!isOpen) return null;

  const handleSlugChange = (raw: string) => {
    setSlugManuallyEdited(true);
    const cleaned = sanitizeSlug(raw);
    setFormData((prev) => ({ ...prev, slug: cleaned }));
    if (cleaned) {
      checkSlugStatus(cleaned);
    } else {
      setAvailabilityStatus('idle');
      setAvailabilityMessage('');
    }
  };

  const checkSlugStatus = (slugToCheck: string) => {
    setAvailabilityStatus('checking');
    setTimeout(() => {
      const validation = isValidSlug(slugToCheck);
      if (!validation.valid) {
        setAvailabilityStatus('invalid');
        setAvailabilityMessage(validation.error || 'Invalid slug format');
        return;
      }

      const available = isSlugAvailable(slugToCheck, existingTenants);
      if (available) {
        setAvailabilityStatus('available');
        setAvailabilityMessage('Website Slug is available on platform!');
      } else {
        setAvailabilityStatus('taken');
        setAvailabilityMessage('Website Slug is already taken by another store. Choose another slug.');
      }
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = isValidSlug(formData.slug);
    if (!validation.valid) {
      setAvailabilityStatus('invalid');
      setAvailabilityMessage(validation.error || 'Invalid slug');
      return;
    }

    const available = isSlugAvailable(formData.slug, existingTenants);
    if (!available) {
      setAvailabilityStatus('taken');
      setAvailabilityMessage('Website Slug is already taken. Please choose a unique slug.');
      return;
    }

    setIsSubmitting(true);
    try {
      const config = getPlatformConfig();
      const webUrl = buildWebsiteUrl(formData.slug, config);
      const adminUrl = buildAdminLoginUrl(formData.slug, config);
      const platformHost = (() => {
        try { return new URL(config.platformBaseUrl).hostname; } catch { return 'platform.app'; }
      })();

      await onProvision({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        domain: formData.domain.trim() || `${formData.slug}.${platformHost}`,
        ownerEmail: formData.ownerEmail.trim(),
        adminGoogleEmail: formData.ownerEmail.trim(),
        websiteUrl: webUrl,
        adminLoginUrl: adminUrl,
        status: 'provisioning',
        plan: formData.plan as 'free' | 'pro' | 'enterprise',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewUrl = buildWebsiteUrl(formData.slug || '<website-slug>');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center gap-4 bg-neutral-950/50">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Provision New Website URL</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black flex items-center gap-1">
                <Crown className="w-3 h-3" /> Super Admin
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Create an isolated white-label store instance with unique URL slug and owner assignment.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
          <div className="space-y-4">
            
            {/* 1. Business / Website Name */}
            <div>
              <label className="block text-[11px] font-black text-neutral-300 uppercase tracking-wider mb-1.5">
                Business Name *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ABC Shoes or Raj Footwear"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-amber-500 focus:outline-none text-xs transition-colors"
                />
              </div>
            </div>

            {/* 2. Website Slug & Check Availability */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-neutral-300 uppercase tracking-wider">
                  Website Slug (Unique URL Path) *
                </label>
                <span className="text-[10px] text-neutral-500 font-mono">lowercase, numbers & hyphens</span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-neutral-500 font-mono text-[11px]">/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="e.g. abc-shoes"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-7 pr-4 text-amber-300 font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => checkSlugStatus(formData.slug)}
                  className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${availabilityStatus === 'checking' ? 'animate-spin text-amber-400' : ''}`} />
                  <span>Check Availability</span>
                </button>
              </div>

              {/* Availability Status Badge & Feedback */}
              {availabilityStatus !== 'idle' && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] font-medium animate-in fade-in ${
                    availabilityStatus === 'available'
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : availabilityStatus === 'checking'
                      ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                      : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  }`}
                >
                  {availabilityStatus === 'available' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                  {availabilityStatus === 'checking' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-amber-400" />}
                  {(availabilityStatus === 'taken' || availabilityStatus === 'invalid') && <XCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                  <span>{availabilityMessage}</span>
                </div>
              )}

              {/* Dynamic Generated URL Preview */}
              <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center gap-2 text-neutral-400">
                <LinkIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px]">Generated URL:</span>
                <strong className="text-amber-300 font-mono text-[11px] truncate">
                  {previewUrl}
                </strong>
              </div>
            </div>

            {/* 3. Google Owner Email */}
            <div>
              <label className="block text-[11px] font-black text-neutral-300 uppercase tracking-wider mb-1.5">
                Google Owner Email (Admin Account) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="owner@gmail.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Optional Custom Domain */}
            <div>
              <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-1.5">
                Custom Domain (Optional)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="e.g. abcshoes.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white font-mono text-xs focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* License Plan */}
            <div>
              <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-1.5">
                License Plan
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {['free', 'pro', 'enterprise'].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan })}
                    className={`p-2.5 text-center border rounded-xl font-bold uppercase transition-all text-[11px] ${
                      formData.plan === plan
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            {/* Automated Steps Banner */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl space-y-1.5">
              <h4 className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Automated Multi-Tenant Provisioning
              </h4>
              <ul className="text-[10px] text-emerald-200/80 space-y-0.5 ml-5 list-disc">
                <li>Registers unique URL slug on platform (<strong className="font-mono text-amber-300">/{formData.slug || 'slug'}</strong>)</li>
                <li>Applies strict website-level Firestore database query isolation</li>
                <li>Binds Google Admin login rights to <strong className="font-mono">{formData.ownerEmail || 'owner email'}</strong></li>
              </ul>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availabilityStatus === 'taken' || availabilityStatus === 'invalid'}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning Website...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5" />
                  <span>Create Website URL</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
