import React from "react";
import { Search, Bell, Sparkles, User } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onOpenAiHub: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onOpenAiHub }) => {
  const getTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Executive Overview Dashboard";
      case "agent_hub":
        return "AI Business Agent Hub & Router";
      case "fleet":
        return "Fleet Vehicle Inventory";
      case "bookings":
        return "Rental Reservations";
      case "customers":
        return "Customers & Sales Leads";
      case "analytics":
        return "Business Intelligence Analytics";
      case "maintenance":
        return "Fleet Maintenance & Tasks";
      case "activity":
        return "Agent Audit History";
      case "settings":
        return "System Configuration";
      default:
        return "FleetIQ AI Workspace";
    }
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Title & Engine Status Pill */}
      <div className="flex items-center gap-4">
        <h2 className="font-extrabold text-lg text-slate-100 tracking-tight">{getTitle()}</h2>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 text-xs font-mono border border-slate-700/80 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SQLite Engine Online</span>
        </div>
      </div>

      {/* Right Controls Row */}
      <div className="flex items-center gap-4">
        {/* Search Input Box */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search vehicles, bookings, leads..."
            className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-100 text-xs rounded-xl pl-10 pr-14 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium placeholder:text-slate-500 shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Ask AI Launch Button */}
        <button
          onClick={onOpenAiHub}
          className="btn-primary py-2 px-4 text-xs shadow-md shadow-blue-500/20 border border-blue-400/30 font-bold tracking-wide flex items-center gap-2 rounded-xl"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Ask AI Agents</span>
        </button>

        {/* Notification Icon */}
        <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all relative border border-slate-800/80 flex items-center justify-center">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/60 flex items-center justify-center text-slate-200 shadow-sm">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-100">Operations Director</div>
            <div className="text-[10px] text-slate-400 font-mono">admin@fleetiq.ai</div>
          </div>
        </div>
      </div>
    </header>
  );
};
