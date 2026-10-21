import { Fragment, type ReactNode } from "react"

/*
 * Markdown for the chat's replies: paragraphs, bullet and numbered lists, headings, code
 * blocks, and inline bold, italic, code and links. It builds React elements (no HTML string
 * is ever injected), only links out to http(s), and copes with half-written markdown while a
 * reply is still streaming in: an unclosed ** or ` is closed for display.
 */

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[]; start: number }
  | { kind: "h"; text: string }
  | { kind: "code"; text: string }

const BULLET = /^\s*[-*•+]\s+/
const NUMBER = /^\s*(\d+)[.)]\s+/
const FENCE = /^\s*```/
const HEADING = /^#{1,4}\s+/

const startsBlock = (line: string) => BULLET.test(line) || NUMBER.test(line) || FENCE.test(line) || HEADING.test(line)

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r/g, "").split("\n")
  const out: Block[] = []
  let i = 0
  // the index of the next non-blank line, so a list survives blank lines between its items
  const nextFilled = (from: number) => {
    let j = from
    while (j < lines.length && !lines[j].trim()) j++
    return j
  }
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    if (FENCE.test(line)) {
      const body: string[] = []
      i++
      while (i < lines.length && !FENCE.test(lines[i])) body.push(lines[i++])
      i++
      out.push({ kind: "code", text: body.join("\n") })
      continue
    }
    if (HEADING.test(line)) {
      out.push({ kind: "h", text: line.replace(HEADING, "") })
      i++
      continue
    }
    let listed = false
    for (const [re, kind] of [
      [BULLET, "ul"],
      [NUMBER, "ol"],
    ] as const) {
      if (!re.test(line)) continue
      listed = true
      const start = kind === "ol" ? Number(NUMBER.exec(line)![1]) : 1
      const items: string[] = []
      while (i < lines.length) {
        if (re.test(lines[i])) {
          items.push(lines[i].replace(re, ""))
          i++
        } else if (lines[i].trim() && !startsBlock(lines[i]) && /^\s+/.test(lines[i])) {
          // an indented line carries on the item above
          items[items.length - 1] += " " + lines[i].trim()
          i++
        } else if (!lines[i].trim() && re.test(lines[nextFilled(i)] ?? "")) {
          i = nextFilled(i)
        } else break
      }
      out.push(kind === "ol" ? { kind, items, start } : { kind, items })
      break
    }
    if (!listed) {
      const para: string[] = []
      while (i < lines.length && lines[i].trim() && (para.length === 0 || !startsBlock(lines[i]))) para.push(lines[i++])
      out.push({ kind: "p", lines: para })
    }
  }
  return out
}

const INLINE = /(`[^`\n]+`)|(\*\*[^\n]+?\*\*)|(\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\))|(\*[^*\s][^*\n]*?\*)/g

function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const k = `${key}${n++}`
    if (m[1]) out.push(<code key={k}>{m[1].slice(1, -1)}</code>)
    else if (m[2]) out.push(<strong key={k}>{inline(m[2].slice(2, -2), k)}</strong>)
    else if (m[3])
      out.push(
        <a key={k} href={m[5]} target="_blank" rel="noopener noreferrer">
          {m[4]}
        </a>,
      )
    else if (m[6]) out.push(<em key={k}>{inline(m[6].slice(1, -1), k)}</em>)
    last = at + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** Close any ** or ` the stream has opened but not yet closed, so it renders as intended. */
function closeOpenMarks(src: string) {
  let s = src
  if ((s.match(/```/g)?.length ?? 0) % 2 === 0) {
    const ticks = s.replace(/```/g, "").match(/`/g)?.length ?? 0
    if (ticks % 2) s += "`"
  }
  if ((s.match(/\*\*/g)?.length ?? 0) % 2) s += "**"
  return s
}

export default function ChatMarkdown({ text, streaming = false, tail }: { text: string; streaming?: boolean; tail?: ReactNode }) {
  const blocks = parseBlocks(streaming ? closeOpenMarks(text) : text)
  const lastAt = blocks.length - 1
  return (
    <>
      {blocks.map((b, i) => {
        const end = i === lastAt ? tail : null
        switch (b.kind) {
          case "p":
            return (
              <p key={i}>
                {b.lines.map((l, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {inline(l, `${i}.${j}.`)}
                  </Fragment>
                ))}
                {end}
              </p>
            )
          case "h":
            return (
              <p key={i} className="md-h">
                {inline(b.text, `${i}.`)}
                {end}
              </p>
            )
          case "code":
            return (
              <pre key={i}>
                <code>{b.text}</code>
                {end}
              </pre>
            )
          case "ul":
          case "ol": {
            const items = b.items.map((it, j) => (
              <li key={j}>
                {inline(it, `${i}.${j}.`)}
                {j === b.items.length - 1 && end}
              </li>
            ))
            return b.kind === "ul" ? <ul key={i}>{items}</ul> : <ol key={i} start={b.start}>{items}</ol>
          }
        }
      })}
      {blocks.length === 0 && tail}
    </>
  )
}
