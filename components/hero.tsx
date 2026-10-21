"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import NameReveal from "./name-reveal"
import { DomainNav } from "./graph/domain-nav"
import type { GymEngine } from "./gym/engine"

const STEPS = ["Warm up", "Load", "Lift", "Hold", "Drop"]

/**
 * The hero is a gym, built like the TitanOCR landing hero: a WebGL scene fills it edge to
 * edge, the copy sits on the left, and on the right the avatar (a cel-shaded anime lifter in
 * a Bulls jersey) loads a bar with his stack and deadlifts it in a looping film. three.js is
 * loaded on demand, so the copy renders immediately and the scene fades in once it is ready.
 */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)
  const loadChipRef = useRef<HTMLDivElement>(null)
  const loadValueRef = useRef<HTMLSpanElement>(null)
  const repsChipRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GymEngine | null>(null)
  const [step, setStep] = useState(3)
  const [gl, setGl] = useState<"pending" | "on" | "off">("pending")

  useEffect(() => {
    let cancelled = false
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    const css = getComputedStyle(document.body)
    const displayFont = css.getPropertyValue("--font-display").trim() || "Arial, sans-serif"
    const monoFont = css.getPropertyValue("--font-gauge").trim() || "monospace"

    // his face on the lifter comes from the avatar artwork
    const avatar = new Image()
    avatar.src = "/avatar.png"

    Promise.all([
      import("./gym/engine"),
      avatar.decode().then(() => avatar, () => null),
      document.fonts?.load(`800 64px ${displayFont}`).catch(() => null),
      document.fonts?.load(`600 30px ${monoFont}`).catch(() => null),
    ]).then(([{ createGymEngine }, face]) => {
      const hero = heroRef.current, canvas = canvasRef.current, slot = slotRef.current
      const tagLayer = tagRef.current, loadValue = loadValueRef.current
      const load = loadChipRef.current, reps = repsChipRef.current
      if (cancelled || !hero || !canvas || !slot || !tagLayer || !loadValue || !load || !reps) return
      const engine = createGymEngine({
        canvas,
        hero,
        slot,
        tagLayer,
        loadValue,
        chips: { load, reps },
        avatar: face,
        displayFont,
        monoFont,
        still,
        onStep: setStep,
      })
      if (!engine) {
        setGl("off")
        return
      }
      engineRef.current = engine
      setGl("on")
    })

    return () => {
      cancelled = true
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  return (
    <section id="home" ref={heroRef} className="gym-hero">
      <div className="gym-bg" aria-hidden />
      <canvas ref={canvasRef} className={`gym-canvas ${gl === "on" ? "is-on" : ""}`} aria-hidden />
      <div className="gym-shade" aria-hidden />
      <div ref={tagRef} className="gym-tags" aria-hidden />

      <div className="gym-inner">
        <div className="gym-copy">
          <p className="gym-eyebrow">Backend and AI engineer, Pune</p>
          <h1 className="gym-title">
            <span className="sr-only">Arav Saxena</span>
            <NameReveal stacked blocks={["#8B5CF6", "#F4F1EC"]} highlight="bg-violet-500/45" />
          </h1>
          <p className="gym-lede">
            I build event-driven backends and AI systems that carry real load: Kafka pipelines, Graph RAG platforms and agents.
          </p>
          <div className="gym-ctas">
            <a className="gym-btn gym-btn-solid" href="mailto:aravsaxena884@gmail.com">
              Let&apos;s Collaborate
              <span className="arr" aria-hidden>
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
            <a className="gym-btn gym-btn-line" href="/resume.pdf" download>
              Resume
              <span className="arr" aria-hidden>
                <ArrowDown className="h-4 w-4" />
              </span>
            </a>
          </div>
          <div className="gym-lens">
            <span>Explore my work by lens</span>
            <DomainNav />
          </div>
        </div>

        <div ref={slotRef} className="gym-slot">
          <p className="sr-only">
            Arav&apos;s avatar, an anime lifter in a red Bulls jersey and black Adidas track pants, stands on an oak lifting
            platform in a gym. In a loop he chalks up, loads a barbell with plates labelled Kafka, Spring Boot, Python, Graph RAG
            and Postgres, deadlifts it, holds the lockout, and drops it.
          </p>
          <ol className="gym-steps" aria-label="Jump to a step of the lift">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  className={i === step ? "is-on" : ""}
                  aria-pressed={i === step}
                  disabled={gl !== "on"}
                  onClick={() => engineRef.current?.seek(i)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ol>
          <div ref={loadChipRef} className={`gym-chip gym-chip-r ${gl === "off" ? "is-on" : ""}`} aria-hidden>
            <b>
              <span ref={loadValueRef}>170</span> kg
            </b>
            <span>my stack, on the bar</span>
          </div>
          <div ref={repsChipRef} className={`gym-chip gym-chip-l ${gl === "off" ? "is-on" : ""}`} aria-hidden>
            <b>300+ reps</b>
            <span>DSA problems solved</span>
          </div>
        </div>
      </div>
    </section>
  )
}
