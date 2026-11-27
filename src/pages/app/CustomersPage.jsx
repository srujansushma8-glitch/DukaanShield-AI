import React, { useState, useEffect } from 'react';
import { Users, Phone, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.shop.getCustomers();
        setCustomers(data.customers || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const totalDues = customers.reduce((a, b) => a + (b.pendingDue || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
            CUSTOMER LEDGER (KHATA)
          </span>
          <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
            Customers & Debt Reminders
          </h1>
          <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal">
            Credit ledger accounts with AgntID least-privilege boundary (Dues only; zero full purchase history exposure).
          </p>
        </div>

        <div className="bg-white px-5 py-2.5 rounded-full border border-black/10 text-[12.5px] font-mono shadow-xs">
          Total Outstanding: <span className="text-[#8B5A2B] font-bold">₹{totalDues.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="bg-white rounded-[22px] border border-[#1E1714]/10 shadow-sm overflow-hidden">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-[#FAF5EE] text-[#5A4A40] font-mono text-[10.5px] uppercase">
            <tr>
              <th className="py-3.5 px-5">Customer Name</th>
              <th className="py-3.5 px-4">Contact (Masked)</th>
              <th className="py-3.5 px-4">Pending Due</th>
              <th className="py-3.5 px-4">Due Aging</th>
              <th className="py-3.5 px-4">Credit Limit</th>
              <th className="py-3.5 px-5">AgntID Boundary Policy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-[#FAF5EE]/50">
                <td className="py-3.5 px-5">
                  <div className="font-medium text-[#1E1714]">{c.name}</div>
                  <div className="text-[10.5px] text-[#5A4A40]">{c.notes}</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#5A4A40]">
                  {c.phone.replace(/(\+91\s\d{2})\d{3}(\s\d{2})\d{3}/, "$1***$2***")}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-[#8B5A2B]">
                  ₹{c.pendingDue?.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-mono ${
                    c.dueDays > 20 ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.dueDays} days
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#5A4A40]">₹{c.creditLimit}</td>
                <td className="py-3.5 px-5 text-[11px] text-emerald-800 font-medium">
                  ✓ Reminders Allowed • History Blocked
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
