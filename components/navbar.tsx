"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Download, Menu, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

const navLinks = [
  { name: "Home", href: "/#home", section: "home" },
  { name: "Event Streaming", href: "/#kafka", section: "kafka" },
  { name: "Skills", href: "/#skills", section: "skills" },
  { name: "Knowledge Graph", href: "/graph", section: "graph" },
]

/**
 * A floating, frosted pill (the TitanOCR nav): dark in both themes, so it reads the same
 * over the gym hero and over the light sections below it.
 */
export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(pathname === "/graph" ? "graph" : "home")

  // Track which section is under the nav with an observer, not a scroll listener.
  useEffect(() => {
    if (pathname === "/graph") {
      setActiveSection("graph")
      return
    }
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"))
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit) setActiveSection(hit.target.id)
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [pathname])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-[clamp(12px,3vw,40px)] pt-3">
      <div className="pointer-events-auto relative mx-auto flex h-[60px] w-full max-w-[1160px] items-center gap-6 rounded-full border border-[rgb(255_245_235/0.12)] bg-[rgb(10_15_28/0.84)] pl-3 pr-2 shadow-[inset_0_1px_0_rgb(255_245_235/0.08),0_14px_34px_-18px_rgb(0_0_0/0.7)] backdrop-blur-[16px] backdrop-saturate-150">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-[1.05rem] font-[760] tracking-[-0.01em] text-[#f4f1ec] [font-family:var(--font-display)] [font-stretch:112%]"
        >
          {/* the avatar's face, cropped from the artwork */}
          <span
            className="h-8 w-8 shrink-0 rounded-full bg-no-repeat ring-1 ring-[#5ef0f0]/40 ring-offset-2 ring-offset-[#0a0f1c]"
            style={{ backgroundImage: "url(/avatar.png)", backgroundSize: "300%", backgroundPosition: "67% 30%" }}
            aria-hidden
          />
          Arav.dev
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Sections">
          {navLinks.map((link) => {
            const isActive = activeSection === link.section
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors duration-300 ${
                  isActive ? "text-[#f4f1ec]" : "text-[#d8d2c8]/75 hover:text-[#f4f1ec]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.08]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {link.name}
              </Link>
            )
          })}
        </nav>

        <a
          href="/resume.pdf"
          download
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-[#7c3aed] px-5 text-[0.92rem] font-semibold text-[#fbfaff] transition-[transform,background-color] duration-300 hover:bg-[#8b5cf6] active:scale-[0.98] md:ml-0"
        >
          <Download className="h-4 w-4" aria-hidden />
          Resume
        </a>

        <button
          type="button"
          className="mr-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-[#d8d2c8] transition-colors hover:bg-white/[0.08] hover:text-[#f4f1ec] md:hidden"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mx-auto mt-2 flex w-full max-w-[1160px] flex-col gap-1 rounded-2xl border border-[rgb(255_245_235/0.12)] bg-[rgb(10_15_28/0.9)] p-2 backdrop-blur-[16px] md:hidden"
            aria-label="Sections"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.section
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[0.95rem] transition-colors ${
                    isActive ? "bg-white/[0.08] font-semibold text-[#f4f1ec]" : "text-[#d8d2c8] hover:bg-white/[0.05]"
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
