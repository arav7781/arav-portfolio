"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Mail } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 via-fuchsia-900/30 to-violet-900/30 -z-10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                Collaborate
              </span>{" "}
              on Your Next Project?
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.instagram.com/arav_6555/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 group"
              >
                <Mail className="mr-2 h-5 w-5" />
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
              <a href="/resume.pdf" download>
              <Button variant="outline" size="lg" className="border-violet-500 text-violet-300 hover:bg-violet-500/10">
                <Download className="mr-2 h-5 w-5" />
                Download Resume
              </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
