import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomerOrder, OrderStatus } from '../../types';
import { InvoiceModal } from '../Customer/InvoiceModal';
import { getProductPrice, getProductImage } from '../../utils/variantUtils';

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { value: 'PACKING', label: 'Packing', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { value: 'PACKED', label: 'Packed', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { value: 'READY_TO_DISPATCH', label: 'Ready To Dispatch', color: 'bg-sky-100 text-sky-900 border-sky-300' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-teal-100 text-teal-900 border-teal-300' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-900 border-red-300' },
  { value: 'RETURNED', label: 'Returned', color: 'bg-rose-100 text-rose-900 border-rose-300' },
];

export const OrderManagementView: React.FC = () => {
  const { orders, updateOrderStatus, storeInfo } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'ALL' || o.orderStatus === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus, `Updated by Admin to ${newStatus}`);
  };

  return (
    <div className="space-y-5 text-xs">
      
      {/* Top Controls */}
      <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (#MFP1025), Name, Phone, Email..."
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-600">
            <Package className="w-4 h-4 text-amber-700" />
            <span>Total Orders: <strong className="text-amber-900 font-bold">{orders.length}</strong></span>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setSelectedStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedStatusFilter === 'ALL'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All Orders ({orders.length})
          </button>

          {STATUS_OPTIONS.map((opt) => {
            const count = orders.filter((o) => o.orderStatus === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatusFilter === opt.value
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Table */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 space-y-2 text-neutral-500">
          <Package className="w-12 h-12 mx-auto text-neutral-300" />
          <p className="text-sm font-semibold text-neutral-800">No matching orders found</p>
          <p className="text-xs">Adjust your search query or filter settings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStatusOpt = STATUS_OPTIONS.find((s) => s.value === order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden hover:border-amber-300 transition-colors"
              >
                {/* Main Header Row */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 hover:bg-amber-50/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold font-mono flex items-center justify-center text-xs">
                      #{order.orderNumber || '1025'}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-neutral-900">{order.id}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-[11px] mt-0.5">
                        Customer: <strong className="text-neutral-800">{order.customerName}</strong> • {order.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold text-sm text-amber-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Status Select Box */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer ${currentStatusOpt?.color}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceOrder(order);
                      }}
                      className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-semibold flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>Invoice</span>
                    </button>

                    <button className="text-neutral-400 hover:text-neutral-700 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Card */}
                {isExpanded && (
                  <div className="p-5 border-t border-neutral-100 bg-white space-y-4">
                    
                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div>
                        <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wider mb-1 flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          <span>Customer Contact Info</span>
                        </p>
                        <p className="font-bold text-neutral-900">{order.customerName}</p>
                        <p className="text-neutral-600 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{order.customerPhone}</span>
                        </p>
                        <p className="text-neutral-600 flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          <span>{order.customerEmail}</span>
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wider mb-1 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>Shipping Address & PIN Code</span>
                        </p>
                        <p className="text-neutral-800 font-medium">{order.shippingAddress.street}</p>
                        <p className="text-neutral-600">
                          {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
                        </p>
                        {order.shippingAddress.landmark && (
                          <p className="text-neutral-500 italic">Landmark: {order.shippingAddress.landmark}</p>
                        )}
                      </div>
                    </div>

                    {/* Ordered Products Table */}
                    <div>
                      <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wider mb-2">
                        Ordered Items ({order.items.reduce((a, b) => a + b.quantity, 0)})
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => {
                          const itemPrice = getProductPrice(item.product, item.selectedSize, item.selectedColor);
                          const itemImage = getProductImage(item.product, item.selectedColor);
                          return (
                            <div
                              key={idx}
                              className="p-2.5 bg-white rounded-xl border border-neutral-200 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={itemImage}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div>
                                  <p className="font-bold text-neutral-900">{item.product.name}</p>
                                  <p className="text-neutral-500 text-[11px]">
                                    Size: <strong className="text-neutral-800">{item.selectedSize}</strong> | Color: <strong className="text-neutral-800">{item.selectedColor}</strong> | Qty: <strong className="text-neutral-800">{item.quantity}</strong>
                                  </p>
                                </div>
                              </div>

                              <p className="font-mono font-bold text-neutral-900">
                                ₹{(itemPrice * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment & Audit Info */}
                    <div className="flex flex-wrap items-center justify-between text-neutral-600 pt-2 border-t border-neutral-100 text-[11px]">
                      <span>Payment Method: <strong className="text-neutral-900">{order.paymentMethod}</strong></span>
                      <span>Transaction ID: <strong className="font-mono text-neutral-900">{order.transactionId}</strong></span>
                      <span>Reference: <strong className="font-mono text-neutral-900">{order.paymentReference || 'N/A'}</strong></span>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
          storeInfo={storeInfo}
        />
      )}
    </div>
  );
};
