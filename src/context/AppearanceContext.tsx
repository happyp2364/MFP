import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  HomepageConfig,
  HomepageVersion,
  HeroContent,
  AnnouncementItem,
  CategoryHighlight,
  TrendingCollectionItem,
  TopAnnouncementBarConfig,
  MegaMenuCategory,
  MobileCategoryIcon,
  ProductCardDesignerConfig,
  TrendingShoesCollectionConfig,
  PricePointCollectionConfig,
} from '../types';
import { DEFAULT_HOMEPAGE_CONFIG } from '../data/defaultHomepagePresets';
import { DEFAULT_HERO_CONTENT, ANNOUNCEMENT_ITEMS, CATEGORY_HIGHLIGHTS, TRENDING_COLLECTIONS, DEFAULT_MEGA_MENU_CATEGORIES, DEFAULT_TOP_ANNOUNCEMENT_BAR_CONFIG } from '../data/mockData';
import { DEFAULT_MOBILE_CATEGORY_ICONS } from '../data/defaultMobileCategories';
import { DEFAULT_PRODUCT_CARD_CONFIG, DEFAULT_TRENDING_SHOES_CONFIG, DEFAULT_PRICE_POINT_CONFIG } from '../types';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  subscribeToHomepageConfig,
  saveHomepageConfigToFirestore,
  fetchHomepageConfigFromFirestore,
  fetchHomepageVersionsFromFirestore,
  rollbackHomepageVersionInFirestore,
} from '../lib/homepageService';

interface AppearanceContextType {
  homepageConfig: HomepageConfig;
  updateHomepageConfig: (newConfig: HomepageConfig, note?: string) => Promise<boolean>;
  homepageVersions: HomepageVersion[];
  fetchHomepageVersionsList: () => Promise<void>;
  rollbackHomepageVersion: (versionId: string) => Promise<boolean>;
  heroContent: HeroContent;
  updateHeroContent: (content: HeroContent) => Promise<void>;
  announcementsList: AnnouncementItem[];
  setAnnouncementsList: (items: AnnouncementItem[]) => Promise<void>;
  categoryHighlights: CategoryHighlight[];
  updateCategoryHighlight: (highlight: CategoryHighlight) => Promise<void>;
  saveCategoryHighlights: (highlights: CategoryHighlight[]) => Promise<void>;
  trendingCollections: TrendingCollectionItem[];
  updateTrendingCollection: (item: TrendingCollectionItem) => Promise<void>;
  topAnnouncementBarConfig: TopAnnouncementBarConfig;
  updateTopAnnouncementBarConfig: (config: TopAnnouncementBarConfig) => Promise<void>;
  megaMenuCategories: MegaMenuCategory[];
  saveMegaMenuCategories: (categories: MegaMenuCategory[]) => Promise<void>;
  mobileCategories: MobileCategoryIcon[];
  updateMobileCategories: (categories: MobileCategoryIcon[]) => Promise<void>;
  productCardDesignerConfig: ProductCardDesignerConfig;
  updateProductCardDesignerConfig: (config: ProductCardDesignerConfig) => Promise<void>;
  trendingShoesConfig: TrendingShoesCollectionConfig;
  updateTrendingShoesConfig: (config: TrendingShoesCollectionConfig) => Promise<void>;
  pricePointConfig: PricePointCollectionConfig;
  updatePricePointConfig: (config: PricePointCollectionConfig) => Promise<void>;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export const AppearanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() => {
    try {
      const saved = localStorage.getItem('mfp_homepage_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_HOMEPAGE_CONFIG;
  });

  const [homepageVersions, setHomepageVersions] = useState<HomepageVersion[]>([]);

  const [heroContent, setHeroContent] = useState<HeroContent>(() => {
    try {
      const saved = localStorage.getItem('mfp_hero_content');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch (e) {}
    return DEFAULT_HERO_CONTENT;
  });

  const defaultAnnouncements: AnnouncementItem[] = ANNOUNCEMENT_ITEMS.map((item: any, idx: number) => ({
    id: `ann_${idx}`,
    text: typeof item === 'string' ? item : item.text || '',
    enabled: true,
  }));
  const [announcementsList, setAnnouncementsListState] = useState<AnnouncementItem[]>(defaultAnnouncements);
  const [categoryHighlights, setCategoryHighlightsState] = useState<CategoryHighlight[]>(CATEGORY_HIGHLIGHTS);
  const [trendingCollections, setTrendingCollectionsState] = useState<TrendingCollectionItem[]>(TRENDING_COLLECTIONS);

  const [topAnnouncementBarConfig, setTopAnnouncementBarConfig] = useState<TopAnnouncementBarConfig>(() => {
    try {
      const saved = localStorage.getItem('mfp_top_announcement_bar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TOP_ANNOUNCEMENT_BAR_CONFIG;
  });
  const [megaMenuCategories, setMegaMenuCategoriesState] = useState<MegaMenuCategory[]>(DEFAULT_MEGA_MENU_CATEGORIES);
  const [mobileCategories, setMobileCategoriesState] = useState<MobileCategoryIcon[]>(DEFAULT_MOBILE_CATEGORY_ICONS);
  const [productCardDesignerConfig, setProductCardDesignerConfig] = useState<ProductCardDesignerConfig>(DEFAULT_PRODUCT_CARD_CONFIG);
  const [trendingShoesConfig, setTrendingShoesConfig] = useState<TrendingShoesCollectionConfig>(DEFAULT_TRENDING_SHOES_CONFIG);
  const [pricePointConfig, setPricePointConfig] = useState<PricePointCollectionConfig>(DEFAULT_PRICE_POINT_CONFIG);

  useEffect(() => {
    // Initial fetch from canonical Firestore / LocalStorage
    fetchHomepageConfigFromFirestore().then((cfg) => {
      if (cfg) setHomepageConfig(cfg);
    });

    // Realtime subscription
    const unsubTheme = subscribeToHomepageConfig((cfg) => {
      setHomepageConfig(cfg);
    });

    const unsubHero = onSnapshot(doc(db, 'settings', 'hero_content'), (snapshot) => {
      if (snapshot.exists()) setHeroContent(snapshot.data() as HeroContent);
    }, () => {});

    const unsubTopAnnounce = onSnapshot(doc(db, 'settings', 'top_announcement_bar'), (snapshot) => {
      if (snapshot.exists()) setTopAnnouncementBarConfig(snapshot.data() as TopAnnouncementBarConfig);
    }, () => {});

    fetchHomepageVersionsList();

    return () => {
      unsubTheme();
      unsubHero();
      unsubTopAnnounce();
    };
  }, []);

  const updateHomepageConfig = async (newConfig: HomepageConfig, note?: string): Promise<boolean> => {
    const success = await saveHomepageConfigToFirestore(newConfig, 'Admin User', note);
    if (success) {
      setHomepageConfig(newConfig);
    }
    return success;
  };

  const fetchHomepageVersionsList = async () => {
    const vers = await fetchHomepageVersionsFromFirestore();
    setHomepageVersions(vers);
  };

  const rollbackHomepageVersion = async (versionId: string): Promise<boolean> => {
    const success = await rollbackHomepageVersionInFirestore(versionId, 'Admin User');
    if (success) {
      await fetchHomepageVersionsList();
    }
    return success;
  };

  const updateHeroContent = async (content: HeroContent) => {
    setHeroContent(content);
    localStorage.setItem('mfp_hero_content', JSON.stringify(content));
    try {
      await setDoc(doc(db, 'settings', 'hero_content'), content, { merge: true });
    } catch (e) {
      console.warn('Firestore hero content sync failed', e);
    }
  };

  const setAnnouncementsList = async (items: AnnouncementItem[]) => {
    setAnnouncementsListState(items);
  };

  const updateCategoryHighlight = async (highlight: CategoryHighlight) => {
    const updated = categoryHighlights.map((ch) => (ch.id === highlight.id ? highlight : ch));
    setCategoryHighlightsState(updated);
  };

  const saveCategoryHighlights = async (highlights: CategoryHighlight[]) => {
    setCategoryHighlightsState(highlights);
  };

  const updateTrendingCollection = async (item: TrendingCollectionItem) => {
    const updated = trendingCollections.map((tc) => (tc.id === item.id ? item : tc));
    setTrendingCollectionsState(updated);
  };

  const updateTopAnnouncementBarConfig = async (config: TopAnnouncementBarConfig) => {
    setTopAnnouncementBarConfig(config);
    localStorage.setItem('mfp_top_announcement_bar', JSON.stringify(config));
    try {
      await setDoc(doc(db, 'settings', 'top_announcement_bar'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore top announcement bar sync failed', e);
    }
  };

  const saveMegaMenuCategories = async (categories: MegaMenuCategory[]) => {
    setMegaMenuCategoriesState(categories);
  };

  const updateMobileCategories = async (categories: MobileCategoryIcon[]) => {
    setMobileCategoriesState(categories);
  };

  const updateProductCardDesignerConfig = async (config: ProductCardDesignerConfig) => {
    setProductCardDesignerConfig(config);
  };

  const updateTrendingShoesConfig = async (config: TrendingShoesCollectionConfig) => {
    setTrendingShoesConfig(config);
  };

  const updatePricePointConfig = async (config: PricePointCollectionConfig) => {
    setPricePointConfig(config);
  };

  return (
    <AppearanceContext.Provider
      value={{
        homepageConfig,
        updateHomepageConfig,
        homepageVersions,
        fetchHomepageVersionsList,
        rollbackHomepageVersion,
        heroContent,
        updateHeroContent,
        announcementsList,
        setAnnouncementsList,
        categoryHighlights,
        updateCategoryHighlight,
        saveCategoryHighlights,
        trendingCollections,
        updateTrendingCollection,
        topAnnouncementBarConfig,
        updateTopAnnouncementBarConfig,
        megaMenuCategories,
        saveMegaMenuCategories,
        mobileCategories,
        updateMobileCategories,
        productCardDesignerConfig,
        updateProductCardDesignerConfig,
        trendingShoesConfig,
        updateTrendingShoesConfig,
        pricePointConfig,
        updatePricePointConfig,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance must be used within AppearanceProvider');
  return context;
};
