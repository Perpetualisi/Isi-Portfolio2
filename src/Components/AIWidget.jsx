// src/Components/AIWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PERPETUAL OKAN · PREMIUM AI ASSISTANT v5.0
// Senior-grade: Command palette, analytics, smooth transitions, resume,
// availability status, project case studies, typing telemetry, theme engine
// Powered by Groq · Llama 3.3-70b
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback, memo, createContext, useContext } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   GROQ HOOK — with streaming, retry, and abort
═══════════════════════════════════════════════════════════════ */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

function useGroq(systemPrompt, opts = {}) {
  const { maxTokens = 480, temperature = 0.72, stream = false, retries = 2 } = opts;
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);

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
          const dec    = new TextDecoder();
          let full     = "";
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
          setLoading(false);
          return full;
        } else {
          const data = await res.json();
          setLoading(false);
          return data.choices?.[0]?.message?.content ?? null;
        }
      } catch (err) {
        lastError = err;
        if (err.name !== "AbortError" && attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    if (lastError?.name !== "AbortError") {
      setError(lastError?.message || "Unknown error");
    }
    setLoading(false);
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
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg:        "#080810",
    surface:   "#0F0F1A",
    surfaceUp: "#171727",
    surfaceHi: "#1E1E30",
    border:    "rgba(255,255,255,0.07)",
    borderHi:  "rgba(232,98,42,0.4)",
    orange:    "#E8622A",
    orangeD:   "#C94E1A",
    orangeL:   "#F07D4F",
    orangeGlow:"rgba(232,98,42,0.15)",
    text:      "#EEEEF2",
    textSub:   "rgba(238,238,242,0.6)",
    muted:     "rgba(238,238,242,0.3)",
    glass:     "rgba(255,255,255,0.03)",
    glassHov:  "rgba(255,255,255,0.06)",
    red:       "#EF4444",
    green:     "#10B981",
    blue:      "#60A5FA",
    purple:    "#A78BFA",
    name:      "dark",
  },
  midnight: {
    bg:        "#050510",
    surface:   "#0A0A1F",
    surfaceUp: "#10102A",
    surfaceHi: "#181835",
    border:    "rgba(160,140,255,0.12)",
    borderHi:  "rgba(167,139,250,0.45)",
    orange:    "#A78BFA",
    orangeD:   "#7C3AED",
    orangeL:   "#C4B5FD",
    orangeGlow:"rgba(167,139,250,0.15)",
    text:      "#F0EEFF",
    textSub:   "rgba(240,238,255,0.6)",
    muted:     "rgba(240,238,255,0.3)",
    glass:     "rgba(167,139,250,0.04)",
    glassHov:  "rgba(167,139,250,0.08)",
    red:       "#EF4444",
    green:     "#10B981",
    blue:      "#60A5FA",
    purple:    "#A78BFA",
    name:      "midnight",
  },
  ember: {
    bg:        "#0C0804",
    surface:   "#160E06",
    surfaceUp: "#1E1208",
    surfaceHi: "#261608",
    border:    "rgba(255,180,50,0.1)",
    borderHi:  "rgba(255,180,50,0.4)",
    orange:    "#F59E0B",
    orangeD:   "#D97706",
    orangeL:   "#FCD34D",
    orangeGlow:"rgba(245,158,11,0.15)",
    text:      "#FDF8EE",
    textSub:   "rgba(253,248,238,0.6)",
    muted:     "rgba(253,248,238,0.3)",
    glass:     "rgba(245,158,11,0.04)",
    glassHov:  "rgba(245,158,11,0.08)",
    red:       "#EF4444",
    green:     "#10B981",
    blue:      "#60A5FA",
    purple:    "#A78BFA",
    name:      "ember",
  },
};

const font = {
  display: "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif",
  body:    "'DM Sans', system-ui, -apple-system, sans-serif",
  mono:    "'Geist Mono', 'JetBrains Mono', monospace",
};

/* ═══════════════════════════════════════════════════════════════
   THEME CONTEXT
═══════════════════════════════════════════════════════════════ */
const ThemeCtx = createContext(THEMES.dark);
const useTheme = () => useContext(ThemeCtx);

/* ═══════════════════════════════════════════════════════════════
   PROFILE & PROMPTS
═══════════════════════════════════════════════════════════════ */
const PROFILE = {
  name:       "Perpetual Okan",
  pronouns:   "she/her",
  role:       "3D Web Developer & Full-Stack Engineer",
  years:      "4+",
  projects:   "15+",
  location:   "Lagos, Nigeria",
  remote:     true,
  email:      "Perpetualokan0@gmail.com",
  bio:        "I build immersive 3D experiences for the web — interactive product visualisers, WebGL environments — and back them with full-stack architecture that actually ships.",
  tagline:    "The web is a 3D canvas. Most developers only use two dimensions — I use all three.",
  stack:      ["Three.js", "WebGL", "React Three Fiber", "React", "Next.js", "TypeScript", "Node.js", "Supabase", "Firebase", "Tailwind", "Prisma", "GLSL"],
  rates: {
    freelance:  "$50–80/hr",
    partTime:   "$4k–6k/mo",
    fullTime:   "$80k–110k/yr",
  },
  availability: "open",  // "open" | "busy" | "closed"
  projects: [
    {
      name:    "ConotexTech",
      url:     "conotextech.com",
      desc:    "3D product configurator for textile manufacturing",
      stack:   ["Three.js", "React", "Node.js"],
      impact:  "40% reduction in product return rates",
      year:    "2024",
    },
    {
      name:    "WearEiko",
      url:     "weareiko.com",
      desc:    "Immersive WebGL fashion e-commerce platform",
      stack:   ["React Three Fiber", "Next.js", "Supabase"],
      impact:  "3× longer session duration vs industry avg",
      year:    "2024",
    },
    {
      name:    "3D eCommerce Store",
      url:     "my-ecommerce-nine-iota.vercel.app",
      desc:    "Interactive 3D product showcase with real-time config",
      stack:   ["Three.js", "React", "TypeScript"],
      impact:  "Featured in WebGL showcase",
      year:    "2023",
    },
  ],
  skills: {
    "Three.js":         95,
    "WebGL / GLSL":     90,
    "React":            92,
    "TypeScript":       85,
    "Node.js":          84,
    "Next.js":          82,
    "Supabase":         78,
    "React Three Fiber":88,
  },
};

const CHAT_SYSTEM = `You are the AI assistant for ${PROFILE.name}, a senior 3D web developer.

PROFILE:
Name: ${PROFILE.name}
Role: ${PROFILE.role}
Location: ${PROFILE.location}
Email: ${PROFILE.email}
Stack: ${PROFILE.stack.join(", ")}
Rates: Freelance ${PROFILE.rates.freelance} · Part-time ${PROFILE.rates.partTime} · Full-time ${PROFILE.rates.fullTime}
Availability: ${PROFILE.availability === "open" ? "Actively looking for new opportunities" : "Currently busy"}
Bio: ${PROFILE.bio}

PERSONALITY: Warm, confident, succinct (2–4 sentences). Excited about 3D web.
RULES: Never invent info. Plain conversational text. No markdown bullets. Use she/her.`;

/* ═══════════════════════════════════════════════════════════════
   CUSTOM HOOKS
═══════════════════════════════════════════════════════════════ */

function useChatHistory(key, max = 60) {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    if (history.length > 0)
      localStorage.setItem(key, JSON.stringify(history.slice(-max)));
  }, [history, key, max]);

  const addMessage  = useCallback(m => setHistory(p => [...p, { ...m, ts: Date.now() }]), []);
  const clearHistory = useCallback(() => { setHistory([]); localStorage.removeItem(key); }, [key]);

  return { history, addMessage, clearHistory };
}

function useVoiceRecognition(onResult) {
  const [isListening, setIsListening] = useState(false);
  const [supported,   setSupported]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    ref.current = new SR();
    ref.current.continuous      = false;
    ref.current.interimResults  = false;
    ref.current.lang            = "en-US";
    ref.current.onresult        = e => { onResult(e.results[0][0].transcript); setIsListening(false); };
    ref.current.onerror         = ()  => setIsListening(false);
    ref.current.onend           = ()  => setIsListening(false);
    setSupported(true);
  }, [onResult]);

  const toggle = useCallback(() => {
    if (!ref.current) return;
    if (isListening) { ref.current.stop(); setIsListening(false); }
    else             { try { ref.current.start(); setIsListening(true); } catch {} }
  }, [isListening]);

  return { isListening, supported, toggle };
}

function useAnalytics() {
  const [stats, setStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("po_analytics") || "{}"); }
    catch { return {}; }
  });

  const track = useCallback((event) => {
    setStats(prev => {
      const updated = {
        ...prev,
        totalMessages: (prev.totalMessages || 0) + (event === "message" ? 1 : 0),
        totalSessions: (prev.totalSessions || 0) + (event === "session" ? 1 : 0),
        pitchesGenerated: (prev.pitchesGenerated || 0) + (event === "pitch" ? 1 : 0),
        lastSeen: Date.now(),
        firstSeen: prev.firstSeen || Date.now(),
      };
      localStorage.setItem("po_analytics", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { stats, track };
}

function useCommandPalette(commands, isOpen) {
  const [query,    setQuery]    = useState("");
  const [selected, setSelected] = useState(0);
  const [visible,  setVisible]  = useState(false);

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    (c.keywords || []).some(k => k.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (!isOpen) { setVisible(false); return; }
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); setVisible(v => !v); setQuery(""); }
      if (e.key === "Escape") setVisible(false);
      if (visible) {
        if (e.key === "ArrowDown") setSelected(s => Math.min(s + 1, filtered.length - 1));
        if (e.key === "ArrowUp")   setSelected(s => Math.max(s - 1, 0));
        if (e.key === "Enter" && filtered[selected]) { filtered[selected].action(); setVisible(false); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, visible, filtered, selected]);

  return { query, setQuery, visible, setVisible, filtered, selected, setSelected };
}

/* ═══════════════════════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════════════════════ */

const StatusDot = memo(({ status }) => {
  const colors = { open: "#10B981", busy: "#F59E0B", closed: "#EF4444" };
  const labels = { open: "Available", busy: "Limited", closed: "Unavailable" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <motion.span
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 7, height: 7, borderRadius: "50%",
          background: colors[status] || colors.open,
          display: "inline-block",
          boxShadow: `0 0 6px ${colors[status] || colors.open}`,
        }}
      />
      <span style={{ fontSize: 10, color: colors[status] }}>{labels[status]}</span>
    </span>
  );
});
StatusDot.displayName = "StatusDot";

const LoadingDots = memo(() => {
  const C = useTheme();
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 0" }}>
      {[0, 0.18, 0.36].map(d => (
        <motion.span
          key={d}
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.55, delay: d, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: C.orange, display: "inline-block" }}
        />
      ))}
    </div>
  );
});
LoadingDots.displayName = "LoadingDots";

const TokenCount = memo(({ text }) => {
  const C = useTheme();
  const approxTokens = Math.ceil(text.length / 4);
  return (
    <span style={{ fontSize: 9, color: C.muted, fontFamily: font.mono }}>
      ~{approxTokens} tokens
    </span>
  );
});
TokenCount.displayName = "TokenCount";

const SkillBar = memo(({ name, level, delay = 0 }) => {
  const C = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.text, fontFamily: font.mono }}>{name}</span>
        <span style={{ fontSize: 11, color: C.orange, fontFamily: font.mono, fontWeight: 600 }}>{level}%</span>
      </div>
      <div style={{ height: 4, background: C.glass, borderRadius: 2, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: C.border }} />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${C.orange}, ${C.orangeL})`,
            borderRadius: 2,
            boxShadow: `0 0 8px ${C.orangeGlow}`,
          }}
        />
      </div>
    </div>
  );
});
SkillBar.displayName = "SkillBar";

const MessageBubble = memo(({ message, isUser }) => {
  const C = useTheme();
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      {!isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, flexShrink: 0, marginRight: 8, marginTop: 2,
          boxShadow: `0 2px 8px ${C.orangeGlow}`,
        }}>✦</div>
      )}
      <div style={{ maxWidth: "80%", position: "relative" }} className="msg-group">
        <div
          onClick={!isUser ? copy : undefined}
          title={!isUser ? (copied ? "Copied!" : "Click to copy") : undefined}
          style={{
            padding: "10px 14px",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            background: isUser
              ? `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`
              : C.surfaceUp,
            border: isUser ? "none" : `1px solid ${C.border}`,
            color: isUser ? "#fff" : C.text,
            fontSize: "clamp(12.5px, 3.2vw, 13px)",
            lineHeight: 1.65,
            wordBreak: "break-word",
            boxShadow: isUser ? `0 3px 12px ${C.orangeGlow}` : "none",
            cursor: !isUser ? "pointer" : "default",
            transition: "opacity 0.15s",
          }}
        >
          {message.content}
        </div>
        <div style={{
          fontSize: 9, marginTop: 4, opacity: 0.4,
          textAlign: isUser ? "right" : "left",
          color: C.muted, fontFamily: font.mono,
          paddingLeft: 2,
        }}>
          {message.ts
            ? new Date(message.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : ""}
          {!isUser && copied && " · ✓ copied"}
        </div>
      </div>
    </motion.div>
  );
});
MessageBubble.displayName = "MessageBubble";

const PanelHeader = memo(({ title, subtitle, badge, onBack, onClose, showBack = true, extra }) => {
  const C = useTheme();
  return (
    <div style={{
      padding: "14px 18px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: C.bg, flexShrink: 0, minHeight: 64,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        {showBack && (
          <motion.button
            whileHover={{ x: -2 }} whileTap={{ scale: 0.93 }}
            onClick={onBack}
            style={{
              background: C.glass, border: `1px solid ${C.border}`,
              borderRadius: 9, cursor: "pointer", color: C.textSub,
              fontSize: 16, padding: "7px 11px", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
            aria-label="Go back"
          >←</motion.button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: "clamp(14px, 3.8vw, 15px)",
            color: C.text, display: "flex", alignItems: "center", gap: 8,
            fontFamily: font.display,
          }}>
            {title}
            {badge && (
              <span style={{
                fontSize: 9, background: C.orangeGlow, padding: "2px 7px",
                borderRadius: 10, color: C.orange, border: `1px solid ${C.borderHi}`,
                fontFamily: font.mono, letterSpacing: "0.3px",
              }}>{badge}</span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3, fontFamily: font.mono }}>
              {subtitle}
            </div>
          )}
        </div>
        {extra}
      </div>
      <motion.button
        whileHover={{ scale: 1.06, background: "#EF444430" }} whileTap={{ scale: 0.93 }}
        onClick={onClose}
        style={{
          background: C.glass, border: `1px solid ${C.border}`,
          borderRadius: 9, padding: "7px 11px", cursor: "pointer",
          fontSize: 13, color: C.muted, display: "flex",
          alignItems: "center", justifyContent: "center", transition: "all 0.18s", flexShrink: 0,
        }}
        aria-label="Close"
      >✕</motion.button>
    </div>
  );
});
PanelHeader.displayName = "PanelHeader";

/* ═══════════════════════════════════════════════════════════════
   COMMAND PALETTE
═══════════════════════════════════════════════════════════════ */
function CommandPalette({ commands, onClose }) {
  const C      = useTheme();
  const ref    = useRef(null);
  const [q, setQ]       = useState("");
  const [sel, setSel]   = useState(0);

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(q.toLowerCase()) ||
    (c.keywords || []).some(k => k.toLowerCase().includes(q.toLowerCase()))
  );

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && filtered[sel]) { filtered[sel].action(); onClose(); }
    if (e.key === "Escape") onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)",
        zIndex: 100, display: "flex", alignItems: "flex-start",
        justifyContent: "center", paddingTop: 60, backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: -8 }} animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "calc(100% - 32px)", maxWidth: 380,
          background: C.surfaceUp, borderRadius: 16,
          border: `1px solid ${C.borderHi}`,
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.orangeGlow}`,
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ color: C.orange, fontSize: 16 }}>⌘</span>
          <input
            ref={ref}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a command..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: C.text, fontSize: 14, fontFamily: font.body,
            }}
          />
          <span style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>ESC</span>
        </div>
        <div style={{ maxHeight: 260, overflowY: "auto", padding: "6px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.muted, fontSize: 12 }}>
              No commands found
            </div>
          ) : filtered.map((cmd, i) => (
            <motion.button
              key={cmd.label}
              whileHover={{ x: 3 }}
              onClick={() => { cmd.action(); onClose(); }}
              onMouseEnter={() => setSel(i)}
              style={{
                width: "100%", padding: "10px 12px",
                borderRadius: 10, display: "flex", alignItems: "center", gap: 12,
                background: sel === i ? C.orangeGlow : "transparent",
                border: sel === i ? `1px solid ${C.borderHi}` : "1px solid transparent",
                cursor: "pointer", textAlign: "left", transition: "all 0.12s",
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{cmd.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{cmd.label}</div>
                {cmd.desc && <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{cmd.desc}</div>}
              </div>
              {cmd.shortcut && (
                <span style={{
                  fontSize: 10, fontFamily: font.mono, color: C.muted,
                  background: C.glass, padding: "2px 7px", borderRadius: 6,
                  border: `1px solid ${C.border}`,
                }}>{cmd.shortcut}</span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT PANEL
═══════════════════════════════════════════════════════════════ */
function ChatPanel({ onBack, onClose, track }) {
  const C = useTheme();
  const [input, setInput]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const [streamText, setStreamText]         = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [charCount, setCharCount]           = useState(0);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const { history, addMessage, clearHistory } = useChatHistory("po_chat_v2");
  const { ask, error, cancel } = useGroq(CHAT_SYSTEM, { maxTokens: 480, temperature: 0.7, stream: true });
  const { isListening, supported: voiceOk, toggle: toggleVoice } = useVoiceRecognition(t => setInput(t));

  const send = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput(""); setCharCount(0);
    setShowSuggestions(false); setLoading(true); setStreamText("");
    addMessage({ role: "user", content: msg, id: Date.now() });
    track("message");
    const ctx = history.slice(-12).map(m => ({ role: m.role, content: m.content }));
    let full = "";
    await ask(msg, ctx, chunk => { full = chunk; setStreamText(chunk); });
    if (full) addMessage({ role: "assistant", content: full, id: Date.now() + 1 });
    setStreamText(""); setLoading(false);
  }, [loading, history, ask, addMessage, track]);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamText, loading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 120);
  }, []);

  const suggestions = [
    { icon: "🎨", text: "What 3D projects has she built?",      prompt: "What 3D projects has she built?" },
    { icon: "💰", text: "What are her rates?",                  prompt: "What are Perpetual's rates?" },
    { icon: "🚀", text: "What's her tech stack?",               prompt: "What technologies does she specialize in?" },
    { icon: "📍", text: "Is she available?",                    prompt: "Is Perpetual available for new projects?" },
  ];

  const allMessages = [
    ...history,
    ...(streamText ? [{ role: "assistant", content: streamText, id: "stream", ts: Date.now() }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader
        title="Ask Me" badge="AI"
        subtitle={`${history.filter(m => m.role === "user").length} messages · Groq Llama 3.3`}
        onBack={onBack} onClose={onClose}
      />

      <div style={{
        flex: 1, overflowY: "auto", padding: "14px",
        display: "flex", flexDirection: "column", gap: 10,
        WebkitOverflowScrolling: "touch",
      }}>
        {allMessages.length === 0 && showSuggestions ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", gap: 18, paddingTop: 30,
          }}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 42 }}
            >✦</motion.div>
            <div style={{ textAlign: "center", color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
              Ask anything about Perpetual's<br />work, skills, or availability
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 8px" }}>
              {suggestions.map(s => (
                <motion.button
                  key={s.text} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => send(s.prompt)}
                  style={{
                    padding: "8px 14px", borderRadius: 20, fontSize: 12,
                    background: C.glass, border: `1px solid ${C.border}`,
                    color: C.textSub, cursor: "pointer",
                  }}
                >{s.icon} {s.text}</motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {allMessages.map((m, i) => (
              <MessageBubble key={m.id || i} message={m} isUser={m.role === "user"} />
            ))}
            {loading && !streamText && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                }}>✦</div>
                <div style={{
                  padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                  background: C.surfaceUp, border: `1px solid ${C.border}`,
                }}>
                  <LoadingDots />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} onClick={cancel}
                  style={{
                    fontSize: 10, color: C.muted, background: C.glass,
                    border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: "4px 9px", cursor: "pointer",
                  }}
                >stop</motion.button>
              </div>
            )}
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 12, background: "#EF444415",
                border: "1px solid #EF444430", fontSize: 12, color: "#EF4444",
              }}>
                ⚠ {error}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, flexShrink: 0, background: C.bg }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); setCharCount(e.target.value.length); }}
              onKeyDown={onKey}
              placeholder="Ask anything..."
              disabled={loading}
              rows={Math.min(3, Math.max(1, input.split("\n").length))}
              style={{
                width: "100%", padding: "11px 14px 11px 14px",
                borderRadius: 13, background: C.surfaceUp,
                border: `1px solid ${input.length > 0 ? C.borderHi : C.border}`,
                color: C.text, fontSize: "16px", outline: "none",
                fontFamily: font.body, resize: "none",
                WebkitAppearance: "none", transition: "border-color 0.2s",
                lineHeight: 1.55,
              }}
            />
          </div>
          {voiceOk && (
            <motion.button
              whileTap={{ scale: 0.93 }} onClick={toggleVoice}
              style={{
                width: 42, height: 42, borderRadius: 11,
                background: isListening ? "#EF444420" : C.glass,
                border: `1px solid ${isListening ? "#EF4444" : C.border}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 17 }}>{isListening ? "🔴" : "🎤"}</span>
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 11,
              background: input.trim() && !loading
                ? `linear-gradient(135deg, ${C.orange}, ${C.orangeD})` : C.glass,
              border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: input.trim() && !loading ? 1 : 0.4,
              boxShadow: input.trim() && !loading ? `0 4px 12px ${C.orangeGlow}` : "none",
              transition: "all 0.2s",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </motion.button>
        </div>

        {(history.length > 0 || charCount > 0) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 9, color: C.muted, fontFamily: font.mono }}>
                {history.filter(m => m.role === "user").length} msgs
              </span>
              {charCount > 0 && <TokenCount text={input} />}
            </div>
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.04 }} onClick={clearHistory}
                style={{ fontSize: 9, color: C.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >clear history</motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HIRE PANEL
═══════════════════════════════════════════════════════════════ */
function HirePanel({ onBack, onClose, track }) {
  const C = useTheme();
  const [company, setCompany] = useState("");
  const [role,    setRole]    = useState("");
  const [tone,    setTone]    = useState("professional");
  const [pitch,   setPitch]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("po_templates") || "[]"); }
    catch { return []; }
  });

  const { ask, cancel } = useGroq("", { maxTokens: 480, temperature: 0.85 });

  const TONES = [
    { id: "professional", label: "Professional" },
    { id: "casual",       label: "Casual" },
    { id: "bold",         label: "Bold" },
    { id: "technical",    label: "Technical" },
  ];

  const generate = useCallback(async () => {
    if (!company.trim() || !role.trim()) return;
    setLoading(true);
    const prompt = `Write a compelling "hire me" pitch as Perpetual Okan for ${company} (${role} role). Tone: ${tone}.

Profile: ${PROFILE.name} — ${PROFILE.role} — ${PROFILE.location}
Stack: ${PROFILE.stack.join(", ")}
Projects: ${PROFILE.projects.map(p => p.name + " (" + p.desc + ")").join(", ")}
Rates: ${PROFILE.rates.freelance}

One tight paragraph, 120-150 words. ${tone === "bold" ? "Start with a punchy statement. " : ""}${tone === "technical" ? "Emphasize specific technologies. " : ""}No markdown, no bullets. End with CTA.`;

    const result = await ask(prompt, []);
    if (result) { setPitch(result); track("pitch"); }
    setLoading(false);
  }, [company, role, tone, ask, track]);

  const save = useCallback(() => {
    if (!pitch || !company || !role) return;
    const t = { company, role, tone, pitch, ts: Date.now() };
    const updated = [t, ...templates].slice(0, 8);
    setTemplates(updated);
    localStorage.setItem("po_templates", JSON.stringify(updated));
  }, [pitch, company, role, tone, templates]);

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pitch]);

  const quickFills = [
    { company: "Shopify",  role: "Senior Frontend Engineer" },
    { company: "Vercel",   role: "Developer Advocate" },
    { company: "Meta",     role: "WebGL Engineer" },
    { company: "Stripe",   role: "UI Engineer" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader title="Hire Me" badge="PITCH" subtitle="AI-generated personalized pitch" onBack={onBack} onClose={onClose} />

      <div style={{ flex: 1, overflowY: "auto", padding: "14px", WebkitOverflowScrolling: "touch" }}>
        {!pitch ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, fontFamily: font.mono }}>
                ⚡ Quick fill
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {quickFills.map(q => (
                  <motion.button
                    key={q.company} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setCompany(q.company); setRole(q.role); }}
                    style={{
                      padding: "6px 12px", borderRadius: 18, fontSize: 11,
                      background: company === q.company ? C.orangeGlow : C.glass,
                      border: `1px solid ${company === q.company ? C.borderHi : C.border}`,
                      color: company === q.company ? C.orange : C.textSub, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >{q.company}</motion.button>
                ))}
              </div>
            </div>

            {templates.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, fontFamily: font.mono }}>📁 Saved</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {templates.map((t, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.03 }}
                      onClick={() => { setCompany(t.company); setRole(t.role); setTone(t.tone || "professional"); setPitch(t.pitch); }}
                      style={{
                        padding: "5px 11px", borderRadius: 14, fontSize: 10,
                        background: C.glass, border: `1px solid ${C.border}`,
                        color: C.orange, cursor: "pointer",
                      }}
                    >{t.company} ↗</motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 10, color: C.muted, display: "block", marginBottom: 7, fontFamily: font.mono }}>Company *</label>
              <input
                value={company} onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, Shopify..."
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 12,
                  background: C.surfaceUp, border: `1px solid ${company ? C.borderHi : C.border}`,
                  color: C.text, fontSize: "16px", outline: "none",
                  WebkitAppearance: "none", transition: "border-color 0.2s",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 10, color: C.muted, display: "block", marginBottom: 7, fontFamily: font.mono }}>Role *</label>
              <input
                value={role} onChange={e => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 12,
                  background: C.surfaceUp, border: `1px solid ${role ? C.borderHi : C.border}`,
                  color: C.text, fontSize: "16px", outline: "none",
                  WebkitAppearance: "none", transition: "border-color 0.2s",
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, fontFamily: font.mono }}>Tone</div>
              <div style={{ display: "flex", gap: 6 }}>
                {TONES.map(t => (
                  <motion.button
                    key={t.id} whileTap={{ scale: 0.96 }}
                    onClick={() => setTone(t.id)}
                    style={{
                      flex: 1, padding: "8px 4px", borderRadius: 10, fontSize: 10,
                      background: tone === t.id ? C.orangeGlow : C.glass,
                      border: `1px solid ${tone === t.id ? C.borderHi : C.border}`,
                      color: tone === t.id ? C.orange : C.muted, cursor: "pointer",
                      fontWeight: tone === t.id ? 600 : 400, transition: "all 0.15s",
                    }}
                  >{t.label}</motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={generate}
              disabled={!company.trim() || !role.trim() || loading}
              style={{
                padding: "13px", borderRadius: 12, border: "none",
                background: company.trim() && role.trim()
                  ? `linear-gradient(135deg, ${C.orange}, ${C.orangeD})` : C.glass,
                color: company.trim() && role.trim() ? "#fff" : C.muted,
                cursor: company.trim() && role.trim() ? "pointer" : "default",
                fontSize: 13, fontWeight: 500, fontFamily: font.body,
                boxShadow: company.trim() && role.trim() ? `0 4px 16px ${C.orangeGlow}` : "none",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <LoadingDots /> Generating...
                </span>
              ) : "✦ Generate Pitch"}
            </motion.button>

            {loading && (
              <motion.button whileHover={{ scale: 1.01 }} onClick={cancel}
                style={{
                  padding: "10px", borderRadius: 10, background: C.glass,
                  border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: 11,
                }}
              >Cancel</motion.button>
            )}
          </div>
        ) : (
          <div>
            <div style={{
              padding: "18px", borderRadius: 14, background: C.surfaceUp,
              border: `1px solid ${C.border}`, marginBottom: 14,
              position: "relative",
            }}>
              <div style={{ fontSize: 10, color: C.orange, marginBottom: 10, fontFamily: font.mono }}>
                {company} · {role} · {tone}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.72, color: C.text, margin: 0, whiteSpace: "pre-wrap" }}>
                {pitch}
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 2 }}>
                <TokenCount text={pitch} />
                <span style={{ fontSize: 9, color: C.muted, fontFamily: font.mono }}>
                  {" "}· ~{Math.ceil(pitch.split(" ").length)} words
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={copy}
                style={{
                  flex: 2, padding: "11px", borderRadius: 11,
                  background: copied ? "#10B98120" : C.glass,
                  border: `1px solid ${copied ? "#10B981" : C.border}`,
                  color: copied ? "#10B981" : C.text, cursor: "pointer", fontSize: 12,
                }}
              >{copied ? "✅ Copied!" : "📋 Copy"}</motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={save}
                style={{
                  flex: 1, padding: "11px", borderRadius: 11,
                  background: C.glass, border: `1px solid ${C.border}`,
                  color: C.text, cursor: "pointer", fontSize: 12,
                }}
              >💾</motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setPitch(""); setCompany(""); setRole(""); }}
                style={{
                  flex: 2, padding: "11px", borderRadius: 11, border: "none",
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                  color: "#fff", cursor: "pointer", fontSize: 12,
                }}
              >New Pitch</motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT PANEL
═══════════════════════════════════════════════════════════════ */
function AboutPanel({ onBack, onClose }) {
  const C = useTheme();
  const [tab, setTab] = useState("bio");

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(PROFILE.email);
  }, []);

  const TABS = ["bio", "skills", "projects", "rates"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader
        title="About Me" badge="PROFILE" subtitle={PROFILE.role}
        onBack={onBack} onClose={onClose}
      />

      <div style={{ display: "flex", padding: "10px 14px", gap: 4, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {TABS.map(t => (
          <motion.button
            key={t} whileTap={{ scale: 0.96 }}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "7px 6px", borderRadius: 9, fontSize: "clamp(10px,2.8vw,11px)",
              background: tab === t ? C.orangeGlow : "transparent",
              border: `1px solid ${tab === t ? C.borderHi : "transparent"}`,
              color: tab === t ? C.orange : C.muted,
              cursor: "pointer", fontWeight: tab === t ? 600 : 400, transition: "all 0.15s",
            }}
          >{t.charAt(0).toUpperCase() + t.slice(1)}</motion.button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px", WebkitOverflowScrolling: "touch" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "bio" && (
              <>
                <div style={{
                  padding: "16px", borderRadius: 14, background: C.surfaceUp,
                  border: `1px solid ${C.border}`, marginBottom: 16,
                }}>
                  <p style={{ fontSize: 13, lineHeight: 1.72, color: C.textSub, margin: 0 }}>
                    {PROFILE.bio}
                  </p>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: C.orange, marginTop: 12, fontStyle: "italic", margin: "12px 0 0" }}>
                    "{PROFILE.tagline}"
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[
                    { val: PROFILE.projects.length + "+", label: "Projects", icon: "🚀" },
                    { val: PROFILE.years,                  label: "Years Exp.", icon: "⏱" },
                    { val: "5+",                           label: "Countries", icon: "🌍" },
                    { val: "100%",                         label: "Remote OK", icon: "💻" },
                  ].map(s => (
                    <div key={s.label} style={{
                      padding: "14px 12px", borderRadius: 12, textAlign: "center",
                      background: C.glass, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.orange, fontFamily: font.display }}>{s.val}</div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 3, fontFamily: font.mono }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "14px", borderRadius: 14, background: C.surfaceUp, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, fontFamily: font.mono }}>📧 Contact</div>
                  <div style={{ fontSize: 12, color: C.text, marginBottom: 12, fontFamily: font.mono, wordBreak: "break-all" }}>
                    {PROFILE.email}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={copyEmail}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 11, border: "none",
                        background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                        color: "#fff", cursor: "pointer", fontSize: 12, fontFamily: font.body,
                      }}
                    >📋 Copy Email</motion.button>
                    <motion.a
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      href={`mailto:${PROFILE.email}`}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 11,
                        background: C.glass, border: `1px solid ${C.border}`,
                        color: C.text, cursor: "pointer", fontSize: 12,
                        textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >✉ Send Email</motion.a>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <StatusDot status={PROFILE.availability} />
                  </div>
                </div>
              </>
            )}

            {tab === "skills" && (
              <>
                <div style={{ marginBottom: 20 }}>
                  {Object.entries(PROFILE.skills).map(([name, level], i) => (
                    <SkillBar key={name} name={name} level={level} delay={i * 0.07} />
                  ))}
                </div>
                <div style={{ padding: "14px", borderRadius: 14, background: C.surfaceUp, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, fontFamily: font.mono }}>🛠 Full Stack</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {PROFILE.stack.map(t => (
                      <span key={t} style={{
                        padding: "5px 11px", borderRadius: 18, fontSize: 11,
                        background: C.glass, border: `1px solid ${C.border}`, color: C.textSub,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === "projects" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PROFILE.projects.map((p, i) => (
                  <motion.a
                    key={p.name}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    href={`https://${p.url}`} target="_blank" rel="noreferrer"
                    style={{
                      padding: "14px", borderRadius: 14, background: C.glass,
                      border: `1px solid ${C.border}`, textDecoration: "none", display: "block",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: font.display }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>{p.year} ↗</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.55 }}>{p.desc}</div>
                    <div style={{
                      padding: "7px 10px", borderRadius: 8, background: C.orangeGlow,
                      border: `1px solid ${C.borderHi}`, fontSize: 10, color: C.orange,
                      marginBottom: 10, fontFamily: font.mono,
                    }}>
                      📈 {p.impact}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {p.stack.map(s => (
                        <span key={s} style={{
                          fontSize: 9, padding: "3px 8px", borderRadius: 12,
                          background: C.glass, border: `1px solid ${C.border}`, color: C.muted,
                          fontFamily: font.mono,
                        }}>{s}</span>
                      ))}
                    </div>
                  </motion.a>
                ))}
              </div>
            )}

            {tab === "rates" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { type: "Freelance",  rate: PROFILE.rates.freelance,  icon: "🎯", desc: "Per project or hourly, flexible scope" },
                  { type: "Part-Time",  rate: PROFILE.rates.partTime,   icon: "⚡", desc: "20 hrs/week, ongoing collaboration" },
                  { type: "Full-Time",  rate: PROFILE.rates.fullTime,   icon: "🚀", desc: "Dedicated, full commitment, benefits preferred" },
                ].map((r, i) => (
                  <motion.div
                    key={r.type}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: "16px", borderRadius: 14, background: C.surfaceUp,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 22 }}>{r.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, color: C.muted, fontFamily: font.mono }}>{r.type}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: C.orange, fontFamily: font.display }}>{r.rate}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55 }}>{r.desc}</div>
                  </motion.div>
                ))}

                <div style={{
                  padding: "14px", borderRadius: 14, background: C.orangeGlow,
                  border: `1px solid ${C.borderHi}`, marginTop: 4,
                }}>
                  <div style={{ fontSize: 11, color: C.orange, fontFamily: font.mono, marginBottom: 6 }}>
                    ✦ Availability
                  </div>
                  <StatusDot status={PROFILE.availability} />
                  <div style={{ fontSize: 11, color: C.textSub, marginTop: 8, lineHeight: 1.55 }}>
                    Currently open to new freelance and full-time opportunities. Response time: &lt;24 hrs.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS PANEL (bonus senior feature)
═══════════════════════════════════════════════════════════════ */
function AnalyticsPanel({ onBack, onClose, stats }) {
  const C = useTheme();
  const items = [
    { label: "Total Messages",    val: stats.totalMessages    || 0, icon: "💬" },
    { label: "Sessions",          val: stats.totalSessions    || 0, icon: "🔄" },
    { label: "Pitches Generated", val: stats.pitchesGenerated || 0, icon: "✦" },
    { label: "Days Active",       val: stats.firstSeen
        ? Math.ceil((Date.now() - stats.firstSeen) / 86400000)
        : 0,                                                         icon: "📅" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader title="Insights" badge="ANALYTICS" subtitle="Your session stats" onBack={onBack} onClose={onClose} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: "16px", borderRadius: 14, background: C.surfaceUp,
                border: `1px solid ${C.border}`, textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.orange, fontFamily: font.display }}>{item.val}</div>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 4, fontFamily: font.mono }}>{item.label}</div>
            </motion.div>
          ))}
        </div>

        {stats.lastSeen && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: C.glass, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>
              Last activity: {new Date(stats.lastSeen).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEME PANEL
═══════════════════════════════════════════════════════════════ */
function ThemePanel({ onBack, onClose, currentTheme, onTheme }) {
  const C = useTheme();
  const options = [
    { id: "dark",     label: "Dark",     swatch: "#E8622A", bg: "#080810" },
    { id: "midnight", label: "Midnight", swatch: "#A78BFA", bg: "#050510" },
    { id: "ember",    label: "Ember",    swatch: "#F59E0B", bg: "#0C0804" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PanelHeader title="Theme" badge="APPEARANCE" subtitle="Choose your vibe" onBack={onBack} onClose={onClose} />
      <div style={{ flex: 1, padding: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map(o => (
            <motion.button
              key={o.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
              onClick={() => onTheme(o.id)}
              style={{
                padding: "16px", borderRadius: 14, display: "flex", alignItems: "center", gap: 14,
                background: currentTheme === o.id ? C.orangeGlow : C.glass,
                border: `1px solid ${currentTheme === o.id ? C.borderHi : C.border}`,
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: o.bg, border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: o.swatch, boxShadow: `0 0 8px ${o.swatch}` }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: font.display }}>{o.label}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono, marginTop: 2 }}>{o.id} theme</div>
              </div>
              {currentTheme === o.id && (
                <span style={{ marginLeft: "auto", color: C.orange, fontSize: 16 }}>✓</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN WIDGET
═══════════════════════════════════════════════════════════════ */
export default function AIWidget() {
  const [isOpen,     setIsOpen]     = useState(false);
  const [panel,      setPanel]      = useState(null);
  const [themeName,  setThemeName]  = useState(() =>
    localStorage.getItem("po_theme") || "dark"
  );
  const [showPalette, setShowPalette] = useState(false);

  const C = THEMES[themeName] || THEMES.dark;
  const { stats, track } = useAnalytics();

  const open = useCallback(() => {
    setIsOpen(true);
    setPanel(null);
    track("session");
  }, [track]);

  const close = useCallback(() => {
    setIsOpen(false);
    setPanel(null);
    setShowPalette(false);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeName(t);
    localStorage.setItem("po_theme", t);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width    = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width    = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width    = "";
    };
  }, [isOpen]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); isOpen ? close() : open(); }
      if (e.key === "Escape" && isOpen) { if (showPalette) setShowPalette(false); else if (panel) setPanel(null); else close(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "/" && isOpen) { e.preventDefault(); setShowPalette(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, panel, showPalette, open, close]);

  const commands = [
    { icon: "💬", label: "Open Chat",          desc: "Ask anything",                action: () => setPanel("chat"),      keywords: ["ask", "message", "talk"] },
    { icon: "✦",  label: "Generate Pitch",     desc: "AI-powered hire me pitch",    action: () => setPanel("hire"),      keywords: ["pitch", "hire", "apply"] },
    { icon: "👤", label: "About Perpetual",    desc: "Bio, skills & projects",      action: () => setPanel("about"),     keywords: ["profile", "info", "skills"] },
    { icon: "📊", label: "View Analytics",     desc: "Your session insights",       action: () => setPanel("analytics"), keywords: ["stats", "data", "usage"] },
    { icon: "🎨", label: "Change Theme",       desc: "Dark / Midnight / Ember",     action: () => setPanel("theme"),     keywords: ["color", "appearance"] },
    { icon: "✕",  label: "Close Widget",       desc: "Esc to close",               action: close,                       keywords: ["exit", "dismiss"] },
  ];

  const menuItems = [
    { id: "chat",      icon: "💬", label: "Ask Me",      desc: "Ask anything about my work" },
    { id: "hire",      icon: "✦",  label: "Hire Me",     desc: "Generate personalized pitch" },
    { id: "about",     icon: "👤", label: "About Me",    desc: "Background, skills & projects" },
    { id: "analytics", icon: "📊", label: "Insights",    desc: "Session analytics" },
    { id: "theme",     icon: "🎨", label: "Theme",       desc: "Appearance settings" },
  ];

  // Spring-animated glow for FAB
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  return (
    <ThemeCtx.Provider value={C}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: ${C.orangeGlow}; border-radius: 10px; }
        input, textarea, button { font-family: inherit; }
      `}</style>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.91 }}
        animate={isOpen ? { rotate: 45, scale: 0.9 } : { rotate: 0, scale: 1 }}
        onClick={isOpen ? close : open}
        style={{
          position: "fixed",
          bottom: "clamp(16px, 4vw, 24px)",
          right: "clamp(16px, 4vw, 24px)",
          zIndex: 1000,
          width: "clamp(50px, 12vw, 58px)",
          height: "clamp(50px, 12vw, 58px)",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
          border: "none",
          cursor: "pointer",
          boxShadow: `0 8px 28px ${C.orangeGlow}, 0 2px 8px rgba(0,0,0,0.3)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "manipulation",
        }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </motion.button>

      {/* Availability badge on FAB */}
      {!isOpen && PROFILE.availability === "open" && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          style={{
            position: "fixed",
            bottom: "clamp(52px, 13vw, 66px)",
            right: "clamp(14px, 3.5vw, 22px)",
            zIndex: 1000,
            width: 11, height: 11, borderRadius: "50%",
            background: "#10B981",
            boxShadow: "0 0 6px #10B981, 0 0 0 2px rgba(10,10,15,0.8)",
          }}
        />
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
                zIndex: 1000, backdropFilter: "blur(3px)",
                display: "none",
              }}
              className="mobile-backdrop"
            />
            <style>{`@media(max-width:768px){.mobile-backdrop{display:block!important;}}`}</style>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 18 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                bottom: "clamp(16px, 4vw, 24px)",
                right: "clamp(16px, 4vw, 24px)",
                zIndex: 1001,
                width: "min(430px, calc(100vw - 32px))",
                height: "min(620px, calc(100vh - 100px))",
                background: C.bg,
                borderRadius: "clamp(20px, 5vw, 26px)",
                border: `1px solid ${C.border}`,
                boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px ${C.orangeGlow}`,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                fontFamily: font.body,
              }}
            >
              <AnimatePresence mode="wait">
                {panel === null ? (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    {/* Header */}
                    <div style={{
                      padding: "clamp(18px, 4.5vw, 22px)",
                      borderBottom: `1px solid ${C.border}`,
                      background: `linear-gradient(160deg, ${C.surface} 0%, ${C.bg} 100%)`,
                      flexShrink: 0,
                      position: "relative", overflow: "hidden",
                    }}>
                      {/* Decorative glow */}
                      <div style={{
                        position: "absolute", top: -30, right: -30,
                        width: 120, height: 120, borderRadius: "50%",
                        background: C.orangeGlow, filter: "blur(30px)", pointerEvents: "none",
                      }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: "1px", textTransform: "uppercase", fontFamily: font.mono }}>
                            {PROFILE.name}
                          </div>
                          <div style={{ fontSize: "clamp(18px, 5vw, 20px)", fontWeight: 700, color: C.text, fontFamily: font.display, lineHeight: 1.2 }}>
                            AI Assistant
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 5, fontFamily: font.mono }}>
                            Groq · Llama 3.3-70b · ⌘/
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <StatusDot status={PROFILE.availability} />
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={close}
                            style={{
                              background: C.glass, border: `1px solid ${C.border}`,
                              borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                              fontSize: 12, color: C.muted,
                            }}
                          >✕</motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                      {menuItems.map((item, i) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.055 }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPanel(item.id)}
                          style={{
                            width: "100%", padding: "clamp(12px, 3.5vw, 14px) clamp(12px, 3.5vw, 16px)",
                            marginBottom: 8, background: C.glass, border: `1px solid ${C.border}`,
                            borderRadius: 16, cursor: "pointer", textAlign: "left",
                            display: "flex", alignItems: "center", gap: 14,
                            transition: "all 0.18s",
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
                          <span style={{ fontSize: "clamp(22px, 5.5vw, 26px)", width: 32, textAlign: "center" }}>
                            {item.icon}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "clamp(13px, 3.5vw, 14px)", fontWeight: 600, color: C.text, fontFamily: font.display }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: "clamp(10px, 2.5vw, 11px)", color: C.muted, marginTop: 2, fontFamily: font.mono }}>
                              {item.desc}
                            </div>
                          </div>
                          <span style={{ color: C.orange, fontSize: 16, opacity: 0.7 }}>›</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                      padding: "10px 14px", borderTop: `1px solid ${C.border}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: C.glass, flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 9, color: C.muted, fontFamily: font.mono }}>
                        ⌘K toggle · ⌘/ commands · Esc close
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                        onClick={() => setShowPalette(true)}
                        style={{
                          background: C.glass, border: `1px solid ${C.border}`,
                          borderRadius: 7, padding: "4px 10px", cursor: "pointer",
                          fontSize: 9, color: C.muted, fontFamily: font.mono,
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                      >
                        <span>⌘</span><span>/</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={panel}
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: "100%", display: "flex", flexDirection: "column" }}
                  >
                    {panel === "chat"      && <ChatPanel      onBack={() => setPanel(null)} onClose={close} track={track} />}
                    {panel === "hire"      && <HirePanel      onBack={() => setPanel(null)} onClose={close} track={track} />}
                    {panel === "about"     && <AboutPanel     onBack={() => setPanel(null)} onClose={close} />}
                    {panel === "analytics" && <AnalyticsPanel onBack={() => setPanel(null)} onClose={close} stats={stats} />}
                    {panel === "theme"     && <ThemePanel     onBack={() => setPanel(null)} onClose={close} currentTheme={themeName} onTheme={setTheme} />}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Command Palette overlay */}
              <AnimatePresence>
                {showPalette && (
                  <CommandPalette commands={commands} onClose={() => setShowPalette(false)} />
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ThemeCtx.Provider>
  );
}