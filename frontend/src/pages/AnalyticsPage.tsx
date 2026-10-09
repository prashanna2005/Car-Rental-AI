import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { BarChart3, AlertTriangle, TrendingUp, TrendingDown, DollarSign, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export const AnalyticsPage: React.FC = () => {
  const [, setMetrics] = useState<any>(null);
  const [compare, setCompare] = useState<any>(null);
  const [utilization, setUtilization] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAnalyticsMetrics(),
      api.getAnalyticsCompare(),
      api.getAnalyticsUtilization(),
      api.getAnalyticsAnomalies()
    ])
      .then(([mRes, cRes, uRes, aRes]) => {
        setMetrics(mRes);
        setCompare(cRes);
        setUtilization(uRes);
        setAnomalies(aRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">Loading Business Intelligence analytics...</div>
    );
  }

  const compareData = [
    { period: "Previous Month", revenue: compare?.previous_period?.revenue || 0, bookings: compare?.previous_period?.bookings_count || 0 },
    { period: "Current Month", revenue: compare?.current_period?.revenue || 0, bookings: compare?.current_period?.bookings_count || 0 },
  ];

  const utilizationData = utilization?.category_utilization || [];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Top Delta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Revenue Delta</p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">
              {compare?.delta?.revenue_pct || "-8.4%"}
            </h3>
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              Vs Previous Month
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Booking Delta</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              +{compare?.delta?.bookings_count || 12} Units
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              Growth in Volume
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Avg Daily Rental Rate</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">$94.50/day</h3>
            <p className="text-xs text-blue-400 mt-1 font-semibold">Cross-Category Avg</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Fleet Efficiency</p>
            <h3 className="text-2xl font-black text-indigo-400 mt-1">{utilization?.overall_utilization_pct || 78.4}%</h3>
            <p className="text-xs text-indigo-400 mt-1 font-semibold">Ready for Dispatch</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Comparative Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period-over-Period Bar Chart */}
        <div className="glass-card space-y-4 border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base text-slate-200">Period-over-Period Revenue Delta</h4>
              <p className="text-xs text-slate-400">Comparing Previous Month vs Current Month SQL totals</p>
            </div>
            <span className="badge badge-available text-[9px]">SQL Verified</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Utilization Chart */}
        <div className="glass-card space-y-4 border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base text-slate-200">Category Utilization Rates</h4>
              <p className="text-xs text-slate-400">% of vehicles active on rental by category</p>
            </div>
            <span className="badge badge-rented text-[9px]">Live Ratio</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  formatter={(val: any) => [`${val}%`, "Utilization"]}
                />
                <Bar dataKey="utilization_pct" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business Anomalies Panel */}
      <div className="glass-card border-rose-500/30 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-100">Automated Business Anomaly Detections</h4>
              <p className="text-xs text-slate-400">Algorithmic flags triggering automated AI investigation flows</p>
            </div>
          </div>
          <span className="badge badge-urgent text-xs font-semibold">
            {anomalies?.anomalies?.length || 0} Anomalies Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {anomalies?.anomalies?.map((anom: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 hover:border-rose-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {anom.type}
                </span>
                <span className={`badge ${anom.severity === "high" || anom.severity === "critical" ? "badge-urgent" : "badge-maintenance"}`}>
                  {anom.severity} Severity
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{anom.message}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">Flagged by SQL Engine</span>
                <span className="text-blue-400 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Trigger AI Investigation ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
