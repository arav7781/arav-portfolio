"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, ChevronDown } from "lucide-react"
import NeuronAnimation from "./neuron-animation"
import { TypeAnimation } from "react-type-animation"
import GradientText from "./GradientText"
import Link from "next/link"

export default function Hero() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  return (
    <section
      id="home"
      ref={targetRef}
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Particle effect overlay */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-grid-small-pattern opacity-10"></div>
        <NeuronAnimation />
      </div>

      {/* Content */}
      <motion.div style={{ opacity, scale, y }} className="container mx-auto px-4 z-10 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30">
              B.Tech Student • AI & ML • Symbiosis Institute of Technology
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-center"
          >
            <span className="block">Hi, I'm</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-500 animate-gradient">
              <GradientText>Arav Saxena</GradientText>
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-3xl text-gray-300 mb-8 text-center h-16"
          >
            <TypeAnimation
              sequence={[
                "Exploring AI to build the future",
                2000,
                "Machine Learning Enthusiast",
                2000,
                "Full-Stack Developer",
                2000,
                "Researcher & Innovator",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Number.POSITIVE_INFINITY}
              className="text-gray-100"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 group"
            ><Link href="#contact">Let&apos;s Collaborate</Link>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <a
              href="/resume.pdf" 
              download
              className="flex items-center"
            >
              <Button variant="outline" size="lg" className="border-violet-500 text-violet-300 hover:bg-violet-500/10">
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
            </a>
          </motion.div>

          {/* Featured badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {[
              { label: "AI Researcher", icon: "🧠" },
              { label: "Full-Stack Developer", icon: "💻" },
              { label: "ML Engineer", icon: "⚙️" },
              { label: "Problem Solver", icon: "🔍" },
            ].map((badge, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 rounded-full border border-violet-500/30"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-200">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-400 mb-2">Scroll to explore</span>
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            <ChevronDown className="h-6 w-6 text-violet-400" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
