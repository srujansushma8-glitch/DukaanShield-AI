import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5EDE3] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_12px_40px_rgba(30,23,20,0.08)] border border-[#1E1714]/10">
        
        <Link to="/login" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A4A40] hover:text-[#1E1714] font-medium mb-6 transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>

        <h1 className="font-serif text-[32px] text-[#1E1714] font-normal leading-tight">
          Reset Password
        </h1>
        <p className="text-[13px] text-[#5A4A40] mt-1.5">
          Enter your registered shop email to receive verification instructions.
        </p>

        {submitted ? (
          <div className="mt-6 p-5 rounded-[16px] bg-emerald-950/10 border border-emerald-500/30 text-[#1E1714] space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[13px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset Link Dispatched</span>
            </div>
            <p className="text-[12px] text-[#5A4A40]">
              If an account exists for <span className="font-medium text-[#1E1714]">{email}</span>, password reset credentials have been delivered.
            </p>
            <div className="pt-3">
              <Link to="/login" className="text-[12px] text-[#8B5A2B] font-semibold hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Registered Shop Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@dukaanshield.ai"
                  required
                  className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] pl-10 pr-4 py-2.5 text-[13px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E1714] text-white text-[13px] font-medium py-3 rounded-full hover:bg-[#342721] transition-all shadow-sm"
            >
              Send Password Instructions
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
