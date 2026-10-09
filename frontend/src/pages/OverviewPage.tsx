import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Car,
  DollarSign,
  TrendingUp,
  Wrench,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, CartesianGrid } from "recharts";

interface OverviewPageProps {
  onNavigateToAgent: (prompt?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateToAgent }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full shadow-lg shadow-blue-500/20"></div>
          <span className="text-xs text-slate-400 font-mono animate-pulse">Loading Executive Dashboard...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const trendData = data?.trend_data || [];
  const categoryData = data?.category_breakdown || [];

  const CATEGORY_COLORS: Record<string, string> = {
    SUV: "#3b82f6",
    Sedan: "#10b981",
    Luxury: "#8b5cf6",
    Electric: "#06b6d4",
    Compact: "#f59e0b",
    Truck: "#ec4899",
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {/* Total Fleet */}
        <div className="glass-card flex items-center justify-between p-5 border-slate-800/80 hover:border-blue-500/40">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Fleet Inventory</p>
            <h3 className="text-2xl font-black text-slate-100">{metrics.total_fleet} Vehicles</h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {metrics.available_vehicles} Available for Rent
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner shrink-0 ml-3">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-card flex items-center justify-between p-5 border-slate-800/80 hover:border-emerald-500/40">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Revenue (30d)</p>
            <h3 className="text-2xl font-black text-slate-100">${metrics.total_revenue?.toLocaleString()}</h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.2% Period Delta
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner shrink-0 ml-3">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Utilization */}
        <div className="glass-card flex items-center justify-between p-5 border-slate-800/80 hover:border-indigo-500/40">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Fleet Utilization Rate</p>
            <h3 className="text-2xl font-black text-slate-100">{metrics.utilization_pct}%</h3>
            <p className="text-xs text-indigo-400 font-semibold pt-1">
              {metrics.rented_vehicles} vehicles active on rental
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0 ml-3">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="glass-card flex items-center justify-between p-5 border-slate-800/80 hover:border-amber-500/40">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Maintenance Downtime</p>
            <h3 className="text-2xl font-black text-amber-400">{metrics.maintenance_vehicles} Units</h3>
            <p className="text-xs text-slate-400 font-semibold pt-1">
              {metrics.pending_tasks} pending operational tasks
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0 ml-3">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Hero Banner */}
      <div className="glass-card bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-blue-500/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-100">Multi-Agent AI Business Automation Active</h3>
              <span className="badge badge-available text-[9px] px-2 py-0.5">Live Router</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sales, Data Analyst, and Operations agents collaborate automatically to investigate performance drops and execute actions.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToAgent("Our rental revenue has dropped this month. Find the reason and help us recover bookings.")}
          className="btn-primary whitespace-nowrap shadow-lg shadow-blue-500/25 py-2.5 px-5 font-bold shrink-0 self-stretch md:self-auto justify-center"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Run Revenue Investigation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Revenue Trend Area Chart */}
        <div className="glass-card lg:col-span-2 space-y-4 border-slate-800/80 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base text-slate-100">Revenue & Rental Trends</h4>
              <p className="text-xs text-slate-400 mt-0.5">Financial tracking derived directly from SQLite database</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700/80">
              Monthly View
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="glass-card space-y-4 border-slate-800/80 flex flex-col justify-between p-6">
          <div>
            <h4 className="font-bold text-base text-slate-100">Fleet Inventory Breakdown</h4>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across vehicle categories</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={35} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[entry.category] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Bookings & Maintenance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Recent Bookings */}
        <div className="glass-card space-y-4 border-slate-800/80 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Recent Booking Reservations
              </h4>
              <span className="text-xs font-mono text-slate-400">Latest 5 Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Vehicle</th>
                    <th className="py-3 px-3">Start Date</th>
                    <th className="py-3 px-3 text-right">Total</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.recent_bookings?.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-blue-400 font-bold">{b.reference}</td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{b.vehicle_name}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono">{b.start_date}</td>
                      <td className="py-3 px-3 text-right font-black text-slate-100">${b.total_price}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`badge ${b.status === "confirmed" || b.status === "active" ? "badge-available" : b.status === "cancelled" ? "badge-urgent" : "badge-rented"}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="glass-card space-y-4 border-slate-800/80 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Maintenance Alerts
              </h4>
              <span className="badge badge-urgent text-[9px]">Attention Needed</span>
            </div>

            <div className="space-y-3">
              {data?.maintenance_alerts?.map((m: any) => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between hover:border-amber-500/40 transition-all">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-100">{m.vehicle}</div>
                    <div className="text-[11px] font-semibold text-amber-400">{m.service_type}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Technician: {m.technician}</div>
                  </div>
                  <div className="text-right space-y-1.5 shrink-0 ml-4">
                    <div className="text-sm font-black text-slate-100">${m.cost}</div>
                    <span className="badge badge-maintenance text-[9px]">In Repair</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
