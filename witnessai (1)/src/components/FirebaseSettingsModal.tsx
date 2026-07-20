import React, { useState, useEffect } from "react";
import { isRealFirebase } from "../lib/firebase";
import { Shield, Database, Save, Info, RefreshCw, Key, Globe, LayoutGrid, Cpu, CheckCircle } from "lucide-react";

interface FirebaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export function FirebaseSettingsModal({ isOpen, onClose, onConfigSaved }: FirebaseSettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [messagingSenderId, setMessagingSenderId] = useState("");
  const [appId, setAppId] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load config values from localStorage or environment variables
    setApiKey(localStorage.getItem("witness_firebase_apiKey") || (import.meta as any).env.VITE_FIREBASE_API_KEY || "");
    setAuthDomain(localStorage.getItem("witness_firebase_authDomain") || (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "");
    setProjectId(localStorage.getItem("witness_firebase_projectId") || (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "");
    setStorageBucket(localStorage.getItem("witness_firebase_storageBucket") || (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "");
    setMessagingSenderId(localStorage.getItem("witness_firebase_messagingSenderId") || (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "");
    setAppId(localStorage.getItem("witness_firebase_appId") || (import.meta as any).env.VITE_FIREBASE_APP_ID || "");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem("witness_firebase_apiKey", apiKey.trim());
    localStorage.setItem("witness_firebase_authDomain", authDomain.trim());
    localStorage.setItem("witness_firebase_projectId", projectId.trim());
    localStorage.setItem("witness_firebase_storageBucket", storageBucket.trim());
    localStorage.setItem("witness_firebase_messagingSenderId", messagingSenderId.trim());
    localStorage.setItem("witness_firebase_appId", appId.trim());
    
    setIsSaved(true);
    onConfigSaved();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      // Reload the browser window to initialize Firebase with the new configuration
      window.location.reload();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem("witness_firebase_apiKey");
    localStorage.removeItem("witness_firebase_authDomain");
    localStorage.removeItem("witness_firebase_projectId");
    localStorage.removeItem("witness_firebase_storageBucket");
    localStorage.removeItem("witness_firebase_messagingSenderId");
    localStorage.removeItem("witness_firebase_appId");
    
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#040407]/80 backdrop-blur-lg" 
        onClick={onClose}
      />

      {/* Settings Card */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0c0c12] to-[#07070a] border border-white/5 rounded-3xl p-8 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-white/5 pb-5 mb-6 relative">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">DATABASE CONNECTIVITY ENGINE</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Configure your real Firebase Firestore database</p>
          </div>
        </div>

        {/* Current status info */}
        <div className="mb-6 p-4 bg-[#0e0e15] border border-white/5 rounded-2xl flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div className="text-xs font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span>ACTIVE SYSTEM STATE:</span>
              <span className={isRealFirebase ? "text-green-400" : "text-amber-400"}>
                {isRealFirebase ? "● CLOUD FIRESTORE ACTIVE" : "● LOCAL INTERACTIVE EMULATOR"}
              </span>
            </div>
            <p className="text-zinc-500 leading-normal">
              {isRealFirebase 
                ? "WitnessAI is actively transmitting audit logs, telemetry, and policy tables to your live cloud-hosted Firestore project."
                : "WitnessAI is isolated in local sandbox storage. To connect with a live cloud environment, register your Firebase API credentials below."}
            </p>
          </div>
        </div>

        {isSaved ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400">
              <CheckCircle className="w-6 h-6 animate-bounce" />
            </div>
            <p className="text-xs font-mono text-green-400 uppercase tracking-wider">SAVING & REINITIALIZING FIREBASE ENGINE...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3 h-3" /> API Key (apiKey)
                </label>
                <input
                  type="text"
                  placeholder="AIzaSyA1..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#0e0e15] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Auth Domain
                </label>
                <input
                  type="text"
                  placeholder="my-app.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full bg-[#0e0e15] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3 h-3" /> Project ID (projectId)
                </label>
                <input
                  type="text"
                  placeholder="my-firebase-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-[#0e0e15] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" /> App ID (appId)
                </label>
                <input
                  type="text"
                  placeholder="1:92348:web:7a627"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full bg-[#0e0e15] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Storage Bucket</label>
                <input
                  type="text"
                  placeholder="my-app.appspot.com"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  className="w-full bg-[#0e0e15] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Messaging Sender ID</label>
                <input
                  type="text"
                  placeholder="1029384756"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  className="w-full bg-[#0e0e15] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-6">
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer"
              >
                RESET CONNECTION PARAMETERS
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 border border-cyan-500/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(6,182,212,0.15)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  APPLY CONNECTION
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
