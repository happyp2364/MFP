import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  MessageCircle,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  ExternalLink,
  Info,
  Car,
  CreditCard,
  Package,
  Footprints,
  Accessibility,
  UserCheck,
  Tag,
  Share2,
  Copy,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PhysicalStore } from '../../types';
import { StoreGallerySwiper } from './StoreGallerySwiper';

interface StoreLocatorPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreLocatorPage: React.FC<StoreLocatorPageProps> = ({
  isOpen,
  onClose,
}) => {
  const { physicalStores, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'featured'>('all');
  const [selectedStore, setSelectedStore] = useState<PhysicalStore | null>(null);
  const [detailModalStore, setDetailModalStore] = useState<PhysicalStore | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<Record<string, number>>({});

  // Active Map Center (Defaults to Jodhpur 26.2918, 73.0168)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 26.2918,
    lng: 73.0168,
  });
  const [mapZoom, setMapZoom] = useState(11);

  // Active stores (enabled only)
  const enabledStores = useMemo(() => {
    return physicalStores.filter((s) => s.isEnabled !== false);
  }, [physicalStores]);

  // Request Customer Geolocation
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(13);
        setIsLocating(false);
        showToast('📍 Nearest stores calculated based on your live location!', 'success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        showToast('Unable to detect live GPS location. You can search by City or Pincode.', 'info');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Distance calculation helper (Haversine formula in KM)
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filtered and Sorted Stores
  const filteredStores = useMemo(() => {
    let result = enabledStores.filter((store) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        store.name.toLowerCase().includes(q) ||
        store.city.toLowerCase().includes(q) ||
        store.area.toLowerCase().includes(q) ||
        store.state.toLowerCase().includes(q) ||
        store.pincode.includes(q) ||
        store.address.toLowerCase().includes(q);

      if (activeFilter === 'open') return matchesSearch && store.isOpen;
      if (activeFilter === 'featured') return matchesSearch && store.isFeatured;
      return matchesSearch;
    });

    // If user location is available, sort by distance
    if (userLocation) {
      result = [...result].sort((a, b) => {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return result;
  }, [enabledStores, searchQuery, activeFilter, userLocation]);

  // Handle store card click
  const handleSelectStore = (store: PhysicalStore) => {
    setSelectedStore(store);
    setMapCenter({ lat: store.latitude, lng: store.longitude });
    setMapZoom(15);
  };

  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-md flex flex-col overflow-hidden animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="bg-neutral-950 text-white border-b border-neutral-800 px-4 py-3.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <MapPin className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Marudhar Store Locator & Outlets
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                {enabledStores.length} Live Branches
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              Find nearest Marudhar Fashion Point store for Shoe Trial & Open Box Delivery
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
          aria-label="Close Store Locator"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Search & Store Cards List */}
        <div className="w-full lg:w-[480px] xl:w-[520px] bg-neutral-50 flex flex-col border-r border-neutral-200 overflow-hidden shrink-0">
          {/* Search Header */}
          <div className="p-4 bg-white border-b border-neutral-200 space-y-3 shadow-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by City, Area, State, or Pincode (e.g. Jodhpur, Ratanada, 342001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-neutral-100 border border-neutral-200 rounded-2xl focus:outline-none focus:bg-white focus:border-emerald-500 font-medium transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs & GPS Button */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pt-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  All Stores
                </button>
                <button
                  onClick={() => setActiveFilter('open')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'open'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  🟢 Open Now
                </button>
                <button
                  onClick={() => setActiveFilter('featured')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'featured'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  ⭐ Featured
                </button>
              </div>

              <button
                onClick={handleFindNearMe}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-2xs"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
              </button>
            </div>
          </div>

          {/* Store Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-neutral-100">
            {filteredStores.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-16 h-16 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mx-auto">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-800">No stores found</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  No Marudhar Fashion Point outlets match "{searchQuery}". Try searching for another city like Jodhpur, Jaipur, or Udaipur.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700"
                >
                  View All Outlets
                </button>
              </div>
            ) : (
              filteredStores.map((store) => {
                const isSelected = selectedStore?.id === store.id;
                const activeImgIdx = activePhotoIndex[store.id] || 0;
                const images = store.images && store.images.length > 0
                  ? store.images
                  : ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'];

                const distanceKm = userLocation
                  ? calculateDistanceKm(userLocation.lat, userLocation.lng, store.latitude, store.longitude)
                  : null;

                return (
                  <div
                    key={store.id}
                    onClick={() => handleSelectStore(store)}
                    className={`pt-4 first:pt-0 group transition-all cursor-pointer rounded-2xl border ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 p-4'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 p-4 shadow-2xs'
                    }`}
                  >
                    {/* Store Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {store.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black uppercase">
                              ⭐ FEATURED
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${
                              store.isOpen
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${store.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {store.isOpen ? 'OPEN TODAY' : 'CLOSED TODAY'}
                          </span>

                          {distanceKm !== null && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-bold">
                              📍 {distanceKm.toFixed(1)} km away
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-neutral-900 group-hover:text-emerald-700 transition-colors leading-snug">
                          {store.name}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-neutral-600 mt-0.5">
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                            <span>{store.rating}</span>
                          </div>
                          <span className="text-neutral-300">•</span>
                          <span className="text-neutral-500 font-medium">
                            {store.reviewsCount} Google Reviews
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailModalStore(store);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Address & Hours */}
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                      <strong className="text-neutral-800">Address:</strong> {store.address}, {store.area ? `${store.area}, ` : ''}{store.city}, {store.state} - {store.pincode}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-neutral-700 mt-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold">{store.openingHoursToday}</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium">{store.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Available Services Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {store.services.slice(0, 4).map((srv) => (
                        <span
                          key={srv}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60"
                        >
                          ✓ {srv}
                        </span>
                      ))}
                      {store.services.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                          +{store.services.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Store Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-neutral-100">
                      {/* Call Button */}
                      <a
                        href={`tel:${store.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call</span>
                      </a>

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${store.whatsapp || '919829012345'}?text=Hi%20Marudhar%20Fashion%20Point%20${encodeURIComponent(store.name)},%20I%20want%20to%20inquire%20about%20shoe%20stock.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Get Directions Button */}
                      <a
                        href={store.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: Interactive Google Map */}
        <div className="flex-1 bg-neutral-900 relative min-h-[350px] lg:min-h-full">
          {API_KEY ? (
            <APIProvider apiKey={API_KEY}>
              <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={mapCenter}
                center={mapCenter}
                defaultZoom={mapZoom}
                zoom={mapZoom}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                {filteredStores.map((store) => (
                  <AdvancedMarker
                    key={store.id}
                    position={{ lat: store.latitude, lng: store.longitude }}
                    onClick={() => handleSelectStore(store)}
                  >
                    <Pin
                      background={selectedStore?.id === store.id ? '#0B8F63' : '#111827'}
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                    />
                  </AdvancedMarker>
                ))}

                {userLocation && (
                  <AdvancedMarker position={userLocation}>
                    <div className="p-2 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white animate-pulse">
                      <Navigation className="w-4 h-4" />
                    </div>
                  </AdvancedMarker>
                )}

                {selectedStore && (
                  <InfoWindow
                    position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
                    onCloseClick={() => setSelectedStore(null)}
                  >
                    <div className="p-2 space-y-1 text-neutral-900 max-w-xs">
                      <h4 className="font-extrabold text-sm text-neutral-900">{selectedStore.name}</h4>
                      <p className="text-xs text-neutral-600">{selectedStore.address}</p>
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="font-bold text-amber-600">⭐ {selectedStore.rating}</span>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.latitude},${selectedStore.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-bold underline text-xs"
                        >
                          Directions →
                        </a>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* Fallback Interactive Map Container */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-neutral-900 via-neutral-950 to-black relative">
              <iframe
                title="Marudhar Stores Map Preview"
                src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=12&output=embed`}
                className="w-full h-full border-0 absolute inset-0 opacity-80"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs font-bold text-emerald-400 shadow-xl flex items-center gap-2 z-10">
                <MapPin className="w-4 h-4" />
                <span>Showing {filteredStores.length} Stores on Map</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Store Details Modal */}
      {detailModalStore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-neutral-100 my-8">
            {/* Store Title Header Bar */}
            <div className="p-5 sm:p-6 bg-neutral-950 text-white flex items-start justify-between gap-4 border-b border-neutral-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                    OFFICIAL BRANCH
                  </span>
                  <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-400/30">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{detailModalStore.rating} ({detailModalStore.reviewsCount} Google Reviews)</span>
                  </div>
                  {detailModalStore.isOpen && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                      OPEN TODAY
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{detailModalStore.name}</h2>
                <p className="text-xs text-neutral-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{detailModalStore.address}, {detailModalStore.area ? `${detailModalStore.area}, ` : ''}{detailModalStore.city}, {detailModalStore.state} - {detailModalStore.pincode}</span>
                </p>
              </div>

              <button
                onClick={() => setDetailModalStore(null)}
                className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-2xl transition-colors cursor-pointer shrink-0"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Horizontal Swipable Image Gallery Component */}
              <StoreGallerySwiper store={detailModalStore} />

              {/* Special Offer Banner */}
              {detailModalStore.specialOffers && (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 border border-amber-300/60 rounded-2xl flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">In-Store Special Promotion</span>
                    <p className="text-xs font-bold text-amber-950 mt-0.5">{detailModalStore.specialOffers}</p>
                  </div>
                </div>
              )}

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-2">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Timing & Availability</span>
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Today: {detailModalStore.openingHoursToday}</span>
                  </div>
                  <div className="text-neutral-600 text-[11px] font-medium">
                    {detailModalStore.openingHoursWeek}
                  </div>
                  <div className="text-emerald-700 font-extrabold text-[11px]">
                    ✓ {detailModalStore.holidayTiming || 'Open 365 Days'}
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-2">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Branch Contact</span>
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{detailModalStore.phone || '+91 98290 12345'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp: {detailModalStore.whatsapp || '+91 98290 12345'}</span>
                  </div>
                  <div className="text-neutral-600 font-medium text-[11px]">
                    Manager: {detailModalStore.managerName || 'General Staff'}
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <h4 className="font-extrabold text-sm text-neutral-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Available Services & Privileges at this Store
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {detailModalStore.services.map((srv) => (
                    <div key={srv} className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setDetailModalStore(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-100 cursor-pointer text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${detailModalStore.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Store
                </a>
                <a
                  href={`https://wa.me/${detailModalStore.whatsapp || '919829012345'}?text=Hi%20Marudhar%20Fashion%20Point%20${encodeURIComponent(detailModalStore.name)},%20I%20want%20to%20inquire%20about%20shoe%20stock.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={detailModalStore.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${detailModalStore.latitude},${detailModalStore.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
