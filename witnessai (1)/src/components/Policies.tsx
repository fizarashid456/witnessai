import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, EyeOff, ShieldAlert, CheckCircle2, AlertOctagon, 
  HelpCircle, ToggleLeft, ToggleRight, Save, Info, RefreshCw
} from "lucide-react";
import { Policy } from "../types";

interface PolicyCardProps {
  key?: string;
  policy: Policy;
  onToggle: (policy: Policy) => any;
  isLoading: boolean;
  getSeverityBadge: (level: string) => any;
  activeColorClass: string;
  toggleIconColor: string;
}

function PolicyCard3D({ policy, onToggle, isLoading, getSeverityBadge, activeColorClass, toggleIconColor }: PolicyCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(-y * 12); // max 12 degree tilt
    setRotateY(x * 12);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const ToggleIcon = policy.enabled ? ToggleRight : ToggleLeft;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      className={`p-4 bg-[#0f0f15] border rounded-xl transition-all flex flex-col justify-between h-40 tilt-card-transition cursor-default ${
        policy.enabled 
          ? `border-${activeColorClass}-500/20 shadow-[0_8px_20px_rgba(0,0,0,0.4)]` 
          : "border-white/5 opacity-60 hover:opacity-80"
      }`}
    >
      <div className="preserve-3d" style={{ transform: "translateZ(20px)" }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-white font-mono">{policy.name}</span>
          {getSeverityBadge(policy.severity)}
        </div>
        <p className="text-[11px] text-secondary leading-relaxed font-mono">
          {policy.description}
        </p>
      </div>

      <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3 preserve-3d" style={{ transform: "translateZ(30px)" }}>
        <span className="text-[10px] font-mono text-zinc-500">
          STATUS: {policy.enabled ? "ACTIVE GUARD" : "DISABLED"}
        </span>
        <button
          onClick={() => onToggle(policy)}
          disabled={isLoading}
          className="text-secondary hover:text-white transition-colors cursor-pointer"
        >
          <ToggleIcon className={`w-8 h-8 ${policy.enabled ? toggleIconColor : "text-zinc-600"}`} />
        </button>
      </div>
    </div>
  );
}

interface PoliciesProps {
  policies: Policy[];
  onTogglePolicy: (id: string, enabled: boolean, matchPattern?: string) => Promise<void>;
  isLoading: boolean;
}

export function Policies({ policies, onTogglePolicy, isLoading }: PoliciesProps) {
  const [customKeywords, setCustomKeywords] = useState("");
  const [isSavingKeywords, setIsSavingKeywords] = useState(false);

  // Initialize keywords from active policy
  useEffect(() => {
    const customKeywordPolicy = policies.find(p => p.id === "custom-keyword");
    if (customKeywordPolicy?.matchPattern) {
      setCustomKeywords(customKeywordPolicy.matchPattern);
    }
  }, [policies]);

  const handleToggle = async (policy: Policy) => {
    await onTogglePolicy(policy.id, !policy.enabled);
  };

  const handleSaveKeywords = async () => {
    setIsSavingKeywords(true);
    try {
      await onTogglePolicy("custom-keyword", true, customKeywords);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingKeywords(false);
    }
  };

  // Group policies by category
  const categorized = {
    dlp: policies.filter(p => p.category === "dlp"),
    safety: policies.filter(p => p.category === "safety"),
    compliance: policies.filter(p => p.category === "compliance")
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case "critical":
        return <span className="text-[9px] font-mono font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded border border-red-500/25 uppercase">CRITICAL DEFENSE</span>;
      case "high":
        return <span className="text-[9px] font-mono font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 uppercase">HIGH FOCUS</span>;
      case "medium":
        return <span className="text-[9px] font-mono font-bold bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 uppercase">MODERATE</span>;
      default:
        return <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">LOW AUDIT</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "dlp":
        return <EyeOff className="w-5 h-5 text-yellow-400" />;
      case "safety":
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-accent" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">SecOps Guardrail Policy Manager</h2>
          <p className="text-sm text-secondary">Toggle DLP decoders, injection blockades, and intellectual property protection layers on the secure API.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Policies Panel (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Group 1: DLP */}
          <div className="bg-[#0b0b10] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              {getCategoryIcon("dlp")} Data Loss Prevention (DLP) Guardrails
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorized.dlp.map((policy) => (
                <PolicyCard3D
                  key={policy.id}
                  policy={policy}
                  onToggle={handleToggle}
                  isLoading={isLoading}
                  getSeverityBadge={getSeverityBadge}
                  activeColorClass="yellow"
                  toggleIconColor="text-yellow-500"
                />
              ))}
            </div>
          </div>

          {/* Group 2: Safety */}
          <div className="bg-[#0b0b10] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              {getCategoryIcon("safety")} AI Alignment & Safety Guardrails
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorized.safety.map((policy) => (
                <PolicyCard3D
                  key={policy.id}
                  policy={policy}
                  onToggle={handleToggle}
                  isLoading={isLoading}
                  getSeverityBadge={getSeverityBadge}
                  activeColorClass="red"
                  toggleIconColor="text-red-500"
                />
              ))}
            </div>
          </div>

          {/* Group 3: Compliance */}
          <div className="bg-[#0b0b10] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              {getCategoryIcon("compliance")} Corporate Compliance Guardrails
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorized.compliance.map((policy) => (
                <PolicyCard3D
                  key={policy.id}
                  policy={policy}
                  onToggle={handleToggle}
                  isLoading={isLoading}
                  getSeverityBadge={getSeverityBadge}
                  activeColorClass="blue"
                  toggleIconColor="text-accent"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Keyword Block (Span 1) */}
        <div className="space-y-6">
          <div className="bg-[#0b0b10] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Info className="w-5 h-5 text-accent" /> Custom DLP Codenames
            </h3>
            <p className="text-xs text-secondary leading-relaxed font-mono">
              Declare custom, highly sensitive words or phrases that represent your enterprise IP (e.g., secret brand codenames, trademarks, system hosts) to be automatically scrubbed at the gateway.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
                  Confidential Codenames (comma separated)
                </label>
                <textarea
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  placeholder="e.g. Project-Alpha, TopSecretCode, secret-server.company.com"
                  className="w-full h-28 bg-[#0f0f15] border border-white/5 rounded-xl p-3 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 resize-none"
                />
              </div>

              <button
                onClick={handleSaveKeywords}
                disabled={isSavingKeywords || isLoading}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-50 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] cursor-pointer"
              >
                {isSavingKeywords ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Propagating...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Propagate Codenames
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Info Block */}
          <div className="bg-[#0b0b10] border border-white/5 p-6 rounded-2xl space-y-3.5 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2 font-display">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> Gateway Enforcement
            </h4>
            <div className="space-y-3 text-secondary font-mono leading-relaxed">
              <p>
                <strong>Zero Trust Architecture:</strong> No raw prompts reach downstream LLMs. Everything is processed through local DLP buffers before model dispatch.
              </p>
              <p>
                <strong>Response Interception:</strong> WitnessAI scans model outputs to prevent hallucinated API key leakage or unapproved PII leaks returning to the client browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
