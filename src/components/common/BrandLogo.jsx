import React from 'react';
import { Link } from 'react-router-dom';
import logoSrc from '../../assets/dukaanshield-logo.png';

/**
 * Official DukaanShield AI Brand Logo Component
 * Features the cream-and-brown retail protective shield with central lock,
 * paired with the refined editorial typography wordmark.
 */
export default function BrandLogo({
  variant = 'dark',     // 'dark' (sidebar, dark panels, footer) | 'light' (header, light navbar, cards)
  size = 'md',          // 'sm' | 'md' | 'lg' | 'xl'
  collapsed = false,    // icon only (for collapsed responsive sidebar)
  linkTo = null,        // react-router Link path
  href = null,          // standard anchor href (e.g. for landing page '#home')
  className = '',
  showSubtitle = true
}) {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      imgPadding: 'p-0.5',
      mainText: 'text-[14px] tracking-[0.16em]',
      subText: 'text-[7.5px] tracking-[0.28em]'
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      imgPadding: 'p-0.5',
      mainText: 'text-[17px] tracking-[0.16em]',
      subText: 'text-[8.5px] tracking-[0.28em]'
    },
    lg: {
      box: 'w-12 h-12 rounded-xl',
      imgPadding: 'p-0.5',
      mainText: 'text-[22px] tracking-[0.18em]',
      subText: 'text-[9.5px] tracking-[0.32em]'
    },
    xl: {
      box: 'w-16 h-16 rounded-2xl',
      imgPadding: 'p-1',
      mainText: 'text-[26px] tracking-[0.2em]',
      subText: 'text-[11px] tracking-[0.34em]'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDarkBg = variant === 'dark';

  const content = (
    <div className={`inline-flex items-center space-x-3 select-none group ${className}`}>
      {/* 3D Shield & Storefront Emblem */}
      <div
        className={`${currentSize.box} relative shrink-0 p-[1.5px] rounded-xl bg-gradient-to-br from-[#FAF6F0] via-[#EDE3D3] to-[#C8B8A6] shadow-[0_2px_10px_rgba(201,154,74,0.18)] transition-transform duration-200 group-hover:scale-105`}
      >
        <div className={`w-full h-full rounded-[10px] bg-[#FAF6F0] overflow-hidden flex items-center justify-center ${currentSize.imgPadding}`}>
          <img
            src={logoSrc}
            alt="DukaanShield AI"
            className="w-full h-full object-contain drop-shadow-xs"
            loading="eager"
          />
        </div>
      </div>

      {/* Wordmark */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-serif font-semibold uppercase transition-colors ${currentSize.mainText} ${
              isDarkBg
                ? 'text-white group-hover:text-[#FAF6F0]'
                : 'text-[#1E1714] group-hover:text-[#3B281E]'
            }`}
          >
            DUKAAN
          </span>
          {showSubtitle && (
            <span
              className={`font-sans font-bold uppercase mt-1 tracking-wider ${currentSize.subText} ${
                isDarkBg ? 'text-[#C99A4A]' : 'text-[#8B5A2B]'
              }`}
            >
              SHIELD AI
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} aria-label="DukaanShield AI" className="inline-block">
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} aria-label="DukaanShield AI" className="inline-block">
        {content}
      </a>
    );
  }

  return content;
}
