import React from "react";
import { Settings, Cpu, Database, ShieldCheck } from "lucide-react";

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="glass-card space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Settings className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="font-bold text-lg text-slate-100">FleetIQ System Settings</h3>
            <p className="text-xs text-slate-400">Configure AI models, database parameters, and agent execution modes</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                AI Model & Provider Configuration
              </span>
              <span className="badge badge-available">Demo Mode / LLM Hybrid</span>
            </div>
            <p className="text-slate-400">
              The application runs in <strong>Full Deterministic Demo Mode</strong> out of the box using SQL database calculations. When <code>OPENAI_API_KEY</code> is provided in <code>.env</code>, it seamlessly upgrades to live OpenAI tool calling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                SQLite Database Connection
              </span>
              <span className="font-mono text-emerald-400">sqlite:///./fleetiq.db</span>
            </div>
            <p className="text-slate-400">
              Local persistent storage initialized with 25+ vehicles, customers, historical trend bookings, maintenance records, and agent audit events.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Specialized Agents
              </span>
              <span className="text-slate-300 font-semibold">3 Active Agents + Intelligent Router</span>
            </div>
            <p className="text-slate-400">
              Sales Agent, Data Analyst Agent, and Operations Agent configured with deterministic backend tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
