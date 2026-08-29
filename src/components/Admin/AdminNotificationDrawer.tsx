import React, { useState } from 'react';
import {
  Bell,
  X,
  Check,
  Trash2,
  Package,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotificationDrawer: React.FC<AdminNotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useStore();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200">
        
        {/* Header */}
        <div className="bg-amber-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="font-serif font-bold text-sm text-amber-100">
              Real-Time Order Notifications
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-amber-200/80 hover:text-white underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 space-y-2">
              <Bell className="w-12 h-12 mx-auto text-neutral-200" />
              <p className="font-semibold text-neutral-700">No Notifications Yet</p>
              <p className="text-[11px]">When customers place & pay for orders, live alerts will appear here with audio chime.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  n.read
                    ? 'bg-neutral-50 border-neutral-200 opacity-75'
                    : 'bg-amber-50/80 border-amber-300 shadow-sm relative'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-amber-600 rounded-full animate-ping" />
                )}

                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="text-sm">🔔 New Paid Order</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-neutral-700 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Customer:</span>
                    <strong className="text-neutral-900">{n.customerName}</strong>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px]">Amount Paid:</span>
                    <strong className="text-emerald-700 font-mono">₹{n.totalAmount.toLocaleString()}</strong>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px]">Products:</span>
                    <strong className="text-neutral-800">{n.productCount} item(s)</strong>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px]">Order ID:</span>
                    <strong className="font-mono text-amber-900">{n.orderId}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-amber-200/60 text-[10px] text-neutral-500">
                  <span>Payment: <strong className="text-emerald-600">Successful</strong></span>
                  <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
