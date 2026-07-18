import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import FloatingAssistant from "./components/FloatingAssistant";
import ToastContainer from "./components/ToastContainer";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import TicketsPage from "./pages/TicketsPage";
import TicketSummaryPage from "./pages/TicketSummaryPage";
import KBPage from "./pages/KBPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

import { Ticket, KnowledgeArticle, AppSettings, Message } from "./types";
import { INITIAL_TICKETS, INITIAL_KNOWLEDGE_ARTICLES } from "./data";

export default function App() {
  // Global Synchronized Caseload & KB State loaded from local storage or defaults
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem("supportpilot_tickets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse tickets from local storage", e);
      }
    }
    return INITIAL_TICKETS;
  });

  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => {
    const saved = localStorage.getItem("supportpilot_kb_articles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse articles from local storage", e);
      }
    }
    return INITIAL_KNOWLEDGE_ARTICLES;
  });

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("supportpilot_recent_searches");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse recent searches from local storage", e);
      }
    }
    return [];
  });

  // Global Workspace Configuration Settings using Local Storage
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("supportpilot_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          copilotMode: "assist",
          modelSelection: "gemini-3.5-flash",
          apiKeySet: true,
          themeColor: "from-indigo-500 to-purple-600",
          enableNotifications: true,
          autoResolutionThreshold: 85,
          themeMode: "dark",
          responseLength: "medium",
          language: "English",
          ...parsed
        };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      copilotMode: "assist",
      modelSelection: "gemini-3.5-flash",
      apiKeySet: true,
      themeColor: "from-indigo-500 to-purple-600",
      enableNotifications: true,
      autoResolutionThreshold: 85,
      themeMode: "dark",
      responseLength: "medium",
      language: "English"
    };
  });

  // Persist tickets whenever they change
  useEffect(() => {
    localStorage.setItem("supportpilot_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // Persist articles whenever they change
  useEffect(() => {
    localStorage.setItem("supportpilot_kb_articles", JSON.stringify(articles));
  }, [articles]);

  // Persist recent searches whenever they change
  useEffect(() => {
    localStorage.setItem("supportpilot_recent_searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Persist settings and apply theme
  useEffect(() => {
    localStorage.setItem("supportpilot_settings", JSON.stringify(settings));

    const root = document.documentElement;
    if (settings.themeMode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else if (settings.themeMode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      // System mode fallback
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }
  }, [settings]);

  // State Callbacks
  const addTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const addArticle = (newArticle: KnowledgeArticle) => {
    setArticles((prev) => [newArticle, ...prev]);
  };

  const updateTicketStatus = (id: string, status: "open" | "pending" | "resolved") => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const addMessageToTicket = (id: string, message: Message) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, messages: [...t.messages, message] } : t))
    );
  };

  const addRecentSearch = (query: string) => {
    const cleaned = query.trim();
    if (!cleaned) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== cleaned.toLowerCase());
      return [cleaned, ...filtered].slice(0, 5); // Limit to last 5 unique queries
    });
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches((prev) => prev.filter((t) => t !== query));
  };

  const handleUpdateSettings = (updated: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  return (
    <Router>
      <div className="bg-[#070514] text-white min-h-screen font-sans flex relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Viewport Content Container */}
        <main className="flex-1 min-h-screen overflow-y-auto p-5 lg:p-8 lg:pl-72 pt-20 lg:pt-8 relative z-10 scrollbar-thin">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  tickets={tickets} 
                  addTicket={addTicket} 
                  onSelectTicket={setSelectedTicket} 
                />
              } 
            />
            <Route path="/chat" element={<ChatPage />} />
            <Route 
              path="/tickets" 
              element={
                <TicketSummaryPage 
                  tickets={tickets} 
                  selectedTicket={selectedTicket}
                  onSelectTicket={setSelectedTicket}
                  updateTicketStatus={updateTicketStatus}
                  recentSearches={recentSearches}
                  addRecentSearch={addRecentSearch}
                  removeRecentSearch={removeRecentSearch}
                />
              } 
            />
            <Route 
              path="/kb" 
              element={
                <KBPage 
                  articles={articles} 
                  addArticle={addArticle} 
                  recentSearches={recentSearches}
                  addRecentSearch={addRecentSearch}
                  removeRecentSearch={removeRecentSearch}
                />
              } 
            />
            <Route 
              path="/analytics" 
              element={<AnalyticsPage tickets={tickets} />} 
            />
            <Route 
              path="/settings" 
              element={
                <SettingsPage 
                  settings={settings} 
                  updateSettings={handleUpdateSettings} 
                />
              } 
            />
          </Routes>
        </main>

        {/* Floating AI Assistant */}
        <FloatingAssistant />

        {/* Global Toast Notifications */}
        <ToastContainer />

      </div>
    </Router>
  );
}
