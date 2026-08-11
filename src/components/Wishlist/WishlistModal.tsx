import React from 'react';
import { X, Heart, MessageCircle, Trash2, Eye } from 'lucide-react';
import { Product } from '../../types';
import { generateProductWhatsAppLink } from '../../utils/whatsapp';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistedProducts: Product[];
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistedProducts,
  onToggleWishlist,
  onQuickView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 space-y-4 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2 font-serif-heading font-bold text-xl text-neutral-900">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>My Saved Wishlist ({wishlistedProducts.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {wishlistedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-serif-heading font-bold text-lg text-neutral-900">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Click the heart icon on any product to save it here for quick WhatsApp ordering.
              </p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80 hover:border-neutral-300 transition-colors"
              >
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : CLEAN_IMAGE_COMING_SOON_SVG}
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CLEAN_IMAGE_COMING_SOON_SVG;
                  }}
                  className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-[#0B8F63] uppercase">
                    {product.brand}
                  </div>
                  <h4 className="font-bold text-xs text-neutral-900 truncate">
                    {product.name}
                  </h4>
                  <div className="font-serif-heading font-extrabold text-xs text-neutral-900 mt-0.5">
                    ₹{(product.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onQuickView(product);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:text-[#0B8F63]"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <a
                    href={generateProductWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-[#0B8F63]" />
                    <span>Order</span>
                  </a>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="p-2 text-neutral-400 hover:text-rose-500"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
