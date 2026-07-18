import React, { useState, useRef, useEffect } from "react";
import { showToast } from "../components/ToastContainer";
import { 
  Bot, 
  Send, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  HelpCircle, 
  Terminal, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Flame, 
  TrendingUp,
  Cpu,
  Smile,
  Meh,
  Frown,
  Tag,
  Activity,
  FileText,
  Download,
  Square
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ClassificationResult {
  intent: string;
  sentiment: string;
  urgency: string;
  keyPhrases: string[];
  summary: string;
}

type SuggestedCategory = "diagnostics" | "customer_care" | "troubleshooting";

export default function ChatPage() {
  const defaultGreeting: ChatMessage[] = [
    {
      role: "assistant",
      content: "Hello! I am **SupportPilot AI**, your virtual customer support co-pilot.\n\nI have indexing access to your support logs, active ticket schemas, and Knowledge Base directories. I behave as a polite, elite support representative.\n\n### What I can help you with:\n- **Diagnose technical failures** (e.g. database lag, SSO loop errors)\n- **Explain SaaS configurations**\n- **Draft SLA-breach apologies**\n- **Create step-by-step resolution guides**\n\nChoose one of our preset questions below, or type your own support ticket details to start!",
      timestamp: new Date()
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("supportpilot_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
          }));
        }
      } catch (e) {
        console.error("Failed to parse chat history from local storage:", e);
      }
    }
    return defaultGreeting;
  });

  // Save conversation history to local storage
  useEffect(() => {
    localStorage.setItem("supportpilot_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Sync client-side chat history to server on initial load so the recommendations system is primed
  useEffect(() => {
    const syncChatHistory = async () => {
      try {
        await fetch("/api/chat/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages })
        });
      } catch (err) {
        console.error("Failed to sync chat history with server:", err);
      }
    };
    syncChatHistory();
  }, []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextInput, setContextInput] = useState("Enterprise Tier-1 SLA Support");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SuggestedCategory>("diagnostics");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Intelligent Real-Time Classification states
  const [classification, setClassification] = useState<ClassificationResult>({
    intent: "General Inquiry",
    sentiment: "Neutral",
    urgency: "Low",
    keyPhrases: ["Greetings", "Inquiry Started"],
    summary: "The customer has initiated contact. No active dialogue history has been analyzed yet."
  });
  const [isClassifying, setIsClassifying] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [thinkingStatus, setThinkingStatus] = useState("Compiling streaming context...");
  const [dynamicFollowUps, setDynamicFollowUps] = useState<string[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Smart auto-scroll that triggers on new messages, loading changes, or updates to streaming messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Thinking status cycler effect when isLoading is true
  useEffect(() => {
    if (!isLoading) return;
    const statuses = [
      "Consulting internal SLA playbooks...",
      "Evaluating live telemetry feed...",
      "Refining step-by-step solution steps...",
      "Drafting expert communication copy...",
      "Translating with optimal support tone...",
      "Generating diagnostic resolution checklist..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % statuses.length;
      setThinkingStatus(statuses[idx]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Suggested questions grouped by categories
  const suggestedQuestions: Record<SuggestedCategory, { label: string; text: string; desc: string }[]> = {
    diagnostics: [
      { 
        label: "SAML SSO loop", 
        desc: "Infinite Entra ID redirects",
        text: "How should I guide a enterprise customer who is stuck in an infinite SAML SSO redirect loop with Microsoft Entra ID?" 
      },
      { 
        label: "Webhook 504", 
        desc: "Outbound timeout logs",
        text: "Draft a technical response explaining why a customer is receiving outbound webhook delivery 504 Gateway Timeouts on our hooks." 
      },
      { 
        label: "Database Connection Lag", 
        desc: "Slow query diagnosis",
        text: "A customer reports severe query lag. Draft a step-by-step diagnostic roadmap asking for PostgreSQL metrics and local VPC configuration." 
      }
    ],
    customer_care: [
      { 
        label: "SLA Breach Apology", 
        desc: "Empathetic downtime draft",
        text: "Draft an extremely polite, professional SLA breach apology for a critical downtime event, offering a 10% credit option." 
      },
      { 
        label: "Refund Double Charge", 
        desc: "Billing duplicate error",
        text: "An enterprise customer was double charged for their monthly SaaS subscription due to a Stripe API failure. Draft a polite resolution update." 
      },
      { 
        label: "API Rate-limit Warning", 
        desc: "Polite warning of peak usage",
        text: "Write a polite warning notification email to a customer who has exceeded their premium API rate limits by 150% over the last 24 hours." 
      }
    ],
    troubleshooting: [
      { 
        label: "CORS Policy Block", 
        desc: "Local SDK connection fail",
        text: "Explain how a developer can resolve a 'CORS policy blocked' error when calling our client SDK on their localhost:3000 container." 
      },
      { 
        label: "Invalid REST API Key", 
        desc: "401 Unauthorized check",
        text: "Our API is returning 401 Unauthorized for a customer's automated scripts. Give a standard debugging list of variables to check." 
      },
      { 
        label: "Stripe Declined Card", 
        desc: "Payment failure support",
        text: "What support script should I use to guide a premium tier upgrade that keeps failing with standard credit card declines?" 
      }
    ]
  };

  const fetchClassification = async (chatHistory: ChatMessage[]) => {
    if (chatHistory.length <= 1) return;
    setIsClassifying(true);
    try {
      const res = await fetch("/api/chat/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.intent) {
          setClassification(data);
        }
      }
    } catch (e) {
      console.error("Classification error:", e);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    if (!textToSend) {
      setInput("");
    }

    setError(null);
    const userMsg: ChatMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    await startStreamingResponse(updatedMessages);
  };

  const generateFollowUps = (text: string) => {
    const textLower = text.toLowerCase();
    const suggestions: string[] = [];
    
    if (textLower.includes("sso") || textLower.includes("saml") || textLower.includes("entra") || textLower.includes("redirect")) {
      suggestions.push(
        "How to troubleshoot certificate expiration in SAML?",
        "Can we bypass SSO for administrator accounts?",
        "How to configure multiple Identity Providers?"
      );
    } else if (textLower.includes("database") || textLower.includes("postgres") || textLower.includes("query") || textLower.includes("lag") || textLower.includes("slow")) {
      suggestions.push(
        "How to set up pg_stat_statements for query tracing?",
        "What are the recommended connection pool sizes?",
        "How to analyze slow EXPLAIN plan outputs?"
      );
    } else if (textLower.includes("billing") || textLower.includes("refund") || textLower.includes("stripe") || textLower.includes("charge")) {
      suggestions.push(
        "How to handle a partial refund on the Stripe API?",
        "Can we retry failed credit card payments automatically?",
        "How to set up usage-based billing metrics?"
      );
    } else if (textLower.includes("cors") || textLower.includes("blocked") || textLower.includes("localhost") || textLower.includes("origin")) {
      suggestions.push(
        "How to configure wildcard origins in Express middleware?",
        "What are the security implications of credentials headers?",
        "How to test CORS headers using curl?"
      );
    } else {
      suggestions.push(
        "Can you refine this draft to be more formal?",
        "What are the security implications of this recommendation?",
        "Can you provide a step-by-step checklist for the customer?"
      );
    }
    setDynamicFollowUps(suggestions);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const startStreamingResponse = async (history: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);
    setThinkingStatus("Compiling streaming context...");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Add empty assistant placeholder that we will stream into
    const assistantPlaceholderIdx = history.length;
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true
    }]);

    try {
      // Fetch current configuration from local storage
      const savedSettingsStr = localStorage.getItem("supportpilot_settings");
      let modelSelection = "gemini-3.5-flash";
      let responseLength = "medium";
      let language = "English";
      if (savedSettingsStr) {
        try {
          const parsed = JSON.parse(savedSettingsStr);
          modelSelection = parsed.modelSelection || modelSelection;
          responseLength = parsed.responseLength || responseLength;
          language = parsed.language || language;
        } catch (e) {
          console.error("Error reading settings for stream", e);
        }
      }

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.map(m => ({
            role: m.role,
            content: m.content
          })),
          context: contextInput,
          modelSelection,
          responseLength,
          language
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming is not supported in this environment.");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.substring(6).trim();
            if (dataStr === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Update the last assistant message content in state
                setMessages(prev => {
                  const updated = [...prev];
                  if (updated[assistantPlaceholderIdx]) {
                    updated[assistantPlaceholderIdx] = {
                      ...updated[assistantPlaceholderIdx],
                      content: accumulatedText
                    };
                  }
                  return updated;
                });
              }
            } catch (e) {
              // ignore parser resets
            }
          }
        }
      }

      // Finalize streaming state
      setMessages(prev => {
        const updated = [...prev];
        if (updated[assistantPlaceholderIdx]) {
          updated[assistantPlaceholderIdx] = {
            ...updated[assistantPlaceholderIdx],
            isStreaming: false
          };
        }
        return updated;
      });

      // Automatically run real-time analytics classifications on complete response
      const finalHistory: ChatMessage[] = [
        ...history,
        {
          role: "assistant",
          content: accumulatedText,
          timestamp: new Date()
        }
      ];
      fetchClassification(finalHistory);
      generateFollowUps(accumulatedText);

    } catch (err: any) {
      if (err.name === "AbortError" || (err instanceof DOMException && err.name === "AbortError")) {
        console.log("Response streaming aborted by operator.");
        setMessages(prev => {
          const updated = [...prev];
          if (updated[assistantPlaceholderIdx]) {
            updated[assistantPlaceholderIdx] = {
              ...updated[assistantPlaceholderIdx],
              content: updated[assistantPlaceholderIdx].content || "*(Streaming generation cancelled by operator)*",
              isStreaming: false
            };
          }
          return updated;
        });
        setIsLoading(false);
        return;
      }

      console.error("Stream error:", err);
      setError(err.message || "An unexpected network error occurred during generative stream.");
      // Keep whatever text we managed to fetch, but set isStreaming to false
      setMessages(prev => {
        const updated = [...prev];
        if (updated[assistantPlaceholderIdx]) {
          updated[assistantPlaceholderIdx] = {
            ...updated[assistantPlaceholderIdx],
            content: updated[assistantPlaceholderIdx].content || "Failed to generate response due to server error.",
            isStreaming: false
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    if (isLoading) return;

    // Find last user message in our current chat log
    const userMessages = messages.filter(m => m.role === "user");
    if (userMessages.length === 0) return;

    const lastUserMsg = userMessages[userMessages.length - 1];
    const lastUserIdx = messages.lastIndexOf(lastUserMsg);

    // Keep history up to the last user message
    const trimmedHistory = messages.slice(0, lastUserIdx + 1);
    setMessages(trimmedHistory);

    // Re-start streaming response with the trimmed history
    await startStreamingResponse(trimmedHistory);
  };

  const clearChat = () => {
    if (isLoading) return;
    setDynamicFollowUps([]);
    setMessages([
      {
        role: "assistant",
        content: "Hello! Conversation cleared.\n\nI am **SupportPilot AI**, ready to assist as your elite customer support copilot. How can I assist you with support resolution today?",
        timestamp: new Date()
      }
    ]);
    setClassification({
      intent: "General Inquiry",
      sentiment: "Neutral",
      urgency: "Low",
      keyPhrases: ["Greetings", "Inquiry Started"],
      summary: "The customer has initiated contact. No active dialogue history has been analyzed yet."
    });
    setError(null);
    fetch("/api/chat/clear", { method: "POST" }).catch(e => console.error("Failed to clear server chat history:", e));
  };

  const exportToCSV = () => {
    try {
      const headers = ["Timestamp", "Role", "Message", "Intent", "Sentiment", "Urgency", "Keywords", "Telemetry Summary"];
      
      const rows = messages.map(m => {
        const timestampStr = m.timestamp.toISOString();
        const roleStr = m.role;
        const contentStr = m.content.replace(/"/g, '""');
        const intentStr = classification.intent.replace(/"/g, '""');
        const sentimentStr = classification.sentiment.replace(/"/g, '""');
        const urgencyStr = classification.urgency.replace(/"/g, '""');
        const keywordsStr = classification.keyPhrases.join(", ").replace(/"/g, '""');
        const summaryStr = classification.summary.replace(/"/g, '""');
        
        return `"${timestampStr}","${roleStr}","${contentStr}","${intentStr}","${sentimentStr}","${urgencyStr}","${keywordsStr}","${summaryStr}"`;
      });
      
      const csvContent = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SupportPilot-Session-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Session logs exported to CSV successfully!", "success");
    } catch (e) {
      showToast("Failed to export logs to CSV.", "error");
    }
  };

  const exportToPDF = () => {
    showToast("Generating PDF report, please wait...", "info");
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      
      // SupportPilot AI Branding
      doc.setFillColor(15, 23, 42); // slate-900 background for header
      doc.rect(0, 0, 210, 35, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SupportPilot AI", 14, 22);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(192, 132, 252); // purple-400
      doc.text("THE ULTIMATE AI-POWERED CO-PILOT FOR CUSTOMER SUPPORT", 14, 28);
      
      // Page details
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 22);
      doc.text("Status: Verified Production Run", 150, 28);
      
      let y = 45;
      
      // Title Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("Session Diagnostics Summary Sheet", 14, y);
      y += 8;
      
      // Telemetry / AI Analysis
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(107, 33, 168); // purple-800
      doc.text("AI Telemetry & Classification Analysis", 14, y);
      y += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(`Active Intent: ${classification.intent}`, 14, y);
      doc.text(`Urgency Level: ${classification.urgency}`, 80, y);
      doc.text(`Sentiment Check: ${classification.sentiment}`, 140, y);
      y += 6;
      
      const keywordsLine = `Extracted Keywords: ${classification.keyPhrases.join(", ")}`;
      const splitKeywords = doc.splitTextToSize(keywordsLine, 182);
      doc.text(splitKeywords, 14, y);
      y += (splitKeywords.length * 4.5) + 2;
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(14, y, 196, y);
      y += 6;
      
      // Issue Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(107, 33, 168);
      doc.text("Issue Summary", 14, y);
      y += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const splitSummary = doc.splitTextToSize(classification.summary, 182);
      doc.text(splitSummary, 14, y);
      y += (splitSummary.length * 5) + 4;
      
      doc.line(14, y, 196, y);
      y += 6;

      // Recommendations section based on intent
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(107, 33, 168);
      doc.text("AI Recommendations & Key Actions", 14, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      
      let recommendationsText = "";
      const intentLower = classification.intent.toLowerCase();
      if (intentLower.includes("billing") || intentLower.includes("refund")) {
        recommendationsText = "1. Cross-verify invoice records on the Stripe dashboard for duplicate payments. 2. Draft an empathetic apology offering refund credit options. 3. Request billing logs to confirm rate matching rules.";
      } else if (intentLower.includes("technical") || intentLower.includes("issue")) {
        recommendationsText = "1. Inspect Entra ID / IdP configuration files for redirection loop parameters. 2. Check server middleware routing logic for missing CORS authorization headers. 3. Confirm local environment configuration variables.";
      } else {
        recommendationsText = "1. Clarify customer request details and verify historical tickets. 2. Provide step-by-step tutorial links from the official Knowledge Base. 3. Check general cloud platform uptime logs.";
      }

      const splitRecommendations = doc.splitTextToSize(recommendationsText, 182);
      doc.text(splitRecommendations, 14, y);
      y += (splitRecommendations.length * 5) + 4;

      doc.line(14, y, 196, y);
      y += 6;
      
      // Chat Conversation History
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(107, 33, 168);
      doc.text("Customer & Assistant Conversation Logs", 14, y);
      y += 6;
      
      messages.forEach((msg) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const roleLabel = msg.role === "user" ? "CUSTOMER" : "ASSISTANT";
        if (msg.role === "user") {
          doc.setTextColor(14, 116, 144);
        } else {
          doc.setTextColor(109, 40, 217);
        }
        doc.text(`[${msg.timestamp.toLocaleTimeString()}] ${roleLabel}:`, 14, y);
        y += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        
        const cleanContent = msg.content.replace(/\*\*/g, "");
        const splitMsg = doc.splitTextToSize(cleanContent, 182);
        
        splitMsg.forEach((line: string) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 14, y);
          y += 4.5;
        });
        
        y += 4; // Spacing between messages
      });
      
      doc.save(`SupportPilot-AI-Session-${Date.now()}.pdf`);
      showToast("Session report PDF downloaded successfully!", "success");
    }).catch(err => {
      console.error("PDF generation error:", err);
      showToast("Failed to generate PDF session report.", "error");
    });
  };

  const exportToMarkdown = () => {
    let md = `# SupportPilot AI - Session Diagnostic Report\n\n`;
    md += `*Generated: ${new Date().toLocaleString()}*\n\n`;
    md += `## 📊 Session Telemetry & AI Analytics\n\n`;
    md += `- **Intent Classification:** ${classification.intent}\n`;
    md += `- **Sentiment:** ${classification.sentiment}\n`;
    md += `- **Urgency Level:** ${classification.urgency}\n`;
    md += `- **Keywords:** ${classification.keyPhrases.join(", ")}\n\n`;
    md += `### 📝 Session Summary\n`;
    md += `> ${classification.summary}\n\n`;
    md += `## 💬 Dialogue Transcript Logs\n\n`;
    
    messages.forEach((msg) => {
      const roleLabel = msg.role === "user" ? "🧑 Customer" : "🤖 SupportPilot Assistant";
      md += `### ${roleLabel} (${msg.timestamp.toLocaleTimeString()})\n\n`;
      md += `${msg.content}\n\n`;
      md += `---\n\n`;
    });
    
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SupportPilot-Session-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Session transcript exported as Markdown successfully!", "success");
  };

  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      branding: "SupportPilot AI",
      classification: {
        intent: classification.intent,
        sentiment: classification.sentiment,
        urgency: classification.urgency,
        keyPhrases: classification.keyPhrases,
        summary: classification.summary
      },
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString()
      }))
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SupportPilot-Session-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Session logs exported as JSON successfully!", "success");
  };

  const copyToClipboard = (text: string, index: number) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      showToast("Message content copied to clipboard!", "success");
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (e) {
      showToast("Failed to copy message content.", "error");
    }
  };

  // Custom high-contrast syntax highlighting helper
  const highlightCode = (code: string, language: string) => {
    const lang = language.toLowerCase();
    if (lang === "json") {
      return code.split("\n").map((line, idx) => {
        const highlighted = line
          .replace(/(".*?"\s*:)/g, '<span class="text-purple-300 font-semibold">$1</span>')
          .replace(/(:\s*".*?")/g, ': <span class="text-emerald-300">$1</span>')
          .replace(/(:\s*\d+)/g, ': <span class="text-amber-400 font-mono">$1</span>')
          .replace(/(true|false|null)/g, '<span class="text-sky-400 font-bold">$1</span>');
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} className="font-mono text-[11.5px] leading-relaxed min-h-[1.2rem]" />;
      });
    } else if (["javascript", "typescript", "js", "ts", "jsx", "tsx"].includes(lang)) {
      return code.split("\n").map((line, idx) => {
        const highlighted = line
          .replace(/\b(const|let|var|function|return|import|export|from|async|await|class|if|else|try|catch|throw|new|interface|type|public|private)\b/g, '<span class="text-purple-400 font-bold">$1</span>')
          .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-sky-400 font-semibold">$1</span>')
          .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-emerald-300">$1</span>')
          .replace(/(\/\/.*)/g, '<span class="text-white/30 italic">$1</span>');
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} className="font-mono text-[11.5px] leading-relaxed min-h-[1.2rem]" />;
      });
    } else if (["bash", "sh", "shell"].includes(lang)) {
      return code.split("\n").map((line, idx) => {
        const highlighted = line
          .replace(/^(#.*)/g, '<span class="text-white/30 italic">$1</span>')
          .replace(/\b(npm|install|run|git|curl|wget|sudo|cd|ls|mkdir|chmod|node|npx)\b/g, '<span class="text-purple-400 font-bold">$1</span>');
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} className="font-mono text-[11.5px] leading-relaxed min-h-[1.2rem]" />;
      });
    } else if (["html", "xml"].includes(lang)) {
      return code.split("\n").map((line, idx) => {
        const highlighted = line
          .replace(/(&lt;\/?[\w-]+)/g, '<span class="text-purple-400 font-semibold">$1</span>')
          .replace(/([\w-]+)=/g, '<span class="text-purple-300 font-medium">$1</span>=')
          .replace(/(".*?")/g, '<span class="text-emerald-300">$1</span>')
          .replace(/(&lt;!--.*?--&gt;)/g, '<span class="text-white/30 italic">$1</span>');
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} className="font-mono text-[11.5px] leading-relaxed min-h-[1.2rem]" />;
      });
    }
    return code.split("\n").map((line, idx) => (
      <div key={idx} className="font-mono text-[11.5px] leading-relaxed min-h-[1.2rem]">{line || " "}</div>
    ));
  };

  // Advanced inline and block markdown elements renderer
  const renderMessageContent = (content: string, isStreamingActive?: boolean) => {
    const lines = content.split("\n");
    const blocks: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = "text";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          const fullCode = codeLines.join("\n");
          const lang = codeLanguage;
          const blockIdx = i;
          blocks.push(
            <div key={`code-${blockIdx}`} className="bg-black/50 rounded-xl border border-white/10 overflow-hidden my-3 font-mono text-xs shadow-inner animate-fade-in">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Terminal className="w-3.5 h-3.5" />
                  {lang}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(fullCode)}
                  className="hover:text-white transition-all text-[10px] flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:bg-white/10"
                >
                  <Copy className="w-3 h-3" />
                  Copy Code
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-purple-200 select-text leading-relaxed">
                <code>{highlightCode(fullCode, lang)}</code>
              </pre>
            </div>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim() || "text";
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      const trimmed = line.trim();

      if (trimmed.startsWith("# ")) {
        blocks.push(
          <h1 key={i} className="text-lg font-extrabold text-white mt-4 mb-2 first:mt-0 border-b border-white/5 pb-1 flex items-center gap-2 animate-fade-in">
            {renderInlineElements(trimmed.substring(2))}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        blocks.push(
          <h2 key={i} className="text-md font-bold text-purple-300 mt-3.5 mb-1.5 first:mt-0 animate-fade-in">
            {renderInlineElements(trimmed.substring(3))}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        blocks.push(
          <h3 key={i} className="text-sm font-semibold text-purple-400 mt-3 mb-1.5 first:mt-0 animate-fade-in">
            {renderInlineElements(trimmed.substring(4))}
          </h3>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        blocks.push(
          <li key={i} className="text-white/80 ml-4 list-disc mt-1 text-xs leading-relaxed animate-fade-in">
            {renderInlineElements(trimmed.substring(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)/);
        const rest = match ? match[2] : trimmed;
        blocks.push(
          <li key={i} className="text-white/80 ml-4 list-decimal mt-1 text-xs leading-relaxed animate-fade-in">
            {renderInlineElements(rest)}
          </li>
        );
      } else if (trimmed.startsWith("> ")) {
        blocks.push(
          <blockquote key={i} className="border-l-2 border-purple-500 bg-white/5 pl-3 py-1 pr-1 rounded-r my-2 text-xs text-white/70 italic animate-fade-in">
            {renderInlineElements(trimmed.substring(2))}
          </blockquote>
        );
      } else if (trimmed === "") {
        blocks.push(<div key={i} className="h-2" />);
      } else {
        blocks.push(
          <p key={i} className="text-xs text-white/90 leading-relaxed mt-1.5 first:mt-0 select-text animate-fade-in">
            {renderInlineElements(trimmed)}
          </p>
        );
      }
    }

    // Unclosed code block fallback
    if (inCodeBlock && codeLines.length > 0) {
      const fullCode = codeLines.join("\n");
      blocks.push(
        <div key="unclosed-code" className="bg-black/50 rounded-xl border border-white/10 overflow-hidden my-3 font-mono text-xs animate-fade-in">
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider">
            <span>{codeLanguage}</span>
          </div>
          <pre className="p-3.5 overflow-x-auto text-purple-200 select-text leading-relaxed">
            <code>{highlightCode(fullCode, codeLanguage)}</code>
          </pre>
        </div>
      );
    }

    // Pulsing cursor block at end if streaming is active
    if (isStreamingActive) {
      blocks.push(
        <span key="streaming-cursor" className="inline-block w-2 h-3.5 bg-purple-500 rounded-sm animate-pulse ml-1 align-middle" />
      );
    }

    return blocks;
  };

  const renderInlineElements = (text: string) => {
    let parts: React.ReactNode[] = [text];

    // Bold tags: **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let hasBold = false;
    let tempParts: React.ReactNode[] = [];

    for (const part of parts) {
      if (typeof part === "string") {
        let lastIdx = 0;
        let match;
        while ((match = boldRegex.exec(part)) !== null) {
          hasBold = true;
          if (match.index > lastIdx) {
            tempParts.push(part.substring(lastIdx, match.index));
          }
          tempParts.push(<strong key={`bold-${match.index}`} className="font-bold text-purple-300">{match[1]}</strong>);
          lastIdx = boldRegex.lastIndex;
        }
        if (lastIdx < part.length) {
          tempParts.push(part.substring(lastIdx));
        }
      } else {
        tempParts.push(part);
      }
    }
    if (hasBold) parts = tempParts;

    // Italics tags: *text* (excluding **)
    const italicRegex = /(?<!\*)\*(?!\*)(.*?)\*/g;
    let hasItalic = false;
    tempParts = [];

    for (const part of parts) {
      if (typeof part === "string") {
        let lastIdx = 0;
        let match;
        while ((match = italicRegex.exec(part)) !== null) {
          hasItalic = true;
          if (match.index > lastIdx) {
            tempParts.push(part.substring(lastIdx, match.index));
          }
          tempParts.push(<em key={`italic-${match.index}`} className="italic text-white/70">{match[1]}</em>);
          lastIdx = italicRegex.lastIndex;
        }
        if (lastIdx < part.length) {
          tempParts.push(part.substring(lastIdx));
        }
      } else {
        tempParts.push(part);
      }
    }
    if (hasItalic) parts = tempParts;

    // Link tags: [label](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    let hasLink = false;
    tempParts = [];

    for (const part of parts) {
      if (typeof part === "string") {
        let lastIdx = 0;
        let match;
        while ((match = linkRegex.exec(part)) !== null) {
          hasLink = true;
          if (match.index > lastIdx) {
            tempParts.push(part.substring(lastIdx, match.index));
          }
          tempParts.push(
            <a 
              key={`link-${match.index}`} 
              href={match[2]} 
              target="_blank" 
              referrerPolicy="no-referrer" 
              className="text-purple-400 hover:underline hover:text-purple-300 font-semibold inline-flex items-center gap-0.5"
            >
              {match[1]}
            </a>
          );
          lastIdx = linkRegex.lastIndex;
        }
        if (lastIdx < part.length) {
          tempParts.push(part.substring(lastIdx));
        }
      } else {
        tempParts.push(part);
      }
    }
    if (hasLink) parts = tempParts;

    // Inline code tags: `code`
    const codeRegex = /`(.*?)`/g;
    let hasCode = false;
    tempParts = [];

    for (const part of parts) {
      if (typeof part === "string") {
        let lastIdx = 0;
        let match;
        while ((match = codeRegex.exec(part)) !== null) {
          hasCode = true;
          if (match.index > lastIdx) {
            tempParts.push(part.substring(lastIdx, match.index));
          }
          tempParts.push(<code key={`code-${match.index}`} className="bg-black/40 border border-white/10 px-1 py-0.5 rounded text-[11px] font-mono text-purple-400">{match[1]}</code>);
          lastIdx = codeRegex.lastIndex;
        }
        if (lastIdx < part.length) {
          tempParts.push(part.substring(lastIdx));
        }
      } else {
        tempParts.push(part);
      }
    }
    if (hasCode) parts = tempParts;

    return parts;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto animate-fade-in pb-12" id="chat-page-root">
      
      {/* Column 1: AI Support Stats & Active SLA Dials */}
      <div className="lg:col-span-1 flex flex-col gap-5">
        
        {/* SupportPilot Configuration Console */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pilot Controller</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Model Class</label>
              <div className="bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 flex items-center justify-between">
                <span>Gemini 3.5 Flash</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Workspace Context</label>
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="e.g. Billing Core"
                  className="bg-transparent text-xs text-white focus:outline-none w-full font-medium"
                />
              </div>
              <p className="text-[9px] text-white/30 italic">Active systemInstruction payload proxy.</p>
            </div>
          </div>
        </div>

        {/* Real-Time AI Classifications Side Panel */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4 animate-fade-in" id="ai-telemetry-panel">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Agent Telemetry</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-500/10 px-2 py-0.5 rounded text-[10px] font-bold text-purple-400 border border-purple-500/20">
              <span className={`w-1.5 h-1.5 rounded-full ${isClassifying ? "bg-amber-400 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
              <span>{isClassifying ? "ANALYZING" : "LIVE"}</span>
            </div>
          </div>

          {/* Core Classifications Stack */}
          <div className="flex flex-col gap-4">
            
            {/* 1. INTENT DETECTOR */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-purple-400" /> Intent Classification
              </span>
              <div className="grid grid-cols-2 gap-1 bg-black/30 p-2 rounded-xl border border-white/5">
                {["Billing", "Technical Issue", "Account", "Refund", "Complaint", "General Inquiry"].map((item) => {
                  const isActive = classification.intent.toLowerCase() === item.toLowerCase() || 
                    (classification.intent.includes("Technical") && item.includes("Technical"));
                  
                  // Accent colors per active intent
                  let badgeStyle = "text-white/30 border-transparent bg-transparent text-[9.5px]";
                  if (isActive) {
                    if (item === "Billing") badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold shadow-md text-[9.5px]";
                    else if (item === "Technical Issue") badgeStyle = "bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold shadow-md text-[9.5px]";
                    else if (item === "Account") badgeStyle = "bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold shadow-md text-[9.5px]";
                    else if (item === "Refund") badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold shadow-md text-[9.5px]";
                    else if (item === "Complaint") badgeStyle = "bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold shadow-md text-[9.5px]";
                    else badgeStyle = "bg-slate-500/20 text-slate-300 border-slate-500/30 font-bold shadow-md text-[9.5px]";
                  }

                  return (
                    <span
                      key={item}
                      className={`px-1.5 py-1 rounded-lg border text-center transition-all ${badgeStyle}`}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 2. SENTIMENT ANALYSIS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                  <Smile className="w-3 h-3 text-purple-400" /> Sentiment
                </span>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between h-[42px]">
                  <span className="text-[10.5px] font-bold text-white">
                    {classification.sentiment}
                  </span>
                  <div>
                    {classification.sentiment.toLowerCase() === "positive" && <Smile className="w-4 h-4 text-emerald-400" />}
                    {classification.sentiment.toLowerCase() === "neutral" && <Meh className="w-4 h-4 text-amber-400" />}
                    {classification.sentiment.toLowerCase() === "negative" && <Frown className="w-4 h-4 text-rose-400" />}
                  </div>
                </div>
              </div>

              {/* 3. PRIORITY DETECTION (URGENCY) */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-purple-400" /> Urgency
                </span>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex flex-col justify-center h-[42px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-white">{classification.urgency}</span>
                    <div className="flex items-center gap-0.5">
                      <span className={`w-2 h-1.5 rounded-sm ${["low", "medium", "high"].includes(classification.urgency.toLowerCase()) ? "bg-blue-400" : "bg-white/10"}`} />
                      <span className={`w-2 h-1.5 rounded-sm ${["medium", "high"].includes(classification.urgency.toLowerCase()) ? "bg-amber-400" : "bg-white/10"}`} />
                      <span className={`w-2 h-1.5 rounded-sm ${["high"].includes(classification.urgency.toLowerCase()) ? "bg-rose-500 animate-pulse" : "bg-white/10"}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. KEY PHRASES */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-purple-400" /> Keywords
              </span>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5 flex flex-wrap gap-1 min-h-[42px] items-center">
                {classification.keyPhrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/80 font-mono"
                  >
                    #{phrase}
                  </span>
                ))}
              </div>
            </div>

            {/* 5. LIVE CO-PILOT EXECUTIVE SUMMARY */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3 text-purple-400" /> Summary
              </span>
              <div className="bg-purple-950/15 border border-purple-500/20 p-3 rounded-xl">
                <p className="text-[10.5px] text-purple-200/90 leading-normal italic select-text">
                  "{classification.summary}"
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SLA and Metrics Dial Panel */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Flame className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quality KPIs</h3>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-white/40">SLA Met</span>
                <strong className="text-base font-bold text-white mt-0.5">99.8%</strong>
              </div>
              <div className="p-2 bg-emerald-500/10 border border-white/5 rounded-lg text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-white/40">Response Speed</span>
                <strong className="text-base font-bold text-white mt-0.5">&lt; 1.2s</strong>
              </div>
              <div className="p-2 bg-purple-500/10 border border-white/5 rounded-lg text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-white/40">Verification</span>
                <strong className="text-base font-bold text-white mt-0.5">Approved</strong>
              </div>
              <div className="p-2 bg-blue-500/10 border border-white/5 rounded-lg text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Column 2-4: Main ChatGPT Terminal Panel */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        
        {/* Title header bar */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-[24px] backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-white/10 rounded-xl text-purple-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">AI Support Co-Pilot</h2>
              <p className="text-xs text-white/40 mt-0.5">Draft client communications, troubleshoot active errors, and research resolutions.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* CSV Export */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:border-purple-500/50 text-white/75 hover:text-white transition-all cursor-pointer"
              title="Export session to CSV (History, class, summary)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            {/* PDF Export */}
            <button
              onClick={exportToPDF}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:border-purple-500/50 text-white/75 hover:text-white transition-all cursor-pointer"
              title="Export session to branded PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export PDF</span>
            </button>

            {/* Markdown Export */}
            <button
              onClick={exportToMarkdown}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:border-purple-500/50 text-white/75 hover:text-white transition-all cursor-pointer"
              title="Export session to Markdown (.md)"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Export MD</span>
            </button>

            {/* JSON Export */}
            <button
              onClick={exportToJSON}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:border-purple-500/50 text-white/75 hover:text-white transition-all cursor-pointer"
              title="Export complete session history to JSON"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">JSON</span>
            </button>

            <div className="h-5 w-[1px] bg-white/10 mx-1 hidden sm:block" />

            {/* Clear/Reset button */}
            <button
              onClick={clearChat}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-30"
              title="Clear all messages and telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Dynamic Chat Dialog Box */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] backdrop-blur-md h-[550px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Chat Feed Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 relative z-10 scrollbar-thin scroll-smooth"
            id="chat-messages-container"
          >
            {messages.map((m, index) => {
              const isUser = m.role === "user";
              const isLatestAssistant = !isUser && index === messages.length - 1;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3.5 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
                >
                  <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow border
                    ${isUser 
                      ? "bg-gradient-to-tr from-purple-500 to-blue-500 text-white border-white/20" 
                      : "bg-black/40 border-white/10 text-purple-400"
                    }
                  `}>
                    {isUser ? "ME" : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className={`p-4 rounded-2xl text-xs shadow-md transition-all
                      ${isUser
                        ? "bg-purple-600/20 text-purple-100 border border-purple-500/30 rounded-tr-none"
                        : "bg-black/30 text-white border border-white/10 rounded-tl-none"
                      }
                    `}>
                      {renderMessageContent(m.content, m.isStreaming)}
                    </div>
                    
                    <div className={`flex items-center gap-3.5 text-[9.5px] text-white/30 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
                      <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {!isUser && m.content.trim() && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(m.content, index)}
                            className="hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                            title="Copy response to clipboard"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {isLatestAssistant && !isLoading && (
                            <button
                              onClick={handleRegenerate}
                              className="hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                              title="Regenerate this response"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* General Thinking Indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-3.5 self-start" id="ai-thinking-state">
                <div className="w-8.5 h-8.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-purple-400 shadow animate-pulse">
                  <Bot className="w-4 h-4 animate-pulse text-purple-400" />
                </div>
                <div className="bg-black/30 border border-white/10 px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-white/50 ml-1.5 font-medium transition-all duration-300 animate-pulse">{thinkingStatus}</span>
                </div>
              </div>
            )}

            {/* Dynamic Follow-Up Questions Pill Buttons */}
            {!isLoading && dynamicFollowUps.length > 0 && (
              <div className="flex flex-col gap-2 animate-fade-in mt-1 mb-2 px-1">
                <div className="flex items-center gap-1.5 text-[10px] text-purple-400/85 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>Suggested Next Questions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dynamicFollowUps.map((question, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSend(question)}
                      className="px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-400/50 text-[11px] text-purple-200 transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 self-center max-w-md my-2 shadow-lg animate-fade-in" id="chat-error-banner">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                  <p>{error}</p>
                </div>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/30 text-[10.5px] font-bold text-rose-200 rounded-lg transition-all cursor-pointer self-end sm:self-auto shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Request</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Inputs & Preset Chips */}
          <div className="p-4 bg-black/30 border-t border-white/10 relative z-10 flex flex-col gap-4">
            
            {/* Categorized suggestions tabs and lists */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Suggested Co-Pilot Inquiries</span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                  {(["diagnostics", "customer_care", "troubleshooting"] as SuggestedCategory[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-all
                        ${activeTab === tab 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-white/40 hover:text-white/60"
                        }
                      `}
                    >
                      {tab.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions chips matching active category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {suggestedQuestions[activeTab].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.text)}
                    disabled={isLoading}
                    className="p-2 text-left rounded-xl bg-white/5 border border-white/5 text-xs text-white/80 hover:text-white hover:border-purple-500/50 hover:bg-white/10 transition-all disabled:opacity-50 flex flex-col gap-0.5 cursor-pointer"
                  >
                    <span className="font-semibold text-purple-300 truncate text-[10.5px]">{item.label}</span>
                    <span className="text-[9.5px] text-white/40 truncate">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
              id="support-chat-input-form"
            >
              <input
                type="text"
                placeholder="Instruct the Support Pilot to solve issues or draft apologies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium hover:bg-rose-500/30 hover:text-rose-100 transition-all cursor-pointer shrink-0 animate-pulse flex items-center justify-center"
                  title="Stop generation button"
                >
                  <Square className="w-4 h-4 fill-rose-400/50" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white font-medium hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
