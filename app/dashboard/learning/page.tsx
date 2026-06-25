"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Send, Image, Bot, User, Sparkles, Upload, BarChart3, BookOpen, TrendingUp, Loader2 } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "Explain how XAU/USD correlates with the US Dollar Index",
  "What are the best indicators for scalping gold?",
  "How do I calculate proper position size?",
  "Explain the Mr PFX 4-timeframe strategy",
  "What's the best time of day to trade gold?",
  "How do I read candlestick patterns?",
];

const CHART_PROMPTS = [
  "Analyze this chart and identify key support/resistance levels",
  "What patterns do you see on this chart?",
  "Is this a good entry point for XAU/USD?",
  "Explain the market structure shown here",
];

export default function LearningPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hi! I'm your AI trading mentor. I can help you learn forex and gold trading, explain strategies, and analyze charts. What would you like to learn today?",
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "analyze">("chat");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    const userMessage: Message = { role: "user", content: input.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (mode === "analyze" && selectedImage) {
        const res = await fetch("/api/analyze-screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenshot_base64: selectedImage.split(",")[1],
            question: input.trim() || "Analyze this XAU/USD chart and provide key levels, trend, and trading insights",
          }),
        });
        const data = await res.json();
        const answer = data.analysis || data.message || data.answer || "Analysis complete. Check the details above.";
        setMessages((prev) => [...prev, { role: "assistant", content: answer, timestamp: new Date().toISOString() }]);
        setSelectedImage(null);
        setImageName("");
      } else {
        const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input.trim(), conversationHistory: history }),
        });
        const data = await res.json();
        const answer = data.answer || "Sorry, I couldn't process that. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: answer, timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI service. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_SCREENSHOT_SIZE_MB || "10") * 1024 * 1024;
    if (file.size > maxSize) { alert("File too large. Max 10MB."); return; }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const promptList = mode === "analyze" ? CHART_PROMPTS : SUGGESTED_PROMPTS;

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary">AI Learning Hub</h1>
        <p className="text-sm text-text-muted">Chat with AI — learn forex, analyze charts, improve your trading</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setMode("chat")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${mode === "chat" ? "bg-accent-gold text-surface" : "glass-card text-text-secondary hover:text-text-primary"}`}>
              <BookOpen className="w-3.5 h-3.5" /> Learn
            </button>
            <button onClick={() => setMode("analyze")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${mode === "analyze" ? "bg-accent-gold text-surface" : "glass-card text-text-secondary hover:text-text-primary"}`}>
              <BarChart3 className="w-3.5 h-3.5" /> Analyze Chart
            </button>
          </div>

          <div className="h-[400px] overflow-y-auto space-y-3 mb-4 pr-2 scroll-smooth">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-accent-gold" /></div>}
                <div className={`max-w-[80%] ${msg.role === "user" ? "bg-accent-gold text-surface rounded-2xl rounded-tr-md px-4 py-2.5" : "glass-card rounded-2xl rounded-tl-md px-4 py-2.5"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-surface/60" : "text-text-muted"}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
                {msg.role === "user" && <div className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-accent-gold" /></div>}
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center"><Loader2 className="w-4 h-4 text-accent-gold animate-spin" /></div>
                <div className="glass-card rounded-2xl rounded-tl-md px-4 py-2.5"><p className="text-sm text-text-muted">Thinking...</p></div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-xs text-text-muted mb-2">{mode === "analyze" ? "Try asking about your chart:" : "Try asking:"}</p>
              <div className="flex flex-wrap gap-2">
                {promptList.slice(0, 4).map((p) => (
                  <button key={p} onClick={() => { setInput(p); }} className="text-xs px-3 py-1.5 rounded-lg glass-card text-text-secondary hover:text-text-primary hover:bg-accent-gold/10 transition-all">{p}</button>
                ))}
              </div>
            </div>
          )}

          {mode === "analyze" && selectedImage && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-3 p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <img src={selectedImage} alt="Chart" className="w-16 h-12 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary truncate">{imageName}</p>
                <p className="text-[10px] text-text-muted">Ready for analysis</p>
              </div>
              <button onClick={() => { setSelectedImage(null); setImageName(""); }} className="text-xs px-2 py-1 rounded-md bg-status-loss/10 text-status-loss hover:bg-status-loss/20">Remove</button>
            </motion.div>
          )}

          <div className="flex items-end gap-2">
            {mode === "analyze" && (
              <button onClick={() => fileInputRef.current?.click()} className="btn-ghost p-2.5 shrink-0">
                <Upload className="w-4 h-4" />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageSelect} className="hidden" />
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === "analyze" ? "Ask about the chart or describe what you see..." : "Ask anything about forex, gold, or trading..."}
                rows={1}
                className="input resize-none pr-10 py-3 min-h-[44px] max-h-[120px]"
              />
            </div>
            <button onClick={handleSend} disabled={loading || (!input.trim() && !selectedImage)} className="btn-primary p-2.5 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, title: "Forex Education", desc: "Learn from beginner to advanced concepts", color: "text-status-info" },
          { icon: TrendingUp, title: "Strategy Guides", desc: "Mr PFX, scalping, swing trading", color: "text-status-win" },
          { icon: Sparkles, title: "AI-Powered", desc: "NVIDIA models analyze charts in real-time", color: "text-accent-gold" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }} className="glass-card rounded-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color.replace("text", "bg")}/10 flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{s.title}</p>
              <p className="text-xs text-text-muted">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
