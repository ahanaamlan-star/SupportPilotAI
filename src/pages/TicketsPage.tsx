import React, { useState, useEffect } from "react";
import { Ticket, AISummaryResult, Message } from "../types";
import { showToast } from "../components/ToastContainer";
import { 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Smile, 
  CheckSquare, 
  TrendingUp, 
  User, 
  Clock,
  UserCheck,
  Check
} from "lucide-react";

interface TicketsPageProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  updateTicketStatus: (id: string, status: "open" | "pending" | "resolved") => void;
  addMessageToTicket: (id: string, message: Message) => void;
}

export default function TicketsPage({ 
  tickets, 
  selectedTicket, 
  onSelectTicket, 
  updateTicketStatus,
  addMessageToTicket
}: TicketsPageProps) {
  
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<Record<string, AISummaryResult>>({});
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState("");
  const [completedActions, setCompletedActions] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    if (selectedTicket) {
      setActiveTicket(selectedTicket);
      setDiagnosticError(null);
    } else if (tickets.length > 0 && !activeTicket) {
      setActiveTicket(tickets[0]);
      setDiagnosticError(null);
    }
  }, [selectedTicket, tickets]);

  const runAIPilotDiagnostic = async () => {
    if (!activeTicket || runningDiagnostic) return;
    setRunningDiagnostic(true);
    setDiagnosticError(null);
    
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketDetails: activeTicket })
      });

      if (!response.ok) {
        throw new Error("Failed to compile diagnostic report. Server returned error code: " + response.status);
      }

      const result: AISummaryResult = await response.json();
      
      setDiagnosticReport(prev => ({
        ...prev,
        [activeTicket.id]: result
      }));

      // Initialize empty checklist tracking
      if (!completedActions[activeTicket.id]) {
        const initialChecklist: Record<string, boolean> = {};
        result.actionPlan.forEach((action) => {
          initialChecklist[action] = false;
        });
        setCompletedActions(prev => ({
          ...prev,
          [activeTicket.id]: initialChecklist
        }));
      }

      showToast(`AI Diagnostic Report generated for ticket ${activeTicket.id}!`, "success");

    } catch (error: any) {
      console.error("Diagnostic compiling error:", error);
      const errMsg = error.message || "AI Diagnostics failed to generate. Please verify your connection.";
      setDiagnosticError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setRunningDiagnostic(false);
    }
  };

  const handleSendAgentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !agentInput.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      text: agentInput,
      timestamp: new Date().toISOString()
    };

    addMessageToTicket(activeTicket.id, newMsg);
    
    // Update local state copy to render immediately
    if (activeTicket) {
      setActiveTicket(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMsg]
        };
      });
    }

    setAgentInput("");
  };

  const toggleActionItem = (actionStr: string) => {
    if (!activeTicket) return;
    setCompletedActions(prev => {
      const currentList = prev[activeTicket.id] || {};
      const nextVal = !currentList[actionStr];
      if (nextVal) {
        showToast("Case checklist item marked as complete!", "success");
      }
      return {
        ...prev,
        [activeTicket.id]: {
          ...currentList,
          [actionStr]: nextVal
        }
      };
    });
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-rose-500/10 text-rose-400 border border-white/10";
      case "high": return "bg-amber-500/10 text-amber-400 border border-white/10";
      case "medium": return "bg-purple-500/10 text-purple-400 border border-white/10";
      default: return "bg-white/5 text-white/50 border border-white/10";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open": return "bg-emerald-500/10 text-emerald-400 border border-white/10";
      case "pending": return "bg-amber-400/10 text-amber-300 border border-white/10";
      case "resolved": return "bg-white/5 text-white/40 border border-white/10";
      default: return "bg-black/40 text-white/40";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes("angry") || s.includes("frustrated") || s.includes("negative")) {
      return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
    } else if (s.includes("positive") || s.includes("happy")) {
      return <Smile className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    return <Clock className="w-4 h-4 text-amber-300 shrink-0" />;
  };

  const currentReport = activeTicket ? diagnosticReport[activeTicket.id] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 w-full animate-fade-in" id="ticket-summary-view">
      {/* Left Column: Tickets Queue list */}
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4 h-[680px]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" /> Active Incidents
          </h2>
          <p className="text-xs text-white/40">Select an incident to view deep AI analysis</p>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-thin">
          {tickets.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 flex flex-col items-center justify-center gap-2 animate-fade-in shadow-md">
              <FileText className="w-6 h-6 text-purple-400 opacity-60" />
              <p className="text-xs font-bold text-white/70">No incidents in queue</p>
              <p className="text-[10.5px] max-w-[180px] text-white/40 leading-relaxed">
                Add support tickets from the main dashboard to view queue items.
              </p>
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTicket(t);
                    onSelectTicket(t);
                    setDiagnosticError(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 relative overflow-hidden group
                    ${isSelected
                      ? "bg-white/10 border-white/20 text-white shadow"
                      : "bg-black/30 border-white/5 hover:border-white/10 text-white/50 hover:text-white"
                    }
                  `}
                  id={`ticket-item-${t.id}`}
                >
                {/* Visual border marker for active selection */}
                {isSelected && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500" />
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10 text-purple-400">
                    {t.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${getPriorityBadgeColor(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${getStatusBadgeColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold truncate text-white">{t.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span className="truncate">{t.customer}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Right Column: Ticket Detailed transcript and AI diagnostic workspace */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-[680px]">
        {activeTicket ? (
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 shadow-2xl flex-1 flex flex-col justify-between overflow-hidden relative backdrop-blur-md">
            
            {/* Header detail */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-white/10 px-2.5 py-1 rounded">
                    {activeTicket.id}
                  </span>
                  <h3 className="text-md font-bold text-white">{activeTicket.title}</h3>
                </div>

                {/* Status Toggle buttons */}
                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => {
                      const updatedStatus = e.target.value as any;
                      updateTicketStatus(activeTicket.id, updatedStatus);
                      setActiveTicket(prev => prev ? { ...prev, status: updatedStatus } : null);
                    }}
                    className="bg-black/40 border border-white/10 text-xs text-white rounded-xl px-3 py-1.5 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                  >
                    <option value="open" className="bg-[#070514] text-white">Open</option>
                    <option value="pending" className="bg-[#070514] text-white">Pending</option>
                    <option value="resolved" className="bg-[#070514] text-white">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Customer details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/60">Customer:</span>
                  <strong className="text-white">{activeTicket.customer}</strong>
                </div>
                <div className="flex items-center gap-1.5 md:col-span-2">
                  <FileText className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/60">Email:</span>
                  <strong className="text-white">{activeTicket.customerEmail}</strong>
                </div>
              </div>
            </div>

            {/* Split View: Chat transcript logs & Dynamic Diagnostic report */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 py-5 overflow-hidden">
              
              {/* Ticket Transcript Thread log */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 border-r border-white/10 scrollbar-thin">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Issue Narrative & Logs</h4>
                
                {/* Initial Description block */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs leading-relaxed text-white/80">
                  <div className="flex items-center justify-between mb-1.5 border-b border-white/5 pb-1 text-[10px]">
                    <span className="font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" /> Initial Complaint
                    </span>
                    <span className="text-white/40">{new Date(activeTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{activeTicket.description}</p>
                </div>

                {/* Conversation Thread Messages */}
                {activeTicket.messages && activeTicket.messages.length > 0 && (
                  <div className="flex flex-col gap-2.5 mt-2">
                    {activeTicket.messages.map((m) => (
                      <div 
                        key={m.id} 
                        className={`p-3 rounded-xl text-xs leading-relaxed border
                          ${m.sender === "customer" 
                            ? "bg-black/20 border-white/5 text-white/80" 
                            : "bg-purple-600/10 border-purple-500/20 text-purple-100"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-1 text-[9px] text-white/30 font-semibold">
                          <span className={m.sender === "customer" ? "text-white/50" : "text-purple-400"}>
                            {m.sender === "customer" ? activeTicket.customer : "Agent (Ahana)"}
                          </span>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{m.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Diagnostic Area */}
              <div className="flex flex-col gap-4 overflow-y-auto pl-1 scrollbar-thin relative">
                
                {!currentReport ? (
                  <div className="flex flex-col items-center justify-center text-center h-full border border-dashed border-white/10 rounded-xl p-5">
                    <Sparkles className="w-10 h-10 text-purple-400/80 animate-pulse mb-3" />
                    <h4 className="text-sm font-bold text-white">AI Diagnostic Pilot</h4>
                    <p className="text-xs text-white/50 mt-1 max-w-xs mb-4">
                      Deploy SupportPilot's LLM diagnostics to generate a structured case overview, priority audit, and checklists.
                    </p>
                    {diagnosticError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2 max-w-xs animate-fade-in mb-4 text-left">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">{diagnosticError}</p>
                      </div>
                    )}
                    <button
                      onClick={runAIPilotDiagnostic}
                      disabled={runningDiagnostic}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 border border-white/10 text-white font-medium hover:brightness-110 transition-all text-xs shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      {runningDiagnostic ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin text-white" />
                          <span>Compiling Diagnostics...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Run Pilot Diagnostics</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-xs animate-fade-in" id="diagnostic-report-body">
                    {diagnosticError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2 animate-fade-in text-left">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">{diagnosticError}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Pilot Diagnostic Report
                      </h4>
                      <button 
                        onClick={runAIPilotDiagnostic}
                        disabled={runningDiagnostic}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                      >
                        {runningDiagnostic ? "Re-running..." : "Refresh Report"}
                      </button>
                    </div>

                    {/* Summary */}
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                      <span className="text-[10px] font-bold uppercase text-purple-400">Case Summary</span>
                      <p className="text-white/80 leading-relaxed mt-1">{currentReport.summary}</p>
                    </div>

                    {/* Metadata Analysis Row */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-black/20 border border-white/10 p-2.5 rounded-lg flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase text-white/40 font-bold">Sentiment</span>
                        <div className="flex items-center gap-1 mt-0.5 font-semibold text-white text-[11px]">
                          {getSentimentIcon(currentReport.sentiment)}
                          <span className="capitalize">{currentReport.sentiment}</span>
                        </div>
                      </div>
                      <div className="bg-black/20 border border-white/10 p-2.5 rounded-lg flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase text-white/40 font-bold">Audit Priority</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-white text-[11px]">
                          <span className={`w-2 h-2 rounded-full ${currentReport.priority === 'urgent' || currentReport.priority === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-purple-400'}`} />
                          <span className="capitalize">{currentReport.priority}</span>
                        </div>
                      </div>
                      <div className="bg-black/20 border border-white/10 p-2.5 rounded-lg flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase text-white/40 font-bold">Category Match</span>
                        <span className="text-[11px] truncate font-semibold text-white mt-0.5">{currentReport.suggestedCategory}</span>
                      </div>
                    </div>

                    {/* Key Issues */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-white/40">Identified Key Issues</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {currentReport.keyIssues.map((issue, idx) => (
                          <span key={idx} className="bg-black/40 border border-white/10 px-2.5 py-1 rounded-md text-[10.5px] font-medium text-white">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Checklists */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-white/40">Resolution Roadmap checklist</span>
                      <div className="flex flex-col gap-1.5 mt-1">
                        {currentReport.actionPlan.map((action, idx) => {
                          const isDone = (completedActions[activeTicket.id] || {})[action] || false;
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleActionItem(action)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all
                                ${isDone 
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-white/50" 
                                  : "bg-black/20 border-white/5 text-white/80 hover:border-white/10"
                                }
                              `}
                            >
                              <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all shrink-0 mt-0.5
                                ${isDone
                                  ? "bg-emerald-500 border-white/10 text-white"
                                  : "border-white/20 bg-black/40 text-transparent"
                                }
                              `}>
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <span className={`text-[11.5px] leading-tight ${isDone ? 'line-through decoration-white/30' : ''}`}>{action}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Bottom Interaction block: Add Agent replies */}
            <form onSubmit={handleSendAgentMessage} className="border-t border-white/10 pt-4 flex gap-2">
              <input
                type="text"
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                placeholder={`Type a secure response log to ${activeTicket.customer}...`}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!agentInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 border border-white/10 hover:brightness-110 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 shadow-xl flex-1 flex flex-col items-center justify-center text-center text-white/40 backdrop-blur-md animate-fade-in py-24">
            <div className="p-4 bg-slate-900/60 rounded-full border border-white/5 mb-4 text-purple-400">
              <FileText className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-sm font-bold text-white/80 tracking-tight">No incident selected</h3>
            <p className="text-xs text-white/40 max-w-sm mt-1 leading-relaxed">
              Select an incident from the Active Incidents queue to load its customer dialogue history, view step-by-step resolution playbooks, and trigger AI Diagnostics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
