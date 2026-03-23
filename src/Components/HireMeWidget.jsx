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
   ✏️  YOUR INFO — edit this with your real details
══════════════════════════════════════════════════ */
const MY_PROFILE = `
Name: Perpetual Okan
Role: 3D Web Developer & Full-Stack Engineer
Experience: 4+ years
Skills: Three.js, WebGL, React, Next.js, Node.js, TypeScript, Tailwind CSS
Strengths: Building immersive 3D web experiences, performant full-stack apps, clean UI/UX
Projects: 15+ shipped projects including 3D web experiences and SaaS dashboards
Available: Yes, open to freelance and full-time opportunities
GitHub: github.com/Perpetualisi
`;

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
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 0.18, 0.36].map((d, i) => (
        <motion.span key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, delay: d, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: T.orange, display: "inline-block" }}
        />
      ))}
    </div>
  );
}

export default function HireMeWidget() {
  const [open,    setOpen]    = useState(false);
  const [step,    setStep]    = useState("form");
  const [company, setCompany] = useState("");
  const [role,    setRole]    = useState("");
  const [tone,    setTone]    = useState("professional");
  const [pitch,   setPitch]   = useState("");
  const [error,   setError]   = useState("");
  const resultRef             = useRef(null);
  const { copied, copy }      = useCopy();

  useEffect(() => {
    if (step === "result") {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }
  }, [step]);

  const reset = () => {
    setStep("form"); setPitch(""); setError("");
    setCompany(""); setRole(""); setTone("professional");
  };

  const generate = async () => {
    if (!company.trim() || !role.trim()) {
      setError("Please fill in both company name and role.");
      return;
    }
    setStep("loading");
    setError("");

    const systemPrompt = `You are writing a short, punchy "hire me" pitch on behalf of a developer.
Here is their profile:
${MY_PROFILE}
Rules:
- Write in first person as Perpetual
- Max 120 words — short and impactful
- Tone: ${tone}
- NO bullet points — flowing paragraph only
- End with one clear call to action
- Make it specific to the company and role provided`;

    const userPrompt = `Write a hire me pitch for:\nCompany: ${company}\nRole: ${role}`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model:       "llama-3.3-70b-versatile",
          max_tokens:  220,
          temperature: 0.82,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt   },
          ],
        }),
      });

      if (!res.ok) throw new Error(`Groq error ${res.status}`);
      const data = await res.json();
      setPitch(data.choices[0]?.message?.content?.trim() || "");
      setStep("result");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const TONES = [
    { id: "professional", label: "Professional" },
    { id: "bold",         label: "Bold"         },
    { id: "friendly",     label: "Friendly"     },
    { id: "creative",     label: "Creative"     },
  ];

  const canGenerate = company.trim() && role.trim();

  return (
    <>
      <style>{`
        .hm-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 10px 14px;
          font-family: 'Space Mono', monospace;
          font-size: 16px;
          color: ${T.text};
          outline: none;
          transition: border-color 0.2s;
          letter-spacing: 0.04em;
          -webkit-appearance: none;
        }
        .hm-input:focus { border-color: rgba(232,98,42,0.45); }
        .hm-input::placeholder { color: rgba(242,238,248,0.2); }
        .hm-tone {
          font-family: 'Space Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 5px 10px; border-radius: 100px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent; color: rgba(242,238,248,0.3);
          transition: all 0.18s;
        }
        .hm-tone:hover { color: rgba(242,238,248,0.65); border-color: rgba(232,98,42,0.3); }
        .hm-tone.active { background: rgba(232,98,42,0.12); border-color: rgba(232,98,42,0.45); color: ${T.orangeG}; }
        .hm-generate {
          width: 100%; padding: 12px; border-radius: 10px;
          border: none; cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.2s; margin-top: 4px;
          -webkit-appearance: none;
        }
        .hm-generate.ready {
          background: linear-gradient(135deg, ${T.orange}, ${T.orangeD});
          color: #fff;
          box-shadow: 0 8px 24px rgba(232,98,42,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .hm-generate.ready:hover {
          box-shadow: 0 14px 36px rgba(232,98,42,0.42), inset 0 1px 0 rgba(255,255,255,0.18);
          transform: scale(1.02);
        }
        .hm-generate.ready:active { transform: scale(0.97); }
        .hm-generate.disabled {
          background: rgba(255,255,255,0.05);
          color: rgba(242,238,248,0.25);
          cursor: not-allowed;
        }
        .hm-action {
          flex: 1; padding: 9px 0; border-radius: 10px; cursor: pointer;
          font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; transition: all 0.2s;
          -webkit-appearance: none;
        }
        .hm-action:hover { transform: scale(1.02); }
        .hm-action:active { transform: scale(0.97); }
        @keyframes hm-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── FAB Button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1000,
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 20px", height: 48, borderRadius: 100,
          border: `1px solid rgba(232,98,42,0.4)`,
          background: `linear-gradient(135deg,${T.orange},${T.orangeD})`,
          cursor: "pointer",
          boxShadow: `0 8px 28px rgba(232,98,42,0.38), inset 0 1px 0 rgba(255,255,255,0.18)`,
          color: "#fff", fontFamily: "'Space Mono', monospace",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", whiteSpace: "nowrap",
        }}
      >
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ position: "absolute", inset: -4, borderRadius: 100, border: `1px solid ${T.orange}`, pointerEvents: "none" }}
          />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </motion.svg>
          ) : (
            <motion.svg key="star"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.18 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </motion.svg>
          )}
        </AnimatePresence>
        {open ? "Close" : "Hire Me Pitch"}
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{   opacity: 0, scale: 0.9,  y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", bottom: 88, right: 28, zIndex: 999,
              width: "min(340px, calc(100vw - 32px))",
              borderRadius: 20, background: T.card,
              border: `1px solid ${T.border}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(232,98,42,0.08)",
              overflow: "hidden", transformOrigin: "bottom right",
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, background: "rgba(232,98,42,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(232,98,42,0.15)", border: `1px solid rgba(232,98,42,0.35)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: "0.06em" }}>AI PITCH GENERATOR</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginTop: 1 }}>Powered by Groq · Llama 3</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 100, padding: "3px 9px" }}>
                <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(134,239,172,0.85)", fontWeight: 700 }}>Free</span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "18px", maxHeight: 440, overflowY: "auto" }}>
              <AnimatePresence mode="wait">

                {/* FORM */}
                {step === "form" && (
                  <motion.div key="form"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
                    style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  >
                    <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: T.muted, lineHeight: 1.7, margin: 0 }}>
                      Enter a company and role — I'll generate a custom pitch in seconds.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(232,98,42,0.65)" }}>Company name</label>
                      <input className="hm-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Stripe..." onKeyDown={e => { if (e.key === "Enter" && role) generate(); }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(232,98,42,0.65)" }}>Role / position</label>
                      <input className="hm-input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer..." onKeyDown={e => { if (e.key === "Enter" && company) generate(); }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(232,98,42,0.65)" }}>Tone</label>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {TONES.map(t => (
                          <button key={t.id} className={`hm-tone${tone === t.id ? " active" : ""}`} onClick={() => setTone(t.id)}>{t.label}</button>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#f87171", lineHeight: 1.6, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "8px 12px", margin: 0 }}>{error}</p>
                    )}

                    <button className={`hm-generate ${canGenerate ? "ready" : "disabled"}`} onClick={generate}>
                      Generate Pitch ✦
                    </button>
                  </motion.div>
                )}

                {/* LOADING */}
                {step === "loading" && (
                  <motion.div key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "32px 0" }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid rgba(232,98,42,0.15)`, borderTop: `2px solid ${T.orange}`, animation: "hm-spin 0.9s linear infinite" }} />
                    <div style={{ textAlign: "center" }}>
                      <TypingDots />
                      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.muted, marginTop: 8, letterSpacing: "0.1em" }}>Crafting your pitch for {company}...</p>
                    </div>
                  </motion.div>
                )}

                {/* RESULT */}
                {step === "result" && (
                  <motion.div key="result" ref={resultRef}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  >
                    <div style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(232,98,42,0.1)", border: "1px solid rgba(232,98,42,0.25)", alignSelf: "flex-start" }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.orangeG }}>{company} · {role}</span>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid rgba(232,98,42,0.14)`, borderLeft: `2px solid ${T.orange}`, borderRadius: "0 10px 10px 0", padding: "14px 16px" }}>
                      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, lineHeight: 1.85, color: T.text, margin: 0, letterSpacing: "0.02em" }}>{pitch}</p>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="hm-action" onClick={() => copy(pitch)}
                        style={{
                          background: copied ? "rgba(34,197,94,0.15)" : `linear-gradient(135deg,${T.orange},${T.orangeD})`,
                          border: copied ? "1px solid rgba(34,197,94,0.35)" : "none",
                          color: copied ? "#86efac" : "#fff",
                          boxShadow: copied ? "none" : `0 6px 18px rgba(232,98,42,0.3)`,
                        }}
                      >{copied ? "✓ Copied!" : "Copy Pitch"}</button>

                      <button className="hm-action" onClick={reset}
                        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderB}`, color: T.muted }}
                      >Try Another</button>
                    </div>

                    <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(242,238,248,0.18)", textAlign: "center", letterSpacing: "0.1em", margin: 0 }}>
                      Generated by Groq · Llama 3 70B
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}