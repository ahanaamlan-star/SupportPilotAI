import { useState, useEffect, useRef } from "react";
import { Bot, Sparkles, X, Send, CornerDownLeft, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("supportpilot_floating_chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse floating chat storage", e);
      }
    }
    return [
      {
        role: "assistant",
        content: "Hi there! I'm your SupportPilot Quick-Copilot. ⚡ Ask me anything about system outages, SLA policies, SAML redirect loops, or draft rapid email updates!",
        timestamp: new Date()
      }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("supportpilot_floating_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    setIsLoading(true);

    // Add streaming placeholder
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true
      }
    ]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content
          })),
          context: "Floating Assistant Widget",
          modelSelection: "gemini-3.5-flash",
          responseLength: "short",
          language: "English"
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming body not accessible.");
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
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant" && last.isStreaming) {
                    last.content = accumulatedText;
                  }
                  return copy;
                });
              }
            } catch (e) {
              console.error("Stream parse error", e);
            }
          }
        }
      }

      // Mark streaming completed
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant" && last.isStreaming) {
          last.isStreaming = false;
        }
        return copy;
      });

    } catch (err: any) {
      console.error("Streaming failed", err);
      setError(err?.message || "An error occurred during assistance.");
      // Remove placeholder on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Let's start fresh. How can I speed up your support workflows right now? ⚡",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="floating-ai-assistant">
      {/* Assistant Card / Panel */}
      {isOpen && (
        <div 
          ref={containerRef}
          className="w-[360px] sm:w-[400px] h-[520px] bg-slate-900/95 border border-white/10 rounded-[24px] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden mb-4 transition-all duration-300 animate-fade-in"
          id="assistant-chat-panel"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-between border-b border-white/10 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-30" />
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="p-1.5 bg-white/10 rounded-xl border border-white/20 animate-pulse">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-white/70">Co-Pilot</h3>
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
                  Instant Pilot-Assist <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 relative z-10">
              <button 
                onClick={clearChat}
                className="text-[10px] font-bold uppercase text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                Reset
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin bg-slate-950/20">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}
              >
                <div 
                  className={`p-3 rounded-[16px] text-xs leading-relaxed transition-all duration-200 ${
                    m.role === "user" 
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-tr-none shadow-md" 
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 rounded-tl-none"
                  }`}
                >
                  {/* Streaming Skeleton Indicator */}
                  {m.role === "assistant" && m.isStreaming && !m.content && (
                    <div className="flex flex-col gap-2 w-48 py-1">
                      <div className="h-2 w-full bg-white/10 rounded animate-pulse" />
                      <div className="h-2 w-5/6 bg-white/10 rounded animate-pulse" />
                      <div className="h-2 w-4/6 bg-white/10 rounded animate-pulse" />
                    </div>
                  )}
                  {m.content}
                </div>
                <span className="text-[9px] text-white/30 font-mono mt-1 px-1">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Footer */}
          <div className="p-3 bg-black/40 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask for advice, email templates, summaries..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSend();
                }
              }}
              className="flex-1 bg-slate-950/80 border border-white/5 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-gradient-to-tr from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl border border-white/10 text-white shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Interactive Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-4 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 hover:scale-110 active:scale-95 text-white shadow-2xl border border-white/20 transition-all duration-300 group flex items-center justify-center cursor-pointer overflow-hidden ${
          isOpen ? "rotate-90 ring-4 ring-indigo-500/30" : "hover:shadow-purple-500/25"
        }`}
        title="Open Quick Pilot Assistant"
      >
        {/* Glow halo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 text-white group-hover:scale-105 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}
