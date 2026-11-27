import React from 'react';
import { Play } from 'lucide-react';

export default function Hero({ onOpenDemo }) {
  return (
    <section id="home" className="relative w-full overflow-hidden pt-2 pb-16 lg:pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center min-h-[620px] lg:min-h-[660px]">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 xl:col-span-6 z-20 py-4 lg:py-8 lg:pr-6">
            
            {/* Eyebrow */}
            <div className="inline-block mb-6">
              <span className="font-sans text-[10.5px] uppercase tracking-[0.26em] text-[#5A4A40] font-semibold">
                AI SHOP MANAGER • PROTECTED BY AGNTID
              </span>
            </div>

            {/* Headline on 3 lines matching screenshot */}
            <h1 className="font-serif text-[64px] sm:text-[78px] xl:text-[88px] leading-[0.98] font-normal text-[#1E1714] tracking-tight">
              More <br />
              than just <br />
              <span className="text-[#8B5A2B] font-normal italic">automation.</span>
            </h1>

            {/* Subtext */}
            <p className="mt-7 text-[#5A4A40] text-[15px] sm:text-[16px] leading-[1.65] max-w-[420px] font-normal">
              An AI agent that runs your shop's sales, stock, reminders and supplier orders, with every action checked before it executes.
            </p>

            {/* Buttons Row */}
            <div className="mt-9 flex flex-wrap items-center gap-4 sm:gap-6">
              <a
                href="#agent"
                className="inline-flex items-center gap-2.5 bg-[#1E1714] text-white text-[13px] font-medium px-7 py-3.5 rounded-full hover:bg-[#342721] transition-all duration-200 shadow-sm group"
              >
                <span>Explore the Agent</span>
                <span className="text-[14px] group-hover:translate-x-1 transition-transform duration-200">→</span>
              </a>

              <button
                onClick={onOpenDemo}
                className="inline-flex items-center gap-3 text-[13px] font-medium text-[#1E1714] hover:text-[#8B5A2B] transition-colors group p-1"
              >
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(30,23,20,0.08)] border border-black/[0.04] group-hover:scale-105 transition-transform">
                  <Play className="w-3.5 h-3.5 text-[#1E1714] fill-[#1E1714] ml-0.5" />
                </span>
                <span>Watch Our Demo</span>
              </button>
            </div>

            {/* Stats Row with Thin Dividers */}
            <div className="mt-14 pt-8 border-t border-[#1E1714]/10 flex items-center">
              {/* Stat 1 */}
              <div className="pr-6 sm:pr-8">
                <div className="font-serif text-[26px] sm:text-[30px] font-medium text-[#1E1714] leading-tight">
                  4
                </div>
                <div className="text-[11px] text-[#5A4A40] mt-1 font-normal tracking-tight whitespace-nowrap">
                  Connected Tools
                </div>
              </div>

              {/* Divider */}
              <div className="w-[1px] h-9 bg-[#1E1714]/15 mx-2 sm:mx-3" />

              {/* Stat 2 */}
              <div className="px-6 sm:px-8">
                <div className="font-serif text-[26px] sm:text-[30px] font-medium text-[#1E1714] leading-tight">
                  5
                </div>
                <div className="text-[11px] text-[#5A4A40] mt-1 font-normal tracking-tight whitespace-nowrap">
                  Attack Types Tested
                </div>
              </div>

              {/* Divider */}
              <div className="w-[1px] h-9 bg-[#1E1714]/15 mx-2 sm:mx-3" />

              {/* Stat 3 */}
              <div className="pl-6 sm:pl-8">
                <div className="font-serif text-[26px] sm:text-[30px] font-medium text-[#1E1714] leading-tight">
                  Every
                </div>
                <div className="text-[11px] text-[#5A4A40] mt-1 font-normal tracking-tight whitespace-nowrap">
                  Action Checked
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Full-Bleed Photo with Smooth Fade */}
          <div className="lg:col-span-6 xl:col-span-6 relative h-[440px] sm:h-[540px] lg:h-[640px] w-full">
            
            {/* Soft fade gradient on the left edge for seamless blend into cream background */}
            <div className="hidden lg:block absolute inset-y-0 -left-10 w-28 bg-gradient-to-r from-[#F5EDE3] via-[#F5EDE3]/80 to-transparent z-10 pointer-events-none" />
            
            <div className="relative w-full h-full rounded-[22px] overflow-hidden shadow-[0_8px_32px_rgba(30,23,20,0.06)] bg-[#2A201C]">
              <img
                src="/images/hero_shop.jpg"
                alt="Sunlit boutique kirana counter with shelves and laptop"
                className="w-full h-full object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
              />

              {/* Subtle warm golden ambient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1E1714]/30 via-transparent to-[#F5EDE3]/10 pointer-events-none" />

              {/* Wall Sign: "SAFE ACTIONS ONLY" */}
              <div className="absolute top-8 right-8 text-right pointer-events-none z-20">
                <div className="font-sans text-[10.5px] font-bold tracking-[0.28em] text-[#EFE3D5]/90 uppercase leading-snug drop-shadow-sm">
                  SAFE<br />
                  ACTIONS<br />
                  ONLY
                </div>
              </div>

              {/* Handwritten script text in bottom right corner: "Access is not permission." */}
              <div className="absolute bottom-8 right-8 text-right pointer-events-none z-20">
                <p className="font-script text-[#E6C29E] text-[34px] sm:text-[42px] leading-[0.92] select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  Access is not<br />
                  <span className="text-[38px] sm:text-[46px] text-[#F3D7BD]">permission.</span>
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
