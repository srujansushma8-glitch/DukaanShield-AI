import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenDemo }) {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['home', 'agent', 'security', 'attack-lab', 'findings'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (linkId, href) => {
    if (linkId === 'attack-lab') {
      navigate(isAuthenticated ? '/app/attack-lab' : '/login');
      return;
    }
    if (linkId === 'findings') {
      navigate(isAuthenticated ? '/app/findings' : '/login');
      return;
    }
    const el = document.getElementById(linkId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Agent', href: '#agent', id: 'agent' },
    { name: 'Security', href: '#security', id: 'security' },
    { name: 'Attack Lab', href: '#attack-lab', id: 'attack-lab' },
    { name: 'Findings', href: '#findings', id: 'findings' },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
      isScrolled ? 'bg-[#F5EDE3]/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo Stacked */}
        <a href="#home" className="group flex flex-col items-start leading-none select-none">
          <span className="font-serif text-[22px] tracking-[0.22em] text-[#1E1714] font-medium uppercase">
            DUKAAN
          </span>
          <span className="font-sans text-[8.5px] tracking-[0.32em] text-[#5A4A40] uppercase font-semibold mt-1">
            SHIELD AI
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-10 text-[13px] tracking-wide text-[#5A4A40]">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.name}
                type="button"
                onClick={() => handleNavClick(link.id, link.href)}
                className={`relative py-1 transition-colors duration-200 hover:text-[#1E1714] font-normal cursor-pointer ${
                  isActive ? 'text-[#1E1714] font-medium' : ''
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1E1714] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center space-x-5 lg:space-x-6">
          <button 
            aria-label="Search" 
            className="text-[#1E1714] hover:text-[#8B5A2B] transition-colors p-1"
            onClick={() => onOpenDemo()}
          >
            <Search className="w-[17px] h-[17px] stroke-[1.75]" />
          </button>

          <button
            onClick={() => navigate(isAuthenticated ? '/app/dashboard' : '/login')}
            className="hidden sm:inline-flex items-center justify-center bg-white text-[#1E1714] text-[12.5px] font-medium px-5 py-2.5 rounded-full shadow-[0_2px_8px_rgba(30,23,20,0.06)] hover:bg-[#FAF6F0] hover:shadow-[0_4px_12px_rgba(30,23,20,0.1)] transition-all duration-200 border border-black/[0.04]"
          >
            {isAuthenticated ? 'Open Dashboard' : 'Run Demo'}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#1E1714] p-1.5 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F5EDE3] border-b border-[#1E1714]/10 px-6 py-4 flex flex-col space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick(link.id, link.href);
              }}
              className={`text-[14px] py-1.5 text-left ${
                activeSection === link.id ? 'text-[#1E1714] font-medium' : 'text-[#5A4A40]'
              }`}
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate(isAuthenticated ? '/app/dashboard' : '/login');
            }}
            className="w-full mt-2 bg-white text-[#1E1714] text-[13px] font-medium py-2.5 rounded-full text-center shadow-sm border border-black/5"
          >
            {isAuthenticated ? 'Open Dashboard' : 'Run Demo'}
          </button>
        </div>
      )}
    </header>
  );
}
