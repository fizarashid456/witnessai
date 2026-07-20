import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, HelpCircle, AlertCircle, RefreshCw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SupportCoPilotProps {
  theme: "dark" | "compliance";
}

export function SupportCoPilot({ theme }: SupportCoPilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your **WitnessAI Co-Pilot** guide. 🛡️\n\nI am here to help you navigate the secure gateway, configure DLP policies, and test prompt sanitization in the playground.\n\nWhat would you like to explore today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAlert, setHasAlert] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    { label: "💻 How to test redaction?", query: "How do I test prompt redaction in the Playground?" },
    { label: "🔒 Security score details", query: "How is the Security Score calculated?" },
    { label: "📈 Explain analytics", query: "What information does the Analytics dashboard show?" },
    { label: "☀️ Compliance mode?", query: "What is the high-contrast Compliance light mode?" }
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Turn off initial notification dot once opened
  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    setHasAlert(false);
  };

  const handleSend = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content: query } as Message];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "⚠️ I'm sorry, I failed to reach the server. Please check your internet connection and try again." }
        ]);
      }
    } catch (err) {
      console.error("[WitnessAI Support Co-Pilot Error]:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ An error occurred while communicating with the co-pilot server." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to convert simple markdown (like bold, inline code, list items) to clean HTML safe structure
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Bold text formatting **text**
      let formatted = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      formatted = formatted.replace(boldRegex, "<strong>$1</strong>");

      // Inline code format `code`
      const codeRegex = /`(.*?)`/g;
      formatted = formatted.replace(codeRegex, "<code class='bg-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-amber-400 text-xs border border-white/5'>$1</code>");

      // List format
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 text-[13px] leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s+/, "") }} />
        );
      }

      // Numbered list format
      if (/^\d+\.\s+/.test(line.trim())) {
        const itemContent = formatted.replace(/^\d+\.\s+/, "");
        return (
          <li key={idx} className="ml-5 list-decimal pl-1 text-[13px] leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: itemContent }} />
        );
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-[13px] leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  const isCompliance = theme === "compliance";

  return (
    <div id="witness-support-copilot" className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {/* Chat Widget Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`w-[360px] sm:w-[400px] h-[520px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border ${
              isCompliance
                ? "bg-white border-slate-400 text-slate-900"
                : "bg-[#0c0c14] border-white/10 text-white"
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center shrink-0 ${
              isCompliance 
                ? "bg-slate-100 border-slate-300" 
                : "bg-gradient-to-r from-accent/25 to-[#0f0f1c] border-white/5"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCompliance ? "bg-blue-600 text-white" : "bg-accent/20 text-accent"
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold tracking-wider ${isCompliance ? "text-slate-900" : "text-white"}`}>
                    WITNESSAI CO-PILOT
                  </h4>
                  <p className={`text-[10px] ${isCompliance ? "text-slate-600 font-semibold" : "text-zinc-400 font-mono"}`}>
                    Real-time Gateway Helper • Online
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenToggle}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isCompliance 
                    ? "hover:bg-slate-200 text-slate-500" 
                    : "hover:bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden ${
              isCompliance ? "bg-slate-50" : "bg-[#06060a]"
            }`}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      msg.role === "user"
                        ? isCompliance
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-accent text-white rounded-br-sm"
                        : isCompliance
                          ? "bg-white border border-slate-300 text-slate-900 rounded-bl-sm"
                          : "bg-[#11111a] border border-white/5 text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                  <span className={`text-[9px] mt-1 font-mono uppercase tracking-widest ${
                    isCompliance ? "text-slate-500 font-bold" : "text-zinc-500"
                  }`}>
                    {msg.role === "user" ? "User" : "Co-Pilot"}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className={`rounded-2xl px-4 py-3 rounded-bl-sm flex items-center space-x-1.5 ${
                    isCompliance ? "bg-slate-200 text-slate-800" : "bg-[#11111a] border border-white/5"
                  }`}>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[9px] mt-1 text-zinc-500 font-mono">CO-PILOT IS WRITING...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Shelf */}
            <div className={`px-4 py-2 flex flex-wrap gap-1.5 border-t shrink-0 ${
              isCompliance ? "bg-slate-100 border-slate-300" : "bg-[#0b0b14] border-white/5"
            }`}>
              {suggestionChips.map((chip, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(chip.query)}
                  disabled={isTyping}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all border text-left cursor-pointer ${
                    isCompliance
                      ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-200 hover:text-slate-950 font-bold"
                      : "bg-[#11111b] border-white/5 text-zinc-400 hover:border-white/15 hover:text-white"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div className={`p-3 border-t shrink-0 ${
              isCompliance ? "bg-white border-slate-300" : "bg-[#08080f] border-white/10"
            }`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask WitnessAI Co-Pilot anything..."
                  disabled={isTyping}
                  className={`flex-1 text-[13px] rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 ${
                    isCompliance
                      ? "bg-slate-100 border-slate-300 text-slate-900 focus:ring-blue-600 focus:bg-white"
                      : "bg-[#11111a] border-white/5 text-white focus:ring-accent focus:bg-[#141421]"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    isCompliance
                      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                      : "bg-accent text-white hover:opacity-90 disabled:opacity-40"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Floating Button */}
      <motion.button
        onClick={handleOpenToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] cursor-pointer transition-all duration-300 ${
          isCompliance
            ? "bg-blue-600 text-white hover:bg-blue-700 border border-slate-400"
            : isOpen 
              ? "bg-[#161622] text-white border border-white/15"
              : "bg-accent text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:opacity-95"
        }`}
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 animate-pulse" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}

        {/* Pulse alert dot for visual guidance */}
        {hasAlert && !isOpen && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
