import React from 'react';
import { ShieldCheck, KeyRound, ShieldAlert, ClipboardCheck } from 'lucide-react';

export default function FeaturesStrip() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Intent-Aware Checks',
      desc: 'Every action matched to the task.',
    },
    {
      icon: KeyRound,
      title: 'Least Privilege',
      desc: 'Only the access each task needs.',
    },
    {
      icon: ShieldAlert,
      title: 'Attack Tested',
      desc: 'Injection, drift, split actions.',
    },
    {
      icon: ClipboardCheck,
      title: 'Clear Audit Trail',
      desc: 'Allowed, blocked, challenged.',
    },
  ];

  return (
    <section id="attack-lab" className="w-full py-8 sm:py-10 border-y border-[#1E1714]/10 bg-[#F5EDE3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#1E1714]/15">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-4 lg:px-6 xl:px-8 first:lg:pl-0 last:lg:pr-0"
              >
                <div className="flex-shrink-0 text-[#1E1714] p-1">
                  <Icon className="w-6 h-6 stroke-[1.4]" />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-[13.5px] font-medium text-[#1E1714] leading-tight">
                    {feature.title}
                  </h4>
                  <p className="text-[11px] sm:text-[11.5px] text-[#5A4A40] mt-0.5 leading-snug">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
