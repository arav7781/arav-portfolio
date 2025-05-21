"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Code, Brain, Award, BookOpen } from "lucide-react"
import CountUp from "react-countup"

export default function Statistics() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const stats = [
    {
      value: 7,
      label: "Projects Completed",
      icon: <Code className="h-6 w-6 text-violet-400" />,
      suffix: "+",
    },
    {
      value: 11,
      label: "AI Models Trained",
      icon: <Brain className="h-6 w-6 text-fuchsia-400" />,
      suffix: "+",
    },
    {
      value: 2,
      label: "Awards & Honors",
      icon: <Award className="h-6 w-6 text-pink-400" />,
      suffix: "",
    },
    {
      value: 2,
      label: "Research Papers",
      icon: <BookOpen className="h-6 w-6 text-cyan-400" />,
      suffix: "",
    },
  ]

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 to-transparent -z-10"></div>

      <div ref={ref} className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(139, 92, 246, 0.3)",
                  transition: { duration: 0.2 },
                }}
                className="bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6 text-center relative overflow-hidden group"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 text-glow">
                    {isInView ? <CountUp end={stat.value} duration={2.5} /> : 0}
                    {stat.suffix}
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
                </div>

                {/* Animated border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="animated-border absolute inset-0 rounded-xl"></div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
