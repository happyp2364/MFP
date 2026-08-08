import React, { useState, useEffect } from 'react';
import { Globe, Server, ShieldCheck, Mail, Link as LinkIcon, CheckCircle2, XCircle, RefreshCw, Crown, Palette, Settings, Building2, User, Phone, MapPin, Search, PlusCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Tenant } from '../../types';
import { sanitizeSlug, isValidSlug, isSlugAvailable } from '../../lib/tenantIsolation';
import { buildWebsiteUrl, buildAdminLoginUrl, getPlatformConfig } from '../../lib/platformConfig';

interface ProvisionWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvision: (tenantData: any) => Promise<any>;
  existingTenants?: Tenant[];
}

export const ProvisionWebsiteModal: React.FC<ProvisionWebsiteModalProps> = ({
  isOpen,
  onClose,
  onProvision,
  existingTenants = [],
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionResult, setProvisionResult] = useState<any>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Business Info
  const [name, setName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerGoogleEmail, setOwnerGoogleEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Website Info
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');

  // Theme Info
  const [defaultTheme, setDefaultTheme] = useState('modern_light');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');

  // Modules Info
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    products: true,
    orders: true,
    customers: true,
    reviews: true,
    coupons: true,
    marketing: true,
    homepageBuilder: true,
    inventory: true,
    seo: true,
    reports: true,
    ai: false,
    crm: false,
    storeLocator: false,
  });

  // Effect for Auto-slug
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      const generated = sanitizeSlug(name);
      setSlug(generated);
      if (generated) {
        checkSlugStatus(generated);
      } else {
        setAvailabilityStatus('idle');
        setAvailabilityMessage('');
      }
    }
  }, [name, slugManuallyEdited]);

  if (!isOpen) return null;

  const handleSlugChange = (raw: string) => {
    setSlugManuallyEdited(true);
    const cleaned = sanitizeSlug(raw);
    setSlug(cleaned);
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
        setAvailabilityMessage('Website Slug is already taken by another store.');
      }
    }, 200);
  };

  const toggleModule = (mod: string) => {
    setEnabledModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const handleSubmit = async () => {
    if (availabilityStatus !== 'available') return;
    setIsSubmitting(true);
    try {
      const data = {
        name,
        businessCategory,
        ownerName,
        ownerGoogleEmail,
        phone,
        country,
        state,
        city,
        pincode,
        slug,
        defaultTheme,
        primaryColor,
        secondaryColor,
        enabledModules,
        ownerEmail: ownerGoogleEmail,
      };
      const result = await onProvision(data);
      setProvisionResult(result);
      setStep(6); // Success Step
        } catch (err: any) {
      console.error('Provisioning Error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setProvisionError(msg);
      // alert removed so it shows in UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setProvisionResult(null);
    setName('');
    setBusinessCategory('');
    setOwnerName('');
    setOwnerGoogleEmail('');
    setPhone('');
    setState('');
    setCity('');
    setPincode('');
    setSlug('');
    setSlugManuallyEdited(false);
    onClose();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden flex shadow-2xl h-[85vh]">
        
        {/* Left Sidebar Steps */}
        <div className="w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col hidden md:flex">
          <h2 className="text-xl font-black text-white mb-8 tracking-tighter">Enterprise Provisioning</h2>
          <div className="space-y-6 flex-1">
            {[ 
              { id: 1, label: 'Business Info', icon: Building2 },
              { id: 2, label: 'Website URL', icon: Globe },
              { id: 3, label: 'Theme Config', icon: Palette },
              { id: 4, label: 'Modules', icon: Settings },
              { id: 5, label: 'Review & Create', icon: PlusCircle }
            ].map((s) => {
              const active = step === s.id;
              const completed = step > s.id;
              return (
                <div key={s.id} className={`flex items-center gap-3 transition-colors ${active ? 'text-amber-400' : completed ? 'text-emerald-500' : 'text-neutral-500'}`}>
                  <div className={`p-2 rounded-xl ${active ? 'bg-amber-500/10' : completed ? 'bg-emerald-500/10' : 'bg-neutral-800'}`}>
                    {completed ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col relative bg-neutral-950">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <h3 className="text-lg font-bold text-white">
              {step === 1 && '1. Business Information'}
              {step === 2 && '2. Website Slug & URL'}
              {step === 3 && '3. Theme & Brand'}
              {step === 4 && '4. Enterprise Modules'}
              {step === 5 && '5. Create Website'}
              {step === 6 && 'Website Provisioned Successfully!'}
            </h3>
            <button onClick={resetForm} className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-900 hover:bg-neutral-800 transition">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-neutral-950">
            {step === 1 && (
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="space-y-2 col-span-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Business Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" placeholder="e.g. ABC Shoes" />
                </div>
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Category</label>
                  <input type="text" value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" placeholder="e.g. Footwear" />
                </div>
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Owner Name</label>
                  <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" placeholder="Full Name" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Owner Google Email (Must match exactly)</label>
                  <input type="email" value={ownerGoogleEmail} onChange={(e) => setOwnerGoogleEmail(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" placeholder="google-email@gmail.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" placeholder="Mobile Number" />
                </div>
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">State</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Pincode</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none" />
                </div>
                {provisionError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs whitespace-pre-wrap font-mono mt-4 text-left">
                    {provisionError}
                  </div>
                )}

              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 text-xs">
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Website Slug</label>
                  <div className="relative">
                    <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-4 pr-12 text-amber-400 font-mono focus:border-amber-500 outline-none" placeholder="e.g. happy-footwear" />
                    <div className="absolute right-4 top-3">
                      {availabilityStatus === 'checking' && <RefreshCw className="w-4 h-4 text-neutral-500 animate-spin" />}
                      {availabilityStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {(availabilityStatus === 'taken' || availabilityStatus === 'invalid') && <XCircle className="w-4 h-4 text-rose-500" />}
                    </div>
                  </div>
                  <p className={`text-[10px] ${availabilityStatus === 'available' ? 'text-emerald-400' : 'text-rose-400'}`}>{availabilityMessage}</p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider block">Generated Website URL</label>
                  <div className="text-sky-400 font-mono text-sm">{buildWebsiteUrl(slug || '')}</div>
                </div>
                {provisionError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs whitespace-pre-wrap font-mono mt-4 text-left">
                    {provisionError}
                  </div>
                )}

              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-xs">
                <div className="space-y-2">
                  <label className="text-neutral-400 font-bold uppercase tracking-wider">Default Theme</label>
                  <select value={defaultTheme} onChange={(e) => setDefaultTheme(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:border-amber-500 outline-none">
                    <option value="modern_light">Modern Light</option>
                    <option value="luxury_dark">Luxury Dark</option>
                    <option value="sporty_bold">Sporty Bold</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-neutral-400 font-bold uppercase tracking-wider block">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-lg bg-neutral-900 cursor-pointer" />
                      <span className="font-mono text-neutral-300">{primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-neutral-400 font-bold uppercase tracking-wider block">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-12 rounded-lg bg-neutral-900 cursor-pointer" />
                      <span className="font-mono text-neutral-300">{secondaryColor}</span>
                    </div>
                  </div>
                </div>
                {provisionError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs whitespace-pre-wrap font-mono mt-4 text-left">
                    {provisionError}
                  </div>
                )}

              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                {Object.keys(enabledModules).map((mod) => (
                  <label key={mod} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${enabledModules[mod] ? 'bg-amber-500/10 border-amber-500/30' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'}`}>
                    <input type="checkbox" checked={enabledModules[mod]} onChange={() => toggleModule(mod)} className="accent-amber-500" />
                    <span className="font-bold text-white uppercase tracking-wider">{mod}</span>
                  </label>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-3xl text-center space-y-4">
                  <Crown className="w-12 h-12 text-amber-400 mx-auto" />
                  <h3 className="text-xl font-black text-white">Ready to Provision!</h3>
                  <p className="text-neutral-400 text-sm">You are about to securely provision a new Enterprise Website. Firestore collections, security mappings, and admin invitations will be automatically generated.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 uppercase tracking-wider font-bold">Business</span>
                    <p className="text-white font-bold">{name}</p>
                  </div>
                  <div className="p-4 bg-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 uppercase tracking-wider font-bold">URL</span>
                    <p className="text-sky-400 font-mono">{buildWebsiteUrl(slug)}</p>
                  </div>
                  <div className="p-4 bg-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 uppercase tracking-wider font-bold">Owner Email</span>
                    <p className="text-white">{ownerGoogleEmail}</p>
                  </div>
                  <div className="p-4 bg-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 uppercase tracking-wider font-bold">Modules Enabled</span>
                    <p className="text-amber-400 font-bold">{Object.values(enabledModules).filter(Boolean).length} modules</p>
                  </div>
                </div>
                {provisionError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs whitespace-pre-wrap font-mono mt-4 text-left">
                    {provisionError}
                  </div>
                )}

              </div>
            )}

            {step === 6 && provisionResult && (
              <div className="text-center space-y-8 animate-in zoom-in duration-500 py-8">
                <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Website Live!</h2>
                  <p className="text-emerald-400">Database provisioned and admin invitation pending.</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-left space-y-6 max-w-md mx-auto">
                  <div className="space-y-2">
                    <label className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Secret Activation Code</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={provisionResult.secretCode} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-amber-400 font-mono font-bold outline-none" />
                      <button onClick={() => copyToClipboard(provisionResult.secretCode, 'Secret Code')} className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition">Copy</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Website URL</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={buildWebsiteUrl(provisionResult.tenant.slug)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sky-400 font-mono text-xs outline-none" />
                      <button onClick={() => copyToClipboard(buildWebsiteUrl(provisionResult.tenant.slug), 'Website URL')} className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition">Copy</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Admin Login URL</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={buildAdminLoginUrl(provisionResult.tenant.slug)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-purple-400 font-mono text-xs outline-none" />
                      <button onClick={() => copyToClipboard(buildAdminLoginUrl(provisionResult.tenant.slug), 'Admin URL')} className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition">Copy</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <a href={buildWebsiteUrl(provisionResult.tenant.slug)} target="_blank" rel="noreferrer" className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl transition border border-neutral-800">
                    Open Website
                  </a>
                  <button onClick={resetForm} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition">
                    Done
                  </button>
                </div>
                {provisionError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs whitespace-pre-wrap font-mono mt-4 text-left">
                    {provisionError}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Footer Actions */}
          {step < 6 && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center">
              <button
                disabled={step === 1 || isSubmitting}
                onClick={() => setStep(s => s - 1)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition ${step === 1 ? 'opacity-0' : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800'}`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              {step < 5 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={(step === 1 && (!name || !ownerGoogleEmail)) || (step === 2 && availabilityStatus !== 'available')}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Data...</>
                  ) : (
                    <><Server className="w-4 h-4" /> Provision Firestore Instance</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
