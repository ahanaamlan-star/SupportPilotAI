import React, { useState, useEffect, useRef } from "react";
import { KnowledgeArticle } from "../types";
import { PRESET_CATEGORIES } from "../data";
import { showToast } from "../components/ToastContainer";
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  FileText, 
  ThumbsUp, 
  Eye, 
  ArrowLeft, 
  Plus, 
  Send,
  Loader2,
  Calendar,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Wrench,
  RefreshCw,
  FileCode,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Bookmark
} from "lucide-react";

interface KBPageProps {
  articles: KnowledgeArticle[];
  addArticle: (article: KnowledgeArticle) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
}

export default function KBPage({ 
  articles, 
  addArticle,
  recentSearches,
  addRecentSearch,
  removeRecentSearch
}: KBPageProps) {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
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

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "faq" | "troubleshoot" | "doc">("all");
  
  // AI Suggestions State
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [hasChatHistory, setHasChatHistory] = useState(false);

  // AI Draft Generator State
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftTopic, setDraftTopic] = useState("");
  const [draftContext, setDraftContext] = useState("");
  const [draftType, setDraftType] = useState<"faq" | "troubleshoot" | "doc">("troubleshoot");
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [generatingStatus, setGeneratingStatus] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Fetch active conversation context and generate smart recommendations
  const fetchRecommendations = async () => {
    if (loadingRecs) return;
    try {
      setLoadingRecs(true);
      // Fetch active conversation history cached on the server
      const historyRes = await fetch("/api/chat/latest-history");
      let activeMessages = [];
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        activeMessages = historyData.messages || [];
      }

      if (activeMessages.length === 0) {
        setHasChatHistory(false);
        setRecommendations([]);
        return;
      }

      setHasChatHistory(true);

      // Request recommendations from Gemini based on the current context
      const recRes = await fetch("/api/kb/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articles,
          messages: activeMessages
        })
      });

      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.recommendations || []);
      }
    } catch (err) {
      console.error("Failed to load smart support suggestions:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Poll for recommendations on component load and whenever database articles change
  useEffect(() => {
    fetchRecommendations();
  }, [articles]);

  // Filter articles based on category, search string, and active type tab
  const filteredArticles = articles.filter((art) => {
    const matchesSearch = 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || art.category === categoryFilter;
    
    // Check type matching. For older mock items that might lack type property, treat them as appropriate default
    const currentType = art.type || "doc";
    const matchesType = typeFilter === "all" || currentType === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Render high-polish custom markdown elements elegantly with CSS
  const renderMarkdown = (md: string) => {
    return md.split("\n").map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl font-extrabold text-white mt-6 mb-4 font-sans tracking-tight border-b border-white/10 pb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-lg font-bold text-indigo-300 mt-5 mb-3 font-sans flex items-center gap-2">🔍 {line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-base font-semibold text-purple-300 mt-4 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={idx} className="text-slate-300 ml-5 list-disc mt-1 text-[13px] leading-relaxed">{line.substring(2)}</li>;
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ") || line.startsWith("5. ")) {
        const dotIndex = line.indexOf(". ");
        return <li key={idx} className="text-slate-300 ml-5 list-decimal mt-1 text-[13px] leading-relaxed">{line.substring(dotIndex + 2)}</li>;
      }
      if (line.startsWith("`") && line.endsWith("`")) {
        return (
          <code key={idx} className="block bg-slate-950 p-3 rounded-xl font-mono text-xs text-indigo-400 my-2.5 border border-white/5 overflow-x-auto">
            {line.replace(/`/g, "")}
          </code>
        );
      }
      if (line.startsWith("```")) {
        return null; // Handle markdown fencing blocks gracefully
      }
      return line.trim() ? (
        <p key={idx} className="text-slate-300 text-[13px] leading-relaxed mt-2 select-text">
          {line.split("`").map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return <code key={pIdx} className="bg-slate-950 px-1.5 py-0.5 rounded text-xs font-mono text-purple-400 border border-white/5">{part}</code>;
            }
            return part;
          })}
        </p>
      ) : <div key={idx} className="h-2" />;
    });
  };

  const generateAIDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTopic.trim() || generatingStatus) return;

    setGeneratingStatus(true);
    setFeedbackMsg(null);

    try {
      const response = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: draftTopic,
          context: `Format as an elite ${draftType.toUpperCase()} reference guide. Context: ${draftContext}`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI writer model.");
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setGeneratedDraft(data.markdown);
      setDraftTitle(draftTopic);
      showToast("AI Custom Article Draft generated successfully!", "success");
    } catch (err: any) {
      console.error("AI Writer error:", err);
      const errMsg = err.message || "Failed to generate.";
      setFeedbackMsg(`Error: ${errMsg}`);
      showToast(`Generation failed: ${errMsg}`, "error");
    } finally {
      setGeneratingStatus(false);
    }
  };

  const publishAIDraft = () => {
    if (!generatedDraft || !draftTitle) return;

    const newKB: KnowledgeArticle = {
      id: `KB-${Math.floor(100 + Math.random() * 900)}`,
      title: draftTitle,
      category: categoryFilter !== "all" ? categoryFilter : PRESET_CATEGORIES[1],
      summary: `Automated technical draft classified as ${draftType.toUpperCase()}. Generated via Pilot Assist.`,
      content: generatedDraft,
      views: 1,
      helpfulCount: 0,
      tags: ["AI Draft", "Automated", draftType],
      lastUpdated: new Date().toISOString().split("T")[0],
      type: draftType
    };

    addArticle(newKB);
    setGeneratedDraft(null);
    setDraftTopic("");
    setDraftContext("");
    setIsDrafting(false);
    setFeedbackMsg("Article successfully drafted and published to current directory!");
    showToast(`Published article "${newKB.title}" successfully!`, "success");
    
    // Automatically select the new article to read
    setSelectedArticle(newKB);
  };

  // Helper to render descriptive type badges with specific styling
  const renderTypeBadge = (type?: string) => {
    const safeType = type || "doc";
    switch (safeType) {
      case "faq":
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
            <HelpCircle className="w-3 h-3" /> FAQ
          </span>
        );
      case "troubleshoot":
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
            <Wrench className="w-3 h-3" /> Troubleshooting Guide
          </span>
        );
      case "doc":
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
            <FileCode className="w-3 h-3" /> Product Doc
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full animate-fade-in" id="kb-workspace-container">
      
      {/* Article Detail View Reader Mode */}
      {selectedArticle ? (
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col gap-5 max-w-4xl w-full mx-auto" id="kb-reader">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-purple-400" /> {selectedArticle.views} Views</span>
              <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-indigo-400" /> {selectedArticle.helpfulCount} Helpful</span>
            </div>
          </div>

          <div className="px-1 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
                {selectedArticle.category}
              </span>
              {renderTypeBadge(selectedArticle.type)}
              <span className="text-[10px] font-mono text-white/40 font-bold ml-auto">{selectedArticle.id}</span>
            </div>
            <div className="markdown-body select-text mt-3">
              {renderMarkdown(selectedArticle.content)}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 text-xs text-white/50">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-white/30" /> Updated {selectedArticle.lastUpdated}</span>
            <div className="flex items-center gap-3">
              <span>Was this article helpful?</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    selectedArticle.helpfulCount += 1;
                    setFeedbackMsg("Thank you for your valuable rating!");
                    setTimeout(() => setFeedbackMsg(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/20 transition-all cursor-pointer"
                >
                  Yes, Helpful
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols wide on large screen): Search, Type Tabs, Article Grid */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            
            {/* Search, Categories and Document Type Navigation Bar */}
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2 tracking-tight">
                    <BookOpen className="w-5.5 h-5.5 text-purple-400" /> Knowledge Base Directory
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5">Unified technical documentation, guides and FAQ index</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 font-semibold hidden md:inline">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-black/40 border border-white/10 text-xs text-white/80 rounded-xl px-3 py-2.5 focus:border-purple-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#070514] text-white">All Folders</option>
                    {PRESET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-[#070514] text-white">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instant Search Inputs */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="w-4.5 h-4.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Type to search articles, guides... (Press Enter to save search)"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchTerm.trim()) {
                        addRecentSearch(searchTerm);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                  />
                </div>
                {recentSearches.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px]">
                    <span className="text-white/40 font-bold uppercase mr-1">Recent:</span>
                    {recentSearches.map((term) => (
                      <span
                        key={term}
                        onClick={() => setSearchTerm(term)}
                        className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 hover:border-white/10 px-2 py-1 rounded-md transition-all cursor-pointer"
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

              {/* Responsive Type Pills tabs */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    typeFilter === "all"
                      ? "bg-purple-500/20 text-purple-200 border border-purple-500/40"
                      : "bg-white/5 text-white/60 hover:text-white border border-transparent hover:bg-white/10"
                  }`}
                >
                  All Articles ({articles.length})
                </button>
                <button
                  onClick={() => setTypeFilter("faq")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    typeFilter === "faq"
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40"
                      : "bg-white/5 text-white/60 hover:text-white border border-transparent hover:bg-white/10"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions ({articles.filter(a => a.type === "faq").length})
                </button>
                <button
                  onClick={() => setTypeFilter("troubleshoot")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    typeFilter === "troubleshoot"
                      ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                      : "bg-white/5 text-white/60 hover:text-white border border-transparent hover:bg-white/10"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" /> Troubleshooting Guides ({articles.filter(a => a.type === "troubleshoot").length})
                </button>
                <button
                  onClick={() => setTypeFilter("doc")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    typeFilter === "doc"
                      ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                      : "bg-white/5 text-white/60 hover:text-white border border-transparent hover:bg-white/10"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" /> Product Documentation ({articles.filter(a => (a.type || "doc") === "doc").length})
                </button>
              </div>
            </div>

            {/* Articles list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isSearching ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-[24px] border border-white/5 bg-white/5 flex flex-col justify-between gap-4 animate-pulse h-[140px]">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-4 w-16 bg-white/10 rounded" />
                        <div className="h-4 w-12 bg-white/10 rounded-full" />
                      </div>
                      <div className="h-5 w-2/3 bg-white/10 rounded" />
                      <div className="h-3 w-full bg-white/10 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredArticles.length === 0 ? (
                <div className="md:col-span-2 text-center py-16 bg-white/5 border border-white/10 rounded-[24px] text-white/40 backdrop-blur-md flex flex-col items-center justify-center">
                  <FileText className="w-10 h-10 mb-2 text-white/20" />
                  <p className="text-sm font-bold text-white/80">No articles match your query.</p>
                  <p className="text-xs max-w-xs mt-1 text-white/40 leading-relaxed">
                    Try adjusting your filters, searching for alternate keywords, or draft a brand-new playbook with our AI Writer.
                  </p>
                </div>
              ) : (
                filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="p-5 rounded-[24px] border border-white/10 hover:border-white/25 bg-black/20 hover:bg-black/45 cursor-pointer transition-all flex flex-col justify-between gap-4 group shadow-md"
                    id={`kb-card-${art.id}`}
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-lg border border-purple-500/10">
                          {art.category}
                        </span>
                        {renderTypeBadge(art.type)}
                        <span className="text-[10px] font-mono text-white/30 font-bold ml-auto">{art.id}</span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {art.title}
                      </h3>
                      
                      <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-white/40">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-purple-400" /> {art.views}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-indigo-400" /> {art.helpfulCount}</span>
                      </div>
                      <span className="font-semibold">{art.lastUpdated}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: AI Support Suggested Articles widget AND AI Article Writer */}
          <div className="flex flex-col gap-5">
            
            {/* Widget 1: Smart Live Conversation Suggestions */}
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/25 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30 text-purple-300">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide">Live Support Insights</h3>
                    <span className="text-[9px] text-purple-300 font-extrabold tracking-wider uppercase">Active Recommendations</span>
                  </div>
                </div>

                <button
                  onClick={fetchRecommendations}
                  disabled={loadingRecs}
                  title="Check latest chat context"
                  className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white/60 hover:text-white disabled:opacity-40 hover:bg-black/60 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? "animate-spin" : ""}`} />
                </button>
              </div>

              {!hasChatHistory ? (
                <div className="p-4 bg-black/30 border border-white/5 rounded-xl text-center flex flex-col items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white/20 mb-1.5" />
                  <p className="text-[11px] font-semibold text-white/70">No active support chat logged.</p>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                    Start a customer dialogue in the **AI Support Chat** page to receive automatic, context-aware file recommendations here!
                  </p>
                </div>
              ) : loadingRecs ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span className="text-[10px] text-white/40 font-medium">Analyzing dialogue timeline...</span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="p-4 bg-black/20 border border-white/5 rounded-xl text-center text-white/50">
                  <p className="text-[10px] font-semibold">Active session analyzed.</p>
                  <p className="text-[10px] text-white/40 mt-1">No direct matching KB articles found for this scenario.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] text-white/50">Top recommendations based on conversation logs:</p>
                  <div className="flex flex-col gap-2">
                    {recommendations.map((rec) => {
                      const matchedArticle = articles.find(a => a.id === rec.articleId);
                      if (!matchedArticle) return null;

                      return (
                        <div
                          key={rec.articleId}
                          onClick={() => setSelectedArticle(matchedArticle)}
                          className="p-3 rounded-xl bg-black/35 hover:bg-black/55 border border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer flex flex-col gap-1.5 group text-left"
                        >
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="font-mono text-purple-300 font-extrabold">{rec.articleId}</span>
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-lg">
                              {rec.relevanceScore}% Match
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {matchedArticle.title}
                          </h4>

                          <p className="text-[10.5px] text-indigo-200/70 italic leading-relaxed border-l border-purple-500/30 pl-2">
                            "{rec.recommendationReason}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Widget 2: AI Article Draft Generator Panel */}
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4 relative h-[420px] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg border border-white/10 text-blue-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Author Copilot</h3>
                  <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Auto-Generate Documentation</span>
                </div>
              </div>

              {feedbackMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 rounded-xl flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <p>{feedbackMsg}</p>
                </div>
              )}

              {!generatedDraft ? (
                <form onSubmit={generateAIDraft} className="flex-1 flex flex-col justify-between mt-1">
                  <div className="flex flex-col gap-3">
                    
                    {/* Choose Article Type dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10.5px] font-semibold text-white/60">Documentation Type</label>
                      <select
                        value={draftType}
                        onChange={(e) => setDraftType(e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 text-xs text-white rounded-xl px-2.5 py-2 focus:border-blue-500 focus:outline-none cursor-pointer"
                      >
                        <option value="faq">Frequently Asked Question (FAQ)</option>
                        <option value="troubleshoot">Troubleshooting Guide</option>
                        <option value="doc">Product Documentation Card</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10.5px] font-semibold text-white/60">Article Title / Topic</label>
                      <input
                        type="text"
                        required
                        value={draftTopic}
                        onChange={(e) => setDraftTopic(e.target.value)}
                        placeholder="e.g., Troubleshooting Webhook HMAC Signature Errors"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10.5px] font-semibold text-white/60">Additional Context / Errors (Optional)</label>
                      <textarea
                        rows={3}
                        value={draftContext}
                        onChange={(e) => setDraftContext(e.target.value)}
                        placeholder="Provide server logs, CLI code blocks, or specific credentials structure to reference..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={generatingStatus || !draftTopic.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
                  >
                    {generatingStatus ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Synthesizing Draft...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Custom Draft</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex-1 flex flex-col justify-between gap-3 mt-1 overflow-hidden animate-fade-in">
                  <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Preview Draft (Markdown)</span>
                      <button 
                        onClick={() => setGeneratedDraft(null)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Discard
                      </button>
                    </div>
                    <textarea
                      value={generatedDraft}
                      onChange={(e) => setGeneratedDraft(e.target.value)}
                      className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 overflow-y-auto resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGeneratedDraft(null)}
                      className="flex-1 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white/60 text-xs font-semibold hover:text-white transition-all cursor-pointer"
                    >
                      Reset Setup
                    </button>
                    <button
                      onClick={publishAIDraft}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold hover:brightness-110 transition-all shadow-lg cursor-pointer"
                    >
                      Publish & Display
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
