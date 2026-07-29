import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Star, Search, Filter, Check, X, ShieldAlert, Edit2, 
  Trash2, RotateCcw, Pin, Award, ShieldCheck, CornerDownRight, AlertCircle, 
  Trash, ThumbsUp, ThumbsDown, CheckCircle, EyeOff, Eye, CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Review } from '../../types';

export const ReviewsSettingsView: React.FC = () => {
  const { reviews, updateReview, deleteReview, addReview } = useStore();
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'ALL' | '5' | '4' | '3' | '2' | '1'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'DELETED'>('ALL');
  const [badgeFilter, setBadgeFilter] = useState<'ALL' | 'PINNED' | 'FEATURED' | 'VERIFIED'>('ALL');

  // Selected reviews for bulk action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inline Editing State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState<number>(5);
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editProduct, setEditProduct] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Reply state
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Add custom review modal / form
  const [isAddMode, setIsAddMode] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newProduct, setNewProduct] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  // Master lists filter
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Search term
      const safeSearch = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (rev.author || '').toLowerCase().includes(safeSearch) || 
        (rev.comment || '').toLowerCase().includes(safeSearch) ||
        ((rev.location || '').toLowerCase().includes(safeSearch)) ||
        ((rev.productBought || '').toLowerCase().includes(safeSearch));

      if (!matchesSearch) return false;

      // Rating filter
      if (ratingFilter !== 'ALL' && rev.rating !== parseInt(ratingFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter === 'DELETED') {
        if (!rev.deleted) return false;
      } else if (statusFilter === 'HIDDEN') {
        if (!rev.hidden || rev.deleted) return false;
      } else if (statusFilter === 'PENDING') {
        if (rev.approved !== undefined || rev.deleted || rev.hidden) return false;
      } else if (statusFilter === 'APPROVED') {
        if (rev.approved === false || rev.deleted || rev.hidden) return false;
      } else if (statusFilter === 'REJECTED') {
        if (rev.approved !== false || rev.deleted || rev.hidden) return false;
      } else {
        // 'ALL' - hide soft deleted ones by default to keep clean unless specifically filtering for DELETED
        if (rev.deleted) return false;
      }

      // Badge Filter
      if (badgeFilter === 'PINNED' && !rev.pinned) return false;
      if (badgeFilter === 'FEATURED' && !rev.featured) return false;
      if (badgeFilter === 'VERIFIED' && !rev.verified) return false;

      return true;
    });
  }, [reviews, searchQuery, ratingFilter, statusFilter, badgeFilter]);

  // Handle Edit Action
  const handleStartEdit = (rev: Review) => {
    setEditingReviewId(rev.id);
    setEditAuthor(rev.author);
    setEditComment(rev.comment);
    setEditRating(rev.rating);
    setEditDate(rev.date || 'Just now');
    setEditLocation(rev.location || '');
    setEditProduct(rev.productBought || '');
    setEditInstagram(rev.instagramHandle || '');
    setEditAvatar(rev.avatar || '');
  };

  const handleSaveEdit = async (id: string) => {
    try {
      if (!editAuthor.trim()) throw new Error('Username cannot be empty.');
      if (!editComment.trim()) throw new Error('Review feedback comment cannot be empty.');

      await updateReview(id, {
        author: editAuthor,
        comment: editComment,
        rating: editRating,
        date: editDate,
        location: editLocation,
        productBought: editProduct,
        instagramHandle: editInstagram || undefined,
        avatar: editAvatar || undefined,
      });

      setEditingReviewId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update review.');
    }
  };

  // Toggle flags
  const handleToggleApproved = async (id: string, current: boolean | undefined) => {
    try {
      const nextVal = current === undefined ? true : !current;
      await updateReview(id, { approved: nextVal });
    } catch (err: any) {
      setError('Failed to update status.');
    }
  };

  const handleToggleHidden = async (id: string, current: boolean | undefined) => {
    try {
      await updateReview(id, { hidden: !current });
    } catch (err: any) {
      setError('Failed to toggle visibility.');
    }
  };

  const handleTogglePinned = async (id: string, current: boolean | undefined) => {
    try {
      await updateReview(id, { pinned: !current });
    } catch (err: any) {
      setError('Failed to toggle pin state.');
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean | undefined) => {
    try {
      await updateReview(id, { featured: !current });
    } catch (err: any) {
      setError('Failed to toggle featured state.');
    }
  };

  const handleToggleVerified = async (id: string, current: boolean | undefined) => {
    try {
      await updateReview(id, { verified: !current });
    } catch (err: any) {
      setError('Failed to toggle verified buyer badge.');
    }
  };

  // Soft deletion & Restores
  const handleSoftDelete = async (id: string) => {
    try {
      await updateReview(id, { deleted: true });
    } catch (err: any) {
      setError('Failed to soft-delete review.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await updateReview(id, { deleted: false });
    } catch (err: any) {
      setError('Failed to restore review.');
    }
  };

  // Hard permanent deletion
  const handleHardDelete = async (id: string) => {
    if (!window.confirm('WARNING: This permanently deletes this review from Firestore. This cannot be undone. Proceed?')) return;
    try {
      await deleteReview(id);
    } catch (err: any) {
      setError('Failed to delete review permanently.');
    }
  };

  // Owner Replies
  const handleStartReply = (rev: Review) => {
    setReplyReviewId(rev.id);
    setReplyText(rev.reply || '');
  };

  const handleSaveReply = async (id: string) => {
    try {
      await updateReview(id, { reply: replyText });
      setReplyReviewId(null);
      setReplyText('');
    } catch (err: any) {
      setError('Failed to save owner reply.');
    }
  };

  // Bulk actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredReviews.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => updateReview(id, { approved: true })));
      setSelectedIds([]);
      alert(`Bulk approved ${selectedIds.length} reviews successfully!`);
    } catch (err: any) {
      setError('Bulk approve failed.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to bulk delete the ${selectedIds.length} selected reviews?`)) return;
    try {
      await Promise.all(selectedIds.map(id => updateReview(id, { deleted: true })));
      setSelectedIds([]);
      alert(`Bulk deleted ${selectedIds.length} reviews successfully!`);
    } catch (err: any) {
      setError('Bulk delete failed.');
    }
  };

  // Add Review
  const handleAddNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;
    try {
      await addReview({
        author: newAuthor,
        location: newLocation || 'Verified Customer',
        rating: newRating,
        comment: newComment,
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        verified: true,
        productBought: newProduct || 'Marudhar Footwear',
        approved: true,
      });
      setIsAddMode(false);
      setNewAuthor('');
      setNewLocation('');
      setNewComment('');
      setNewProduct('');
    } catch (err: any) {
      setError('Failed to create review.');
    }
  };

  return (
    <div id="admin_reviews_management_page" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#0B8F63]" />
            <span>Complete Reviews Management</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Moderate, filter, edit, reply, and pin customer feedback. Approved and restored comments reflect in real-time.
          </p>
        </div>
        <button
          onClick={() => setIsAddMode(true)}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all self-start sm:self-auto"
        >
          CREATE MANUAL REVIEW
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2 font-medium shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-800 font-bold">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Action Box */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search author, comment, location..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-[#0B8F63]"
            />
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-600 whitespace-nowrap">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs outline-none"
            >
              <option value="ALL">All Star Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-600 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs outline-none"
            >
              <option value="ALL">All (Excluding soft-deleted)</option>
              <option value="PENDING">Pending Moderation</option>
              <option value="APPROVED">Approved / Live</option>
              <option value="REJECTED">Rejected / Hidden</option>
              <option value="HIDDEN">Admin Hidden Only</option>
              <option value="DELETED">Trash bin / Soft Deleted</option>
            </select>
          </div>

          {/* Badge Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-600 whitespace-nowrap">Badge:</span>
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value as any)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs outline-none"
            >
              <option value="ALL">All Badges</option>
              <option value="PINNED">📌 Pinned To Top</option>
              <option value="FEATURED">⭐ Featured</option>
              <option value="VERIFIED">✅ Verified Buyer</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Block */}
        {selectedIds.length > 0 && (
          <div className="bg-emerald-50/60 border border-emerald-200/80 px-4 py-3 rounded-2xl flex items-center justify-between flex-wrap gap-2 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-[#0B8F63]" />
              <span>{selectedIds.length} review(s) selected for bulk moderation</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>BULK APPROVE</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Trash2 className="w-3 h-3" />
                <span>BULK SOFT-DELETE</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-[10px] px-3.5 py-2 rounded-xl"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Table / Cards Grid Container */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121816] text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredReviews.length > 0 && selectedIds.length === filteredReviews.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#0B8F63] focus:ring-[#0B8F63] w-4 h-4"
                  />
                </th>
                <th className="p-4">Author Details</th>
                <th className="p-4 w-96">Feedback Comment & Replies</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Badges & Flags</th>
                <th className="p-4">Moderation / Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400 text-xs">
                    No reviews found matching the search queries or selected filters.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => {
                  const isEditing = editingReviewId === rev.id;
                  const isReplying = replyReviewId === rev.id;

                  return (
                    <tr key={rev.id} className={`hover:bg-neutral-50/50 transition-colors ${rev.deleted ? 'bg-rose-50/20' : rev.hidden ? 'bg-neutral-50/40' : ''}`}>
                      {/* Selection Box */}
                      <td className="p-4 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(rev.id)}
                          onChange={() => handleToggleSelect(rev.id)}
                          className="rounded text-[#0B8F63] focus:ring-[#0B8F63] w-4 h-4"
                        />
                      </td>

                      {/* Author Details Column */}
                      <td className="p-4 align-top space-y-1.5 min-w-[150px]">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editAuthor}
                              onChange={(e) => setEditAuthor(e.target.value)}
                              className="w-full bg-neutral-100 border p-1 rounded font-bold text-xs"
                            />
                            <input
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              placeholder="Location"
                              className="w-full bg-neutral-100 border p-1 rounded text-[10px]"
                            />
                            
                            <input
                              type="text"
                              value={editProduct}
                              onChange={(e) => setEditProduct(e.target.value)}
                              placeholder="Product Bought"
                              className="w-full bg-neutral-100 border p-1 rounded text-[10px]"
                            />
                            <input
                              type="text"
                              value={editInstagram}
                              onChange={(e) => setEditInstagram(e.target.value)}
                              placeholder="Instagram (@username)"
                              className="w-full bg-neutral-100 border p-1 rounded text-[10px]"
                            />
                            <input
                              type="text"
                              value={editAvatar}
                              onChange={(e) => setEditAvatar(e.target.value)}
                              placeholder="Avatar URL"
                              className="w-full bg-neutral-100 border p-1 rounded text-[10px]"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-neutral-900 text-xs">{rev.author}</span>
                              {rev.instagramHandle && (
                                <span className="text-pink-600 font-medium text-[9px] bg-pink-50 px-1 rounded-full">
                                  {rev.instagramHandle}
                                </span>
                              )}
                              {rev.verified && (
                                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5 text-[#0B8F63]" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-500 font-normal">{rev.location || 'Verified Buyer'}</p>
                            {rev.productBought && (
                              <p className="text-[10px] text-[#0B8F63] font-bold leading-tight mt-1 truncate max-w-[140px]">
                                Bagged: {rev.productBought}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Date field */}
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full bg-neutral-100 border p-1 rounded text-[10px] font-mono"
                          />
                        ) : (
                          <div className="text-[10px] text-neutral-400 font-mono font-normal">
                            Date: {rev.date || 'Just now'}
                          </div>
                        )}
                      </td>

                      {/* Comment Feedback Area */}
                      <td className="p-4 align-top max-w-sm">
                        {isEditing ? (
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={3}
                            className="w-full bg-neutral-100 border p-2 rounded text-xs leading-normal"
                          />
                        ) : (
                          <div className="space-y-2">
                            <p className="text-neutral-700 italic font-medium leading-relaxed">
                              "{rev.comment}"
                            </p>

                            {/* Pinned/Featured label indicator */}
                            <div className="flex gap-1.5 flex-wrap">
                              {rev.pinned && (
                                <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.2 rounded">📌 PINNED ON TOP</span>
                              )}
                              {rev.featured && (
                                <span className="bg-indigo-100 border border-indigo-200 text-indigo-800 text-[8px] font-extrabold px-1.5 py-0.2 rounded">⭐ FEATURED REVIEW</span>
                              )}
                              {rev.hidden && (
                                <span className="bg-neutral-100 border border-neutral-300 text-neutral-600 text-[8px] font-extrabold px-1.5 py-0.2 rounded">👁️ HIDDEN</span>
                              )}
                            </div>

                            {/* Owner Reply Render block */}
                            {rev.reply ? (
                              <div className="mt-2.5 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                                <div className="text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                                  <CornerDownRight className="w-3.5 h-3.5 text-[#0B8F63]" />
                                  <span>Owner Response:</span>
                                </div>
                                <p className="text-[10px] text-neutral-600 leading-normal font-normal pl-3">
                                  "{rev.reply}"
                                </p>
                                <button
                                  onClick={() => handleStartReply(rev)}
                                  className="text-[9px] text-[#0B8F63] hover:underline font-bold block pl-3"
                                >
                                  Edit Reply
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartReply(rev)}
                                className="text-[10px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 mt-1 font-bold"
                              >
                                <CornerDownRight className="w-3 h-3" />
                                <span>Add Store Owner Response</span>
                              </button>
                            )}

                            {/* Inline Reply input */}
                            {isReplying && (
                              <div className="mt-2.5 p-2 bg-neutral-50 rounded-xl border space-y-2 animate-in slide-in-from-top-1">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write response as store owner..."
                                  rows={2}
                                  className="w-full bg-white border border-neutral-200 p-2 text-[10px] rounded focus:ring-1 focus:ring-[#0B8F63] outline-none"
                                />
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleSaveReply(rev.id)}
                                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-[9px] px-2.5 py-1 rounded shadow-xs"
                                  >
                                    Save Response
                                  </button>
                                  <button
                                    onClick={() => setReplyReviewId(null)}
                                    className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-[9px] px-2.5 py-1 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Rating Column */}
                      <td className="p-4 align-top">
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={editRating}
                            onChange={(e) => setEditRating(Math.max(1, Math.min(5, parseInt(e.target.value) || 5)))}
                            className="w-12 bg-neutral-100 border p-1 rounded font-bold text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3 h-3 ${
                                  starIdx < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-neutral-200'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Badges Toggles Column */}
                      <td className="p-4 align-top space-y-1.5">
                        <button
                          onClick={() => handleTogglePinned(rev.id, rev.pinned)}
                          className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border transition-all w-28 ${
                            rev.pinned 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold' 
                              : 'bg-neutral-50 text-neutral-500 border-neutral-200 font-semibold'
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                          <span>{rev.pinned ? 'Pinned' : 'Pin to top'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(rev.id, rev.featured)}
                          className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border transition-all w-28 ${
                            rev.featured 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-extrabold' 
                              : 'bg-neutral-50 text-neutral-500 border-neutral-200 font-semibold'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          <span>{rev.featured ? 'Featured' : 'Feature item'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleVerified(rev.id, rev.verified)}
                          className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border transition-all w-28 ${
                            rev.verified 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold' 
                              : 'bg-neutral-50 text-neutral-500 border-neutral-200 font-semibold'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>{rev.verified ? 'Verified Buyer' : 'Add Buyer Tag'}</span>
                        </button>
                      </td>

                      {/* Moderation Status Column */}
                      <td className="p-4 align-top">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              rev.deleted 
                                ? 'bg-rose-500' 
                                : rev.hidden 
                                ? 'bg-neutral-400' 
                                : rev.approved === false 
                                ? 'bg-amber-500' 
                                : 'bg-[#0B8F63]'
                            }`} />
                            <span className="font-extrabold uppercase text-[10px]">
                              {rev.deleted 
                                ? 'DELETED' 
                                : rev.hidden 
                                ? 'HIDDEN' 
                                : rev.approved === false 
                                ? 'REJECTED' 
                                : 'APPROVED / LIVE'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Toggle live/rejected */}
                            <button
                              onClick={() => handleToggleApproved(rev.id, rev.approved)}
                              disabled={rev.deleted}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                                rev.approved !== false
                                  ? 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              } disabled:opacity-30 disabled:pointer-events-none`}
                            >
                              {rev.approved !== false ? 'Reject' : 'Approve'}
                            </button>

                            {/* Toggle hide/unhide */}
                            <button
                              onClick={() => handleToggleHidden(rev.id, rev.hidden)}
                              disabled={rev.deleted}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                                rev.hidden
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
                              } disabled:opacity-30 disabled:pointer-events-none`}
                              title={rev.hidden ? 'Show Review' : 'Hide Review'}
                            >
                              {rev.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Inline Actions (Edit, Soft Delete, Restore, Permanent Delete) */}
                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(rev.id)}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                title="Save changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingReviewId(null)}
                                className="p-1.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Edit Button */}
                              <button
                                onClick={() => handleStartEdit(rev)}
                                disabled={rev.deleted}
                                className="p-1.5 bg-[#0B8F63]/10 hover:bg-[#0B8F63]/25 text-[#0B8F63] rounded-lg disabled:opacity-30 transition-colors"
                                title="Edit Review"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Restore or Delete Button */}
                              {rev.deleted ? (
                                <>
                                  <button
                                    onClick={() => handleRestore(rev.id)}
                                    className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                                    title="Restore soft-deleted review"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleHardDelete(rev.id)}
                                    className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                                    title="Permanently Delete From Database"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleSoftDelete(rev.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors"
                                  title="Soft-Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave a Manual Review / Modal */}
      {isAddMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddMode(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border z-10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="font-serif-heading font-bold text-xl">Create Manual Admin Review</span>
              <button onClick={() => setIsAddMode(false)} className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Customer Username / Author *</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Customer Location / City</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Jodhpur, Rajasthan"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Product Purchased</label>
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="e.g. Premium Tan Leather Jutis"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                />
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
                <label className="font-bold text-neutral-700 block mb-1">Review Comments *</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type review content here..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-colors"
              >
                Save Live Manual Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
