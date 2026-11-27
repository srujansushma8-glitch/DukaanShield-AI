import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ShieldCheck, Search, Bell, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onToggleMobile }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="h-20 bg-[#F5EDE3] border-b border-[#1E1714]/10 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left: Mobile Hamburger & Current Date */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-[#1E1714] hover:bg-black/5 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#8B5A2B] font-semibold">
            {formattedDate}
          </div>
          <div className="text-[14px] font-serif text-[#1E1714] font-medium hidden sm:block">
            {user?.shopName || 'Sharma Kirana & General Store'}
          </div>
        </div>
      </div>

      {/* Center: Live AgntID Status Badge */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/10 border border-emerald-500/30 text-[#1E1714]">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span className="text-[11.5px] font-medium text-emerald-950">
          AgntID Active • <span className="font-semibold text-emerald-800">Zero Unchecked Tool Actions</span>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={() => navigate('/app/agent')}
          className="inline-flex items-center gap-2 bg-[#1E1714] text-white text-[12px] font-medium px-4 py-2 rounded-full hover:bg-[#342721] transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E6C29E]" />
          <span>Run AI Agent</span>
        </button>

        <button
          onClick={() => navigate('/app/audit-logs')}
          title="Security Notifications"
          className="relative w-9 h-9 rounded-full bg-white border border-[#1E1714]/10 flex items-center justify-center text-[#1E1714] hover:bg-[#FAF5EE] transition-colors shadow-sm"
        >
          <Bell className="w-4 h-4 stroke-[1.8]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8B5A2B]" />
        </button>
      </div>

    </header>
  );
}
