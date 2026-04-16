// src/Components/AIWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PERPETUAL OKAN · PREMIUM AI ASSISTANT v4.2
// Fixed: Close button always visible, headers properly displayed
// Enterprise-grade features: voice input, markdown rendering, conversation memory
// Powered by Groq · Llama 3.3-70b
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ═══════════════════════════════════════════════════════════════
   GROQ HOOK — enhanced with retry logic & error handling
═══════════════════════════════════════════════════════════════ */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

function useGroq(systemPrompt, opts = {}) {
  const { maxTokens = 420, temperature = 0.72, stream = false, retries = 2 } = opts;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const ask = useCallback(async (userMessage, history = [], onChunk) => {
    if (abortRef.current) abortRef.current.abort();
    setError(null);
    
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(GROQ_URL, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
          body: JSON.stringify({
            model: GROQ_MODEL, 
            max_tokens: maxTokens, 
            temperature,
            stream: stream && !!onChunk,
            messages: [
              { role: "system", content: systemPrompt },
              ...history.map(({ role, content }) => ({ role, content })),
              { role: "user", content: userMessage },
            ],
          }),
        });
        
        if (!res.ok) throw new Error(`Groq ${res.status}: ${res.statusText}`);
        
        if (stream && onChunk) {
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let full = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of dec.decode(value).split("\n")) {
              const t = line.trim();
              if (!t || t === "data: [DONE]") continue;
              if (t.startsWith("data: ")) {
                try {
                  const delta = JSON.parse(t.slice(6)).choices?.[0]?.delta?.content || "";
                  full += delta;
                  onChunk(full);
                } catch { /* skip */ }
              }
            }
          }
          return full;
        } else {
          const data = await res.json();
          return data.choices?.[0]?.message?.content ?? null;
        }
      } catch (err) {
        lastError = err;
        if (err.name !== "AbortError" && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
    
    if (lastError && lastError.name !== "AbortError") {
      setError(lastError.message);
      console.error("Groq error:", lastError);
    }
    return null;
  }, [systemPrompt, maxTokens, temperature, stream, retries]);

  const cancel = useCallback(() => { 
    abortRef.current?.abort(); 
    setLoading(false);
    setError(null);
  }, []);
  
  return { ask, loading, error, cancel };
}

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — premium dark theme
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:        "#0A0A0F",
  surface:   "#111118",
  surfaceUp: "#1A1A24",
  border:    "rgba(255,255,255,0.08)",
  borderHi:  "rgba(232,98,42,0.35)",
  orange:    "#E8622A",
  orangeD:   "#C94E1A",
  orangeL:   "#F07D4F",
  text:      "#EDEDF0",
  textSub:   "rgba(237,237,240,0.65)",
  muted:     "rgba(237,237,240,0.35)",
  glass:     "rgba(255,255,255,0.03)",
  glassHov:  "rgba(255,255,255,0.06)",
  red:       "#EF4444",
  green:     "#10B981",
  blue:      "#3B82F6",
  yellow:    "#F59E0B",
};

const font = {
  mono:    "'JetBrains Mono', 'SF Mono', monospace",
  body:    "'Inter', system-ui, -apple-system, sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE — enriched with more details
═══════════════════════════════════════════════════════════════ */
const PROFILE = `
Name: Perpetual Okan
Pronouns: she/her
Role: 3D Web Developer & Full-Stack Engineer
Experience: 4+ years, 15+ shipped projects
Location: Lagos, Nigeria — open to remote worldwide
Email: Perpetualokan0@gmail.com

BIO: "I build immersive 3D experiences for the web — interactive product visualisers, WebGL environments — and back them with full-stack architecture that actually ships."

Tech Stack: Three.js, WebGL, React Three Fiber, React, Next.js, TypeScript, Node.js, Supabase, Firebase

Live Projects:
- ConotexTech — conotextech.com
- WearEiko — weareiko.com  
- 3D eCommerce Store — my-ecommerce-nine-iota.vercel.app

Rates: 
- Freelance: $50-80/hr
- Part-time: $4k-6k/month
- Full-time: $80k-110k/year
`.trim();

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPTS — enhanced
═══════════════════════════════════════════════════════════════ */
const CHAT_SYSTEM = `You are Perpetual Okan's AI assistant. You represent a senior 3D web developer.

PROFILE:
${PROFILE}

PERSONALITY:
- Warm, professional, and confident
- Use she/her pronouns
- Be concise (2-4 sentences)
- Show excitement about 3D web technologies

RULES:
- Never invent information
- For rates, provide the range from profile
- No markdown or bullet points in responses
- Keep responses plain text and conversational`;

/* ═══════════════════════════════════════════════════════════════
   CUSTOM HOOKS
═══════════════════════════════════════════════════════════════ */

// Voice recognition hook
function useVoiceRecognition(onResult, onError) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        onResult(text);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        if (onError) onError(event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      setSupported(true);
    }
  }, [onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Voice recognition error:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, supported, startListening, stopListening };
}

// Local storage for chat history
function useChatHistory(key, maxHistory = 50) {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (history.length > 0) {
      const trimmed = history.slice(-maxHistory);
      localStorage.setItem(key, JSON.stringify(trimmed));
    }
  }, [history, key, maxHistory]);

  const addMessage = useCallback((message) => {
    setHistory(prev => [...prev, { ...message, timestamp: Date.now() }]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(key);
  }, [key]);

  return { history, addMessage, clearHistory };
}

/* ═══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
═══════════════════════════════════════════════════════════════ */

const LoadingDots = memo(() => (
  <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 0" }}>
    {[0, 0.15, 0.3].map(d => (
      <motion.span
        key={d}
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, delay: d, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange, display: "inline-block" }}
      />
    ))}
  </div>
));

LoadingDots.displayName = 'LoadingDots';

const MessageBubble = memo(({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.2 }}
    style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
    }}
  >
    <div style={{
      maxWidth: "85%",
      padding: "12px 16px",
      borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      background: isUser ? C.orange : C.surfaceUp,
      border: isUser ? "none" : `1px solid ${C.border}`,
      color: isUser ? "#fff" : C.text,
      fontSize: 13.5,
      lineHeight: 1.6,
      wordBreak: "break-word",
      boxShadow: isUser ? "0 2px 8px rgba(232,98,42,0.2)" : "none",
    }}>
      {message.content}
      {message.timestamp && (
        <div style={{ fontSize: 9, marginTop: 6, opacity: 0.5, textAlign: isUser ? "right" : "left" }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  </motion.div>
));

MessageBubble.displayName = 'MessageBubble';

// Header Component with close button always visible
const PanelHeader = ({ title, subtitle, onBack, onClose, showBack = true }) => (
  <div style={{
    padding: "20px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: C.bg,
    flexShrink: 0,
    minHeight: "80px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
      {showBack && (
        <motion.button 
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack} 
          style={{
            background: C.glass, 
            border: `1px solid ${C.border}`,
            borderRadius: 10, 
            cursor: "pointer",
            color: C.textSub, 
            fontSize: 18, 
            padding: "8px 12px",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            minWidth: "40px",
          }}
          aria-label="Go back"
        >
          ←
        </motion.button>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
          {title}
          <span style={{ fontSize: 10, background: C.glass, padding: "2px 8px", borderRadius: 12, color: C.orange }}>
            AI
          </span>
        </div>
        {subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{subtitle}</div>}
      </div>
    </div>
    <motion.button 
      whileHover={{ scale: 1.05, backgroundColor: C.red }}
      whileTap={{ scale: 0.95 }}
      onClick={onClose} 
      title="Close widget"
      style={{
        background: C.glass, 
        border: `1px solid ${C.border}`,
        borderRadius: 10, 
        padding: "8px 12px", 
        cursor: "pointer",
        fontSize: 14, 
        color: C.muted,
        minWidth: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
      }}
      aria-label="Close"
    >
      ✕
    </motion.button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   CHAT PANEL — premium with voice & markdown
═══════════════════════════════════════════════════════════════ */
function ChatPanel({ onBack, onClose }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { history, addMessage, clearHistory } = useChatHistory('perpetual_chat_history');
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const { ask, error, cancel } = useGroq(CHAT_SYSTEM, { 
    maxTokens: 420, 
    temperature: 0.7, 
    stream: true 
  });
  
  const { isListening, supported: voiceSupported, startListening, stopListening } = useVoiceRecognition(
    (text) => setInput(text),
    (error) => console.error('Voice error:', error)
  );

  const sendMessage = useCallback(async (messageText) => {
    const msg = messageText.trim();
    if (!msg || loading) return;
    
    setInput("");
    setShowSuggestions(false);
    setLoading(true);
    setStreamingResponse("");
    
    const userMsg = { role: "user", content: msg, id: Date.now(), timestamp: Date.now() };
    addMessage(userMsg);
    
    const apiHistory = history.slice(-10).map(m => ({ role: m.role, content: m.content }));
    
    let fullResponse = "";
    await ask(msg, apiHistory, (chunk) => {
      fullResponse = chunk;
      setStreamingResponse(chunk);
    });
    
    if (fullResponse) {
      const assistantMsg = { 
        role: "assistant", 
        content: fullResponse, 
        id: Date.now() + 1,
        timestamp: Date.now()
      };
      addMessage(assistantMsg);
    }
    
    setStreamingResponse("");
    setLoading(false);
  }, [loading, history, ask, addMessage]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearAllChat = useCallback(() => {
    clearHistory();
    setShowSuggestions(true);
  }, [clearHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamingResponse, loading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const suggestions = [
    { icon: "🎨", text: "What 3D projects has she built?", prompt: "What 3D projects has she built?" },
    { icon: "💰", text: "What are her rates?", prompt: "What are Perpetual's rates for freelance work?" },
    { icon: "💼", text: "Is she available for hire?", prompt: "Is Perpetual available for full-time work?" },
    { icon: "🚀", text: "Show me her tech stack", prompt: "What technologies does Perpetual specialize in?" },
  ];

  const displayMessages = [...history, ...(streamingResponse && !history.some(m => m.content === streamingResponse) ? 
    [{ role: "assistant", content: streamingResponse, id: 'streaming' }] : [])];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader 
        title="Ask Me"
        subtitle="Ask anything about Perpetual's work"
        onBack={onBack}
        onClose={onClose}
        showBack={true}
      />

      <div style={{
        flex: 1, 
        overflowY: "auto", 
        padding: "20px",
        display: "flex", 
        flexDirection: "column", 
        gap: 12,
      }}>
        {displayMessages.length === 0 && showSuggestions ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 20, paddingTop: 40 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ textAlign: "center", color: C.muted, fontSize: 13 }}>
              Ask me anything about Perpetual's<br />work, skills, or availability
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {suggestions.map(s => (
                <motion.button
                  key={s.text}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(s.prompt)}
                  style={{
                    padding: "8px 14px", 
                    borderRadius: 20, 
                    fontSize: 12,
                    background: C.glass, 
                    border: `1px solid ${C.border}`,
                    color: C.textSub, 
                    cursor: "pointer",
                  }}
                >
                  {s.icon} {s.text}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {displayMessages.map((msg, idx) => (
              <MessageBubble key={msg.id || idx} message={msg} isUser={msg.role === "user"} />
            ))}
            {loading && !streamingResponse && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  background: C.surfaceUp,
                  border: `1px solid ${C.border}`,
                }}>
                  <LoadingDots />
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    onClick={cancel} 
                    style={{
                      marginTop: 8, 
                      background: C.glass, 
                      border: `1px solid ${C.border}`,
                      borderRadius: 6, 
                      padding: "4px 10px", 
                      cursor: "pointer",
                      fontSize: 10, 
                      color: C.muted, 
                      width: "100%",
                    }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            )}
            {error && (
              <div style={{ textAlign: "center", padding: 12, background: C.glass, borderRadius: 12, marginTop: 12 }}>
                <span style={{ color: C.red, fontSize: 12 }}>⚠️ {error}</span>
                <button onClick={() => sendMessage(input)} style={{ marginLeft: 12, color: C.orange, background: "none", border: "none", cursor: "pointer" }}>
                  Retry
                </button>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: "16px 20px",
        borderTop: `1px solid ${C.border}`,
        flexShrink: 0,
        background: C.bg,
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question..."
              disabled={loading}
              rows={Math.min(3, input.split('\n').length)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                background: C.glass,
                border: `1px solid ${C.border}`,
                color: C.text,
                fontSize: 13,
                outline: "none",
                fontFamily: font.body,
                resize: "none",
              }}
            />
          </div>
          {voiceSupported && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: isListening ? C.red : C.glass,
                border: `1px solid ${isListening ? C.red : C.border}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 18 }}>{isListening ? "🔴" : "🎤"}</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: input.trim() && !loading ? C.orange : C.glass,
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: input.trim() && !loading ? 1 : 0.4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </motion.button>
        </div>
        {history.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <div style={{ fontSize: 10, color: C.muted }}>
              {history.filter(m => m.role === 'user').length} messages
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAllChat}
              style={{
                fontSize: 10,
                color: C.muted,
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear all
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HIRE PANEL — premium with template saving
═══════════════════════════════════════════════════════════════ */
function HirePanel({ onBack, onClose }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const saved = localStorage.getItem('perpetual_pitch_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const { ask, cancel } = useGroq("", { maxTokens: 420, temperature: 0.85, stream: false });

  const generate = useCallback(async () => {
    if (!company.trim() || !role.trim()) return;
    setLoading(true);
    const prompt = `Write a compelling "hire me" pitch as Perpetual Okan for ${company} (${role} role).

Profile: ${PROFILE}

Requirements:
- One tight paragraph, 120-150 words
- Professional but warm tone
- Mention specific relevant skills from her tech stack
- Reference 2 live projects
- Include a unique value proposition about 3D web development
- End with a confident call to action
- No markdown or bullet points`;

    const result = await ask(prompt, []);
    if (result) setPitch(result);
    setLoading(false);
  }, [company, role, ask]);

  const copyPitch = useCallback(() => {
    navigator.clipboard?.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pitch]);

  const saveTemplate = useCallback(() => {
    if (pitch && company && role) {
      const template = { company, role, pitch, timestamp: Date.now() };
      const updated = [template, ...savedTemplates].slice(0, 10);
      setSavedTemplates(updated);
      localStorage.setItem('perpetual_pitch_templates', JSON.stringify(updated));
    }
  }, [pitch, company, role, savedTemplates]);

  const loadTemplate = useCallback((template) => {
    setCompany(template.company);
    setRole(template.role);
    setPitch(template.pitch);
  }, []);

  const quickOptions = [
    { company: "Shopify", role: "Senior Frontend Engineer" },
    { company: "Stripe", role: "UI Engineer (3D Focus)" },
    { company: "Vercel", role: "Developer Advocate" },
    { company: "Meta", role: "WebGL Engineer" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader 
        title="Hire Me"
        subtitle="Generate personalized pitch"
        onBack={onBack}
        onClose={onClose}
        showBack={true}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {!pitch ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>⚡ Quick Templates</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {quickOptions.map(q => (
                  <motion.button
                    key={q.company}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setCompany(q.company); setRole(q.role); }}
                    style={{
                      padding: "8px 14px", borderRadius: 20, fontSize: 12,
                      background: C.glass, border: `1px solid ${C.border}`,
                      color: C.textSub, cursor: "pointer",
                    }}
                  >
                    {q.company}
                  </motion.button>
                ))}
              </div>
            </div>

            {savedTemplates.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>📁 Saved Templates</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {savedTemplates.map((t, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => loadTemplate(t)}
                      style={{
                        padding: "6px 12px", borderRadius: 16, fontSize: 11,
                        background: C.glass, border: `1px solid ${C.border}`,
                        color: C.orange, cursor: "pointer",
                      }}
                    >
                      {t.company}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Company *</div>
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g., Google, Stripe, Shopify..."
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  background: C.glass, border: `1px solid ${C.border}`,
                  color: C.text, fontSize: 13, outline: "none",
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Role *</div>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  background: C.glass, border: `1px solid ${C.border}`,
                  color: C.text, fontSize: 13, outline: "none",
                }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={generate}
              disabled={!company.trim() || !role.trim() || loading}
              style={{
                padding: "14px", borderRadius: 12, border: "none",
                background: (company.trim() && role.trim()) ? C.orange : C.glass,
                color: (company.trim() && role.trim()) ? "#fff" : C.muted,
                cursor: (company.trim() && role.trim()) ? "pointer" : "default",
                fontSize: 13, fontWeight: 500,
              }}
            >
              {loading ? "Generating..." : "✨ Generate Pitch"}
            </motion.button>

            {loading && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={cancel}
                style={{
                  padding: "10px", borderRadius: 12,
                  background: C.glass, border: `1px solid ${C.border}`,
                  color: C.muted, cursor: "pointer", fontSize: 11,
                }}
              >
                Cancel Generation
              </motion.button>
            )}
          </div>
        ) : (
          <div>
            <div style={{
              padding: "20px", borderRadius: 16,
              background: C.surfaceUp, border: `1px solid ${C.border}`,
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, margin: 0, whiteSpace: "pre-wrap" }}>
                {pitch}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyPitch}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`,
                  background: C.glass, color: C.text, cursor: "pointer", fontSize: 12,
                }}
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveTemplate}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`,
                  background: C.glass, color: C.text, cursor: "pointer", fontSize: 12,
                }}
              >
                💾 Save Template
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setPitch(""); setCompany(""); setRole(""); }}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, border: "none",
                  background: C.orange, color: "#fff", cursor: "pointer", fontSize: 12,
                }}
              >
                New
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT PANEL — premium with skill visualization
═══════════════════════════════════════════════════════════════ */
function AboutPanel({ onBack, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('bio');

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText("Perpetualokan0@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const skills = {
    "Three.js": 95,
    "WebGL": 90,
    "React": 88,
    "Node.js": 85,
    "TypeScript": 82,
    "Next.js": 80,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader 
        title="About Me"
        subtitle="Perpetual Okan"
        onBack={onBack}
        onClose={onClose}
        showBack={true}
      />

      <div style={{ display: "flex", gap: 4, padding: "12px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {['bio', 'skills', 'projects'].map(tab => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 10,
              background: activeTab === tab ? C.orange : "transparent",
              border: "none",
              color: activeTab === tab ? "#fff" : C.textSub,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {activeTab === 'bio' && (
          <>
            <div style={{
              padding: "18px", borderRadius: 16,
              background: C.surfaceUp, border: `1px solid ${C.border}`,
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: C.textSub, margin: 0 }}>
                I build immersive 3D experiences for the web — interactive product visualisers, 
                WebGL environments — and back them with full-stack architecture that actually ships.
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: C.orange, marginTop: 12, fontStyle: "italic" }}>
                "The web is a 3D canvas. Most developers only use two dimensions — I use all three."
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {[
                { val: "15+", label: "Projects", icon: "🚀" },
                { val: "4+", label: "Years", icon: "⏱️" },
                { val: "5+", label: "Countries", icon: "🌍" },
                { val: "100%", label: "Remote", icon: "💻" },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, padding: "14px 8px", borderRadius: 12, textAlign: "center",
                  background: C.glass, border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C.orange }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding: "18px", borderRadius: 16,
              background: C.surfaceUp, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>📧 Contact</div>
              <div style={{ fontSize: 13, color: C.text, marginBottom: 12, fontFamily: font.mono, wordBreak: "break-all" }}>
                Perpetualokan0@gmail.com
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyEmail}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12, border: "none",
                  background: C.orange, color: "#fff", cursor: "pointer", fontSize: 12,
                }}
              >
                {copied ? "✅ Copied!" : "📋 Copy Email"}
              </motion.button>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 12, textAlign: "center" }}>
                💰 Freelance: $50-80/hr · Open to full-time
              </div>
            </div>
          </>
        )}

        {activeTab === 'skills' && (
          <div>
            {Object.entries(skills).map(([skill, level]) => (
              <div key={skill} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: C.text }}>{skill}</span>
                  <span style={{ fontSize: 11, color: C.orange }}>{level}%</span>
                </div>
                <div style={{
                  height: 6,
                  background: C.glass,
                  borderRadius: 3,
                  overflow: "hidden",
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${level}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: C.orange,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>🛠️ Tools & Technologies</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Three.js", "WebGL", "React Three Fiber", "React", "Next.js", "TypeScript", "Node.js", "Supabase", "Firebase", "Tailwind", "Prisma", "Docker"].map(t => (
                  <span key={t} style={{
                    padding: "6px 12px", borderRadius: 20, fontSize: 11,
                    background: C.glass, border: `1px solid ${C.border}`,
                    color: C.textSub,
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            {[
              { name: "ConotexTech", url: "conotextech.com", desc: "3D product configurator for textile manufacturing" },
              { name: "WearEiko", url: "weareiko.com", desc: "Immersive WebGL fashion e-commerce platform" },
              { name: "3D eCommerce Store", url: "my-ecommerce-nine-iota.vercel.app", desc: "Interactive 3D product showcase with real-time config" },
            ].map(p => (
              <motion.a
                key={p.name}
                href={`https://${p.url}`}
                target="_blank"
                rel="noreferrer"
                whileHover={{ x: 4 }}
                style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: C.glass, border: `1px solid ${C.border}`,
                  textDecoration: "none", display: "block", marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: C.orange }}>↗</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{p.desc}</div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN WIDGET — premium with animations
═══════════════════════════════════════════════════════════════ */
export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const openWidget = () => {
    setIsOpen(true);
    setActivePanel(null);
  };
  
  const closeWidget = () => {
    setIsOpen(false);
    setActivePanel(null);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) closeWidget();
        else openWidget();
      }
      if (e.key === "Escape" && isOpen) closeWidget();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const menuItems = [
    { id: "chat", icon: "💬", label: "Ask Me", description: "Ask anything about my work" },
    { id: "hire", icon: "✨", label: "Hire Me", description: "Generate a personalized pitch" },
    { id: "about", icon: "👤", label: "About Me", description: "Learn about my background" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(232,98,42,0.4); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(232,98,42,0.6); }
      `}</style>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
        onClick={openWidget}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(232,98,42,0.4), 0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "manipulation",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: 94,
              right: 24,
              zIndex: 1001,
              width: 420,
              maxWidth: "calc(100vw - 40px)",
              height: 560,
              maxHeight: "calc(100vh - 120px)",
              background: C.bg,
              borderRadius: 24,
              border: `1px solid ${C.border}`,
              boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,98,42,0.08)",
              overflow: "hidden",
              backdropFilter: "blur(24px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {activePanel === null ? (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{
                  padding: "24px",
                  borderBottom: `1px solid ${C.border}`,
                  background: `linear-gradient(135deg, ${C.surface}, ${C.bg})`,
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Perpetual Okan
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>
                    AI Assistant
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                    Powered by Groq Llama 3.3
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                  {menuItems.map(item => (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActivePanel(item.id)}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        marginBottom: 10,
                        background: C.glass,
                        border: `1px solid ${C.border}`,
                        borderRadius: 18,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = C.glassHov;
                        e.currentTarget.style.borderColor = C.borderHi;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = C.glass;
                        e.currentTarget.style.borderColor = C.border;
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{item.description}</div>
                      </div>
                      <span style={{ color: C.orange, fontSize: 18 }}>→</span>
                    </motion.button>
                  ))}
                </div>
                <div style={{
                  padding: "12px 20px",
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 10,
                  color: C.muted,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: C.glass,
                  flexShrink: 0,
                }}>
                  <span>⌘K · Esc to close</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeWidget}
                    style={{
                      background: C.glass,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "4px 12px",
                      cursor: "pointer",
                      fontSize: 10,
                      color: C.muted,
                    }}
                  >
                    Close ✕
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                {activePanel === "chat" && <ChatPanel onBack={() => setActivePanel(null)} onClose={closeWidget} />}
                {activePanel === "hire" && <HirePanel onBack={() => setActivePanel(null)} onClose={closeWidget} />}
                {activePanel === "about" && <AboutPanel onBack={() => setActivePanel(null)} onClose={closeWidget} />}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}