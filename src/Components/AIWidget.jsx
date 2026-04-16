// src/Components/AIWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PERPETUAL OKAN · PREMIUM AI ASSISTANT + PITCH GENERATOR  v2
// Powered by Groq · Llama 3.3-70b
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   GROQ HOOK — streaming capable
═══════════════════════════════════════════════════════════════ */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

function useGroq(systemPrompt, opts = {}) {
  const { maxTokens = 420, temperature = 0.72, stream = false } = opts;
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const ask = useCallback(async (userMessage, history = [], onChunk) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL, max_tokens: maxTokens, temperature,
          stream: stream && !!onChunk,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.map(({ role, content }) => ({ role, content })),
            { role: "user", content: userMessage },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Groq ${res.status}`);

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
      if (err.name !== "AbortError") console.error("Groq:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [systemPrompt, maxTokens, temperature, stream]);

  const cancel = useCallback(() => { abortRef.current?.abort(); setLoading(false); }, []);
  return { ask, loading, cancel };
}

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS  — unchanged from v1 so your theme stays intact
═══════════════════════════════════════════════════════════════ */
const C = {
  bg:        "#05050a",
  surface:   "#0a0a14",
  surfaceUp: "#0f0f1c",
  border:    "rgba(255,255,255,0.06)",
  borderHi:  "rgba(232,98,42,0.22)",
  orange:    "#E8622A",
  orangeD:   "#C94E1A",
  orangeL:   "#F07D4F",
  orangeXL:  "#F5A07A",
  gold:      "#D4923A",
  text:      "#EEE9F5",
  textSub:   "rgba(238,233,245,0.5)",
  muted:     "rgba(238,233,245,0.28)",
  faint:     "rgba(238,233,245,0.06)",
  green:     "#22c55e",
  red:       "#ef4444",
  teal:      "#14b8a6",
  glass:     "rgba(255,255,255,0.018)",
  glassHov:  "rgba(255,255,255,0.036)",
};

const font = {
  mono:    "'IBM Plex Mono', 'Courier New', monospace",
  display: "'Syne', 'Space Grotesk', sans-serif",
  body:    "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */
const PROFILE = `
Name: Perpetual Okan
Pronouns: she/her
Role: 3D Web Developer & Full-Stack Engineer
Experience: 4+ years, 15+ shipped projects, 2000+ commits
Location: Lagos, Nigeria — open to remote worldwide
Email: Perpetualokan0@gmail.com
GitHub: github.com/Perpetualisi
LinkedIn: linkedin.com/in/perpetual-okan

BIO (in her own words):
"I build immersive 3D experiences for the web — interactive product visualisers, WebGL environments, shader-driven effects — and back them with full-stack architecture that actually ships. The web is a 3D canvas. Most developers only use two dimensions — I use all three."

3D & Creative: Three.js, WebGL, GLSL Shaders, React Three Fiber, Framer Motion, Canvas API, SVG Animation
Frontend: React, Next.js, TypeScript, Tailwind CSS, Framer Motion
Backend: Node.js, Express, PostgreSQL, MongoDB, Firebase, Supabase
API & Integrations: REST API design, Stripe, Google Maps, social auth, data feeds
AI & Chatbots: builds AI-powered chatbots using LLM APIs (Groq, OpenAI)
Tools: Git, Docker, Vercel, AWS

KEY METRICS:
- 15+ projects shipped (concept → live production)
- 4 years experience
- Clients in 5+ countries
- 2000+ commits

LIVE PROJECTS:
1. ConotexTech — conotextech.com — US tech company site (Richmond, TX). Fast, clean, professional.
2. WearEiko — weareiko.com — Fashion/bridal brand. Smooth animations, strong visual identity.
3. 3D eCommerce Store — my-ecommerce-nine-iota.vercel.app — Three.js 3D hero + real cart.
4. Verra Perfume — verra-mu.vercel.app — Luxury perfume brand. Dark, atmospheric, smooth scroll.
5. Ice Cream Brand — ice-cream-iota-peach.vercel.app — Fun, playful, animated brand site.
6. Custom 3D Portfolio — Three.js background, interactive and immersive.

RATES & AVAILABILITY:
- Freelance: open, from $50/hr, 2-4 week delivery
- Full-time remote: open
- Contact: Perpetualokan0@gmail.com
`.trim();

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPTS
═══════════════════════════════════════════════════════════════ */
const CHAT_SYSTEM = `You are the AI assistant embedded in Perpetual Okan's portfolio. You speak warmly and naturally — like a knowledgeable colleague who knows Perpetual's work inside out.

PROFILE:
${PROFILE}

RULES:
- Always use she/her for Perpetual.
- 2–3 sentences max. Never list or use bullet points. Plain conversational prose only.
- Warm, genuine, slightly enthusiastic — not corporate or robotic.
- When mentioning a project, include the live URL.
- For rates or hiring: mention the rate and direct to Perpetualokan0@gmail.com
- Never make up anything not in the profile.
- No markdown formatting of any kind — no bold, no headers, no lists.
- One emoji per reply, only if it genuinely fits.
- End with a natural follow-up hook, not "Is there anything else?"`;

const PITCH_SYSTEM = (tone, company, role) => `Write a first-person "hire me" pitch as Perpetual Okan, addressed to ${company || "the company"} for the ${role || "position"} role.

Profile: ${PROFILE}
Tone: ${tone}

Rules:
- One tight paragraph, 100–130 words.
- Pure prose — absolutely no bullet points, headers, or markdown.
- Open with a punchy, attention-grabbing line (no "I am Perpetual" openers).
- Mention 1-2 specific live projects with a brief note on what was built.
- Weave in a relevant backend, API, or 3D skill naturally.
- End with a confident, specific call to action.
- Sound genuinely human — not templated.
- Output ONLY the pitch. No preamble, no label, no quotation marks.`;

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  "What kind of projects does she build?",
  "Tell me about her 3D work 🌐",
  "Can she build chatbots?",
  "Does she do backend work?",
  "What's her Three.js experience?",
  "Is she available for freelance? 💼",
  "What's her hourly rate?",
  "Show me some live projects",
  "Firebase or Supabase — which does she use?",
];

const PITCH_QUICK = [
  { company: "Shopify",  role: "Senior Frontend Engineer" },
  { company: "Stripe",   role: "Frontend Developer" },
  { company: "Vercel",   role: "Developer Advocate" },
  { company: "Figma",    role: "Creative Technologist" },
  { company: "Netflix",  role: "UI Engineer" },
  { company: "Apple",    role: "Creative Developer" },
];

const TONES = [
  { id: "professional", label: "Professional", icon: "💼", desc: "Formal & polished"   },
  { id: "bold",         label: "Bold",         icon: "⚡", desc: "Direct & punchy"     },
  { id: "friendly",     label: "Friendly",     icon: "😊", desc: "Warm & personable"   },
  { id: "creative",     label: "Creative",     icon: "🎨", desc: "Unique & innovative" },
];

const STATS = [
  { val: "15+", label: "Projects Shipped" },
  { val: "4yr", label: "Experience"       },
  { val: "5+",  label: "Countries"        },
  { val: "2K+", label: "Commits"          },
];

const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text) => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2200); };
    navigator.clipboard?.writeText(text).then(done).catch(() => {
      const el = Object.assign(document.createElement("textarea"), { value: text });
      document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el); done();
    });
  }, []);
  return { copied, copy };
}

function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}

function useKeyboardHeight() {
  const [kbH, setKbH] = useState(0);
  const initH = useRef(typeof window !== "undefined" ? window.innerHeight : 800);
  useEffect(() => {
    const fn = () => { const diff = initH.current - window.innerHeight; setKbH(diff > 120 ? diff : 0); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return kbH;
}

// ── NEW: voice input hook ──
function useVoiceInput({ onResult, onEnd }) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      onResult(transcript, e.results[e.results.length - 1].isFinal);
    };
    r.onend = () => { setListening(false); onEnd?.(); };
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }, [supported, onResult, onEnd]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop, supported };
}

/* ═══════════════════════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════════════════════ */
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "13px 16px" }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <motion.span key={i}
          animate={{ y: [0, -6, 0], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.85, delay: d, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange, display: "inline-block" }}
        />
      ))}
    </div>
  );
}

function OnlinePill({ label = "AVAILABLE FOR WORK" }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 100,
      background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)",
      flexShrink: 0,
    }}>
      <motion.span
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "block", flexShrink: 0 }}
      />
      <span style={{ fontFamily: font.mono, fontSize: 8, color: C.green, letterSpacing: "0.1em" }}>
        {label}
      </span>
    </div>
  );
}

function HdrBtn({ onClick, title, children, danger, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: active ? "rgba(232,98,42,0.15)" : hov ? (danger ? "rgba(239,68,68,0.12)" : C.glassHov) : C.glass,
        border: `1px solid ${active ? C.borderHi : hov ? (danger ? "rgba(239,68,68,0.28)" : C.borderHi) : C.border}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.14s", touchAction: "manipulation", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ val, label }) {
  return (
    <div style={{
      flex: 1, padding: "10px 6px", borderRadius: 10, textAlign: "center",
      background: C.glass, border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, color: C.orange, lineHeight: 1 }}>{val}</div>
      <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, marginTop: 4, letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

// ── NEW: Scroll-to-bottom button ──
function ScrollBtn({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
      onClick={onClick}
      style={{
        position: "absolute", bottom: 14, right: 14, zIndex: 5,
        width: 32, height: 32, borderRadius: "50%",
        background: C.surfaceUp, border: `1px solid ${C.borderHi}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)", touchAction: "manipulation",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.orangeL} strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </motion.button>
  );
}

// ── NEW: Toast notification ──
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      style={{
        position: "absolute", bottom: 72, left: "50%", transform: "translateX(-50%)",
        background: C.surfaceUp, border: `1px solid ${C.borderHi}`,
        borderRadius: 10, padding: "7px 14px", zIndex: 10,
        fontFamily: font.mono, fontSize: 10, color: C.orangeL,
        whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        pointerEvents: "none",
      }}
    >
      {message}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL HEADER
═══════════════════════════════════════════════════════════════ */
function PanelHeader({ onClose, activeTab, setActiveTab, onSearch, searchActive }) {
  return (
    <div style={{
      flexShrink: 0,
      background: `linear-gradient(180deg, rgba(232,98,42,0.07) 0%, transparent 100%)`,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {/* Top row */}
      <div style={{ padding: "13px 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(232,98,42,0.0)", "0 0 0 7px rgba(232,98,42,0.08)", "0 0 0 0 rgba(232,98,42,0.0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: `linear-gradient(135deg, rgba(232,98,42,0.18), rgba(201,78,26,0.08))`,
              border: `1.5px solid rgba(232,98,42,0.4)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}
          >
            🧑‍💻
          </motion.div>
          <span style={{
            position: "absolute", bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: "50%",
            background: C.green, border: `2px solid ${C.surface}`,
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: font.display, fontSize: 14, fontWeight: 700, color: C.text,
            letterSpacing: "0.01em", display: "flex", alignItems: "center", gap: 7,
          }}>
            Perpetual<span style={{ color: C.orange }}>'s</span> AI
            <span style={{
              fontFamily: font.mono, fontSize: 8, padding: "2px 7px", borderRadius: 4,
              background: "rgba(232,98,42,0.1)", border: "1px solid rgba(232,98,42,0.2)",
              color: C.orangeL, letterSpacing: "0.1em",
            }}>LIVE</span>
          </div>
          <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, marginTop: 2 }}>
            Groq · Llama 3.3-70b
          </div>
        </div>

        <OnlinePill />

        {/* NEW: Search button (chat only) */}
        {activeTab === "chat" && (
          <HdrBtn onClick={onSearch} title="Search conversation" active={searchActive}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={searchActive ? C.orangeL : C.muted} strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </HdrBtn>
        )}

        <HdrBtn onClick={onClose} title="Close" danger>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </HdrBtn>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", padding: "0 14px 0" }}>
        {[
          { id: "chat",  icon: "💬", label: "Ask Me"    },
          { id: "pitch", icon: "✨", label: "Hire Pitch" },
          { id: "about", icon: "👤", label: "About"      },
        ].map((t) => {
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "9px 0 11px",
                fontFamily: font.mono, fontSize: 9, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: active ? C.orangeL : C.muted,
                background: "transparent", border: "none",
                borderBottom: `2px solid ${active ? C.orange : "transparent"}`,
                cursor: "pointer", transition: "all 0.18s", touchAction: "manipulation",
              }}
            >
              {t.icon} {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT PANEL  — v2 with search, voice, export, scroll btn
═══════════════════════════════════════════════════════════════ */
function ChatPanel({ searchActive, setSearchActive }) {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    content: "Hey! 👋 I'm Perpetual's AI — I know her work, skills, and availability inside out. Ask me anything.",
    ts: ts(), id: 0, final: true,
  }]);
  const [input, setInput]             = useState("");
  const [showSugg, setShowSugg]       = useState(true);
  const [reactions, setReactions]     = useState({});
  const [copiedId, setCopiedId]       = useState(null);
  const [streamingId, setStreamingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [toast, setToast]             = useState(null);
  const [charCount, setCharCount]     = useState(0);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const msgsRef    = useRef(null);
  const searchRef  = useRef(null);
  const isMobile   = useIsMobile();
  const kbH        = useKeyboardHeight();

  const { ask, loading, cancel } = useGroq(CHAT_SYSTEM, { maxTokens: 320, temperature: 0.7, stream: true });

  // Voice input
  const voice = useVoiceInput({
    onResult: (text, isFinal) => { setInput(text); setCharCount(text.length); },
    onEnd: () => {},
  });

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  // Track scroll position to show/hide scroll button
  useEffect(() => {
    const el = msgsRef.current;
    if (!el) return;
    const fn = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 120);
    };
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { scrollToBottom(); }, [msgs, loading, scrollToBottom]);
  useEffect(() => {
    if (searchActive) { setTimeout(() => searchRef.current?.focus(), 100); }
    else setSearchQuery("");
  }, [searchActive]);
  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 350); return () => clearTimeout(t); }, []);

  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setShowSugg(false);
    setInput(""); setCharCount(0);
    const history = msgs.slice(1).map(({ role, content }) => ({ role, content }));
    const uid = Date.now();
    setMsgs(prev => [...prev, { role: "user", content: msg, ts: ts(), id: uid, final: true }]);

    const botId = uid + 1;
    setStreamingId(botId);
    setMsgs(prev => [...prev, { role: "assistant", content: "", ts: ts(), id: botId, final: false }]);

    await ask(msg, history, (partial) => {
      setMsgs(prev => prev.map(m => m.id === botId ? { ...m, content: partial } : m));
    });

    setMsgs(prev => prev.map(m => m.id === botId ? { ...m, final: true } : m));
    setStreamingId(null);
  }, [input, loading, msgs, ask]);

  // NEW: export conversation as markdown
  const exportChat = useCallback(() => {
    const lines = msgs.map(m =>
      `**${m.role === "user" ? "You" : "Perpetual's AI"}** (${m.ts})\n${m.content}`
    ).join("\n\n---\n\n");
    const blob = new Blob([`# Conversation with Perpetual's AI\n\n${lines}`], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `perpetual-chat-${Date.now()}.md`; a.click();
    setToast("💾 Chat exported!");
  }, [msgs]);

  const clearChat = useCallback(() => {
    setMsgs([{ role: "assistant", content: "Fresh start ✨ — what would you like to know about Perpetual?", ts: ts(), id: Date.now(), final: true }]);
    setShowSugg(true); setInput(""); setCharCount(0); setReactions({});
    setToast("🗑️ Chat cleared");
  }, []);

  const copyMsg = useCallback((id, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id); setTimeout(() => setCopiedId(null), 1800);
  }, []);

  const userCount = msgs.filter(m => m.role === "user").length;

  // Search highlight helper
  const highlight = (text, q) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase()
        ? <mark key={i} style={{ background: "rgba(232,98,42,0.3)", color: C.orangeL, borderRadius: 2 }}>{p}</mark>
        : p
    );
  };

  const filteredMsgs = useMemo(() => {
    if (!searchQuery.trim()) return msgs;
    return msgs.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [msgs, searchQuery]);

  const MAX_CHARS = 500;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Toolbar ── */}
      <div style={{
        padding: "6px 14px", borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0, background: "rgba(0,0,0,0.12)",
      }}>
        <span style={{ fontFamily: font.mono, fontSize: 9, color: "rgba(238,233,245,0.22)" }}>
          {userCount} message{userCount !== 1 ? "s" : ""}
        </span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[
            { label: "GH", href: "https://github.com/Perpetualisi" },
            { label: "LI", href: "https://linkedin.com/in/perpetual-okan" },
            { label: "✉",  href: "mailto:Perpetualokan0@gmail.com" },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer"
              style={{
                fontFamily: font.mono, fontSize: 9, padding: "3px 10px", borderRadius: 6,
                border: `1px solid ${C.border}`, color: C.muted, textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.orangeL; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
            >{label}</a>
          ))}
          {/* NEW: Export button */}
          <button onClick={exportChat} title="Export chat"
            style={{
              fontFamily: font.mono, fontSize: 9, padding: "3px 10px", borderRadius: 6,
              border: `1px solid ${C.border}`, background: "transparent", color: C.muted,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.orangeL; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >⬇</button>
          <button onClick={clearChat}
            style={{
              fontFamily: font.mono, fontSize: 9, padding: "3px 10px", borderRadius: 6,
              border: `1px solid ${C.border}`, background: "transparent", color: C.muted,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = "rgba(239,68,68,0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
          >clear</button>
        </div>
      </div>

      {/* ── NEW: Search bar ── */}
      <AnimatePresence>
        {searchActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ flexShrink: 0, overflow: "hidden" }}
          >
            <div style={{
              padding: "8px 12px", borderBottom: `1px solid ${C.border}`,
              background: "rgba(232,98,42,0.03)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontFamily: font.body, fontSize: 13, color: C.text,
                }}
              />
              {searchQuery && (
                <span style={{ fontFamily: font.mono, fontSize: 9, color: C.muted }}>
                  {filteredMsgs.length} result{filteredMsgs.length !== 1 ? "s" : ""}
                </span>
              )}
              <button onClick={() => { setSearchActive(false); setSearchQuery(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 16, lineHeight: 1 }}>
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div ref={msgsRef} className="po-scroll" style={{
        flex: 1, overflowY: "auto", padding: "16px 14px 8px",
        display: "flex", flexDirection: "column", gap: 16,
        WebkitOverflowScrolling: "touch", position: "relative",
      }}>
        {(searchQuery ? filteredMsgs : msgs).map((m) => (
          <motion.div key={m.id}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex", flexDirection: "column",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "84%", gap: 6,
            }}
          >
            {m.role === "assistant" && (
              <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, paddingLeft: 2 }}>
                Perpetual's AI
              </div>
            )}
            <div style={{
              padding: "11px 15px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
              background: m.role === "user"
                ? `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`
                : C.surfaceUp,
              border: m.role === "user" ? "none" : `1px solid ${C.border}`,
              boxShadow: m.role === "user"
                ? "0 4px 18px rgba(232,98,42,0.24)"
                : "0 2px 10px rgba(0,0,0,0.25)",
              color: m.role === "user" ? "#fff" : C.text,
              fontFamily: font.body,
              // FIX: bumped from 12.5/13.5 → 14/15
              fontSize: isMobile ? 15 : 14,
              lineHeight: 1.75, wordBreak: "break-word", position: "relative",
            }}>
              {searchQuery ? highlight(m.content, searchQuery) : m.content}
              {/* NEW: shimmer effect on streaming */}
              {streamingId === m.id && m.content.length === 0 && (
                <div style={{
                  width: 120, height: 14, borderRadius: 4,
                  background: `linear-gradient(90deg, ${C.border} 25%, rgba(232,98,42,0.08) 50%, ${C.border} 75%)`,
                  backgroundSize: "200% 100%",
                  animation: "po-shimmer 1.4s ease infinite",
                }} />
              )}
              {streamingId === m.id && m.content.length > 0 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  style={{
                    display: "inline-block", width: 2, height: "1em",
                    background: C.orange, marginLeft: 2, verticalAlign: "middle", borderRadius: 1,
                  }}
                />
              )}
            </div>

            {/* Meta row */}
            <div style={{
              display: "flex", gap: 5, alignItems: "center",
              flexDirection: m.role === "user" ? "row-reverse" : "row",
            }}>
              <span style={{ fontFamily: font.mono, fontSize: 8, color: "rgba(238,233,245,0.18)" }}>
                {m.ts}
              </span>
              {/* NEW: read receipt for user messages */}
              {m.role === "user" && (
                <span style={{ fontSize: 9, color: C.green, opacity: 0.7 }}>✓✓</span>
              )}
              {m.role === "assistant" && m.final && (
                <>
                  {["👍", "❤️"].map(emoji => (
                    <button key={emoji}
                      onClick={() => setReactions(p => ({ ...p, [m.id]: p[m.id] === emoji ? null : emoji }))}
                      style={{
                        background: reactions[m.id] === emoji ? "rgba(232,98,42,0.12)" : "transparent",
                        border: `1px solid ${reactions[m.id] === emoji ? C.borderHi : C.border}`,
                        borderRadius: 5, padding: "2px 6px", cursor: "pointer",
                        // FIX: bumped from 9px
                        fontSize: 11, transition: "all 0.15s", lineHeight: 1,
                      }}>
                      {emoji}
                    </button>
                  ))}
                  <button onClick={() => copyMsg(m.id, m.content)} style={{
                    background: "transparent", border: `1px solid ${C.border}`,
                    borderRadius: 5, padding: "2px 8px", cursor: "pointer",
                    // FIX: bumped from 7.5px
                    fontFamily: font.mono, fontSize: 9, color: C.muted, transition: "all 0.15s",
                  }}>
                    {copiedId === m.id ? "✓" : "copy"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}

        {loading && !streamingId && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ alignSelf: "flex-start" }}>
            <div style={{
              background: C.surfaceUp, border: `1px solid ${C.border}`,
              borderRadius: "4px 18px 18px 18px",
            }}>
              <TypingDots />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} style={{ height: 1 }} />

        {/* NEW: Toast */}
        <AnimatePresence>
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </AnimatePresence>

        {/* NEW: Scroll to bottom button */}
        <AnimatePresence>
          {showScrollBtn && <ScrollBtn onClick={scrollToBottom} />}
        </AnimatePresence>
      </div>

      {/* ── Suggestions ── */}
      <AnimatePresence>
        {showSugg && msgs.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: "2px 12px 10px", flexShrink: 0, overflow: "hidden" }}
          >
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUGGESTIONS.map((s, i) => (
                <motion.button key={s}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => send(s)} disabled={loading}
                  className="po-chip"
                  style={{ touchAction: "manipulation" }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input area ── */}
      <div style={{
        flexShrink: 0,
        borderTop: `1px solid ${C.border}`,
        background: "rgba(0,0,0,0.22)",
        paddingBottom: kbH > 0 ? 8 : "max(10px, env(safe-area-inset-bottom, 10px))",
      }}>
        <div style={{ padding: "10px 12px 0", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: C.glass,
            border: `1px solid ${input ? C.borderHi : C.border}`,
            borderRadius: 14, padding: "10px 14px", transition: "border-color 0.2s",
          }}>
            <input
              ref={inputRef} value={input}
              onChange={e => { setInput(e.target.value); setCharCount(e.target.value.length); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); send(); } }}
              placeholder={voice.listening ? "Listening…" : "Ask anything about Perpetual…"}
              disabled={loading}
              aria-label="Chat input"
              maxLength={MAX_CHARS}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontFamily: font.body,
                // FIX: bumped from 13px
                fontSize: isMobile ? 16 : 14,
                color: voice.listening ? C.orangeL : C.text, lineHeight: 1.4,
              }}
            />
          </div>

          {/* NEW: Voice input button */}
          {voice.supported && (
            <button
              onClick={voice.listening ? voice.stop : voice.start}
              title={voice.listening ? "Stop recording" : "Voice input"}
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                border: `1px solid ${voice.listening ? C.orange : C.border}`,
                cursor: "pointer",
                background: voice.listening ? "rgba(232,98,42,0.2)" : C.glass,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", touchAction: "manipulation",
              }}
            >
              {voice.listening ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={C.orange} stroke="none">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </motion.div>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>
          )}

          {/* Send / Cancel */}
          {loading ? (
            <button onClick={cancel} style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer",
              background: "rgba(239,68,68,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "manipulation",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#ef4444">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            </button>
          ) : (
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => send()} disabled={!input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                border: "none", cursor: input.trim() ? "pointer" : "default",
                background: input.trim() ? `linear-gradient(135deg, ${C.orange}, ${C.orangeD})` : C.glass,
                boxShadow: input.trim() ? "0 4px 16px rgba(232,98,42,0.32)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: input.trim() ? 1 : 0.35, transition: "all 0.18s", touchAction: "manipulation",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
            </motion.button>
          )}
        </div>

        {/* Footer meta row */}
        <div style={{ padding: "5px 14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: font.mono, fontSize: 8, color: "rgba(238,233,245,0.15)" }}>
            Groq · Llama 3.3-70b
          </span>
          {/* NEW: character counter */}
          <span style={{
            fontFamily: font.mono, fontSize: 8,
            color: charCount > MAX_CHARS * 0.85 ? C.orangeL : "rgba(238,233,245,0.15)",
            transition: "color 0.2s",
          }}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PITCH PANEL  — v2 with history, word-count progress, larger text
═══════════════════════════════════════════════════════════════ */
function PitchPanel() {
  const [step, setStep]               = useState("form");
  const [company, setCompany]         = useState("");
  const [role, setRole]               = useState("");
  const [tone, setTone]               = useState("professional");
  const [pitch, setPitch]             = useState("");
  const [streamPitch, setStreamPitch] = useState("");
  const [fieldErr, setFieldErr]       = useState("");
  const [genCount, setGenCount]       = useState(0);
  // NEW: pitch version history (last 3)
  const [history, setHistory]         = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const isMobile = useIsMobile();
  const { copied, copy } = useCopy();

  const { ask, loading } = useGroq(
    "Write exactly as instructed — output only the pitch text, nothing else.",
    { maxTokens: 360, temperature: 0.88, stream: true }
  );

  const wordCount  = useMemo(() => pitch.trim().split(/\s+/).filter(Boolean).length, [pitch]);
  const wordTarget = 115; // midpoint of 100-130
  const wordPct    = Math.min(100, Math.round((wordCount / wordTarget) * 100));

  const buildPrompt = useCallback((variant = "") =>
    PITCH_SYSTEM(tone, company.trim(), role.trim()) +
    (variant ? `\n\nIMPORTANT: ${variant}` : "\n\nNow write the pitch."),
  [tone, company, role]);

  const generate = useCallback(async (isRegen = false) => {
    if (!company.trim() || !role.trim()) { setFieldErr("Please fill in both fields."); return; }
    setFieldErr(""); setStep("generating"); setStreamPitch("");
    const prompt = isRegen
      ? buildPrompt("Write a completely different version — new opening, different projects mentioned, fresh closing.")
      : buildPrompt();
    const result = await ask(prompt, [], (partial) => setStreamPitch(partial));
    if (result?.trim().length > 20) {
      const trimmed = result.trim();
      setPitch(trimmed);
      // NEW: save to history
      setHistory(prev => [{ pitch: trimmed, company, role, tone, ts: ts() }, ...prev].slice(0, 3));
      setGenCount(n => n + 1);
      setStep("result");
    } else {
      setFieldErr("Generation failed — please try again."); setStep("form");
    }
  }, [company, role, ask, buildPrompt]);

  const reset = useCallback(() => {
    setStep("form"); setPitch(""); setStreamPitch(""); setFieldErr("");
    setCompany(""); setRole(""); setTone("professional"); setGenCount(0);
    setHistoryOpen(false);
  }, []);

  const shareEmail = useCallback(() => {
    window.open(`mailto:?subject=${encodeURIComponent(`Application — ${role} at ${company}`)}&body=${encodeURIComponent(pitch)}`);
  }, [pitch, role, company]);

  // NEW: LinkedIn message format
  const shareLinkedIn = useCallback(() => {
    const url = `https://www.linkedin.com/messaging/compose/?body=${encodeURIComponent(pitch)}`;
    window.open(url, "_blank");
  }, [pitch]);

  const inputStyle = (filled) => ({
    background: C.glass,
    border: `1px solid ${filled ? C.borderHi : C.border}`,
    borderRadius: 10, padding: "11px 14px", width: "100%", boxSizing: "border-box",
    fontFamily: font.body,
    // FIX: bumped from 13px
    fontSize: isMobile ? 16 : 14,
    color: C.text, outline: "none", transition: "border-color 0.2s",
  });

  return (
    <div className="po-scroll" style={{ overflowY: "auto", height: "100%", padding: "16px 14px", WebkitOverflowScrolling: "touch" }}>
      <AnimatePresence mode="wait">

        {/* ── FORM ── */}
        {step === "form" && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Intro card */}
            <div style={{
              padding: "13px 15px", borderRadius: 12,
              background: "rgba(232,98,42,0.04)", border: `1px solid ${C.border}`,
            }}>
              <p style={{ fontFamily: font.body, fontSize: 13, color: C.textSub, lineHeight: 1.7, margin: "0 0 10px" }}>
                Generate a personalised "hire me" pitch in Perpetual's voice — tailored to your company and role.
              </p>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["Three.js", "WebGL", "React", "Node.js", "Supabase", "Firebase", "REST API", "AI Chatbots"].map(s => (
                  <span key={s} style={{
                    fontFamily: font.mono, fontSize: 9, padding: "3px 9px", borderRadius: 100,
                    background: "rgba(232,98,42,0.07)", border: "1px solid rgba(232,98,42,0.16)",
                    color: C.orangeL, letterSpacing: "0.05em",
                  }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Quick fill */}
            <div>
              <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 9 }}>
                ⚡ Quick fill
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {PITCH_QUICK.map(s => {
                  const sel = company === s.company && role === s.role;
                  return (
                    <button key={s.company}
                      onClick={() => { setCompany(s.company); setRole(s.role); setFieldErr(""); }}
                      style={{
                        fontFamily: font.mono, fontSize: 9, padding: "5px 12px", borderRadius: 100,
                        cursor: "pointer", transition: "all 0.15s", touchAction: "manipulation",
                        border: `1px solid ${sel ? C.borderHi : "rgba(232,98,42,0.14)"}`,
                        background: sel ? "rgba(232,98,42,0.1)" : "rgba(232,98,42,0.03)",
                        color: sel ? C.orangeL : "rgba(238,233,245,0.35)",
                      }}
                    >{s.company}</button>
                  );
                })}
              </div>
            </div>

            {/* Company */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                🏢 Company name
              </label>
              <input value={company}
                onChange={e => { setCompany(e.target.value); setFieldErr(""); }}
                onKeyDown={e => e.key === "Enter" && company.trim() && role.trim() && generate()}
                placeholder="e.g. Google, Shopify, Stripe…" style={inputStyle(company)}
              />
            </div>

            {/* Role */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                💼 Role / position
              </label>
              <input value={role}
                onChange={e => { setRole(e.target.value); setFieldErr(""); }}
                onKeyDown={e => e.key === "Enter" && company.trim() && role.trim() && generate()}
                placeholder="e.g. Senior Frontend Engineer…" style={inputStyle(role)}
              />
            </div>

            {/* Tone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <label style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                🎨 Tone
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TONES.map(t => {
                  const sel = tone === t.id;
                  return (
                    <motion.button key={t.id} whileTap={{ scale: 0.96 }} onClick={() => setTone(t.id)}
                      style={{
                        padding: "11px 8px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${sel ? C.borderHi : C.border}`,
                        background: sel ? "rgba(232,98,42,0.1)" : C.glass,
                        color: sel ? C.orangeL : C.muted,
                        transition: "all 0.18s", textAlign: "center", touchAction: "manipulation",
                      }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                      {/* FIX: bumped labels */}
                      <div style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 700 }}>{t.label}</div>
                      <div style={{ fontFamily: font.mono, fontSize: 9, opacity: 0.55, marginTop: 2 }}>{t.desc}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {fieldErr && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  padding: "10px 12px", background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8,
                  fontFamily: font.mono, fontSize: 11, color: C.red,
                }}>
                {fieldErr}
              </motion.div>
            )}

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => generate(false)}
              disabled={!company.trim() || !role.trim() || loading}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
                cursor: company.trim() && role.trim() ? "pointer" : "not-allowed",
                fontFamily: font.mono, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase", transition: "all 0.2s",
                background: company.trim() && role.trim() ? `linear-gradient(135deg, ${C.orange}, ${C.orangeD})` : C.glass,
                color: company.trim() && role.trim() ? "#fff" : "rgba(238,233,245,0.18)",
                boxShadow: company.trim() && role.trim() ? "0 8px 28px rgba(232,98,42,0.28)" : "none",
                touchAction: "manipulation",
              }}
            >
              {company.trim() && role.trim() ? "✨ Generate Pitch" : "Fill both fields first"}
            </motion.button>

            {/* NEW: Pitch history accordion */}
            {history.length > 0 && (
              <div>
                <button onClick={() => setHistoryOpen(o => !o)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  fontFamily: font.mono, fontSize: 9, color: C.muted,
                  padding: "4px 0", letterSpacing: "0.1em",
                }}>
                  <span>📋 RECENT PITCHES ({history.length})</span>
                  <span style={{ transform: historyOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "block" }}>▾</span>
                </button>
                <AnimatePresence>
                  {historyOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8 }}>
                        {history.map((h, i) => (
                          <div key={i} onClick={() => { setCompany(h.company); setRole(h.role); setTone(h.tone); setPitch(h.pitch); setStep("result"); }}
                            style={{
                              padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                              background: C.glass, border: `1px solid ${C.border}`, transition: "all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontFamily: font.mono, fontSize: 9, color: C.orangeL }}>{h.company} · {h.role}</span>
                              <span style={{ fontFamily: font.mono, fontSize: 8, color: C.muted }}>{h.ts}</span>
                            </div>
                            <p style={{ fontFamily: font.body, fontSize: 12, color: C.textSub, margin: 0, lineHeight: 1.5,
                              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {h.pitch}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ── GENERATING ── */}
        {step === "generating" && (
          <motion.div key="generating"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "28px 0 8px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "2px solid rgba(232,98,42,0.1)",
                borderTop: `2px solid ${C.orange}`,
                animation: "po-spin 0.75s linear infinite",
              }} />
              <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, margin: 0 }}>
                Crafting your pitch…
              </p>
            </div>
            {streamPitch && (
              <div style={{
                background: C.glass, border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.orange}`,
                borderRadius: "0 12px 12px 0", padding: "15px 17px",
              }}>
                <p style={{
                  fontFamily: font.body, fontSize: isMobile ? 14 : 13.5,
                  lineHeight: 1.9, color: C.text, margin: 0, whiteSpace: "pre-wrap",
                }}>
                  {streamPitch}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.65, repeat: Infinity }}
                    style={{ display: "inline-block", width: 2, height: "1em", background: C.orange, marginLeft: 2, verticalAlign: "middle" }}
                  />
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && (
          <motion.div key="result"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Label row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <div style={{ padding: "5px 13px", borderRadius: 100, background: "rgba(232,98,42,0.08)", border: `1px solid ${C.borderHi}` }}>
                <span style={{ fontFamily: font.mono, fontSize: 9.5, fontWeight: 700, color: C.orangeL }}>
                  {company} · {role}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {genCount > 1 && <span style={{ fontFamily: font.mono, fontSize: 9, color: C.muted }}>v{genCount}</span>}
                <span style={{ fontFamily: font.mono, fontSize: 9, color: C.muted }}>{wordCount}w</span>
              </div>
            </div>

            {/* NEW: word count progress bar */}
            <div style={{ height: 2, borderRadius: 2, background: C.border, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${wordPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 2,
                  background: wordPct < 70 ? C.teal : wordPct <= 100 ? C.orange : C.red,
                }}
              />
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 8, color: C.muted, marginTop: -10 }}>
              {wordPct < 70 ? "Short" : wordPct <= 100 ? "On target" : "A touch long"} · {wordCount} / ~{wordTarget} words
            </div>

            {/* Pitch — FIX: removed maxHeight cap, natural scroll instead */}
            <div style={{
              background: C.glass, border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.orange}`,
              borderRadius: "0 12px 12px 0", padding: "17px 19px",
            }}>
              <p style={{
                fontFamily: font.body, fontSize: isMobile ? 14.5 : 14,
                lineHeight: 1.9, color: C.text, margin: 0, whiteSpace: "pre-wrap",
              }}>
                {pitch}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => copy(pitch)}
                style={{
                  padding: "13px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  fontFamily: font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", touchAction: "manipulation",
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                  color: "#fff", boxShadow: "0 4px 16px rgba(232,98,42,0.24)",
                }}>
                {copied ? "✓ Copied" : "📋 Copy"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => generate(true)} disabled={loading}
                style={{
                  padding: "13px 0", borderRadius: 10, border: "none",
                  cursor: loading ? "wait" : "pointer",
                  fontFamily: font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", touchAction: "manipulation",
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
                  color: "#fff", opacity: loading ? 0.5 : 1,
                  boxShadow: "0 4px 16px rgba(232,98,42,0.24)",
                }}>
                🔄 New Version
              </motion.button>
            </div>

            {/* NEW: share row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={shareEmail} style={{
                padding: "11px 0", borderRadius: 10, cursor: "pointer",
                fontFamily: font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", touchAction: "manipulation",
                background: "transparent", border: `1px solid ${C.borderHi}`,
                color: "rgba(232,98,42,0.7)", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,98,42,0.07)"; e.currentTarget.style.color = C.orangeL; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(232,98,42,0.7)"; }}
              >✉ Email</button>

              <button onClick={shareLinkedIn} style={{
                padding: "11px 0", borderRadius: 10, cursor: "pointer",
                fontFamily: font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", touchAction: "manipulation",
                background: "transparent", border: `1px solid ${C.borderHi}`,
                color: "rgba(232,98,42,0.7)", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,98,42,0.07)"; e.currentTarget.style.color = C.orangeL; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(232,98,42,0.7)"; }}
              >💼 LinkedIn</button>
            </div>

            <button onClick={reset} style={{
              background: "transparent", border: "none",
              fontFamily: font.mono, fontSize: 10, color: C.muted,
              cursor: "pointer", alignSelf: "center", transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = C.textSub}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
            >← Start over</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT PANEL  — v2 with collapsible skills accordion
═══════════════════════════════════════════════════════════════ */
function AboutPanel() {
  const { copied, copy } = useCopy();
  const [openSkill, setOpenSkill] = useState("3D & Creative");

  const projects = [
    { name: "ConotexTech",        url: "conotextech.com",                   tag: "Tech Corp Site" },
    { name: "WearEiko",           url: "weareiko.com",                      tag: "Fashion Brand"  },
    { name: "3D eCommerce Store", url: "my-ecommerce-nine-iota.vercel.app", tag: "Three.js Shop"  },
    { name: "Verra Perfume",      url: "verra-mu.vercel.app",               tag: "Luxury Brand"   },
    { name: "Ice Cream Brand",    url: "ice-cream-iota-peach.vercel.app",   tag: "Brand Site"     },
  ];

  const skillGroups = [
    { label: "3D & Creative", accent: C.orange, skills: ["Three.js", "WebGL", "GLSL Shaders", "React Three Fiber", "Framer Motion", "Canvas API", "SVG Animation"] },
    { label: "Frontend",      accent: C.teal,   skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"] },
    { label: "Backend",       accent: C.gold,   skills: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Firebase", "Supabase"] },
    { label: "Tools & APIs",  accent: C.textSub,skills: ["Git", "Docker", "Vercel", "AWS", "REST API", "Stripe", "Google Maps"] },
  ];

  return (
    <div className="po-scroll" style={{ overflowY: "auto", height: "100%", padding: "15px", WebkitOverflowScrolling: "touch" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Bio */}
        <div style={{
          padding: "15px 16px", borderRadius: 12,
          background: `linear-gradient(135deg, rgba(232,98,42,0.06), rgba(201,78,26,0.02))`,
          border: `1px solid ${C.borderHi}`,
        }}>
          <div style={{ fontFamily: font.mono, fontSize: 9, color: C.orange, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 9 }}>
            About Perpetual
          </div>
          {/* FIX: bumped from 12.5 */}
          <p style={{ fontFamily: font.body, fontSize: 13.5, lineHeight: 1.8, color: C.textSub, margin: "0 0 10px" }}>
            3D Web Developer &amp; Full-Stack Engineer specialising in Three.js, WebGL &amp; React. She builds immersive 3D experiences backed by full-stack architecture that actually ships.
          </p>
          <p style={{ fontFamily: font.body, fontSize: 13.5, lineHeight: 1.8, color: C.orange, margin: 0, fontStyle: "italic" }}>
            "The web is a 3D canvas. Most developers only use two dimensions — I use all three."
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* NEW: Skills accordion */}
        <div>
          <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 9 }}>
            Skills
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {skillGroups.map(({ label, accent, skills }) => {
              const open = openSkill === label;
              return (
                <div key={label} style={{ borderRadius: 10, border: `1px solid ${open ? accent + "33" : C.border}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button onClick={() => setOpenSkill(open ? null : label)} style={{
                    width: "100%", padding: "10px 12px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: open ? `rgba(${accent === C.orange ? "232,98,42" : accent === C.teal ? "20,184,166" : accent === C.gold ? "212,146,58" : "238,233,245"},0.05)` : "transparent",
                    border: "none", cursor: "pointer", transition: "background 0.2s",
                  }}>
                    <span style={{ fontFamily: font.mono, fontSize: 9.5, fontWeight: 700, color: open ? accent : C.muted, letterSpacing: "0.08em" }}>
                      {label}
                    </span>
                    <span style={{ color: accent, fontSize: 11, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "block" }}>▾</span>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        style={{ overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px 12px", display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {skills.map(s => (
                            <span key={s} style={{
                              fontFamily: font.mono, fontSize: 9, padding: "4px 10px", borderRadius: 100,
                              background: `rgba(${accent === C.orange ? "232,98,42" : accent === C.teal ? "20,184,166" : accent === C.gold ? "212,146,58" : "238,233,245"},0.07)`,
                              border: `1px solid ${accent}28`, color: accent, letterSpacing: "0.05em",
                            }}>{s}</span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Projects */}
        <div>
          <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 9 }}>
            Live Projects
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {projects.map((p) => (
              <a key={p.name} href={`https://${p.url}`} target="_blank" rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 13px", borderRadius: 10,
                  background: C.glass, border: `1px solid ${C.border}`,
                  textDecoration: "none", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.background = C.glassHov; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.glass; }}
              >
                <div>
                  {/* FIX: bumped from 12px */}
                  <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                  <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, marginTop: 2 }}>{p.url}</div>
                </div>
                <span style={{
                  fontFamily: font.mono, fontSize: 8.5, padding: "3px 9px", borderRadius: 100,
                  background: "rgba(232,98,42,0.07)", border: `1px solid ${C.borderHi}`,
                  color: C.orangeL, flexShrink: 0,
                }}>{p.tag}</span>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          padding: "15px", borderRadius: 12,
          background: "rgba(232,98,42,0.04)", border: `1px solid ${C.borderHi}`,
          display: "flex", flexDirection: "column", gap: 9,
        }}>
          <div style={{ fontFamily: font.mono, fontSize: 9, color: C.orangeL, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Open for opportunities
          </div>
          {/* FIX: bumped from 12px */}
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.textSub, margin: 0, lineHeight: 1.65 }}>
            Freelance from $50/hr · Full-time remote · 2–4 week delivery
          </p>
          <button onClick={() => copy("Perpetualokan0@gmail.com")}
            style={{
              padding: "11px 0", borderRadius: 9, border: "none",
              background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`,
              color: "#fff", fontFamily: font.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.15s", touchAction: "manipulation",
              boxShadow: "0 4px 16px rgba(232,98,42,0.24)",
            }}>
            {copied ? "✓ Email Copied!" : "✉ Copy Email Address"}
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { label: "GitHub",   href: "https://github.com/Perpetualisi"        },
              { label: "LinkedIn", href: "https://linkedin.com/in/perpetual-okan" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                flex: 1, padding: "9px 0", borderRadius: 9, textAlign: "center",
                fontFamily: font.mono, fontSize: 10, fontWeight: 700,
                color: C.muted, textDecoration: "none", border: `1px solid ${C.border}`,
                transition: "all 0.15s", letterSpacing: "0.1em",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.orangeL; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
              >{label}</a>
            ))}
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN WIDGET
═══════════════════════════════════════════════════════════════ */
export default function AIWidget() {
  const [isOpen, setIsOpen]         = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activeTab, setActiveTab]   = useState("chat");
  const [pulsed, setPulsed]         = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  // NEW: keyboard shortcut toast
  const [kbToast, setKbToast]       = useState(false);
  const isMobile = useIsMobile();

  const open = useCallback((tab = "chat") => {
    setActiveTab(tab); setIsOpen(true); setMenuOpen(false); setPulsed(true);
  }, []);
  const close = useCallback(() => { setIsOpen(false); setMenuOpen(false); setSearchActive(false); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) close(); else { open("chat"); setKbToast(true); setTimeout(() => setKbToast(false), 2000); }
      }
      if (e.key === "Escape" && (isOpen || menuOpen)) close();
      // NEW: ⌘/ → search
      if ((e.metaKey || e.ctrlKey) && e.key === "/" && isOpen && activeTab === "chat") {
        e.preventDefault(); setSearchActive(o => !o);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, menuOpen, open, close, activeTab]);

  // Real viewport height for iOS
  useEffect(() => {
    const setVH = () => document.documentElement.style.setProperty("--real-vh", `${window.innerHeight * 0.01}px`);
    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", () => setTimeout(setVH, 100));
    return () => window.removeEventListener("resize", setVH);
  }, []);

  const panelW = isMobile ? "calc(100vw - 20px)" : "min(430px, calc(100vw - 32px))";
  const panelH = isMobile
    ? "calc(var(--real-vh, 1vh) * 88)"
    : "min(640px, calc(var(--real-vh, 1vh) * 100 - 110px))";

  const menuItems = [
    { tab: "chat",  icon: "💬", label: "Ask Me",    y: isMobile ? -80  : -76  },
    { tab: "pitch", icon: "✨", label: "Hire Pitch", y: isMobile ? -142 : -136 },
    { tab: "about", icon: "👤", label: "About",      y: isMobile ? -204 : -196 },
  ];

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;600&family=Syne:wght@600;700&display=swap');

        .po-scroll::-webkit-scrollbar { width: 3px; }
        .po-scroll::-webkit-scrollbar-thumb { background: rgba(232,98,42,0.2); border-radius: 4px; }

        /* FIX: po-chip bumped from 9px → 11px */
        .po-chip {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; padding: 6px 14px; border-radius: 100px;
          cursor: pointer; border: 1px solid rgba(232,98,42,0.16);
          background: rgba(232,98,42,0.03); color: rgba(238,233,245,0.38);
          transition: all 0.15s; white-space: nowrap; line-height: 1.4;
          touch-action: manipulation;
        }
        .po-chip:hover { background: rgba(232,98,42,0.09); color: rgba(238,233,245,0.72); border-color: rgba(232,98,42,0.3); }
        .po-chip:active { transform: scale(0.95); }
        .po-chip:disabled { opacity: 0.4; cursor: not-allowed; }

        @keyframes po-spin    { to { transform: rotate(360deg); } }
        @keyframes po-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* ── Fan menu backdrop ── */}
      <AnimatePresence>
        {menuOpen && !isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Fan menu items ── */}
      <AnimatePresence>
        {menuOpen && !isOpen && menuItems.map(({ tab, icon, label, y }, i) => (
          <motion.button key={tab}
            initial={{ opacity: 0, y: 0, scale: 0.75 }}
            animate={{ opacity: 1, y, scale: 1 }}
            exit={{ opacity: 0, y: 0, scale: 0.75 }}
            transition={{ duration: 0.26, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => open(tab)} whileTap={{ scale: 0.92 }}
            style={{
              position: "fixed", bottom: isMobile ? 24 : 28, right: isMobile ? 20 : 28, zIndex: 1001,
              display: "flex", alignItems: "center", gap: 10,
              padding: "0 20px", height: isMobile ? 50 : 46, borderRadius: 100,
              border: `1px solid ${C.borderHi}`, background: C.surface, cursor: "pointer",
              boxShadow: "0 12px 36px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,98,42,0.04)",
              color: C.text, fontFamily: font.mono,
              // FIX: bumped from 9.5px
              fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              touchAction: "manipulation", whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 14 }}>{icon}</span>
            {label}
          </motion.button>
        ))}
      </AnimatePresence>

      {/* ── FAB ── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { if (isOpen) { close(); return; } setMenuOpen(o => !o); }}
        style={{
          position: "fixed", bottom: isMobile ? 24 : 28, right: isMobile ? 20 : 28, zIndex: 1002,
          width: isMobile ? 58 : 54, height: isMobile ? 58 : 54,
          borderRadius: "50%", border: "1px solid rgba(232,98,42,0.45)",
          background: `linear-gradient(145deg, ${C.orange}, ${C.orangeD})`,
          cursor: "pointer",
          boxShadow: `0 8px 32px rgba(232,98,42,0.44), 0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation",
        }}
      >
        {!pulsed && !isOpen && [
          { scale: [1, 1.8], opacity: [0.5, 0], border: `2px solid ${C.orange}`, inset: -8, delay: 0 },
          { scale: [1, 1.45], opacity: [0.32, 0], border: `1px solid rgba(232,98,42,0.5)`, inset: -3, delay: 0.55 },
        ].map((ring, i) => (
          <motion.div key={i}
            animate={{ scale: ring.scale, opacity: ring.opacity }}
            transition={{ duration: 2.4, repeat: Infinity, delay: ring.delay, ease: "easeOut" }}
            style={{ position: "absolute", inset: ring.inset, borderRadius: "50%", border: ring.border, pointerEvents: "none" }}
          />
        ))}

        <AnimatePresence mode="wait">
          {isOpen || menuOpen ? (
            <motion.div key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div key="bot"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                <circle cx="9" cy="14" r="1" fill="#fff" stroke="none"/>
                <circle cx="15" cy="14" r="1" fill="#fff" stroke="none"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── NEW: keyboard shortcut toast ── */}
      <AnimatePresence>
        {kbToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", bottom: isMobile ? 100 : 96, right: isMobile ? 20 : 28, zIndex: 1003,
              background: C.surfaceUp, border: `1px solid ${C.borderHi}`,
              borderRadius: 10, padding: "7px 13px",
              fontFamily: font.mono, fontSize: 10, color: C.orangeL,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)", pointerEvents: "none",
            }}
          >
            ⌘K opened · ⌘/ to search
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div key="panel"
            initial={{ opacity: 0, scale: 0.88, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 22 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: isMobile ? 92 : 96,
              right: isMobile ? 10 : 28,
              left: isMobile ? 10 : "auto",
              zIndex: 1001,
              width: panelW,
              height: panelH,
              borderRadius: 20,
              background: `linear-gradient(175deg, ${C.surfaceUp} 0%, ${C.surface} 40%, ${C.bg} 100%)`,
              border: `1px solid ${C.border}`,
              boxShadow: `0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(232,98,42,0.04), inset 0 1px 0 rgba(255,255,255,0.03)`,
              overflow: "hidden",
              transformOrigin: isMobile ? "bottom center" : "bottom right",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Top ambient glow */}
            <div style={{
              position: "absolute", top: 0, left: "40%", transform: "translateX(-50%)",
              width: "55%", height: 1,
              background: `linear-gradient(90deg, transparent, rgba(232,98,42,0.4), transparent)`,
              pointerEvents: "none",
            }} />

            <PanelHeader
              onClose={close}
              activeTab={activeTab}
              setActiveTab={(t) => { setActiveTab(t); setSearchActive(false); }}
              onSearch={() => setSearchActive(o => !o)}
              searchActive={searchActive}
            />

            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "chat" ? -10 : activeTab === "about" ? 10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  {activeTab === "chat"  && <ChatPanel searchActive={searchActive} setSearchActive={setSearchActive} />}
                  {activeTab === "pitch" && <PitchPanel />}
                  {activeTab === "about" && <AboutPanel />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={{
              padding: "6px 14px",
              borderTop: `1px solid rgba(232,98,42,0.07)`,
              background: "rgba(0,0,0,0.25)", flexShrink: 0,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontFamily: font.mono, fontSize: 8, color: "rgba(238,233,245,0.14)", letterSpacing: "0.08em" }}>
                Groq · Llama 3.3-70b · Free tier
              </span>
              {!isMobile && (
                <span style={{ fontFamily: font.mono, fontSize: 8, color: "rgba(238,233,245,0.14)", letterSpacing: "0.06em" }}>
                  ⌘K · ⌘/ search · Esc close
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}