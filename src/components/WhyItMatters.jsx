import React from 'react';

export default function WhyItMatters({ onOpenDemo }) {
  return (
    <section id="security" className="w-full py-12 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Unified 3-Part Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[22px] overflow-hidden shadow-[0_8px_32px_rgba(30,23,20,0.06)] border border-[#1E1714]/5">
          
          {/* Column 1: Dark Espresso Left Panel (lg:col-span-4 or 5) */}
          <div className="lg:col-span-4 xl:col-span-4 bg-[#1E1714] text-[#F5EDE3] p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Eyebrow */}
              <span className="font-sans text-[10px] uppercase tracking-[0.26em] text-[#C4A482] font-semibold block mb-3">
                WHY IT MATTERS
              </span>

              {/* Heading */}
              <h2 className="font-serif text-[36px] sm:text-[42px] leading-[1.08] font-normal text-[#F5EDE3] tracking-tight mb-6">
                Access is not <br />
                permission.
              </h2>

              {/* Paragraph */}
              <p className="text-[#CBBBB0] text-[13px] sm:text-[13.5px] leading-[1.65] font-light max-w-sm">
                Small shops need AI help but cannot afford a data leak or a fake refund. A tool that is safe for one intent can be dangerous for another. DukaanShield checks whether every action fits the current task, not just whether the tool is allowed.
              </p>
            </div>

            {/* Outline Button */}
            <div className="mt-8 pt-2">
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center gap-2 border border-[#F5EDE3]/30 text-[#F5EDE3] text-[12px] font-medium px-5 py-2.5 rounded-full hover:bg-[#F5EDE3] hover:text-[#1E1714] transition-all duration-200 group"
              >
                <span>Our Approach</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Column 2: Center Photo (lg:col-span-5 or 6) */}
          <div className="lg:col-span-6 xl:col-span-6 relative min-h-[300px] sm:min-h-[380px] lg:min-h-full bg-[#2A201C]">
            <img
              src="/images/story_center.jpg"
              alt="Laptop, smartphone and plant on warm wooden counter"
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle warm golden ambient tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1714]/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Column 3: Narrow Cream Right Column (lg:col-span-2) */}
          <div className="lg:col-span-2 xl:col-span-2 bg-[#EFE6DC] p-8 lg:p-6 xl:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
            
            {/* Leaf shadow subtle graphic/gradient effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-black/[0.04] via-transparent to-black/[0.03] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Stacked Uppercase Label */}
              <div className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#1E1714] uppercase leading-relaxed">
                SAFE<br />
                ACTIONS<br />
                <span className="text-[#8B5A2B]">SMART</span><br />
                SHOPS
              </div>

              {/* Short Divider Line */}
              <div className="w-5 h-[1.5px] bg-[#1E1714]/20 my-5" />

              {/* Serifs text */}
              <div className="font-serif italic text-[15px] sm:text-[16px] text-[#5A4A40] leading-snug">
                Always <br />
                <span className="font-medium text-[#1E1714]">Intent-Aware.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
