import React from 'react';
import { X, Trash2, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../../types';
import { generateCartWhatsAppLink } from '../../utils/whatsapp';
import { CLEAN_IMAGE_COMING_SOON_SVG } from '../../utils/imageOptimizer';

interface OrderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, size: string, color: string, qty: number) => void;
  onRemoveItem: (id: string, size: string, color: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const OrderSheet: React.FC<OrderSheetProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleWhatsAppCheckout = () => {
    const link = generateCartWhatsAppLink(cartItems);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl h-full shadow-2xl border-l border-white/80 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif-heading font-bold text-lg text-neutral-900">
            <ShoppingBag className="w-5 h-5 text-[#0B8F63]" />
            <span>Order Bag ({cartItems.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                <ShoppingBag className="w-8 h-8 text-[#0B8F63]" />
              </div>
              <h3 className="font-serif-heading font-bold text-lg text-neutral-900">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Explore our Men's, Women's Sports Shoes, and Kids' collections to select your favorite footwear.
              </p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80"
              >
                <img
                  src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : CLEAN_IMAGE_COMING_SOON_SVG}
                  alt={item.product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CLEAN_IMAGE_COMING_SOON_SVG;
                  }}
                  className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <div className="text-[10px] text-neutral-500 font-medium">
                    Size: <strong className="text-neutral-800">{item.selectedSize}</strong> | Color: <strong className="text-neutral-800">{item.selectedColor}</strong>
                  </div>
                  <div className="font-bold text-xs text-[#0B8F63]">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                    className="text-neutral-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden text-xs">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.product.id,
                          item.selectedSize,
                          item.selectedColor,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="px-2 py-0.5 hover:bg-neutral-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 font-bold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.product.id,
                          item.selectedSize,
                          item.selectedColor,
                          item.quantity + 1
                        )
                      }
                      className="px-2 py-0.5 hover:bg-neutral-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-neutral-200 bg-[#F7F7F7] space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-neutral-600">Total Estimated Amount:</span>
              <span className="font-serif-heading font-extrabold text-xl text-neutral-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-amber-800/25 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>PROCEED TO ONLINE CHECKOUT (UPI / CARDS)</span>
            </button>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all opacity-90"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order via WhatsApp Instead</span>
            </button>

            <button
              onClick={onClearCart}
              className="w-full text-center text-xs text-neutral-500 hover:text-red-600 py-1 font-semibold"
            >
              Clear Bag
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
