import React, { createContext, useContext, ReactNode } from 'react';
import { recordAuditLog } from '../lib/firebase';
import { mapTabToModule } from '../lib/adminPermissions';

// Import domain sub-providers & hooks
import { AppConfigProvider, useAppConfig } from './AppConfigContext';
import { PlatformProvider, usePlatform } from './PlatformContext';
import { FeatureFlagProvider, useFeatureFlags } from './FeatureFlagContext';
import { MediaProvider, useMedia } from './MediaContext';
import { AuditProvider, useAudit } from './AuditContext';
import { PermissionProvider, usePermission } from './PermissionContext';
import { WebsiteIdentityProvider, useWebsiteIdentity } from './WebsiteIdentityContext';
import { AppearanceProvider, useAppearance } from './AppearanceContext';
import { SEOProvider, useSEO } from './SEOContext';
import { StoreLocatorProvider, useStoreLocator } from './StoreLocatorContext';
import { PolicyProvider, usePolicy } from './PolicyContext';
import { AIPetProvider, useAIPet } from './AIPetContext';
import { AISEOProvider, useAISEO } from './AISEOContext';
import { AIMarketingProvider, useAIMarketing } from './AIMarketingContext';
import { AIRecommendationProvider, useAIRecommendation } from './AIRecommendationContext';
import { AuthProvider, useAuth } from './AuthContext';
import { ProductProvider, useProducts } from './ProductContext';
import { OrderProvider, useOrders } from './OrderContext';
import { CartProvider, useCart } from './CartContext';
import { CustomerProvider, useCustomer } from './CustomerContext';
import { MarketingProvider, useMarketing } from './MarketingContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { NotificationProvider, useNotifications } from './NotificationContext';

// Re-export constants for full backward compatibility
export { DEFAULT_PRODUCT_FEED_CONFIG } from './AppConfigContext';
export { DEFAULT_SEO_CONFIG } from './SEOContext';
export { DEFAULT_AI_MARKETING_GROWTH_CONFIG } from './AIMarketingContext';

// Create Unified Store Context Facade
const StoreContext = createContext<any>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppConfigProvider>
      <PlatformProvider>
        <FeatureFlagProvider>
          <MediaProvider>
            <AuditProvider>
              <PermissionProvider>
                <WebsiteIdentityProvider>
                  <AppearanceProvider>
                    <SEOProvider>
                      <StoreLocatorProvider>
                        <PolicyProvider>
                          <AIPetProvider>
                            <AISEOProvider>
                              <AIMarketingProvider>
                                <AIRecommendationProvider>
                                  <AuthProvider>
                                    <ProductProvider>
                                      <OrderProvider>
                                        <CartProvider>
                                          <CustomerProvider>
                                            <MarketingProvider>
                                              <AdminProvider>
                                                <NotificationProvider>
                                                  <StoreContextFacadeBridge>{children}</StoreContextFacadeBridge>
                                                </NotificationProvider>
                                              </AdminProvider>
                                            </MarketingProvider>
                                          </CustomerProvider>
                                        </CartProvider>
                                      </OrderProvider>
                                    </ProductProvider>
                                  </AuthProvider>
                                </AIRecommendationProvider>
                              </AIMarketingProvider>
                            </AISEOProvider>
                          </AIPetProvider>
                        </PolicyProvider>
                      </StoreLocatorProvider>
                    </SEOProvider>
                  </AppearanceProvider>
                </WebsiteIdentityProvider>
              </PermissionProvider>
            </AuditProvider>
          </MediaProvider>
        </FeatureFlagProvider>
      </PlatformProvider>
    </AppConfigProvider>
  );
};

const StoreContextFacadeBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const appConfig = useAppConfig();
  const platform = usePlatform();
  const featureFlags = useFeatureFlags();
  const media = useMedia();
  const audit = useAudit();
  const permission = usePermission();
  const websiteIdentity = useWebsiteIdentity();
  const appearance = useAppearance();
  const seo = useSEO();
  const storeLocator = useStoreLocator();
  const policy = usePolicy();
  const aiPet = useAIPet();
  const aiSEO = useAISEO();
  const aiMarketing = useAIMarketing();
  const aiRecommendation = useAIRecommendation();
  const auth = useAuth();
  const products = useProducts();
  const orders = useOrders();
  const cart = useCart();
  const customer = useCustomer();
  const marketing = useMarketing();
  const admin = useAdmin();
  const notifications = useNotifications();

  // Unified facade value preserving 100% of the original useStore() interface
  const combinedContextValue = {
    // Products & Reviews
    products: products.products,
    addProduct: products.addProduct,
    updateProduct: products.updateProduct,
    deleteProduct: products.deleteProduct,
    toggleInStock: products.toggleInStock,
    reviews: products.reviews,
    addReview: products.addReview,
    updateReview: products.updateReview,
    deleteReview: products.deleteReview,
    voteHelpfulReview: products.voteHelpfulReview,

    // Store Info & Platform
    storeInfo: platform.publishedStoreInfo,
    publishedStoreInfo: platform.publishedStoreInfo,
    updateStoreInfo: platform.updateStoreInfo,
    createStoreBackup: platform.createStoreBackup,
    restoreStoreBackup: platform.restoreStoreBackup,
    publishedVersions: platform.publishedVersions,
    publishWebsite: platform.publishWebsite,
    restorePublishedVersion: platform.restorePublishedVersion,
    resetToDefaults: platform.resetToDefaults,

    // App Config & Settings
    productFeedConfig: appConfig.productFeedConfig,
    updateProductFeedConfig: appConfig.updateProductFeedConfig,
    buttonThemeConfig: appConfig.buttonThemeConfig,
    updateButtonThemeConfig: appConfig.updateButtonThemeConfig,
    whatsappTemplatesConfig: appConfig.whatsappTemplatesConfig,
    updateWhatsAppTemplatesConfig: appConfig.updateWhatsAppTemplatesConfig,
    resetWhatsAppTemplatesToDefault: appConfig.resetWhatsAppTemplatesToDefault,
    openBoxDeliveryConfig: appConfig.openBoxDeliveryConfig,
    updateOpenBoxDeliveryConfig: appConfig.updateOpenBoxDeliveryConfig,
    paymentSettings: appConfig.paymentSettings,
    updatePaymentSettings: appConfig.updatePaymentSettings,

    // Feature Flags & Gamification
    spinWheelConfig: featureFlags.spinWheelConfig,
    updateSpinWheelConfig: featureFlags.updateSpinWheelConfig,
    scratchWinConfig: featureFlags.scratchWinConfig,
    updateScratchWinConfig: featureFlags.updateScratchWinConfig,
    engagementAnalytics: featureFlags.engagementAnalytics,
    recordEngagementMetric: featureFlags.recordEngagementMetric,
    orderCelebrationConfig: featureFlags.orderCelebrationConfig,
    updateOrderCelebrationConfig: featureFlags.updateOrderCelebrationConfig,
    isCelebrating: featureFlags.isCelebrating,
    setIsCelebrating: featureFlags.setIsCelebrating,
    triggerGlobalCelebration: featureFlags.triggerGlobalCelebration,

    // Media & Social
    instagramConfig: media.instagramConfig,
    updateInstagramConfig: media.instagramConfig,
    socialMediaConfig: media.socialMediaConfig,
    updateSocialMediaConfig: media.updateSocialMediaConfig,
    socialAnalytics: media.socialAnalytics,
    recordSocialClick: media.recordSocialClick,

    // Audit Logs
    auditLogs: audit.auditLogs,
    refreshAuditLogs: audit.refreshAuditLogs,
    recordAuditLog: recordAuditLog,

    // RBAC & Permissions
    adminUsersList: permission.adminUsers,
    adminUsers: permission.adminUsers,
    adminRolesList: permission.adminRoles,
    adminRoles: permission.adminRoles,
    checkPermission: permission.checkPermission,
    hasPermission: (mod: any, act: any) => permission.checkPermission(auth.currentAdminUser, mod, act),
    canAccessTab: (tab: string) => {
      if (!auth.currentAdminUser) return false;
      const isSuper = Boolean(
        auth.currentAdminUser.roleId === 'super_admin' ||
        auth.currentAdminUser.email?.toLowerCase() === 'vpcreation2002@gmail.com' ||
        auth.currentAdminUser.email?.toLowerCase() === 'vishalpparihar2002@gmail.com'
      );
      if (tab === 'super_admin_console' || tab === 'admin_management') {
        return isSuper;
      }
      if (isSuper) {
        return true;
      }
      const module = mapTabToModule(tab);
      return permission.checkPermission(auth.currentAdminUser, module, 'read');
    },

    // Website Identity
    websiteConfig: websiteIdentity.websiteConfig,
    updateWebsiteConfig: websiteIdentity.updateWebsiteConfig,

    // Appearance & Customization
    homepageConfig: appearance.homepageConfig,
    updateHomepageConfig: appearance.updateHomepageConfig,
    homepageVersions: appearance.homepageVersions,
    fetchHomepageVersionsList: appearance.fetchHomepageVersionsList,
    rollbackHomepageVersion: appearance.rollbackHomepageVersion,
    heroContent: appearance.heroContent,
    updateHeroContent: appearance.updateHeroContent,
    announcementsList: appearance.announcementsList,
    announcements: appearance.announcementsList.map(a => a.text),
    setAnnouncementsList: appearance.setAnnouncementsList,
    categoryHighlights: appearance.categoryHighlights,
    updateCategoryHighlight: appearance.updateCategoryHighlight,
    saveCategoryHighlights: appearance.saveCategoryHighlights,
    trendingCollections: appearance.trendingCollections,
    updateTrendingCollection: appearance.updateTrendingCollection,
    topAnnouncementBarConfig: appearance.topAnnouncementBarConfig,
    updateTopAnnouncementBarConfig: appearance.updateTopAnnouncementBarConfig,
    megaMenuCategories: appearance.megaMenuCategories,
    saveMegaMenuCategories: appearance.saveMegaMenuCategories,
    mobileCategories: appearance.mobileCategories,
    updateMobileCategories: appearance.updateMobileCategories,
    productCardConfig: appearance.productCardDesignerConfig,
    updateProductCardConfig: appearance.updateProductCardDesignerConfig,
    trendingShoesConfig: appearance.trendingShoesConfig,
    updateTrendingShoesConfig: appearance.updateTrendingShoesConfig,
    pricePointConfig: appearance.pricePointConfig,
    updatePricePointConfig: appearance.updatePricePointConfig,

    // SEO
    seoConfig: seo.seoConfig,
    updateSEOConfig: seo.updateSEOConfig,

    // Physical Stores
    physicalStores: storeLocator.physicalStores,
    addPhysicalStore: storeLocator.addPhysicalStore,
    updatePhysicalStore: storeLocator.updatePhysicalStore,
    deletePhysicalStore: storeLocator.deletePhysicalStore,
    togglePhysicalStoreStatus: storeLocator.togglePhysicalStoreStatus,

    // Policies
    aboutUsConfig: policy.aboutUsConfig,
    updateAboutUsConfig: policy.updateAboutUsConfig,

    // AI sub-features
    petShoeConfig: aiPet.petShoeConfig,
    updatePetShoeConfig: aiPet.updatePetShoeConfig,
    generateProductSEO: aiSEO.generateProductSEO,
    aiMarketingGrowthConfig: aiMarketing.aiMarketingGrowthConfig,
    updateAIMarketingGrowthConfig: aiMarketing.updateAIMarketingGrowthConfig,
    getSmartRecommendations: aiRecommendation.getSmartRecommendations,

    // Auth
    isAdmin: auth.isAdmin,
    isSuperAdmin: auth.isSuperAdmin,
    currentAdminUser: auth.currentAdminUser,
    customerUser: auth.customerUser,
    customerProfile: auth.customerProfile,
    isCustomerAuthLoading: auth.isCustomerAuthLoading,
    customerAuthError: auth.customerAuthError,
    isTwoFactorEnabled: auth.isTwoFactorEnabled,
    loginAdmin: auth.loginAdmin,
    loginWithGoogleAdmin: auth.loginWithGoogleAdmin,
    logoutAdmin: auth.logoutAdmin,
    changeAdminPassword: auth.changeAdminPassword,
    toggleTwoFactor: auth.toggleTwoFactor,
    verifyReAuthentication: auth.verifyReAuthentication,
    customerSignInWithGoogle: auth.customerSignInWithGoogle,
    customerSignOut: auth.customerSignOut,
    updateCustomerProfileInFirestore: auth.updateCustomerProfileInFirestore,

    // Orders
    orders: orders.orders,
    placeOrderAndPay: orders.placeOrderAndPay,
    updateOrderStatus: orders.updateOrderStatus,
    cancelCustomerOrder: orders.cancelCustomerOrder,

    // Cart
    cart: cart.cart,
    addToCart: cart.addToCart,
    removeFromCart: cart.removeFromCart,
    updateCartQuantity: cart.updateCartQuantity,
    clearCart: cart.clearCart,
    cartTotal: cart.cartTotal,
    cartCount: cart.cartCount,

    // Customer & Audio
    soundConfig: customer.soundConfig,
    updateSoundConfig: customer.updateSoundConfig,
    customerSoundSettings: customer.customerSoundSettings,
    updateCustomerSoundSettings: customer.updateCustomerSoundSettings,
    playSiteSound: customer.playSiteSound,

    // Marketing & Coupons
    coupons: marketing.coupons,
    addCoupon: marketing.addCoupon,
    updateCoupon: marketing.updateCoupon,
    deleteCoupon: marketing.deleteCoupon,
    duplicateCoupon: marketing.duplicateCoupon,
    validateCoupon: marketing.validateCoupon,
    trackCouponUse: marketing.trackCouponUse,
    campaigns: marketing.campaigns,
    subscribers: marketing.subscribers,
    updateCustomerMarketingConsent: marketing.updateCustomerMarketingConsent,
    saveCampaign: marketing.saveCampaign,
    deleteCampaign: marketing.deleteCampaign,
    sendCampaign: marketing.sendCampaign,
    updateSubscriberConsent: marketing.updateSubscriberConsent,
    refreshMarketingData: marketing.refreshMarketingData,

    // Admin CRUD
    createAdminUser: admin.createAdminUser,
    updateAdminUser: admin.updateAdminUser,
    deleteAdminUser: admin.deleteAdminUser,
    createAdminRole: admin.createAdminRole,
    updateAdminRole: admin.updateAdminRole,
    deleteAdminRole: admin.deleteAdminRole,

    // Notifications & Toasts
    notifications: notifications.notifications,
    activeOrderNotification: notifications.activeOrderNotification,
    markNotificationRead: notifications.markNotificationRead,
    clearAllNotifications: notifications.clearAllNotifications,
    toastMessage: notifications.toastMessage,
    showToast: notifications.showToast,

    // Stubs & Legacy Properties
    hasPendingDraft: false,
    pendingDraftCount: 0,
    pendingChangesList: [],
    lastPublishedAt: new Date().toISOString(),
    lastPublishedBy: 'Real-Time Firestore System',
    previewMode: 'live',
    togglePreviewMode: () => {},
    discardDraft: async () => {},
  };

  return <StoreContext.Provider value={combinedContextValue}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
