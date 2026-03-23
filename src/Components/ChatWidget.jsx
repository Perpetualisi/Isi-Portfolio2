import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
};

/* ══════════════════════════════════════════════════
   ✏️  YOUR INFO — Claude will answer using this
══════════════════════════════════════════════════ */
const SYSTEM_PROMPT = `You are an AI assistant for Perpetual Okan's portfolio website.
Answer questions about Perpetual only. Be friendly, concise, and helpful.

About Perpetual:
- 3D Web Developer & Full-Stack Engineer with 4+ years experience
- Skills: Three.js, WebGL, React, Next.js, Node.js, TypeScript, Tailwind CSS
- Shipped 15+ projects including 3D web experiences and SaaS dashboards
- Available for freelance and full-time opportunities
- GitHub: github.com/Perpetualisi
- Based in Lagos, Nigeria

Rules:
- Keep answers short (2-3 sentences max)
- Only answer questions about Perpetual or web development
- If asked anything unrelated, say "I can only answer questions about Perpetual!"
- Never make up information not listed above`;

const SUGGESTIONS = [
  "What's your tech stack?",
  "Are you open to work?",
  "Tell me about your projects",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 12px" }}>
      {[0, 0.18, 0.36].map((d, i) => (
        <motion.span key={i}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, delay: d, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange, display: "inline-block" }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [msgs,     setMsgs]     = useState([{
    role: "assistant",
    content: "Hey! 👋 I'm Perpetual's AI assistant. Ask me anything about his skills, projects, or availability!",
  }]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setShowSugg(false);
    setInput("");
    const next = [...msgs, { role: "user", content: msg }];
    setMsgs(next);
    setLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model:       "llama-3.3-70b-versatile",
          max_tokens:  180,
          temperature: 0.7,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...next.map(({ role, content }) => ({ role, content })),
          ],
        }),
      });

      if (!res.ok) throw new Error(`Groq error ${res.status}`);
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", content: data.choices[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response." }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Something went wrong. Please try again!" }]);
    }

    setLoading(false);
  };

  const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        .cw-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          padding: 9px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 16px;
          color: ${T.text};
          outline: none;
          transition: border-color 0.2s;
          letter-spacing: 0.03em;
          -webkit-appearance: none;
        }
        .cw-input:focus { border-color: rgba(232,98,42,0.45); }
        .cw-input::placeholder { color: rgba(242,238,248,0.18); }
        .cw-sugg {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          padding: 5px 12px;
          border-radius: 100px;
          cursor: pointer;
          border: 1px solid rgba(232,98,42,0.2);
          background: rgba(232,98,42,0.05);
          color: rgba(242,238,248,0.45);
          transition: all 0.15s;
          white-space: nowrap;
          letter-spacing: 0.04em;
          -webkit-appearance: none;
        }
        .cw-sugg:hover {
          background: rgba(232,98,42,0.12);
          color: ${T.text};
          border-color: rgba(232,98,42,0.4);
        }
        .cw-msgs::-webkit-scrollbar { width: 3px; }
        .cw-msgs::-webkit-scrollbar-thumb { background: rgba(232,98,42,0.2); border-radius: 4px; }
        @keyframes cw-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── FAB — bottom LEFT ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        style={{
          position: "fixed", bottom: 28, left: 28, zIndex: 1000,
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 18px", height: 48, borderRadius: 100,
          border: `1px solid rgba(232,98,42,0.35)`,
          background: "#07070d",
          cursor: "pointer",
          boxShadow: `0 8px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
          color: T.text, fontFamily: "'Space Mono', monospace",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", whiteSpace: "nowrap",
        }}
      >
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: "absolute", inset: -4, borderRadius: 100, border: `1px solid ${T.orange}`, pointerEvents: "none" }}
          />
        )}

        {!open && msgs.length === 1 && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 8, height: 8, borderRadius: "50%",
              background: T.orange, boxShadow: `0 0 8px ${T.orange}`,
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={T.orange} strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </motion.svg>
          ) : (
            <motion.svg key="chat"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.18 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </motion.svg>
          )}
        </AnimatePresence>
        {open ? "Close" : "Ask Me"}
      </motion.button>

      {/* ── Chat Panel — bottom LEFT ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{   opacity: 0, scale: 0.9,  y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", bottom: 88, left: 28, zIndex: 999,
              width: "min(340px, calc(100vw - 32px))",
              borderRadius: 20, background: T.card,
              border: `1px solid ${T.border}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(232,98,42,0.06)",
              overflow: "hidden", transformOrigin: "bottom left",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, background: "rgba(232,98,42,0.04)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(232,98,42,0.15)", border: `1px solid rgba(232,98,42,0.35)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: "0.06em" }}>ASK PERPETUAL · AI</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginTop: 1 }}>Powered by Groq · Llama 3</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 100, padding: "3px 9px" }}>
                <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(134,239,172,0.85)", fontWeight: 700 }}>Live</span>
              </div>
            </div>

            {/* Messages */}
            <div className="cw-msgs" style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 300 }}>
              {msgs.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", flexDirection: "column", alignSelf: m.role === "user" ? "flex-end" : "flex-start", alignItems: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", gap: 3 }}
                >
                  <div style={{
                    padding: "9px 13px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user"
                      ? `linear-gradient(135deg,${T.orange},${T.orangeD})`
                      : "rgba(255,255,255,0.04)",
                    border: m.role === "user" ? "none" : `1px solid ${T.borderB}`,
                    color: m.role === "user" ? "#fff" : T.text,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11, lineHeight: 1.7, letterSpacing: "0.02em",
                  }}>
                    {m.content}
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(242,238,248,0.2)" }}>
                    {getTime()}
                  </span>
                </motion.div>
              ))}

              {loading && (
                <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderB}`, borderRadius: "16px 16px 16px 4px" }}>
                  <TypingDots />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSugg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  style={{ padding: "0 14px 10px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}
                >
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="cw-sugg" onClick={() => send(s)}>{s}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center", background: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
              <input
                ref={inputRef}
                className="cw-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Ask anything about me..."
              />
              <button
                onClick={() => send()}
                style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
                  background: input.trim()
                    ? `linear-gradient(135deg,${T.orange},${T.orangeD})`
                    : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={input.trim() ? "#fff" : "rgba(242,238,248,0.2)"}>
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}