import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { History, ChevronDown, ChevronUp } from "lucide-react";

export const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.getActivityHistory()
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading activity history audit logs...</div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="glass-card flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Agent Execution Audit Log
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Chronological trace of router decisions, tool calls, and cross-agent handoffs</p>
        </div>
        <span className="badge badge-rented text-xs">{activities.length} Events Logged</span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Agent</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activities.map((act) => {
                const isExpanded = expandedId === act.id;
                return (
                  <React.Fragment key={act.id}>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-400 font-mono whitespace-nowrap">{act.timestamp}</td>
                      <td className="p-3.5 font-bold text-blue-400">{act.agent_name}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                          act.event_type === "tool_call" ? "bg-indigo-950 text-indigo-300 border-indigo-800" :
                          act.event_type === "handoff" ? "bg-purple-950 text-purple-300 border-purple-800" :
                          act.event_type === "routing" ? "bg-blue-950 text-blue-300 border-blue-800" :
                          "bg-emerald-950 text-emerald-300 border-emerald-800"
                        }`}>
                          {act.event_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-200 font-medium">{act.title}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : act.id)}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                        >
                          <span>{isExpanded ? "Hide JSON" : "Inspect JSON"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-4 bg-slate-950/80 border-b border-slate-800">
                          <pre className="font-mono text-[11px] text-emerald-400 overflow-x-auto">
                            {JSON.stringify(act.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
