import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Users, Search, Filter, Download, UserPlus, Star, Clock, 
  MapPin, ShoppingBag, TrendingUp, Mail, MessageCircle, 
  Tag, Activity, Zap, Shield, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export const CustomerIntelligenceCRMView: React.FC = () => {
  const { orders } = useStore();
  const [activeTab, setActiveTab] = useState<'database' | 'segments' | 'analytics' | 'recommendations' | 'communication'>('database');
  const [searchTerm, setSearchTerm] = useState('');

  // Derived CRM Data from orders (Mocking real Customer Profiles for UI purposes)
  const customers = useMemo(() => {
    const customerMap = new Map<string, any>();
    
    orders.forEach((order: any) => {
      const email = order.customerEmail || order.customerPhone || 'Unknown';
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: order.id,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          city: order.shippingAddress?.city || 'Unknown',
          state: order.shippingAddress?.state || 'Unknown',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt || new Date().toISOString(),
          registrationDate: order.createdAt || new Date().toISOString(),
          segments: ['New'],
          orders: []
        });
      }
      
      const cust = customerMap.get(email);
      cust.totalOrders += 1;
      cust.totalSpent += order.totalAmount;
      cust.orders.push(order);
      
      if (new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
        cust.lastOrderDate = order.createdAt;
      }
    });

    return Array.from(customerMap.values()).map(cust => {
      // Determine Segments
      const segs = [];
      if (cust.totalOrders > 3) segs.push('VIP');
      else if (cust.totalOrders > 1) segs.push('Returning');
      else segs.push('New');
      
      if (cust.totalSpent > 10000) segs.push('High Value');
      
      const lastOrderDays = (new Date().getTime() - new Date(cust.lastOrderDate).getTime()) / (1000 * 3600 * 24);
      if (lastOrderDays > 90) segs.push('Inactive');

      return { ...cust, segments: segs };
    });
  }, [orders]);

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (c.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    (c.city || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Customer Intelligence & CRM
          </h2>
          <p className="text-neutral-500 mt-1">Manage customer relationships, analyze segments, and drive retention.</p>
        </div>
        <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {[
          { id: 'database', label: 'Customer Database', icon: Users },
          { id: 'segments', label: 'Segments', icon: Tag },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'recommendations', label: 'AI Recommendations', icon: Zap },
          { id: 'communication', label: 'Communication', icon: MessageCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search by name, phone, email, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50">
              <Filter className="w-4 h-4" /> Advanced Filters
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-right">Total Spent</th>
                  <th className="px-6 py-4">Segments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust, i) => (
                    <tr key={i} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-900">{cust.name}</div>
                        <div className="text-xs text-neutral-500">Last Active: {new Date(cust.lastOrderDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-700">{cust.phone || 'N/A'}</div>
                        <div className="text-xs text-neutral-500">{cust.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {cust.city}, {cust.state}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-neutral-900">
                        {cust.totalOrders}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        ₹{cust.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {cust.segments.map((seg: any, idx: any) => (
                            <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              seg === 'VIP' ? 'bg-amber-100 text-amber-700' :
                              seg === 'High Value' ? 'bg-purple-100 text-purple-700' :
                              seg === 'New' ? 'bg-blue-100 text-blue-700' :
                              'bg-neutral-100 text-neutral-700'
                            }`}>
                              {seg}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      No customers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'VIP Customers', count: customers.filter(c => c.segments.includes('VIP')).length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { title: 'High Value', count: customers.filter(c => c.segments.includes('High Value')).length, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
            { title: 'New Customers', count: customers.filter(c => c.segments.includes('New')).length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
            { title: 'Returning', count: customers.filter(c => c.segments.includes('Returning')).length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { title: 'Inactive (>90 days)', count: customers.filter(c => c.segments.includes('Inactive')).length, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
          ].map((seg, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${seg.border} ${seg.bg} flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${seg.color}`}>{seg.title}</h3>
                <Tag className={`w-5 h-5 ${seg.color}`} />
              </div>
              <div>
                <p className={`text-4xl font-black ${seg.color}`}>{seg.count}</p>
                <p className={`text-sm mt-1 opacity-80 ${seg.color}`}>Total Profiles</p>
              </div>
              <button className={`mt-4 px-4 py-2 bg-white rounded-lg text-sm font-bold shadow-sm ${seg.color}`}>
                View Audience
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Customers', value: customers.length, trend: '+12%' },
              { label: 'Repeat Purchase Rate', value: '42%', trend: '+4%' },
              { label: 'Avg Customer Value', value: `₹${(customers.reduce((acc, c) => acc + c.totalSpent, 0) / (customers.length || 1)).toFixed(0)}`, trend: '+8%' },
              { label: 'Avg Basket Size', value: '2.4 items', trend: '+0.1' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
                <p className="text-xs font-bold text-neutral-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-neutral-900">{stat.value}</p>
                <p className="text-xs font-bold mt-1 text-emerald-600">{stat.trend} vs last month</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-6">Customer Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Jan', new: 120, returning: 80 },
                    { name: 'Feb', new: 150, returning: 110 },
                    { name: 'Mar', new: 200, returning: 140 },
                    { name: 'Apr', new: 180, returning: 160 },
                    { name: 'May', new: 250, returning: 210 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="new" stackId="a" fill="#3B82F6" name="New Customers" />
                    <Bar dataKey="returning" stackId="a" fill="#10B981" name="Returning Customers" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-6">Top Cities</h3>
              <div className="space-y-4">
                {[
                  { city: 'Pipar City', users: 450, percentage: 45 },
                  { city: 'Jodhpur', users: 280, percentage: 28 },
                  { city: 'Jaipur', users: 150, percentage: 15 },
                  { city: 'Pali', users: 80, percentage: 8 },
                  { city: 'Others', users: 40, percentage: 4 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-neutral-700">{item.city}</span>
                      <span className="text-neutral-500">{item.users} Users</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              AI Insights & Actionables
            </h3>
            <p className="text-sm text-indigo-700 mb-6">Our AI has analyzed your customer data and suggests the following actions to improve retention and sales.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-50">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-1">Re-engage Inactive VIPs</h4>
                <p className="text-xs text-neutral-500 mb-4">42 VIP customers haven't purchased in 90 days. Send them a personalized "We Miss You" 20% OFF coupon.</p>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Create Campaign</button>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-50">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-1">Cross-Sell Opportunity</h4>
                <p className="text-xs text-neutral-500 mb-4">78% of customers who bought 'Formal Shoes' also bought 'Leather Belts'. Create a bundle offer.</p>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Setup Bundle</button>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-1">Reward Loyalists</h4>
                <p className="text-xs text-neutral-500 mb-4">You have 156 returning customers this month. Invite them to your new Loyalty Program.</p>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Send Invites</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-lg text-neutral-900 mb-4 border-b pb-2">Broadcast Message</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1">Select Audience</label>
                  <select className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>All Customers</option>
                    <option>VIP Customers</option>
                    <option>New Customers (Last 30 Days)</option>
                    <option>Inactive Customers (&gt;90 Days)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1">Message Channels</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                      <span className="text-sm">WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                      <span className="text-sm">SMS</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-1">Message Content</label>
                  <textarea 
                    rows={4}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>

                <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Send Broadcast
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
              <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Broadcasts
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-sm">
                  <div className="font-bold text-neutral-900">Weekend Flash Sale</div>
                  <div className="text-xs text-neutral-500 mt-1">Sent to: All Customers • 2 days ago</div>
                  <div className="flex gap-4 mt-2 text-xs font-bold text-blue-600">
                    <span>Email: 42% Open</span>
                    <span>WA: 89% Read</span>
                  </div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-sm">
                  <div className="font-bold text-neutral-900">Welcome Back Offer</div>
                  <div className="text-xs text-neutral-500 mt-1">Sent to: Inactive • 1 week ago</div>
                  <div className="flex gap-4 mt-2 text-xs font-bold text-blue-600">
                    <span>Email: 31% Open</span>
                    <span>WA: 75% Read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
