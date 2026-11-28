import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  ShieldCheck,
  Search,
  Bell,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

export default function Topbar({ onToggleMobile }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date()).toUpperCase();

  return (
    <header className="h-20 bg-[#F6F0E6] border-b border-[#2A1C15]/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-[#F6F0E6]/95">
      
      {/* Left: Mobile Toggle & Global Search Pill */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-[#2A1C15] hover:bg-[#2A1C15]/5 rounded-xl cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Emblem & Wordmark */}
        <div className="lg:hidden flex items-center">
          <BrandLogo variant="light" size="sm" linkTo="/app/dashboard" />
        </div>

        {/* Global Search Pill Bar */}
        <div className="relative hidden sm:block w-64 md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-[#7A695C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search anything... (Ctrl + K)"
            className="w-full bg-[#EDE3D3]/80 hover:bg-[#EDE3D3] focus:bg-white text-[12.5px] text-[#2A1C15] placeholder-[#7A695C] rounded-full pl-9 pr-12 py-2 border border-[#2A1C15]/15 focus:outline-none focus:border-[#C99A4A] focus:ring-2 focus:ring-[#C99A4A]/25 transition-all shadow-2xs"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#7A695C] bg-[#DFD3C1] px-1.5 py-0.5 rounded border border-[#2A1C15]/10 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Center: Live AgntID Status Badge & Shop Info */}
      <div className="hidden xl:flex items-center space-x-4">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/10 border border-emerald-600/30 text-emerald-950 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="text-[12px] font-medium tracking-tight">
            AgntID Active • <strong className="font-semibold text-emerald-800">Zero Unchecked Tool Actions</strong>
          </span>
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        
        {/* Notification Bell with Badge */}
        <button
          onClick={() => navigate('/app/audit-logs')}
          title="Security Notifications"
          className="relative w-9 h-9 rounded-full bg-white border border-[#2A1C15]/12 flex items-center justify-center text-[#2A1C15] hover:bg-[#FAF6F0] hover:border-[#C99A4A]/50 transition-all shadow-xs cursor-pointer"
        >
          <Bell className="w-4 h-4 stroke-[2] text-[#5C4537]" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#F6F0E6]">
            3
          </span>
        </button>

        {/* Ask Gemini Button in Deep Brown */}
        <button
          onClick={() => navigate('/app/agent')}
          className="hidden md:inline-flex items-center gap-1.5 bg-[#2B1D16] text-white text-[12px] font-medium px-3.5 py-2 rounded-full hover:bg-[#3D291F] transition-all shadow-xs cursor-pointer border border-[#C99A4A]/25"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C99A4A]" />
          <span>Ask Gemini</span>
          <span className="text-[9px] text-[#C99A4A] font-bold">✨</span>
        </button>

        {/* User Profile Avatar Pill */}
        <button
          onClick={() => navigate('/app/settings')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C99A4A] to-[#8C6324] text-[#241812] flex items-center justify-center font-serif text-[14px] font-bold shadow-xs cursor-pointer ring-2 ring-white/60 hover:scale-105 transition-transform"
          title="Account Settings"
        >
          {user?.name ? user.name[0] : 'R'}
        </button>

        {/* Quick Settings Icon Button */}
        <button
          onClick={() => navigate('/app/settings')}
          title="Store Settings"
          className="p-2 rounded-full bg-white border border-[#2A1C15]/12 text-[#5C4537] hover:text-[#2A1C15] hover:bg-[#FAF6F0] transition-colors shadow-2xs cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
        </button>

      </div>

    </header>
  );
}
