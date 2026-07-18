import { useState } from "react";
import { AppSettings } from "../types";
import { showToast } from "../components/ToastContainer";
import { 
  Settings as SettingsIcon, 
  Bot, 
  Cpu, 
  Volume2, 
  Paintbrush, 
  Check, 
  Sliders,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  Monitor,
  Globe,
  Trash2,
  RotateCcw,
  MessageSquare
} from "lucide-react";

interface SettingsPageProps {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export default function SettingsPage({ settings, updateSettings }: SettingsPageProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    showToast(msg, "success");
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const colors = [
    { name: "Neon Violet", value: "from-indigo-500 to-purple-600", border: "border-indigo-500" },
    { name: "Cosmic Emerald", value: "from-teal-500 to-emerald-600", border: "border-teal-500" },
    { name: "Sunset Crimson", value: "from-rose-500 to-amber-500", border: "border-rose-500" },
  ];

  const models = [
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", desc: "SupportPilot Default. Fast, balanced, highly recommended." },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Latest ultra-fast model for simple diagnostics." },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Maximum intelligence and reasoning for complex errors." },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", desc: "Legacy flash model with standard behavior." },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", desc: "Legacy pro model with comprehensive insights." },
  ];

  const languages = [
    "English", "Spanish", "French", "German", "Japanese", "Chinese", "Portuguese", "Italian", "Korean", "Hindi"
  ];

  const handleClearHistory = async () => {
    // Clear all local storage keys
    localStorage.removeItem("supportpilot_chat_history");
    localStorage.removeItem("supportpilot_recent_searches");
    localStorage.removeItem("supportpilot_analytics_history");
    localStorage.removeItem("supportpilot_ticket_summaries");
    localStorage.removeItem("supportpilot_tickets");
    localStorage.removeItem("supportpilot_kb_articles");
    
    // Call server API
    try {
      await fetch("/api/chat/clear", { method: "POST" });
    } catch (e) {
      console.error("Failed to clear server chat history cache:", e);
    }

    // Force reload the state or clear locally so that if we navigate to ChatPage it starts clean
    triggerNotification("All local databases, searches, and summaries cleared successfully!");
  };

  const handleResetSettings = () => {
    const defaultSettings: AppSettings = {
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
    updateSettings(defaultSettings);
    triggerNotification("Settings have been reset to default parameters!");
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full max-w-4xl mx-auto animate-fade-in" id="settings-view">
      
      {/* Header Panel */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-white/10 rounded-xl text-purple-400">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Settings</h2>
            <p className="text-xs text-white/40 mt-0.5">Configure personalization parameters, LLM thresholds, and visual modes.</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 rounded-xl flex items-center gap-2 animate-fade-in self-start sm:self-auto">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Parameters & AI Model selection */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* AI Model Selector */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-purple-400" /> Generative AI Model Selector
            </h3>
            <p className="text-xs text-white/40">Choose the cognitive model that processes chat requests and draft automation.</p>
            
            <div className="flex flex-col gap-2.5 mt-1">
              {models.map((model) => {
                const isActive = settings.modelSelection === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      updateSettings({ modelSelection: model.id });
                      triggerNotification(`Model set to ${model.name}`);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200
                      ${isActive
                        ? "bg-purple-500/10 border-purple-500/40 text-white shadow"
                        : "bg-black/30 border-white/5 text-white/60 hover:border-white/10"
                      }
                    `}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        {model.name}
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
                      </span>
                      <span className="text-[10px] text-white/40">{model.desc}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                      ${isActive ? "border-purple-500 bg-purple-500/20" : "border-white/10"}
                    `}>
                      {isActive && <Check className="w-3 h-3 text-purple-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response Length & Language Selector */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-5 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-purple-400" /> Language & Tone Parameters
            </h3>
            
            {/* Response Length Slider/Pills */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/95">Target Response Length</label>
              <p className="text-[10px] text-white/40">Guide how detailed the assistant's replies should be.</p>
              
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {(["short", "medium", "long"] as const).map((len) => {
                  const isActive = settings.responseLength === len;
                  return (
                    <button
                      key={len}
                      onClick={() => {
                        updateSettings({ responseLength: len });
                        triggerNotification(`Response length set to ${len}`);
                      }}
                      className={`py-2 rounded-xl border text-xs capitalize font-bold transition-all duration-200 cursor-pointer
                        ${isActive
                          ? "bg-purple-500/10 border-purple-500/40 text-white shadow"
                          : "bg-black/30 border-white/5 text-white/50 hover:border-white/10"
                        }
                      `}
                    >
                      {len}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Language Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/95 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-400" /> Preferred Support Language
              </label>
              <p className="text-[10px] text-white/40">Select the language that SupportPilot should compose replies in.</p>
              
              <div className="relative mt-1">
                <select
                  value={settings.language}
                  onChange={(e) => {
                    updateSettings({ language: e.target.value });
                    triggerNotification(`Preferred language set to ${e.target.value}`);
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:border-purple-500/60 focus:outline-none appearance-none cursor-pointer"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang} className="bg-[#0f172a] text-white">
                      {lang}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/30">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance & System Actions */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-rose-400">
              <Trash2 className="w-4.5 h-4.5" /> Maintenance & Actions
            </h3>
            <p className="text-xs text-white/40">Perform database operations, clear diagnostic caches, or reset global layouts.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-1.5">
              
              {/* Clear History Button */}
              <button
                onClick={handleClearHistory}
                className="p-3.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 transition-all text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 group-hover:scale-105 transition-transform" />
                <span>Clear Chat History</span>
              </button>

              {/* Reset Settings Button */}
              <button
                onClick={handleResetSettings}
                className="p-3.5 rounded-xl border border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 transition-all text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>Reset Settings</span>
              </button>

            </div>
          </div>

        </div>

        {/* Right column: Themes, credentials, and UI customizations */}
        <div className="flex flex-col gap-6">
          
          {/* Theme Switch Section */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-4.5 h-4.5 text-purple-400" /> Visual Interface Theme
            </h3>
            <p className="text-xs text-white/40">Switch between dark, light, or system matching theme views.</p>
            
            <div className="flex flex-col gap-2 mt-1">
              {[
                { id: "dark", label: "Dark Theme", icon: Moon, desc: "Classic starry neon slate style" },
                { id: "light", label: "Light Theme", icon: Sun, desc: "High-contrast clean workspace" },
                { id: "system", label: "System Default", icon: Monitor, desc: "Adapts to operating system" }
              ].map((themeOpt) => {
                const isActive = settings.themeMode === themeOpt.id;
                const Icon = themeOpt.icon;
                return (
                  <button
                    key={themeOpt.id}
                    onClick={() => {
                      updateSettings({ themeMode: themeOpt.id as any });
                      triggerNotification(`Theme set to ${themeOpt.label}`);
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left w-full cursor-pointer
                      ${isActive
                        ? "border-purple-500 bg-purple-500/10 text-white"
                        : "border-white/5 bg-black/20 text-white/60 hover:border-white/10"
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/40"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{themeOpt.label}</span>
                      <span className="text-[9.5px] text-white/40">{themeOpt.desc}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-purple-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workspace Accent Theme Selection */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Paintbrush className="w-4.5 h-4.5 text-purple-400" /> UI Workspace Glow
            </h3>
            <p className="text-xs text-white/40">Set custom gradient backgrounds and lighting styles.</p>
            
            <div className="flex flex-col gap-2.5 mt-1">
              {colors.map((color, idx) => {
                const isActive = settings.themeColor === color.value;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      updateSettings({ themeColor: color.value });
                      triggerNotification(`Workspace accent color updated!`);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium text-white/70 transition-all cursor-pointer
                      ${isActive
                        ? `${color.border} bg-white/10 text-white shadow-inner`
                        : "border-white/5 bg-black/20 hover:border-white/10"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${color.value} shadow`} />
                      <span>{color.name}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure API Key credentials indicator */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-md flex flex-col gap-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Security Credentials</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-[11px] leading-relaxed text-white/70 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="font-semibold text-white/90">Gemini Key</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 animate-pulse" /> Active
                </span>
              </div>
              <p>
                Your Google GenAI SDK credentials are loaded securely server-side from environment variables.
              </p>
              <code className="text-[10px] bg-black/40 p-2 rounded text-white/40 font-mono select-none block text-center truncate">
                process.env.GEMINI_API_KEY
              </code>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
