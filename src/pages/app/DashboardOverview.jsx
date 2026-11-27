import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.shop.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-[#5A4A40]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#8B5A2B]" />
          <span className="text-[13px] font-medium">Synchronizing shop ledger...</span>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    todaySales: 42850,
    totalOrders: 68,
    lowStockCount: 3,
    pendingDuesTotal: 14200,
    blockedActionsCount: 4,
    activeProtectedTools: 6
  };

  const salesTrend = data?.salesHistory || [];
  const bestSellers = data?.bestSellers || [];
  const lowStockItems = data?.lowStockItems || [];
  const recentOrders = data?.recentOrders || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
            SHOP MANAGEMENT OVERVIEW
          </span>
          <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Ramesh'}.
          </h1>
          <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal">
            Here's what's happening in your shop today.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOverview}
            className="p-2.5 rounded-full bg-white border border-[#1E1714]/10 text-[#5A4A40] hover:text-[#1E1714] transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/app/agent')}
            className="inline-flex items-center gap-2 bg-[#1E1714] text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-[#342721] transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#E6C29E]" />
            <span>Open AI Shop Manager</span>
          </button>
        </div>
      </div>

      {/* 2. Key KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white rounded-[20px] p-5 border border-[#1E1714]/8 shadow-[0_2px_12px_rgba(30,23,20,0.04)]">
          <div className="flex items-center justify-between text-[#5A4A40]">
            <span className="text-[11px] font-sans uppercase tracking-wider font-semibold">Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-[#8B5A2B]" />
          </div>
          <div className="font-serif text-[28px] font-normal text-[#1E1714] mt-2">
            ₹{summary.todaySales?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            +8.4% vs last Thursday
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-[20px] p-5 border border-[#1E1714]/8 shadow-[0_2px_12px_rgba(30,23,20,0.04)]">
          <div className="flex items-center justify-between text-[#5A4A40]">
            <span className="text-[11px] font-sans uppercase tracking-wider font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#8B5A2B]" />
          </div>
          <div className="font-serif text-[28px] font-normal text-[#1E1714] mt-2">
            {summary.totalOrders}
          </div>
          <div className="text-[11px] text-[#5A4A40] mt-1">
            Avg ticket: ₹{Math.round(summary.todaySales / (summary.totalOrders || 1))}
          </div>
        </div>

        {/* Card 3: Low Stock Products */}
        <div 
          onClick={() => navigate('/app/inventory')}
          className="bg-white rounded-[20px] p-5 border border-[#1E1714]/8 shadow-[0_2px_12px_rgba(30,23,20,0.04)] cursor-pointer hover:border-[#8B5A2B]/40 transition group"
        >
          <div className="flex items-center justify-between text-[#5A4A40]">
            <span className="text-[11px] font-sans uppercase tracking-wider font-semibold">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-[28px] font-normal text-[#1E1714] mt-2 group-hover:text-[#8B5A2B] transition-colors">
            {summary.lowStockCount} items
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Immediate reorder suggested
          </div>
        </div>

        {/* Card 4: Customer Dues */}
        <div 
          onClick={() => navigate('/app/customers')}
          className="bg-white rounded-[20px] p-5 border border-[#1E1714]/8 shadow-[0_2px_12px_rgba(30,23,20,0.04)] cursor-pointer hover:border-[#8B5A2B]/40 transition group"
        >
          <div className="flex items-center justify-between text-[#5A4A40]">
            <span className="text-[11px] font-sans uppercase tracking-wider font-semibold">Pending Dues</span>
            <Users className="w-4 h-4 text-[#8B5A2B]" />
          </div>
          <div className="font-serif text-[28px] font-normal text-[#1E1714] mt-2 group-hover:text-[#8B5A2B] transition-colors">
            ₹{summary.pendingDuesTotal?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#5A4A40] mt-1">
            Across 6 customer accounts
          </div>
        </div>

        {/* Card 5: Security Actions Blocked */}
        <div 
          onClick={() => navigate('/app/audit-logs')}
          className="bg-[#1E1714] text-white rounded-[20px] p-5 shadow-[0_4px_16px_rgba(30,23,20,0.12)] cursor-pointer hover:bg-[#2A201C] transition group"
        >
          <div className="flex items-center justify-between text-[#C4A482]">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">AgntID Defense</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-[28px] font-normal text-white mt-2 group-hover:text-[#F3D7BD] transition-colors">
            {summary.blockedActionsCount} Blocked
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">
            Zero unauthorized tool calls
          </div>
        </div>
      </div>

      {/* 3. Analytics: 7-Day Revenue Trend & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[22px] p-6 border border-[#1E1714]/8 shadow-sm">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h2 className="font-serif text-[20px] text-[#1E1714] font-normal">
                7-Day Sales Trend
              </h2>
              <p className="text-[12px] text-[#5A4A40]">
                Daily store billing revenue (INR) over the past week
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#F5EDE3] text-[#8B5A2B]">
              Total: ₹{salesTrend.reduce((a, b) => a + b.revenue, 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E5D8" />
                <XAxis dataKey="day" stroke="#7A685D" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#7A685D"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#1E1714',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#F5EDE3',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5A2B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[22px] p-6 border border-[#1E1714]/8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-serif text-[20px] text-[#1E1714] font-normal">
                Best-Selling Products
              </h2>
              <span className="text-[11px] text-[#5A4A40]">Today</span>
            </div>

            <div className="space-y-3.5">
              {bestSellers.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <span className="font-mono text-[10px] text-[#8B5A2B] bg-[#F5EDE3] w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[#1E1714] font-medium truncate">{item.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-medium text-[#1E1714] font-mono">
                      {item.soldToday} sold
                    </div>
                    <div className="text-[11px] text-[#5A4A40]">
                      ₹{(item.soldToday * item.price).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/app/sales')}
            className="w-full mt-5 pt-3 border-t border-black/5 text-[12px] text-[#8B5A2B] font-medium flex items-center justify-center gap-1 hover:text-[#1E1714] transition"
          >
            <span>View Complete Sales Ledger</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* 4. Two Column Operational Grid: Low Stock Warnings & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="lg:col-span-6 bg-white rounded-[22px] p-6 border border-[#1E1714]/8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="font-serif text-[19px] text-[#1E1714] font-normal">
                Depleted Inventory Alerts
              </h2>
            </div>
            <button
              onClick={() => navigate('/app/inventory')}
              className="text-[11.5px] text-[#8B5A2B] hover:underline font-medium"
            >
              Restock All →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {lowStockItems.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-[14px] bg-[#FAF5EE] border border-[#1E1714]/6 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-[13px] font-medium text-[#1E1714]">{prod.name}</h4>
                  <p className="text-[11px] text-[#5A4A40] mt-0.5">
                    Category: {prod.category} • Cost: ₹{prod.cost}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {prod.stock} LEFT (Min: {prod.threshold})
                  </span>
                  <div className="text-[10px] text-[#5A4A40] mt-1">
                    Suggest reorder: {prod.threshold * 3 - prod.stock} units
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Shop Activity Stream */}
        <div className="lg:col-span-6 bg-white rounded-[22px] p-6 border border-[#1E1714]/8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#8B5A2B]" />
              <h2 className="font-serif text-[19px] text-[#1E1714] font-normal">
                Recent Store Activity
              </h2>
            </div>
            <span className="text-[11px] text-emerald-800 font-medium">Real-time Stream</span>
          </div>

          <div className="mt-4 space-y-3.5">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-[12.5px]">
                <div className="w-2 h-2 rounded-full bg-[#8B5A2B] mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#1E1714]">{act.title}</span>
                    <span className="text-[10.5px] font-mono text-[#5A4A40]">{act.time}</span>
                  </div>
                  <p className="text-[11.5px] text-[#5A4A40] mt-0.5">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
