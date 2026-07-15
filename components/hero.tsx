"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Download, ChevronDown } from "lucide-react"
import { TypeAnimation } from "react-type-animation"
import GradientText from "./GradientText"
import Link from "next/link"
import { HeroGraph } from "./graph/hero-graph"
import { DomainNav } from "./graph/domain-nav"
import SpecularButton from "./SpecularButton"
import PixelBlast from "./PixelBlast"
import TiltedCard from "./TiltedCard"

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
      {/* Pixel Blast Background Animation */}
      <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#8b5cf6"
          patternScale={2.5}
          patternDensity={0.5}
          pixelSizeJitter={0.02}
          enableRipples
          rippleSpeed={0.2}
          rippleThickness={0.1}
          rippleIntensityScale={0.4}
          liquid={false}
          liquidStrength={0.08}
          liquidRadius={1.0}
          liquidWobbleSpeed={3.0}
          speed={0.15}
          edgeFade={0.55}
          transparent
        />
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-grid-small-pattern"></div>
      </div>

      {/* Content wrapper */}
      <motion.div style={{ opacity, scale, y }} className="container mx-auto px-4 z-10 relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Bio and navigation */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">


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
              <SpecularButton
                onClick={() => {
                  window.open("mailto:aravsaxena884@gmail.com", "_self");
                }}
                size="lg"
                tint="#7c3aed"
                tintOpacity={0.9}
                lineColor="#ffffff"
                baseColor="#6d28d9"
                textColor="#ffffff"
                className="group"
              >
                Let&apos;s Collaborate
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 inline-block" />
              </SpecularButton>

              <SpecularButton
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = "/resume.pdf";
                  link.download = "resume.pdf";
                  link.click();
                }}
                size="lg"
                tint="var(--background)"
                tintOpacity={0.05}
                lineColor="#7c3aed"
                baseColor="rgba(124, 58, 237, 0.3)"
                textColor="var(--ink)"
              >
                <Download className="mr-2 h-4 w-4 inline-block" />
                Download Resume
              </SpecularButton>
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

          {/* Right Column: HeroGraph with 3D Tilt Card effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 w-full flex justify-center items-center pointer-events-auto"
          >
            <TiltedCard
              containerHeight="520px"
              containerWidth="100%"
              imageHeight="520px"
              imageWidth="420px"
              rotateAmplitude={12}
              scaleOnHover={1.03}
              showMobileWarning={false}
              showTooltip={true}
              captionText="Arav's Knowledge Graph"
            >
              <HeroGraph />
            </TiltedCard>
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
