import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Analytics } from "./components/Analytics";
import { Playground } from "./components/Playground";
import { Policies } from "./components/Policies";
import { SupportCoPilot } from "./components/SupportCoPilot";
import { Policy, AuditLog, AnalyticsData } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { AuthModal } from "./components/AuthModal";
import { FirebaseSettingsModal } from "./components/FirebaseSettingsModal";
import { 
  auth as realAuth, 
  simulatedAuth, 
  isRealFirebase 
} from "./lib/firebase";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "playground" | "policies">("dashboard");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPrompts: 0,
    totalBlocked: 0,
    totalPII: 0,
    riskDistribution: { Low: 0, Medium: 0, High: 0, Critical: 0 },
    piiCategories: {},
    logs: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(true);

  // Authentication & Database Configuration State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dbSettingsModalOpen, setDbSettingsModalOpen] = useState(false);

  // Theme Toggle state for compliance/accessibility
  const [theme, setTheme] = useState<"dark" | "compliance">(() => {
    return (localStorage.getItem("witness-theme") as "dark" | "compliance") || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "compliance") {
      root.classList.add("theme-compliance");
    } else {
      root.classList.remove("theme-compliance");
    }
    localStorage.setItem("witness-theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === "dark" ? "compliance" : "dark");
  };

  // Sync Auth State Change
  useEffect(() => {
    const authProvider = isRealFirebase ? realAuth : simulatedAuth;
    const unsubscribe = authProvider.onAuthStateChanged((user: any) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const authProvider = isRealFirebase ? realAuth : simulatedAuth;
      await authProvider.signOut();
      setCurrentUser(null);
    } catch (err) {
      console.error("[WitnessAI Client] Sign out failed:", err);
    }
  };

  // Fetch initial telemetry on mount
  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const [policiesRes, analyticsRes] = await Promise.all([
        fetch("/api/policies"),
        fetch("/api/analytics")
      ]);

      if (policiesRes.ok && analyticsRes.ok) {
        const policiesData = await policiesRes.json();
        const analyticsData = await analyticsRes.json();
        setPolicies(policiesData);
        setAnalyticsData(analyticsData);
        setApiConnected(true);
      } else {
        setApiConnected(false);
      }
    } catch (err) {
      console.error("[WitnessAI Client] Telemetry load failed:", err);
      setApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Handler: Toggle/update security policy
  const handleTogglePolicy = async (id: string, enabled: boolean, matchPattern?: string) => {
    try {
      const response = await fetch("/api/policies/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled, matchPattern })
      });

      if (response.ok) {
        // Optimistic / clean state update
        setPolicies(prev => prev.map(p => {
          if (p.id === id) {
            return { 
              ...p, 
              enabled: enabled !== undefined ? enabled : p.enabled,
              matchPattern: matchPattern !== undefined ? matchPattern : p.matchPattern
            };
          }
          return p;
        }));
        
        // Refresh analytics in case risk calculation changed
        const analyticsRes = await fetch("/api/analytics");
        if (analyticsRes.ok) {
          setAnalyticsData(await analyticsRes.json());
        }
      }
    } catch (err) {
      console.error("[WitnessAI Client] Policy update failed:", err);
    }
  };

  // Handler: Dispatch message to secure gateway
  const handleSendMessage = async (prompt: string, user: string) => {
    try {
      const response = await fetch("/api/gateway/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, user: currentUser ? currentUser.email : user })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update analytics state immediately
        const analyticsRes = await fetch("/api/analytics");
        if (analyticsRes.ok) {
          setAnalyticsData(await analyticsRes.json());
        }
        
        return result;
      }
    } catch (err) {
      console.error("[WitnessAI Client] Gateway transmission failed:", err);
    }
    return null;
  };

  // Handler: Reset logs to baseline seeds
  const handleResetLogs = async () => {
    try {
      const response = await fetch("/api/logs/reset", { method: "POST" });
      if (response.ok) {
        const result = await response.json();
        setAnalyticsData(prev => ({
          ...prev,
          logs: result.logs,
          totalPrompts: result.logs.length,
          totalBlocked: result.logs.filter((l: any) => l.isBlocked).length,
          totalPII: result.logs.reduce((acc: number, curr: any) => acc + curr.piiDetected.reduce((sum: number, p: any) => sum + p.count, 0), 0)
        }));
        fetchTelemetry(); // trigger complete recalculation
      }
    } catch (err) {
      console.error("[WitnessAI Client] Logs reset failed:", err);
    }
  };

  // Dynamic Defense Security Score calculation:
  // Starts at 100%. Subtracts 5% for disabled core policies, adds 10% for custom keyword lists.
  const securityScore = (() => {
    if (policies.length === 0) return 90;
    const totalCount = policies.length;
    const enabledCount = policies.filter(p => p.enabled).length;
    let score = Math.round((enabledCount / totalCount) * 100);
    
    // Core critical policies disabled penalty
    const criticalDisabled = policies.some(p => p.severity === "critical" && !p.enabled);
    if (criticalDisabled) score -= 10;
    
    // Custom keyword list benefit
    const customKeyword = policies.find(p => p.id === "custom-keyword");
    if (customKeyword?.enabled && customKeyword.matchPattern && customKeyword.matchPattern.length > 10) {
      score += 5;
    }

    return Math.min(Math.max(score, 20), 100);
  })();

  return (
    <div className={`relative min-h-screen selection:bg-accent/40 pt-28 pb-12 overflow-x-hidden transition-colors duration-300 ${
      theme === "compliance" ? "bg-white text-slate-950 theme-compliance" : "bg-[#040407] text-white"
    }`}>
      {/* Mesh Background */}
      {theme === "dark" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black -z-10" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />
        </>
      )}

      {/* Background Decorative Glow Spots */}
      {theme === "dark" && (
        <div className="fixed inset-0 pointer-events-none -z-20">
          <div className="absolute top-[10%] left-[25%] w-[450px] h-[450px] bg-accent/5 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] bg-blue-500/5 rounded-full blur-[160px]" />
        </div>
      )}

      {/* Navbar Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        securityScore={securityScore} 
        apiConnected={apiConnected}
        currentUser={currentUser}
        isRealFirebase={isRealFirebase}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSettings={() => setDbSettingsModalOpen(true)}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Auth Modal Overlay */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          fetchTelemetry(); // reload context
        }}
      />

      {/* Firebase / Cloud SQL Settings Config Modal */}
      <FirebaseSettingsModal 
        isOpen={dbSettingsModalOpen}
        onClose={() => setDbSettingsModalOpen(false)}
        onConfigSaved={() => {
          fetchTelemetry();
        }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <AnimatePresence mode="wait">
          {isLoading && policies.length === 0 ? (
            <motion.div 
              key="loading-shell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-secondary tracking-widest uppercase">Initializing WitnessAI Secure Gateway...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {activeTab === "dashboard" && (
                <Analytics 
                  data={analyticsData}
                  onResetLogs={handleResetLogs}
                  onRefresh={fetchTelemetry}
                  isLoading={isLoading}
                />
              )}

              {activeTab === "playground" && (
                <Playground 
                  onSendMessage={handleSendMessage}
                />
              )}

              {activeTab === "policies" && (
                <Policies 
                  policies={policies}
                  onTogglePolicy={handleTogglePolicy}
                  isLoading={isLoading}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Support & Help Guide Chatbot */}
      <SupportCoPilot theme={theme} />
    </div>
  );
}
