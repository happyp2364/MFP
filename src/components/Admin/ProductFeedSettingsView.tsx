import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sliders, Check, Save, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';

export const ProductFeedSettingsView: React.FC = () => {
  const { productFeedConfig, updateProductFeedConfig, showToast } = useStore();
  const [isSaving, setIsSaving] = useState(false);

  // Local Form State
  const [productsPerPage, setProductsPerPage] = useState(24);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [loadMoreButton, setLoadMoreButton] = useState(true);
  const [maxHomepageProducts, setMaxHomepageProducts] = useState(32);
  const [maxCategoryProducts, setMaxCategoryProducts] = useState(100);
  const [duplicateDetection, setDuplicateDetection] = useState(true);
  const [randomization, setRandomization] = useState(false);
  const [featuredPriority, setFeaturedPriority] = useState(10);
  const [trendingPriority, setTrendingPriority] = useState(8);
  const [bestSellerPriority, setBestSellerPriority] = useState(9);
  const [recentlyAddedPriority, setRecentlyAddedPriority] = useState(7);

  // Load from database/config
  useEffect(() => {
    if (productFeedConfig) {
      setProductsPerPage(productFeedConfig.productsPerPage || 24);
      setInfiniteScroll(productFeedConfig.infiniteScroll ?? false);
      setLoadMoreButton(productFeedConfig.loadMoreButton ?? true);
      setMaxHomepageProducts(productFeedConfig.maxHomepageProducts || 32);
      setMaxCategoryProducts(productFeedConfig.maxCategoryProducts || 100);
      setDuplicateDetection(productFeedConfig.duplicateDetection ?? true);
      setRandomization(productFeedConfig.randomization ?? false);
      setFeaturedPriority(productFeedConfig.featuredPriority ?? 10);
      setTrendingPriority(productFeedConfig.trendingPriority ?? 8);
      setBestSellerPriority(productFeedConfig.bestSellerPriority ?? 9);
      setRecentlyAddedPriority(productFeedConfig.recentlyAddedPriority ?? 7);
    }
  }, [productFeedConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProductFeedConfig({
        productsPerPage: Number(productsPerPage),
        infiniteScroll,
        loadMoreButton,
        maxHomepageProducts: Number(maxHomepageProducts),
        maxCategoryProducts: Number(maxCategoryProducts),
        duplicateDetection,
        randomization,
        featuredPriority: Number(featuredPriority),
        trendingPriority: Number(trendingPriority),
        bestSellerPriority: Number(bestSellerPriority),
        recentlyAddedPriority: Number(recentlyAddedPriority),
      });
      showToast?.('Product feed configurations saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to save product feed configurations', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('Are you sure you want to reset product feed settings to enterprise defaults?')) {
      setIsSaving(true);
      try {
        await updateProductFeedConfig({
          productsPerPage: 24,
          infiniteScroll: false,
          loadMoreButton: true,
          maxHomepageProducts: 32,
          maxCategoryProducts: 100,
          duplicateDetection: true,
          randomization: false,
          featuredPriority: 10,
          trendingPriority: 8,
          bestSellerPriority: 9,
          recentlyAddedPriority: 7,
        });
        showToast('Reset product feed configurations to default', 'success');
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div id="product-feed-settings" className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="font-serif-heading text-xl font-bold text-neutral-900">
            Product Feed & Inventory Listing Settings
          </h2>
          <p className="text-xs text-neutral-500">
            Configure layout behavior, smart caching, duplicate avoidance, and product mix algorithms.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetToDefaults}
          disabled={isSaving}
          className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1.5 rounded-lg border border-red-100 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Pagination & Layout Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="font-serif-heading font-bold text-sm text-neutral-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0B8F63]" />
            <span>Pagination & Layout Controls</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Control how deep and intensive the catalogs are. Recommending pagination with load buttons to prevent extreme browser load.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Products Per Page</label>
              <select
                value={productsPerPage}
                onChange={(e) => setProductsPerPage(Number(e.target.value))}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3 py-2.5 font-bold outline-none focus:ring-2 focus:ring-[#0B8F63]"
              >
                <option value={12}>12 Products</option>
                <option value={24}>24 Products (Recommended)</option>
                <option value={36}>36 Products</option>
                <option value={48}>48 Products</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Max Homepage Catalog Items</label>
              <input
                type="number"
                min={8}
                max={200}
                value={maxHomepageProducts}
                onChange={(e) => setMaxHomepageProducts(Number(e.target.value))}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3 py-2.5 font-bold outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Max Category Grid Items</label>
              <input
                type="number"
                min={12}
                max={500}
                value={maxCategoryProducts}
                onChange={(e) => setMaxCategoryProducts(Number(e.target.value))}
                className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl px-3 py-2.5 font-bold outline-none focus:ring-2 focus:ring-[#0B8F63]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={loadMoreButton}
                onChange={(e) => {
                  setLoadMoreButton(e.target.checked);
                  if (e.target.checked) setInfiniteScroll(false);
                }}
                className="mt-0.5 rounded text-[#0B8F63] focus:ring-[#0B8F63] w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Show "Load More" Button</span>
                <span className="text-[11px] text-neutral-500">Wait for click before loading subsequent product pages. Highly recommended.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={infiniteScroll}
                onChange={(e) => {
                  setInfiniteScroll(e.target.checked);
                  if (e.target.checked) setLoadMoreButton(false);
                }}
                className="mt-0.5 rounded text-[#0B8F63] focus:ring-[#0B8F63] w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Infinite Endless Scroll</span>
                <span className="text-[11px] text-neutral-500">Automatically trigger subsequent loading as user nears the footer threshold.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Caching & Duplicate Prevention Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="font-serif-heading font-bold text-sm text-neutral-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Deduplication & Quality Safeguards</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Ensure no product is ever presented multiple times on screen simultaneously. Active deduplication filters products at the render engine level.
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={duplicateDetection}
                onChange={(e) => setDuplicateDetection(e.target.checked)}
                className="mt-0.5 rounded text-[#0B8F63] focus:ring-[#0B8F63] w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-[#0B8F63] block">Active Auto-Deduplication Engine</span>
                <span className="text-[11px] text-neutral-500">
                  Scans Product ID, SKUs, Slugs, Barcodes, and Firestore Document Keys prior to rendering. Resolves duplicate products permanently.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={randomization}
                onChange={(e) => setRandomization(e.target.checked)}
                className="mt-0.5 rounded text-[#0B8F63] focus:ring-[#0B8F63] w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Randomize Mixed Segments</span>
                <span className="text-[11px] text-neutral-500">
                  Add slight variability to default mixed categories so the user discovers different elements on subsequent page refreshes.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Algorithm Priorities (Smart Mixing) */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="font-serif-heading font-bold text-sm text-neutral-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Smart Mix Algorithm & Priority Weightings</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Adjust weight factors (1 to 10) to define how catalog components mix products. High values force products of that category to display first.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Featured Products Priority (1-10)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={featuredPriority}
                onChange={(e) => setFeaturedPriority(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mt-1">
                <span>Low weight</span>
                <span className="text-neutral-900 font-extrabold">{featuredPriority}</span>
                <span>Max weight</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Trending Items Priority (1-10)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={trendingPriority}
                onChange={(e) => setTrendingPriority(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mt-1">
                <span>Low weight</span>
                <span className="text-neutral-900 font-extrabold">{trendingPriority}</span>
                <span>Max weight</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Best Seller Priority (1-10)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={bestSellerPriority}
                onChange={(e) => setBestSellerPriority(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mt-1">
                <span>Low weight</span>
                <span className="text-neutral-900 font-extrabold">{bestSellerPriority}</span>
                <span>Max weight</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Recently Added Priority (1-10)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={recentlyAddedPriority}
                onChange={(e) => setRecentlyAddedPriority(Number(e.target.value))}
                className="w-full accent-[#0B8F63]"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mt-1">
                <span>Low weight</span>
                <span className="text-neutral-900 font-extrabold">{recentlyAddedPriority}</span>
                <span>Max weight</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Durable Memory Persistence Guard</strong>
            <p className="text-amber-700/95">
              These configurations update the storefront parameters globally across all customer platforms in real-time. Modifications are cached in localStorage for resilient access even during slow connectivity.
            </p>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Feed Configurations</span>
          </button>
        </div>

      </form>
    </div>
  );
};
