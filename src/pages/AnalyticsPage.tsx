import { useState, useEffect } from "react";
import { Ticket } from "../types";
import { showToast } from "../components/ToastContainer";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line,
  ReferenceLine
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Smile, 
  Clock, 
  Activity,
  ArrowUpRight,
  Filter,
  Sparkles,
  RefreshCw,
  Download,
  AlertTriangle,
  Zap,
  Info,
  ShieldAlert,
  Sliders,
  CheckCircle,
  TrendingUp as TrendIcon,
  Award,
  Users,
  FileText
} from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsPageProps {
  tickets: Ticket[];
}

interface DailyData {
  name: string;
  dateStr: string;
  conversations: number;
  resolved: number;
  responseTime: number;
  satisfaction: number;
}

export default function AnalyticsPage({ tickets }: AnalyticsPageProps) {
  // Configured Interactive States using local storage
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">(() => {
    const saved = localStorage.getItem("supportpilot_analytics_timeRange");
    return (saved === "7" || saved === "30" || saved === "90") ? saved : "7";
  });
  const [scenario, setScenario] = useState<"normal" | "surge" | "ai_boost" | "outage">(() => {
    const saved = localStorage.getItem("supportpilot_analytics_scenario");
    return (saved === "normal" || saved === "surge" || saved === "ai_boost" || saved === "outage") ? saved : "normal";
  });
  const [selectedTeam, setSelectedTeam] = useState<"all" | "billing" | "infra" | "tier2">(() => {
    const saved = localStorage.getItem("supportpilot_analytics_selectedTeam");
    return (saved === "all" || saved === "billing" || saved === "infra" || saved === "tier2") ? saved : "all";
  });
  const [triggerSeed, setTriggerSeed] = useState(1);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [hoveredPriorityIndex, setHoveredPriorityIndex] = useState<number | null>(null);

  // Analytics action history feed
  const [analyticsHistory, setAnalyticsHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("supportpilot_analytics_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse analytics history", e);
      }
    }
    return [
      { id: "h1", event: "Metrics baseline system compiled", type: "system", timestamp: new Date().toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem("supportpilot_analytics_timeRange", timeRange);
  }, [timeRange]);

  useEffect(() => {
    localStorage.setItem("supportpilot_analytics_scenario", scenario);
  }, [scenario]);

  useEffect(() => {
    localStorage.setItem("supportpilot_analytics_selectedTeam", selectedTeam);
  }, [selectedTeam]);

  useEffect(() => {
    localStorage.setItem("supportpilot_analytics_history", JSON.stringify(analyticsHistory));
  }, [analyticsHistory]);

  const addLogEntry = (eventText: string, logType: "filter" | "export" | "system") => {
    const newEntry = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      event: eventText,
      type: logType,
      timestamp: new Date().toISOString()
    };
    setAnalyticsHistory(prev => [newEntry, ...prev].slice(0, 30));
  };

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    addLogEntry(`Time range changed to ${timeRange} days`, "filter");
  }, [timeRange]);

  useEffect(() => {
    if (isFirstRender) return;
    const scenarioNames: Record<string, string> = {
      normal: "Normal Operations Mode",
      surge: "Peak Traffic Surge Scenario",
      ai_boost: "AI Autopilot Sweep Simulation",
      outage: "Cloud Service Outage Scenario"
    };
    addLogEntry(`Scenario simulated: ${scenarioNames[scenario] || scenario}`, "filter");
  }, [scenario]);

  useEffect(() => {
    if (isFirstRender) return;
    const teamNames: Record<string, string> = {
      all: "All Support Teams",
      billing: "Billing Support Team",
      infra: "Infrastructure Team",
      tier2: "Tier 2 Escalations Team"
    };
    addLogEntry(`Team view filtered: ${teamNames[selectedTeam] || selectedTeam}`, "filter");
  }, [selectedTeam]);

  // Pseudo-random seed generator that fluctuates values based on state to simulate live analytics updates
  const randomWithSeed = (index: number, multiplier = 1) => {
    const x = Math.sin(index + triggerSeed) * 10000;
    return (x - Math.floor(x)) * multiplier;
  };

  // 1. Generate full dataset based on selected metrics
  const days = timeRange === "7" ? 7 : timeRange === "30" ? 30 : 90;
  
  // Base operational parameters
  let baseConversations = 22;
  let conversationVariance = 6;
  let baseResolutionRate = 0.89; // 89%
  let baseResponseTime = 24.5; // in minutes
  let responseVariance = 5;
  let baseSatisfaction = 93; // 93%
  let satisfactionVariance = 3.5;

  if (scenario === "surge") {
    baseConversations = 54;
    conversationVariance = 16;
    baseResolutionRate = 0.84;
    baseResponseTime = 38.0;
    responseVariance = 10;
    baseSatisfaction = 88;
    satisfactionVariance = 5;
  } else if (scenario === "ai_boost") {
    baseConversations = 24;
    conversationVariance = 5;
    baseResolutionRate = 0.98; // High resolution
    baseResponseTime = 1.8; // Instant response
    responseVariance = 0.5;
    baseSatisfaction = 98; // Peak CSAT
    satisfactionVariance = 1.5;
  } else if (scenario === "outage") {
    baseConversations = 85;
    conversationVariance = 20;
    baseResolutionRate = 0.42; // Low resolution due to backlogs
    baseResponseTime = 145.0; // SLA breached
    responseVariance = 25;
    baseSatisfaction = 64; // Low CSAT
    satisfactionVariance = 8;
  }

  // Adjustments based on Team Selector
  if (selectedTeam === "billing") {
    baseConversations *= 0.35;
    baseResponseTime *= 0.75;
    baseSatisfaction += 1.5;
  } else if (selectedTeam === "infra") {
    baseConversations *= 0.25;
    baseResponseTime *= 1.35;
    baseSatisfaction -= 2;
  } else if (selectedTeam === "tier2") {
    baseConversations *= 0.20;
    baseResponseTime *= 2.40; // High complex troubleshooting times
    baseSatisfaction -= 3;
  }

  // Generate date list ending today (2026-07-16)
  const endDate = new Date("2026-07-16");
  const dailyTrend: DailyData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const currentDate = new Date(endDate);
    currentDate.setDate(endDate.getDate() - i);
    
    const index = i;
    const dateLabel = currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dateFullStr = currentDate.toISOString().split("T")[0];

    // Compute values
    const convNoise = randomWithSeed(index * 2, conversationVariance) - (conversationVariance / 2);
    const dailyConversations = Math.max(1, Math.round(baseConversations + convNoise));

    const resRateNoise = randomWithSeed(index * 3, 0.08) - 0.04;
    const finalResRate = Math.min(1, Math.max(0.3, baseResolutionRate + resRateNoise));
    const dailyResolved = Math.min(dailyConversations, Math.max(0, Math.round(dailyConversations * finalResRate)));

    const rtNoise = randomWithSeed(index * 4, responseVariance) - (responseVariance / 2);
    const dailyResponseTime = Math.max(0.4, parseFloat((baseResponseTime + rtNoise).toFixed(1)));

    const satNoise = randomWithSeed(index * 5, satisfactionVariance) - (satisfactionVariance / 2);
    const dailySatisfaction = Math.min(100, Math.max(30, Math.round(baseSatisfaction + satNoise)));

    dailyTrend.push({
      name: dateLabel,
      dateStr: dateFullStr,
      conversations: dailyConversations,
      resolved: dailyResolved,
      responseTime: dailyResponseTime,
      satisfaction: dailySatisfaction
    });
  }

  // Incorporate real active tickets from our state to make the dashboard respond in real-time
  if (tickets.length > 0 && dailyTrend.length > 0) {
    const latestDay = dailyTrend[dailyTrend.length - 1];
    
    // Check tickets that match current team filter or categories
    let filteredRealTickets = tickets;
    if (selectedTeam === "billing") {
      filteredRealTickets = tickets.filter(t => t.category.toLowerCase().includes("billing") || t.category.toLowerCase().includes("invoice"));
    } else if (selectedTeam === "infra") {
      filteredRealTickets = tickets.filter(t => t.category.toLowerCase().includes("sso") || t.category.toLowerCase().includes("security"));
    } else if (selectedTeam === "tier2") {
      filteredRealTickets = tickets.filter(t => t.priority === "high" || t.priority === "urgent");
    }

    const realTodayTickets = filteredRealTickets.filter(t => t.createdAt.startsWith("2026-07-16") || t.createdAt.startsWith("2026-07-15"));
    const realResolvedToday = realTodayTickets.filter(t => t.status === "resolved");

    if (realTodayTickets.length > 0) {
      latestDay.conversations = Math.max(latestDay.conversations, realTodayTickets.length);
      latestDay.resolved = Math.max(latestDay.resolved, realResolvedToday.length);
    }
  }

  // Calculate sum counts
  const totalConversationsSum = dailyTrend.reduce((sum, d) => sum + d.conversations, 0);
  const totalResolvedSum = dailyTrend.reduce((sum, d) => sum + d.resolved, 0);
  const averageResolutionRate = totalConversationsSum > 0 
    ? parseFloat(((totalResolvedSum / totalConversationsSum) * 100).toFixed(1))
    : 0;

  const totalResponseTimeSum = dailyTrend.reduce((sum, d) => sum + d.responseTime, 0);
  const finalAverageResponseTime = dailyTrend.length > 0
    ? parseFloat((totalResponseTimeSum / dailyTrend.length).toFixed(1))
    : 0;

  const totalSatisfactionSum = dailyTrend.reduce((sum, d) => sum + d.satisfaction, 0);
  const finalAverageCsat = dailyTrend.length > 0
    ? parseFloat((totalSatisfactionSum / dailyTrend.length).toFixed(1))
    : 0;

  // Percentage growths based on selected scenarios
  let inflowGrowth = 14.8;
  let resolvedGrowth = 16.5;
  let responseTimeImprovement = 12.4; // positive is faster (good)
  let csatGrowth = 2.1;

  if (scenario === "outage") {
    inflowGrowth = 192.4;
    resolvedGrowth = -34.8;
    responseTimeImprovement = -285.4; 
    csatGrowth = -18.2;
  } else if (scenario === "ai_boost") {
    inflowGrowth = 3.2;
    resolvedGrowth = 42.5;
    responseTimeImprovement = 93.6; // 93% faster!
    csatGrowth = 5.8;
  } else if (scenario === "surge") {
    inflowGrowth = 94.2;
    resolvedGrowth = 62.1;
    responseTimeImprovement = -15.8;
    csatGrowth = -3.4;
  }

  // Issue Category Data Map
  let baseCategories = [
    { name: "Technical Support", pct: 0.38, color: "#6366f1" },
    { name: "Billing & Invoicing", pct: 0.24, color: "#ec4899" },
    { name: "API Integration", pct: 0.18, color: "#14b8a6" },
    { name: "SSO & Security", pct: 0.12, color: "#8b5cf6" },
    { name: "General Feedback", pct: 0.08, color: "#0ea5e9" }
  ];

  if (scenario === "outage") {
    baseCategories = [
      { name: "Technical Support", pct: 0.62, color: "#6366f1" },
      { name: "SSO & Security", pct: 0.22, color: "#8b5cf6" },
      { name: "API Integration", pct: 0.10, color: "#14b8a6" },
      { name: "Billing & Invoicing", pct: 0.04, color: "#ec4899" },
      { name: "General Feedback", pct: 0.02, color: "#0ea5e9" }
    ];
  } else if (selectedTeam === "billing") {
    baseCategories = [
      { name: "Billing & Invoicing", pct: 0.90, color: "#ec4899" },
      { name: "General Feedback", pct: 0.06, color: "#0ea5e9" },
      { name: "Technical Support", pct: 0.04, color: "#6366f1" }
    ];
  } else if (selectedTeam === "infra") {
    baseCategories = [
      { name: "SSO & Security", pct: 0.58, color: "#8b5cf6" },
      { name: "API Integration", pct: 0.32, color: "#14b8a6" },
      { name: "Technical Support", pct: 0.10, color: "#6366f1" }
    ];
  }

  const categoryData = baseCategories.map((cat, idx) => {
    const rawCount = Math.round(totalConversationsSum * cat.pct);
    const noise = Math.round(randomWithSeed(idx + 12, 10) - 5);
    const finalCount = Math.max(1, rawCount + noise);
    return {
      name: cat.name,
      tickets: finalCount,
      color: cat.color,
      percentage: totalConversationsSum > 0 ? parseFloat(((finalCount / totalConversationsSum) * 100).toFixed(1)) : 0
    };
  }).sort((a, b) => b.tickets - a.tickets);

  // Priority Distribution Pie Chart
  let lowRatio = 0.25, medRatio = 0.40, highRatio = 0.23, urgentRatio = 0.12;

  if (scenario === "outage") {
    lowRatio = 0.04; medRatio = 0.12; highRatio = 0.34; urgentRatio = 0.50; // Heavily urgent
  } else if (scenario === "ai_boost") {
    lowRatio = 0.48; medRatio = 0.38; highRatio = 0.11; urgentRatio = 0.03; // AI sweeps lower priority
  }

  if (selectedTeam === "tier2") {
    lowRatio = 0.02; medRatio = 0.18; highRatio = 0.55; urgentRatio = 0.25;
  }

  const lowVal = Math.max(0, Math.round(totalConversationsSum * lowRatio));
  const medVal = Math.max(0, Math.round(totalConversationsSum * medRatio));
  const highVal = Math.max(0, Math.round(totalConversationsSum * highRatio));
  const urgentVal = Math.max(0, Math.round(totalConversationsSum * urgentRatio));

  const priorityData = [
    { name: "Low", value: lowVal, color: "#64748b" },
    { name: "Medium", value: medVal, color: "#8b5cf6" },
    { name: "High", value: highVal, color: "#f59e0b" },
    { name: "Urgent", value: urgentVal, color: "#f43f5e" }
  ];

  const kpiStats = {
    totalInflow: totalConversationsSum,
    totalResolved: totalResolvedSum,
    resolutionRate: averageResolutionRate,
    avgResponseTime: finalAverageResponseTime,
    averageCsat: finalAverageCsat,
    inflowGrowth,
    resolvedGrowth,
    responseTimeImprovement,
    csatGrowth
  };

  // Helper trigger to wiggle charts randomly to simulate real time polling updates
  const refreshMockPolling = () => {
    setTriggerSeed(prev => prev + 1);
    setExportToast("Live operational workspace refreshed successfully.");
    addLogEntry("Workspace diagnostic baseline recalculated.", "system");
    setTimeout(() => setExportToast(null), 3000);
  };

  // Export report simulation
  const triggerReportExport = () => {
    const formattedDate = new Date().toLocaleString();
    const fileName = `SP-Report-${timeRange}d-${scenario}.csv`;

    // Generate CSV
    let csvContent = "Date,Day,Conversations Inflow,Conversations Resolved,Avg Response Time (m),Customer Satisfaction (%)\n";
    dailyTrend.forEach(row => {
      csvContent += `"${row.dateStr}","${row.name}",${row.conversations},${row.resolved},${row.responseTime},${row.satisfaction}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(`CSV Report successfully downloaded: ${fileName} (${formattedDate})`);
    showToast(`CSV Report downloaded: ${fileName}`, "success");
    addLogEntry(`Exported analytical report: ${fileName}`, "export");
    setTimeout(() => setExportToast(null), 4000);
  };

  const triggerPdfExport = () => {
    const formattedDate = new Date().toLocaleString();
    const fileName = `SupportPilot-Analytics-Report-${timeRange}d.pdf`;

    setExportToast("Generating PDF report, please wait...");
    showToast("Generating PDF report, please wait...", "info");

    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("SupportPilot AI - Analytics Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${formattedDate}`, 14, 28);
      doc.text(`Time Range: ${timeRange} Days  |  Scenario: ${scenario}  |  Team: ${selectedTeam}`, 14, 34);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 38, 196, 38);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Key Performance Indicators", 14, 46);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Total Inflow Conversations: ${kpiStats.totalInflow.toLocaleString()}`, 14, 54);
      doc.text(`Total Resolved Conversations: ${kpiStats.totalResolved.toLocaleString()}`, 14, 60);
      doc.text(`Resolution Efficiency Rate: ${kpiStats.resolutionRate}%`, 14, 66);
      doc.text(`Average System Response Speed: ${kpiStats.avgResponseTime} minutes`, 14, 72);
      doc.text(`Customer Satisfaction Rating (CSAT): ${kpiStats.averageCsat}%`, 14, 78);
      
      doc.line(14, 84, 196, 84);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Daily Operations Trend Logs", 14, 92);
      
      // Header for table
      doc.setFontSize(9);
      doc.text("Date", 14, 100);
      doc.text("Inflow", 55, 100);
      doc.text("Resolved", 85, 100);
      doc.text("Resp. Time (m)", 115, 100);
      doc.text("CSAT (%)", 155, 100);
      doc.line(14, 102, 196, 102);
      
      let y = 108;
      dailyTrend.forEach((row) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
          doc.setFont("helvetica", "bold");
          doc.text("Date", 14, y);
          doc.text("Inflow", 55, y);
          doc.text("Resolved", 85, y);
          doc.text("Resp. Time (m)", 115, y);
          doc.text("CSAT (%)", 155, y);
          doc.line(14, y + 2, 196, y + 2);
          y += 8;
        }
        doc.setFont("helvetica", "normal");
        doc.text(row.dateStr, 14, y);
        doc.text(String(row.conversations), 55, y);
        doc.text(String(row.resolved), 85, y);
        doc.text(String(row.responseTime), 115, y);
        doc.text(`${row.satisfaction}%`, 155, y);
        y += 6;
      });
      
      doc.save(fileName);
      setExportToast(`PDF Report successfully downloaded: ${fileName}`);
      showToast(`PDF Report downloaded: ${fileName}`, "success");
      addLogEntry(`Exported analytical PDF report: ${fileName}`, "export");
      setTimeout(() => setExportToast(null), 4000);
    }).catch(err => {
      console.error("PDF export error:", err);
      setExportToast("Failed to generate PDF report.");
      showToast("Failed to generate PDF report.", "error");
      setTimeout(() => setExportToast(null), 4000);
    });
  };

  // Custom polished Tooltip styled for dark high contrast themes
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b081e]/95 border border-white/10 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-xs font-bold text-white/90 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            {label}
          </p>
          <div className="flex flex-col gap-1 border-t border-white/5 pt-1.5">
            {payload.map((pld: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6 text-xs py-0.5">
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
                  <span>{pld.name}:</span>
                </div>
                <span className="font-bold text-white">{pld.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Render a customized circular dot indicator for the average response line chart
  const renderCustomizedDot = (props: any) => {
    const { cx, cy, stroke, value } = props;
    if (value > 60) {
      return (
        <svg x={cx - 5} y={cy - 5} width={10} height={10} fill="red" viewBox="0 0 1024 1024">
          <circle cx="512" cy="512" r="512" fill="#f43f5e" stroke="#fff" strokeWidth="120" />
        </svg>
      );
    }
    return <circle cx={cx} cy={cy} r={3.5} stroke={stroke} strokeWidth={1.5} fill="#0d0a25" />;
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-fade-in" id="analytics-suite-root">
      
      {/* SLA ALERT BANNER (Triggered during Service Outages) */}
      {scenario === "outage" && (
        <div className="bg-rose-500/10 border border-rose-500/35 rounded-2xl p-4 flex items-start gap-3 shadow-lg text-rose-300 animate-fade-in" id="sla-alert-banner">
          <ShieldAlert className="w-6 h-6 shrink-0 text-rose-400 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <h4 className="text-sm font-black text-rose-200">Critical Incident SLA Warning</h4>
            <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
              Active system outage simulation enabled. Ticket volume is spiking <strong>(+192.4%)</strong>, urgent priority backlogs represent <strong>50%</strong> of queue distribution, and response speed is breaching safety parameters (<strong>{finalAverageResponseTime}m average</strong>).
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/50 text-[10px] font-bold text-rose-300 uppercase border border-rose-500/25">
            SLA Breached
          </div>
        </div>
      )}

      {/* AI OPTIMIZATION BANNER (Triggered during Pilot Autopilot simulation) */}
      {scenario === "ai_boost" && (
        <div className="bg-indigo-500/10 border border-indigo-500/35 rounded-2xl p-4 flex items-start gap-3 shadow-lg text-indigo-300 animate-fade-in" id="ai-active-banner">
          <Sparkles className="w-6 h-6 shrink-0 text-indigo-400 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="text-sm font-black text-indigo-200">AI Copilot Sweep Mode Active</h4>
            <p className="text-xs text-indigo-300/80 mt-1 leading-relaxed">
              Autopilot resolves standard queries instantly. Average response times decreased dramatically to <strong>{finalAverageResponseTime} minutes</strong> while resolution efficiency surged by <strong>+42.5%</strong>.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 text-[10px] font-extrabold text-indigo-300 uppercase border border-indigo-500/25">
            AI Operating
          </div>
        </div>
      )}

      {/* TOP CONTROLLER & SIMULATOR CONTROL CENTER */}
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-2xl backdrop-blur-md flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative overflow-hidden" id="analytics-filter-header">
        
        {/* Title and Short Explanation */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/20 border border-white/10 rounded-2xl text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              Pilot Intelligence Metrics Dashboard
            </h2>
            <p className="text-xs text-white/40 mt-0.5 font-medium">Interactive SLA analysis, customer happiness indicators and volume streams.</p>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Team Filter */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5">
            <Users className="w-3.5 h-3.5 text-white/40" />
            <select
              value={selectedTeam}
              onChange={(e: any) => setSelectedTeam(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 cursor-pointer pr-1 font-semibold"
            >
              <option value="all" className="bg-[#0b081e] text-white">All Teams</option>
              <option value="billing" className="bg-[#0b081e] text-white">Billing Support</option>
              <option value="infra" className="bg-[#0b081e] text-white">Infrastructure</option>
              <option value="tier2" className="bg-[#0b081e] text-white">Tier 2 Escalations</option>
            </select>
          </div>

          {/* Operational Scenario Simulator dropdown */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5">
            <Sliders className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs text-white/40 hidden md:inline">Scenario:</span>
            <select
              value={scenario}
              onChange={(e: any) => setScenario(e.target.value)}
              className="bg-transparent border-none text-xs text-indigo-300 font-bold focus:outline-none focus:ring-0 cursor-pointer pr-1"
            >
              <option value="normal" className="bg-[#0b081e] text-white">Normal Operations</option>
              <option value="surge" className="bg-[#0b081e] text-amber-400">Peak Traffic Surge</option>
              <option value="ai_boost" className="bg-[#0b081e] text-indigo-400">AI Autopilot Sweep</option>
              <option value="outage" className="bg-[#0b081e] text-rose-400">Cloud Service Outage</option>
            </select>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setTimeRange("7")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "7"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange("30")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "30"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange("90")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "90"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              90D
            </button>
          </div>

          {/* Action Button: Live Poll Refresh */}
          <button
            onClick={refreshMockPolling}
            title="Refresh system logs"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Action Button: Export Report */}
          <button
            onClick={triggerReportExport}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Action Button: Export PDF */}
          <button
            onClick={triggerPdfExport}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS HEADER ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="analytics-kpi-grid">
        
        {/* KPI 1: Daily Conversations Inflow */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Total Inflow</span>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">{kpiStats.totalInflow.toLocaleString()}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {kpiStats.inflowGrowth >= 0 ? (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +{kpiStats.inflowGrowth}%
                </span>
              ) : (
                <span className="text-[10px] text-rose-400 font-bold flex items-center bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {kpiStats.inflowGrowth}%
                </span>
              )}
              <span className="text-[10px] text-white/30 font-medium">vs preceding days</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Resolved Incident Ratio */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">SLA Resolution Rate</span>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">{kpiStats.resolutionRate}%</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {kpiStats.resolvedGrowth >= 0 ? (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +{kpiStats.resolvedGrowth}%
                </span>
              ) : (
                <span className="text-[10px] text-rose-400 font-bold flex items-center bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {kpiStats.resolvedGrowth}%
                </span>
              )}
              <span className="text-[10px] text-white/30 font-bold">{kpiStats.totalResolved} solved</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Average Response Time */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Speed to Solve</span>
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">
              {kpiStats.avgResponseTime >= 60 
                ? `${(kpiStats.avgResponseTime / 60).toFixed(1)} hrs` 
                : `${kpiStats.avgResponseTime} min`
              }
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              {kpiStats.responseTimeImprovement >= 0 ? (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> {kpiStats.responseTimeImprovement}% faster
                </span>
              ) : (
                <span className="text-[10px] text-rose-400 font-bold flex items-center bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {Math.abs(kpiStats.responseTimeImprovement)}% slower
                </span>
              )}
              <span className="text-[10px] text-white/30 font-medium">first reply target</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Customer Satisfaction score */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">CSAT Score</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Smile className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">{kpiStats.averageCsat}%</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {kpiStats.csatGrowth >= 0 ? (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +{kpiStats.csatGrowth}%
                </span>
              ) : (
                <span className="text-[10px] text-rose-400 font-bold flex items-center bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {kpiStats.csatGrowth}%
                </span>
              )}
              <span className="text-[10px] text-white/30 font-medium">user reviews rating</span>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED 6 CHARTS WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="dashboard-charts-layout">
        
        {/* CHART 1: DAILY CONVERSATIONS (AREA CHART WITH GRADIENTS) */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4" id="chart-daily-conversations-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Daily Conversation Inflow
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">Dispatched customer discussions logged per operating cycle</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-purple-400 font-extrabold block">
                Peak: {Math.max(...dailyTrend.map(d => d.conversations))}
              </span>
              <span className="text-[9px] text-white/30 block">
                Avg: {Math.round(totalConversationsSum / dailyTrend.length)} / day
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-2" id="canvas-conversations">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="conversations" 
                  name="Active Inflow" 
                  stroke="#8b5cf6" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#purpleGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: RESOLVED TICKETS (BAR CHART WITH REF TARGETS) */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4" id="chart-resolved-tickets-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Resolved Tickets Rate
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">Successful resolutions locked and audited by agents</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-extrabold block">
                Total: {totalResolvedSum}
              </span>
              <span className="text-[9px] text-white/30 block">
                Efficiency: {averageResolutionRate}%
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-2" id="canvas-resolved">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="resolved" 
                  name="Resolved Solutions" 
                  fill="#10b981" 
                  radius={[5, 5, 0, 0]} 
                  maxBarSize={30}
                >
                  {dailyTrend.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.resolved / entry.conversations >= 0.9 ? "#10b981" : "#34d399"} 
                    />
                  ))}
                </Bar>
                {/* Target resolution SLA line benchmark (based on standard averages) */}
                <ReferenceLine 
                  y={Math.round(baseConversations * 0.85)} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: "SLA Target", fill: "#f43f5e", fontSize: 9, position: "top" }} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: AVERAGE RESPONSE TIME (LINE CHART WITH DYNAMIC NODES) */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4" id="chart-response-time-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Average Response Time (FRT)
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">Average wait minutes elapsed before first developer feedback</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-cyan-400 font-extrabold block">
                Avg: {finalAverageResponseTime}m
              </span>
              <span className="text-[9px] text-white/30 block">
                Fastest: {Math.min(...dailyTrend.map(d => d.responseTime))}m
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-2" id="canvas-responsetime">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  name="Response Speed (min)" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  dot={renderCustomizedDot}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: CUSTOMER SATISFACTION (CSAT SPLINE CHART) */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4" id="chart-csat-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Customer Satisfaction Index
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">Aggregated post-ticket survey response scores</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-extrabold block">
                Benchmark: {finalAverageCsat}%
              </span>
              <span className="text-[9px] text-white/30 block">
                Survey replies: {Math.round(totalResolvedSum * 0.45)} replies
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-2" id="canvas-csat">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} domain={[30, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="satisfaction" 
                  name="CSAT Rate (%)" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#greenGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: ISSUE CATEGORIES (HORIZONTAL OR VERTICAL BAR CHART) */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4" id="chart-issue-categories-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Volume Categorization Matches
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">Topic extraction metrics analyzed across active workflows</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-indigo-400 font-extrabold block">
                Top category: {categoryData[0]?.name || "None"}
              </span>
              <span className="text-[9px] text-white/30 block">
                Extracted topics: {categoryData.length} topics
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-2" id="canvas-categories">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={true} horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={10} tickLine={false} width={110} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(11, 8, 30, 0.95)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    borderRadius: "14px",
                    color: "#fff"
                  }} 
                />
                <Bar dataKey="tickets" name="Tickets" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: PRIORITY DISTRIBUTION (DONUT PIE CHART) */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4" id="chart-priority-distribution-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Priority Allocation
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">SLA classification severity levels for active queues</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-rose-400 font-extrabold block">
                Urgent Backlog: {priorityData.find(p => p.name === "Urgent")?.value || 0}
              </span>
              <span className="text-[9px] text-white/30 block">
                Queue density ratios
              </span>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative mt-2" id="canvas-priority-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                  onMouseEnter={(_, index) => setHoveredPriorityIndex(index)}
                  onMouseLeave={() => setHoveredPriorityIndex(null)}
                >
                  {priorityData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.color} 
                      opacity={hoveredPriorityIndex === null || hoveredPriorityIndex === idx ? 1.0 : 0.45}
                      stroke="rgba(11, 8, 30, 0.4)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(11, 8, 30, 0.95)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    borderRadius: "14px",
                    color: "#fff"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Glowing Centered Text indicating overall tickets captured in the current view */}
            <div className="absolute flex flex-col justify-center items-center pointer-events-none text-center">
              <span className="text-2xl font-black text-white">{totalConversationsSum}</span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Logged</span>
            </div>
          </div>

          {/* Interactive Legend Row */}
          <div className="flex flex-wrap justify-center gap-4 text-xs mt-1">
            {priorityData.map((item, idx) => (
              <div 
                key={idx} 
                onMouseEnter={() => setHoveredPriorityIndex(idx)}
                onMouseLeave={() => setHoveredPriorityIndex(null)}
                className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-all ${
                  hoveredPriorityIndex === idx ? "text-white scale-105" : "text-white/60 hover:text-white"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shadow-md" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SLA DIAGNOSTIC EVENT AUDIT LOG (Analytics History) */}
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4" id="analytics-history-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Operational Audit Logs (Local History)
            </h3>
            <p className="text-[10px] text-white/40 mt-0.5">Historical record of metric view pivots, scenario alerts, and exported summaries.</p>
          </div>
          <button
            onClick={() => {
              setAnalyticsHistory([
                { id: "h-clear-" + Date.now(), event: "Audit history logs cleared", type: "system", timestamp: new Date().toISOString() }
              ]);
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-all text-xs font-bold cursor-pointer self-start sm:self-auto"
          >
            Clear Log History
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto flex flex-col gap-2 scrollbar-thin pr-1 mt-1">
          {analyticsHistory.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString();
            const dateStr = new Date(item.timestamp).toLocaleDateString();
            return (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 text-[11px] hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.type === "export" ? "bg-emerald-400 shadow-emerald-400/50 shadow-sm" :
                    item.type === "filter" ? "bg-indigo-400 shadow-indigo-400/50 shadow-sm" :
                    "bg-purple-400"
                  }`} />
                  <span className="text-white/80 leading-snug">{item.event}</span>
                </div>
                <span className="text-[9.5px] font-mono text-white/40 shrink-0 ml-3">
                  {dateStr} {timeStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOAST SYSTEM FEEDBACK NOTIFICATIONS */}
      {exportToast && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-[#0e0a29]/95 border border-indigo-500/30 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center gap-3 animate-fade-in max-w-sm"
          id="export-toast-notification"
        >
          <div className="p-1.5 bg-indigo-500/25 rounded-lg border border-indigo-500/40 text-indigo-400">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Pilot Suite Feedback</p>
            <p className="text-[10px] text-white/60 mt-0.5 leading-relaxed">{exportToast}</p>
          </div>
        </div>
      )}

    </div>
  );
}
