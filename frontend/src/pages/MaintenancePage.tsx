import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Wrench, Clock, DollarSign, ShieldCheck } from "lucide-react";

export const MaintenancePage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.getMaintenanceRecords(), api.getTasks()])
      .then(([rData, tData]) => {
        setRecords(rData);
        setTasks(tData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
  const pendingTasksCount = tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Maintenance Records</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">{records.length} Logs</h3>
            <p className="text-xs text-amber-400 mt-1 font-semibold">Active Service History</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Service Expenditure</p>
            <h3 className="text-2xl font-black text-slate-100 mt-1">${totalCost.toLocaleString()}</h3>
            <p className="text-xs text-indigo-400 mt-1 font-semibold">Parts & Mechanic Labor</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Pending Ops Tasks</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{pendingTasksCount} Pending</h3>
            <p className="text-xs text-amber-400 mt-1 font-semibold">Action Required</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between border-slate-800/80">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Fleet Readiness Score</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">96.4%</h3>
            <p className="text-xs text-emerald-400 mt-1 font-semibold">Ready for Customer Booking</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Operational Tasks Section */}
      <div className="glass-card border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Operational Task Checklist</h3>
              <p className="text-xs text-slate-400">Tasks automatically created by AI Operations Agent</p>
            </div>
          </div>
          <span className="badge badge-rented text-xs font-semibold">Auto-Dispatched</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-100">{t.title}</span>
                  <span className={`badge ${t.priority === "urgent" ? "badge-urgent" : t.priority === "high" ? "badge-maintenance" : "badge-rented"}`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-snug">{t.description}</p>
                {t.vehicle_name && (
                  <div className="text-[11px] font-mono text-blue-400 mt-2">Vehicle: {t.vehicle_name}</div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Assigned: {t.assigned_to || "Operations Lead"}</span>
                <span className={`badge ${t.status === "completed" ? "badge-available" : "badge-maintenance"}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Service Records Table */}
      <div className="glass-card overflow-hidden border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">Mechanic Maintenance & Repair Logs</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">SQLite Logged</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading service logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Service Type</th>
                  <th className="p-3.5">Technician</th>
                  <th className="p-3.5">Start Date</th>
                  <th className="p-3.5 text-right">Cost</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-100">{r.vehicle_name}</td>
                    <td className="p-3.5 font-semibold text-amber-400">{r.service_type}</td>
                    <td className="p-3.5 text-slate-300">{r.technician}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{r.start_date}</td>
                    <td className="p-3.5 text-right font-black text-slate-100">${r.cost}</td>
                    <td className="p-3.5 text-right">
                      <span className={`badge ${r.status === "completed" ? "badge-available" : "badge-maintenance"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
