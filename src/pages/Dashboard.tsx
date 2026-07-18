import React, { useState, useEffect, useRef } from "react";
import { Ticket, DashboardStats } from "../types";
import { showToast } from "../components/ToastContainer";
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  Smile, 
  AlertTriangle, 
  Inbox, 
  Layers,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  Clock3,
  X
} from "lucide-react";
import { PRESET_CATEGORIES } from "../data";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  onSelectTicket: (ticket: Ticket) => void;
}

export default function Dashboard({ tickets, addTicket, onSelectTicket }: DashboardProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(false);
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "pending" | "resolved">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high" | "urgent">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Ticket State
  const [newTitle, setNewTitle] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCategory, setNewCategory] = useState(PRESET_CATEGORIES[0]);
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newDescription, setNewDescription] = useState("");

  // Calculate dynamic statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === "open").length;
  const pendingTickets = tickets.filter(t => t.status === "pending").length;
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
  const urgentTickets = tickets.filter(t => t.priority === "urgent" && t.status !== "resolved").length;

  const stats: DashboardStats = {
    totalTickets,
    openTickets,
    resolvedTickets,
    averageResponseTime: "12.4 min",
    customerSatisfaction: 96
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCustomer || !newDescription) return;

    const randomId = `SP-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdTicket: Ticket = {
      id: randomId,
      title: newTitle,
      customer: newCustomer,
      customerEmail: newEmail || `${newCustomer.toLowerCase().replace(/\s+/g, "")}@example.com`,
      status: "open",
      priority: newPriority,
      category: newCategory,
      createdAt: new Date().toISOString(),
      description: newDescription,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "customer",
          text: newDescription,
          timestamp: new Date().toISOString()
        }
      ]
    };

    addTicket(createdTicket);
    setIsModalOpen(false);
    showToast(`Support Ticket ${randomId} successfully created!`, "success");

    // Reset Form
    setNewTitle("");
    setNewCustomer("");
    setNewEmail("");
    setNewCategory(PRESET_CATEGORIES[0]);
    setNewPriority("medium");
    setNewDescription("");
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
      case "high": return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "medium": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-700/50";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "pending": return "bg-amber-400/10 text-amber-300 border border-amber-400/30";
      case "resolved": return "bg-slate-700/20 text-slate-400 border border-slate-700/30";
      default: return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-fade-in" id="dashboard-view">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xs text-purple-400 uppercase tracking-widest font-bold">Workspace Overview</h1>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-sans">
            Command Center
          </h2>
          <p className="text-white/50 text-xs mt-1">
            Welcome back, Ahana. Pilot Mode is <span className="text-emerald-400 font-bold animate-pulse">● Active</span> with real-time semantic diagnostics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold hover:opacity-95 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 active:scale-95 self-start md:self-auto group cursor-pointer"
          id="btn-new-ticket"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Incident Ticket</span>
        </button>
      </div>

      {/* Stats Cards Row (Glassmorphic Bento Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5" id="dashboard-stats-grid">
        {/* Total Tickets */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[24px] backdrop-blur-md flex flex-col justify-between h-36 shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-300" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Queue Volume</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white tracking-tight">{stats.totalTickets}</span>
            <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
              +12%
            </span>
          </div>
          <p className="text-[10px] text-white/30">Active support caseload</p>
        </div>

        {/* Open Cases */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[24px] backdrop-blur-md flex flex-col justify-between h-36 shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Open Cases</p>
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white tracking-tight">{openTickets}</span>
            <span className="text-xs text-white/40">active</span>
          </div>
          <p className="text-[10px] text-white/30">Needs SLA triage</p>
        </div>

        {/* Critical Priority */}
        <div className="bg-white/5 border border-rose-500/20 p-6 rounded-[24px] backdrop-blur-md flex flex-col justify-between h-36 shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/15">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-all duration-300" />
          <p className="text-rose-400 font-bold text-xs uppercase tracking-widest">Urgent Esc</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-rose-400 tracking-tight">{urgentTickets}</span>
            <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              SLA Threat
            </span>
          </div>
          <p className="text-[10px] text-white/30">SLA priority queue</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[24px] backdrop-blur-md flex flex-col justify-between h-36 shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Avg Response</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white tracking-tight">{stats.averageResponseTime}</span>
          </div>
          <p className="text-[10px] text-purple-400 font-bold">18% solved under 15m</p>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[24px] backdrop-blur-md flex flex-col justify-between h-36 shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">CSAT Rating</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-black text-white tracking-tight">{stats.customerSatisfaction}%</span>
            <div className="w-8 h-8 rounded-full border-4 border-white/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin-slow" />
              <span className="text-[8px] font-bold text-purple-300">A+</span>
            </div>
          </div>
          <p className="text-[10px] text-white/30">Based on 154 reviews</p>
        </div>
      </div>

      {/* Main Grid: Live Queue & Pilot Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Queue List */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-md flex flex-col gap-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" /> Active Support Queue
              </h3>
              <p className="text-xs text-white/40">Sorted by creation timestamp</p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 text-xs text-white/80 rounded-xl px-3 py-1.5 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 text-xs text-white/80 rounded-xl px-3 py-1.5 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search queue by customer, ID, or subject..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
            />
          </div>

          {/* Queue List Table */}
          <div className="overflow-x-auto">
            {isSearching ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-16 bg-white/10 rounded" />
                        <div className="h-4 w-12 bg-white/10 rounded-full" />
                        <div className="h-4 w-12 bg-white/10 rounded" />
                      </div>
                      <div className="h-5 w-1/3 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-white/10 rounded-lg shrink-0" />
                  </div>
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 border border-white/10 rounded-[24px] p-8 shadow-xl backdrop-blur-md animate-fade-in">
                <div className="p-4 bg-slate-900/60 rounded-full border border-white/5 mb-4 text-purple-400">
                  <Inbox className="w-8 h-8 opacity-80" />
                </div>
                <h3 className="text-sm font-bold text-white/80 tracking-tight">No incident tickets found</h3>
                <p className="text-xs text-white/40 max-w-sm mt-1 leading-relaxed">
                  We couldn't find any tickets matching your search query or filter. Try choosing another status or priority parameter.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      onSelectTicket(ticket);
                      navigate("/tickets");
                    }}
                    className="p-4 rounded-xl border border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    id={`ticket-row-${ticket.id}`}
                  >
                    <div className="flex flex-col gap-1.5 overflow-hidden">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                          {ticket.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getPriorityBadgeColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getStatusBadgeColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className="text-[11px] text-white/60 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                          {ticket.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {ticket.title}
                      </h4>
                      <p className="text-xs text-white/60 truncate max-w-lg">
                        {ticket.customer} ({ticket.customerEmail}) • {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                        <span>Launch Diagnosis</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Copilot Activity Feed & Quick Draft */}
        <div className="flex flex-col gap-6">
          {/* AI Copilot Insights Panel */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Copilot Insights</h3>
                <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">Real-time Semantic Assistance</span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 mt-2">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-white/70 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-300 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Auto-Categorizer
                  </span>
                  <span className="text-[9px] text-white/30">2m ago</span>
                </div>
                <p>Identified Azure AD SSO login loop ticket category as <strong>Account Security</strong> with 94% semantic match confidence.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-white/70 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> KB Suggestion
                  </span>
                  <span className="text-[9px] text-white/30">12m ago</span>
                </div>
                <p>Matched Webhook Delivery failure ticket with knowledge article <strong>"Resolving Outbound Webhook Delivery Failures"</strong> (KB-215).</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 flex flex-col gap-1">
                <div className="flex items-center justify-between text-white/40">
                  <span className="font-semibold text-white/60 flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" /> Pending Queue Action
                  </span>
                  <span className="text-[9px]">1h ago</span>
                </div>
                <p>Duplicate billing escalation ticket requires immediate authorization receipt dispatch.</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary Graphic (Custom Mini Design) */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-3.5 shadow-xl">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Queue Health Overview</h4>
            <div className="flex items-center justify-between text-xs text-white/80 mt-1">
              <span>Open Caseload</span>
              <span className="font-bold">{openTickets}</span>
            </div>
            {/* Visual Custom Progress Bar Stack */}
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: `${(openTickets / (totalTickets || 1)) * 100}%` }} title="Open" />
              <div className="h-full bg-amber-400" style={{ width: `${(pendingTickets / (totalTickets || 1)) * 100}%` }} title="Pending" />
              <div className="h-full bg-white/20" style={{ width: `${(resolvedTickets / (totalTickets || 1)) * 100}%` }} title="Resolved" />
            </div>
            <div className="flex justify-between text-[10px] text-white/40">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Open ({openTickets})</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending ({pendingTickets})</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Resolved ({resolvedTickets})</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" id="modal-new-ticket">
          <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-indigo-400" /> File New Support Ticket
              </h3>
              <p className="text-xs text-slate-400 mt-1">Submit a new client issue to pilot queue</p>
            </div>

            <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Ticket Title / Subject</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., API payloads failing with bad auth parameters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    placeholder="e.g., Sarah Jenkins"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Customer Email (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g., sarah@jenkins.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {PRESET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Ticket Description / Transcript</label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Paste the customer's full initial complaint, request transcript, or diagnostic log..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-95 transition-all shadow-lg"
              >
                Log Ticket to System
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
