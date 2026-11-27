import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail('owner@dukaanshield.ai');
    setPassword('Shop@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5EDE3] flex flex-col lg:flex-row">
      {/* Left Column: Branded Editorial Showcase */}
      <div className="lg:w-1/2 bg-[#1E1714] text-[#F5EDE3] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Warm Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#140F0D] via-transparent to-[#8B5A2B]/20 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex flex-col items-start leading-none group">
            <span className="font-serif text-[24px] tracking-[0.22em] text-white font-medium uppercase group-hover:text-[#F3D7BD] transition-colors">
              DUKAAN
            </span>
            <span className="font-sans text-[9px] tracking-[0.34em] text-[#C4A482] uppercase font-semibold mt-1">
              SHIELD AI
            </span>
          </Link>

          <div className="mt-14 max-w-md">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] uppercase tracking-[0.2em] text-[#E6C29E] font-medium mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C49A6C]" />
              AgntID Intent-Aware Protection
            </span>
            <h1 className="font-serif text-[42px] sm:text-[50px] font-normal leading-[1.05] text-[#F5EDE3] tracking-tight">
              Welcome back.
            </h1>
            <p className="font-serif italic text-[22px] text-[#C4A482] mt-2">
              Your shop, smarter and safer.
            </p>
            <p className="text-[#CBBBB0] text-[13.5px] leading-relaxed mt-4 font-light">
              Autonomous operations for sales, stock depletion, customer khata and supplier restocking — with AgntID verifying every tool action before execution.
            </p>
          </div>
        </div>

        {/* Center Shop Image Card */}
        <div className="relative z-10 my-8 rounded-[20px] overflow-hidden border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.4)] aspect-[16/9] max-w-md">
          <img
            src="/images/hero_shop.jpg"
            alt="Warm sunlit Indian kirana billing counter"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1714] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-[11px]">
            <span className="font-mono text-[#E6C29E]">SAFE ACTIONS ONLY</span>
            <span className="font-script text-[20px] text-[#F3D7BD]">Access is not permission.</span>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-[11px] text-[#A6978C] flex items-center justify-between border-t border-white/10 pt-4">
          <span>Ramesh Sharma Kirana Store • Live Sandbox</span>
          <Link to="/" className="hover:text-white transition-colors">← Back to website</Link>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="font-serif text-[34px] font-normal text-[#1E1714] tracking-tight">
              Sign In to Your Shop
            </h2>
            <p className="text-[13px] text-[#5A4A40] mt-1">
              Enter your credentials to access the shop manager and security lab.
            </p>
          </div>

          {/* Convenient Demo Account Banner */}
          <div className="mb-6 p-4 rounded-[16px] bg-[#1E1714] text-white border border-[#8B5A2B]/40 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#E6C29E] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#F3D7BD]" />
                DEMO SHOP OWNER ACCESS
              </span>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-[11px] bg-white text-[#1E1714] font-medium px-3 py-1 rounded-full hover:bg-[#FAF5EE] transition-all shadow-sm active:scale-95"
              >
                Fill Demo Credentials
              </button>
            </div>
            <div className="text-[12px] font-mono text-[#D8C7B5] space-y-0.5">
              <div>Email: <span className="text-white font-medium">owner@dukaanshield.ai</span></div>
              <div>Password: <span className="text-white font-medium">Shop@123</span></div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-[12px] bg-rose-950/20 border border-rose-500/40 text-rose-800 text-[12.5px]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@dukaanshield.ai"
                  required
                  className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-4 py-2.5 text-[13.5px] text-[#1E1714] placeholder:text-[#5A4A40]/40 focus:outline-none focus:border-[#8B5A2B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-10 py-2.5 text-[13.5px] text-[#1E1714] placeholder:text-[#5A4A40]/40 focus:outline-none focus:border-[#8B5A2B] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 text-[#5A4A40] hover:text-[#1E1714] p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12.5px] pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none text-[#5A4A40]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1E1714]/20 text-[#8B5A2B] focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#8B5A2B] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1E1714] text-white text-[13.5px] font-medium py-3 rounded-full hover:bg-[#342721] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Shop'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center text-[13px] text-[#5A4A40]">
            Don't have a shop account yet?{' '}
            <Link to="/register" className="text-[#8B5A2B] font-semibold hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
