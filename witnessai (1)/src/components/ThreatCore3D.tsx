import React, { useState, useRef } from "react";
import { Shield, Sparkles, ShieldAlert, Zap, Cpu, Activity } from "lucide-react";

interface ThreatCore3DProps {
  totalPrompts: number;
  totalBlocked: number;
  blockRate: number;
  securityScore: number;
}

export function ThreatCore3D({ totalPrompts, totalBlocked, blockRate, securityScore }: ThreatCore3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Map to tilt angles (maximum 18 degrees)
    setRotateX(-mouseY * 22); // Vertical mouse moves rotate around X axis
    setRotateY(mouseX * 22);  // Horizontal mouse moves rotate around Y axis
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Determine active color themes based on security health
  const isHealthy = securityScore >= 90;
  const isUnderAttack = totalBlocked > 0;

  const coreColorClass = isHealthy 
    ? "bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]"
    : "bg-gradient-to-tr from-amber-600 to-red-500 shadow-[0_0_45px_rgba(239,68,68,0.7)]";

  const ringColorClass = isHealthy ? "border-cyan-500/30" : "border-red-500/40";
  const glowColorClass = isHealthy ? "bg-cyan-500/10" : "bg-red-500/10";

  return (
    <div className="perspective-2000 w-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full bg-gradient-to-b from-[#0b0b11] to-[#07070a] border border-white/5 rounded-3xl p-6 overflow-hidden tilt-card-transition preserve-3d group cursor-default select-none shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
          boxShadow: isHovered 
            ? isHealthy
              ? "0 30px 60px -15px rgba(59,130,246,0.2), 0 0 50px -10px rgba(6,182,212,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1)"
              : "0 30px 60px -15px rgba(239,68,68,0.2), 0 0 50px -10px rgba(239,68,68,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1)"
            : "none"
        }}
      >
        {/* Hologram Scanning Line overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent h-1/2 w-full left-0 pointer-events-none animate-scanline -z-10" />

        {/* Ambient background grid pattern inside card */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none rounded-3xl" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-6 preserve-3d" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-secondary uppercase">
              WITNESS AI SHIELD CORE
            </span>
          </div>
          <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 border border-white/5 rounded text-secondary flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? "bg-cyan-400 animate-pulse" : "bg-red-500 animate-ping"}`} />
            3D ENGINE ACTIVE
          </span>
        </div>

        {/* --- Central 3D Interactive Ring and Sphere Container --- */}
        <div className="relative h-60 flex items-center justify-center preserve-3d my-2">
          {/* Pulsing light column glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-64 bg-radial-gradient from-accent/5 to-transparent blur-3xl pointer-events-none" />

          {/* Core Outer Rotating Spherical Rings (using 3D Orbit Keyframes) */}
          <div className="absolute w-52 h-52 border-2 border-dashed rounded-full pointer-events-none animate-orbit-x preserve-3d opacity-30">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isHealthy ? "bg-cyan-400" : "bg-red-400"}`} />
          </div>

          <div className={`absolute w-44 h-44 border border-dashed rounded-full pointer-events-none animate-orbit-y preserve-3d opacity-50 ${ringColorClass}`}>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${isHealthy ? "bg-blue-400" : "bg-orange-400"}`} />
          </div>

          <div className="absolute w-36 h-36 border-2 border-dotted rounded-full pointer-events-none animate-orbit-z preserve-3d opacity-40">
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-amber-400"}`} />
          </div>

          {/* Central Active Hologram Sphere */}
          <div 
            className="absolute preserve-3d flex items-center justify-center transition-transform duration-500"
            style={{ transform: "translateZ(65px)" }}
          >
            {/* Pulsing halo */}
            <div className={`absolute w-24 h-24 rounded-full blur-xl animate-pulse opacity-40 ${glowColorClass}`} />
            <div className={`absolute w-20 h-20 rounded-full border border-white/10 animate-ping opacity-10`} />

            {/* Core Orb Sphere */}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${coreColorClass} transition-all duration-500`}>
              <div className="absolute inset-0.5 rounded-full bg-black/10 backdrop-blur-xs flex items-center justify-center">
                {isHealthy ? (
                  <Shield className="w-7 h-7 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)] animate-float-3d" />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)] animate-bounce" />
                )}
              </div>
              
              {/* Outer glowing shield arc */}
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse" />
            </div>
          </div>

          {/* Floating Data Nodes (With translateZ depth) */}
          <div 
            className="absolute top-4 left-6 bg-[#0f0f15]/90 border border-white/5 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-left shadow-lg preserve-3d transition-transform duration-300"
            style={{ transform: `translateZ(${isHovered ? "80px" : "40px"})` }}
          >
            <div className="text-[9px] font-mono text-zinc-500 font-bold uppercase">PII Redacted</div>
            <div className="text-sm font-black font-display text-white mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              {totalBlocked * 4 + totalPrompts * 2} <span className="text-[9px] text-zinc-600 font-normal">assets</span>
            </div>
          </div>

          <div 
            className="absolute bottom-6 right-6 bg-[#0f0f15]/90 border border-white/5 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-left shadow-lg preserve-3d transition-transform duration-300"
            style={{ transform: `translateZ(${isHovered ? "90px" : "45px"})` }}
          >
            <div className="text-[9px] font-mono text-zinc-500 font-bold uppercase">Attack Intercept</div>
            <div className="text-sm font-black font-display text-red-400 mt-0.5 flex items-center gap-1">
              <Activity className="w-3 h-3 text-red-400 animate-pulse" />
              {blockRate}% <span className="text-[9px] text-zinc-600 font-normal">rate</span>
            </div>
          </div>
        </div>

        {/* Footer info showing 3D space metadata */}
        <div 
          className="mt-4 border-t border-white/5 pt-4 flex items-center justify-between text-xs font-mono text-secondary preserve-3d"
          style={{ transform: "translateZ(25px)" }}
        >
          <div>
            <div className="text-[9px] text-zinc-500 uppercase font-bold">Threat Defense Ratio</div>
            <div className="text-white font-bold mt-0.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>{isHealthy ? "Optimal" : "Hardened"} State</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-zinc-500 uppercase font-bold">Proxy Latency</div>
            <div className="text-green-400 font-bold mt-0.5 font-mono">
              ~24ms <span className="text-[10px] text-zinc-500">RTT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
