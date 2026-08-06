import React, { useState } from 'react';
import { Globe, Plus, Server, CheckCircle2, ShieldCheck, Mail, Database } from 'lucide-react';
import { Tenant } from '../../types';

interface ProvisionWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvision: (tenantData: Partial<Tenant>) => Promise<void>;
}

export const ProvisionWebsiteModal: React.FC<ProvisionWebsiteModalProps> = ({
  isOpen,
  onClose,
  onProvision,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    ownerEmail: '',
    plan: 'free',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onProvision({
        ...formData,
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Provision New Website</h2>
            <p className="text-xs text-neutral-400">Launch a new white-label website instance.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-2">
                Website Name
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Fashion Store"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-2">
                Custom Domain
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="e.g. acmestore.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-2">
                Owner Email (Admin Account)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="owner@acmestore.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-2">
                License Plan
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['free', 'pro', 'enterprise'].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan })}
                    className={`p-3 text-center border rounded-xl text-xs font-bold uppercase transition-all ${
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
            
            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl space-y-2 mt-4">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Automated Provisioning Steps
              </h4>
              <ul className="text-[11px] text-emerald-200/70 space-y-1 ml-6 list-disc">
                <li>Create isolated Firebase Firestore collections</li>
                <li>Initialize default layout & theme settings</li>
                <li>Generate Admin account & trigger welcome email</li>
                <li>Apply selected license constraints</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <span>Provisioning...</span>
              ) : (
                <>
                  <Server className="w-4 h-4" />
                  <span>Launch Website</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
