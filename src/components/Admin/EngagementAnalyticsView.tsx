import React from 'react';
import {
  TrendingUp,
  Dices,
  Ticket,
  IndianRupee,
  BarChart3,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const EngagementAnalyticsView: React.FC = () => {
  const { engagementAnalytics } = useStore();

  const stats = [
    {
      label: 'Spin Wheel Spins',
      value: engagementAnalytics.wheelSpins,
      icon: Dices,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      label: 'Coupons Won',
      value: engagementAnalytics.couponsWon,
      icon: Ticket,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Engagement Revenue',
      value: `₹${engagementAnalytics.revenueGenerated.toLocaleString()}`,
      icon: IndianRupee,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Conversion Rate',
      value: engagementAnalytics.couponsWon > 0 
        ? `${((engagementAnalytics.couponsUsed / engagementAnalytics.couponsWon) * 100).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-heading font-bold text-lg text-neutral-800">Engagement & Reward Analytics</h3>
            <p className="text-xs text-neutral-500">Real-time performance tracking for all gamified reward systems.</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs font-medium text-neutral-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-sm text-neutral-800">Reward Performance Funnel</h4>
          <select className="text-[10px] font-bold border border-neutral-200 rounded-lg px-2 py-1 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        
        <div className="h-64 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 gap-3">
          <TrendingUp className="w-8 h-8 opacity-20" />
          <p className="text-xs font-medium">Detailed behavioral charts will appear as more data is collected.</p>
        </div>
      </div>
    </div>
  );
};
