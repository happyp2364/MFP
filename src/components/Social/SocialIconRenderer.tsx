import React from 'react';
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Youtube, 
  Send, 
  Twitter, 
  AtSign, 
  Pin, 
  Camera, 
  Linkedin, 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  Globe, 
  MessageSquareCode, 
  Share2 
} from 'lucide-react';

const LUCIDE_MAP: Record<string, React.ComponentType<any>> = {
  // Lowercase aliases matching default IDs
  instagram: Instagram,
  facebook: Facebook,
  whatsapp: MessageCircle,
  youtube: Youtube,
  telegram: Send,
  twitter: Twitter,
  threads: AtSign,
  pinterest: Pin,
  snapchat: Camera,
  linkedin: Linkedin,
  google_business: Briefcase,
  google_maps: MapPin,
  email: Mail,
  phone: Phone,
  website: Globe,
  discord: MessageSquareCode,

  // Direct case-sensitive mapping
  Instagram,
  Facebook,
  MessageCircle,
  Youtube,
  Send,
  Twitter,
  AtSign,
  Pin,
  Camera,
  Linkedin,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Globe,
  MessageSquareCode,
  Share2
};

interface SocialIconRendererProps {
  iconNameOrUrl?: string;
  platformId?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SocialIconRenderer: React.FC<SocialIconRendererProps> = ({
  iconNameOrUrl,
  platformId,
  className = "w-4 h-4",
  style
}) => {
  const identifier = (iconNameOrUrl || platformId || '').trim();

  // 1. Check if raw SVG code
  if (identifier.toLowerCase().startsWith('<svg')) {
    return (
      <div 
        className={`${className} flex items-center justify-center`}
        style={style}
        dangerouslySetInnerHTML={{ __html: identifier }}
      />
    );
  }

  // 2. Check if a URL (starts with http, https or has a file extension like .png, .jpg, .svg)
  if (
    identifier.startsWith('http://') || 
    identifier.startsWith('https://') || 
    identifier.startsWith('/') ||
    identifier.includes('.')
  ) {
    return (
      <img 
        src={identifier} 
        alt="" 
        className={`${className} object-contain`} 
        style={style}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    );
  }

  // 3. Lucide mapping
  const LucideIcon = LUCIDE_MAP[identifier] || LUCIDE_MAP[identifier.toLowerCase()] || Share2;
  return <LucideIcon className={className} style={style} />;
};
