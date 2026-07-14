"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, ChevronDown } from "lucide-react"
import { TypeAnimation } from "react-type-animation"
import GradientText from "./GradientText"
import Link from "next/link"
import { HeroGraph } from "./graph/hero-graph"
import { DomainNav } from "./graph/domain-nav"

export default function Hero() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50])

  return (
    <section
      id="home"
      ref={targetRef}
      className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-background text-foreground"
    >
      {/* Grid background */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-grid-small-pattern"></div>
      </div>

      {/* Content wrapper */}
      <motion.div style={{ opacity, scale, y }} className="container mx-auto px-4 z-10 relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Bio and navigation */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                AI & ML • Symbiosis Institute of Technology
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight text-slate-900 dark:text-white"
            >
              <span className="block text-slate-700 dark:text-slate-300 font-medium text-2xl sm:text-3xl mb-1">Hi, I'm</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 animate-gradient">
                <GradientText>Arav Saxena</GradientText>
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 h-12 max-w-xl font-medium"
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
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 group shadow-md"
              >
                <Link href="#contact">Let&apos;s Collaborate</Link>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <a
                href="/resume.pdf"
                download
                className="flex items-center"
              >
                <Button variant="outline" size="lg" className="border-violet-500/50 text-violet-600 dark:text-violet-300 hover:bg-violet-500/10">
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </Button>
              </a>
            </motion.div>

            {/* Domain navigation helper lens */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full flex flex-col items-center lg:items-start border-t border-slate-200 dark:border-slate-800 pt-6"
            >
              <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-3">// explore by lens</span>
              <DomainNav />
            </motion.div>
          </div>

          {/* Right Column: HeroGraph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 w-full flex justify-center items-center pointer-events-auto"
          >
            <div className="w-full max-w-[360px] sm:max-w-[400px]">
              <HeroGraph />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 mb-1">Scroll to explore</span>
          <motion.div
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            <ChevronDown className="h-5 w-5 text-violet-500" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
