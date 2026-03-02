import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiArrowUpRight, FiSend, FiCheck, FiAlertCircle } from "react-icons/fi";

// ─── THEME ────────────────────────────────────────────────────────────────────
var T = {
  bg:      "#040406",
  card:    "#0c0c10",
  orange:  "#F97316",
  orangeD: "#EA580C",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.45)",
  faint:   "rgba(255,255,255,0.14)",
  border:  "rgba(249,115,22,0.15)",
  borderB: "rgba(255,255,255,0.07)",
  borderH: "rgba(249,115,22,0.35)",
};

var CONTACT_INFO = [
  { icon: FiMail,   label: "Email",    value: "Perpetualokan0@gmail.com", href: "mailto:Perpetualokan0@gmail.com", desc: "Drop me a line"  },
  { icon: FiPhone,  label: "Phone",    value: "+234-810-355-837",          href: "tel:+234810355837",              desc: "Let's talk"      },
  { icon: FiMapPin, label: "Location", value: "Lagos, Nigeria",            href: "#",                              desc: "Where I'm based" },
];

// ─── 3D CONTACT CARD ─────────────────────────────────────────────────────────
function ContactCard({ info, index, inView }) {
  var ref = useRef(null);
  var mx = useMotionValue(0);
  var my = useMotionValue(0);
  var mxS = useSpring(mx, { stiffness: 160, damping: 18 });
  var myS = useSpring(my, { stiffness: 160, damping: 18 });
  var rotX = useTransform(myS, [-0.5, 0.5], ["10deg", "-10deg"]);
  var rotY = useTransform(mxS, [-0.5, 0.5], ["-10deg", "10deg"]);
  var glareBg = useTransform([mxS, myS], function(l) {
    return "radial-gradient(circle 140px at " + ((l[0] + 0.5) * 100) + "% " + ((l[1] + 0.5) * 100) + "%, rgba(249,115,22,0.1) 0%, transparent 65%)";
  });
  var [hov, setHov] = useState(false);
  var Icon = info.icon;

  function move(e) {
    var r = ref.current && ref.current.getBoundingClientRect();
    if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }
  }

  return (
    <motion.a
      href={info.href}
      ref={ref}
      onMouseMove={move}
      onMouseEnter={function() { setHov(true); }}
      onMouseLeave={function() { mx.set(0); my.set(0); setHov(false); }}
      initial={{ opacity: 0, x: -32 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -32 }}
      transition={{ duration: 0.65, delay: 0.7 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX: rotX, rotateY: rotY,
        transformStyle: "preserve-3d", perspective: "800px",
        display: "block", textDecoration: "none",
      }}
    >
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "1.25rem 1.4rem", borderRadius: 18,
        background: hov ? "rgba(14,12,10,0.97)" : "rgba(10,9,8,0.75)",
        border: "1px solid " + (hov ? T.borderH : T.borderB),
        boxShadow: hov
          ? "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.07)"
          : "0 8px 30px rgba(0,0,0,0.4)",
        transition: "border-color 0.3s, box-shadow 0.4s, background 0.3s",
        backdropFilter: "blur(16px)",
      }}>
        {/* Top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, " + T.orange + ", transparent)", opacity: hov ? 1 : 0, transition: "opacity 0.35s", borderRadius: "18px 18px 0 0" }} />
        {/* Glare */}
        <motion.div style={{ position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none", background: glareBg, opacity: hov ? 1 : 0, transition: "opacity 0.3s" }} />
        {/* Bottom sweep */}
        <div style={{ position: "absolute", bottom: 0, left: 0, height: 1, background: "linear-gradient(90deg, " + T.orange + ", transparent)", width: hov ? "100%" : "0%", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)", borderRadius: "0 0 18px 18px" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", transform: "translateZ(24px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: hov ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
              border: "1px solid " + (hov ? "rgba(249,115,22,0.28)" : T.borderB),
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s",
              transform: hov ? "scale(1.08) rotate(3deg)" : "scale(1) rotate(0deg)",
            }}>
              <Icon size={16} color={hov ? T.orange : "rgba(255,255,255,0.4)"} style={{ transition: "color 0.3s" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.44rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.28em", color: T.orange, marginBottom: 3, marginTop: 0 }}>{info.label}</p>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: hov ? T.text : "rgba(255,255,255,0.75)", transition: "color 0.25s", margin: "0 0 2px 0", fontWeight: 500 }}>{info.value}</p>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", color: T.muted, margin: 0 }}>{info.desc}</p>
            </div>
          </div>
          <motion.div animate={{ opacity: hov ? 1 : 0, x: hov ? 0 : 8, y: hov ? 0 : 8 }} transition={{ duration: 0.25 }}>
            <FiArrowUpRight size={18} color={T.muted} />
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────
function Field({ label, name, type, required, placeholder, rows, focused, onFocus, onBlur, disabled }) {
  var isActive = focused === name;
  var Tag = rows ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
      <label style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.46rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.28em", color: isActive ? T.orange : T.muted, transition: "color 0.25s" }}>
        {label}{required && " *"}
      </label>
      <div style={{ position: "relative" }}>
        <Tag
          name={name}
          type={type}
          required={required}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            width: "100%", background: "transparent",
            borderBottom: "1.5px solid " + (isActive ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.1)"),
            color: T.text, padding: "0.75rem 0",
            outline: "none", resize: rows ? "none" : undefined,
            fontFamily: "'Space Mono', monospace", fontSize: "0.75rem",
            opacity: disabled ? 0.5 : 1, transition: "border-color 0.25s",
            display: "block",
          }}
          placeholder={placeholder}
        />
        <style>{`
          input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.18); font-family: 'Space Mono', monospace; font-size: 0.68rem; }
          input:focus, textarea:focus { outline: none; }
        `}</style>
        {/* Orange sweep line on focus */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, " + T.orange + ", " + T.orangeD + ")", transformOrigin: "left", borderRadius: 1 }}
        />
      </div>
    </div>
  );
}

// ─── CONTACT SECTION ─────────────────────────────────────────────────────────
function Contact() {
  var [submitting, setSubmitting] = useState(false);
  var [status, setStatus] = useState(null);
  var [focused, setFocused] = useState(null);

  var headerRef = useRef(null);
  var formRef = useRef(null);
  var headerInView = useInView(headerRef, { once: true });
  var formInView = useInView(formRef, { once: true });

  var formMx = useMotionValue(0);
  var formMy = useMotionValue(0);
  var formMxS = useSpring(formMx, { stiffness: 60, damping: 20 });
  var formMyS = useSpring(formMy, { stiffness: 60, damping: 20 });
  var formRotX = useTransform(formMyS, [-0.5, 0.5], ["4deg", "-4deg"]);
  var formRotY = useTransform(formMxS, [-0.5, 0.5], ["-4deg", "4deg"]);
  var formGlare = useTransform([formMxS, formMyS], function(l) {
    return "radial-gradient(circle 380px at " + ((l[0] + 0.5) * 100) + "% " + ((l[1] + 0.5) * 100) + "%, rgba(249,115,22,0.07) 0%, transparent 65%)";
  });
  var [formHov, setFormHov] = useState(false);
  var formEl = useRef(null);

  function onFormMouseMove(e) {
    var r = formEl.current && formEl.current.getBoundingClientRect();
    if (r) { formMx.set((e.clientX - r.left) / r.width - 0.5); formMy.set((e.clientY - r.top) / r.height - 0.5); }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    var data = new FormData(e.target);
    data.append("access_key", "f03b99d4-599d-460a-998d-62046420b9ba");
    try {
      var res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
      var json = await res.json();
      setStatus(json.success ? "success" : "error");
      if (json.success) e.target.reset();
    } catch(_) { setStatus("error"); }
    finally {
      setSubmitting(false);
      setTimeout(function() { setStatus(null); }, 5000);
    }
  }

  return (
    <section
      id="contact"
      style={{ position: "relative", background: T.bg, color: T.text, padding: "calc(var(--navbar-height) + 6rem) 6% 6rem", borderTop: "1px solid rgba(249,115,22,0.08)", overflow: "hidden" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap');
        * { box-sizing: border-box; }
        .contact-grid {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 5rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .contact-grid { grid-template-columns: 1fr; gap: 3.5rem; }
          section#contact { padding: calc(var(--navbar-height) + 4rem) 5% 5rem !important; }
        }
        @keyframes glow-ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>

      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 90% 60% at 50% 20%, black 40%, transparent 100%)" }} />

      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "-5%", left: "15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 10 }}>

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <header ref={headerRef} style={{ marginBottom: "5rem", position: "relative", paddingBottom: "3rem" }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}
          >
            <div style={{ height: 1, width: 28, background: "linear-gradient(to right, transparent, " + T.orange + ")", flexShrink: 0 }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.32rem 0.9rem", borderRadius: 100, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.22)", backdropFilter: "blur(10px)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.orange, boxShadow: "0 0 8px " + T.orange, display: "inline-block", animation: "dot-pulse 2s infinite" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(251,146,60,0.9)" }}>Get In Touch</span>
            </div>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, " + T.border + ", transparent)" }} />
          </motion.div>

          {/* Headline */}
          <div style={{ position: "relative" }}>
            {/* Ghost word */}
            <div style={{ position: "absolute", top: "-1rem", left: "-0.5rem", fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(5rem, 14vw, 12rem)", fontWeight: 700, color: "rgba(249,115,22,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.04em" }}>
              TALK
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 26 }} animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2.8rem, 7vw, 7rem)", fontWeight: 700, lineHeight: 0.88, letterSpacing: "-0.03em", color: T.text, margin: "0 0 1.5rem 0", position: "relative", zIndex: 1 }}
            >
              Let's Start A
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 400, WebkitTextStroke: "1px rgba(255,255,255,0.2)", WebkitTextFillColor: "transparent", background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.18) 100%)", WebkitBackgroundClip: "text" }}>
                Conversation.
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(0.68rem, 1.2vw, 0.82rem)", color: T.muted, maxWidth: 520, lineHeight: 1.9, borderLeft: "2px solid rgba(249,115,22,0.22)", paddingLeft: "1.1rem", margin: 0 }}
          >
            Have a project in mind or just want to discuss technology? My inbox is always open for collaboration and interesting conversations.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }} animate={headerInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.55 }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, " + T.orange + "44, " + T.borderB + " 60%, transparent)", transformOrigin: "left" }}
          />
        </header>

        {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
        <div className="contact-grid">

          {/* LEFT — info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            <motion.div
              initial={{ opacity: 0, x: -24 }} animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.65 }}
            >
              <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em", margin: "0 0 0.75rem 0" }}>
                Ready to bring your ideas to life?
              </h3>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: T.muted, lineHeight: 1.85, margin: 0 }}>
                Whether it's a complex web application, an interactive experience, or a creative digital project — let's make it happen together.
              </p>
            </motion.div>

            {/* Contact cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {CONTACT_INFO.map(function(info, i) {
                return <ContactCard key={i} info={info} index={i} inView={headerInView} />;
              })}
            </div>

            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0 }} animate={headerInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.2 }}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "1.25rem", borderTop: "1px solid " + T.borderB }}
            >
              <span style={{ position: "relative", display: "flex", width: 10, height: 10, flexShrink: 0 }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e", opacity: 0.7, animation: "glow-ping 1.5s infinite" }} />
                <span style={{ position: "relative", width: 10, height: 10, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.8)", display: "inline-flex" }} />
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: T.faint }}>Available for projects</span>
            </motion.div>
          </div>

          {/* RIGHT — 3D form */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 40 }} animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              ref={formEl}
              onMouseMove={onFormMouseMove}
              onMouseEnter={function() { setFormHov(true); }}
              onMouseLeave={function() { formMx.set(0); formMy.set(0); setFormHov(false); }}
              style={{ rotateX: formRotX, rotateY: formRotY, transformStyle: "preserve-3d", perspective: "1100px" }}
            >
              <div style={{
                position: "relative", overflow: "hidden",
                padding: "2.5rem", borderRadius: 24,
                background: "linear-gradient(160deg, rgba(16,14,12,0.98) 0%, rgba(8,7,6,0.99) 100%)",
                border: "1px solid " + (formHov ? T.borderH : T.borderB),
                boxShadow: formHov
                  ? "0 60px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(249,115,22,0.08)"
                  : "0 20px 60px rgba(0,0,0,0.6)",
                transition: "border-color 0.35s, box-shadow 0.45s",
                backdropFilter: "blur(20px)",
              }}>
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, " + T.orange + " 40%, transparent)", opacity: formHov ? 1 : 0, transition: "opacity 0.4s" }} />
                {/* Glare */}
                <motion.div style={{ position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none", background: formGlare, opacity: formHov ? 1 : 0, transition: "opacity 0.35s" }} />

                <div style={{ position: "relative", transform: "translateZ(30px)" }}>
                  {/* Form header */}
                  <div style={{ marginBottom: "2.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                      <div style={{ width: 18, height: 2, background: "linear-gradient(to right, " + T.orange + ", transparent)", borderRadius: 2 }} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: T.orange }}>Send a Message</span>
                    </div>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: T.muted, margin: 0, lineHeight: 1.7 }}>
                      Fill out the form and I'll get back within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                    {/* Name + Email row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="form-row">
                      <Field label="Full Name"      name="name"    type="text"  required placeholder="John Doe"          focused={focused} onFocus={function(){setFocused("name")}}    onBlur={function(){setFocused(null)}} disabled={submitting} />
                      <Field label="Email Address"  name="email"   type="email" required placeholder="john@example.com"  focused={focused} onFocus={function(){setFocused("email")}}   onBlur={function(){setFocused(null)}} disabled={submitting} />
                    </div>

                    <Field label="Subject" name="subject" type="text" placeholder="Project inquiry..." focused={focused} onFocus={function(){setFocused("subject")}} onBlur={function(){setFocused(null)}} disabled={submitting} />

                    <Field label="Your Message" name="message" required rows={5} placeholder="Tell me about your project or idea..." focused={focused} onFocus={function(){setFocused("message")}} onBlur={function(){setFocused(null)}} disabled={submitting} />

                    {/* Submit row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem", flexWrap: "wrap", gap: "1rem" }}>
                      <motion.button
                        type="submit"
                        disabled={submitting || status === "success"}
                        whileHover={{ scale: 1.04, boxShadow: "0 18px 45px rgba(249,115,22,0.42)" }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.55rem",
                          padding: "0.88rem 2rem", borderRadius: 4,
                          background: (status === "success")
                            ? "rgba(34,197,94,0.15)"
                            : "linear-gradient(135deg, " + T.orange + ", " + T.orangeD + ")",
                          border: "1px solid " + ((status === "success") ? "rgba(34,197,94,0.4)" : "transparent"),
                          color: "#fff",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                          cursor: (submitting || status === "success") ? "not-allowed" : "pointer",
                          opacity: (submitting || status === "success") ? 0.75 : 1,
                          boxShadow: "0 8px 28px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                          transition: "all 0.28s",
                        }}
                      >
                        {submitting ? (
                          <>
                            <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} style={{ display: "inline-flex" }}>
                              <FiSend size={14} />
                            </motion.span>
                            Sending...
                          </>
                        ) : status === "success" ? (
                          <><FiCheck size={14} /> Sent!</>
                        ) : (
                          <><FiSend size={14} /> Send Message</>
                        )}
                      </motion.button>

                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: T.faint }}>
                        Response within 24h
                      </span>
                    </div>

                    {/* Status */}
                    <AnimatePresence mode="wait">
                      {status && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "1rem 1.2rem", borderRadius: 14,
                            background: status === "success" ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                            border: "1px solid " + (status === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"),
                            color: status === "success" ? "#4ade80" : "#f87171",
                          }}
                        >
                          {status === "success" ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
                          <div>
                            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.54rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 3px 0" }}>
                              {status === "success" ? "Message Delivered!" : "Sending Failed"}
                            </p>
                            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", color: T.muted, margin: 0 }}>
                              {status === "success" ? "I'll get back to you soon!" : "Please try again or email directly."}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }} animate={formInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          style={{ marginTop: "5rem", paddingTop: "2rem", borderTop: "1px solid " + T.borderB, textAlign: "center" }}
        >
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: T.faint, margin: 0 }}>
            © 2024 — Built with passion & precision
          </p>
        </motion.footer>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

export default Contact;