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
   ✏️  PROFILE INFO
══════════════════════════════════════════════════ */
const MY_PROFILE = `
Name: Perpetual Okan
Gender: Female (use she/her pronouns)
Role: 3D Web Developer and Full-Stack Engineer
Experience: 4+ years
Location: Lagos, Nigeria
Email: Perpetualokan0@gmail.com
GitHub: github.com/Perpetualisi

Skills: Three.js, WebGL, React, Next.js, Node.js, TypeScript, Tailwind CSS

Real projects she has built:
- ConotexTech (conotextech.com) — a tech company website based in the USA
- We Are Ikeiko (weareikeiko.com) — a fashion house website
- Ice Cream website (ice-cream-iota-peach.vercel.app) — a fun ice cream brand site
- Perfume website (verra-mu.vercel.app) — a luxury perfume brand site
- 15+ total projects shipped across different industries

What she loves:
- Turning ideas into beautiful, interactive websites
- Building 3D web experiences that feel alive
- Working with fashion, lifestyle, and creative brands
- Clean, fast, mobile-friendly designs
- Collaborating with founders and startups

Availability: Open to freelance projects and full-time roles
Contact: Perpetualokan0@gmail.com
`;

const CHAT_SYSTEM = `You are an AI assistant on Perpetual Okan's portfolio website.
Only answer questions about Perpetual. Be warm, friendly, and use simple easy words.
Use she/her pronouns when talking about Perpetual.

Here is everything about her:
${MY_PROFILE}

Rules:
- Use simple, clear words — no complicated tech jargon unless asked
- Keep answers short, 2 to 3 sentences
- Sound friendly and human, not robotic
- If someone asks something you don't know, say: "You can reach Perpetual directly at Perpetualokan0@gmail.com!"
- Never make up anything not listed above`;

const CHAT_SUGGESTIONS = [
  "What kind of work do you do?",
  "Can I see your projects?",
  "Are you available to hire?",
];

const PITCH_TONES = [
  { id: "professional", label: "Professional" },
  { id: "bold",         label: "Bold"         },
  { id: "friendly",     label: "Friendly"     },
  { id: "creative",     label: "Creative"     },
];

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
}

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

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function callGroq(messages, system, maxTokens = 200) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       "llama-3.3-70b-versatile",
      max_tokens:  maxTokens,
      temperature: 0.75,
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

/* ══════════════════════════════════════════════════
   PANEL: Chat
══════════════════════════════════════════════════ */
function ChatPanel() {
  const [msgs,     setMsgs]     = useState([{ role: "assistant", content: "Hey! 👋 I'm Perpetual's AI assistant. Ask me anything — her work, projects, or if she's available to hire!" }]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setShowSugg(false);
    setInput("");
    const next = [...msgs, { role: "user", content: msg }];
    setMsgs(next);
    setLoading(true);
    try {
      const reply = await callGroq(next.map(({ role, content }) => ({ role, content })), CHAT_SYSTEM, 180);
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Something went wrong. Please try again!" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }} className="ai-msgs">
        {msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignSelf: m.role === "user" ? "flex-end" : "flex-start", alignItems: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", gap: 3 }}
          >
            <div style={{
              padding: "9px 13px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? `linear-gradient(135deg,${T.orange},${T.orangeD})` : "rgba(255,255,255,0.04)",
              border: m.role === "user" ? "none" : `1px solid ${T.borderB}`,
              color: m.role === "user" ? "#fff" : T.text,
              fontFamily: "'Space Mono',monospace", fontSize: 11, lineHeight: 1.7,
            }}>{m.content}</div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(242,238,248,0.2)" }}>{getTime()}</span>
          </motion.div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderB}`, borderRadius: "16px 16px 16px 4px" }}>
            <TypingDots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {showSugg && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: "0 14px 10px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
            {CHAT_SUGGESTIONS.map(s => (
              <button key={s} className="ai-sugg" onClick={() => send(s)}>{s}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center", background: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
        <input ref={inputRef} className="ai-input" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask me anything..." />
        <button onClick={() => send()} className="ai-send-btn"
          style={{ background: input.trim() ? `linear-gradient(135deg,${T.orange},${T.orangeD})` : "rgba(255,255,255,0.05)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={input.trim() ? "#fff" : "rgba(242,238,248,0.2)"}>
            <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PANEL: Hire Me Pitch
══════════════════════════════════════════════════ */
function PitchPanel() {
  const [step,    setStep]    = useState("form");
  const [company, setCompany] = useState("");
  const [role,    setRole]    = useState("");
  const [tone,    setTone]    = useState("professional");
  const [pitch,   setPitch]   = useState("");
  const [error,   setError]   = useState("");
  const resultRef             = useRef(null);
  const { copied, copy }      = useCopy();

  useEffect(() => {
    if (step === "result") setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }, [step]);

  const reset = () => { setStep("form"); setPitch(""); setError(""); setCompany(""); setRole(""); setTone("professional"); };

  const generate = async () => {
    if (!company.trim() || !role.trim()) { setError("Please fill in both fields."); return; }
    setStep("loading"); setError("");

    const system = `You are writing a short "hire me" pitch for Perpetual Okan, a female developer.
Use she/her pronouns. Write in first person as Perpetual.
Her profile: ${MY_PROFILE}
Rules:
- Max 120 words
- Simple, clear words — easy to read
- Tone: ${tone}
- No bullet points — one flowing paragraph
- End with a clear next step like "let's talk" or "reach out"
- Make it specific to the company and role`;

    try {
      const result = await callGroq([{ role: "user", content: `Write a hire me pitch for:\nCompany: ${company}\nRole: ${role}` }], system, 220);
      setPitch(result);
      setStep("result");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const canGenerate = company.trim() && role.trim();

  return (
    <div style={{ padding: "18px", overflowY: "auto", maxHeight: "100%" }}>
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: T.muted, lineHeight: 1.7, margin: 0 }}>
              Enter a company and role — I'll write a custom pitch for you in seconds.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ai-label">Company name</label>
              <input className="ai-input ai-input-box" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Stripe..." onKeyDown={e => { if (e.key === "Enter" && role) generate(); }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="ai-label">Role / position</label>
              <input className="ai-input ai-input-box" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Developer..." onKeyDown={e => { if (e.key === "Enter" && company) generate(); }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="ai-label">Tone</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PITCH_TONES.map(t => (
                  <button key={t.id} className={`ai-tone${tone === t.id ? " active" : ""}`} onClick={() => setTone(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
            {error && <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "8px 12px", margin: 0 }}>{error}</p>}
            <button className={`ai-generate ${canGenerate ? "ready" : "disabled"}`} onClick={generate}>Generate Pitch ✦</button>
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid rgba(232,98,42,0.15)`, borderTop: `2px solid ${T.orange}`, animation: "ai-spin 0.9s linear infinite" }} />
            <div style={{ textAlign: "center" }}>
              <TypingDots />
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.muted, marginTop: 8 }}>Writing your pitch for {company}...</p>
            </div>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div key="result" ref={resultRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(232,98,42,0.1)", border: "1px solid rgba(232,98,42,0.25)", alignSelf: "flex-start" }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.orangeG }}>{company} · {role}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid rgba(232,98,42,0.14)`, borderLeft: `2px solid ${T.orange}`, borderRadius: "0 10px 10px 0", padding: "14px 16px" }}>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, lineHeight: 1.85, color: T.text, margin: 0 }}>{pitch}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ai-action" onClick={() => copy(pitch)}
                style={{ background: copied ? "rgba(34,197,94,0.15)" : `linear-gradient(135deg,${T.orange},${T.orangeD})`, border: copied ? "1px solid rgba(34,197,94,0.35)" : "none", color: copied ? "#86efac" : "#fff", boxShadow: copied ? "none" : `0 6px 18px rgba(232,98,42,0.3)` }}>
                {copied ? "✓ Copied!" : "Copy Pitch"}
              </button>
              <button className="ai-action" onClick={reset}
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderB}`, color: T.muted }}>
                Try Again
              </button>
            </div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(242,238,248,0.18)", textAlign: "center", margin: 0 }}>Generated by Groq · Llama 3 70B</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN — Combined FAB + Panel
══════════════════════════════════════════════════ */
export default function AIWidget() {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const openTab  = (tab) => { setActiveTab(tab); setMenuOpen(false); };
  const closeAll = ()    => { setMenuOpen(false); setActiveTab(null); };
  const isOpen   = menuOpen || activeTab !== null;

  return (
    <>
      <style>{`
        .ai-input {
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
          -webkit-appearance: none;
        }
        .ai-input-box { border-radius: 10px; width: 100%; }
        .ai-input:focus { border-color: rgba(232,98,42,0.45); }
        .ai-input::placeholder { color: rgba(242,238,248,0.2); }
        .ai-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(232,98,42,0.65);
        }
        .ai-sugg {
          font-family: 'Space Mono', monospace; font-size: 10px;
          padding: 5px 12px; border-radius: 100px; cursor: pointer;
          border: 1px solid rgba(232,98,42,0.2);
          background: rgba(232,98,42,0.05);
          color: rgba(242,238,248,0.45);
          transition: all 0.15s; white-space: nowrap;
          -webkit-appearance: none;
        }
        .ai-sugg:hover { background: rgba(232,98,42,0.12); color: ${T.text}; border-color: rgba(232,98,42,0.4); }
        .ai-tone {
          font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 5px 10px; border-radius: 100px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent; color: rgba(242,238,248,0.3);
          transition: all 0.18s; -webkit-appearance: none;
        }
        .ai-tone:hover { color: rgba(242,238,248,0.65); border-color: rgba(232,98,42,0.3); }
        .ai-tone.active { background: rgba(232,98,42,0.12); border-color: rgba(232,98,42,0.45); color: ${T.orangeG}; }
        .ai-generate {
          width: 100%; padding: 12px; border-radius: 10px; border: none; cursor: pointer;
          font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; transition: all 0.2s;
          -webkit-appearance: none;
        }
        .ai-generate.ready { background: linear-gradient(135deg, ${T.orange}, ${T.orangeD}); color: #fff; box-shadow: 0 8px 24px rgba(232,98,42,0.28); }
        .ai-generate.ready:hover { transform: scale(1.02); box-shadow: 0 14px 36px rgba(232,98,42,0.42); }
        .ai-generate.ready:active { transform: scale(0.97); }
        .ai-generate.disabled { background: rgba(255,255,255,0.05); color: rgba(242,238,248,0.25); cursor: not-allowed; }
        .ai-action {
          flex: 1; padding: 9px 0; border-radius: 10px; cursor: pointer;
          font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; transition: all 0.2s;
          -webkit-appearance: none;
        }
        .ai-action:hover { transform: scale(1.02); }
        .ai-action:active { transform: scale(0.97); }
        .ai-send-btn {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; -webkit-appearance: none;
        }
        .ai-msgs::-webkit-scrollbar { width: 3px; }
        .ai-msgs::-webkit-scrollbar-thumb { background: rgba(232,98,42,0.2); border-radius: 4px; }
        @keyframes ai-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Fan menu buttons ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -116, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.7 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => openTab("chat")}
              style={{
                position: "fixed", bottom: 28, right: 28, zIndex: 1001,
                display: "flex", alignItems: "center", gap: 8,
                padding: "0 16px", height: 44, borderRadius: 100,
                border: `1px solid rgba(232,98,42,0.35)`,
                background: T.card, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                color: T.text, fontFamily: "'Space Mono', monospace",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", whiteSpace: "nowrap",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Ask Me
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -64, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.7 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => openTab("pitch")}
              style={{
                position: "fixed", bottom: 28, right: 28, zIndex: 1001,
                display: "flex", alignItems: "center", gap: 8,
                padding: "0 16px", height: 44, borderRadius: 100,
                border: `1px solid rgba(232,98,42,0.35)`,
                background: T.card, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                color: T.text, fontFamily: "'Space Mono', monospace",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", whiteSpace: "nowrap",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Hire Me Pitch
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* ── Main FAB ── */}
      <motion.button
        onClick={() => { if (activeTab) { closeAll(); return; } setMenuOpen(o => !o); }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1002,
          width: 54, height: 54, borderRadius: "50%",
          border: `1px solid rgba(232,98,42,0.4)`,
          background: `linear-gradient(135deg,${T.orange},${T.orangeD})`,
          cursor: "pointer",
          boxShadow: `0 8px 28px rgba(232,98,42,0.38), inset 0 1px 0 rgba(255,255,255,0.18)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1px solid ${T.orange}`, pointerEvents: "none" }}
          />
        )}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </motion.svg>
          ) : (
            <motion.svg key="ai"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.2 }}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              <circle cx="9" cy="13" r="1" fill="#fff" stroke="none"/>
              <circle cx="15" cy="13" r="1" fill="#fff" stroke="none"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Backdrop ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAll}
            style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Active Panel ── */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", bottom: 92, right: 28, zIndex: 1001,
              width: "min(360px, calc(100vw - 32px))",
              maxHeight: "min(520px, calc(100vh - 120px))",
              borderRadius: 20, background: T.card,
              border: `1px solid ${T.border}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(232,98,42,0.08)",
              overflow: "hidden", transformOrigin: "bottom right",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, background: "rgba(232,98,42,0.04)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(232,98,42,0.15)", border: `1px solid rgba(232,98,42,0.35)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeTab === "chat" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: "0.06em" }}>
                  {activeTab === "chat" ? "ASK PERPETUAL · AI" : "AI PITCH GENERATOR"}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.muted, marginTop: 1 }}>Powered by Groq · Llama 3</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 100, padding: "3px 9px" }}>
                <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(134,239,172,0.85)", fontWeight: 700 }}>Free</span>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {activeTab === "chat"  && <ChatPanel />}
              {activeTab === "pitch" && <PitchPanel />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}