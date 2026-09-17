export interface FestivalExperience {
  id: string;
  name: string;
  subtitle: string;
  announcementText: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeLabel: string;
  icon: string;
  particlesType: 'color_splash' | 'diya_glow' | 'snowflake' | 'confetti' | 'none';
  decorationMotif: 'holi_splatters' | 'diya_lights' | 'christmas_lights' | 'new_year_stars' | 'none';
}

export const FESTIVALS_REGISTRY: Record<string, FestivalExperience> = {
  none: {
    id: 'none',
    name: 'No Active Festival',
    subtitle: 'Standard base theme appearance without seasonal overlays.',
    announcementText: '',
    heroBadge: '✨ NEW COLLECTION 2026',
    heroTitle: 'Step into Extraordinary Style',
    heroSubtitle: 'Discover premium footwear crafted for elegance, comfort, and uncompromising quality.',
    primaryColor: '#0B8F63',
    secondaryColor: '#1E293B',
    accentColor: '#F59E0B',
    badgeLabel: '',
    icon: '✨',
    particlesType: 'none',
    decorationMotif: 'none',
  },
  holi: {
    id: 'holi',
    name: '🌈 Vibrant Holi Experience',
    subtitle: 'The Festival of Colors! Immersive gulal splashes, vibrant color gradients, and festive cheer.',
    announcementText: '🌈 HAPPY HOLI! Celebrate the Festival of Colors with Exclusive Festive Dispatches & Specials! 🎨',
    heroBadge: '🌈 HOLI FESTIVAL SPECIAL',
    heroTitle: 'रंगों के त्योहार में रंग जाएं',
    heroSubtitle: 'Celebrate vibrant styles with Marudhar Fashion Point. Exploding colors, unbeatable festive looks!',
    primaryColor: '#EC4899', // Pink/Magenta
    secondaryColor: '#8B5CF6', // Purple
    accentColor: '#F59E0B', // Yellow/Orange
    badgeLabel: '🌈 HOLI SPECIAL',
    icon: '🎨',
    particlesType: 'color_splash',
    decorationMotif: 'holi_splatters',
  },
  diwali: {
    id: 'diwali',
    name: '🪔 Royal Diwali Celebration',
    subtitle: 'Festival of Lights! Warm golden glows, diya decorations, and opulent celebratory styling.',
    announcementText: '🪔 HAPPY DIWALI! Light up your wardrobe with our Royal Festive Collections & Special Offers! ✨',
    heroBadge: '🪔 DIWALI FESTIVAL OF LIGHTS',
    heroTitle: 'Light Up Your Festive Elegance',
    heroSubtitle: 'Step out in grand celebratory style with handcrafted footwear fit for royalty.',
    primaryColor: '#D97706', // Warm Gold/Amber
    secondaryColor: '#9333EA', // Royal Purple
    accentColor: '#FBBF24',
    badgeLabel: '🪔 DIWALI SPECIAL',
    icon: '🪔',
    particlesType: 'diya_glow',
    decorationMotif: 'diya_lights',
  },
  christmas: {
    id: 'christmas',
    name: '🎄 Merry Christmas & Winter',
    subtitle: 'Snowflakes, festive reds & emeralds, and cozy winter celebrations.',
    announcementText: '🎄 MERRY CHRISTMAS! Unwrap joy with festive gifts and cozy seasonal footwear! ❄️',
    heroBadge: '🎄 HOLIDAY SEASON GIFTING',
    heroTitle: 'Merry & Bright Winter Steps',
    heroSubtitle: 'Embrace the festive cheer with warm, stylish winter footwear collections.',
    primaryColor: '#DC2626', // Festive Red
    secondaryColor: '#059669', // Emerald Green
    accentColor: '#FBBF24', // Gold
    badgeLabel: '❄️ WINTER FEST',
    icon: '🎄',
    particlesType: 'snowflake',
    decorationMotif: 'christmas_lights',
  },
  new_year: {
    id: 'new_year',
    name: '🎉 New Year Celebration',
    subtitle: 'Sparkling confetti, celebratory golden touches, and midnight countdown energy.',
    announcementText: '🎉 HAPPY NEW YEAR! Step into 2026 with brand new arrivals and celebratory styles! ✨',
    heroBadge: '🎉 2026 CELEBRATION EDIT',
    heroTitle: 'Step Boldly Into the New Year',
    heroSubtitle: 'Fresh style, fresh energy. Explore our exclusive New Year footwear releases.',
    primaryColor: '#4F46E5', // Indigo
    secondaryColor: '#DB2777', // Pink
    accentColor: '#F59E0B', // Gold
    badgeLabel: '🎉 NEW YEAR',
    icon: '🎉',
    particlesType: 'confetti',
    decorationMotif: 'new_year_stars',
  },
};
