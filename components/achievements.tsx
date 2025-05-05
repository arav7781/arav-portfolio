"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Award, Trophy, Medal, Star, BadgeIcon as Certificate, Crown } from "lucide-react"

export default function Achievements() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const achievements = [
    {
      title: "Grant Recieved",
      description: "Recieved Grant for Finetuning Project ArogyaMitra on 'Multimodal Learning for Medical Diagnosis' of ₹10,000 from SASTRA University.",
      year: "2024",
      icon: <Star className="h-8 w-8" />,
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "Finalist - National AI Hackathon at JSPM",
      description: "Developed an AI-powered solution for Mental assistance via Multilingual voice to voice agent.",
      year: "2024",
      icon: <Trophy className="h-8 w-8" />,
      color: "from-amber-500 to-yellow-500",
    },
    {
      title: "Finalist - National AI Hackathon at SASTRA University",
      description: "Finetuned and Developed an Vision Lnaguage Model for fat injury assesment.",
      year: "2024",
      icon: <Trophy className="h-8 w-8" />,
      color: "from-amber-500 to-yellow-500",
    },
  
    // {
    //   title: "Best Research Paper Award",
    //   description: "Awarded for the research paper on 'Efficient Transformer Models for Resource-Constrained Devices'.",
    //   year: "2023",
    //   icon: <Certificate className="h-8 w-8" />,
    //   color: "from-emerald-500 to-green-500",
    // },
    // {
    //   title: "Google AI Research Grant",
    //   description: "Received a research grant to explore applications of AI in healthcare diagnostics.",
    //   year: "2024",
    //   icon: <Award className="h-8 w-8" />,
    //   color: "from-blue-500 to-cyan-500",
    // },
    // {
    //   title: "Second Place - International Coding Competition",
    //   description: "Competed against 500+ participants in algorithmic problem-solving challenges.",
    //   year: "2023",
    //   icon: <Medal className="h-8 w-8" />,
    //   color: "from-rose-500 to-pink-500",
    // },
    // {
    //   title: "AI Innovation Award",
    //   description:
    //     "Recognized for developing a novel approach to natural language understanding in low-resource languages.",
    //   year: "2024",
    //   icon: <Crown className="h-8 w-8" />,
    //   color: "from-orange-500 to-red-500",
    // },
  ]

  return (
    <section id="achievements" className="py-20 relative">
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
            Awards &{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Achievements
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Recognition and accolades received for academic excellence, innovation, and technical contributions.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative">
                <div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -m-1 p-1 blur-lg"
                  style={
                    {
                      backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                      "--tw-gradient-from": `var(--${achievement.color.split(" ")[0].split("-")[0]}-${achievement.color.split(" ")[0].split("-")[1]})`,
                      "--tw-gradient-to": `var(--${achievement.color.split(" ")[1].split("-")[0]}-${achievement.color.split(" ")[1].split("-")[1]})`,
                    } as React.CSSProperties
                  }
                ></div>

                <div className="relative bg-black/60 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6 h-full transition-all duration-300 group-hover:translate-y-[-5px]">
                  <div className="mb-4 flex justify-center">
                    <div className={`p-4 rounded-full bg-gradient-to-r ${achievement.color}`}>{achievement.icon}</div>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-center">{achievement.title}</h3>
                  <p className="text-gray-400 mb-4 text-center">{achievement.description}</p>

                  <div className="text-center">
                    <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {achievement.year}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
