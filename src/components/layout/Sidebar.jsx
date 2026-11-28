import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  TrendingUp,
  Boxes,
  Users,
  Truck,
  ShieldCheck,
  FlaskConical,
  FileCheck2,
  ScrollText,
  Settings,
  HelpCircle,
  LogOut,
  Store
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'AI Shop Manager', path: '/app/agent', icon: Bot, badge: 'Active' },
    { name: 'Sales & Analytics', path: '/app/sales', icon: TrendingUp },
    { name: 'Inventory & Stock', path: '/app/inventory', icon: Boxes },
    { name: 'Customers & Reminders', path: '/app/customers', icon: Users },
    { name: 'Supplier Orders', path: '/app/suppliers', icon: Truck },
    { section: 'SECURITY & POLICIES' },
    { name: 'AgntID Security', path: '/app/security', icon: ShieldCheck },
    { name: 'Attack Lab', path: '/app/attack-lab', icon: FlaskConical, badge: '5 Tests' },
    { name: 'Security Findings', path: '/app/findings', icon: FileCheck2 },
    { name: 'Audit Logs', path: '/app/audit-logs', icon: ScrollText },
    { section: 'PREFERENCES' },
    { name: 'Settings', path: '/app/settings', icon: Settings },
    { name: 'Help & Support', path: '/app/settings#help', icon: HelpCircle },
  ];

  return (
    <aside className="w-72 bg-[#221610] text-[#EFECE6] h-screen flex flex-col justify-between shrink-0 border-r border-[#FAF6F0]/12 select-none relative overflow-hidden shadow-2xl">
      
      {/* Decorative Cream & Warm Ivory Ambient Glow at bottom */}
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-gradient-to-tr from-[#FAF6F0]/10 via-[#EDE3D3]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Branding with new official DukaanShield AI Shield Logo */}
      <div className="relative z-10">
        <div className="h-20 px-6 flex items-center border-b border-[#FAF6F0]/12 bg-[#1B110C]/60">
          <BrandLogo variant="dark" size="md" linkTo="/app/dashboard" />
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] text-[13px] custom-scrollbar">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="pt-5 pb-2 px-3">
                  <span className="text-[9.5px] font-sans uppercase tracking-[0.24em] text-[#A68F7B] font-bold">
                    {item.section}
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-[14px] transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FAF6F0] to-[#EDE3D3] text-[#221610] font-semibold shadow-[0_4px_16px_rgba(250,246,240,0.22)] border border-[#FAF6F0]/40'
                      : 'text-[#D5C9BD] hover:bg-white/[0.08] hover:text-[#FAF6F0]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 stroke-[2] transition-colors ${
                          isActive
                            ? 'text-[#221610]'
                            : 'text-[#A68F7B] group-hover:text-[#FAF6F0]'
                        }`}
                      />
                      <span className="tracking-tight">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#221610]/20 text-[#221610]'
                            : 'bg-[#FAF6F0]/15 text-[#FAF6F0] border border-[#FAF6F0]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Market Ticker */}
      <div className="relative z-10 p-4 border-t border-[#FAF6F0]/12 space-y-3 bg-[#1A100B]/95 backdrop-blur-sm">
        
        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FAF6F0] to-[#EDE3D3] text-[#221610] flex items-center justify-center font-serif text-[15px] font-bold shadow-sm shrink-0 border border-[#FAF6F0]/40">
              {user?.name ? user.name[0] : 'R'}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold text-white truncate">
                {user?.name || 'Ramesh Sharma'}
              </div>
              <div className="text-[10.5px] text-[#A68F7B] flex items-center gap-1 truncate">
                <Store className="w-3 h-3 shrink-0 text-[#EDE3D3]" />
                <span className="truncate">{user?.shopName || 'Sharma Kirana & General Store'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out of shop"
            className="p-2 text-[#A68F7B] hover:text-rose-400 hover:bg-white/5 rounded-full transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Mini Market Updates Ticker */}
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-white">Market updates</span>
              <p className="text-[10px] text-[#A68F7B] truncate">Sugar prices may rise 8%...</p>
            </div>
          </div>
          <TrendingUp className="w-3.5 h-3.5 text-[#EDE3D3] shrink-0" />
        </div>

      </div>

    </aside>
  );
}
