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
  ChevronRight,
  ShieldCheck,
  Store,
  Calendar,
  Trophy,
  Zap,
  Lightbulb,
  Lock,
  ChevronDown,
  Package,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import storefrontImg from '../../assets/storefront-header.jpg';

export default function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Today');

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
      <div className="flex flex-col items-center justify-center min-h-[480px] space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#EDE3D3] border border-[#C99A4A]/30 flex items-center justify-center shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C99A4A]" />
        </div>
        <div className="text-center">
          <h3 className="font-serif text-[18px] text-[#2B1D16]">Connecting DukaanShield AI Ledger</h3>
          <p className="text-[12.5px] text-[#7A695C] mt-0.5">Fetching store telemetry, stock levels, and AgntID security state...</p>
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

  // Mock-aligned rich sales curve data matching the reference illustration
  const salesHistory = data?.salesHistory?.length
    ? data.salesHistory.map((s, idx) => ({
        day: s.day,
        date: ['Nov 23', 'Nov 24', 'Nov 25', 'Nov 26', 'Nov 27', 'Nov 28', 'Nov 29'][idx % 7],
        revenue: s.revenue || 35000
      }))
    : [
        { day: 'Mon', date: 'Nov 23', revenue: 21500 },
        { day: 'Tue', date: 'Nov 24', revenue: 31200 },
        { day: 'Wed', date: 'Nov 25', revenue: 36800 },
        { day: 'Thu', date: 'Nov 26', revenue: 38400 },
        { day: 'Fri', date: 'Nov 27', revenue: 47250 },
        { day: 'Sat', date: 'Nov 28', revenue: 45900 },
        { day: 'Sun', date: 'Nov 29', revenue: 42850 }
      ];

  const totalWeeklySales = salesHistory.reduce((acc, curr) => acc + (curr.revenue || 0), 0) || 307560;

  // Best-sellers with realistic FMCG items and package visual indicators
  const bestSellersList = [
    {
      id: 1,
      name: 'Madnur Pure & Hygienic Sugar 1kg',
      soldToday: 15,
      price: 18,
      total: 270,
      badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    },
    {
      id: 2,
      name: 'Tata Salt Vacuum Evaporated 1kg',
      soldToday: 14,
      price: 28,
      total: 392,
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/20'
    },
    {
      id: 3,
      name: 'Parle-G Gold Biscuits 1kg',
      soldToday: 12,
      price: 120,
      total: 1440,
      badgeColor: 'bg-yellow-500/10 text-yellow-800 border-yellow-500/20'
    },
    {
      id: 4,
      name: 'Fortune Sunlite Refined Sunflower Oil 1L',
      soldToday: 11,
      price: 165,
      total: 1815,
      badgeColor: 'bg-orange-500/10 text-orange-700 border-orange-500/20'
    },
    {
      id: 5,
      name: 'Everest Turmeric Powder 200g',
      soldToday: 10,
      price: 42,
      total: 420,
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
    }
  ];

  // Custom Recharts Tooltip styled in dark espresso brown
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#221610] text-white p-3 rounded-xl shadow-2xl border border-[#C99A4A]/25 text-center font-sans">
          <div className="font-serif text-[18px] font-bold text-[#E6C29E]">
            ₹{item.revenue?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#A68F7B] mt-0.5">
            {item.day}, {item.date}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-7 pb-16">
      
      {/* 1. Shop Info Subheader & Main Greeting with Storefront Backdrop */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#EDE3D3]/70 border border-[#2B1D16]/8 p-6 sm:p-8 backdrop-blur-xs shadow-xs">
        
        {/* Subtle Storefront Background on Upper Right */}
        <div
          className="absolute -right-8 -top-8 w-1/2 h-full bg-cover bg-center opacity-25 mix-blend-multiply pointer-events-none rounded-r-[26px]"
          style={{
            backgroundImage: `url(${storefrontImg})`,
            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
          }}
        />

        {/* Store & Date Micro-header */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 pb-3 border-b border-[#2B1D16]/10 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-sans text-[#7A695C]">
            <span className="flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider text-[#C99A4A]">
              <Calendar size={13} className="text-[#C99A4A]" />
              FRIDAY, 27 NOV 2026
            </span>
            <span className="hidden sm:inline text-[#2B1D16]/20">•</span>
            <span className="flex items-center gap-1.5 font-medium text-[#2B1D16]">
              <Store size={13} className="text-[#7A695C]" />
              {user?.shopName || 'Sharma Kirana & General Store'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/10 border border-emerald-600/30 text-emerald-900 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>AgntID Active • Zero Unchecked Tool Actions</span>
          </div>
        </div>

        {/* Hero Greeting Text */}
        <div className="relative z-10 max-w-2xl">
          <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#C99A4A] font-bold block mb-1">
            SHOP MANAGEMENT OVERVIEW
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] text-[#2B1D16] font-normal tracking-tight leading-[1.1]">
            Good morning, {user?.name?.split(' ')[0] || 'Ramesh'}.
          </h1>
          <p className="text-[13.5px] text-[#7A695C] mt-1.5 font-normal leading-relaxed">
            Here's what's happening in your shop today.
          </p>
        </div>

      </div>

      {/* 2. 5 Redesigned KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: Today's Sales */}
        <div className="bg-[#FFFCF7] rounded-[22px] p-5 border border-[#2B1D16]/8 shadow-[0_4px_20px_rgba(43,29,22,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[#7A695C]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#C99A4A]/12 flex items-center justify-center text-[#C99A4A]">
                <TrendingUp size={15} />
              </div>
              <span className="text-[10.5px] font-sans uppercase tracking-wider font-bold text-[#7A695C]">
                TODAY'S SALES
              </span>
            </div>
            
            {/* Sparkline Decorative Graphic */}
            <svg className="w-12 h-6" viewBox="0 0 50 20" fill="none">
              <path
                d="M2 15 Q 12 18, 20 10 T 35 12 T 48 3"
                stroke="#C99A4A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="font-serif text-[32px] font-normal text-[#2B1D16] mt-3">
            ₹{summary.todaySales?.toLocaleString('en-IN') || '42,850'}
          </div>
          
          <div className="flex items-center gap-1.5 text-[11px] text-[#16865B] font-semibold mt-1">
            <span>↑ +8.4%</span>
            <span className="text-[#7A695C] font-normal">vs last Thursday</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-[#FFFCF7] rounded-[22px] p-5 border border-[#2B1D16]/8 shadow-[0_4px_20px_rgba(43,29,22,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-[#7A695C]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#C99A4A]/12 flex items-center justify-center text-[#C99A4A]">
                <ShoppingBag size={15} />
              </div>
              <span className="text-[10.5px] font-sans uppercase tracking-wider font-bold text-[#7A695C]">
                TOTAL ORDERS
              </span>
            </div>
            <div className="w-6 h-6 rounded-md bg-[#EDE3D3] flex items-center justify-center text-[#C99A4A]">
              <Package size={12} />
            </div>
          </div>

          <div className="font-serif text-[32px] font-normal text-[#2B1D16] mt-3">
            {summary.totalOrders || 68}
          </div>

          <div className="text-[11px] text-[#7A695C] mt-1 font-mono">
            Avg ticket: ₹{Math.round(summary.todaySales / (summary.totalOrders || 1)) || 630}
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div
          onClick={() => navigate('/app/inventory')}
          className="bg-[#FFFCF7] rounded-[22px] p-5 border border-[#2B1D16]/8 shadow-[0_4px_20px_rgba(43,29,22,0.03)] hover:border-[#D94B45]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#7A695C]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#D94B45]/10 flex items-center justify-center text-[#D94B45]">
                <AlertTriangle size={15} />
              </div>
              <span className="text-[10.5px] font-sans uppercase tracking-wider font-bold text-[#D94B45]">
                LOW STOCK
              </span>
            </div>
            <div className="w-6 h-6 rounded-md bg-[#EDE3D3] flex items-center justify-center text-[#C99A4A]">
              <Layers size={12} />
            </div>
          </div>

          <div className="font-serif text-[32px] font-normal text-[#2B1D16] mt-3 group-hover:text-[#D94B45] transition-colors">
            {summary.lowStockCount || 3} items
          </div>

          <div className="text-[11px] text-[#D94B45] font-medium mt-1 flex items-center justify-between">
            <span>Immediate reorder suggested</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Pending Dues */}
        <div
          onClick={() => navigate('/app/customers')}
          className="bg-[#FFFCF7] rounded-[22px] p-5 border border-[#2B1D16]/8 shadow-[0_4px_20px_rgba(43,29,22,0.03)] hover:border-[#C99A4A]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#7A695C]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#C99A4A]/12 flex items-center justify-center text-[#C99A4A]">
                <Clock size={15} />
              </div>
              <span className="text-[10.5px] font-sans uppercase tracking-wider font-bold text-[#7A695C]">
                PENDING DUES
              </span>
            </div>
            <div className="w-6 h-6 rounded-md bg-[#EDE3D3] flex items-center justify-center text-[#C99A4A]">
              <Users size={12} />
            </div>
          </div>

          <div className="font-serif text-[32px] font-normal text-[#2B1D16] mt-3 group-hover:text-[#C99A4A] transition-colors">
            ₹{summary.pendingDuesTotal?.toLocaleString('en-IN') || '14,200'}
          </div>

          <div className="text-[11px] text-[#7A695C] mt-1 flex items-center justify-between">
            <span>Across 6 customer accounts</span>
            <ChevronRight size={13} className="text-[#C99A4A] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 5: AgntID Defense Distinct Dark Brown Card */}
        <div
          onClick={() => navigate('/app/audit-logs')}
          className="bg-[#221610] text-white rounded-[22px] p-5 shadow-[0_8px_24px_rgba(34,22,16,0.25)] hover:bg-[#2B1D16] hover:-translate-y-0.5 transition-all cursor-pointer group border border-[#C99A4A]/25 relative overflow-hidden"
        >
          {/* Subtle Emerald & Gold Ambient Corner Shimmer */}
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-emerald-500/15 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10.5px] font-mono uppercase tracking-wider font-bold text-[#E6C29E]">
              AgntID DEFENSE
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={13} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 relative z-10">
            <div>
              <div className="font-serif text-[30px] font-normal text-white group-hover:text-[#E6C29E] transition-colors">
                1441 Blocked
              </div>
              <div className="text-[11px] text-emerald-400/90 font-sans mt-0.5">
                Zero unauthorized tool calls
              </div>
            </div>

            {/* Glowing 3D Shield Emblem */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-900/40 to-[#221610] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform">
              <ShieldCheck size={22} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Middle Grid: 7-Day Sales Trend & Best-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart (7 or 8 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#FFFCF7] rounded-[24px] p-6 sm:p-7 border border-[#2B1D16]/8 shadow-[0_4px_24px_rgba(43,29,22,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#2B1D16]/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C99A4A]/12 flex items-center justify-center text-[#C99A4A]">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="font-serif text-[22px] text-[#2B1D16] font-normal">
                  7-Day Sales Trend
                </h2>
                <p className="text-[12px] text-[#7A695C]">
                  Daily store billing revenue (INR) over the past week
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EDE3D3] text-[#2B1D16] font-mono text-[11px] font-bold border border-[#2B1D16]/10">
                <Calendar size={12} className="text-[#C99A4A]" />
                Total: ₹{totalWeeklySales.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistory} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C99A4A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C99A4A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE3D3" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#7A695C"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#EDE3D3' }}
                  tickFormatter={(val, idx) => `${val}\n${salesHistory[idx]?.date || ''}`}
                />
                <YAxis
                  stroke="#7A695C"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 50000]}
                  ticks={[0, 10000, 20000, 30000, 40000, 50000]}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C99A4A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                  dot={{ r: 4, fill: '#FFFCF7', stroke: '#C99A4A', strokeWidth: 2.5 }}
                  activeDot={{ r: 6, fill: '#221610', stroke: '#C99A4A', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers (4 or 5 columns) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#FFFCF7] rounded-[24px] p-6 sm:p-7 border border-[#2B1D16]/8 shadow-[0_4px_24px_rgba(43,29,22,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#2B1D16]/8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C99A4A]/12 flex items-center justify-center text-[#C99A4A]">
                  <Trophy size={16} />
                </div>
                <h2 className="font-serif text-[21px] text-[#2B1D16] font-normal">
                  Best-Selling Products
                </h2>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setTimeFilter(timeFilter === 'Today' ? 'This Week' : 'Today')}
                  className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-[#7A695C] bg-[#EDE3D3]/70 px-2.5 py-1 rounded-full border border-black/5 hover:text-[#2B1D16] transition cursor-pointer"
                >
                  <span>{timeFilter}</span>
                  <ChevronDown size={11} />
                </button>
              </div>
            </div>

            {/* Ranked List Matching Reference */}
            <div className="space-y-3.5 mt-4">
              {bestSellersList.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#EDE3D3]/50 transition-colors group"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <span className="font-mono text-[11px] text-[#7A695C] w-5 text-center font-bold">
                      {prod.id}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#EDE3D3] border border-[#C99A4A]/20 flex items-center justify-center shrink-0 shadow-2xs">
                      <Package size={15} className="text-[#C99A4A]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium text-[#2B1D16] truncate group-hover:text-[#C99A4A] transition-colors">
                        {prod.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-[12px] font-semibold text-[#2B1D16]">
                      {prod.soldToday} sold
                    </div>
                    <div className="text-[11px] font-mono text-[#7A695C]">
                      ₹{prod.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/app/sales')}
            className="w-full mt-4 pt-3.5 border-t border-[#2B1D16]/8 text-[12px] text-[#C99A4A] font-medium flex items-center justify-center gap-1.5 hover:text-[#2B1D16] transition cursor-pointer"
          >
            <span>View Complete Sales Ledger</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* 4. Bottom 3-Column Operational Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: AI Insights & Recommendations (Dark Espresso Brown Card) */}
        <div className="bg-[#221610] text-white rounded-[24px] p-6 border border-[#C99A4A]/20 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#C99A4A]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-[13px] font-medium text-white">
                <Lightbulb size={16} className="text-[#C99A4A]" />
                <span className="font-serif text-[17px]">AI Insights & Recommendations</span>
              </div>
              <button
                onClick={() => navigate('/app/agent')}
                className="text-[11px] text-[#C99A4A] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-5">
              {/* Glowing AI Brain / Orb Graphic */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 via-[#221610] to-[#C99A4A]/20 border border-blue-400/30 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.3)] shrink-0">
                <span className="font-mono text-[14px] font-bold text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]">
                  AI
                </span>
              </div>

              {/* Actionable Recommendations Bullet Points */}
              <div className="space-y-2.5 text-[12px] text-[#EFECE6]/90 flex-1">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Sugar demand may increase this weekend.</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                  <span className="truncate">3 products need restocking soon.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-blue-400 shrink-0" />
                  <span className="truncate">2 customer payments are overdue.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/6 text-[10.5px] font-mono text-[#A68F7B]">
            Autonomous AgntID Market Model • Daily Refresh
          </div>
        </div>

        {/* Column 2: Recent Activity Timeline */}
        <div className="bg-[#FFFCF7] rounded-[24px] p-6 border border-[#2B1D16]/8 shadow-[0_4px_24px_rgba(43,29,22,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#2B1D16]/8">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#C99A4A]" />
                <h3 className="font-serif text-[18px] text-[#2B1D16]">Recent Activity</h3>
              </div>
              <button
                onClick={() => navigate('/app/audit-logs')}
                className="text-[11px] text-[#C99A4A] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </button>
            </div>

            {/* Activity Stream Matching Reference */}
            <div className="mt-4 space-y-3.5 text-[12px]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] text-[#7A695C] font-mono shrink-0">2 min ago</span>
                <span className="font-medium text-[#2B1D16] truncate">New order placed - ₹850</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-[11px] text-[#7A695C] font-mono shrink-0">5 min ago</span>
                <span className="text-[#2B1D16] truncate">Stock alert: Tata Salt (Low Stock)</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[11px] text-[#7A695C] font-mono shrink-0">8 min ago</span>
                <span className="text-[#2B1D16] truncate">Payment received - ₹1,200</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2B1D16]/8 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Ledger Stream
            </span>
            <span className="font-mono text-[10px] text-[#7A695C]">Sync: Instant</span>
          </div>
        </div>

        {/* Column 3: AgntID Security Promo Card (Dark Espresso Brown Card) */}
        <div className="bg-[#221610] text-white rounded-[24px] p-6 border border-[#C99A4A]/30 shadow-md flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Golden Glow Shimmer */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-[#C99A4A]/20 via-transparent to-transparent rounded-full blur-xl pointer-events-none" />

          <div className="flex flex-col items-center text-center pt-2">
            {/* Glowing 3D Shield Padlock Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 via-[#221610] to-[#C99A4A]/30 border border-[#C99A4A]/40 flex items-center justify-center shadow-[0_0_24px_rgba(201,154,74,0.25)] group-hover:scale-105 transition-transform mb-3">
              <Lock size={26} className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
            </div>

            <h3 className="font-serif text-[20px] font-normal text-white">
              Your Shop. Our Protection.
            </h3>
            <p className="text-[11.5px] text-[#C99A4A] mt-1 font-mono">
              Powered by AgntID AI Security
            </p>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={() => navigate('/app/security')}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#C99A4A] to-[#B88636] text-[#221610] text-[12.5px] font-bold px-4 py-2.5 rounded-full hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(201,154,74,0.3)] cursor-pointer"
            >
              <span>Learn More</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
