import React from 'react';
import { Plus } from 'lucide-react';

export default function AgentTasks({ onOpenDemo }) {
  const tasks = [
    {
      category: 'SALES',
      title: 'Check Sales',
      desc: "Read today's totals.",
      status: 'ALLOWED',
      statusType: 'allowed',
      image: '/images/sales.jpg',
    },
    {
      category: 'STOCK',
      title: 'Low Stock Alerts',
      desc: 'Find items running low.',
      status: 'ALLOWED',
      statusType: 'allowed',
      image: '/images/stock.jpg',
    },
    {
      category: 'CUSTOMERS',
      title: 'Payment Reminders',
      desc: 'Dues only, no history.',
      status: 'CHALLENGED',
      statusType: 'challenged',
      image: '/images/customers.jpg',
    },
    {
      category: 'SUPPLIERS',
      title: 'Supplier Orders',
      desc: 'Draft orders, never edit bank details.',
      status: 'BLOCKED (for edits)',
      statusType: 'blocked',
      image: '/images/suppliers.jpg',
    },
  ];

  const getStatusBadgeStyle = (type) => {
    switch (type) {
      case 'allowed':
        return 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'challenged':
        return 'bg-amber-950/70 border border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
      case 'blocked':
        return 'bg-rose-950/70 border border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
      default:
        return 'bg-white/20 text-white border border-white/20';
    }
  };

  return (
    <section id="agent" className="w-full pt-16 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10">
          <div>
            <span className="font-sans text-[10.5px] uppercase tracking-[0.26em] text-[#5A4A40] font-semibold block mb-2">
              THE AGENT
            </span>
            <h2 className="font-serif text-[40px] sm:text-[48px] lg:text-[52px] leading-[1.05] font-normal text-[#1E1714] tracking-tight">
              Daily shop tasks.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 max-w-xl">
            <p className="text-[#5A4A40] text-[13.5px] sm:text-[14px] leading-relaxed">
              Give one instruction. The agent splits it into tasks and uses real tools, while AgntID checks each action against its intent.
            </p>
            <button
              onClick={onOpenDemo}
              className="inline-flex items-center gap-2 border border-[#1E1714] text-[#1E1714] text-[12px] font-medium px-5 py-2.5 rounded-full hover:bg-[#1E1714] hover:text-white transition-all duration-200 whitespace-nowrap self-start sm:self-auto group"
            >
              <span>View All Tasks</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* 4 Image Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {tasks.map((task, idx) => (
            <div
              key={idx}
              className="group relative rounded-[20px] overflow-hidden aspect-[3/4.2] bg-[#2A201C] shadow-[0_4px_20px_rgba(30,23,20,0.08)] hover:shadow-[0_12px_32px_rgba(30,23,20,0.16)] transition-all duration-300"
            >
              {/* Card Photo with object-cover */}
              <img
                src={task.image}
                alt={task.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Dark bottom gradient overlay as in screenshot */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#140F0D] via-[#1E1714]/65 via-45% to-transparent opacity-90 pointer-events-none" />

              {/* Card Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white flex flex-col justify-end">
                {/* Category */}
                <span className="font-sans text-[9px] uppercase tracking-[0.24em] text-[#D8C7B5] font-semibold">
                  {task.category}
                </span>

                {/* Title */}
                <h3 className="font-serif text-[22px] sm:text-[23px] font-normal text-white mt-1 leading-snug">
                  {task.title}
                </h3>

                {/* Description */}
                <p className="text-[12px] text-[#D8C7B5]/85 mt-1 leading-snug font-light">
                  {task.desc}
                </p>

                {/* Bottom Row: Status Tag & Circular '+' Button */}
                <div className="mt-4 pt-1 flex items-center justify-between">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[9.5px] font-semibold tracking-wider uppercase backdrop-blur-sm ${getStatusBadgeStyle(
                      task.statusType
                    )}`}
                  >
                    {task.status}
                  </span>

                  <button
                    onClick={onOpenDemo}
                    aria-label={`Inspect ${task.title}`}
                    className="w-8 h-8 rounded-full bg-white text-[#1E1714] flex items-center justify-center font-medium shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
