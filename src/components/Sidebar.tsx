import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  BookOpen, 
  BarChart3, 
  Settings as SettingsIcon, 
  Menu, 
  X,
  Compass,
  UserCheck
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "AI Support Chat", path: "/chat", icon: Bot },
    { name: "Ticket Summary", path: "/tickets", icon: FileText },
    { name: "Knowledge Base", path: "/kb", icon: BookOpen },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-indigo-400 hover:text-indigo-300 focus:outline-none backdrop-blur-md transition-all shadow-lg"
        id="mobile-sidebar-toggle"
        aria-label="Toggle Navigation Sidebar"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
          id="sidebar-mobile-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 border-r border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between p-5
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        id="sidebar-container"
      >
        <div className="flex flex-col gap-8 w-full">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mt-10 lg:mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/40 rounded-xl blur-md" />
              <div className="relative p-2.5 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl border border-white/20 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Compass className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                SupportPilot
              </h1>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                AI Agent v1.2
              </span>
            </div>
          </div>
 
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 w-full">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative
                    ${isActive 
                      ? "bg-white/10 text-white border border-white/10 shadow-lg" 
                      : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                    }
                  `}
                  id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 
                    ${isActive ? "text-white opacity-100" : "opacity-60 group-hover:opacity-100"}
                  `} />
                  
                  <span className="text-[14px]">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Pro Plan Tokens & User Card */}
        <div className="flex flex-col gap-4">
          {/* Pro Plan Usage Tracker */}
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">Pro Plan</p>
            <p className="text-xs text-white/70 mb-3">2.4k / 5k AI tokens used</p>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[48%] bg-gradient-to-r from-purple-500 to-blue-400"></div>
            </div>
          </div>

          {/* Current User Info */}
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center font-bold text-white text-sm shadow-md">
                AH
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white/90 truncate">Ahana Amlan</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Lead Ops Specialist</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
