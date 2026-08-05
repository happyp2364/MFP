import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Building,
  Store,
  Users,
  Package,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
} from 'lucide-react';
import { PhysicalStore, StoreGalleryPhoto, StoreGalleryPhotoCategory } from '../../types';

interface StoreGallerySwiperProps {
  store: PhysicalStore;
}

interface NormalizedPhoto {
  id: string;
  url: string;
  title: string;
  category: StoreGalleryPhotoCategory;
  description?: string;
}

const CATEGORY_META: Record<
  StoreGalleryPhotoCategory | 'all',
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  all: { label: 'All Photos', icon: Layers, color: 'bg-neutral-800 text-white' },
  exterior: { label: 'Exterior View', icon: Building, color: 'bg-blue-600 text-white' },
  interior: { label: 'Interior Lounge', icon: Store, color: 'bg-emerald-600 text-white' },
  staff: { label: 'Staff & Team', icon: Users, color: 'bg-purple-600 text-white' },
  display: { label: 'Displays & Stock', icon: Package, color: 'bg-amber-600 text-white' },
};

export const StoreGallerySwiper: React.FC<StoreGallerySwiperProps> = ({ store }) => {
  const [selectedCategory, setSelectedCategory] = useState<StoreGalleryPhotoCategory | 'all'>('all');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Autoplay states
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Touch Swipe gesture fallback state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Normalize photos array
  const allPhotos = useMemo<NormalizedPhoto[]>(() => {
    if (store.galleryPhotos && store.galleryPhotos.length > 0) {
      return store.galleryPhotos.map((p, idx) => ({
        id: p.id || `photo-${idx}`,
        url: p.url,
        title: p.title || `${store.name} Photo #${idx + 1}`,
        category: p.category || (idx === 0 ? 'exterior' : idx === 1 ? 'interior' : 'staff'),
        description: p.description,
      }));
    }

    // Fallback if only store.images string array exists
    const fallbackImages =
      store.images && store.images.length > 0
        ? store.images
        : ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80'];

    return fallbackImages.map((url, idx) => {
      let cat: StoreGalleryPhotoCategory = 'exterior';
      let title = 'Storefront Exterior';
      if (idx === 1) {
        cat = 'interior';
        title = 'Air-Conditioned Showroom & Shoe Lounge';
      } else if (idx === 2) {
        cat = 'staff';
        title = 'Friendly Store Team & Fit Consultation';
      } else if (idx >= 3) {
        cat = 'display';
        title = 'Footwear Display & Stock Collection';
      }

      return {
        id: `photo-fallback-${idx}`,
        url,
        title: `${store.name} — ${title}`,
        category: cat,
        description: `High-resolution preview of ${store.name} (${store.city})`,
      };
    });
  }, [store]);

  // Filter photos by selected category
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return allPhotos;
    return allPhotos.filter((p) => p.category === selectedCategory);
  }, [allPhotos, selectedCategory]);

  // Pagination Helper Callback
  const paginate = useCallback(
    (newDirection: number) => {
      if (filteredPhotos.length <= 1) return;
      setSlideDirection(newDirection);
      setActiveSlideIndex((prevIndex) => {
        if (newDirection > 0) {
          return (prevIndex + 1) % filteredPhotos.length;
        } else {
          return (prevIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        }
      });
    },
    [filteredPhotos.length]
  );

  const goToSlide = useCallback(
    (targetIndex: number) => {
      if (targetIndex === activeSlideIndex) return;
      setSlideDirection(targetIndex > activeSlideIndex ? 1 : -1);
      setActiveSlideIndex(targetIndex);
    },
    [activeSlideIndex]
  );

  // Reset index when category changes
  useEffect(() => {
    setSlideDirection(1);
    setActiveSlideIndex(0);
  }, [selectedCategory]);

  // Ensure active index is valid
  const currentPhoto = filteredPhotos[activeSlideIndex] || filteredPhotos[0] || allPhotos[0];

  // Counts by category
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allPhotos.length, exterior: 0, interior: 0, staff: 0, display: 0 };
    allPhotos.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [allPhotos]);

  // Auto-playing carousel effect (cycles every 3 seconds)
  useEffect(() => {
    if (!isAutoplayActive || isHovered || isFullscreen || filteredPhotos.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      paginate(1);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoplayActive, isHovered, isFullscreen, filteredPhotos.length, paginate]);

  // Touch Swipe Handlers (fallback)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      paginate(1);
    } else if (distance < -40) {
      paginate(-1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, paginate]);

  // Framer motion sliding variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      zIndex: 1,
      x: '0%',
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.97,
    }),
  };

  return (
    <div className="space-y-3 select-none">
      {/* Header Title & Category Pills Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="font-extrabold text-sm text-neutral-900 tracking-tight">
            Store Visual Gallery
          </h4>
          <span className="text-xs text-neutral-500 font-medium">
            ({allPhotos.length} High-Res Photos)
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-full">
          {(['all', 'exterior', 'interior', 'staff', 'display'] as const).map((cat) => {
            const count = counts[cat] || 0;
            if (cat !== 'all' && count === 0) return null;
            const meta = CATEGORY_META[cat];
            const IconComp = meta.icon;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-emerald-500/50'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span>{meta.label}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Swipable Viewport */}
      <div
        className="relative h-72 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-xl group cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Active Photo with Smooth Luxury Motion Slide */}
        <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
          {currentPhoto ? (
            <motion.img
              key={currentPhoto.id}
              src={currentPhoto.url}
              alt={currentPhoto.title}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 280, damping: 28 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (offset.x < -40 || swipe < -400) {
                  paginate(1);
                } else if (offset.x > 40 || swipe > 400) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 select-none pointer-events-auto"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500">
              No photos available
            </div>
          )}
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none z-10" />

        {/* Top Floating Controls */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20 gap-2">
          {/* Category Tag */}
          {currentPhoto && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/20 backdrop-blur-md ${
                  CATEGORY_META[currentPhoto.category]?.color || 'bg-neutral-900 text-white'
                }`}
              >
                {React.createElement(CATEGORY_META[currentPhoto.category]?.icon || Building, {
                  className: 'w-3.5 h-3.5',
                })}
                <span>{CATEGORY_META[currentPhoto.category]?.label || currentPhoto.category}</span>
              </span>
            </div>
          )}

          {/* Controls: Autoplay Toggle, Counter & Fullscreen Zoom */}
          <div className="flex items-center gap-2">
            {/* Autoplay Play/Pause Manual Override Toggle */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoplayActive((prev) => !prev);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer ${
                  isAutoplayActive && !isHovered
                    ? 'bg-emerald-600/90 text-white border-emerald-400/50 shadow-md ring-2 ring-emerald-500/30'
                    : isAutoplayActive && isHovered
                    ? 'bg-amber-600/90 text-white border-amber-400/50 shadow-md'
                    : 'bg-black/60 text-neutral-300 border-white/20 hover:bg-black/80'
                }`}
                title={
                  isAutoplayActive
                    ? isHovered
                      ? 'Autoplay PAUSED (Hovering). Click to toggle.'
                      : 'Autoplay ACTIVE (3s cycle). Click to pause.'
                    : 'Autoplay PAUSED. Click to resume.'
                }
              >
                {isAutoplayActive && !isHovered ? (
                  <Pause className="w-3 h-3 text-white fill-white animate-pulse" />
                ) : isAutoplayActive && isHovered ? (
                  <Pause className="w-3 h-3 text-amber-200 fill-amber-200" />
                ) : (
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                )}
                <span className="text-[10px] uppercase font-extrabold tracking-wider">
                  {isAutoplayActive ? (isHovered ? 'Paused' : '3s Auto') : 'Manual'}
                </span>
              </button>
            )}

            <span className="px-3 py-1 rounded-full bg-black/60 text-white border border-white/20 text-xs font-bold backdrop-blur-md">
              {activeSlideIndex + 1} / {filteredPhotos.length}
            </span>

            <button
              onClick={() => {
                setZoomLevel(1);
                setIsFullscreen(true);
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-emerald-600 text-white border border-white/20 transition-colors backdrop-blur-md cursor-pointer shadow-lg"
              title="Expand Fullscreen Lightbox"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {filteredPhotos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/70 hover:bg-emerald-600 text-white transition-all backdrop-blur-md z-20 cursor-pointer opacity-90 hover:scale-110 shadow-lg"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/70 hover:bg-emerald-600 text-white transition-all backdrop-blur-md z-20 cursor-pointer opacity-90 hover:scale-110 shadow-lg"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Caption, Pagination Dots & Swipe Indicator */}
        <div className="absolute bottom-3 left-4 right-4 z-20 text-white space-y-2">
          {/* Subtle Pagination Dots Row */}
          {filteredPhotos.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pb-0.5">
              {filteredPhotos.map((_, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <button
                    key={`dot-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(idx);
                    }}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? 'w-6 h-1.5 bg-emerald-400 shadow-sm shadow-emerald-500/50'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80 hover:scale-125'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          )}

          <div className="space-y-1">
            <h5 className="text-base sm:text-lg font-black leading-tight drop-shadow-md">
              {currentPhoto?.title}
            </h5>
            {currentPhoto?.description && (
              <p className="text-xs text-neutral-300 font-medium line-clamp-2 drop-shadow-xs">
                {currentPhoto.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold pt-2 border-t border-white/10 mt-1">
            <span>👈 Drag or click arrows • Smooth spring motion</span>
            <span className="hidden sm:inline-block">Hover to pause • Click to zoom</span>
          </div>
        </div>
      </div>

      {/* Horizontal Thumbnails Carousel */}
      {filteredPhotos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 snap-x">
          {filteredPhotos.map((photo, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={photo.id}
                onClick={() => goToSlide(idx)}
                className={`relative w-20 sm:w-24 h-16 sm:h-18 rounded-2xl overflow-hidden shrink-0 transition-all cursor-pointer snap-start border-2 ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105 opacity-100 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'
                }`}
              >
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-extrabold text-white">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between text-white shrink-0 z-20 pb-2">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  CATEGORY_META[currentPhoto.category]?.color || 'bg-neutral-800'
                }`}
              >
                {React.createElement(CATEGORY_META[currentPhoto.category]?.icon || Building, {
                  className: 'w-4 h-4',
                })}
                <span>{CATEGORY_META[currentPhoto.category]?.label}</span>
              </span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">{currentPhoto.title}</h3>
                <p className="text-xs text-neutral-400 hidden sm:block">{store.name} ({store.city})</p>
              </div>
            </div>

            {/* Zoom & Close Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-1 text-xs">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
                  className="p-1.5 hover:bg-neutral-800 text-neutral-300 rounded-xl"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-neutral-400">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 hover:bg-neutral-800 text-neutral-300 rounded-xl"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 hover:bg-neutral-800 text-amber-400 rounded-xl"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Fullscreen Lightbox Content */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
              <motion.div
                key={currentPhoto.id}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 280, damping: 28 },
                  opacity: { duration: 0.25 },
                }}
                className="transition-transform duration-200 max-w-full max-h-full flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-neutral-800"
                />
              </motion.div>
            </AnimatePresence>

            {/* Left/Right Lightbox Arrows */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={() => paginate(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-3xl bg-neutral-900/80 hover:bg-emerald-600 text-white transition-all backdrop-blur-md cursor-pointer border border-neutral-800 hover:scale-110 shadow-2xl z-30"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => paginate(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-3xl bg-neutral-900/80 hover:bg-emerald-600 text-white transition-all backdrop-blur-md cursor-pointer border border-neutral-800 hover:scale-110 shadow-2xl z-30"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Strip */}
          <div className="shrink-0 space-y-2 z-20">
            {/* Lightbox Pagination Dots */}
            {filteredPhotos.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pb-1">
                {filteredPhotos.map((_, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <button
                      key={`lightbox-dot-${idx}`}
                      onClick={() => goToSlide(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        isActive
                          ? 'w-6 h-1.5 bg-emerald-400 shadow-sm shadow-emerald-500/50'
                          : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80 hover:scale-125'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>
            )}

            {currentPhoto.description && (
              <p className="text-center text-xs text-neutral-300 font-medium max-w-2xl mx-auto bg-neutral-900/80 py-2 px-4 rounded-xl border border-neutral-800 backdrop-blur-md">
                {currentPhoto.description}
              </p>
            )}

            {/* Lightbox Thumbnails */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-1">
              {filteredPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => goToSlide(idx)}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${
                    idx === activeSlideIndex
                      ? 'border-emerald-500 ring-2 ring-emerald-500 scale-105 opacity-100'
                      : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
