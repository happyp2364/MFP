import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { CustomerOrder, StoreInfo } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  storeInfo: StoreInfo;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  storeInfo,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-neutral-200">
        
        {/* Action Header */}
        <div className="bg-neutral-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Official Tax Invoice • {order.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="p-8 space-y-6 text-neutral-800 text-xs bg-white">
          
          {/* Invoice Top Header */}
          <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
            <div>
              <h1 className="text-xl font-serif font-bold text-amber-950 uppercase tracking-wide">
                {storeInfo.name || 'Marudhar Fashion Point'}
              </h1>
              <p className="text-neutral-500 text-[11px] mt-0.5 max-w-xs">
                {storeInfo.address || 'Bhilwara, Rajasthan, India'}
              </p>
              <p className="text-neutral-500 text-[11px]">
                Phone: {storeInfo.phone} • Email: {storeInfo.email}
              </p>
              <p className="text-amber-900 text-[11px] font-semibold mt-1">
                GSTIN: 08AAACM9829A1Z2
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-md font-bold text-xs uppercase mb-2">
                Tax Invoice
              </span>
              <p className="font-mono font-bold text-sm text-neutral-900">
                Invoice No: {order.id}
              </p>
              <p className="text-neutral-500 text-[11px]">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-emerald-700 font-semibold text-[11px] mt-1">
                Payment Status: {order.paymentStatus} ({order.paymentMethod})
              </p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Billed & Shipped To:
              </p>
              <p className="font-bold text-neutral-900 text-sm">{order.customerName}</p>
              <p className="text-neutral-600 mt-0.5">{order.shippingAddress.street}</p>
              <p className="text-neutral-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              {order.shippingAddress.landmark && (
                <p className="text-neutral-500 italic">Landmark: {order.shippingAddress.landmark}</p>
              )}
              <p className="text-neutral-700 font-medium mt-1">Phone: {order.customerPhone}</p>
              <p className="text-neutral-700 font-medium">Email: {order.customerEmail}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Order Reference:
              </p>
              <p className="text-neutral-700 font-mono">Transaction ID: {order.transactionId}</p>
              <p className="text-neutral-700 font-mono">Payment Ref: {order.paymentReference || 'N/A'}</p>
              <p className="text-neutral-700">Order Status: <span className="font-bold text-amber-800">{order.orderStatus}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-neutral-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-amber-950 text-white text-left font-semibold text-[11px]">
                <th className="p-2.5">#</th>
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5">Size / Color</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-right">Unit Price</th>
                <th className="p-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-700">
              {order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-neutral-50">
                  <td className="p-2.5 text-neutral-400 font-mono">{idx + 1}</td>
                  <td className="p-2.5 font-medium text-neutral-900">{item.product.name}</td>
                  <td className="p-2.5 text-neutral-600">
                    Size: {item.selectedSize} | Color: {item.selectedColor}
                  </td>
                  <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                  <td className="p-2.5 text-right font-mono">₹{item.product.price.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-neutral-900">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Amount Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-full max-w-xs space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono">₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax Breakdown:</span>
                <span className="font-mono">₹{order.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-mono">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              {!!order.convenienceFee && order.convenienceFee > 0 && (
                <div className="flex justify-between text-amber-900 font-medium">
                  <span>Convenience Fee ({order.paymentMethod}):</span>
                  <span className="font-mono">+₹{order.convenienceFee.toLocaleString()}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-₹{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Grand Total:</span>
                <span className="font-mono text-amber-900">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-neutral-200 text-center text-[10px] text-neutral-500 space-y-1">
            <p className="font-bold text-neutral-700">
              Thank you for shopping with Marudhar Fashion Point!
            </p>
            <p>
              This is a computer-generated invoice. For support or returns, contact support@marudharfashion.com or +91 {storeInfo.phone}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
