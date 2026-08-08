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
import { onTenantCollectionSnapshot, onTenantDocSnapshot } from '../lib/onSnapshotMultiTenant';
import { getTenantCollectionWriteRef, getTenantDocWriteRef } from '../lib/firestoreMultiTenant';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface AppearanceContextType {
  homepageConfig: HomepageConfig;
  updateHomepageConfig: (newConfig: HomepageConfig) => Promise<void>;
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
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [homepageVersions, setHomepageVersions] = useState<HomepageVersion[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const defaultAnnouncements: AnnouncementItem[] = ANNOUNCEMENT_ITEMS.map((item: any, idx: number) => ({
    id: `ann_${idx}`,
    text: typeof item === 'string' ? item : item.text || '',
    enabled: true,
  }));
  const [announcementsList, setAnnouncementsListState] = useState<AnnouncementItem[]>(defaultAnnouncements);
  const [categoryHighlights, setCategoryHighlightsState] = useState<CategoryHighlight[]>(CATEGORY_HIGHLIGHTS);
  const [trendingCollections, setTrendingCollectionsState] = useState<TrendingCollectionItem[]>(TRENDING_COLLECTIONS);
  const [topAnnouncementBarConfig, setTopAnnouncementBarConfig] = useState<TopAnnouncementBarConfig>(DEFAULT_TOP_ANNOUNCEMENT_BAR_CONFIG);
  const [megaMenuCategories, setMegaMenuCategoriesState] = useState<MegaMenuCategory[]>(DEFAULT_MEGA_MENU_CATEGORIES);
  const [mobileCategories, setMobileCategoriesState] = useState<MobileCategoryIcon[]>(DEFAULT_MOBILE_CATEGORY_ICONS);
  const [productCardDesignerConfig, setProductCardDesignerConfig] = useState<ProductCardDesignerConfig>(DEFAULT_PRODUCT_CARD_CONFIG);
  const [trendingShoesConfig, setTrendingShoesConfig] = useState<TrendingShoesCollectionConfig>(DEFAULT_TRENDING_SHOES_CONFIG);
  const [pricePointConfig, setPricePointConfig] = useState<PricePointCollectionConfig>(DEFAULT_PRICE_POINT_CONFIG);

  useEffect(() => {
    const unsubHero = onTenantDocSnapshot(db, 'settings', 'hero_content', (snapshot) => {
      if (snapshot.exists()) setHeroContent(snapshot.data() as HeroContent);
    }, () => {});

    const unsubTopAnnounce = onTenantDocSnapshot(db, 'settings', 'top_announcement_bar', (snapshot) => {
      if (snapshot.exists()) setTopAnnouncementBarConfig(snapshot.data() as TopAnnouncementBarConfig);
    }, () => {});

    return () => {
      unsubHero();
      unsubTopAnnounce();
    };
  }, []);

  const updateHomepageConfig = async (newConfig: HomepageConfig) => {
    setHomepageConfig(newConfig);
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'homepage_config'), newConfig, { merge: true });
    } catch (e) {
      console.warn('Firestore homepage config sync failed', e);
    }
  };

  const fetchHomepageVersionsList = async () => {};
  const rollbackHomepageVersion = async (_versionId: string) => true;

  const updateHeroContent = async (content: HeroContent) => {
    setHeroContent(content);
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'hero_content'), content, { merge: true });
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
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'top_announcement_bar'), config, { merge: true });
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
