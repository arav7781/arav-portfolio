"use client"

import { useEffect, useRef } from "react"
import { useAnimate } from "framer-motion"

/** Easing for the block cuts: a quick middle with crisp ends, like an edit point. */
const CUT = [0.77, 0, 0.175, 1] as const
/** Easing for things settling into place. */
const SETTLE = [0.16, 1, 0.3, 1] as const

const WORDS = ["Arav", "Saxena"]

/**
 * The name enters with an editing-room cut: a solid block wipes across each word and
 * uncovers it, while the word arrives as two horizontal slices that slide together.
 * A marker highlight then draws in under the full name. Hovering replays the slice cut.
 * Under reduced motion the finished state is shown immediately.
 *
 * `stacked` puts each word on its own line; `blocks` are the two wipe colours and
 * `highlight` the classes for the marker band, so the name works on light or dark.
 */
export default function NameReveal({
  stacked = false,
  blocks = ["var(--accent)", "var(--ink)"],
  highlight = "bg-violet-300/60 dark:bg-violet-500/35",
}: {
  stacked?: boolean
  blocks?: [string, string]
  highlight?: string
}) {
  const [scope, animate] = useAnimate()
  const busy = useRef(true)

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      animate(".nr-full", { opacity: 1 }, { duration: 0 })
      animate(".nr-hl", { scaleX: 1 }, { duration: 0 })
      busy.current = false
      return
    }

    let cancelled = false
    const revealWord = async (i: number, delay: number) => {
      const w = `.nr-w${i}`
      await animate(`${w} .nr-block`, { clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"] }, { duration: 0.34, ease: CUT, delay })
      if (cancelled) return
      await Promise.all([
        animate(`${w} .nr-block`, { clipPath: "inset(0% 0% 0% 100%)" }, { duration: 0.4, ease: CUT }),
        animate(`${w} .nr-top`, { opacity: [1, 1], x: [-22, 0] }, { duration: 0.8, ease: SETTLE }),
        animate(`${w} .nr-bot`, { opacity: [1, 1], x: [22, 0] }, { duration: 0.8, ease: SETTLE }),
      ])
      if (cancelled) return
      // swap the two slices for the single full word so no seam is left at rest
      animate(`${w} .nr-full`, { opacity: 1 }, { duration: 0 })
      animate(`${w} .nr-top, ${w} .nr-bot`, { opacity: 0 }, { duration: 0 })
    }

    ;(async () => {
      await Promise.all(WORDS.map((_, i) => revealWord(i, 0.2 + i * 0.24)))
      if (cancelled) return
      await animate(".nr-hl", { scaleX: [0, 1] }, { duration: 0.75, ease: SETTLE })
      busy.current = false
    })()

    return () => {
      cancelled = true
    }
  }, [animate])

  const replay = async () => {
    if (busy.current) return
    busy.current = true
    animate(".nr-full", { opacity: 0 }, { duration: 0 })
    animate(".nr-top, .nr-bot", { opacity: 1 }, { duration: 0 })
    await Promise.all([
      animate(".nr-top", { x: [0, -12, 6, 0] }, { duration: 0.5, ease: SETTLE }),
      animate(".nr-bot", { x: [0, 12, -6, 0] }, { duration: 0.5, ease: SETTLE }),
      animate(".nr-hl", { scaleX: [0, 1] }, { duration: 0.6, ease: SETTLE }),
    ])
    animate(".nr-full", { opacity: 1 }, { duration: 0 })
    animate(".nr-top, .nr-bot", { opacity: 0 }, { duration: 0 })
    busy.current = false
  }

  return (
    <span ref={scope} onPointerEnter={replay} className="relative inline-block select-none" aria-hidden>
      {/* marker highlight under the full name */}
      <span className="pointer-events-none absolute -inset-x-2 bottom-[0.04em] h-[0.36em] -skew-x-12">
        <span className={`nr-hl block h-full w-full origin-left rounded-[3px] ${highlight}`} style={{ transform: "scaleX(0)" }} />
      </span>
      {WORDS.map((w, i) => (
        <span
          key={w}
          className={`nr-w${i} relative ${stacked ? "block w-fit" : `inline-block ${i ? "ml-[0.24em]" : ""}`}`}
          style={{ clipPath: "inset(-15% -2% -15% -2%)" }}
        >
          <span className="nr-full relative inline-block" style={{ opacity: 0 }}>
            {w}
          </span>
          <span className="nr-top absolute inset-0" style={{ opacity: 0, clipPath: "inset(0% 0% 50% 0%)" }}>
            {w}
          </span>
          <span className="nr-bot absolute inset-0" style={{ opacity: 0, clipPath: "inset(50% 0% 0% 0%)" }}>
            {w}
          </span>
          <span
            className="nr-block absolute -inset-x-[0.04em] bottom-[0.08em] top-[0.14em] rounded-[2px]"
            style={{ background: blocks[i], clipPath: "inset(0% 100% 0% 0%)" }}
          />
        </span>
      ))}
    </span>
  )
}
