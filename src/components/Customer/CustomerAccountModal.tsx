import React, { useState } from 'react';
import {
  X,
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Plus,
  ChevronRight,
  Truck,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomerOrder, OrderStatus, Product, SavedAddress } from '../../types';
import { InvoiceModal } from './InvoiceModal';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickViewProduct?: (p: Product) => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'PACKING', label: 'Packing' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'READY_TO_DISPATCH', label: 'Ready to Dispatch' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onQuickViewProduct,
}) => {
  const {
    customerUser,
    customerProfile,
    isCustomerAuthLoading,
    customerSignInWithGoogle,
    customerSignOut,
    updateCustomerProfileInFirestore,
    orders,
    cancelCustomerOrder,
    products,
    storeInfo,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'ADDRESSES' | 'WISHLIST'>('ORDERS');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);

  // Address form modal
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<SavedAddress, 'id'>>({
    name: customerProfile?.name || '',
    phone: customerProfile?.phoneNumber || '',
    street: '',
    city: 'Bhilwara',
    state: 'Rajasthan',
    pincode: '311001',
    isDefault: true,
  });

  if (!isOpen) return null;

  // Filter orders for logged-in user or matching email/phone
  const myOrders = orders.filter((o) => {
    if (customerUser && o.userId === customerUser.uid) return true;
    if (customerProfile && o.customerEmail === customerProfile.email) return true;
    return false;
  });

  const wishlistProducts = (customerProfile?.wishlist || [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const addressItem: SavedAddress = {
      ...newAddress,
      id: `addr-${Date.now()}`,
    };

    const updatedList = [
      addressItem,
      ...(customerProfile?.savedAddresses || []).map((a) =>
        newAddress.isDefault ? { ...a, isDefault: false } : a
      ),
    ];

    await updateCustomerProfileInFirestore({ savedAddresses: updatedList });
    setShowAddressForm(false);
  };

  const handleDeleteAddress = async (id: string) => {
    const updatedList = (customerProfile?.savedAddresses || []).filter((a) => a.id !== id);
    await updateCustomerProfileInFirestore({ savedAddresses: updatedList });
  };

  const getStepProgressIndex = (status: OrderStatus): number => {
    if (status === 'CANCELLED' || status === 'RETURNED') return -1;
    return ORDER_STEPS.findIndex((s) => s.status === status);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-neutral-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-500/30">
                {customerUser?.photoURL ? (
                  <img src={customerUser.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-amber-100">
                  {customerProfile?.name || customerUser?.displayName || 'Customer Account'}
                </h2>
                <p className="text-xs text-amber-200/70">
                  {customerUser?.email || 'Sign in to track orders & manage addresses'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {customerUser ? (
                <button
                  onClick={customerSignOut}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg text-amber-200 flex items-center space-x-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => customerSignInWithGoogle(false)}
                  disabled={isCustomerAuthLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center space-x-1.5"
                >
                  <span>Sign In with Google</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-amber-50/50 px-6 border-b border-amber-100 flex space-x-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'ORDERS'
                  ? 'border-amber-700 text-amber-900 font-bold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders & Live Tracking ({myOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ADDRESSES')}
              className={`py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'ADDRESSES'
                  ? 'border-amber-700 text-amber-900 font-bold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses ({(customerProfile?.savedAddresses || []).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('WISHLIST')}
              className={`py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === 'WISHLIST'
                  ? 'border-amber-700 text-amber-900 font-bold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Saved Wishlist ({wishlistProducts.length})</span>
            </button>
          </div>

          {/* TAB CONTENT: ORDERS */}
          {activeTab === 'ORDERS' && (
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {myOrders.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <Package className="w-12 h-12 mx-auto text-neutral-300" />
                  <p className="text-sm font-semibold text-neutral-800">No orders found</p>
                  <p className="text-xs">Place your first order to track real-time delivery status here.</p>
                </div>
              ) : (
                myOrders.map((order) => {
                  const stepIndex = getStepProgressIndex(order.orderStatus);

                  return (
                    <div
                      key={order.id}
                      className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4 hover:border-amber-300 transition-colors"
                    >
                      {/* Order Title Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-neutral-100 pb-3">
                        <div>
                          <span className="font-mono font-bold text-sm text-neutral-900">{order.id}</span>
                          <span className="text-neutral-400 ml-2">
                            • {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-md uppercase text-[10px]">
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md font-semibold text-[11px] flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Real-time Order Progress Stepper */}
                      {stepIndex >= 0 ? (
                        <div className="py-2">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                            Real-Time Delivery Timeline
                          </p>
                          <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                            {ORDER_STEPS.map((s, idx) => {
                              const isCompleted = idx <= stepIndex;
                              const isCurrent = idx === stepIndex;

                              return (
                                <div key={s.status} className="flex flex-col items-center space-y-1">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                                      isCompleted
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                                    }`}
                                  >
                                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                                  </div>
                                  <span
                                    className={`leading-tight font-medium ${
                                      isCurrent ? 'text-amber-900 font-bold' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          <span>Order Status: <strong>{order.orderStatus}</strong></span>
                        </div>
                      )}

                      {/* Item Thumbnails */}
                      <div className="flex flex-wrap gap-2 text-xs pt-1">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 p-1.5 bg-neutral-50 rounded-lg border border-neutral-100"
                          >
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                            <div>
                              <p className="font-semibold text-neutral-900 line-clamp-1">{item.product.name}</p>
                              <p className="text-[10px] text-neutral-500">
                                Size: {item.selectedSize} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 text-neutral-600">
                        <span>Total: <strong className="text-amber-900 font-bold">₹{order.totalAmount.toLocaleString()}</strong> ({order.paymentMethod})</span>

                        {(order.orderStatus === 'PENDING' || order.orderStatus === 'ACCEPTED') && (
                          <button
                            onClick={() => cancelCustomerOrder(order.id)}
                            className="text-red-600 hover:underline font-semibold text-[11px]"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB CONTENT: SAVED ADDRESSES */}
          {activeTab === 'ADDRESSES' && (
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-neutral-900">Manage Saved Shipping Addresses</h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-3">
                  <h4 className="font-bold text-amber-900">New Address Form</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Street / House Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="col-span-2 px-3 py-2 border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="PIN Code"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-800 text-white rounded-lg font-bold text-xs"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {(customerProfile?.savedAddresses || []).length === 0 ? (
                <p className="text-xs text-neutral-500 py-8 text-center">No saved addresses. Click above to add one.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {(customerProfile?.savedAddresses || []).map((addr) => (
                    <div key={addr.id} className="p-4 bg-white border border-neutral-200 rounded-xl relative space-y-1">
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          DEFAULT
                        </span>
                      )}
                      <p className="font-bold text-neutral-900">{addr.name}</p>
                      <p className="text-neutral-600">{addr.street}</p>
                      <p className="text-neutral-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-neutral-700 font-medium">Phone: {addr.phone}</p>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute top-3 right-3 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: WISHLIST */}
          {activeTab === 'WISHLIST' && (
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <Heart className="w-12 h-12 mx-auto text-neutral-300" />
                  <p className="text-sm font-semibold text-neutral-800">Your Wishlist is Empty</p>
                  <p className="text-xs">Heart items while browsing to save them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="p-2.5 bg-white border border-neutral-200 rounded-xl space-y-2">
                      <img src={p.images[0]} alt={p.name} className="w-full h-32 object-cover rounded-lg" />
                      <p className="font-bold text-xs text-neutral-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-amber-900 font-bold">₹{p.price.toLocaleString()}</p>
                      {onQuickViewProduct && (
                        <button
                          onClick={() => onQuickViewProduct(p)}
                          className="w-full py-1.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold hover:bg-amber-200 transition-colors"
                        >
                          View Item
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
          storeInfo={storeInfo}
        />
      )}
    </>
  );
};
