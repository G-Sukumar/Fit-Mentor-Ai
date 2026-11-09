import React, { useState } from 'react';
import { BrainCircuit, Send, Sparkles, User } from 'lucide-react';
import { apiService } from '../services/api';

export const AICoachPage: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello Sukumar! I'm your FitMentor AI Coach. How can I help refine your training, recovery, or nutrition today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Analyze my recovery score today",
    "What exercises replace Barbell Bench Press?",
    "How much protein do I need for dinner?",
    "Give me technique cues for deadlifting"
  ];

  const handleSend = async (promptText?: string) => {
    const text = promptText || input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { text, isUser: true }]);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const res = await apiService.sendAIChatPrompt(text);
      setMessages((prev) => [...prev, { text: res.reply, isUser: false }]);
    } catch {
      setMessages((prev) => [...prev, { text: "I'm currently processing your request. Please try asking again in a moment.", isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue/20 to-secondary/30 border border-cyan/40 text-cyan flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.25)]">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan uppercase font-bold">
            HUNTER MENTOR INTERFACE
          </span>
          <h2 className="text-2xl font-display font-bold text-text-primary">Conversational AI Guide</h2>
          <p className="text-xs text-text-secondary">Sports science intelligence powered by LLM agent orchestration.</p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-3.5 py-1.5 rounded-full bg-navy-elevated border border-border text-xs text-text-secondary hover:text-cyan hover:border-cyan/50 transition-all whitespace-nowrap flex items-center gap-1.5 font-mono"
          >
            <Sparkles className="w-3.0 h-3.0 text-cyan" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Messages Window */}
      <div className="flex-1 glass-card rounded-2xl p-6 overflow-y-auto space-y-4 border border-border bg-navy/90">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${m.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${m.isUser ? 'bg-gradient-to-r from-cyan to-electric-blue text-background font-bold' : 'bg-gradient-to-r from-secondary to-electric-blue text-white'}`}>
                {m.isUser ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.isUser ? 'bg-cyan/15 border border-cyan/35 text-soft-white rounded-tr-none shadow-[0_0_12px_rgba(34,211,238,0.15)]' : 'bg-navy-elevated border border-border text-soft-white rounded-tl-none shadow-md'}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-text-secondary text-xs ml-11 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            FitMentor AI is synthesizing guidance...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Coach about exercises, nutrition, recovery, form..."
          className="w-full bg-navy-elevated border border-border rounded-xl pl-4 pr-12 py-3.5 text-sm text-text-primary focus:ring-1 focus:ring-cyan focus:border-cyan outline-none placeholder-text-muted transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-cyan to-electric-blue text-background disabled:opacity-40 hover:opacity-90 transition-all"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </form>
    </div>
  );
};
