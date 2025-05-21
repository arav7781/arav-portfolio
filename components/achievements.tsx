"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Award, Trophy, Medal, Star, BadgeIcon as Certificate, Crown, Users, Calendar, Zap } from "lucide-react"
import Image from "next/image"

export default function Achievements() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null)

  const achievements = [
    {
      title: "3rd Prize - Hack Your Path 6.0",
      description:
        "Led team DataWizard to secure 3rd place at this national-level 24-hour hackathon organized by HITAM, DoLittle Technologies, and Google Developer Groups.",
      year: "May 2025",
      icon: <Trophy className="h-8 w-8" />,
      color: "from-amber-500 to-yellow-500",
      featured: true,
      details: {
        organizers: "Hyderabad Institute of Technology and Management (HITAM)",
        partners: "DoLittle Technologies and Google Developer Groups",
        award: "₹5,000 Cash Prize",
        role: "Team Leader",
        date: "May 9-10, 2025",
        image: "/DSC01486 - Copy.JPG",
      },
    },
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
              onClick={() => achievement.details && setSelectedAchievement(index)}
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

                <div
                  className={`relative bg-black/60 backdrop-blur-sm border ${achievement.featured ? "border-amber-500/40" : "border-violet-500/20"} rounded-xl p-6 h-full transition-all duration-300 group-hover:translate-y-[-5px] ${achievement.details ? "cursor-pointer" : ""}`}
                >
                  {achievement.featured && (
                    <div className="absolute -top-3 -right-3">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-amber-500 blur-md opacity-50"></div>
                        <span className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full border border-amber-400">
                          NEW
                        </span>
                      </div>
                    </div>
                  )}

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

                  {achievement.details && (
                    <div className="mt-4 text-center">
                      <span className="text-xs text-violet-400 flex items-center justify-center">
                        <Zap className="h-3 w-3 mr-1" /> Click to view details
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement !== null && achievements[selectedAchievement].details && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-black/90 border border-amber-500/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {achievements[selectedAchievement].details?.image && (
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={achievements[selectedAchievement].details?.image || "/placeholder.svg"}
                      alt={achievements[selectedAchievement].title}
                      fill
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
                  </div>
                )}

                <button
                  className="absolute top-4 right-4 rounded-full p-2 bg-black/50 hover:bg-black/70 border border-amber-500/30 text-white"
                  onClick={() => setSelectedAchievement(null)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${achievements[selectedAchievement].color} mr-4`}>
                    {achievements[selectedAchievement].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{achievements[selectedAchievement].title}</h2>
                    <p className="text-amber-400">{achievements[selectedAchievement].year}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-8 text-lg">{achievements[selectedAchievement].description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {achievements[selectedAchievement].details?.organizers && (
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white">Organizers</h3>
                        <p className="text-gray-400">{achievements[selectedAchievement].details?.organizers}</p>
                      </div>
                    </div>
                  )}

                  {achievements[selectedAchievement].details?.partners && (
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white">Partners</h3>
                        <p className="text-gray-400">{achievements[selectedAchievement].details?.partners}</p>
                      </div>
                    </div>
                  )}

                  {achievements[selectedAchievement].details?.award && (
                    <div className="flex items-start">
                      <Award className="h-5 w-5 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white">Award</h3>
                        <p className="text-gray-400">{achievements[selectedAchievement].details?.award}</p>
                      </div>
                    </div>
                  )}

                  {achievements[selectedAchievement].details?.role && (
                    <div className="flex items-start">
                      <Crown className="h-5 w-5 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white">Role</h3>
                        <p className="text-gray-400">{achievements[selectedAchievement].details?.role}</p>
                      </div>
                    </div>
                  )}

                  {achievements[selectedAchievement].details?.date && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white">Date</h3>
                        <p className="text-gray-400">{achievements[selectedAchievement].details?.date}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <div className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-center">
                    <p className="text-white italic">
                      "This hackathon provided an incredible platform to apply our technical knowledge, problem-solving
                      abilities, and teamwork in a high-pressure environment."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
