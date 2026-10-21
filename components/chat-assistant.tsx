"use client"

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowUp, Dumbbell, MessageSquare, Minus, X } from "lucide-react"
import ChatMarkdown from "./chat-markdown"

/*
 * SAITAMA, Arav's AI agent, dressed for the gym in the hero: the launcher is a bumper plate,
 * the header carries the bar's plate colours (weighted 25 to 5 like the plates themselves),
 * and replies stream in from the API and are typed out at a reading pace with a caret, as
 * markdown. While it thinks, plates slide onto a sleeve.
 */

type Msg = { id: number; role: "user" | "assistant"; content: string; live?: boolean; error?: boolean }

/** The bar's plates in the hero: Kafka, Spring Boot, Python, Graph RAG, Postgres. */
const PLATES = ["#D2453B", "#3F63D6", "#E3B23C", "#3C9A5F", "#E8E4DC"]

const SUGGESTIONS = [
  "How has Arav used Kafka?",
  "What are Arav's skills?",
  "Tell me about Arav's projects",
  "What awards has Arav won?",
  "What is Arav's experience with AI?",
]

const INTRO: Msg = {
  id: 0,
  role: "assistant",
  content: "Hi, I'm **SAITAMA**, Arav's AI agent. Ask me anything about his projects, skills and experience.",
}

const FAILED = "I couldn't reach my model just now. Please try again in a moment."

const STATUS = { idle: "Ready", waiting: "Thinking", streaming: "Answering" } as const

export default function ChatAssistant() {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([INTRO])
  const [input, setInput] = useState("")
  const [phase, setPhase] = useState<keyof typeof STATUS>("idle")
  const busy = phase !== "idle"

  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const stick = useRef(true)
  const ids = useRef(1)
  const stream = useRef({ buffer: "", shown: 0, done: false, raf: 0, last: 0, carry: 0 })

  // keep the newest line in view as it streams, unless the reader has scrolled up to reread
  useEffect(() => {
    const el = logRef.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [messages, open, minimised])

  useEffect(() => () => cancelAnimationFrame(stream.current.raf), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // focus the field on open, but not on touch screens where it would throw up the keyboard
  useEffect(() => {
    if (open && !minimised && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true })
  }, [open, minimised])

  /**
   * Type the reply out as it arrives: about 90 characters a second when the stream is close
   * behind, faster when it has run ahead, and never pausing on a half-typed markdown mark.
   */
  const reveal = (id: number) => {
    const s = stream.current
    cancelAnimationFrame(s.raf)
    s.last = performance.now()
    s.carry = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000)
      s.last = now
      const behind = s.buffer.length - s.shown
      if (behind > 0) {
        if (reduce) s.shown = s.buffer.length
        else {
          s.carry += Math.min(620, Math.max(90, behind * 1.8)) * dt
          const step = Math.floor(s.carry)
          s.carry -= step
          s.shown = Math.min(s.buffer.length, s.shown + step)
          while (s.shown < s.buffer.length && "*`".includes(s.buffer[s.shown - 1] ?? "")) s.shown++
        }
        const text = s.buffer.slice(0, s.shown)
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, content: text } : x)))
      }
      if (s.done && s.shown >= s.buffer.length) {
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, live: false } : x)))
        setPhase("idle")
        return
      }
      s.raf = requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)
  }

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || busy) return
    const history = messages.filter((m) => !m.error).map(({ role, content }) => ({ role, content }))
    const reply: Msg = { id: ids.current + 1, role: "assistant", content: "", live: true }
    setMessages((m) => [...m, { id: ids.current, role: "user", content: question }, reply])
    ids.current += 2
    setInput("")
    setPhase("waiting")
    stick.current = true

    const s = stream.current
    s.buffer = ""
    s.shown = 0
    s.done = false
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: question }] }),
      })
      if (!res.ok || !res.body) throw new Error(`Chat API failed with ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      reveal(reply.id)
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        s.buffer += decoder.decode(value, { stream: true })
        if (s.buffer) setPhase("streaming")
      }
      s.buffer += decoder.decode()
      if (!s.buffer.trim()) throw new Error("Empty reply")
      s.done = true
    } catch (error) {
      console.error("SAITAMA could not answer:", error)
      cancelAnimationFrame(s.raf)
      setMessages((m) => m.map((x) => (x.id === reply.id ? { ...x, content: FAILED, live: false, error: true } : x)))
      setPhase("idle")
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const onScroll = () => {
    const el = logRef.current
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  const enter = reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            className="spot-try"
            initial={enter}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={enter}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              setOpen(true)
              setMinimised(false)
            }}
          >
            <Dumbbell size={14} aria-hidden />
            Try SAITAMA
          </motion.button>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="spot-launch"
        aria-label={open ? "Close the chat with SAITAMA" : "Chat with SAITAMA"}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open)
          setMinimised(false)
        }}
      >
        {open ? <X size={16} strokeWidth={2.4} aria-hidden /> : <MessageSquare size={15} strokeWidth={2.4} aria-hidden />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            className={`spot-panel ${minimised ? "is-min" : ""}`}
            role="dialog"
            aria-label="Chat with SAITAMA"
            initial={enter}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={enter}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="spot-head">
              <span className="spot-face" aria-hidden />
              <div className="spot-name">
                <b>SAITAMA</b>
                <span>Arav&apos;s AI spotter</span>
              </div>
              <span className={`spot-status ${busy ? "is-busy" : ""}`}>{STATUS[phase]}</span>
              <button
                type="button"
                className="spot-icon"
                onClick={() => setMinimised(!minimised)}
                aria-label={minimised ? "Expand the chat" : "Minimise the chat"}
              >
                <Minus size={16} aria-hidden />
              </button>
              <button type="button" className="spot-icon" onClick={() => setOpen(false)} aria-label="Close the chat">
                <X size={16} aria-hidden />
              </button>
            </header>
            <div className={`spot-bar ${busy ? "is-live" : ""}`} aria-hidden>
              {PLATES.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </div>

            {!minimised && (
              <>
                <div ref={logRef} className="spot-log" role="log" aria-live="polite" aria-busy={busy} onScroll={onScroll}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      className={m.role === "user" ? "spot-user" : `spot-bot ${m.error ? "is-error" : ""}`}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {m.role === "user" ? (
                        m.content
                      ) : m.live && !m.content ? (
                        <span className="spot-loading">
                          <span className="spot-plates" aria-hidden>
                            {PLATES.slice(0, 3).map((c) => (
                              <i key={c} style={{ background: c }} />
                            ))}
                          </span>
                          Loading the bar
                        </span>
                      ) : (
                        <div className="spot-md">
                          <ChatMarkdown text={m.content} streaming={m.live} tail={m.live ? <span className="spot-caret" aria-hidden /> : null} />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {messages.length === 1 && (
                    <div className="spot-suggest">
                      <p>Try asking</p>
                      {SUGGESTIONS.map((q, i) => (
                        <button key={q} type="button" className="spot-chip" onClick={() => send(q)}>
                          <i style={{ "--plate": PLATES[i] } as CSSProperties} aria-hidden />
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <form className="spot-form" onSubmit={onSubmit}>
                  <input
                    ref={inputRef}
                    className="spot-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Arav's work"
                    aria-label="Your question for SAITAMA"
                    enterKeyHint="send"
                  />
                  <button type="submit" className="spot-send" disabled={busy || !input.trim()} aria-label="Send">
                    <ArrowUp size={18} strokeWidth={2.4} aria-hidden />
                  </button>
                </form>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
