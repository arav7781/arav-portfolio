"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Code2, Database, Brain, Server, Layers, Cpu } from "lucide-react"

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const skillCategories = [
    {
      title: "Languages",
      icon: <Code2 className="h-6 w-6" />,
      skills: [
        { name: "Python", level: 95 },
        { name: "Java", level: 85 },
        { name: "C++", level: 80 },
        { name: "JavaScript", level: 90 },
        { name: "TypeScript", level: 85 },
        { name: "HTML/CSS", level: 90 },
        { name: "SQL", level: 85 },
      ],
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "Frameworks",
      icon: <Layers className="h-6 w-6" />,
      skills: [
        { name: "React.js", level: 90 },
        { name: "Next.js", level: 85 },
        { name: "TensorFlow", level: 90 },
        { name: "Langgraph", level: 85 },
        { name: "PyTorch", level: 85 },
        { name: "Flask", level: 80 },
        { name: "Express.js", level: 75 },
        { name: "Django", level: 70 },
        { name: "FastAPI", level: 85 },
      ],
      color: "from-fuchsia-500 to-pink-500",
    },
    {
      title: "AI & ML",
      icon: <Brain className="h-6 w-6" />,
      skills: [
        { name: "Deep Learning", level: 90 },
        { name: "NLP", level: 85 },
        { name: "Google's A2A Protocol", level: 95 },
        { name: "MCP Protocol", level: 95 },
        { name: "Computer Vision", level: 80 },
        { name: "LLMs", level: 85 },
        { name: "Generative AI", level: 80 },
        { name: "Reinforcement Learning", level: 85 },
        { name: "Data Analysis", level: 90 },
       
      ],
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Databases",
      icon: <Database className="h-6 w-6" />,
      skills: [
        { name: "MongoDB", level: 85 },
        { name: "PostgreSQL", level: 80 },
        { name: "MySQL", level: 85 },
        { name: "Convex", level: 90 },
        { name: "Redis", level: 75 },
        // { name: "Supabase", level: 80 },
      ],
      color: "from-rose-500 to-orange-500",
    },
    {
      title: "DevOps",
      icon: <Server className="h-6 w-6" />,
      skills: [
        { name: "Git", level: 90 },
        { name: "Docker", level: 80 },
        { name: "CI/CD", level: 75 },
        // { name: "AWS", level: 70 },
        { name: "Vercel", level: 85 },
        { name: "GitHub Actions", level: 80 },
      ],
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Tools",
      icon: <Cpu className="h-6 w-6" />,
      skills: [
        { name: "VS Code", level: 95 },
        { name: "Jupyter", level: 90 },
        // { name: "Figma", level: 80 },
        { name: "Postman", level: 85 },
        { name: "Git", level: 90 },
        // { name: "Notion", level: 85 },
      ],
      color: "from-amber-500 to-yellow-500",
    },
  ]

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
      <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Technical{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Skills
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A showcase of my technical expertise and tools I work with to bring ideas to life.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {skillCategories.map((category, index) => (
            <motion.div key={index} variants={item} className="relative group">
              <div
                className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -m-1 p-1 blur-xl"
                style={{
                  background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`,
                }}
              ></div>
              <div className="relative bg-black/60 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6 h-full transition-all duration-300 group-hover:translate-y-[-5px]">
                <div className="flex items-center mb-6">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} mr-3`}>{category.icon}</div>
                  <h3 className="text-xl font-bold">{category.title}</h3>
                </div>

                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skillIndex}
                      initial={{ opacity: 0, width: 0 }}
                      animate={isInView ? { opacity: 1, width: "auto" } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + skillIndex * 0.1 }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">{skill.name}</span>
                        <span className="text-xs font-medium text-gray-400">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${skill.level}%` } : {}}
                          transition={{ duration: 1, delay: 0.5 + skillIndex * 0.1 }}
                          className={`h-2.5 rounded-full bg-gradient-to-r ${category.color}`}
                        ></motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
