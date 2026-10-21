"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import type { ReactNode } from "react"
import { Code2, Brain, Server, Layers, Waypoints, FileJson, Leaf, Split, ShieldCheck, Inbox, Activity } from "lucide-react"
import Image from "next/image"

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const skillCategories: {
    title: string
    icon: ReactNode
    skills: { name: string; level: number; logo?: string; glyph?: ReactNode }[]
    color: string
    direction: number
  }[] = [
    {
      title: "Event Streaming & Distributed Systems",
      icon: <Waypoints className="h-6 w-6" />,
      skills: [
        { name: "Apache Kafka", level: 90, glyph: <Waypoints className="h-9 w-9" /> },
        { name: "Avro & Schema Registry", level: 85, glyph: <FileJson className="h-9 w-9" /> },
        { name: "Spring Boot", level: 85, glyph: <Leaf className="h-9 w-9" /> },
        { name: "CQRS & SAGA", level: 85, glyph: <Split className="h-9 w-9" /> },
        { name: "Idempotent Consumers", level: 85, glyph: <ShieldCheck className="h-9 w-9" /> },
        { name: "Dead-Letter Queues", level: 80, glyph: <Inbox className="h-9 w-9" /> },
        { name: "AKHQ · Grafana · Splunk", level: 80, glyph: <Activity className="h-9 w-9" /> },
        { name: "Redis", level: 75, logo: "/redis.png?height=60&width=60" },
      ],
      color: "from-indigo-500 to-violet-500",
      direction: -1,
    },
    {
      title: "Languages & Databases",
      icon: <Code2 className="h-6 w-6" />,
      skills: [
        { name: "Python", level: 95, logo: "/python.png?height=60&width=60" },
        { name: "Java", level: 85, logo: "/java1.png?height=60&width=60" },
        { name: "C++", level: 80, logo: "/cpp.png?height=60&width=60" },
        { name: "JavaScript", level: 90, logo: "/js.png?height=60&width=60" },
        { name: "TypeScript", level: 85, logo: "/ts.png?height=60&width=60" },
        { name: "C", level: 90, logo: "/c.png?height=60&width=60" },
        { name: "SQL", level: 85, logo: "/sql1.png?height=60&width=60" },
        { name: "MongoDB", level: 85, logo: "/mdb.png?height=60&width=60" },
        { name: "PostgreSQL", level: 80, logo: "/sql2.png?height=60&width=60" },
        { name: "MySQL", level: 85, logo: "/sql1.png?height=60&width=60" },
        { name: "Convex", level: 90, logo: "/convex.png?height=60&width=60" },
        { name: "Redis", level: 75, logo: "/redis.png?height=60&width=60" },
      ],
      color: "from-violet-500 to-fuchsia-500",
      direction: 1, // 1 for left-to-right, -1 for right-to-left
    },
    {
      title: "Frameworks",
      icon: <Layers className="h-6 w-6" />,
      skills: [
        { name: "React.js", level: 90, logo: "/react.png?height=60&width=60" },
        { name: "Next.js", level: 85, logo: "/next.png?height=60&width=60" },
        { name: "TensorFlow", level: 90, logo: "/tf.png?height=60&width=60" },
        { name: "Langgraph", level: 85, logo: "/l.png?height=60&width=60" },
        { name: "PyTorch", level: 85, logo: "/pytorch.png?height=60&width=60" },
        { name: "Flask", level: 80, logo: "/flask.png?height=60&width=60" },
        { name: "LangChain", level: 75, logo: "/l.png?height=60&width=60" },
        { name: "FastAPI", level: 85, logo: "/python.png?height=60&width=60" },
      ],
      color: "from-fuchsia-500 to-pink-500",
      direction: -1, // Scroll in opposite direction
    },
    {
      title: "AI & ML",
      icon: <Brain className="h-6 w-6" />,
      skills: [
        { name: "Deep Learning", level: 90, logo: "/dl.png?height=60&width=60" },
        { name: "NLP", level: 85, logo: "/nlp.png?height=60&width=60" },
        { name: "Google's A2A Protocol", level: 95, logo: "/a2a.png?height=60&width=60" },
        { name: "MCP Protocol", level: 95, logo: "/mcp.png?height=60&width=60" },
        { name: "Computer Vision", level: 80, logo: "/cv.png?height=60&width=60" },
        { name: "LLMs", level: 85, logo: "/llm.png?height=60&width=60" },
        { name: "Generative AI", level: 80, logo: "/genai.png?height=60&width=60" },
        { name: "Reinforcement Learning", level: 85, logo: "/rl.png?height=60&width=60" },
        { name: "Data Analysis", level: 90, logo: "/da.png?height=60&width=60" },
      ],
      color: "from-pink-500 to-rose-500",
      direction: 1,
    },
    {
      title: "DevOps & Tools",
      icon: <Server className="h-6 w-6" />,
      skills: [
        { name: "Docker", level: 80, logo: "/docker.png?height=60&width=60" },
        { name: "Vercel", level: 85, logo: "/vercel.png?height=60&width=60" },
        { name: "Git", level: 90, logo: "/git.png?height=60&width=60" },
        { name: "GitHub Actions", level: 80, logo: "/git.png?height=60&width=60" },
        { name: "VS Code", level: 95, logo: "/vs.png?height=60&width=60" },
        { name: "Jupyter", level: 90, logo: "/jupyter.png?height=60&width=60" },
        { name: "Postman", level: 85, logo: "/postman.png?height=60&width=60" },
      ],
      color: "from-orange-500 to-yellow-500",
      direction: 1,
    },
  ]

  // Map level to proficiency label
  const getProficiency = (level: number) => {
    if (level >= 90) return "Expert"
    if (level >= 80) return "Advanced"
    if (level >= 70) return "Intermediate"
    return "Beginner"
  }

  // Map proficiency to color
  const proficiencyColors = {
    Expert: "bg-gradient-to-r from-emerald-500 to-green-500",
    Advanced: "bg-gradient-to-r from-blue-500 to-cyan-500",
    Intermediate: "bg-gradient-to-r from-amber-500 to-yellow-500",
    Beginner: "bg-gradient-to-r from-gray-500 to-slate-500",
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="skills" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-500/5 to-background -z-10"></div>

      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="skills-particles"></div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Technical{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-gradient">
              Skills
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            A showcase of my technical expertise and tools I work with to bring ideas to life.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-12"
        >
          {skillCategories.map((category, index) => (
            <motion.div key={index} variants={item} className="relative">
              <div className="mb-6 flex items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} mr-3 text-white`}>{category.icon}</div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{category.title}</h3>
              </div>

              {/* Infinite scrolling logos - Fixed to be truly seamless */}
              <div className="relative overflow-hidden py-4 before:absolute before:left-0 before:top-0 before:z-20 before:h-full before:w-32 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-20 after:h-full after:w-32 after:bg-gradient-to-l after:from-background after:to-transparent">
                <div className="infinite-scroll-container">
                  <div
                    className={`infinite-scroll-content ${category.direction > 0 ? "scroll-left" : "scroll-right"}`}
                    style={{
                      animationDuration: `${category.skills.length * 10}s`,
                    }}
                  >
                    {/* First set of skills */}
                    {category.skills.map((skill, skillIndex) => (
                      <div key={`first-${skillIndex}`} className="flex-none mx-4">
                        <div className="skill-card bg-background">
                          <div className="relative w-16 h-16 mb-3">
                            {skill.glyph ? (
                              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-violet-600 dark:text-violet-400" aria-hidden>
                                {skill.glyph}
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#e8edf7] p-1.5">
                                <Image
                                  src={skill.logo || "/placeholder.svg"}
                                  alt={skill.name}
                                  width={60}
                                  height={60}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-slate-800 dark:text-gray-200 text-center mb-2">{skill.name}</h4>
                          <span
                            className={`mt-auto text-xs px-2 py-0.5 rounded-full ${
                              proficiencyColors[getProficiency(skill.level) as keyof typeof proficiencyColors]
                            } text-white`}
                          >
                            {getProficiency(skill.level)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Second set of skills (duplicate for seamless loop) */}
                    {category.skills.map((skill, skillIndex) => (
                      <div key={`second-${skillIndex}`} className="flex-none mx-4">
                        <div className="skill-card bg-background">
                          <div className="relative w-16 h-16 mb-3">
                            {skill.glyph ? (
                              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-violet-600 dark:text-violet-400" aria-hidden>
                                {skill.glyph}
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#e8edf7] p-1.5">
                                <Image
                                  src={skill.logo || "/placeholder.svg"}
                                  alt={skill.name}
                                  width={60}
                                  height={60}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-slate-800 dark:text-gray-200 text-center mb-2">{skill.name}</h4>
                          <span
                            className={`mt-auto text-xs px-2 py-0.5 rounded-full ${
                              proficiencyColors[getProficiency(skill.level) as keyof typeof proficiencyColors]
                            } text-white`}
                          >
                            {getProficiency(skill.level)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
