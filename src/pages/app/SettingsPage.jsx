import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../../services/api';

export default function SettingsPage() {
  const [shop, setShop] = useState({
    name: 'Sharma Kirana & General Store',
    owner: 'Ramesh Sharma',
    phone: '+91 98765 43210',
    email: 'owner@dukaanshield.ai',
    address: 'Shop 14, Main Market, Indiranagar, Bengaluru, KA 560038'
  });

  const [settings, setSettings] = useState({
    inventoryAlertThreshold: 5,
    individualRefundCap: 2000,
    cumulativeRefundThreshold: 5000,
    requireApprovalForReminders: true,
    requireApprovalForSuppliers: true
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.shop.getSettings();
        if (data.shop) setShop(data.shop);
        if (data.settings) setSettings(data.settings);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.shop.updateSettings({ shop, settings });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
          CONFIGURATION & SECURITY PARAMETERS
        </span>
        <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
          Shop & Policy Settings
        </h1>
        <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal">
          Manage shop identity and configure deterministic AgntID authorization thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Shop Details Card */}
        <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#1E1714]/10 shadow-sm">
          <h2 className="font-serif text-[22px] text-[#1E1714] font-normal pb-4 border-b border-black/5 mb-5">
            Store Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12.5px]">
            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Shop Name
              </label>
              <input
                type="text"
                value={shop.name}
                onChange={(e) => setShop({ ...shop, name: e.target.value })}
                className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] px-3.5 py-2 text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Owner Full Name
              </label>
              <input
                type="text"
                value={shop.owner}
                onChange={(e) => setShop({ ...shop, owner: e.target.value })}
                className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] px-3.5 py-2 text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={shop.phone}
                onChange={(e) => setShop({ ...shop, phone: e.target.value })}
                className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] px-3.5 py-2 text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Store Email
              </label>
              <input
                type="email"
                value={shop.email}
                onChange={(e) => setShop({ ...shop, email: e.target.value })}
                className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] px-3.5 py-2 text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>
        </div>

        {/* AgntID Security Policies Configuration */}
        <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#1E1714]/10 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-5">
            <div>
              <h2 className="font-serif text-[22px] text-[#1E1714] font-normal">
                AgntID Authorization Thresholds
              </h2>
              <p className="text-[12px] text-[#5A4A40] mt-0.5">
                Modifications are immutably logged into the audit trail.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
              ACTIVE ENFORCEMENT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12.5px]">
            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Single Refund Autonomous Cap (INR)
              </label>
              <input
                type="number"
                value={settings.individualRefundCap}
                onChange={(e) => setSettings({ ...settings, individualRefundCap: Number(e.target.value) })}
                className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] px-3.5 py-2 font-mono text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
              />
              <span className="text-[10.5px] text-[#5A4A40] mt-1 block">Amounts exceeding this trigger owner CHALLENGE</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Cumulative Session Refund Limit (INR)
              </label>
              <input
                type="number"
                value={settings.cumulativeRefundThreshold}
                onChange={(e) => setSettings({ ...settings, cumulativeRefundThreshold: Number(e.target.value) })}
                className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] px-3.5 py-2 font-mono text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
              />
              <span className="text-[10.5px] text-[#5A4A40] mt-1 block">Prevents velocity abuse (e.g. Test 5)</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#1E1714] uppercase tracking-wider mb-1.5">
                Inventory Low Stock Threshold
              </label>
              <input
                type="number"
                value={settings.inventoryAlertThreshold}
                onChange={(e) => setSettings({ ...settings, inventoryAlertThreshold: Number(e.target.value) })}
                className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-[12px] px-3.5 py-2 font-mono text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
              />
              <span className="text-[10.5px] text-[#5A4A40] mt-1 block">Triggers low stock reorder flag</span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-emerald-800 text-[12.5px] font-medium">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Settings saved and logged in audit trail!</span>
            </div>
          ) : <div />}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#1E1714] text-white text-[13px] font-medium px-6 py-2.5 rounded-full hover:bg-[#342721] transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} className="text-[#E6C29E]" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
