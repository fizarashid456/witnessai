import React, { useState } from "react";
import { 
  auth as realAuth, 
  simulatedAuth, 
  isRealFirebase, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "../lib/firebase";
import { Shield, Mail, Lock, Sparkles, AlertTriangle, ArrowRight, UserPlus, LogIn, Chrome } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isRealFirebase) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(realAuth, provider);
        onAuthSuccess(result.user);
      } else {
        const result = await simulatedAuth.signInWithGoogle();
        onAuthSuccess(result.user);
      }
      onClose();
    } catch (err: any) {
      console.error("Google Auth failed:", err);
      setError(err?.message || "Google Sign-In failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (isRealFirebase) {
        if (isSignUp) {
          const result = await createUserWithEmailAndPassword(realAuth, email, password);
          onAuthSuccess(result.user);
        } else {
          const result = await signInWithEmailAndPassword(realAuth, email, password);
          onAuthSuccess(result.user);
        }
      } else {
        if (isSignUp) {
          const result = await simulatedAuth.signUpWithEmail(email, password, displayName);
          onAuthSuccess(result.user);
        } else {
          const result = await simulatedAuth.signInWithEmail(email, password);
          onAuthSuccess(result.user);
        }
      }
      onClose();
    } catch (err: any) {
      console.error("Credential Auth failed:", err);
      setError(err?.message || "Authentication failed. Check your password or email format.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#040407]/80 backdrop-blur-lg" 
        onClick={onClose}
      />

      {/* Auth Card */}
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#0c0c12] to-[#07070a] border border-white/5 rounded-3xl p-8 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
      >
        {/* Decorative Grid and Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-44 h-44 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          <div className="w-12 h-12 bg-accent/10 border border-accent/25 rounded-2xl flex items-center justify-center text-accent mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-black font-display text-white tracking-tight">
            {isSignUp ? "SECURE OPERATOR ENROLLMENT" : "WITNESS GATEWAY ACCESS"}
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mt-1">
            {isRealFirebase 
              ? "CONNECTING TO SECURE CLOUD ENDPOINT" 
              : "SECURE SANDBOX ISOLATION ENVELOPE"}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="font-mono leading-normal">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Full Name / Operator ID</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Sentinel Zero"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#0e0e15] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 transition-colors font-mono"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Operator Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                placeholder="operator@witnessai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0e0e15] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 transition-colors font-mono"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Authorization Passkey</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0e0e15] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 transition-colors font-mono"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-accent hover:bg-accent/90 border border-accent/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                CREATE OPERATOR CREDENTIALS
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                SECURE IDENTITY SIGN IN
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 border-t border-white/5 w-full" />
          <span className="relative bg-[#08080d] px-3 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">OR IDENTITY FEDERATION</span>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <Chrome className="w-4 h-4 text-[#4285F4]" />
          <span>Authenticate with Google Cloud Identity</span>
        </button>

        {/* Toggle link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isSignUp 
              ? "Already Registered? Sign in to active gateway" 
              : "New Security Officer? Provision fresh credentials"}
          </button>
        </div>
      </div>
    </div>
  );
}
