"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { BrainCircuit, Cloud, Database, Rocket, Sparkles, Workflow } from "lucide-react"

const knowledgeNodes = [
  {
    title: "AI Systems",
    description: "Agentic workflows, LLM orchestration, computer vision, and product intelligence.",
    icon: BrainCircuit,
    x: 50,
    y: 18,
    accent: "from-violet-500/25 to-fuchsia-500/20",
    delay: 0.1,
  },
  {
    title: "Full-Stack Engineering",
    description: "React, Next.js, Node.js, Spring Boot, and API-first product delivery.",
    icon: Workflow,
    x: 20,
    y: 42,
    accent: "from-cyan-500/20 to-blue-500/20",
    delay: 0.2,
  },
  {
    title: "Cloud & DevOps",
    description: "Azure, AWS, Docker, Kubernetes, Linux, and CI/CD automation.",
    icon: Cloud,
    x: 82,
    y: 40,
    accent: "from-emerald-500/20 to-green-500/20",
    delay: 0.3,
  },
  {
    title: "Data Intelligence",
    description: "Natural-language-to-SQL workflows, analytics dashboards, and reporting systems.",
    icon: Database,
    x: 26,
    y: 72,
    accent: "from-amber-500/20 to-orange-500/20",
    delay: 0.4,
  },
  {
    title: "Research & Patents",
    description: "Applied AI research, publication milestones, and patent-led innovation.",
    icon: Sparkles,
    x: 74,
    y: 72,
    accent: "from-pink-500/20 to-rose-500/20",
    delay: 0.5,
  },
  {
    title: "Product Delivery",
    description: "Shipping scalable systems across logistics, governance, education, and health-tech.",
    icon: Rocket,
    x: 50,
    y: 86,
    accent: "from-indigo-500/20 to-violet-500/20",
    delay: 0.6,
  },
]

export default function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="projects" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Knowledge
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              {" "}Graph
            </span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            A connected view of my work across AI systems, architecture, research, cloud engineering, and product execution.
          </p>
        </motion.div>

        <div
          ref={ref}
          className="relative mx-auto max-w-6xl min-h-[680px] overflow-hidden rounded-[32px] border border-violet-500/25 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_28%),linear-gradient(135deg,rgba(8,8,18,0.9),rgba(2,2,10,0.95))] shadow-[0_0_80px_rgba(124,58,237,0.12)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="absolute -left-20 top-8 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -right-20 top-10 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="graph-line" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#8b5cf6" offset="0%" />
                <stop stopColor="#e879f9" offset="100%" />
              </linearGradient>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="0.25" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line x1="50" y1="50" x2="50" y2="18" stroke="url(#graph-line)" strokeWidth="1.2" strokeOpacity="0.9" strokeLinecap="round" filter="url(#softGlow)" />
            <line x1="50" y1="50" x2="20" y2="42" stroke="url(#graph-line)" strokeWidth="1.2" strokeOpacity="0.9" strokeLinecap="round" filter="url(#softGlow)" />
            <line x1="50" y1="50" x2="82" y2="40" stroke="url(#graph-line)" strokeWidth="1.2" strokeOpacity="0.9" strokeLinecap="round" filter="url(#softGlow)" />
            <line x1="50" y1="50" x2="26" y2="72" stroke="url(#graph-line)" strokeWidth="1.2" strokeOpacity="0.9" strokeLinecap="round" filter="url(#softGlow)" />
            <line x1="50" y1="50" x2="74" y2="72" stroke="url(#graph-line)" strokeWidth="1.2" strokeOpacity="0.9" strokeLinecap="round" filter="url(#softGlow)" />
            <line x1="50" y1="50" x2="50" y2="86" stroke="url(#graph-line)" strokeWidth="1.2" strokeOpacity="0.9" strokeLinecap="round" filter="url(#softGlow)" />
          </svg>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.6 }}
            className="absolute left-1/2 top-1/2 z-20 w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-violet-400/60 bg-black/60 p-5 text-center shadow-[0_0_50px_rgba(139,92,246,0.35)] backdrop-blur-xl"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 text-violet-100 ring-4 ring-violet-400/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">ARAV SAXENA</h3>
            <p className="mt-1 text-xs text-violet-100">AI Researcher • Full-Stack Engineer</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-violet-400/35 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-100">LLM</span>
              <span className="rounded-full border border-violet-400/35 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-100">Cloud</span>
              <span className="rounded-full border border-violet-400/35 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-100">Product</span>
            </div>
          </motion.div>

          {knowledgeNodes.map((node, index) => {
            const Icon = node.icon

            return (
              <motion.div
                key={node.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.45, delay: node.delay }}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute z-10 w-[230px] -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
                  className={`rounded-2xl border border-violet-500/30 bg-gradient-to-br ${node.accent} p-4 shadow-[0_15px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-black/40 p-2 text-violet-100 ring-1 ring-violet-400/20">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{node.title}</h3>
                  </div>
                  <p className="text-xs leading-5 text-gray-200">{node.description}</p>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
