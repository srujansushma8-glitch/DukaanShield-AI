import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.shop.getInventory();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const lowStockCount = products.filter(p => p.stock <= p.threshold).length;

  const filteredProducts = products.filter(p => {
    if (filter === 'LOW') return p.stock <= p.threshold;
    if (filter === 'NORMAL') return p.stock > p.threshold;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
            STOCK MANAGEMENT
          </span>
          <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
            Inventory & Catalog
          </h1>
          <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal">
            Product catalog, stock levels, safety thresholds and restocking recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'LOW', 'NORMAL'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition ${
                filter === f
                  ? 'bg-[#1E1714] text-white'
                  : 'bg-white border border-black/10 text-[#5A4A40] hover:text-[#1E1714]'
              }`}
            >
              {f === 'LOW' ? `Low Stock (${lowStockCount})` : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[22px] border border-[#1E1714]/10 shadow-sm overflow-hidden">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-[#FAF5EE] text-[#5A4A40] font-mono text-[10.5px] uppercase">
            <tr>
              <th className="py-3.5 px-5">SKU / Item Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Selling Price</th>
              <th className="py-3.5 px-4">Cost Price</th>
              <th className="py-3.5 px-4">Stock In Hand</th>
              <th className="py-3.5 px-4">Threshold</th>
              <th className="py-3.5 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredProducts.map(p => {
              const isLow = p.stock <= p.threshold;
              return (
                <tr key={p.id} className="hover:bg-[#FAF5EE]/50">
                  <td className="py-3.5 px-5">
                    <div className="font-medium text-[#1E1714]">{p.name}</div>
                    <div className="text-[10.5px] font-mono text-[#8B5A2B]">{p.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#5A4A40]">{p.category}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#1E1714]">₹{p.price}</td>
                  <td className="py-3.5 px-4 font-mono text-[#5A4A40]">₹{p.cost}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1E1714]">{p.stock} units</td>
                  <td className="py-3.5 px-4 font-mono text-[#5A4A40]">{p.threshold} units</td>
                  <td className="py-3.5 px-5">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle size={11} /> LOW STOCK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={11} /> IN STOCK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
