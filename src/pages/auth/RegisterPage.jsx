import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, User, Store, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        ownerName: formData.ownerName,
        shopName: formData.shopName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5EDE3] flex flex-col lg:flex-row">
      {/* Left Branded Panel */}
      <div className="lg:w-1/2 bg-[#1E1714] text-[#F5EDE3] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#140F0D] via-transparent to-[#8B5A2B]/20 pointer-events-none" />

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
              Start Protected Autonomous Operations
            </span>
            <h1 className="font-serif text-[42px] sm:text-[48px] font-normal leading-[1.05] text-[#F5EDE3] tracking-tight">
              Onboard Your Shop.
            </h1>
            <p className="font-serif italic text-[22px] text-[#C4A482] mt-2">
              Security built directly into your shop workflow.
            </p>
            <p className="text-[#CBBBB0] text-[13.5px] leading-relaxed mt-4 font-light">
              Connect your billing register, stock sheets, and customer ledger. AgntID enforces strict least-privilege policies so your agent can never leak customer data or execute unauthorized bank transfers.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-[#A6978C] flex items-center justify-between border-t border-white/10 pt-4">
          <span>AgntID Enterprise Security Policy Engine</span>
          <Link to="/" className="hover:text-white transition-colors">← Back to website</Link>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="font-serif text-[32px] font-normal text-[#1E1714] tracking-tight">
              Register Shop Account
            </h2>
            <p className="text-[13px] text-[#5A4A40] mt-1">
              Create your shop credentials to initiate the AI shop manager.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[12px] bg-rose-950/20 border border-rose-500/40 text-rose-800 text-[12.5px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1">
                Owner's Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Ramesh Sharma"
                  required
                  className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-4 py-2 text-[13px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1">
                Shop Name
              </label>
              <div className="relative flex items-center">
                <Store className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Sharma Kirana & General Store"
                  required
                  className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-4 py-2 text-[13px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ramesh@sharma.in"
                    required
                    className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-3 py-2 text-[13px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-3 py-2 text-[13px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-3 py-2 text-[13px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-[#1E1714]/15 rounded-[12px] pl-10 pr-3 py-2 text-[13px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1E1714] text-white text-[13.5px] font-medium py-3 rounded-full hover:bg-[#342721] transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Shop Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-[12.5px] text-[#5A4A40]">
            Already registered?{' '}
            <Link to="/login" className="text-[#8B5A2B] font-semibold hover:underline">
              Sign in to shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
