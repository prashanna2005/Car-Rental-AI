import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Users, Sparkles, Mail, Phone, ArrowRight } from "lucide-react";

export const CustomersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"customers" | "leads">("leads");
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getCustomers(), api.getLeads()])
      .then(([cData, lData]) => {
        setCustomers(cData);
        setLeads(lData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Top Banner & Tab Toggle */}
      <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Customer & Sales Pipeline Management</h3>
            <p className="text-xs text-slate-400">Track customer profiles and AI-qualified high-intent leads</p>
          </div>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "leads" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Sales Leads ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "customers" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Directory ({customers.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading pipeline records...</div>
      ) : activeTab === "leads" ? (
        /* AI-Qualified Leads View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leads.map((lead) => (
              <div key={lead.id} className="glass-card space-y-4 border-purple-500/30 hover:border-purple-500/50 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-vip text-[9px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      AI Score: {lead.score}/100
                    </span>
                    <span className={`badge ${lead.status === "qualified" ? "badge-available" : "badge-rented"}`}>
                      {lead.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-100">{lead.name}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Desired Vehicle:</span>
                      <span className="font-semibold text-slate-200">{lead.preferred_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Duration:</span>
                      <span className="font-semibold text-slate-200">{lead.requested_duration_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Deal Value:</span>
                      <span className="font-bold text-emerald-400">${lead.estimated_budget}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Source: AI Inbound Qualification</span>
                  <button className="btn-primary py-1.5 px-3.5 text-xs font-bold shadow-md shadow-blue-500/20">
                    <span>Convert to Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Customers Directory Table View */
        <div className="glass-card overflow-hidden border-slate-800/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">License Ref</th>
                  <th className="p-3.5">Total Bookings</th>
                  <th className="p-3.5 text-right">Lifetime Spend</th>
                  <th className="p-3.5 text-right">Tier Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-100">{c.full_name}</td>
                    <td className="p-3.5">
                      <div className="text-slate-200">{c.email}</div>
                      <div className="text-[10px] text-slate-400">{c.phone}</div>
                    </td>
                    <td className="p-3.5 font-mono text-blue-400">{c.driver_license}</td>
                    <td className="p-3.5 font-semibold text-slate-200">{c.total_bookings || 0} Bookings</td>
                    <td className="p-3.5 text-right font-black text-slate-100">${c.total_spent?.toLocaleString() || 0}</td>
                    <td className="p-3.5 text-right">
                      <span className={`badge ${c.total_spent > 1000 ? "badge-vip" : "badge-available"}`}>
                        {c.total_spent > 1000 ? "VIP Gold" : "Verified Customer"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
