export type ResponsiveDevice = 'desktop' | 'tablet' | 'mobile';

export interface SectionResponsiveConfig {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  marginTop: number;
  marginBottom: number;
  width: 'full' | 'wide' | 'standard' | 'compact';
  horizontalAlign: 'left' | 'center' | 'right' | 'stretch';
  textAlign: 'left' | 'center' | 'right';
  gridColumns: number;
  gap: number;
  borderRadius: number;
}

export interface PageSectionConfig {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  desktop: SectionResponsiveConfig;
  tablet: SectionResponsiveConfig;
  mobile: SectionResponsiveConfig;
}

export interface WebsiteLayoutConfig {
  homeSectionOrder: string[];
  sections: Record<string, PageSectionConfig>;
}

export interface HeaderDesignSettings {
  height: number;
  horizontalPadding: number;
  verticalPadding: number;
  logoWidth: number;
  logoHeight: number;
  navGap: number;
  iconSize: number;
  buttonHeight: number;
  buttonRadius: number;
}

export interface CardDesignSettings {
  borderRadius: number;
  padding: number;
  imageRadius: number;
  gap: number;
}

export interface CategoryCardDesignSettings {
  borderRadius: number;
  height: number;
  imageSize: number;
  gap: number;
  padding: number;
}

export interface ButtonDesignSettings {
  borderRadius: number;
  height: number;
  horizontalPadding: number;
  iconSize: number;
}

export interface IconDesignSettings {
  globalSize: number;
  headerSize: number;
  productSize: number;
  categorySize: number;
  actionSize: number;
  floatingActionSize: number;
}

export interface SectionDesignSettings {
  sectionSpacing: number;
  topSpacing: number;
  bottomSpacing: number;
  contentPadding: number;
  gridGap: number;
  headingSpacing: number;
}

export interface ProductCardDesignSettings {
  borderRadius: number;
  imageRadius: number;
  padding: number;
  gap: number;
}

export interface FloatingActionDesignSettings {
  size: number;
  iconSize: number;
  gap: number;
}

export interface WebsiteDesignSettings {
  header: HeaderDesignSettings;
  cards: CardDesignSettings;
  categoryCards: CategoryCardDesignSettings;
  buttons: ButtonDesignSettings;
  icons: IconDesignSettings;
  sections: SectionDesignSettings;
  productCards: ProductCardDesignSettings;
  floatingActions: FloatingActionDesignSettings;
  layout?: WebsiteLayoutConfig;
  updatedAt?: string;
  updatedBy?: string;
}

