import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F6F0E6] overflow-hidden font-sans relative selection:bg-[#C99A4A]/30 selection:text-[#191A1D]">
      
      {/* Subtle Ambient Radial Glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-[#C99A4A]/10 via-[#FAF6F0]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-72 w-[450px] h-[450px] bg-gradient-to-tr from-[#C99A4A]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F6F0E6]/95">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}
