import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquarePlus, X, HeartHandshake, UserCheck, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Review } from '../../types';

export const ReviewsSection: React.FC = () => {
  const { reviews, addReview } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [instaError, setInstaError] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    setInstaError('');

    if (newInstagram && !/^@[a-zA-Z0-9_.]+$/.test(newInstagram)) {
      setInstaError('Instagram username must start with @ and contain only letters, numbers, underscores, or periods.');
      return;
    }

    if (!showPreview) {
      setShowPreview(true);
      return;
    }

    e.preventDefault();
    if (!newAuthor || !newComment) return;

    addReview({
      author: newAuthor,
      location: newLocation || 'Verified Customer',
      rating: newRating,
      comment: newComment,
      date: 'Just now',
      verified: true,
      productBought: newProduct || 'Marudhar Footwear',
      avatar: newAvatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`,
      instagramHandle: newInstagram || undefined,
    });

    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setModalOpen(false);
      setNewAuthor('');
      setNewLocation('');
      setNewComment('');
      setNewProduct('');
      setNewInstagram('');
      setNewAvatar('');
      setShowPreview(false);
    }, 1800);
  };

  return (
    <section id="reviews" className="py-20 bg-white relative overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B8F63]/10 text-[#0B8F63] text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              Local Trust & Family Stories
            </div>
            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
              Loved by 15,000+ Families
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl">
              Real reviews from real customers who trust Marudhar Fashion Point for wedding footwear, school shoes, and daily fashion.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#0B8F63]" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
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
              </div>

              {/* Author & Product Bought */}
              <div className="pt-3 border-t border-neutral-200/60 flex items-center gap-3">
                <img
                  src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt={rev.author}
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    {rev.author}
                    {rev.instagramHandle && (
                      <a 
                        href={`https://instagram.com/${rev.instagramHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-pink-600 hover:text-pink-700 bg-pink-50 rounded-full px-1.5 py-0.5 transition-colors"
                        title="View on Instagram"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                        <span className="text-[10px] font-semibold leading-none">{rev.instagramHandle}</span>
                      </a>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500">{rev.location}</div>
                  {rev.productBought && (
                    <div className="text-[10px] font-semibold text-[#0B8F63] line-clamp-1 mt-0.5">
                      Bought: {rev.productBought}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Leave a Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border z-10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="font-serif-heading font-bold text-xl">Leave Your Review</span>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedMessage ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-[#0B8F63] rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">Thank You!</h3>
                <p className="text-xs text-neutral-600">Your review has been added to Marudhar Fashion Point.</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Location / Area</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Station Road, City"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Product Purchased (Optional)</label>
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    placeholder="e.g. Royal Leather Loafers"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Instagram (Optional)</label>
                    <input
                      type="text"
                      value={newInstagram}
                      onChange={(e) => setNewInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Profile Picture URL (Optional)</label>
                    <input
                      type="url"
                      value={newAvatar}
                      onChange={(e) => setNewAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Your Experience & Feedback *</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share how Viju Bhai & Marudhar team helped you choose footwear..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                {instaError && (
                  <p className="text-red-500 text-xs mt-1">{instaError}</p>
                )}
                {showPreview && (
                  <div className="bg-[#F7F7F7] p-4 rounded-xl border border-neutral-200 mt-4">
                    <h4 className="text-xs font-bold text-neutral-500 mb-2 uppercase">Preview</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < newRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-neutral-700 font-medium italic">
                        "{newComment}"
                      </p>
                      <div className="pt-2 border-t border-neutral-200 flex items-center gap-3">
                        <img
                          src={newAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={newAuthor}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            {newAuthor}
                            {newInstagram && (
                              <span className="text-pink-600 font-medium text-[9px] bg-pink-50 px-1 rounded-full">
                                {newInstagram}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-500">{newLocation || 'Verified Customer'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {showPreview && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold py-3.5 rounded-xl shadow-sm text-sm transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-colors"
                  >
                    {showPreview ? 'Confirm & Submit' : 'Preview Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
