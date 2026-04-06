// src/Components/AIWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ASK PERPETUAL · AI  +  HIRE ME PITCH GENERATOR
// Powered by Groq · Llama 3.3-70b
// MOBILE-OPTIMIZED - Fixes keyboard/input instability
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGroq } from "./hooks/Usegroq";

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
const T = {
  bg:      "#010103",
  card:    "#07070d",
  orange:  "#E8622A",
  orangeD: "#C94E1A",
  orangeG: "#F0845A",
  gold:    "#D4923A",
  text:    "#F2EEF8",
  muted:   "rgba(242,238,248,0.40)",
  faint:   "rgba(242,238,248,0.08)",
  border:  "rgba(232,98,42,0.18)",
  borderB: "rgba(255,255,255,0.06)",
  green:   "#22c55e",
  red:     "#ef4444",
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */
const PROFILE = `
Name: Perpetual Okan
Gender: Female (she/her pronouns always)
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

Real projects she has shipped:
1. WeareiIko (weareiko.com) — Fashion house for bespoke and bridal attire.
2. ConotexTech (conotextech.com) — Full website for a major US tech company.
3. 3D eCommerce Store (my-ecommerce-nine-iota.vercel.app) — Multi-product eCommerce platform with Three.js 3D hero.
4. Ice Cream brand site (ice-cream-iota-peach.vercel.app) — Playful animated brand website.
5. Perfume luxury brand (verra-mu.vercel.app) — Luxury perfume brand site.
6. Custom 3D Portfolio — Interactive portfolio with live Three.js background.
Total: 15+ projects shipped.

Availability:
  Freelance: open, starting at $50/hr, typical project turnaround 2–4 weeks
  Full-time remote: open
`.trim();

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPTS
═══════════════════════════════════════════════════════════════ */
const CHAT_SYSTEM = `You are an AI assistant on Perpetual Okan's portfolio website.

PROFILE:
${PROFILE}

RULES:
- Always use she/her pronouns for Perpetual.
- Keep answers concise: 2–4 sentences.
- Sound warm, human, and enthusiastic.
- Use occasional emojis where natural.
- Freelance starts at $50/hr.
- Never invent details not in the profile.
- No markdown bullet points or headers.`;

const PITCH_SYSTEM = (tone, company, role) => `You are writing a personalised "hire me" pitch FOR Perpetual Okan.
Write in first person as Perpetual.
Profile: ${PROFILE}

Target company: ${company || "the company"}
Target role: ${role || "the position"}
Tone: ${tone}

Requirements:
- Single paragraph, 100-150 words.
- No bullet points, no markdown.
- Mention 1-2 real projects.
- End with a call to action.
- Output ONLY the pitch text.`;

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  "What work does she do?",
  "Best projects? 🚀",
  "Available for hire? 💼",
  "Three.js experience?",
  "Hourly rate? 💰",
];

const TONES = [
  { id: "professional", label: "Professional", icon: "💼", desc: "Formal" },
  { id: "bold",         label: "Bold",         icon: "⚡", desc: "Confident" },
  { id: "friendly",     label: "Friendly",     icon: "😊", desc: "Warm" },
  { id: "creative",     label: "Creative",     icon: "🎨", desc: "Innovative" },
];

const timestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, []);
  return { copied, copy };
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "6px 10px" }}>
      {[0, 0.18, 0.36].map((d, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.85, delay: d, repeat: Infinity }}
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
   CHAT PANEL - Mobile Optimized
═══════════════════════════════════════════════════════════════ */
function ChatPanel({ onClose }) {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    content: "Hey! 👋 I'm Perpetual's AI assistant. Ask me anything about her skills, projects, or availability!",
    ts: timestamp(),
  }]);
  const [input, setInput] = useState("");
  const [showSugg, setShowSugg] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const { ask, loading, cancel } = useGroq(CHAT_SYSTEM, {
    maxTokens: 320,
    temperature: 0.72,
    enableCache: true,
  });

  // Detect keyboard on mobile
  useEffect(() => {
    const handleResize = () => {
      const isOpen = window.innerHeight < (window.originalInnerHeight || window.innerHeight);
      setIsKeyboardOpen(isOpen);
    };
    
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.originalInnerHeight = window.innerHeight;
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!isKeyboardOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [msgs, loading, isKeyboardOpen]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 280);
    return () => clearTimeout(t);
  }, []);

  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setShowSugg(false);
    setInput("");
    const history = msgs.map(({ role, content }) => ({ role, content }));

    setMsgs(prev => [...prev, { role: "user", content: msg, ts: timestamp() }]);

    const reply = await ask(msg, history);
    if (reply) {
      setMsgs(prev => [...prev, { role: "assistant", content: reply, ts: timestamp() }]);
    }
  }, [input, loading, msgs, ask]);

  const clearChat = useCallback(() => {
    setMsgs([{
      role: "assistant",
      content: "Chat cleared! 👋 Ask me anything about Perpetual's work.",
      ts: timestamp(),
    }]);
    setShowSugg(true);
    setInput("");
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      send();
    }
  }, [loading, send]);

  const userCount = msgs.filter(m => m.role === "user").length;

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{
        padding: "8px 14px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Space Mono',monospace", fontSize: 9,
          color: T.muted, background: "rgba(232,98,42,0.08)",
          padding: "3px 9px", borderRadius: 6,
        }}>
          💬 {userCount} {userCount === 1 ? "message" : "messages"}
        </span>
        <button
          onClick={clearChat}
          style={{
            background: "transparent", border: `1px solid ${T.borderB}`,
            borderRadius: 6, padding: "4px 9px", cursor: "pointer",
            fontFamily: "'Space Mono',monospace", fontSize: 9, color: T.muted,
          }}
        >
          Clear
        </button>
      </div>

      <div
        className="ai-msgs"
        style={{
          flex: 1, 
          overflowY: "auto", 
          padding: "14px",
          display: "flex", 
          flexDirection: "column", 
          gap: 10,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              display: "flex", flexDirection: "column",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%", gap: 3,
            }}
          >
            <div style={{
              padding: "9px 13px",
              borderRadius: m.role === "user"
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px",
              background: m.role === "user"
                ? `linear-gradient(135deg,${T.orange},${T.orangeD})`
                : "rgba(255,255,255,0.04)",
              border: m.role === "user" ? "none" : `1px solid ${T.borderB}`,
              color: m.role === "user" ? "#fff" : T.text,
              fontFamily: "'Space Mono',monospace",
              fontSize: 11, lineHeight: 1.75,
              wordBreak: "break-word",
            }}>
              {m.content}
            </div>
            <span style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 8, color: "rgba(242,238,248,0.18)",
            }}>
              {m.ts}
            </span>
          </motion.div>
        ))}

        {loading && (
          <div style={{ alignSelf: "flex-start" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.borderB}`,
              borderRadius: "16px 16px 16px 4px",
            }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {showSugg && msgs.length <= 1 && !isKeyboardOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "0 14px 10px",
              display: "flex", gap: 6, flexWrap: "wrap",
              flexShrink: 0,
            }}
          >
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                className="ai-sugg"
                onClick={() => send(s)}
                disabled={loading}
                style={{ touchAction: "manipulation" }}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        padding: "10px 14px",
        borderTop: `1px solid ${T.border}`,
        display: "flex", gap: 8, alignItems: "center",
        background: "rgba(0,0,0,0.25)",
        flexShrink: 0,
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
          style={{
            fontSize: window.innerWidth < 768 ? "16px" : "11px",
          }}
        />
        {loading ? (
          <button
            onClick={cancel}
            className="ai-send-btn"
            style={{ background: "rgba(239,68,68,0.18)", touchAction: "manipulation" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={() => send()}
            className="ai-send-btn"
            disabled={!input.trim()}
            style={{
              background: input.trim()
                ? `linear-gradient(135deg,${T.orange},${T.orangeD})`
                : "rgba(255,255,255,0.05)",
              opacity: input.trim() ? 1 : 0.5,
              touchAction: "manipulation",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={input.trim() ? "#fff" : "rgba(242,238,248,0.3)"}>
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PITCH PANEL - Mobile Optimized
═══════════════════════════════════════════════════════════════ */
function PitchPanel() {
  const [step, setStep] = useState("form");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("professional");
  const [pitch, setPitch] = useState("");
  const [fieldErr, setFieldErr] = useState("");
  const [genCount, setGenCount] = useState(0);

  const resultRef = useRef(null);
  const { copied, copy } = useCopy();

  const { ask, loading } = useGroq(
    "You are a pitch-writing assistant for Perpetual Okan.",
    { maxTokens: 380, temperature: 0.82 }
  );

  useEffect(() => {
    if (step === "result") {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    }
  }, [step]);

  const generate = useCallback(async () => {
    const c = company.trim();
    const r = role.trim();
    if (!c || !r) {
      setFieldErr("Please fill in both fields.");
      return;
    }
    setFieldErr("");
    setStep("loading");

    const userMsg = PITCH_SYSTEM(tone, c, r) + "\n\nNow write the pitch. Output ONLY the pitch text.";

    const result = await ask(userMsg);

    if (result && result.trim().length > 20) {
      setPitch(result.trim());
      setGenCount(n => n + 1);
      setStep("result");
    } else {
      setFieldErr("Generation failed — please try again.");
      setStep("form");
    }
  }, [company, role, tone, ask]);

  const regenerate = useCallback(async () => {
    setStep("loading");
    const userMsg = PITCH_SYSTEM(tone, company.trim(), role.trim()) +
      "\n\nWrite a DIFFERENT version of the pitch. Output ONLY the pitch text.";
    const result = await ask(userMsg);
    if (result && result.trim().length > 20) {
      setPitch(result.trim());
      setGenCount(n => n + 1);
      setStep("result");
    } else {
      setStep("result");
    }
  }, [company, role, tone, ask]);

  const reset = useCallback(() => {
    setStep("form");
    setPitch("");
    setFieldErr("");
    setCompany("");
    setRole("");
    setTone("professional");
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && company.trim() && role.trim()) generate();
  }, [company, role, generate]);

  return (
    <div style={{ overflowY: "auto", maxHeight: "100%", padding: "18px", WebkitOverflowScrolling: "touch" }}>
      <AnimatePresence mode="wait">

        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{
              padding: "11px 14px",
              background: "rgba(232,98,42,0.05)",
              borderRadius: 10, border: `1px solid ${T.border}`,
            }}>
              <p style={{
                fontFamily: "'Space Mono',monospace", fontSize: 10,
                color: T.muted, lineHeight: 1.65, margin: 0,
              }}>
                ✨ Generate a personalised pitch in Perpetual's voice.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label className="ai-label">🏢 Company name</label>
              <input
                className="ai-input ai-input-box"
                value={company}
                onChange={e => { setCompany(e.target.value); setFieldErr(""); }}
                onKeyDown={handleKey}
                placeholder="e.g. Google, Shopify…"
                style={{ fontSize: window.innerWidth < 768 ? "16px" : "11px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label className="ai-label">💼 Role / position</label>
              <input
                className="ai-input ai-input-box"
                value={role}
                onChange={e => { setRole(e.target.value); setFieldErr(""); }}
                onKeyDown={handleKey}
                placeholder="e.g. Senior Frontend Engineer…"
                style={{ fontSize: window.innerWidth < 768 ? "16px" : "11px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="ai-label">🎨 Tone & style</label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: 8,
              }}>
                {TONES.map(t => (
                  <button
                    key={t.id}
                    className={`ai-tone${tone === t.id ? " active" : ""}`}
                    onClick={() => setTone(t.id)}
                    style={{ touchAction: "manipulation" }}
                  >
                    <span style={{ fontSize: 15 }}>{t.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {fieldErr && (
              <div style={{
                padding: "9px 12px",
                background: "rgba(239,68,68,0.09)",
                border: `1px solid rgba(239,68,68,0.3)`,
                borderRadius: 8,
                fontSize: 10, color: T.red,
              }}>
                {fieldErr}
              </div>
            )}

            <motion.button
              className={`ai-generate${company.trim() && role.trim() ? " ready" : " disabled"}`}
              onClick={generate}
              disabled={!company.trim() || !role.trim() || loading}
              style={{ touchAction: "manipulation" }}
            >
              {company.trim() && role.trim() ? "✨ Generate pitch" : "📝 Fill both fields"}
            </motion.button>
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 20,
              padding: "52px 0",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: `2px solid rgba(232,98,42,0.14)`,
              borderTop: `2px solid ${T.orange}`,
              animation: "ai-spin 0.85s linear infinite",
            }} />
            <TypingDots />
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            ref={resultRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center",
              padding: "4px 12px", borderRadius: 100, alignSelf: "flex-start",
              background: "rgba(232,98,42,0.1)",
              border: `1px solid rgba(232,98,42,0.25)`,
            }}>
              <span style={{
                fontFamily: "'Space Mono',monospace", fontSize: 9,
                fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: T.orangeG,
              }}>
                {company} · {role}
              </span>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid rgba(232,98,42,0.14)`,
              borderLeft: `3px solid ${T.orange}`,
              borderRadius: "0 12px 12px 0",
              padding: "16px 18px",
              maxHeight: 260,
              overflowY: "auto",
            }}>
              <p style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11, lineHeight: 1.85,
                color: T.text, margin: 0,
                whiteSpace: "pre-wrap",
              }}>
                {pitch}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                className="ai-action"
                onClick={() => copy(pitch)}
                style={{ touchAction: "manipulation" }}
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </motion.button>

              <motion.button
                className="ai-action"
                onClick={regenerate}
                disabled={loading}
                style={{ touchAction: "manipulation", opacity: loading ? 0.5 : 1 }}
              >
                🔄 Regenerate
              </motion.button>
            </div>

            <button
              onClick={reset}
              style={{
                background: "transparent", border: "none",
                fontFamily: "'Space Mono',monospace",
                fontSize: 9, color: "rgba(242,238,248,0.25)",
                cursor: "pointer", padding: 0, alignSelf: "center",
              }}
            >
              ← Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL HEADER
═══════════════════════════════════════════════════════════════ */
function PanelHeader({ activeTab, onClose }) {
  return (
    <div style={{
      padding: "14px 18px",
      borderBottom: `1px solid ${T.border}`,
      background: "rgba(232,98,42,0.04)",
      display: "flex", alignItems: "center", gap: 12,
      flexShrink: 0,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
        background: "rgba(232,98,42,0.14)",
        border: `1px solid rgba(232,98,42,0.32)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {activeTab === "chat" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={T.orange} strokeWidth="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={T.orange} strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 11, fontWeight: 700,
          color: T.text,
        }}>
          {activeTab === "chat" ? "ASK PERPETUAL · AI" : "AI PITCH GENERATOR"}
        </div>
        <div style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 8, color: T.muted, marginTop: 2,
        }}>
          Groq · Llama 3
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${T.borderB}`,
          cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
          touchAction: "manipulation",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN WIDGET - Mobile Optimized (Single FAB with fan menu)
═══════════════════════════════════════════════════════════════ */
export default function AIWidget() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isOpen = menuOpen || activeTab !== null;

  const openTab = useCallback((tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setActiveTab(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        activeTab === "chat" ? closeAll() : openTab("chat");
      }
      if (e.key === "Escape" && isOpen) closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTab, isOpen, openTab, closeAll]);

  return (
    <>
      <style>{`
        .ai-input {
          flex: 1;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          padding: 9px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: ${T.text};
          outline: none;
          transition: border-color 0.2s;
        }
        @media (max-width: 768px) {
          .ai-input { font-size: 16px; padding: 12px 16px; }
          .ai-sugg { font-size: 10px; padding: 8px 14px; }
          .ai-tone { padding: 12px; }
          .ai-generate { padding: 14px 0; font-size: 11px; }
        }
        .ai-input-box { border-radius: 10px; width: 100%; box-sizing: border-box; }
        .ai-input:focus { border-color: rgba(232,98,42,0.42); background: rgba(255,255,255,0.055); }
        .ai-input::placeholder { color: rgba(242,238,248,0.18); }
        .ai-input:disabled { opacity: 0.45; }

        .ai-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(232,98,42,0.7);
        }

        .ai-sugg {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          padding: 5px 12px; border-radius: 100px;
          cursor: pointer;
          border: 1px solid rgba(232,98,42,0.2);
          background: rgba(232,98,42,0.05);
          color: rgba(242,238,248,0.42);
          transition: all 0.15s;
          white-space: nowrap;
        }
        .ai-sugg:active { transform: scale(0.96); background: rgba(232,98,42,0.15); }

        .ai-tone {
          font-family: 'Space Mono', monospace;
          padding: 9px 10px; border-radius: 10px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          color: rgba(242,238,248,0.32);
          transition: all 0.18s;
          width: 100%; text-align: left;
        }
        .ai-tone:active { transform: scale(0.98); }
        .ai-tone.active {
          background: rgba(232,98,42,0.12);
          border-color: rgba(232,98,42,0.42);
          color: ${T.orangeG};
        }

        .ai-generate {
          width: 100%; padding: 12px 0; border-radius: 10px;
          border: none; cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          transition: all 0.2s;
        }
        .ai-generate.ready {
          background: linear-gradient(135deg, ${T.orange}, ${T.orangeD});
          color: #fff;
          box-shadow: 0 8px 24px rgba(232,98,42,0.28);
        }
        .ai-generate.disabled {
          background: rgba(255,255,255,0.05);
          color: rgba(242,238,248,0.22);
          cursor: not-allowed;
        }
        .ai-generate:active { transform: scale(0.97); }

        .ai-action {
          flex: 1; padding: 10px 0; border-radius: 10px;
          cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          background: linear-gradient(135deg, ${T.orange}, ${T.orangeD});
          color: #fff;
          border: none;
        }
        .ai-action:active { transform: scale(0.97); }

        .ai-send-btn {
          width: 36px; height: 36px; border-radius: 50%;
          flex-shrink: 0; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s;
        }
        .ai-send-btn:active { transform: scale(0.94); }

        .ai-msgs::-webkit-scrollbar { width: 3px; }
        .ai-msgs::-webkit-scrollbar-thumb {
          background: rgba(232,98,42,0.25); border-radius: 4px;
        }

        @keyframes ai-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Fan menu buttons - shown on both desktop and mobile */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Ask Me button */}
            <motion.button
              initial={{ opacity: 0, y: 0, scale: 0.75 }}
              animate={{ opacity: 1, y: -70, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.75 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => openTab("chat")}
              whileHover={!isMobile ? { scale: 1.06 } : {}}
              whileTap={{ scale: 0.94 }}
              style={{
                position: "fixed", bottom: 28, right: 28, zIndex: 1001,
                display: "flex", alignItems: "center", gap: 8,
                padding: isMobile ? "0 16px" : "0 18px",
                height: isMobile ? 48 : 44,
                borderRadius: 100,
                border: `1px solid rgba(232,98,42,0.32)`,
                background: T.card,
                cursor: "pointer",
                boxShadow: "0 8px 26px rgba(0,0,0,0.6)",
                color: T.text,
                fontFamily: "'Space Mono',monospace",
                fontSize: isMobile ? 11 : 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                whiteSpace: "nowrap",
                touchAction: "manipulation",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={T.orange} strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Ask Me
              {!isMobile && <span style={{ fontSize: 8, color: "rgba(242,238,248,0.3)" }}>⌘K</span>}
            </motion.button>

            {/* Hire Me button */}
            <motion.button
              initial={{ opacity: 0, y: 0, scale: 0.75 }}
              animate={{ opacity: 1, y: -124, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.75 }}
              transition={{ duration: 0.24, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => openTab("pitch")}
              whileHover={!isMobile ? { scale: 1.06 } : {}}
              whileTap={{ scale: 0.94 }}
              style={{
                position: "fixed", bottom: 28, right: 28, zIndex: 1001,
                display: "flex", alignItems: "center", gap: 8,
                padding: isMobile ? "0 16px" : "0 18px",
                height: isMobile ? 48 : 44,
                borderRadius: 100,
                border: `1px solid rgba(232,98,42,0.32)`,
                background: T.card,
                cursor: "pointer",
                boxShadow: "0 8px 26px rgba(0,0,0,0.6)",
                color: T.text,
                fontFamily: "'Space Mono',monospace",
                fontSize: isMobile ? 11 : 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                whiteSpace: "nowrap",
                touchAction: "manipulation",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={T.orange} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Hire Me
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => {
          if (activeTab) { closeAll(); return; }
          setMenuOpen(o => !o);
        }}
        whileHover={!isMobile ? { scale: 1.08 } : {}}
        whileTap={{ scale: 0.93 }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1002,
          width: isMobile ? 56 : 54,
          height: isMobile ? 56 : 54,
          borderRadius: "50%",
          border: `1px solid rgba(232,98,42,0.38)`,
          background: `linear-gradient(135deg,${T.orange},${T.orangeD})`,
          cursor: "pointer",
          boxShadow: `0 8px 28px rgba(232,98,42,0.40), inset 0 1px 0 rgba(255,255,255,0.18)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "manipulation",
        }}
      >
        {/* Pulse ring - only when closed */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.65], opacity: [0.45, 0] }}
            transition={{ duration: 1.9, repeat: Infinity }}
            style={{
              position: "absolute", inset: -7, borderRadius: "50%",
              border: `1.5px solid ${T.orange}`, pointerEvents: "none",
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </motion.svg>
          ) : (
            <motion.svg key="ai"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="#fff" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              <circle cx="9" cy="14" r="1" fill="#fff" stroke="none"/>
              <circle cx="15" cy="14" r="1" fill="#fff" stroke="none"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAll}
            style={{
              position: "fixed", inset: 0, zIndex: 999,
              background: "rgba(0,0,0,0.38)",
              backdropFilter: "blur(3px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Active Panel */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: isMobile ? 94 : 94,
              right: 28,
              left: isMobile ? 16 : "auto",
              zIndex: 1001,
              width: isMobile ? "calc(100% - 32px)" : "min(390px, calc(100vw - 32px))",
              maxHeight: isMobile ? "calc(100vh - 120px)" : "min(560px, calc(100vh - 116px))",
              borderRadius: 22,
              background: T.card,
              border: `1px solid ${T.border}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.78), 0 0 0 1px rgba(232,98,42,0.07)",
              overflow: "hidden",
              transformOrigin: "bottom right",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <PanelHeader activeTab={activeTab} onClose={closeAll} />

            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {activeTab === "chat" && <ChatPanel onClose={closeAll} />}
              {activeTab === "pitch" && <PitchPanel />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}