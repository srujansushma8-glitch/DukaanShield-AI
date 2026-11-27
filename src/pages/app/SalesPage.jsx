import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../../services/api';

export default function SalesPage() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.shop.getSales();
        setSalesData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const history = salesData?.salesHistory || [];
  const orders = salesData?.recentOrders || [];
  const summary = salesData?.todaySummary || { revenue: 42850, orders: 68, avgTicket: 630 };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
          SALES LEDGER & POS REVENUE
        </span>
        <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
          Sales & Analytics
        </h1>
        <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal">
          Real-time POS settlements, daily ticket volumes, and 7-day revenue performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-5 border border-[#1E1714]/8 shadow-xs">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#5A4A40] font-semibold">Today's Gross Sales</span>
          <div className="font-serif text-[30px] text-[#1E1714] mt-2">₹{summary.revenue?.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">UPI: 72% • Cash: 28%</div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#1E1714]/8 shadow-xs">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#5A4A40] font-semibold">Orders Completed</span>
          <div className="font-serif text-[30px] text-[#1E1714] mt-2">{summary.orders} transactions</div>
          <div className="text-[11px] text-[#5A4A40] mt-1">Peak hour: 09:00 AM – 11:30 AM</div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#1E1714]/8 shadow-xs">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#5A4A40] font-semibold">Average Basket Size</span>
          <div className="font-serif text-[30px] text-[#1E1714] mt-2">₹{summary.avgTicket}</div>
          <div className="text-[11px] text-[#5A4A40] mt-1">Consistent with FMCG retail averages</div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-[22px] p-6 border border-[#1E1714]/10 shadow-sm">
        <h3 className="font-serif text-[20px] text-[#1E1714] font-medium mb-4">
          Weekly Revenue Trajectory
        </h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D8" />
              <XAxis dataKey="day" stroke="#7A685D" fontSize={11} tickLine={false} />
              <YAxis stroke="#7A685D" fontSize={11} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Sales']}
                contentStyle={{ backgroundColor: '#1E1714', borderRadius: '12px', color: '#F5EDE3' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8B5A2B" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-[22px] border border-[#1E1714]/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <h3 className="font-serif text-[20px] text-[#1E1714] font-medium">Recent POS Register Transactions</h3>
          <span className="text-[11px] font-mono text-[#5A4A40]">Auto-settling</span>
        </div>
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-[#FAF5EE] text-[#5A4A40] font-mono text-[10.5px] uppercase">
            <tr>
              <th className="py-3 px-5">Receipt ID</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-5">Items Purchased</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-5 text-right">Total (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-[#FAF5EE]/50">
                <td className="py-3 px-5 font-mono text-[#1E1714] font-semibold">{o.id}</td>
                <td className="py-3 px-4 text-[#5A4A40] font-mono">{o.time}</td>
                <td className="py-3 px-5 text-[#1E1714]">{o.items}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-medium ${
                    o.payment === 'UPI' ? 'bg-emerald-100 text-emerald-800' :
                    o.payment === 'Cash' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {o.payment}
                  </span>
                </td>
                <td className="py-3 px-5 text-right font-medium text-[#1E1714] font-mono">
                  ₹{o.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
