import React, { useState } from 'react';
import {
  X,
  Plus,
  Layout,
  Tag,
  ShoppingBag,
  Sparkles,
  Zap,
  CheckCircle,
  HelpCircle,
  Video,
  Instagram,
  Star,
  Clock,
  Grid,
} from 'lucide-react';
import { HomepageSection, HomepageSectionType } from '../../../types';
import { FLOATING_SNEAKER_DEFAULT_SECTION } from '../../../data/defaultHomepagePresets';

interface SectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (newSection: HomepageSection) => void;
}

interface SectionTemplate {
  type: HomepageSectionType;
  category: 'banners' | 'products' | 'promotions' | 'trust_social' | 'info';
  title: string;
  description: string;
  icon: React.ElementType;
  defaultData: Record<string, any>;
}

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'floating_sneaker',
    category: 'banners',
    title: '👟 Floating Sneaker Glass Hero',
    description: 'Luxury floating sneaker centerpiece layout with soft neutral backdrop, glassmorphism cards, and floating badges.',
    icon: Sparkles,
    defaultData: FLOATING_SNEAKER_DEFAULT_SECTION.contentData,
  },
  {
    type: 'hero_banner',
    category: 'banners',
    title: 'Hero Banner / Slider',
    description: 'High-impact full-screen hero banner with CTA button and badge.',
    icon: Layout,
    defaultData: {
      slides: [
        {
          id: 'slide_1',
          title: 'Royal Footwear Collection 2026',
          subtitle: 'Up to 50% OFF on Premium Sneakers & Handcrafted Leather Loafers',
          badgeText: 'New Season Drop',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'SHOP FOOTWEAR SALE',
          buttonLink: '/products',
        },
      ],
    },
  },
  {
    type: 'featured_products',
    category: 'products',
    title: 'Featured Products Grid',
    description: 'Showcase curated handpicked products in a responsive grid.',
    icon: ShoppingBag,
    defaultData: {
      limit: 8,
      category: 'ALL',
      viewAllLink: '/products',
    },
  },
  {
    type: 'flash_sale',
    category: 'promotions',
    title: 'Flash Sale Countdown',
    description: 'Urgency countdown timer with flash deals and discount tags.',
    icon: Zap,
    defaultData: {
      targetDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      badgeText: 'FLASH DEAL - LIMITED STOCK',
      limit: 6,
    },
  },
  {
    type: 'categories',
    category: 'products',
    title: 'Category Spotlight Showcase',
    description: 'Visual category cards with background images and counts.',
    icon: Grid,
    defaultData: {
      categories: ["Men's Sports Shoes", "Women's Sports Shoes", "Casual Sneakers", "Kids Footwear", "Loafers & Formals", "Slippers & Slides"],
    },
  },
  {
    type: 'offer_cards',
    category: 'promotions',
    title: 'Promo Banners & Offer Grid',
    description: '2 or 3 column promo banners highlighting discounts and perks.',
    icon: Tag,
    defaultData: {
      items: [
        {
          id: 'offer_1',
          title: 'Flat ₹500 OFF',
          subtitle: 'Use Code: ROYAL500',
          imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
          buttonText: 'Claim Offer',
          buttonLink: '/coupons',
        },
        {
          id: 'offer_2',
          title: 'Buy 1 Get 1 Free',
          subtitle: 'On Selected Sports Shoes & Sneakers',
          imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600',
          buttonText: 'Shop BOGO',
          buttonLink: '/products',
        },
      ],
    },
  },
  {
    type: 'customer_reviews',
    category: 'trust_social',
    title: 'Customer Reviews Carousel',
    description: 'Social proof carousel with verified star ratings and photos.',
    icon: Star,
    defaultData: {
      limit: 6,
      ratingFilter: 5,
    },
  },
  {
    type: 'why_choose_us',
    category: 'trust_social',
    title: 'Trust Badges & Value Props',
    description: 'Express shipping, COD, 100% genuine products, open box checks.',
    icon: CheckCircle,
    defaultData: {
      items: [
        { title: 'Free Express Shipping', desc: 'On orders above ₹999 across India', icon: 'truck' },
        { title: '100% Genuine Quality', desc: 'Authentic handcrafted ethnic wear', icon: 'shield' },
        { title: 'Open Box Delivery', desc: 'Inspect before handover at delivery', icon: 'package' },
        { title: 'Instant Support', desc: '24/7 Dedicated WhatsApp support', icon: 'phone' },
      ],
    },
  },
  {
    type: 'faqs',
    category: 'info',
    title: 'FAQ Accordion',
    description: 'Collapsible frequently asked questions for quick answers.',
    icon: HelpCircle,
    defaultData: {
      faqs: [
        { q: 'How do I place an order via WhatsApp?', a: 'Click the Buy on WhatsApp button on any product page for direct ordering.' },
        { q: 'Is Cash on Delivery (COD) available?', a: 'Yes! COD is available across 25,000+ pincodes in India.' },
      ],
    },
  },
];

export const SectionLibraryModal: React.FC<SectionLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTemplates = SECTION_TEMPLATES.filter((tpl) =>
    selectedCategory === 'all' ? true : tpl.category === selectedCategory
  );

  const handleSelectTemplate = (template: SectionTemplate) => {
    const newSection: HomepageSection = {
      id: `sec_${template.type}_${Date.now()}`,
      type: template.type,
      title: template.title,
      subtitle: template.description,
      enabled: true,
      visibleDevices: ['desktop', 'tablet', 'mobile'],
      styling: {
        bgColor: '#ffffff',
        textColor: '#171717',
        paddingTop: 32,
        paddingBottom: 32,
        fullWidth: true,
      },
      contentData: template.defaultData,
    };
    onAddSection(newSection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Homepage Section Library</h3>
              <p className="text-xs text-neutral-400">Select a section component to add to your homepage layout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-2 pt-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All Sections' },
            { id: 'banners', label: 'Hero & Banners' },
            { id: 'products', label: 'Products & Grid' },
            { id: 'promotions', label: 'Deals & Offers' },
            { id: 'trust_social', label: 'Trust & Reviews' },
            { id: 'info', label: 'FAQ & Info' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 max-h-[65vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const IconComp = template.icon;
            return (
              <div
                key={template.type}
                onClick={() => handleSelectTemplate(template)}
                className="group border border-neutral-200 hover:border-emerald-500 hover:shadow-lg rounded-xl p-4 bg-white cursor-pointer transition-all flex items-start gap-4"
              >
                <div className="p-3 bg-neutral-100 group-hover:bg-emerald-50 text-neutral-700 group-hover:text-emerald-600 rounded-xl transition-colors">
                  <IconComp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-neutral-900 group-hover:text-emerald-700 flex items-center justify-between">
                    {template.title}
                    <Plus className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
