/**
 * useGroq.js — Premium Groq API Hook Suite
 * ─────────────────────────────────────────
 * For: Perpetual Okan's Portfolio · ASK PERPETUAL · AI
 * Model: llama-3.3-70b-versatile (Groq)
 *
 * Exports:
 *   useGroq         — primary hook (completions + memory + cache + retry)
 *   useGroqStream   — dedicated streaming hook with typewriter support
 *   useGroqChat     — full multi-turn conversation manager (drop-in for ChatWidget)
 *   useGroqBatch    — parallel multi-prompt processing
 *   useGroqMemo     — memoized wrapper for perf-critical components
 */

import {
  useState, useCallback, useRef, useEffect, useMemo, useReducer,
} from "react";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile";

/** Groq free-tier limits: 30 req/min, 6000 tokens/min */
const RATE_LIMIT = { requestsPerMinute: 28, tokensPerMinute: 5800 };

/** Rough token estimate — 1 token ≈ 4 chars */
export const estimateTokens = (text = "") => Math.ceil((text || "").length / 4);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* ═══════════════════════════════════════════════════════════════
   GLOBAL RATE LIMITER  (shared across all hook instances)
═══════════════════════════════════════════════════════════════ */
const rateLimiter = (() => {
  const win = { reqs: [], tokens: [] };
  const now = () => Date.now();
  const prune = (arr) => arr.filter((ts) => now() - ts < 60_000);

  return {
    check(estTokens = 0) {
      win.reqs   = prune(win.reqs);
      win.tokens = prune(win.tokens);
      const tooManyReqs   = win.reqs.length >= RATE_LIMIT.requestsPerMinute;
      const tooManyTokens = win.tokens.reduce((s, t) => s + t, 0) + estTokens > RATE_LIMIT.tokensPerMinute;
      if (tooManyReqs || tooManyTokens) {
        const oldest = Math.min(...win.reqs, now() - 59_000);
        return { ok: false, waitMs: Math.max(0, 60_000 - (now() - oldest)) + 300 };
      }
      return { ok: true, waitMs: 0 };
    },
    record(tokens = 0) {
      win.reqs.push(now());
      win.tokens.push(tokens);
    },
  };
})();

/* ═══════════════════════════════════════════════════════════════
   GLOBAL LRU RESPONSE CACHE  (shared across all hook instances)
═══════════════════════════════════════════════════════════════ */
const responseCache = (() => {
  const map = new Map();
  const MAX = 300;
  return {
    get(key) {
      if (!map.has(key)) return null;
      const v = map.get(key);
      map.delete(key);
      map.set(key, v);
      return v;
    },
    set(key, value) {
      if (map.has(key)) map.delete(key);
      if (map.size >= MAX) map.delete(map.keys().next().value);
      map.set(key, value);
    },
    clear() { map.clear(); },
    size()  { return map.size; },
  };
})();

const makeCacheKey = (...parts) =>
  parts.map((p) => (typeof p === "object" ? JSON.stringify(p) : String(p))).join("|");

/* ═══════════════════════════════════════════════════════════════
   FRIENDLY ERROR MESSAGES
═══════════════════════════════════════════════════════════════ */
function friendlyError(err) {
  if (!err || err.name === "AbortError") return "";
  const c = err.code || "";
  if (c === "AUTH")        return "⚙️ API key issue — please check your .env file.";
  if (c === "RATE_LIMIT")  return "⏳ Too many requests — please wait a moment and try again.";
  if (c === "SERVER")      return "🔧 Groq is having issues right now. Try again in a few seconds.";
  if (c === "EMPTY")       return "🤔 No response received. Please try rephrasing your question.";
  if (err.message?.includes("timeout"))          return "⏱️ Request timed out. Try a shorter question.";
  if (err.message?.includes("network") || err.message?.includes("fetch"))
                                                 return "🌐 Network error — check your connection and try again.";
  return "⚠️ Something went wrong. Please try again.";
}

/* ═══════════════════════════════════════════════════════════════
   BASE REQUEST ENGINE
   All hooks call this. Handles rate-limiting, retries,
   streaming, and structured error codes.
═══════════════════════════════════════════════════════════════ */
async function groqRequest({
  messages,
  maxTokens        = 500,
  temperature      = 0.7,
  topP             = 0.9,
  frequencyPenalty = 0,
  presencePenalty  = 0,
  stream           = false,
  signal,
  retryAttempts    = 2,
  onChunk,
}) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw Object.assign(new Error("VITE_GROQ_API_KEY is not set."), { code: "AUTH" });

  // Rate limit pre-check
  const estTokens = estimateTokens(messages.map((m) => m.content).join(" ")) + maxTokens;
  const { ok, waitMs } = rateLimiter.check(estTokens);
  if (!ok) await sleep(waitMs);

  const body = JSON.stringify({
    model:             MODEL,
    max_tokens:        maxTokens,
    temperature,
    top_p:             topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty:  presencePenalty,
    messages,
    stream,
  });

  let attempt = 0;

  while (true) {
    try {
      const res = await fetch(GROQ_URL, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body,
        signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg     = errJson?.error?.message || res.statusText;

        if (res.status === 401)
          throw Object.assign(new Error("Invalid API key."), { code: "AUTH" });

        if (res.status === 429) {
          const retryAfter = Number(res.headers.get("Retry-After") || 5);
          if (attempt < retryAttempts) { await sleep(retryAfter * 1000); attempt++; continue; }
          throw Object.assign(new Error("Rate limit exceeded."), { code: "RATE_LIMIT" });
        }

        if (res.status >= 500) {
          if (attempt < retryAttempts) { await sleep(Math.pow(2, attempt) * 1000); attempt++; continue; }
          throw Object.assign(new Error(`Groq server error (${res.status}): ${msg}`), { code: "SERVER" });
        }

        throw Object.assign(new Error(`Groq API error (${res.status}): ${msg}`), { code: "API" });
      }

      // ── STREAMING ────────────────────────────────────────────
      if (stream) {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder
            .decode(value, { stream: true })
            .split("\n")
            .filter((l) => l.startsWith("data: ") && !l.includes("[DONE]"));

          for (const line of lines) {
            try {
              const parsed  = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                accumulated += content;
                onChunk?.(content, accumulated);
              }
              if (parsed.x_groq?.usage) usage = parsed.x_groq.usage;
            } catch { /* skip malformed chunks */ }
          }
        }

        rateLimiter.record(usage.total_tokens || estimateTokens(accumulated));
        return { text: accumulated, usage, streamed: true };
      }

      // ── NON-STREAMING ────────────────────────────────────────
      const data  = await res.json();
      const text  = data.choices?.[0]?.message?.content?.trim() || "";
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      if (!text) throw Object.assign(new Error("Empty response from Groq."), { code: "EMPTY" });

      rateLimiter.record(usage.total_tokens || estimateTokens(text));
      return { text, usage, streamed: false };

    } catch (err) {
      if (err.name === "AbortError") throw err;
      // Network errors — retry with exponential backoff
      if ((err.message?.includes("fetch") || err.message?.includes("network")) && attempt < retryAttempts) {
        await sleep(Math.pow(2, attempt) * 1000);
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   useGroq — PRIMARY HOOK
   ─────────────────────────────────────────────────────────────
   Features added vs original:
   ✓ Conversation memory with sliding window
   ✓ LRU response cache (shared, 300 entries)
   ✓ Global rate limiter with smart waiting
   ✓ Token usage tracking per request
   ✓ Streaming mode flag (streamMode: true)
   ✓ Per-chunk callback (onChunk)
   ✓ Exponential-backoff retry (up to retryAttempts)
   ✓ Abort/cancel with cleanup
   ✓ onSuccess / onError callbacks
   ✓ requestCount for analytics
   ✓ isReady flag for API key check
═══════════════════════════════════════════════════════════════ */

/**
 * @param {string} systemPrompt
 * @param {Object} [options]
 * @param {number}   [options.maxTokens=500]
 * @param {number}   [options.temperature=0.7]
 * @param {number}   [options.topP=0.9]
 * @param {number}   [options.frequencyPenalty=0]
 * @param {number}   [options.presencePenalty=0]
 * @param {number}   [options.timeout=30000]
 * @param {number}   [options.retryAttempts=2]
 * @param {boolean}  [options.enableCache=false]
 * @param {boolean}  [options.enableMemory=false]   — keep conversation context between ask() calls
 * @param {number}   [options.memoryWindow=6]       — number of turns to retain
 * @param {boolean}  [options.streamMode=false]     — stream responses by default
 * @param {Function} [options.onChunk]              — (chunk, accumulated) callback for streaming
 * @param {Function} [options.onSuccess]            — (text, userMessage) callback
 * @param {Function} [options.onError]              — (error, userMessage) callback
 */
export function useGroq(systemPrompt, options = {}) {
  const {
    maxTokens        = 500,
    temperature      = 0.7,
    topP             = 0.9,
    frequencyPenalty = 0,
    presencePenalty  = 0,
    timeout          = 30_000,
    retryAttempts    = 2,
    enableCache      = false,
    enableMemory     = false,
    memoryWindow     = 6,
    streamMode       = false,
    onChunk          = null,
    onError          = null,
    onSuccess        = null,
  } = options;

  const [reply,        setReply]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [usage,        setUsage]        = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [memory,       setMemory]       = useState([]);

  const abortRef     = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      console.error("[useGroq] VITE_GROQ_API_KEY is missing. Requests will fail.");
    }
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setReply("Request cancelled.");
  }, []);

  const ask = useCallback(async (userMessage, priorMessages = []) => {
    if (!userMessage?.trim()) {
      setError(new Error("Message cannot be empty."));
      return "";
    }

    // Cancel in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const reqId = ++requestIdRef.current;

    // Cache check
    const key = enableCache
      ? makeCacheKey(systemPrompt, memory, priorMessages, userMessage, maxTokens, temperature)
      : null;
    if (enableCache && key) {
      const cached = responseCache.get(key);
      if (cached) {
        setReply(cached.text);
        setUsage(cached.usage);
        onSuccess?.(cached.text, userMessage);
        return cached.text;
      }
    }

    setLoading(true);
    setError(null);
    if (streamMode) setReply("");

    // Timeout watchdog
    const timeoutId = setTimeout(() => {
      if (reqId === requestIdRef.current) {
        abortRef.current?.abort();
        const msg = "⏱️ Request timed out. Try a shorter question.";
        setReply(msg);
        setError(new Error("timeout"));
        setLoading(false);
      }
    }, timeout);

    // Build messages — memory → prior → current
    const memorySlice = enableMemory ? memory.slice(-memoryWindow * 2) : [];
    const messages = [
      { role: "system", content: systemPrompt },
      ...memorySlice,
      ...priorMessages,
      { role: "user", content: userMessage },
    ];

    try {
      const result = await groqRequest({
        messages,
        maxTokens,
        temperature,
        topP,
        frequencyPenalty,
        presencePenalty,
        stream:       streamMode,
        signal:       abortRef.current.signal,
        retryAttempts,
        onChunk: streamMode
          ? (chunk, acc) => {
              if (reqId === requestIdRef.current) {
                setReply(acc);
                onChunk?.(chunk, acc);
              }
            }
          : null,
      });

      if (reqId !== requestIdRef.current) return "";

      setReply(result.text);
      setUsage(result.usage);
      setRequestCount((c) => c + 1);

      if (enableMemory) {
        setMemory((prev) =>
          [...prev,
            { role: "user",      content: userMessage  },
            { role: "assistant", content: result.text  },
          ].slice(-memoryWindow * 2)
        );
      }

      if (enableCache && key) responseCache.set(key, { text: result.text, usage: result.usage });

      onSuccess?.(result.text, userMessage);
      return result.text;

    } catch (err) {
      if (reqId !== requestIdRef.current) return "";
      const msg = friendlyError(err);
      if (msg) {
        setReply(msg);
        setError(err);
        onError?.(err, userMessage);
      }
      return msg;
    } finally {
      clearTimeout(timeoutId);
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [
    systemPrompt, maxTokens, temperature, topP, frequencyPenalty, presencePenalty,
    timeout, retryAttempts, enableCache, enableMemory, memoryWindow,
    streamMode, onChunk, onSuccess, onError, memory,
  ]);

  const reset = useCallback((opts = {}) => {
    setReply("");
    setError(null);
    setUsage(null);
    if (opts.clearMemory !== false) setMemory([]);
    if (opts.clearCache)            responseCache.clear();
  }, []);

  return {
    // Core
    ask,
    reply,
    loading,
    error,
    // Analytics
    usage,          // { prompt_tokens, completion_tokens, total_tokens }
    requestCount,
    // Memory
    memory,
    clearMemory: () => setMemory([]),
    // Cache
    clearCache:  () => responseCache.clear(),
    cacheSize:   () => responseCache.size(),
    // Controls
    reset,
    cancel,
    isReady: !!import.meta.env.VITE_GROQ_API_KEY,
  };
}

/* ═══════════════════════════════════════════════════════════════
   useGroqStream — DEDICATED STREAMING HOOK
   ─────────────────────────────────────────────────────────────
   Optimised for chat UIs. Shows tokens as they arrive.
   Supports optional artificial typing delay for UX effect.
   Tracks isDone state for post-completion actions.
═══════════════════════════════════════════════════════════════ */

/**
 * @param {string} systemPrompt
 * @param {Object} [options]
 * @param {number}   [options.maxTokens=600]
 * @param {number}   [options.temperature=0.7]
 * @param {number}   [options.topP=0.9]
 * @param {number}   [options.typingSpeed=0]    ms delay per chunk (typewriter effect)
 * @param {Function} [options.onComplete]       (fullText) => void — fires when stream ends
 * @param {Function} [options.onChunk]          (chunk, accumulated) => void
 */
export function useGroqStream(systemPrompt, options = {}) {
  const {
    maxTokens   = 600,
    temperature = 0.7,
    topP        = 0.9,
    typingSpeed = 0,
    onComplete  = null,
    onChunk     = null,
  } = options;

  const [reply,   setReply]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [usage,   setUsage]   = useState(null);
  const [isDone,  setIsDone]  = useState(false);

  const abortRef = useRef(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(async (userMessage, priorMessages = []) => {
    if (!userMessage?.trim()) return "";
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setReply("");
    setError(null);
    setIsDone(false);

    const messages = [
      { role: "system", content: systemPrompt },
      ...priorMessages,
      { role: "user",   content: userMessage },
    ];

    try {
      const result = await groqRequest({
        messages, maxTokens, temperature, topP,
        stream: true,
        signal: abortRef.current.signal,
        retryAttempts: 1,
        onChunk: async (chunk, accumulated) => {
          if (typingSpeed > 0) await sleep(typingSpeed);
          setReply(accumulated);
          onChunk?.(chunk, accumulated);
        },
      });

      setUsage(result.usage);
      setIsDone(true);
      onComplete?.(result.text);
      return result.text;

    } catch (err) {
      const msg = friendlyError(err);
      if (msg) { setReply(msg); setError(err); }
      return msg;
    } finally {
      setLoading(false);
    }
  }, [systemPrompt, maxTokens, temperature, topP, typingSpeed, onComplete, onChunk]);

  const reset  = useCallback(() => { setReply(""); setError(null); setUsage(null); setIsDone(false); }, []);
  const cancel = useCallback(() => { abortRef.current?.abort(); setLoading(false); }, []);

  return { ask, reply, loading, error, usage, isDone, reset, cancel };
}

/* ═══════════════════════════════════════════════════════════════
   useGroqChat — FULL CONVERSATION MANAGER
   ─────────────────────────────────────────────────────────────
   Manages entire message history with IDs, timestamps,
   roles, per-message token counts, and streaming.
   Ready to drop into your ChatWidget as a replacement
   for the manual message array + fetch pattern.
═══════════════════════════════════════════════════════════════ */

const chatReducer = (state, action) => {
  switch (action.type) {
    case "ADD_MSG":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_LAST":
      return {
        ...state,
        messages: state.messages.map((m, i) =>
          i === state.messages.length - 1 ? { ...m, ...action.payload } : m
        ),
      };
    case "SET_LOADING": return { ...state, loading: action.payload };
    case "SET_ERROR":   return { ...state, error:   action.payload };
    case "CLEAR":
      return { ...state, messages: action.payload ?? [], error: null };
    case "ADD_USAGE":
      return {
        ...state,
        totalUsage: {
          prompt_tokens:     (state.totalUsage.prompt_tokens     || 0) + (action.payload?.prompt_tokens     || 0),
          completion_tokens: (state.totalUsage.completion_tokens || 0) + (action.payload?.completion_tokens || 0),
          total_tokens:      (state.totalUsage.total_tokens      || 0) + (action.payload?.total_tokens      || 0),
        },
      };
    default: return state;
  }
};

/**
 * @param {string} systemPrompt
 * @param {Object} [options]
 * @param {Object[]} [options.initialMessages=[]]   Seed messages (e.g. greeting)
 * @param {boolean}  [options.stream=true]
 * @param {number}   [options.maxTokens=600]
 * @param {number}   [options.temperature=0.7]
 * @param {number}   [options.maxHistory=20]        Max turns kept in context
 * @param {Function} [options.onMessage]            (assistantText, userText) => void
 */
export function useGroqChat(systemPrompt, options = {}) {
  const {
    initialMessages = [],
    stream          = true,
    maxTokens       = 600,
    temperature     = 0.7,
    topP            = 0.9,
    maxHistory      = 20,
    onMessage       = null,
  } = options;

  const [state, dispatch] = useReducer(chatReducer, {
    messages:   initialMessages,
    loading:    false,
    error:      null,
    totalUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  });

  const abortRef     = useRef(null);
  const requestIdRef = useRef(0);
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (userText) => {
    if (!userText?.trim() || state.loading) return "";

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const reqId = ++requestIdRef.current;

    // User message
    dispatch({
      type: "ADD_MSG",
      payload: {
        id:        `u_${Date.now()}`,
        role:      "user",
        content:   userText,
        timestamp: new Date().toISOString(),
      },
    });
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR",   payload: null });

    // Placeholder assistant message (streaming fills it in)
    dispatch({
      type: "ADD_MSG",
      payload: {
        id:        `a_${Date.now()}`,
        role:      "assistant",
        content:   "",
        timestamp: new Date().toISOString(),
        streaming: true,
      },
    });

    // Context: trim to maxHistory pairs
    const historyMsgs = state.messages
      .filter((m) => m.role !== "system")
      .slice(-maxHistory * 2)
      .map(({ role, content }) => ({ role, content }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMsgs,
      { role: "user",   content: userText },
    ];

    try {
      const result = await groqRequest({
        messages, maxTokens, temperature, topP,
        stream,
        signal:        abortRef.current.signal,
        retryAttempts: 2,
        onChunk: stream
          ? (_, accumulated) => {
              if (reqId === requestIdRef.current) {
                dispatch({ type: "UPDATE_LAST", payload: { content: accumulated } });
              }
            }
          : null,
      });

      if (reqId !== requestIdRef.current) return "";

      dispatch({ type: "UPDATE_LAST", payload: { content: result.text, streaming: false, usage: result.usage } });
      dispatch({ type: "ADD_USAGE",   payload: result.usage });
      onMessage?.(result.text, userText);
      return result.text;

    } catch (err) {
      if (reqId !== requestIdRef.current) return "";
      const msg = friendlyError(err);
      if (msg) {
        dispatch({ type: "UPDATE_LAST", payload: { content: msg, streaming: false, isError: true } });
        dispatch({ type: "SET_ERROR",   payload: err });
      }
      return msg;
    } finally {
      if (reqId === requestIdRef.current) dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [
    systemPrompt, maxTokens, temperature, topP, stream,
    maxHistory, state.loading, state.messages, onMessage,
  ]);

  const clearChat = useCallback((keepInitial = true) => {
    dispatch({ type: "CLEAR", payload: keepInitial ? initialMessages : [] });
  }, [initialMessages]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  return {
    messages:   state.messages,
    loading:    state.loading,
    error:      state.error,
    totalUsage: state.totalUsage,
    /** e.g. "1.2k / 6k tokens used" */
    tokenBudget: `${(Math.round((state.totalUsage?.total_tokens || 0) / 100) / 10).toFixed(1)}k / ${RATE_LIMIT.tokensPerMinute / 1000}k`,
    send,
    clearChat,
    cancel,
    isReady: !!import.meta.env.VITE_GROQ_API_KEY,
  };
}

/* ═══════════════════════════════════════════════════════════════
   useGroqBatch — PARALLEL MULTI-PROMPT
   ─────────────────────────────────────────────────────────────
   Send multiple independent prompts concurrently.
   Progress bar friendly. Per-item error isolation.

   Usage:
     const { sendBatch, results, loading, progress } = useGroqBatch(SYSTEM)
     sendBatch(["What is X?", "Explain Y", "Define Z"])
═══════════════════════════════════════════════════════════════ */

/**
 * @param {string} systemPrompt
 * @param {Object} [options]
 * @param {number}  [options.maxTokens=300]
 * @param {number}  [options.concurrency=3]   Max parallel requests
 */
export function useGroqBatch(systemPrompt, options = {}) {
  const { maxTokens = 300, temperature = 0.7, topP = 0.9, concurrency = 3 } = options;

  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors,   setErrors]   = useState([]);

  const sendBatch = useCallback(async (prompts = []) => {
    if (!prompts.length) return [];
    setLoading(true);
    setProgress(0);
    setErrors([]);

    const out  = new Array(prompts.length).fill(null);
    const errs = [];
    let done   = 0;

    for (let i = 0; i < prompts.length; i += concurrency) {
      const chunk = prompts.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(async (prompt, j) => {
          const idx = i + j;
          try {
            const result = await groqRequest({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user",   content: prompt },
              ],
              maxTokens, temperature, topP, retryAttempts: 1,
            });
            out[idx] = { prompt, text: result.text, usage: result.usage, error: null };
          } catch (err) {
            out[idx] = { prompt, text: null, error: friendlyError(err) };
            errs.push({ index: idx, error: err });
          } finally {
            done++;
            setProgress(Math.round((done / prompts.length) * 100));
          }
        })
      );
    }

    setResults(out);
    setErrors(errs);
    setLoading(false);
    return out;
  }, [systemPrompt, maxTokens, temperature, topP, concurrency]);

  const reset = useCallback(() => { setResults([]); setErrors([]); setProgress(0); }, []);

  return { sendBatch, results, loading, progress, errors, reset };
}

/* ═══════════════════════════════════════════════════════════════
   useGroqMemo — MEMOIZED WRAPPER
   Prevents prompt-string reference churn in components
   that receive systemPrompt as a prop.
═══════════════════════════════════════════════════════════════ */
export function useGroqMemo(systemPrompt, options = {}) {
  return useGroq(useMemo(() => systemPrompt, [systemPrompt]), options);
}

/* ═══════════════════════════════════════════════════════════════
   STANDALONE UTILITIES
═══════════════════════════════════════════════════════════════ */

/** Flush the shared response cache */
export const clearGlobalCache = () => responseCache.clear();

/** Cache diagnostics */
export const getCacheStats = () => ({ size: responseCache.size(), maxSize: 300 });

/* ═══════════════════════════════════════════════════════════════
   DEFAULT EXPORT
═══════════════════════════════════════════════════════════════ */
export default useGroq;