import React, { useState, useEffect } from "react";
import { Ticket, AdvancedSummaryResult } from "../types";
import { showToast } from "../components/ToastContainer";
import { 
  FileText, 
  Sparkles, 
  User, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Copy, 
  Check, 
  Download, 
  Search, 
  ChevronRight, 
  Layers, 
  HelpCircle, 
  CornerDownRight,
  RefreshCw,
  Eye,
  Wrench,
  CheckCircle2
} from "lucide-react";

interface TicketSummaryPageProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  updateTicketStatus?: (id: string, status: "open" | "pending" | "resolved") => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
}

export default function TicketSummaryPage({ 
  tickets, 
  selectedTicket, 
  onSelectTicket,
  updateTicketStatus,
  recentSearches,
  addRecentSearch,
  removeRecentSearch
}: TicketSummaryPageProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [summaries, setSummaries] = useState<Record<string, AdvancedSummaryResult>>(() => {
    const saved = localStorage.getItem("supportpilot_ticket_summaries");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse ticket summaries from local storage:", e);
      }
    }
    return {};
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("supportpilot_ticket_summaries", JSON.stringify(summaries));
  }, [summaries]);

  useEffect(() => {
    if (selectedTicket) {
      setActiveTicket(selectedTicket);
    } else if (tickets.length > 0 && !activeTicket) {
      setActiveTicket(tickets[0]);
    }
  }, [selectedTicket, tickets]);

  const generateAdvancedSummary = async () => {
    if (!activeTicket) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ticket/advanced-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketDetails: activeTicket })
      });

      if (!response.ok) {
        throw new Error("Failed to generate advanced ticket summary. Check API configuration.");
      }

      const result: AdvancedSummaryResult = await response.json();
      setSummaries(prev => ({
        ...prev,
        [activeTicket.id]: result
      }));
      showToast(`AI Audit Summary compiled successfully for ticket ${activeTicket.id}!`, "success");
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "An error occurred while compiling support audits.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const getMarkdownReport = (ticket: Ticket, summary: AdvancedSummaryResult): string => {
    return `# SupportPilot Incident Audit Report (ID: ${ticket.id})
Generated dynamically by SupportPilot AI on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

---

## 📋 EXECUTIVE CASE BRIEF
* **Ticket Title**: ${ticket.title}
* **Customer Name**: ${ticket.customer}
* **Customer Email**: ${ticket.customerEmail}
* **Assigned Class**: ${ticket.category}
* **Incident Urgency Audit**: ${summary.priorityLevel}
* **Target Resolution Window**: ${summary.estimatedResolutionTime}

---

## 🔍 ISSUE SUMMARY
${summary.issueSummary}

---

## 👤 CUSTOMER CONCERN & BUSINESS IMPACT
${summary.customerConcern}

---

## 🔧 DETECTED ROOT CAUSE
${summary.rootCause}

---

## 📝 SUGGESTED RESOLUTION WORKFLOW
${summary.suggestedResolution}

---

## 🛡️ ESCALATION RECOMMENDATION & NEXT STEPS
${summary.humanEscalationRecommendation}

---
*Report security status: Confirmed & Audited by SupportPilot AI*
`;
  };

  const handleCopyMarkdown = () => {
    if (!activeTicket) return;
    const summary = summaries[activeTicket.id];
    if (!summary) return;

    const md = getMarkdownReport(activeTicket, summary);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      showToast("Audit Report copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showToast("Failed to copy report to clipboard.", "error");
    });
  };

  const handleDownloadMarkdown = () => {
    if (!activeTicket) return;
    const summary = summaries[activeTicket.id];
    if (!summary) return;

    try {
      const md = getMarkdownReport(activeTicket, summary);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket-${activeTicket.id}-ai-audit-summary.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Audit Report markdown file downloaded!", "success");
    } catch (err) {
      showToast("Failed to download Audit Report.", "error");
    }
  };

  const handleDownloadPdf = () => {
    if (!activeTicket) return;
    const summary = summaries[activeTicket.id];
    if (!summary) return;

    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(`Incident Audit Report: ${activeTicket.id}`, 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 32, 196, 32);

      // BRIEF
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Executive Brief", 14, 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Title: ${activeTicket.title}`, 14, 46);
      doc.text(`Customer: ${activeTicket.customer} (${activeTicket.customerEmail})`, 14, 52);
      doc.text(`Priority Audit: ${summary.priorityLevel}`, 14, 58);
      doc.text(`Est. Resolution: ${summary.estimatedResolutionTime}`, 14, 64);

      doc.line(14, 70, 196, 70);

      // ISSUE SUMMARY
      doc.setFont("helvetica", "bold");
      doc.text("Issue Summary", 14, 78);
      doc.setFont("helvetica", "normal");
      const splitSummary = doc.splitTextToSize(summary.issueSummary, 182);
      doc.text(splitSummary, 14, 84);

      let y = 84 + (splitSummary.length * 5) + 6;
      doc.line(14, y - 2, 196, y - 2);

      // ROOT CAUSE
      doc.setFont("helvetica", "bold");
      doc.text("System Root Cause Tracing", 14, y);
      doc.setFont("helvetica", "normal");
      const splitRoot = doc.splitTextToSize(summary.rootCause, 182);
      doc.text(splitRoot, 14, y + 6);

      y = y + 6 + (splitRoot.length * 5) + 6;
      if (y > 250) { doc.addPage(); y = 20; }
      doc.line(14, y - 2, 196, y - 2);

      // SUGGESTED RESOLUTION
      doc.setFont("helvetica", "bold");
      doc.text("Suggested Resolution Path", 14, y);
      doc.setFont("helvetica", "normal");
      const splitResolution = doc.splitTextToSize(summary.suggestedResolution, 182);
      doc.text(splitResolution, 14, y + 6);

      y = y + 6 + (splitResolution.length * 5) + 6;
      if (y > 250) { doc.addPage(); y = 20; }
      doc.line(14, y - 2, 196, y - 2);

      // ESCALATION
      doc.setFont("helvetica", "bold");
      doc.text("Escalation Recommendation", 14, y);
      doc.setFont("helvetica", "normal");
      const splitEscalation = doc.splitTextToSize(summary.humanEscalationRecommendation, 182);
      doc.text(splitEscalation, 14, y + 6);

      doc.save(`Ticket-${activeTicket.id}-Audit-Summary.pdf`);
    }).catch(err => {
      console.error("PDF export error:", err);
    });
  };

  const handleDownloadCsv = () => {
    if (!activeTicket) return;
    const summary = summaries[activeTicket.id];
    if (!summary) return;

    let csvContent = "Field,Value\n";
    csvContent += `"Ticket ID","${activeTicket.id}"\n`;
    csvContent += `"Title","${activeTicket.title.replace(/"/g, '""')}"\n`;
    csvContent += `"Customer","${activeTicket.customer.replace(/"/g, '""')}"\n`;
    csvContent += `"Email","${activeTicket.customerEmail.replace(/"/g, '""')}"\n`;
    csvContent += `"Priority","${summary.priorityLevel.replace(/"/g, '""')}"\n`;
    csvContent += `"Estimated Resolution","${summary.estimatedResolutionTime.replace(/"/g, '""')}"\n`;
    csvContent += `"Issue Summary","${summary.issueSummary.replace(/"/g, '""')}"\n`;
    csvContent += `"Customer Concern","${summary.customerConcern.replace(/"/g, '""')}"\n`;
    csvContent += `"Root Cause","${summary.rootCause.replace(/"/g, '""')}"\n`;
    csvContent += `"Suggested Resolution","${summary.suggestedResolution.replace(/"/g, '""')}"\n`;
    csvContent += `"Escalation Recommendation","${summary.humanEscalationRecommendation.replace(/"/g, '""')}"\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ticket-${activeTicket.id}-ai-audit-summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const activeSummary = activeTicket ? summaries[activeTicket.id] : null;

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-fade-in" id="ticket-summary-page">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-[24px] backdrop-blur-md">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Ticket Audit Summaries
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Conduct AI-driven audits, analyze customer pain points, trace root causes, and prepare resolution sheets instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 px-4 py-2 rounded-xl">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Automatic Support Audit System Active</span>
        </div>
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Case Selector & Filters */}
        <div className="xl:col-span-1 bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Active Queue ({filteredTickets.length})
            </h3>
          </div>

          {/* Search bar */}
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search queue... (Enter to save)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    addRecentSearch(searchQuery);
                  }
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
            </div>
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px]">
                <span className="text-white/40 font-bold uppercase mr-1">Recent:</span>
                {recentSearches.map((term) => (
                  <span
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 hover:border-white/10 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                  >
                    <span>{term}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className="hover:text-rose-400 text-white/30 font-bold transition-colors ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Filters Stack */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex flex-col gap-1">
              <span className="text-white/40 font-bold uppercase">Priority</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg p-1.5 text-white focus:outline-none"
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/40 font-bold uppercase">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg p-1.5 text-white focus:outline-none"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Incidents List Container */}
          <div className="flex flex-col gap-2 max-h-[400px] xl:max-h-[500px] overflow-y-auto scrollbar-thin pr-1 mt-1">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white/5 border border-white/10 rounded-[20px] text-white/40 flex flex-col items-center justify-center gap-2 animate-fade-in shadow-md">
                <FileText className="w-6 h-6 text-purple-400 opacity-60" />
                <p className="text-xs font-bold text-white/70">No matching incidents</p>
                <p className="text-[10.5px] max-w-[180px] text-white/40 leading-relaxed">
                  Adjust your search or filter tags to select an incident.
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                const hasSummary = !!summaries[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTicket(t);
                      onSelectTicket(t);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 relative overflow-hidden group
                      ${isSelected
                        ? "bg-white/10 border-white/20 text-white shadow"
                        : "bg-black/20 border-white/5 hover:border-white/10 text-white/50 hover:text-white"
                      }
                    `}
                    id={`summary-select-${t.id}`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500" />
                    )}

                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">
                        {t.id}
                      </span>
                      <div className="flex items-center gap-1">
                        {hasSummary && (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-500/20">
                            <Check className="w-2.5 h-2.5" /> AUDITED
                          </span>
                        )}
                        <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold
                          ${t.priority === "urgent" ? "bg-rose-500/15 text-rose-400 border border-rose-500/10" : ""}
                          ${t.priority === "high" ? "bg-amber-500/15 text-amber-400 border border-amber-500/10" : ""}
                          ${t.priority === "medium" ? "bg-purple-500/15 text-purple-400 border border-purple-500/10" : ""}
                          ${t.priority === "low" ? "bg-white/5 text-white/40" : ""}
                        `}>
                          {t.priority}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold truncate text-white leading-tight group-hover:text-white transition-colors">
                      {t.title}
                    </h4>

                    <div className="flex items-center justify-between text-[9px] text-white/40 font-mono mt-1 pt-1.5 border-t border-white/5">
                      <span className="truncate">{t.customer}</span>
                      <span>{t.status.toUpperCase()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Columns: Ticket Summary Workspace */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {activeTicket ? (
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col gap-6">
              
              {/* Header Info Area */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded">
                      {activeTicket.id}
                    </span>
                    <span className="text-xs text-white/40 font-mono">/</span>
                    <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">{activeTicket.category}</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white leading-snug">{activeTicket.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/50 mt-1">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-white/30" /> {activeTicket.customer} ({activeTicket.customerEmail})</span>
                    <span className="text-white/20">•</span>
                    <span>Received: {new Date(activeTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Compile Button or Audit Indicators */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={generateAdvancedSummary}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-medium hover:brightness-110 transition-all text-xs shadow-lg shadow-purple-500/10 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Compiling Audit...</span>
                      </>
                    ) : activeSummary ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Re-Generate Summary</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
                        <span>Generate AI Audit Summary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-rose-500/15 border border-rose-500/20 text-rose-300 text-xs p-4 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Summary Compilation Error:</span> {error}
                  </div>
                </div>
              )}

              {/* Splitted Workspace Grid: Narrative Context vs AI Generated Audit Sheet */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Left side (2 cols): Original Ticket Narrative Context & Logs */}
                <div className="lg:col-span-2 flex flex-col gap-4 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Dialogue History Context
                    </h3>
                    <span className="text-[10px] text-white/30 font-mono">Original Intake</span>
                  </div>

                  {/* Complaint Block */}
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-purple-400 tracking-wider">Initial Customer Message</span>
                    <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{activeTicket.description}</p>
                  </div>

                  {/* Transcript messages */}
                  {activeTicket.messages && activeTicket.messages.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {activeTicket.messages.map((m) => (
                        <div 
                          key={m.id} 
                          className={`p-3 rounded-xl border text-xs leading-relaxed flex flex-col gap-1
                            ${m.sender === "customer" 
                              ? "bg-black/10 border-white/5 text-white/70" 
                              : "bg-purple-500/5 border-purple-500/10 text-purple-200"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between text-[9px] text-white/30">
                            <span className="font-semibold capitalize">{m.sender === "customer" ? activeTicket.customer : "Agent Support"}</span>
                            <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-white/20 italic bg-black/10 border border-dashed border-white/5 rounded-xl">
                      No additional chat messages in this ticket thread.
                    </div>
                  )}
                </div>

                {/* Right side (3 cols): Generated AI Advanced Summary Sheet */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  
                  {loading ? (
                    <div className="flex flex-col gap-5 h-full min-h-[350px]">
                      {/* Top Action Bar Skeleton */}
                      <div className="flex items-center justify-between bg-black/20 border border-white/5 p-3 rounded-xl animate-pulse">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-24 bg-white/10 rounded-lg" />
                          <div className="h-7 w-24 bg-white/10 rounded-lg" />
                        </div>
                      </div>

                      {/* Bento Cards Audit Grid Skeleton */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="bg-white/5 border border-white/5 p-5 rounded-[20px] flex flex-col gap-3 animate-pulse">
                          <div className="h-4 w-1/2 bg-white/10 rounded" />
                          <div className="h-3 w-full bg-white/10 rounded" />
                          <div className="h-3 w-5/6 bg-white/10 rounded" />
                          <div className="h-3 w-4/6 bg-white/10 rounded" />
                        </div>
                        <div className="bg-white/5 border border-white/5 p-5 rounded-[20px] flex flex-col gap-3 animate-pulse">
                          <div className="h-4 w-1/3 bg-white/10 rounded" />
                          <div className="h-3 w-full bg-white/10 rounded" />
                          <div className="h-3 w-5/6 bg-white/10 rounded" />
                        </div>
                        <div className="md:col-span-2 bg-white/5 border border-white/5 p-5 rounded-[20px] flex flex-col gap-3 animate-pulse">
                          <div className="h-4 w-1/4 bg-white/10 rounded" />
                          <div className="h-3 w-full bg-white/10 rounded" />
                          <div className="h-3 w-full bg-white/10 rounded" />
                        </div>
                      </div>
                    </div>
                  ) : !activeSummary ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-white/10 bg-black/20 rounded-2xl h-full min-h-[350px]">
                      <Sparkles className="w-12 h-12 text-purple-400/80 mb-3 animate-pulse" />
                      <h3 className="text-sm font-bold text-white">Audit Checklist Offline</h3>
                      <p className="text-xs text-white/50 mt-1 max-w-sm mb-5">
                        Initiate a comprehensive Support Audit on this ticket. Our LLM pipeline will trace concerns, deduce technical root causes, draft resolutions, and compile escalation recommendations.
                      </p>
                      <button
                        onClick={generateAdvancedSummary}
                        className="px-5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold transition-all text-xs cursor-pointer"
                      >
                        Launch Audit Compilation
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      
                      {/* Top Action Bar */}
                      <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-xl">
                        <div className="flex items-center gap-1.5 px-2 text-[10px] text-white/50 font-mono">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AUDIT SUMMARY READY</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyMarkdown}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-[11px] font-semibold cursor-pointer"
                            title="Copy compiled report as Markdown"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-white/60" />
                                <span>Copy Markdown</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleDownloadMarkdown}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 transition-all text-[11px] font-semibold cursor-pointer"
                            title="Download compiled report as .md"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export MD</span>
                          </button>
                          <button
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 transition-all text-[11px] font-semibold cursor-pointer"
                            title="Download compiled report as .pdf"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Export PDF</span>
                          </button>
                          <button
                            onClick={handleDownloadCsv}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 transition-all text-[11px] font-semibold cursor-pointer"
                            title="Download compiled report as .csv"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                          </button>
                        </div>
                      </div>

                      {/* Bento Cards Audit Grid */}
                      <div className="flex flex-col gap-4">
                        
                        {/* Summary Block row */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Priority Level */}
                          <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex flex-col gap-1.5">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-white/40 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-purple-400" /> Priority Level
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full
                                ${activeSummary.priorityLevel.toLowerCase() === "urgent" ? "bg-rose-500 animate-pulse" : ""}
                                ${activeSummary.priorityLevel.toLowerCase() === "high" ? "bg-amber-500" : ""}
                                ${activeSummary.priorityLevel.toLowerCase() === "medium" ? "bg-purple-500" : ""}
                                ${activeSummary.priorityLevel.toLowerCase() === "low" ? "bg-emerald-500" : ""}
                              `} />
                              <span className="text-xs font-bold text-white">{activeSummary.priorityLevel}</span>
                            </div>
                          </div>

                          {/* Est Resolution Time */}
                          <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex flex-col gap-1.5">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-white/40 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-400" /> Est. Resolution Time
                            </span>
                            <span className="text-xs font-bold text-white">{activeSummary.estimatedResolutionTime}</span>
                          </div>
                        </div>

                        {/* Issue Summary */}
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-purple-400" /> Issue Summary
                          </span>
                          <p className="text-xs text-white/95 leading-relaxed leading-normal">
                            {activeSummary.issueSummary}
                          </p>
                        </div>

                        {/* Customer Concern */}
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-purple-400" /> Customer Concern & Impact
                          </span>
                          <p className="text-xs text-white/90 leading-relaxed leading-normal">
                            {activeSummary.customerConcern}
                          </p>
                        </div>

                        {/* Root Cause */}
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5 text-purple-400" /> System Root Cause Tracing
                          </span>
                          <p className="text-xs text-white/90 leading-relaxed leading-normal italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                            "{activeSummary.rootCause}"
                          </p>
                        </div>

                        {/* Suggested Resolution Step Plan */}
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Suggested Resolution Path
                          </span>
                          <div className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap pl-1 leading-normal">
                            {activeSummary.suggestedResolution.split("\n").map((line, idx) => {
                              if (!line.trim()) return null;
                              return (
                                <div key={idx} className="flex gap-2 py-1 items-start">
                                  <CornerDownRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                  <span>{line.replace(/^-\s*/, "").replace(/^\d+\.\s*/, "")}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Human Escalation Recommendation */}
                        <div className="bg-gradient-to-br from-purple-950/20 to-indigo-950/20 border border-purple-500/20 rounded-xl p-4 flex flex-col gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Human Escalation recommendation
                          </span>
                          <p className="text-xs text-indigo-200 leading-normal">
                            {activeSummary.humanEscalationRecommendation}
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 shadow-xl flex-1 flex flex-col items-center justify-center text-center text-white/40 backdrop-blur-md min-h-[400px]">
              <p>No active incident chosen. Select a ticket from the sidebar queue to generate summaries.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
