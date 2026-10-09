import React, { useState } from "react";
import { api } from "../services/api";
import {
  Bot,
  Send,
  Sparkles,
  TrendingDown,
  Wrench,
  Car,
  ArrowRight,
  CheckCircle,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  Check,
  ShieldCheck
} from "lucide-react";

interface AgentHubPageProps {
  initialPrompt?: string;
}

export const AgentHubPage: React.FC<AgentHubPageProps> = ({ initialPrompt = "" }) => {
  const [prompt, setPrompt] = useState(initialPrompt || "Our rental revenue has dropped this month. Find the reason and help us recover bookings.");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [expandedToolIndex, setExpandedToolIndex] = useState<number | null>(null);
  const [approvedActionIds, setApprovedActionIds] = useState<Record<string, boolean>>({});

  const samplePrompts = [
    "Our rental revenue has dropped this month. Find the reason and help us recover bookings.",
    "Find an available SUV for three days.",
    "Which vehicles need maintenance?",
    "Investigate low fleet utilization and recommend improvements.",
    "Find an alternative vehicle for a booking affected by maintenance."
  ];

  const handleSubmit = (customPrompt?: string) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    api.processAgentHub(conversationId, query)
      .then((res) => {
        setResult(res);
        if (res.conversation_id) setConversationId(res.conversation_id);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to process agent request", err);
        setLoading(false);
      });
  };

  const handleApproveAction = (actionTitle: string) => {
    setApprovedActionIds((prev) => ({ ...prev, [actionTitle]: true }));
  };

  const selectedAgents = result?.route_decision?.selected_agents || [];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border-blue-500/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0 border border-white/10">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              FleetIQ AI Collaboration Hub
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">v1.0</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Trigger multi-agent orchestration, deterministic tool calling, and structured executive synthesis.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
          <span className="text-xs font-mono text-slate-200">Intelligent Router Ready</span>
        </div>
      </div>

      {/* Input Box & Quick Prompt Chips */}
      <div className="glass-card space-y-4 border-slate-800/80 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Business Request Console</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Select a prompt below or type your query</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Type your business inquiry or operational request..."
            className="flex-1 bg-slate-900/90 border border-slate-700 text-slate-100 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="btn-primary px-7 py-3.5 text-sm disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-500/30 font-bold"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Orchestrating AI Agents...</span>
              </>
            ) : (
              <>
                <span>Execute AI Investigation</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-semibold self-center mr-1">Sample Queries:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleSubmit(p);
              }}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-blue-900/30 text-slate-300 hover:text-blue-300 border border-slate-700/80 hover:border-blue-500/40 transition-all text-left font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Specialist Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sales Agent Card */}
        <div className={`glass-card transition-all ${selectedAgents.includes("sales") ? "border-blue-500 shadow-xl shadow-blue-500/20 bg-blue-950/30 ring-1 ring-blue-500/40" : "opacity-80"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">AI Sales Agent</h4>
                <p className="text-[11px] text-slate-400">Leads, Quotes, Bookings</p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase ${
              selectedAgents.includes("sales") ? "bg-blue-500/30 text-blue-300 border border-blue-400/50 shadow-sm" : "bg-slate-800 text-slate-400"
            }`}>
              {selectedAgents.includes("sales") ? "Active Node" : "Standby"}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5 font-mono">
            <div className="flex justify-between"><span>Tools:</span> <span className="text-slate-200">search_cars, calc_price</span></div>
            <div className="flex justify-between"><span>Scope:</span> <span className="text-slate-200">Customer qualify & book</span></div>
          </div>
        </div>

        {/* Data Analyst Agent Card */}
        <div className={`glass-card transition-all ${selectedAgents.includes("data_analyst") ? "border-indigo-500 shadow-xl shadow-indigo-500/20 bg-indigo-950/30 ring-1 ring-indigo-500/40" : "opacity-80"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">AI Data Analyst</h4>
                <p className="text-[11px] text-slate-400">Revenue, Trends, Anomalies</p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase ${
              selectedAgents.includes("data_analyst") ? "bg-indigo-500/30 text-indigo-300 border border-indigo-400/50 shadow-sm" : "bg-slate-800 text-slate-400"
            }`}>
              {selectedAgents.includes("data_analyst") ? "Active Node" : "Standby"}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5 font-mono">
            <div className="flex justify-between"><span>Tools:</span> <span className="text-slate-200">compare_periods, anomalies</span></div>
            <div className="flex justify-between"><span>Scope:</span> <span className="text-slate-200">SQL metric calculations</span></div>
          </div>
        </div>

        {/* Operations Agent Card */}
        <div className={`glass-card transition-all ${selectedAgents.includes("operations") ? "border-amber-500 shadow-xl shadow-amber-500/20 bg-amber-950/30 ring-1 ring-amber-500/40" : "opacity-80"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">AI Operations Agent</h4>
                <p className="text-[11px] text-slate-400">Maintenance & Task Dispatch</p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase ${
              selectedAgents.includes("operations") ? "bg-amber-500/30 text-amber-300 border border-amber-400/50 shadow-sm" : "bg-slate-800 text-slate-400"
            }`}>
              {selectedAgents.includes("operations") ? "Active Node" : "Standby"}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5 font-mono">
            <div className="flex justify-between"><span>Tools:</span> <span className="text-slate-200">fleet_status, create_task</span></div>
            <div className="flex justify-between"><span>Scope:</span> <span className="text-slate-200">Fleet readiness & tasks</span></div>
          </div>
        </div>
      </div>

      {/* Execution Results View */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Router Orchestration Plan */}
          <div className="glass-card space-y-5 border-blue-500/40 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-slate-100">Router Orchestration Plan</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                Run ID: {result.run_id}
              </span>
            </div>

            <p className="text-xs text-slate-200 bg-slate-900/90 p-4 rounded-xl border border-slate-800 leading-relaxed">
              <strong className="text-blue-400">Router Intent Analysis:</strong> {result.route_decision.reasoning}
            </p>

            {/* Visual Handoff Flow Nodes */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Multi-Agent Workflow Steps:</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.route_decision.investigation_plan?.map((step: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-3 hover:border-blue-500/30 transition-all">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30">
                      {idx + 1}
                    </span>
                    <span className="font-medium leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stepper Timeline & Tool Executions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline Stepper */}
            <div className="glass-card lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Live Stepper Execution Log
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  SQL Tool Queries Executed
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {result.tool_execution_history?.map((toolRec: any, idx: number) => {
                  const isExpanded = expandedToolIndex === idx;
                  return (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2.5 shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-blue-400 uppercase tracking-wider">{toolRec.agent}</span>
                            <span className="text-slate-600 text-xs">•</span>
                            <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                              {toolRec.tool}()
                            </span>
                          </div>
                          <button
                            onClick={() => setExpandedToolIndex(isExpanded ? null : idx)}
                            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-all"
                          >
                            <span>{isExpanded ? "Hide JSON" : "View Output"}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 font-medium">
                          Execution successful. Fetched deterministic records from database.
                        </p>

                        {/* Expanded Tool JSON Viewer */}
                        {isExpanded && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto shadow-inner">
                            <pre>{JSON.stringify(toolRec.result, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Handoff Log Display */}
              {result.handoff_history?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Agent Handoff Event Log
                  </div>
                  {result.handoff_history.map((h: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-300 uppercase">{h.from_agent}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-bold text-indigo-300 uppercase">{h.to_agent}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">{h.reason}</p>
                      </div>
                      <span className="badge badge-rented text-[9px]">Handoff Verified</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Context Side Panel */}
            <div className="glass-card space-y-4 h-fit">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                Shared State Memory
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 font-semibold mb-1">Conversation ID</div>
                  <div className="font-mono text-slate-200 text-[11px]">{result.conversation_id}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 font-semibold mb-1">Active Agents</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {result.route_decision.selected_agents.map((a: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-700/50 text-[10px] uppercase font-bold">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 font-semibold mb-1">Database Queries</div>
                  <div className="text-emerald-400 font-mono font-bold text-sm">
                    {result.tool_execution_history?.length || 0} Tools Executed
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Executive Report Panel */}
          <div className="glass-card border-emerald-500/40 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Executive Synthesis & Recommended Actions</h3>
                  <p className="text-xs text-slate-400">Synthesized report from Data Analyst, Operations, and Sales</p>
                </div>
              </div>
              <span className="badge badge-available text-xs font-semibold">
                Synthesized Report
              </span>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Executive Summary</div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{result.report.summary}</p>
            </div>

            {/* Key Findings List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Verified Findings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.report.key_findings?.map((f: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Finding #{idx + 1}
                      </span>
                      <span className="badge badge-available text-[9px]">{f.confidence} confidence</span>
                    </div>
                    <p className="text-xs text-slate-100 font-semibold">{f.finding}</p>
                    <p className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <strong>Evidence:</strong> {f.evidence}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations & Action Approvals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              {/* Strategic Recommendations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Strategic Recommendations</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.report.recommendations?.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0 shadow-sm shadow-blue-400"></span>
                      <span className="leading-snug">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Created & Pending Operational Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Operational Action Triggers</h4>
                <div className="space-y-2.5">
                  {result.report.actions_created?.map((act: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-emerald-300">{act.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Assigned by {act.agent}</div>
                      </div>
                      <span className="badge badge-available text-[9px]">Action Created</span>
                    </div>
                  ))}

                  {result.report.pending_approvals?.map((app: any, idx: number) => {
                    const isApproved = approvedActionIds[app.title];
                    return (
                      <div key={idx} className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/40 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-blue-300">{app.title}</div>
                          <div className="text-[10px] text-slate-300 mt-0.5">{app.details}</div>
                        </div>
                        <button
                          onClick={() => handleApproveAction(app.title)}
                          disabled={isApproved}
                          className={`btn-primary py-1.5 px-3.5 text-[11px] font-bold ${isApproved ? "bg-emerald-600 border-emerald-500" : ""}`}
                        >
                          {isApproved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Approved</span>
                            </>
                          ) : (
                            <span>Approve Action</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
