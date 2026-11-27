import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <footer id="findings" className="w-full bg-[#1E1714] text-[#F5EDE3] pt-14 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Main Footer Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10">
          
          {/* 1. Logo */}
          <div className="flex flex-col items-start leading-none">
            <span className="font-serif text-[20px] tracking-[0.22em] text-white font-medium uppercase">
              DUKAAN
            </span>
            <span className="font-sans text-[8px] tracking-[0.32em] text-[#C4A482] uppercase font-semibold mt-1">
              SHIELD AI
            </span>
          </div>

          {/* 2. Newsletter Signup */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
            <div>
              <h4 className="text-[13px] font-medium text-white leading-tight">
                Join our newsletter
              </h4>
              <p className="text-[11px] text-[#A6978C] mt-0.5 leading-snug">
                Get our attack findings and security insights.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <div className="relative flex items-center bg-white/[0.06] border border-white/15 rounded-full pl-4 pr-1.5 py-1.5 w-full sm:w-[280px] md:w-[310px] focus-within:border-white/40 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={subscribed ? "Thank you for subscribing!" : "Your email address"}
                  disabled={subscribed}
                  required
                  className="bg-transparent text-[12px] text-white placeholder:text-white/40 outline-none w-full pr-2"
                />
                <button
                  type="submit"
                  aria-label="Submit newsletter"
                  className="w-7 h-7 rounded-full bg-white text-[#1E1714] flex items-center justify-center hover:bg-[#F5EDE3] hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                >
                  {subscribed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 3. Social Circle Icons (Matching exact 4 positions from screenshot) */}
          <div className="flex items-center space-x-2.5">
            {/* Instagram */}
            <a
              href="#instagram"
              aria-label="Instagram"
              className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.6]" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* TikTok / Video */}
            <a
              href="#tiktok"
              aria-label="TikTok"
              className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.892 2.897 2.897 0 0 1-2.892-2.892 2.896 2.896 0 0 1 2.892-2.892c.31 0 .605.05.88.143V9.45a6.326 6.326 0 0 0-.88-.063A6.338 6.338 0 0 0 3 15.725 6.338 6.338 0 0 0 9.338 22.06a6.338 6.338 0 0 0 6.338-6.338V8.674a8.19 8.19 0 0 0 4.913 1.613V6.842a4.773 4.773 0 0 1-1-.156z"/>
              </svg>
            </a>

            {/* Pinterest */}
            <a
              href="#pinterest"
              aria-label="Pinterest"
              className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-4.37 23.18c-.07-.98-.13-2.5.03-3.57.14-.98 1.15-4.87 1.15-4.87s-.29-.58-.29-1.45c0-1.36.79-2.38 1.77-2.38.83 0 1.23.63 1.23 1.38 0 .84-.54 2.1-81 3.26-.23.97.49 1.76 1.44 1.76 1.73 0 3.06-1.83 3.06-4.46 0-2.33-1.68-3.96-4.08-3.96-2.78 0-4.41 2.08-4.41 4.23 0 .84.32 1.74.73 2.23.08.1.09.19.07.29-.07.3-.23.97-.26 1.1-.04.18-.14.22-.32.13-1.2-.56-1.95-2.31-1.95-3.72 0-3.03 2.2-5.81 6.35-5.81 3.33 0 5.92 2.37 5.92 5.55 0 3.31-2.09 5.98-4.99 5.98-.97 0-1.89-.51-2.2-.11l-.6 2.29c-.22.84-.81 1.9-1.21 2.54A11.97 11.97 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
              </svg>
            </a>

            {/* Spotify */}
            <a
              href="#spotify"
              aria-label="Spotify"
              className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          </div>

          {/* 4. Vertical / Stacked Text */}
          <div className="hidden xl:block text-right">
            <p className="font-sans text-[8px] uppercase tracking-[0.28em] text-white/40 leading-relaxed">
              A<br />
              SAFER SHOPS<br />
              TOMORROW
            </p>
          </div>

        </div>

        {/* Bottom Copyright & Legal Row */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-3">
          <p>© 2026 DukaanShield AI. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-white/80 transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white/80 transition-colors">Terms</a>
            <a href="#contact" className="hover:text-white/80 transition-colors">Contact</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
