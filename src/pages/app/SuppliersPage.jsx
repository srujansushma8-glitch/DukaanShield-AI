import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Lock, AlertTriangle, FileText } from 'lucide-react';
import { api } from '../../services/api';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.shop.getSuppliers();
        setSuppliers(data.suppliers || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
          PROCUREMENT & VENDOR MANAGEMENT
        </span>
        <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
          Supplier Orders & Payout Governance
        </h1>
        <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal max-w-2xl">
          Verified merchant suppliers and purchase order drafts. AgntID permanently locks autonomous modification of settlement bank accounts and IFSC codes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white rounded-[22px] p-6 border border-[#1E1714]/10 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10.5px] text-[#8B5A2B] font-bold">{s.id}</span>
                <h3 className="font-serif text-[20px] text-[#1E1714] font-medium leading-tight mt-0.5">{s.name}</h3>
                <p className="text-[12px] text-[#5A4A40] mt-0.5">Contact: {s.contactPerson} ({s.phone})</p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#FAF5EE] text-[#1E1714] border border-black/5 font-semibold">
                {s.category}
              </span>
            </div>

            <div className="p-3.5 rounded-[14px] bg-[#FAF5EE] border border-black/5 space-y-2 text-[12px]">
              <div className="flex items-center justify-between text-[#5A4A40]">
                <span>Payment Terms:</span>
                <span className="font-medium text-[#1E1714]">{s.paymentTerms}</span>
              </div>
              <div className="flex items-center justify-between text-[#5A4A40]">
                <span>Active Orders:</span>
                <span className="font-mono font-medium text-[#1E1714]">{s.activeOrders} pending</span>
              </div>
            </div>

            {/* AgntID Bank Lock Notice */}
            <div className="p-3.5 rounded-[14px] bg-emerald-950/5 border border-emerald-500/25 text-[11.5px] text-emerald-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock size={14} className="text-emerald-700 flex-shrink-0" />
                <span className="font-mono">Acct: {s.verifiedAccount} • IFSC: {s.verifiedIfsc}</span>
              </div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                LOCKED BY AGNTID
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
