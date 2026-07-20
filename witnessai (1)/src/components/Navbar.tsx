import React from "react";
import { Shield, Radio, Activity, Terminal, Database, LogOut, User, Key, Sun, Moon } from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "playground" | "policies";
  setActiveTab: (tab: "dashboard" | "playground" | "policies") => void;
  securityScore: number;
  apiConnected: boolean;
  currentUser: any | null;
  isRealFirebase: boolean;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  theme: "dark" | "compliance";
  onToggleTheme: () => void;
}

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  securityScore, 
  apiConnected, 
  currentUser, 
  isRealFirebase,
  onOpenAuth,
  onOpenSettings,
  onSignOut,
  theme,
  onToggleTheme
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-center text-accent shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Shield className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight font-display text-white">WITNESS</span>
              <span className="px-1.5 py-0.5 bg-accent/20 border border-accent/30 rounded text-[10px] font-mono text-accent font-semibold tracking-wider">AI</span>
            </div>
            <p className="text-[10px] font-mono text-secondary tracking-widest uppercase">Safe AI Enablement</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-1.5 bg-[#0f0f15]/80 p-1 border border-white/5 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-accent/15 text-accent border border-accent/20 shadow-[0_2px_8px_rgba(59,130,246,0.1)]"
                : "text-secondary hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              SecOps Dashboard
            </span>
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
              activeTab === "playground"
                ? "bg-accent/15 text-accent border border-accent/20 shadow-[0_2px_8px_rgba(59,130,246,0.1)]"
                : "text-secondary hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Secure Gateway Playground
            </span>
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
              activeTab === "policies"
                ? "bg-accent/15 text-accent border border-accent/20 shadow-[0_2px_8px_rgba(59,130,246,0.1)]"
                : "text-secondary hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Active Policies
            </span>
          </button>
        </div>

        {/* Threat Status & Auth Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono shrink-0">
          {/* Database Setup Button */}
          <button 
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-all cursor-pointer ${
              isRealFirebase 
                ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20" 
                : "bg-zinc-500/5 border-white/5 text-zinc-400 hover:border-white/15 hover:text-white"
            }`}
            title="Configure Database Connection"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">
              {isRealFirebase ? "FIRESTORE: CLOUD" : "LOCAL DB CONNECT"}
            </span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f0f15] border border-white/5 rounded-lg">
            <span className="text-secondary text-[11px]">DEFENSE SCORE:</span>
            <span className={`font-bold ${securityScore >= 90 ? "text-green-400" : "text-yellow-400"}`}>
              {securityScore}%
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-all cursor-pointer ${
              theme === "compliance"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold shadow-[0_2px_8px_rgba(217,119,6,0.15)]"
                : "bg-zinc-500/5 border-white/5 text-zinc-400 hover:border-white/15 hover:text-white"
            }`}
            title={theme === "compliance" ? "Switch to Dark Mode" : "Switch to Accessibility Compliance Light Mode"}
          >
            {theme === "compliance" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px]">COMPLIANCE LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-[11px]">DARK MODE</span>
              </>
            )}
          </button>

          {/* Authentication System */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-[#0e0e15] border border-white/5 rounded-xl pl-2.5 pr-1.5 py-1">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || "Operator"} 
                  className="w-5.5 h-5.5 rounded-lg border border-white/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5.5 h-5.5 bg-accent/15 border border-accent/20 rounded-lg flex items-center justify-center text-accent">
                  <User className="w-3 h-3" />
                </div>
              )}
              <div className="flex flex-col text-left max-w-28 truncate">
                <span className="text-[10px] font-bold text-white leading-tight truncate">
                  {currentUser.displayName || "Operator"}
                </span>
                <span className="text-[8px] text-zinc-500 font-mono tracking-wider uppercase truncate">
                  {currentUser.providerId === "google.com" ? "CLOUD ID" : "ENROLLED"}
                </span>
              </div>
              <button 
                onClick={onSignOut}
                className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                title="De-authorize Identity"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent hover:text-white rounded-lg transition-all cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.1)]"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tracking-wide">SECURE IDENTITY</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
