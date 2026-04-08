// src/Components/AIWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PERPETUAL OKAN · AI ASSISTANT + PITCH GENERATOR
// Powered by Groq · Llama 3.3-70b (free tier)
// MOBILE-OPTIMIZED · PREMIUM EDITION
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   GROQ HOOK — Direct Groq API integration (free)
═══════════════════════════════════════════════════════════════ */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL   = "llama-3.3-70b-versatile";

function useGroq(systemPrompt, opts = {}) {
  const { maxTokens = 400, temperature = 0.72 } = opts;
  const [loading, setLoading]   = useState(false);
  const abortRef                = useRef(null);

  const ask = useCallback(async (userMessage, history = []) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const messages = [
        ...history.map(({ role, content }) => ({ role, content })),
        { role: "user", content: userMessage },
      ];

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:  "POST",
        signal:  controller.signal,
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model:       GROQ_MODEL,
          max_tokens:  maxTokens,
          temperature,
          messages:    [{ role: "system", content: systemPrompt }, ...messages],
        }),
      });

      if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? null;
    } catch (err) {
      if (err.name !== "AbortError") console.error("Groq error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [systemPrompt, maxTokens, temperature]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return { ask, loading, cancel };
}

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
const T = {
  bg:      "#010103",
  card:    "#080810",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  gold:    "#D4923A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  faint:   "rgba(242,238,248,0.06)",
  border:  "rgba(232,98,42,0.18)",
  borderB: "rgba(255,255,255,0.06)",
  green:   "#22c55e",
  red:     "#ef4444",
  glass:   "rgba(255,255,255,0.025)",
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */
const PROFILE = `
Name: Perpetual Okan
Gender: Female (always use she/her)
Role: 3D Web Developer & Full-Stack Engineer
Experience: 4+ years
Location: Lagos, Nigeria
Email: Perpetualokan0@gmail.com
GitHub: github.com/Perpetualisi
LinkedIn: linkedin.com/in/perpetual-okan

Technical Skills:
  Frontend: React, Next.js, TypeScript, Tailwind CSS, Framer Motion
  3D / WebGL: Three.js, React Three Fiber, WebGL, GLSL Shaders
  Backend: Node.js, Express, PostgreSQL, MongoDB, Firebase
  Tools: Git, Docker, Vercel, AWS

Featured Projects:
1. ConotexTech (conotextech.com) — Full website for a US-based IT company in Richmond, TX. Clean, fast, professional.
2. WearEiko (weareiko.com) — Fashion house website for bespoke & bridal attire. Elegant animations and strong brand identity.
3. 3D eCommerce Store (my-ecommerce-nine-iota.vercel.app) — Multi-product store with Three.js 3D interactive hero.
4. Verra Perfume (verra-mu.vercel.app) — Luxury perfume brand. Rich visuals, atmospheric dark theme, smooth scroll.
5. Ice Cream Brand (ice-cream-iota-peach.vercel.app) — Playful animated brand site showing range across brand personalities.
6. Custom 3D Portfolio — Interactive personal portfolio with live Three.js WebGL background.
Total: 15+ shipped projects across fashion, tech, eCommerce, and luxury sectors.

Availability & Rates:
  Freelance: open, from $50/hr, typical turnaround 2–4 weeks
  Full-time remote: open
  Contact: Perpetualokan0@gmail.com
`.trim();

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPTS
═══════════════════════════════════════════════════════════════ */
const CHAT_SYSTEM = `You are Perpetual Okan's AI assistant on her portfolio website. You speak AS her representative — knowledgeable, warm, and genuinely excited about her work.

PROFILE:
${PROFILE}

RULES:
- Always use she/her for Perpetual.
- Keep responses concise: 2–4 sentences max. Be informative but don't ramble.
- Write in flowing prose — no bullet points, no markdown headers, no bold text.
- Sound like a real person: warm, confident, occasionally enthusiastic. Light emojis are fine.
- When mentioning projects, include the live URL naturally in the sentence.
- For hiring/rates: freelance from $50/hr, full-time remote available, contact Perpetualokan0@gmail.com.
- Never invent details not in the profile. If unsure, say so honestly.
- Don't repeat yourself across messages in the same conversation.`;

const PITCH_SYSTEM = (tone, company, role) => `You are writing a "hire me" pitch for Perpetual Okan. Write in FIRST PERSON — as if Perpetual herself is writing it.

Profile: ${PROFILE}
Target company: ${company || "the company"}
Target role: ${role || "the position"}
Tone: ${tone}

STRICT REQUIREMENTS:
- Single paragraph, 100–140 words exactly.
- No bullet points, no markdown, no formatting whatsoever.
- Open with a hook that immediately establishes value for THIS specific role.
- Name 1–2 real projects with context relevant to the role.
- Mention specific tech skills that match what ${company} would need.
- Close with a confident, direct call to action.
- Sound human-written, not AI-templated.
- OUTPUT ONLY THE PITCH. No intro, no "Here is:", no quotation marks. Just the pitch text.`;

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  "What kind of work does she do?",
  "Show me her best projects 🚀",
  "Is she available to hire? 💼",
  "What's her Three.js experience?",
  "What's her rate? 💰",
  "Can she build full-stack apps?",
  "What's her design style like?",
  "How fast can she deliver?",
];

const PITCH_SUGGESTIONS = [
  { company: "Shopify",  role: "Senior Frontend Engineer" },
  { company: "Stripe",   role: "Frontend Developer" },
  { company: "Figma",    role: "Creative Technologist" },
  { company: "Vercel",   role: "Developer Advocate" },
  { company: "Netflix",  role: "UI Engineer" },
  { company: "Apple",    role: "Creative Developer" },
];

const TONES = [
  { id: "professional", label: "Professional", icon: "💼", desc: "Formal & polished" },
  { id: "bold",         label: "Bold",         icon: "⚡", desc: "Direct & confident" },
  { id: "friendly",     label: "Friendly",     icon: "😊", desc: "Warm & personable" },
  { id: "creative",     label: "Creative",     icon: "🎨", desc: "Unique & innovative" },
];

const QUICK_LINKS = [
  { label: "GitHub",   url: "https://github.com/Perpetualisi",              icon: "⌥" },
  { label: "LinkedIn", url: "https://linkedin.com/in/perpetual-okan",       icon: "in" },
  { label: "Email",    url: "mailto:Perpetualokan0@gmail.com",               icon: "✉" },
];

const timestamp = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text) => {
    const attempt = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    navigator.clipboard?.writeText(text).then(attempt).catch(() => {
      const el = Object.assign(document.createElement("textarea"), { value: text });
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      attempt();
    });
  }, []);
  return { copied, copy };
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 12px" }}>
      {[0, 0.18, 0.36].map((d, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, delay: d, repeat: Infinity }}
          style={{
            width: 5, height: 5, borderRadius: "50%",
            background: T.orange, display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE — Live online indicator
═══════════════════════════════════════════════════════════════ */
function StatusBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 100,
      background: "rgba(34,197,94,0.1)",
      border: "1px solid rgba(34,197,94,0.2)",
    }}>
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          width: 5, height: 5, borderRadius: "50%",
          background: T.green, display: "inline-block",
        }}
      />
      <span style={{
        fontFamily: "'Space Mono',monospace", fontSize: 8,
        color: T.green, letterSpacing: "0.1em",
      }}>
        AVAILABLE FOR WORK
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT PANEL
═══════════════════════════════════════════════════════════════ */
function ChatPanel() {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    content: "Hey! 👋 I'm Perpetual's AI assistant — I know her work inside out. Ask me anything about her projects, skills, or availability.",
    ts: timestamp(),
  }]);
  const [input, setInput]     = useState("");
  const [showSugg, setShowSugg] = useState(true);
  const [reactions, setReactions] = useState({});

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const { ask, loading, cancel } = useGroq(CHAT_SYSTEM, { maxTokens: 320, temperature: 0.7 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, loading]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setShowSugg(false);
    setInput("");
    const history = msgs.slice(1).map(({ role, content }) => ({ role, content }));
    setMsgs(prev => [...prev, { role: "user", content: msg, ts: timestamp() }]);
    const reply = await ask(msg, history);
    if (reply) setMsgs(prev => [...prev, { role: "assistant", content: reply.trim(), ts: timestamp() }]);
  }, [input, loading, msgs, ask]);

  const clearChat = useCallback(() => {
    setMsgs([{
      role: "assistant",
      content: "Fresh start! ✨ What would you like to know about Perpetual?",
      ts: timestamp(),
    }]);
    setShowSugg(true);
    setInput("");
    setReactions({});
  }, []);

  const toggleReaction = useCallback((i, emoji) => {
    setReactions(prev => ({
      ...prev,
      [i]: prev[i] === emoji ? null : emoji,
    }));
  }, []);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); send(); }
  };

  const userCount = msgs.filter(m => m.role === "user").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        padding: "8px 14px", borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0, background: "rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusBadge />
          <span style={{
            fontFamily: "'Space Mono',monospace", fontSize: 8,
            color: "rgba(242,238,248,0.2)",
          }}>
            {userCount} msg{userCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {QUICK_LINKS.map(({ label, url, icon }) => (
            <a key={label} href={url} target="_blank" rel="noreferrer"
              title={label}
              style={{
                background: "transparent", border: `1px solid ${T.borderB}`,
                borderRadius: 6, padding: "3px 7px", cursor: "pointer",
                fontFamily: "'Space Mono',monospace", fontSize: 8,
                color: T.muted, textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(232,98,42,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.borderB}
            >
              {icon}
            </a>
          ))}
          <button onClick={clearChat} style={{
            background: "transparent", border: `1px solid ${T.borderB}`,
            borderRadius: 6, padding: "3px 8px", cursor: "pointer",
            fontFamily: "'Space Mono',monospace", fontSize: 8, color: T.muted,
          }}>
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-msgs" style={{
        flex: 1, overflowY: "auto", padding: "14px",
        display: "flex", flexDirection: "column", gap: 10,
        WebkitOverflowScrolling: "touch",
      }}>
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex", flexDirection: "column",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%", gap: 4, position: "relative",
            }}
          >
            <div style={{
              padding: "9px 13px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user"
                ? `linear-gradient(135deg,${T.orange},${T.orangeD})`
                : T.glass,
              border: m.role === "user" ? "none" : `1px solid ${T.borderB}`,
              color: m.role === "user" ? "#fff" : T.text,
              fontFamily: "'Space Mono',monospace",
              fontSize: 11, lineHeight: 1.85, wordBreak: "break-word",
            }}>
              {m.content}
            </div>

            {/* Reactions for assistant messages */}
            {m.role === "assistant" && (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {["👍", "❤️"].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(i, emoji)}
                    style={{
                      background: reactions[i] === emoji
                        ? "rgba(232,98,42,0.15)"
                        : "transparent",
                      border: `1px solid ${reactions[i] === emoji ? "rgba(232,98,42,0.3)" : T.borderB}`,
                      borderRadius: 6, padding: "2px 6px",
                      cursor: "pointer", fontSize: 9,
                      transition: "all 0.15s",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
                <span style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 8, color: "rgba(242,238,248,0.15)", marginLeft: 2,
                }}>
                  {m.ts}
                </span>
              </div>
            )}
            {m.role === "user" && (
              <span style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 8, color: "rgba(242,238,248,0.15)",
              }}>
                {m.ts}
              </span>
            )}
          </motion.div>
        ))}

        {loading && (
          <div style={{ alignSelf: "flex-start" }}>
            <div style={{
              background: T.glass, border: `1px solid ${T.borderB}`,
              borderRadius: "16px 16px 16px 4px",
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {showSugg && msgs.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: "0 14px 10px", flexShrink: 0 }}
          >
            <div style={{
              display: "flex", gap: 6, flexWrap: "wrap",
              maxHeight: 90, overflow: "hidden",
            }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="ai-sugg" onClick={() => send(s)} disabled={loading}
                  style={{ touchAction: "manipulation" }}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{
        padding: "10px 14px", borderTop: `1px solid ${T.border}`,
        display: "flex", gap: 8, alignItems: "center",
        background: "rgba(0,0,0,0.3)", flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          className="ai-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask me anything…"
          disabled={loading}
          aria-label="Chat input"
          style={{ fontSize: window.innerWidth < 768 ? "16px" : "11px" }}
        />
        {loading ? (
          <button onClick={cancel} className="ai-send-btn"
            style={{ background: "rgba(239,68,68,0.2)", touchAction: "manipulation" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        ) : (
          <button onClick={() => send()} className="ai-send-btn" disabled={!input.trim()}
            style={{
              background: input.trim()
                ? `linear-gradient(135deg,${T.orange},${T.orangeD})`
                : "rgba(255,255,255,0.05)",
              opacity: input.trim() ? 1 : 0.45,
              touchAction: "manipulation",
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PITCH PANEL
═══════════════════════════════════════════════════════════════ */
function PitchPanel() {
  const [step, setStep]     = useState("form");
  const [company, setCompany] = useState("");
  const [role, setRole]     = useState("");
  const [tone, setTone]     = useState("professional");
  const [pitch, setPitch]   = useState("");
  const [fieldErr, setFieldErr] = useState("");
  const [genCount, setGenCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  const resultRef = useRef(null);
  const { copied, copy } = useCopy();

  const { ask, loading } = useGroq(
    "You are a pitch-writing assistant for Perpetual Okan. Write exactly as instructed — output only the pitch text, nothing else.",
    { maxTokens: 320, temperature: 0.85 }
  );

  useEffect(() => {
    if (step === "result") setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [step]);

  useEffect(() => {
    setWordCount(pitch.trim().split(/\s+/).filter(Boolean).length);
  }, [pitch]);

  const buildPrompt = useCallback((variant = "") =>
    PITCH_SYSTEM(tone, company.trim(), role.trim()) +
    (variant ? `\n\nWrite a FRESH version — different opening, different projects highlighted, different closing. ${variant}` : "\n\nNow write the pitch."),
  [tone, company, role]);

  const generate = useCallback(async () => {
    if (!company.trim() || !role.trim()) { setFieldErr("Please fill in both fields."); return; }
    setFieldErr("");
    setStep("loading");
    const result = await ask(buildPrompt());
    if (result?.trim().length > 20) {
      setPitch(result.trim());
      setGenCount(n => n + 1);
      setStep("result");
    } else {
      setFieldErr("Generation failed — please try again.");
      setStep("form");
    }
  }, [company, role, ask, buildPrompt]);

  const regenerate = useCallback(async () => {
    setStep("loading");
    const result = await ask(buildPrompt("Vary the angle, project examples, and closing completely."));
    if (result?.trim().length > 20) { setPitch(result.trim()); setGenCount(n => n + 1); }
    setStep("result");
  }, [ask, buildPrompt]);

  const reset = useCallback(() => {
    setStep("form"); setPitch(""); setFieldErr("");
    setCompany(""); setRole(""); setTone("professional"); setGenCount(0);
  }, []);

  const autofill = useCallback(({ company: c, role: r }) => {
    setCompany(c); setRole(r); setFieldErr("");
  }, []);

  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent(`Application — ${role} at ${company}`);
    const body    = encodeURIComponent(pitch);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [pitch, role, company]);

  return (
    <div style={{ overflowY: "auto", maxHeight: "100%", padding: "16px", WebkitOverflowScrolling: "touch" }}>
      <AnimatePresence mode="wait">

        {/* ── FORM ── */}
        {step === "form" && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div style={{
              padding: "10px 14px", background: "rgba(232,98,42,0.05)",
              borderRadius: 10, border: `1px solid ${T.border}`,
            }}>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.muted, lineHeight: 1.65, margin: 0 }}>
                ✨ Generate a personalised pitch in Perpetual's voice — tailored to the role and company.
              </p>
            </div>

            {/* Quick-fill suggestions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="ai-label">⚡ Quick fill</span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {PITCH_SUGGESTIONS.map(s => (
                  <button key={s.company}
                    onClick={() => autofill(s)}
                    className="ai-sugg"
                    style={{
                      fontSize: 8,
                      background: company === s.company && role === s.role
                        ? "rgba(232,98,42,0.15)" : "rgba(232,98,42,0.04)",
                      borderColor: company === s.company && role === s.role
                        ? "rgba(232,98,42,0.4)" : "rgba(232,98,42,0.15)",
                      touchAction: "manipulation",
                    }}
                  >
                    {s.company}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ai-label">🏢 Company name</label>
              <input className="ai-input ai-input-box" value={company}
                onChange={e => { setCompany(e.target.value); setFieldErr(""); }}
                onKeyDown={e => e.key === "Enter" && company.trim() && role.trim() && generate()}
                placeholder="e.g. Google, Shopify, Stripe…"
                style={{ fontSize: window.innerWidth < 768 ? "16px" : "11px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ai-label">💼 Role / position</label>
              <input className="ai-input ai-input-box" value={role}
                onChange={e => { setRole(e.target.value); setFieldErr(""); }}
                onKeyDown={e => e.key === "Enter" && company.trim() && role.trim() && generate()}
                placeholder="e.g. Senior Frontend Engineer…"
                style={{ fontSize: window.innerWidth < 768 ? "16px" : "11px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="ai-label">🎨 Tone & style</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {TONES.map(t => (
                  <button key={t.id}
                    className={`ai-tone${tone === t.id ? " active" : ""}`}
                    onClick={() => setTone(t.id)}
                    style={{ touchAction: "manipulation" }}
                  >
                    <span style={{ fontSize: 15 }}>{t.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, display: "block", marginTop: 2 }}>{t.label}</span>
                    <span style={{ fontSize: 8, opacity: 0.5, display: "block" }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {fieldErr && (
              <div style={{
                padding: "9px 12px", background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8,
                fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.red,
              }}>
                {fieldErr}
              </div>
            )}

            <button
              className={`ai-generate${company.trim() && role.trim() ? " ready" : " disabled"}`}
              onClick={generate}
              disabled={!company.trim() || !role.trim() || loading}
              style={{ touchAction: "manipulation" }}
            >
              {company.trim() && role.trim() ? "✨ Generate Pitch" : "📝 Fill both fields first"}
            </button>
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {step === "loading" && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "52px 0" }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              border: `2px solid rgba(232,98,42,0.12)`,
              borderTop: `2px solid ${T.orange}`,
              animation: "ai-spin 0.8s linear infinite",
            }} />
            <TypingDots />
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: T.muted, margin: 0 }}>
              Crafting your pitch…
            </p>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && (
          <motion.div key="result" ref={resultRef}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 6,
            }}>
              <div style={{
                padding: "4px 12px", borderRadius: 100,
                background: "rgba(232,98,42,0.1)",
                border: "1px solid rgba(232,98,42,0.22)",
              }}>
                <span style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 9,
                  fontWeight: 700, letterSpacing: "0.14em", color: T.orangeG,
                  textTransform: "uppercase",
                }}>
                  {company} · {role}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(242,238,248,0.2)" }}>
                  {wordCount}w
                </span>
                {genCount > 1 && (
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(242,238,248,0.2)" }}>
                    v{genCount}
                  </span>
                )}
              </div>
            </div>

            <div style={{
              background: T.glass,
              border: "1px solid rgba(232,98,42,0.12)",
              borderLeft: `3px solid ${T.orange}`,
              borderRadius: "0 12px 12px 0",
              padding: "16px 18px",
              maxHeight: 200, overflowY: "auto",
            }}>
              <p style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11, lineHeight: 1.95,
                color: T.text, margin: 0, whiteSpace: "pre-wrap",
              }}>
                {pitch}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button className="ai-action" onClick={() => copy(pitch)} style={{ touchAction: "manipulation" }}>
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
              <button className="ai-action" onClick={regenerate} disabled={loading}
                style={{ opacity: loading ? 0.5 : 1, touchAction: "manipulation" }}>
                🔄 New Version
              </button>
            </div>

            <button className="ai-action-secondary" onClick={shareViaEmail} style={{ touchAction: "manipulation" }}>
              ✉ Send via Email
            </button>

            <button onClick={reset} style={{
              background: "transparent", border: "none",
              fontFamily: "'Space Mono',monospace", fontSize: 9,
              color: "rgba(242,238,248,0.22)", cursor: "pointer", padding: 0, alignSelf: "center",
            }}>
              ← Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB BAR
═══════════════════════════════════════════════════════════════ */
function TabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "chat",  label: "Ask Me",  icon: "💬" },
    { id: "pitch", label: "Hire Me", icon: "⚡" },
  ];
  return (
    <div style={{
      display: "flex", gap: 4, padding: "8px 14px",
      borderBottom: `1px solid ${T.border}`,
      background: "rgba(0,0,0,0.25)", flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          style={{
            flex: 1, padding: "7px 0",
            border: activeTab === t.id ? `1px solid rgba(232,98,42,0.35)` : `1px solid ${T.borderB}`,
            borderRadius: 8, cursor: "pointer",
            background: activeTab === t.id ? "rgba(232,98,42,0.1)" : "transparent",
            fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: activeTab === t.id ? T.orangeG : T.muted,
            transition: "all 0.18s", touchAction: "manipulation",
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL HEADER
═══════════════════════════════════════════════════════════════ */
function PanelHeader({ onClose }) {
  return (
    <div style={{
      padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
      background: "rgba(232,98,42,0.03)",
      display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, rgba(232,98,42,0.25), rgba(201,78,26,0.15))`,
        border: `1.5px solid rgba(232,98,42,0.35)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14,
      }}>
        🧑‍💻
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Space Mono',monospace", fontSize: 11,
          fontWeight: 700, color: T.text, letterSpacing: "0.04em",
        }}>
          PERPETUAL · AI
        </div>
        <div style={{
          fontFamily: "'Space Mono',monospace", fontSize: 7,
          color: T.muted, marginTop: 1, letterSpacing: "0.1em",
        }}>
          Groq · Llama 3.3-70b · Free
        </div>
      </div>

      <button onClick={onClose} style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderB}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        touchAction: "manipulation",
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN WIDGET
═══════════════════════════════════════════════════════════════ */
export default function AIWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [menuOpen, setMenuOpen]   = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [pulse, setPulse]         = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Stop pulsing after first open
  const handleOpen = useCallback((tab = "chat") => {
    setActiveTab(tab);
    setIsOpen(true);
    setMenuOpen(false);
    setPulse(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMenuOpen(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? handleClose() : handleOpen("chat");
      }
      if (e.key === "Escape" && (isOpen || menuOpen)) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, menuOpen, handleOpen, handleClose]);

  return (
    <>
      <style>{`
        .ai-input {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          padding: 9px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: ${T.text};
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .ai-input:focus { border-color: rgba(232,98,42,0.45); background: rgba(255,255,255,0.05); }
        .ai-input::placeholder { color: rgba(242,238,248,0.16); }
        .ai-input:disabled { opacity: 0.4; }
        .ai-input-box { border-radius: 10px; width: 100%; box-sizing: border-box; }

        .ai-label {
          font-family: 'Space Mono', monospace;
          font-size: 8px; font-weight: 700;
          letter-spacing: 0.24em; text-transform: uppercase;
          color: rgba(232,98,42,0.65);
        }

        .ai-sugg {
          font-family: 'Space Mono', monospace;
          font-size: 9px; padding: 5px 11px; border-radius: 100px;
          cursor: pointer;
          border: 1px solid rgba(232,98,42,0.18);
          background: rgba(232,98,42,0.04);
          color: rgba(242,238,248,0.38);
          transition: all 0.15s; white-space: nowrap;
        }
        .ai-sugg:hover { background: rgba(232,98,42,0.1); color: rgba(242,238,248,0.65); border-color: rgba(232,98,42,0.3); }
        .ai-sugg:active { transform: scale(0.96); }

        .ai-tone {
          font-family: 'Space Mono', monospace;
          padding: 10px 8px; border-radius: 10px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          background: transparent;
          color: rgba(242,238,248,0.3);
          transition: all 0.18s; width: 100%; text-align: center;
        }
        .ai-tone:hover { background: rgba(232,98,42,0.06); border-color: rgba(232,98,42,0.2); color: rgba(242,238,248,0.5); }
        .ai-tone.active { background: rgba(232,98,42,0.12); border-color: rgba(232,98,42,0.42); color: ${T.orangeG}; }
        .ai-tone:active { transform: scale(0.97); }

        .ai-generate {
          width: 100%; padding: 12px 0; border-radius: 10px;
          border: none; cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.2s;
        }
        .ai-generate.ready {
          background: linear-gradient(135deg, ${T.orange}, ${T.orangeD});
          color: #fff; box-shadow: 0 8px 24px rgba(232,98,42,0.26);
        }
        .ai-generate.ready:hover { box-shadow: 0 12px 32px rgba(232,98,42,0.36); transform: translateY(-1px); }
        .ai-generate.disabled { background: rgba(255,255,255,0.04); color: rgba(242,238,248,0.2); cursor: not-allowed; }
        .ai-generate:active { transform: scale(0.97) !important; }

        .ai-action {
          flex: 1; padding: 10px 0; border-radius: 10px; cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          background: linear-gradient(135deg, ${T.orange}, ${T.orangeD});
          color: #fff; border: none; transition: all 0.15s;
        }
        .ai-action:hover { box-shadow: 0 6px 18px rgba(232,98,42,0.28); transform: translateY(-1px); }
        .ai-action:active { transform: scale(0.97); }

        .ai-action-secondary {
          width: 100%; padding: 9px 0; border-radius: 10px; cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(232,98,42,0.25);
          color: rgba(232,98,42,0.7);
          transition: all 0.15s;
        }
        .ai-action-secondary:hover { background: rgba(232,98,42,0.06); border-color: rgba(232,98,42,0.4); color: ${T.orangeG}; }
        .ai-action-secondary:active { transform: scale(0.97); }

        .ai-send-btn {
          width: 36px; height: 36px; border-radius: 50%;
          flex-shrink: 0; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s;
        }
        .ai-send-btn:active { transform: scale(0.93); }

        .ai-msgs::-webkit-scrollbar { width: 2px; }
        .ai-msgs::-webkit-scrollbar-thumb { background: rgba(232,98,42,0.2); border-radius: 4px; }

        @keyframes ai-spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .ai-input { font-size: 16px !important; padding: 12px 16px; }
          .ai-sugg { font-size: 10px; padding: 8px 13px; }
          .ai-tone { padding: 12px 8px; }
          .ai-generate { padding: 14px 0; font-size: 11px; }
        }
      `}</style>

      {/* ── FAB menu ── */}
      <AnimatePresence>
        {menuOpen && !isOpen && (
          <>
            {[
              { label: "Ask Me",  tab: "chat",  icon: "💬", y: -72 },
              { label: "Hire Me", tab: "pitch", icon: "⚡", y: -130 },
            ].map(({ label, tab, icon, y }) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y, scale: 1 }}
                exit={{ opacity: 0, y: 0, scale: 0.8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleOpen(tab)}
                whileTap={{ scale: 0.93 }}
                style={{
                  position: "fixed", bottom: 28, right: 28, zIndex: 1001,
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 18px",
                  height: isMobile ? 48 : 44, borderRadius: 100,
                  border: "1px solid rgba(232,98,42,0.3)",
                  background: T.card, cursor: "pointer",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
                  color: T.text, fontFamily: "'Space Mono',monospace",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                  touchAction: "manipulation",
                }}
              >
                <span style={{ fontSize: 12 }}>{icon}</span>
                {label}
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 999,
                background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Main FAB ── */}
      <motion.button
        onClick={() => {
          if (isOpen) { handleClose(); return; }
          setMenuOpen(o => !o);
        }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1002,
          width: isMobile ? 56 : 52, height: isMobile ? 56 : 52,
          borderRadius: "50%",
          border: "1px solid rgba(232,98,42,0.4)",
          background: `linear-gradient(135deg,${T.orange},${T.orangeD})`,
          cursor: "pointer",
          boxShadow: `0 8px 28px rgba(232,98,42,0.38), inset 0 1px 0 rgba(255,255,255,0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "manipulation",
        }}
      >
        {/* Pulse ring */}
        {pulse && !isOpen && (
          <motion.div
            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: "absolute", inset: -6, borderRadius: "50%",
              border: `1.5px solid ${T.orange}`, pointerEvents: "none",
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {isOpen || menuOpen ? (
            <motion.svg key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </motion.svg>
          ) : (
            <motion.svg key="ai"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              <circle cx="9" cy="14" r="1" fill="#fff" stroke="none"/>
              <circle cx="15" cy="14" r="1" fill="#fff" stroke="none"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: isMobile ? 92 : 90,
              right: 28,
              left: isMobile ? 16 : "auto",
              zIndex: 1001,
              width: isMobile ? "calc(100% - 32px)" : "min(400px, calc(100vw - 32px))",
              maxHeight: isMobile ? "calc(100vh - 116px)" : "min(580px, calc(100vh - 114px))",
              borderRadius: 20,
              background: T.card,
              border: `1px solid ${T.border}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(232,98,42,0.06)",
              overflow: "hidden",
              transformOrigin: "bottom right",
              display: "flex", flexDirection: "column",
            }}
          >
            <PanelHeader onClose={handleClose} />
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "chat" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  {activeTab === "chat"  && <ChatPanel />}
                  {activeTab === "pitch" && <PitchPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}