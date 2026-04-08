// src/Components/AIWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PERPETUAL OKAN · AI ASSISTANT + PITCH GENERATOR
// Powered by Groq · Llama 3.3-70b (free tier)
// PREMIUM EDITION · FULLY MOBILE RESPONSIVE
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   GROQ HOOK
═══════════════════════════════════════════════════════════════ */
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL   = "llama-3.3-70b-versatile";

function useGroq(systemPrompt, opts = {}) {
  const { maxTokens = 400, temperature = 0.72 } = opts;
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const ask = useCallback(async (userMessage, history = []) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: maxTokens,
          temperature,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.map(({ role, content }) => ({ role, content })),
            { role: "user", content: userMessage },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Groq error: ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? null;
    } catch (err) {
      if (err.name !== "AbortError") console.error("Groq error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [systemPrompt, maxTokens, temperature]);

  const cancel = useCallback(() => { abortRef.current?.abort(); setLoading(false); }, []);
  return { ask, loading, cancel };
}

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
const T = {
  bg:       "#010103",
  card:     "#07070f",
  cardAlt:  "#0b0b18",
  orange:   "#E8622A",
  orangeD:  "#C94E1A",
  orangeG:  "#F0845A",
  orangeXL: "#F5A07A",
  gold:     "#D4923A",
  text:     "#F2EEF8",
  textSub:  "rgba(242,238,248,0.55)",
  muted:    "rgba(242,238,248,0.35)",
  faint:    "rgba(242,238,248,0.06)",
  border:   "rgba(232,98,42,0.16)",
  borderB:  "rgba(255,255,255,0.055)",
  green:    "#22c55e",
  red:      "#ef4444",
  glass:    "rgba(255,255,255,0.022)",
  glassHov: "rgba(255,255,255,0.04)",
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
  Backend: Node.js, Express, PostgreSQL, MongoDB, Firebase, Supabase
  API Work: REST API design and integration, third-party API connections (Stripe, Google Maps, auth, social feeds, etc.)
  AI & Chatbots: builds AI-powered chatbots and virtual assistants using LLM APIs
  Tools: Git, Docker, Vercel, AWS

Backend services she provides:
- Connects apps to third-party APIs (Stripe, Google Maps, social login, data feeds, etc.)
- Builds AI chatbots and virtual assistants that help users get real things done
- Uses Firebase for real-time data, user auth, and cloud hosting
- Uses Supabase as a modern backend — database, auth, and file storage all in one
- Designs and builds REST APIs with Node.js and Express
- Handles auth flows, file uploads, cloud storage, and live data syncing

Featured Projects (live):
1. ConotexTech — conotextech.com — Website for a US tech company in Richmond, TX. Fast, clean, professional.
2. WearEiko — weareiko.com — Fashion and bridal brand site. Smooth animations, strong visual identity.
3. 3D eCommerce Store — my-ecommerce-nine-iota.vercel.app — Online shop with a Three.js 3D hero. Real products, real cart.
4. Verra Perfume — verra-mu.vercel.app — Luxury perfume brand. Dark, atmospheric, smooth scroll animations.
5. Ice Cream Brand Site — ice-cream-iota-peach.vercel.app — Fun, playful, animated brand site.
6. Custom 3D Portfolio — Live Three.js background, interactive and immersive.

Total shipped: 15+ projects across fashion, tech, eCommerce, and luxury.

Rates & Availability:
  Freelance: open — from $50/hr, 2-4 week turnaround
  Full-time remote: open
  Contact: Perpetualokan0@gmail.com
`.trim();

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPTS
═══════════════════════════════════════════════════════════════ */
const CHAT_SYSTEM = `You are Perpetual Okan's AI assistant on her portfolio website.

PROFILE:
${PROFILE}

HOW TO RESPOND:
- Always use she/her for Perpetual.
- Keep replies short — 2 to 3 sentences max. Never ramble.
- Use simple, everyday words. Skip jargon unless someone asks for it.
- Sound like a warm, real person — friendly and genuinely excited about her work.
- One emoji per reply if it feels natural. Don't force it.
- When mentioning a project, include the live link.
- Rates: freelance from $50/hr, full-time remote open, contact Perpetualokan0@gmail.com.
- Never make up info not in the profile. Just say you're not sure if needed.
- No bullet points, no bold text, no headers. Plain conversational sentences only.`;

const PITCH_SYSTEM = (tone, company, role) => `Write a "hire me" pitch for Perpetual Okan in first person (as Perpetual writing to a client or employer).

Profile: ${PROFILE}
Company: ${company || "the company"}
Role: ${role || "the position"}
Tone: ${tone}

Rules:
- One paragraph, 100-130 words. Short and punchy.
- Plain prose — no bullet points, no markdown.
- Open with something that grabs attention right away.
- Mention 1-2 real projects with a quick note on what she built.
- Include a backend or AI skill if it fits the role (API integration, chatbot, Firebase, Supabase, etc.).
- End with a clear, confident call to action.
- Sound like a real human wrote it — not a template.
- Output ONLY the pitch text. No intro, no labels. Just the pitch.`;

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  "What kind of work does she do?",
  "Tell me about her best projects 🚀",
  "Can she build chatbots? 🤖",
  "Does she work with APIs?",
  "What's her Three.js experience?",
  "Firebase or Supabase?",
  "Is she available for hire? 💼",
  "What's her hourly rate? 💰",
  "Can she build full-stack apps?",
];

const PITCH_QUICK = [
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
  { label: "GitHub",   href: "https://github.com/Perpetualisi",        icon: "⌥", title: "GitHub" },
  { label: "LinkedIn", href: "https://linkedin.com/in/perpetual-okan", icon: "in", title: "LinkedIn" },
  { label: "Email",    href: "mailto:Perpetualokan0@gmail.com",         icon: "✉",  title: "Email" },
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
  const [mob, setMob] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}

/* ═══════════════════════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════════════════════ */
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "9px 13px" }}>
      {[0, 0.18, 0.36].map((d, i) => (
        <motion.span key={i}
          animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, delay: d, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange, display: "inline-block" }}
        />
      ))}
    </div>
  );
}

function StatusPill() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)",
    }}>
      <motion.span
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, display: "block" }}
      />
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: T.green, letterSpacing: "0.1em" }}>
        AVAILABLE FOR WORK
      </span>
    </div>
  );
}

/* Animated character-by-character text reveal */
function StreamText({ text }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 8);
    return () => clearInterval(id);
  }, [text]);
  return <>{displayed}</>;
}

/* Skill badge row */
function SkillBadges({ skills }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
      {skills.map(s => (
        <span key={s} style={{
          fontFamily: "'Space Mono',monospace", fontSize: 8,
          padding: "3px 8px", borderRadius: 100,
          background: "rgba(232,98,42,0.07)",
          border: "1px solid rgba(232,98,42,0.18)",
          color: T.orangeG, letterSpacing: "0.06em",
        }}>{s}</span>
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
      padding: "12px 16px",
      borderBottom: `1px solid ${T.border}`,
      background: `linear-gradient(180deg, rgba(232,98,42,0.04) 0%, transparent 100%)`,
      display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
    }}>
      {/* Avatar with glow */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          position: "absolute", inset: -3, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(232,98,42,0.3) 0%, transparent 70%)`,
        }} />
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `linear-gradient(135deg, rgba(232,98,42,0.22), rgba(201,78,26,0.12))`,
          border: `1.5px solid rgba(232,98,42,0.38)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, position: "relative",
        }}>
          🧑‍💻
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Space Mono',monospace", fontSize: 11.5,
          fontWeight: 700, color: T.text, letterSpacing: "0.06em",
        }}>
          PERPETUAL <span style={{ color: T.orange }}>·</span> AI
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: T.muted, marginTop: 2, letterSpacing: "0.1em" }}>
          Groq · Llama 3.3-70b · Free
        </div>
      </div>

      <StatusPill />

      <button onClick={onClose} style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderB}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", flexShrink: 0, touchAction: "manipulation",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = T.borderB; }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB BAR
═══════════════════════════════════════════════════════════════ */
function TabBar({ activeTab, setActiveTab }) {
  return (
    <div style={{
      display: "flex", gap: 4, padding: "8px 14px",
      borderBottom: `1px solid ${T.border}`,
      background: "rgba(0,0,0,0.18)", flexShrink: 0,
    }}>
      {[
        { id: "chat",  icon: "💬", label: "Ask Me"  },
        { id: "pitch", icon: "⚡", label: "Hire Me" },
      ].map(t => (
        <button key={t.id} onClick={() => setActiveTab(t.id)}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 9, cursor: "pointer",
            border: activeTab === t.id ? "1px solid rgba(232,98,42,0.38)" : `1px solid ${T.borderB}`,
            background: activeTab === t.id
              ? "linear-gradient(135deg, rgba(232,98,42,0.14), rgba(201,78,26,0.06))"
              : "transparent",
            fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: activeTab === t.id ? T.orangeG : T.muted,
            transition: "all 0.18s", touchAction: "manipulation",
            position: "relative", overflow: "hidden",
          }}
        >
          {activeTab === t.id && (
            <motion.div
              layoutId="tabActive"
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, rgba(232,98,42,0.08), transparent)",
                borderRadius: 9,
              }}
              transition={{ duration: 0.2 }}
            />
          )}
          <span style={{ position: "relative" }}>{t.icon} {t.label}</span>
        </button>
      ))}
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
    ts: ts(), id: 0,
  }]);
  const [input, setInput]       = useState("");
  const [showSugg, setShowSugg] = useState(true);
  const [reactions, setReactions] = useState({});
  const [copied, setCopied]     = useState(null);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const isMobile  = useIsMobile();

  const { ask, loading, cancel } = useGroq(CHAT_SYSTEM, { maxTokens: 320, temperature: 0.7 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, loading]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setShowSugg(false);
    setInput("");
    const history = msgs.slice(1).map(({ role, content }) => ({ role, content }));
    const uid = Date.now();
    setMsgs(prev => [...prev, { role: "user", content: msg, ts: ts(), id: uid }]);
    const reply = await ask(msg, history);
    if (reply) setMsgs(prev => [...prev, { role: "assistant", content: reply.trim(), ts: ts(), id: uid + 1 }]);
  }, [input, loading, msgs, ask]);

  const clearChat = useCallback(() => {
    setMsgs([{ role: "assistant", content: "Fresh start! ✨ What would you like to know about Perpetual?", ts: ts(), id: 0 }]);
    setShowSugg(true); setInput(""); setReactions({});
  }, []);

  const copyMsg = useCallback((id, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(id); setTimeout(() => setCopied(null), 1800);
  }, []);

  const toggleReaction = useCallback((id, emoji) => {
    setReactions(prev => ({ ...prev, [id]: prev[id] === emoji ? null : emoji }));
  }, []);

  const userCount = msgs.filter(m => m.role === "user").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        padding: "7px 14px", borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0, background: "rgba(0,0,0,0.15)",
      }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(242,238,248,0.2)" }}>
          {userCount} msg{userCount !== 1 ? "s" : ""}
        </span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {QUICK_LINKS.map(({ label, href, icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
              style={{
                background: "transparent", border: `1px solid ${T.borderB}`,
                borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                fontFamily: "'Space Mono',monospace", fontSize: 8,
                color: T.muted, textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,98,42,0.35)"; e.currentTarget.style.color = T.orangeG; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderB; e.currentTarget.style.color = T.muted; }}
            >
              {icon}
            </a>
          ))}
          <button onClick={clearChat} style={{
            background: "transparent", border: `1px solid ${T.borderB}`,
            borderRadius: 6, padding: "3px 9px", cursor: "pointer",
            fontFamily: "'Space Mono',monospace", fontSize: 8, color: T.muted,
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.borderB; }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="pmsg-scroll" style={{
        flex: 1, overflowY: "auto", padding: "14px 12px",
        display: "flex", flexDirection: "column", gap: 12,
        WebkitOverflowScrolling: "touch",
      }}>
        {msgs.map((m) => (
          <motion.div key={m.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex", flexDirection: "column",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "86%", gap: 5,
            }}
          >
            {/* Bubble */}
            <div style={{ position: "relative" }}>
              <div style={{
                padding: "10px 14px",
                borderRadius: m.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                background: m.role === "user"
                  ? `linear-gradient(135deg, ${T.orange}, ${T.orangeD})`
                  : T.glass,
                border: m.role === "user" ? "none" : `1px solid ${T.borderB}`,
                boxShadow: m.role === "user"
                  ? "0 4px 16px rgba(232,98,42,0.22)"
                  : "0 2px 8px rgba(0,0,0,0.2)",
                color: m.role === "user" ? "#fff" : T.text,
                fontFamily: "'Space Mono',monospace",
                fontSize: isMobile ? 12 : 11, lineHeight: 1.85,
                wordBreak: "break-word",
              }}>
                {m.role === "assistant" ? <StreamText text={m.content} /> : m.content}
              </div>
            </div>

            {/* Meta row */}
            <div style={{
              display: "flex", gap: 5, alignItems: "center",
              flexDirection: m.role === "user" ? "row-reverse" : "row",
            }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: "rgba(242,238,248,0.15)" }}>
                {m.ts}
              </span>
              {m.role === "assistant" && (
                <>
                  {["👍", "❤️"].map(emoji => (
                    <button key={emoji} onClick={() => toggleReaction(m.id, emoji)} style={{
                      background: reactions[m.id] === emoji ? "rgba(232,98,42,0.15)" : "transparent",
                      border: `1px solid ${reactions[m.id] === emoji ? "rgba(232,98,42,0.3)" : T.borderB}`,
                      borderRadius: 6, padding: "2px 6px", cursor: "pointer", fontSize: 9,
                      transition: "all 0.15s", lineHeight: 1,
                    }}>
                      {emoji}
                    </button>
                  ))}
                  <button onClick={() => copyMsg(m.id, m.content)} style={{
                    background: "transparent", border: `1px solid ${T.borderB}`,
                    borderRadius: 6, padding: "2px 7px", cursor: "pointer",
                    fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: T.muted,
                    transition: "all 0.15s",
                  }}>
                    {copied === m.id ? "✓" : "copy"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ alignSelf: "flex-start" }}>
            <div style={{
              background: T.glass, border: `1px solid ${T.borderB}`,
              borderRadius: "18px 18px 18px 5px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}>
              <TypingDots />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      <AnimatePresence>
        {showSugg && msgs.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ padding: "0 12px 10px", flexShrink: 0 }}
          >
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035 }}
                  className="psugg"
                  onClick={() => send(s)}
                  disabled={loading}
                  style={{ touchAction: "manipulation" }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div style={{
        padding: "10px 12px", borderTop: `1px solid ${T.border}`,
        display: "flex", gap: 8, alignItems: "center",
        background: "rgba(0,0,0,0.28)", flexShrink: 0,
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); send(); } }}
            placeholder="Ask anything about Perpetual…"
            disabled={loading}
            aria-label="Chat input"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${input ? "rgba(232,98,42,0.35)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 100, padding: "10px 16px",
              fontFamily: "'Space Mono',monospace",
              fontSize: isMobile ? 16 : 11,
              color: T.text, outline: "none", transition: "all 0.2s",
            }}
          />
        </div>
        {loading ? (
          <button onClick={cancel} style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            border: "none", cursor: "pointer", background: "rgba(239,68,68,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => send()}
            disabled={!input.trim()}
            style={{
              width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
              border: "none", cursor: input.trim() ? "pointer" : "default",
              background: input.trim()
                ? `linear-gradient(135deg, ${T.orange}, ${T.orangeD})`
                : "rgba(255,255,255,0.05)",
              boxShadow: input.trim() ? "0 4px 14px rgba(232,98,42,0.3)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: input.trim() ? 1 : 0.4, transition: "all 0.2s",
              touchAction: "manipulation",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PITCH PANEL
═══════════════════════════════════════════════════════════════ */
function PitchPanel() {
  const [step, setStep]         = useState("form");
  const [company, setCompany]   = useState("");
  const [role, setRole]         = useState("");
  const [tone, setTone]         = useState("professional");
  const [pitch, setPitch]       = useState("");
  const [fieldErr, setFieldErr] = useState("");
  const [genCount, setGenCount] = useState(0);

  const resultRef = useRef(null);
  const isMobile  = useIsMobile();
  const { copied, copy } = useCopy();

  const { ask, loading } = useGroq(
    "You are a pitch-writing assistant for Perpetual Okan. Write exactly as instructed — output only the pitch text, nothing else.",
    { maxTokens: 340, temperature: 0.85 }
  );

  const wordCount = useMemo(() =>
    pitch.trim().split(/\s+/).filter(Boolean).length, [pitch]);

  useEffect(() => {
    if (step === "result") setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [step]);

  const buildPrompt = useCallback((variant = "") =>
    PITCH_SYSTEM(tone, company.trim(), role.trim()) +
    (variant ? `\n\nWrite a FRESH version — different opening, different projects, different closing. ${variant}` : "\n\nNow write the pitch."),
  [tone, company, role]);

  const generate = useCallback(async () => {
    if (!company.trim() || !role.trim()) { setFieldErr("Please fill in both fields."); return; }
    setFieldErr(""); setStep("loading");
    const result = await ask(buildPrompt());
    if (result?.trim().length > 20) {
      setPitch(result.trim()); setGenCount(n => n + 1); setStep("result");
    } else {
      setFieldErr("Generation failed — please try again."); setStep("form");
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

  const shareEmail = useCallback(() => {
    window.open(`mailto:?subject=${encodeURIComponent(`Application — ${role} at ${company}`)}&body=${encodeURIComponent(pitch)}`);
  }, [pitch, role, company]);

  return (
    <div style={{ overflowY: "auto", maxHeight: "100%", padding: "16px 14px", WebkitOverflowScrolling: "touch" }}>
      <AnimatePresence mode="wait">

        {/* FORM */}
        {step === "form" && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Info card */}
            <div style={{
              padding: "10px 14px", background: "rgba(232,98,42,0.04)",
              borderRadius: 10, border: `1px solid ${T.border}`,
            }}>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.muted, lineHeight: 1.7, margin: 0 }}>
                ✨ Generate a personalised pitch in Perpetual's voice — tailored to the role and company.
              </p>
              <SkillBadges skills={["API", "Firebase", "Supabase", "Chatbots", "Three.js", "React"]} />
            </div>

            {/* Quick fill */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{
                fontFamily: "'Space Mono',monospace", fontSize: 8, fontWeight: 700,
                letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(232,98,42,0.6)",
              }}>⚡ Quick fill</span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {PITCH_QUICK.map(s => (
                  <button key={s.company}
                    onClick={() => { setCompany(s.company); setRole(s.role); setFieldErr(""); }}
                    style={{
                      fontFamily: "'Space Mono',monospace", fontSize: 8,
                      padding: "4px 10px", borderRadius: 100, cursor: "pointer",
                      border: `1px solid ${company === s.company && role === s.role ? "rgba(232,98,42,0.4)" : "rgba(232,98,42,0.15)"}`,
                      background: company === s.company && role === s.role ? "rgba(232,98,42,0.12)" : "rgba(232,98,42,0.03)",
                      color: company === s.company && role === s.role ? T.orangeG : "rgba(242,238,248,0.38)",
                      transition: "all 0.15s", touchAction: "manipulation",
                    }}
                  >
                    {s.company}
                  </button>
                ))}
              </div>
            </div>

            {/* Company */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontFamily: "'Space Mono',monospace", fontSize: 8, fontWeight: 700,
                letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(232,98,42,0.6)",
              }}>🏢 Company name</label>
              <input
                value={company}
                onChange={e => { setCompany(e.target.value); setFieldErr(""); }}
                onKeyDown={e => e.key === "Enter" && company.trim() && role.trim() && generate()}
                placeholder="e.g. Google, Shopify, Stripe…"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${company ? "rgba(232,98,42,0.3)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 10, padding: "10px 14px", width: "100%", boxSizing: "border-box",
                  fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 16 : 11,
                  color: T.text, outline: "none", transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* Role */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontFamily: "'Space Mono',monospace", fontSize: 8, fontWeight: 700,
                letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(232,98,42,0.6)",
              }}>💼 Role / position</label>
              <input
                value={role}
                onChange={e => { setRole(e.target.value); setFieldErr(""); }}
                onKeyDown={e => e.key === "Enter" && company.trim() && role.trim() && generate()}
                placeholder="e.g. Senior Frontend Engineer…"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${role ? "rgba(232,98,42,0.3)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 10, padding: "10px 14px", width: "100%", boxSizing: "border-box",
                  fontFamily: "'Space Mono',monospace", fontSize: isMobile ? 16 : 11,
                  color: T.text, outline: "none", transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* Tone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{
                fontFamily: "'Space Mono',monospace", fontSize: 8, fontWeight: 700,
                letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(232,98,42,0.6)",
              }}>🎨 Tone & style</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {TONES.map(t => (
                  <motion.button key={t.id} whileTap={{ scale: 0.96 }}
                    onClick={() => setTone(t.id)}
                    style={{
                      padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${tone === t.id ? "rgba(232,98,42,0.45)" : "rgba(255,255,255,0.06)"}`,
                      background: tone === t.id
                        ? "linear-gradient(135deg, rgba(232,98,42,0.14), rgba(201,78,26,0.06))"
                        : "transparent",
                      color: tone === t.id ? T.orangeG : "rgba(242,238,248,0.3)",
                      transition: "all 0.18s", textAlign: "center", touchAction: "manipulation",
                    }}
                  >
                    <span style={{ fontSize: 16, display: "block" }}>{t.icon}</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, display: "block", marginTop: 3 }}>{t.label}</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, opacity: 0.5, display: "block" }}>{t.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {fieldErr && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "9px 12px", background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.22)", borderRadius: 8,
                  fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.red,
                }}>
                {fieldErr}
              </motion.div>
            )}

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={generate}
              disabled={!company.trim() || !role.trim() || loading}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
                cursor: company.trim() && role.trim() ? "pointer" : "not-allowed",
                fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase", transition: "all 0.2s",
                background: company.trim() && role.trim()
                  ? `linear-gradient(135deg, ${T.orange}, ${T.orangeD})`
                  : "rgba(255,255,255,0.04)",
                color: company.trim() && role.trim() ? "#fff" : "rgba(242,238,248,0.2)",
                boxShadow: company.trim() && role.trim() ? "0 8px 26px rgba(232,98,42,0.26)" : "none",
                touchAction: "manipulation",
              }}
            >
              {company.trim() && role.trim() ? "✨ Generate Pitch" : "📝 Fill both fields first"}
            </motion.button>
          </motion.div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "52px 0" }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              border: "2px solid rgba(232,98,42,0.1)",
              borderTop: `2px solid ${T.orange}`,
              animation: "pspin 0.8s linear infinite",
            }} />
            <TypingDots />
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: T.muted, margin: 0 }}>
              Crafting your pitch…
            </p>
          </motion.div>
        )}

        {/* RESULT */}
        {step === "result" && (
          <motion.div key="result" ref={resultRef}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Label row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <div style={{
                padding: "4px 12px", borderRadius: 100,
                background: "rgba(232,98,42,0.1)", border: "1px solid rgba(232,98,42,0.22)",
              }}>
                <span style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 9,
                  fontWeight: 700, letterSpacing: "0.13em", color: T.orangeG, textTransform: "uppercase",
                }}>
                  {company} · {role}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
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

            {/* Pitch text */}
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
                fontSize: isMobile ? 12 : 11, lineHeight: 1.95,
                color: T.text, margin: 0, whiteSpace: "pre-wrap",
              }}>
                <StreamText text={pitch} />
              </p>
            </div>

            {/* Action grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => copy(pitch)}
                style={{
                  padding: "11px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  background: `linear-gradient(135deg, ${T.orange}, ${T.orangeD})`,
                  color: "#fff", transition: "all 0.15s", touchAction: "manipulation",
                  boxShadow: "0 4px 14px rgba(232,98,42,0.22)",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={regenerate} disabled={loading}
                style={{
                  padding: "11px 0", borderRadius: 10, border: "none", cursor: loading ? "wait" : "pointer",
                  fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  background: `linear-gradient(135deg, ${T.orange}, ${T.orangeD})`,
                  color: "#fff", opacity: loading ? 0.5 : 1, transition: "all 0.15s",
                  touchAction: "manipulation", boxShadow: "0 4px 14px rgba(232,98,42,0.22)",
                }}
              >
                🔄 New Version
              </motion.button>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={shareEmail}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 10, cursor: "pointer",
                fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                background: "transparent", border: "1px solid rgba(232,98,42,0.28)",
                color: "rgba(232,98,42,0.75)", transition: "all 0.15s",
                touchAction: "manipulation",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,98,42,0.07)"; e.currentTarget.style.color = T.orangeG; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(232,98,42,0.75)"; }}
            >
              ✉ Send via Email
            </motion.button>

            <button onClick={reset} style={{
              background: "transparent", border: "none",
              fontFamily: "'Space Mono',monospace", fontSize: 9,
              color: "rgba(242,238,248,0.2)", cursor: "pointer", padding: 0, alignSelf: "center",
              transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = T.muted}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(242,238,248,0.2)"}
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
   MAIN WIDGET
═══════════════════════════════════════════════════════════════ */
export default function AIWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [hasPulsed, setHasPulsed] = useState(false);
  const isMobile = useIsMobile();

  const handleOpen = useCallback((tab = "chat") => {
    setActiveTab(tab); setIsOpen(true); setMenuOpen(false); setHasPulsed(true);
  }, []);
  const handleClose = useCallback(() => { setIsOpen(false); setMenuOpen(false); }, []);

  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); isOpen ? handleClose() : handleOpen("chat"); }
      if (e.key === "Escape" && (isOpen || menuOpen)) handleClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, menuOpen, handleOpen, handleClose]);

  const panelW = isMobile ? "calc(100vw - 24px)" : "min(410px, calc(100vw - 32px))";
  const panelH = isMobile ? "calc(100dvh - 110px)" : "min(590px, calc(100dvh - 110px))";

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        .pmsg-scroll::-webkit-scrollbar { width: 2px; }
        .pmsg-scroll::-webkit-scrollbar-thumb { background: rgba(232,98,42,0.18); border-radius: 4px; }

        .psugg {
          font-family: 'Space Mono', monospace;
          font-size: 9px; padding: 5px 12px; border-radius: 100px;
          cursor: pointer; border: 1px solid rgba(232,98,42,0.18);
          background: rgba(232,98,42,0.04); color: rgba(242,238,248,0.38);
          transition: all 0.15s; white-space: nowrap; line-height: 1.4;
          touch-action: manipulation;
        }
        .psugg:hover { background: rgba(232,98,42,0.1); color: rgba(242,238,248,0.7); border-color: rgba(232,98,42,0.32); }
        .psugg:active { transform: scale(0.95); }
        .psugg:disabled { opacity: 0.4; cursor: not-allowed; }

        @keyframes pspin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .psugg { font-size: 10.5px; padding: 7px 14px; }
        }
      `}</style>

      {/* ── Fan menu ── */}
      <AnimatePresence>
        {menuOpen && !isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 999,
                background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)",
              }}
            />
            {[
              { label: "Ask Me",  tab: "chat",  icon: "💬", y: -76  },
              { label: "Hire Me", tab: "pitch", icon: "⚡", y: -136 },
            ].map(({ label, tab, icon, y }, i) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, y: 0, scale: 0.78 }}
                animate={{ opacity: 1, y, scale: 1 }}
                exit={{ opacity: 0, y: 0, scale: 0.78 }}
                transition={{ duration: 0.24, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleOpen(tab)}
                whileTap={{ scale: 0.93 }}
                style={{
                  position: "fixed", bottom: 28, right: 28, zIndex: 1001,
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "0 20px", height: isMobile ? 50 : 46, borderRadius: 100,
                  border: "1px solid rgba(232,98,42,0.28)",
                  background: T.card, cursor: "pointer",
                  boxShadow: "0 10px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(232,98,42,0.05)",
                  color: T.text, fontFamily: "'Space Mono',monospace",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                  touchAction: "manipulation", whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 13 }}>{icon}</span>
                {label}
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── Main FAB ── */}
      <motion.button
        whileTap={{ scale: 0.91 }}
        onClick={() => { if (isOpen) { handleClose(); return; } setMenuOpen(o => !o); }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1002,
          width: isMobile ? 58 : 54, height: isMobile ? 58 : 54,
          borderRadius: "50%",
          border: "1px solid rgba(232,98,42,0.42)",
          background: `linear-gradient(145deg, ${T.orange}, ${T.orangeD})`,
          cursor: "pointer",
          boxShadow: `0 8px 32px rgba(232,98,42,0.42), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "manipulation",
        }}
      >
        {/* Pulse ring */}
        {!hasPulsed && !isOpen && (
          <motion.div
            animate={{ scale: [1, 1.75], opacity: [0.55, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            style={{
              position: "absolute", inset: -7, borderRadius: "50%",
              border: `1.5px solid ${T.orange}`, pointerEvents: "none",
            }}
          />
        )}
        {/* Second ring */}
        {!hasPulsed && !isOpen && (
          <motion.div
            animate={{ scale: [1, 1.45], opacity: [0.35, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute", inset: -3, borderRadius: "50%",
              border: `1px solid rgba(232,98,42,0.5)`, pointerEvents: "none",
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {isOpen || menuOpen ? (
            <motion.svg key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: isMobile ? 100 : 96,
              right: isMobile ? 12 : 28,
              left: isMobile ? 12 : "auto",
              zIndex: 1001,
              width: panelW,
              maxHeight: panelH,
              borderRadius: 22,
              background: `linear-gradient(180deg, ${T.cardAlt} 0%, ${T.card} 100%)`,
              border: `1px solid ${T.border}`,
              boxShadow: `0 40px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(232,98,42,0.05), inset 0 1px 0 rgba(255,255,255,0.04)`,
              overflow: "hidden",
              transformOrigin: isMobile ? "bottom center" : "bottom right",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Ambient glow top */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "60%", height: 1,
              background: `linear-gradient(90deg, transparent, rgba(232,98,42,0.35), transparent)`,
              pointerEvents: "none",
            }} />

            <PanelHeader onClose={handleClose} />
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "chat" ? -12 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "chat" ? 12 : -12 }}
                  transition={{ duration: 0.18 }}
                  style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  {activeTab === "chat"  && <ChatPanel />}
                  {activeTab === "pitch" && <PitchPanel />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={{
              padding: "6px 14px",
              borderTop: `1px solid rgba(232,98,42,0.08)`,
              display: "flex", justifyContent: "center", alignItems: "center",
              background: "rgba(0,0,0,0.2)", flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Space Mono',monospace", fontSize: 7.5,
                color: "rgba(242,238,248,0.14)", letterSpacing: "0.08em",
              }}>
                Groq · Llama 3.3-70b · Free tier {!isMobile && "· ⌘K to open"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}