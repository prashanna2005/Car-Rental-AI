import React from "react";
import {
  LayoutDashboard,
  Bot,
  Car,
  CalendarCheck,
  Users,
  BarChart3,
  Wrench,
  History,
  Settings,
  ShieldCheck,
  Zap,
  ChevronRight,
  Activity
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigationSections = [
    {
      title: "CORE WORKSPACE",
      items: [
        { id: "overview", label: "Executive Dashboard", icon: LayoutDashboard },
        { id: "agent_hub", label: "AI Agent Hub", icon: Bot, badge: "Multi-Agent" },
      ]
    },
    {
      title: "FLEET & OPERATIONS",
      items: [
        { id: "fleet", label: "Fleet Inventory", icon: Car },
        { id: "bookings", label: "Rental Reservations", icon: CalendarCheck },
        { id: "maintenance", label: "Maintenance & Tasks", icon: Wrench },
      ]
    },
    {
      title: "INTELLIGENCE & LEADS",
      items: [
        { id: "customers", label: "Customers & Leads", icon: Users },
        { id: "analytics", label: "Business Analytics", icon: BarChart3 },
        { id: "activity", label: "Audit Execution Log", icon: History },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { id: "settings", label: "System Configuration", icon: Settings },
      ]
    }
  ];

  return (
    <aside className="sidebar w-[270px] bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col shrink-0 z-40">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center gap-3.5 bg-slate-950/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/20 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base text-slate-100 tracking-tight leading-none">FleetIQ</h1>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              AI Hub
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-tight truncate">Autonomous Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="px-3.5 py-5 flex-1 space-y-6 overflow-y-auto">
        {navigationSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1.5">
            <div className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              {sec.title}
            </div>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                      isActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500 shadow-sm shadow-blue-400"></span>
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shrink-0">
                        <Zap className="w-2.5 h-2.5 text-indigo-400" />
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${isActive ? "text-blue-400 opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Active AI Agent Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            AI Agents Status
          </span>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
            3 Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mx-auto mb-1 shadow-sm shadow-blue-400"></div>
            <span className="font-semibold text-slate-300 block truncate">Sales</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mx-auto mb-1 shadow-sm shadow-indigo-400"></div>
            <span className="font-semibold text-slate-300 block truncate">Analyst</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto mb-1 shadow-sm shadow-amber-400"></div>
            <span className="font-semibold text-slate-300 block truncate">Ops</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
