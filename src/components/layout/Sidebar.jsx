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
  LogOut,
  Store
} from 'lucide-react';
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
  ];

  return (
    <aside className="w-72 bg-[#1E1714] text-[#F5EDE3] h-screen flex flex-col justify-between flex-shrink-0 border-r border-white/10 select-none">
      {/* Top Branding */}
      <div>
        <div className="h-20 px-6 flex items-center border-b border-white/10">
          <NavLink to="/app/dashboard" className="flex flex-col items-start leading-none group">
            <span className="font-serif text-[21px] tracking-[0.22em] text-white font-medium uppercase group-hover:text-[#F3D7BD] transition-colors">
              DUKAAN
            </span>
            <span className="font-sans text-[8.5px] tracking-[0.32em] text-[#C4A482] uppercase font-semibold mt-1">
              SHIELD AI
            </span>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] text-[12.5px]">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="pt-4 pb-1.5 px-3">
                  <span className="text-[9px] font-sans uppercase tracking-[0.28em] text-[#8B5A2B] font-bold">
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
                  `flex items-center justify-between px-3.5 py-2.5 rounded-[12px] transition-all duration-150 ${
                    isActive
                      ? 'bg-white/12 text-white font-medium shadow-sm border border-white/10'
                      : 'text-[#CBBBB0] hover:bg-white/6 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 stroke-[1.8] text-[#C4A482]" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#8B5A2B]/40 text-[#F5EDE3] border border-[#8B5A2B]/40">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Logout */}
      <div className="p-4 border-t border-white/10 bg-[#16110F]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center font-serif text-[15px] font-medium flex-shrink-0">
              {user?.name ? user.name[0] : 'R'}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-medium text-white truncate">
                {user?.name || 'Ramesh Sharma'}
              </div>
              <div className="text-[10px] text-[#A6978C] flex items-center gap-1 truncate">
                <Store className="w-3 h-3 flex-shrink-0 text-[#C4A482]" />
                <span className="truncate">{user?.shopName || 'Sharma Kirana'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out of shop"
            className="p-2 text-[#A6978C] hover:text-rose-400 hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
