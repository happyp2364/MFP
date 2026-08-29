import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Star, CheckCircle, MessageSquarePlus, X, HeartHandshake, UserCheck, Sparkles, ShieldCheck, ShoppingBag, LogIn, ThumbsUp, Camera, UploadCloud, Trash2, Maximize2, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Review } from '../../types';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export interface ReviewsSectionProps {
  productId?: string;
  title?: string;
  subtitle?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  productId,
  title = "Loved by 15,000+ Families",
  subtitle = "Real reviews from real customers who trust Marudhar Fashion Point for wedding footwear, school shoes, and daily fashion."
}) => {
  const {
    reviews,
    addReview,
    voteHelpfulReview,
    customerUser,
    customerProfile,
    customerSignInWithGoogle,
    isCustomerAuthLoading,
    products,
    orders,
  } = useStore();

  const [votedReviewIds, setVotedReviewIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('voted_review_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleVoteHelpful = async (reviewId: string) => {
    if (votedReviewIds.has(reviewId)) return;
    const next = new Set(votedReviewIds);
    next.add(reviewId);
    setVotedReviewIds(next);
    try {
      localStorage.setItem('voted_review_ids', JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
    await voteHelpfulReview(reviewId);
  };

  const [selectedRatingFilter, setSelectedRatingFilter] = useState<'ALL' | number>('ALL');
  const [onlyWithPhotos, setOnlyWithPhotos] = useState<boolean>(false);

  // Filter reviews if a specific product ID is passed
  const activeReviews = useMemo(() => {
    if (!productId) return reviews;
    return reviews.filter(
      (r) => r.productBought?.toLowerCase() === productId.toLowerCase() || r.id === productId
    );
  }, [reviews, productId]);

  const totalReviewsCount = activeReviews.length;

  const averageRatingNumber = useMemo(() => {
    if (activeReviews.length === 0) return 5.0;
    const sum = activeReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return Math.round((sum / activeReviews.length) * 10) / 10;
  }, [activeReviews]);

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    activeReviews.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[rating] = (counts[rating] || 0) + 1;
    });
    return counts;
  }, [activeReviews]);

  const recommendationPercent = useMemo(() => {
    if (activeReviews.length === 0) return 100;
    const positive = activeReviews.filter((r) => (r.rating || 5) >= 4).length;
    return Math.round((positive / activeReviews.length) * 100);
  }, [activeReviews]);

  const verifiedCount = useMemo(() => {
    return activeReviews.filter((r) => r.verified).length;
  }, [activeReviews]);

  const photosCount = useMemo(() => {
    return activeReviews.filter((r) => Boolean(r.productImage)).length;
  }, [activeReviews]);

  // Apply UI filters for displayed review list
  const displayedReviews = useMemo(() => {
    return activeReviews.filter((r) => {
      if (selectedRatingFilter !== 'ALL' && Math.round(r.rating || 5) !== selectedRatingFilter) {
        return false;
      }
      if (onlyWithPhotos && !r.productImage) {
        return false;
      }
      return true;
    });
  }, [activeReviews, selectedRatingFilter, onlyWithPhotos]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const reviewPhotoFileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{ src: string; author: string; product: string; comment: string; rating: number } | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = Boolean(customerUser || customerProfile);

  const handleTriggerPhotoPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadingPhoto && reviewPhotoFileInputRef.current) {
      reviewPhotoFileInputRef.current.click();
    }
  };

  const processReviewPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const optimized = await optimizeImageFile(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
      setUploadedPhoto(optimized);
    } catch (err) {
      console.error('Error optimizing product photo:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (reviewPhotoFileInputRef.current) reviewPhotoFileInputRef.current.value = '';
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processReviewPhotoFile(file);
    }
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadingPhoto) setIsDraggingPhoto(true);
  };

  const handlePhotoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
    if (isUploadingPhoto) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processReviewPhotoFile(file);
    }
  };

  // Extract products purchased by authenticated customer from order history
  const purchasedProducts = useMemo(() => {
    if (!isAuthenticated) return [];
    const itemsMap = new Map<string, string>(); // name -> product id or name

    // 1. From customerProfile order history
    if (customerProfile?.orderHistory) {
      customerProfile.orderHistory.forEach((order) => {
        order.items?.forEach((item) => {
          if (item.product?.name) {
            itemsMap.set(item.product.name, item.product.id || item.product.name);
          }
        });
      });
    }

    // 2. From global orders matching customer email or uid
    if (orders && (customerUser?.uid || customerUser?.email)) {
      orders.forEach((order) => {
        const matchesUser =
          (customerUser?.uid && order.userId === customerUser.uid) ||
          (customerUser?.email &&
            order.customerEmail &&
            order.customerEmail.toLowerCase() === customerUser.email.toLowerCase());
        if (matchesUser) {
          order.items?.forEach((item) => {
            if (item.product?.name) {
              itemsMap.set(item.product.name, item.product.id || item.product.name);
            }
          });
        }
      });
    }

    return Array.from(itemsMap.keys()).map((name) => ({ name }));
  }, [isAuthenticated, customerProfile, orders, customerUser]);

  // Sync author name & initial product when modal opens or customer signs in
  useEffect(() => {
    if (modalOpen && isAuthenticated) {
      if (!newAuthor) {
        const defaultName =
          customerProfile?.name ||
          customerUser?.displayName ||
          (customerUser?.email ? customerUser.email.split('@')[0] : '');
        setNewAuthor(defaultName);
      }
      if (!selectedProduct) {
        if (purchasedProducts.length > 0) {
          setSelectedProduct(purchasedProducts[0].name);
        } else if (products.length > 0) {
          setSelectedProduct(products[0].name);
        }
      }
    }
  }, [modalOpen, isAuthenticated, customerProfile, customerUser, purchasedProducts, products, newAuthor, selectedProduct]);

  const RATING_LABELS: Record<number, string> = {
    1: '1/5 - Poor',
    2: '2/5 - Fair',
    3: '3/5 - Good',
    4: '4/5 - Very Good',
    5: '5/5 - Excellent! Highly Recommended',
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newComment) return;

    const finalProductName =
      selectedProduct === 'custom'
        ? customProduct
        : selectedProduct || 'Marudhar Footwear';

    setIsSubmitting(true);
    try {
      await addReview({
        author: newAuthor,
        location: newLocation || 'Verified Customer',
        rating: newRating,
        comment: newComment,
        date: 'Just now',
        verified: true,
        productBought: finalProductName,
        productImage: uploadedPhoto || undefined,
        avatar:
          customerProfile?.photoURL ||
          customerUser?.photoURL ||
          `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`,
      });

      setSubmittedMessage(true);
      setTimeout(() => {
        setSubmittedMessage(false);
        setModalOpen(false);
        setNewAuthor('');
        setNewLocation('');
        setNewComment('');
        setSelectedProduct('');
        setCustomProduct('');
        setUploadedPhoto(null);
        setNewRating(5);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-20 bg-white relative overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B8F63]/10 text-[#0B8F63] text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              Local Trust & Family Stories
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
              {title}
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl">
              {subtitle}
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all shrink-0 hover:scale-102 active:scale-98"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#0B8F63]" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* Dynamic Review Summary Header Banner */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-neutral-800 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Dynamic Average Score & Key Metrics */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full lg:w-auto">
            <div className="flex items-baseline gap-1.5 bg-neutral-800/90 px-5 py-4 rounded-2xl border border-neutral-700/60 shrink-0 shadow-inner">
              <span className="text-4xl sm:text-5xl font-black text-amber-400">{averageRatingNumber.toFixed(1)}</span>
              <span className="text-sm text-neutral-400 font-bold">/ 5.0</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRatingNumber)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm sm:text-base font-semibold text-neutral-100">
                Average Rating based on <span className="text-emerald-400 font-bold">{totalReviewsCount}</span> customer reviews
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-300 pt-0.5">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {verifiedCount} Verified Purchases
                </span>
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  {recommendationPercent}% Recommendation Rate
                </span>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Star Breakdown Mini Bars */}
          <div className="w-full lg:w-72 space-y-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-800/80">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              return (
                <button
                  key={star}
                  onClick={() => setSelectedRatingFilter(selectedRatingFilter === star ? 'ALL' : star)}
                  className={`w-full flex items-center gap-2 text-xs rounded-lg p-1 transition-colors ${
                    selectedRatingFilter === star ? 'bg-neutral-800 text-white font-bold' : 'hover:bg-neutral-800/50 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1 w-10 shrink-0 font-semibold text-neutral-300">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/40">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium text-neutral-400 text-[11px]">{count} ({percentage}%)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Rating Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1">Filter Reviews:</span>
            <button
              onClick={() => setSelectedRatingFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRatingFilter === 'ALL'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All ({totalReviewsCount})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRatingFilter(selectedRatingFilter === star ? 'ALL' : star)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedRatingFilter === star
                    ? 'bg-[#0B8F63] text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <span>{star}</span>
                <Star className={`w-3 h-3 ${selectedRatingFilter === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                <span className="text-[10px] opacity-80">({starCounts[star] || 0})</span>
              </button>
            ))}
          </div>

          {photosCount > 0 && (
            <button
              onClick={() => setOnlyWithPhotos(!onlyWithPhotos)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                onlyWithPhotos
                  ? 'bg-emerald-50 border-emerald-500 text-[#0B8F63]'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>With Customer Photos</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {photosCount}
              </span>
            </button>
          )}
        </div>

        {/* Reviews Cards Grid */}
        {displayedReviews.length === 0 ? (
          <div className="py-12 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-300 space-y-3">
            <div className="w-12 h-12 bg-neutral-200 text-neutral-500 rounded-2xl flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-neutral-800 text-sm">No reviews match your selected filter</h4>
            <p className="text-xs text-neutral-500">Try selecting another rating tier or clearing filters.</p>
            <button
              onClick={() => {
                setSelectedRatingFilter('ALL');
                setOnlyWithPhotos(false);
              }}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F7F7F7] p-6 rounded-3xl border border-neutral-200/70 hover:shadow-xl hover:border-[#0B8F63]/30 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Stars & Verified */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-[#0B8F63]" />
                      Verified Order
                    </span>
                  )}
                </div>

                {/* Comment quote */}
                <p className="text-xs sm:text-sm text-neutral-700 font-medium italic leading-relaxed">
                  "{rev.comment}"
                </p>

                {/* Product Photo if uploaded by customer */}
                {rev.productImage && (
                  <div
                    onClick={() =>
                      setPreviewPhotoModal({
                        src: rev.productImage!,
                        author: rev.author,
                        product: rev.productBought || 'Purchased Item',
                        comment: rev.comment,
                        rating: rev.rating,
                      })
                    }
                    className="relative group rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 cursor-pointer aspect-video my-1 transition-all duration-200 hover:ring-2 hover:ring-[#0B8F63]"
                  >
                    <img
                      src={rev.productImage}
                      alt={`Product photo by ${rev.author}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-medium">
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                        <Camera className="w-3 h-3 text-emerald-400" />
                        Customer Photo
                      </span>
                      <span className="p-1 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Author, Product Bought & Helpful Button */}
              <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={rev.author}
                    className="w-9 h-9 rounded-full object-cover border border-white shadow-sm shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 truncate">{rev.author}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{rev.location}</div>
                    {rev.productBought && (
                      <div className="text-[10px] font-semibold text-[#0B8F63] truncate mt-0.5">
                        Bought: {rev.productBought}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleVoteHelpful(rev.id)}
                  disabled={votedReviewIds.has(rev.id)}
                  title={votedReviewIds.has(rev.id) ? 'You marked this review as helpful' : 'Mark review as helpful'}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all shrink-0 ${
                    votedReviewIds.has(rev.id)
                      ? 'bg-emerald-50 border-emerald-300 text-[#0B8F63] cursor-default'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-500 hover:text-[#0B8F63] hover:bg-emerald-50/50 active:scale-95'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${votedReviewIds.has(rev.id) ? 'fill-[#0B8F63] text-[#0B8F63]' : ''}`} />
                  <span>Helpful</span>
                  {(rev.helpfulCount || 0) > 0 && (
                    <span className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      votedReviewIds.has(rev.id) ? 'bg-emerald-200/60 text-emerald-900' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {rev.helpfulCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>

      {/* Leave a Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200/80 z-10 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0B8F63]/10 flex items-center justify-center text-[#0B8F63]">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-heading font-bold text-lg text-neutral-900">Leave a Product Review</h3>
                  <p className="text-[11px] text-neutral-500">Share your verified feedback with future shoppers</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Authenticated vs Unauthenticated */}
            {!isAuthenticated ? (
              <div className="py-6 px-4 text-center space-y-4 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-neutral-900">Authentication Required</h4>
                  <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                    To maintain authentic, high-quality reviews, only signed-in customers can submit product ratings and feedback.
                  </p>
                </div>
                <button
                  onClick={() => customerSignInWithGoogle(false)}
                  disabled={isCustomerAuthLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <LogIn className="w-4 h-4 text-[#0B8F63]" />
                  <span>{isCustomerAuthLoading ? 'Signing In...' : 'Sign In with Google'}</span>
                </button>
              </div>
            ) : submittedMessage ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-[#0B8F63] rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-bounce">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-neutral-900">Thank You for Your Review!</h3>
                <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                  Your feedback has been published as a verified customer review for Marudhar Fashion Point.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4 text-xs">
                {/* Authenticated User Banner */}
                <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-[#0B8F63] shrink-0" />
                    <div>
                      <div className="font-bold text-xs">
                        Reviewing as: <span className="text-[#0B8F63]">{newAuthor || 'Verified Customer'}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {customerUser?.email || customerProfile?.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-[#0B8F63] px-2 py-0.5 rounded-full">
                    Verified Customer
                  </span>
                </div>

                {/* Author Display Name Field */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {/* Location / Area */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">City / Area</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Station Road, City"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {/* Purchased Product Selection */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1 flex items-center justify-between">
                    <span>Product Purchased</span>
                    {purchasedProducts.length > 0 && (
                      <span className="text-[10px] text-[#0B8F63] font-semibold flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {purchasedProducts.length} Past Order(s) Detected
                      </span>
                    )}
                  </label>

                  {purchasedProducts.length > 0 ? (
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0B8F63] outline-none font-medium"
                    >
                      {purchasedProducts.map((p) => (
                        <option key={p.name} value={p.name}>
                          ✓ {p.name} (Verified Purchase)
                        </option>
                      ))}
                      <option value="custom">-- Other Product / Store Purchase --</option>
                    </select>
                  ) : (
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0B8F63] outline-none font-medium"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      <option value="custom">-- Other Footwear / Custom Item --</option>
                    </select>
                  )}

                  {/* Custom product name if custom selected */}
                  {selectedProduct === 'custom' && (
                    <input
                      type="text"
                      required
                      value={customProduct}
                      onChange={(e) => setCustomProduct(e.target.value)}
                      placeholder="Enter product name (e.g. Royal Leather Jutti)"
                      className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  )}
                </div>

                {/* Star Rating Control */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Rating *</label>
                  <div className="flex items-center gap-1.5 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= (hoveredRating || newRating);
                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isActive
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-[11px] font-bold text-amber-600">
                      {RATING_LABELS[hoveredRating || newRating]}
                    </span>
                  </div>
                </div>

                {/* Comment / Review Feedback */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Your Review & Comments *</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share details about comfort, size fit, craftsmanship, or customer service..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0B8F63] outline-none resize-none"
                  />
                </div>

                {/* Product Photo Upload Field */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#0B8F63]" />
                      <span>Upload Product Photo (Optional)</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-normal">JPG, PNG, WebP</span>
                  </label>

                  {uploadedPhoto ? (
                    <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 p-2.5 flex items-center gap-3">
                      <img
                        src={uploadedPhoto}
                        alt="Product preview"
                        className="w-14 h-14 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900">
                          <CheckCircle className="w-3.5 h-3.5 text-[#0B8F63]" />
                          <span>Photo Attached</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 truncate mt-0.5">
                          Optimized for fast loading on review cards
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedPhoto(null)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={handleTriggerPhotoPicker}
                      onDragOver={handlePhotoDragOver}
                      onDragEnter={handlePhotoDragOver}
                      onDragLeave={handlePhotoDragLeave}
                      onDrop={handlePhotoDrop}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTriggerPhotoPicker(e as any);
                        }
                      }}
                      className={`border-2 border-dashed transition-all rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-center group ${
                        isDraggingPhoto
                          ? 'border-[#0B8F63] bg-emerald-50 scale-[1.01]'
                          : 'border-neutral-300 hover:border-[#0B8F63] bg-neutral-50 hover:bg-emerald-50/30'
                      }`}
                    >
                      <input
                        ref={reviewPhotoFileInputRef}
                        id="customer-review-photo-input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                        onChange={handlePhotoSelect}
                        className="sr-only hidden"
                        tabIndex={-1}
                        aria-hidden="true"
                        disabled={isUploadingPhoto}
                      />
                      {isUploadingPhoto ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#0B8F63]">
                          <Loader2 className="w-4 h-4 text-[#0B8F63] animate-spin" />
                          <span>Optimizing and attaching photo...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-neutral-200/60 group-hover:bg-[#0B8F63]/10 text-neutral-600 group-hover:text-[#0B8F63] flex items-center justify-center transition-colors mb-1">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-neutral-800 group-hover:text-[#0B8F63]">
                            Click or drag to upload footwear photo
                          </span>
                          <span className="text-[10px] text-neutral-500 mt-0.5">
                            Show future buyers your real shoe fit & quality
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto}
                  className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Review...' : 'Submit Verified Review'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox / Full Photo Preview Modal */}
      {previewPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setPreviewPhotoModal(null)} />
          <div className="relative bg-neutral-900 rounded-3xl max-w-2xl w-full overflow-hidden border border-neutral-800 shadow-2xl z-10 space-y-0">
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setPreviewPhotoModal(null)}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={previewPhotoModal.src}
                alt={previewPhotoModal.product}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="p-5 bg-neutral-900 text-white space-y-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{previewPhotoModal.author}</h4>
                  <p className="text-xs text-emerald-400 font-semibold">{previewPhotoModal.product}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < previewPhotoModal.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-neutral-300 italic font-medium leading-relaxed">
                "{previewPhotoModal.comment}"
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

