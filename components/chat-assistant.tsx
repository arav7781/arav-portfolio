"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  X,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Brain,
  Code,
  Award,
  Briefcase,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Orb from "@/components/orb"

export default function ChatAssistant() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant" | "system"; content: string; }[]
  >([
    {
      role: "assistant",
      content: "Hi there! I'm Saitama. Ask me anything about Arav Saxena.",
    },
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [orbHue, setOrbHue] = useState(260) // Purple hue by default

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Suggested questions
  const suggestedQuestions = [
    "What are Arav's skills?",
    "Tell me about Arav's projects",
    "What awards has Arav won?",
    "What is Arav's education?",
    "What is Arav's experience with AI?",
  ]

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Change orb hue based on processing state
  useEffect(() => {
    if (isProcessing) {
      setOrbHue(200) // Blue hue for thinking
    } else {
      setOrbHue(260) // Purple hue for default
    }
  }, [isProcessing])

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!textInput.trim()) return

    const userMessage = { role: "user" as const, content: textInput }
    setMessages((prev) => [...prev, userMessage])
    setTextInput("")
    setIsProcessing(true)

    try {
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages.filter((msg) => msg.role !== "system"), userMessage],
        }),
      })

      if (!chatResponse.ok) {
        throw new Error("Failed to get response from Groq Llama model")
      }

      const chatData = await chatResponse.json()
      const assistantResponse = chatData.response

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantResponse,
        },
      ])
    } catch (error) {
      console.error("Error processing text input:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setTextInput(question)
    setTimeout(() => {
      const event = { preventDefault: () => {} } as React.FormEvent
      handleTextSubmit(event)
    }, 100)
  }

  const getIconForQuestion = (question: string) => {
    if (question.toLowerCase().includes("skill")) return <Code className="h-4 w-4" />
    if (question.toLowerCase().includes("project")) return <Briefcase className="h-4 w-4" />
    if (question.toLowerCase().includes("award")) return <Award className="h-4 w-4" />
    if (question.toLowerCase().includes("education")) return <Brain className="h-4 w-4" />
    if (question.toLowerCase().includes("ai")) return <Sparkles className="h-4 w-4" />
    return <ChevronRight className="h-4 w-4" />
  }

  return (
    <>
      {/* Floating Orb Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          className="relative w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen)
            setIsMinimized(false)
          }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          style={{
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
          }}
        >
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <Orb
              hue={orbHue}
              hoverIntensity={0.3}
              rotateOnHover={true}
              forceHoverState={isProcessing}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            {isOpen ? (
              <X size={20} className="text-white drop-shadow-md" />
            ) : (
              <MessageSquare size={20} className="text-white drop-shadow-md" />
            )}
          </div>
          {!isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Try Chatbot Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="bg-black/80 backdrop-blur-sm border border-violet-500/30 rounded-full px-4 py-2 text-white flex items-center shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsOpen(true)
                setIsMinimized(false)
              }}
            >
              <MessageSquare size={16} className="mr-2 text-violet-400" />
              <span className="text-sm font-medium">Chat with Saitama</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              "fixed right-6 z-50 bg-card border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-card-foreground",
              isMinimized ? "bottom-24 w-64 h-auto" : "bottom-24 w-80 md:w-96 h-[500px]",
            )}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), 0 0 20px rgba(139, 92, 246, 0.03)",
            }}
          >
            {/* Terminal Window Header (Toolbar Controls) */}
            <div className="p-3 border-b border-slate-200 dark:border-zinc-800/80 bg-slate-100 dark:bg-zinc-900/90 flex items-center justify-between select-none relative z-20">
              {/* Window Dots */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer"
                  title="Close"
                  aria-label="Close Saitama"
                />
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center cursor-pointer"
                  title="Minimize"
                  aria-label="Toggle Minimize"
                />
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-700 opacity-60" />
              </div>

              {/* Console Title */}
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono tracking-tight">saitama@arav-dev: ~</span>

              {/* Status Indicator */}
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-bold">online</span>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Chat messages scroll area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-950/80 scrollbar-thin">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "user" ? (
                          <div className="max-w-[85%] bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 text-violet-600 dark:text-violet-400 rounded-lg p-3 text-xs leading-relaxed shadow-sm font-mono flex items-start">
                            <span className="text-slate-400 dark:text-zinc-500 mr-2 select-none">$</span>
                            <span className="flex-1">{message.content}</span>
                          </div>
                        ) : (
                          <div className="max-w-[85%] bg-slate-100/50 dark:bg-zinc-900/30 border border-slate-200/50 dark:border-zinc-800/50 text-slate-800 dark:text-zinc-300 rounded-lg p-3 text-xs leading-relaxed font-mono flex flex-col">
                            <div className="flex items-center text-[10px] text-slate-400 dark:text-zinc-500 mb-1.5 select-none font-bold">
                              <span className="text-green-500 mr-1.5">●</span>
                              <span>saitama-stdout</span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Suggested questions list inside the scroll container */}
                    {messages.length < 3 && (
                      <div className="space-y-2.5 mt-4">
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold select-none font-mono">// query options:</p>
                        <div className="flex flex-col gap-2 items-start">
                          {suggestedQuestions.map((question, qIdx) => (
                            <motion.button
                              key={qIdx}
                              className="text-[11px] text-left font-mono bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800/60 hover:border-violet-500/40 transition-colors flex items-center w-auto cursor-pointer"
                              onClick={() => handleSuggestedQuestion(question)}
                              whileHover={{ scale: 1.02, x: 2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="mr-2.5 flex items-center text-violet-600 dark:text-violet-500">
                                {getIconForQuestion(question)}
                              </span>
                              <span>{question}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Loader / Thinking Status */}
                  {isProcessing && (
                    <div className="px-4 py-2 border-t border-slate-200 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-950 select-none">
                      <div className="flex items-center text-xs text-slate-500 dark:text-zinc-400">
                        <Loader2 size={12} className="animate-spin mr-2 text-violet-500" />
                        <span>processing your question...</span>
                      </div>
                    </div>
                  )}

                  {/* Terminal Command Input Footer */}
                  <div className="p-3 border-t border-slate-200 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-950 flex flex-col">
                    <form onSubmit={handleTextSubmit} className="flex items-center bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 focus-within:border-violet-500 dark:focus-within:border-violet-500/40 rounded-lg px-3 py-1.5 transition-colors">
                      <span className="font-mono text-xs text-violet-600 dark:text-violet-500 mr-2 select-none">arav-dev:~$</span>
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="ask --question '...'"
                        className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none placeholder-slate-400 dark:placeholder-zinc-700"
                        disabled={isProcessing}
                      />
                      <Button
                        type="submit"
                        disabled={isProcessing || !textInput.trim()}
                        className="bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-violet-600 dark:text-violet-400 p-1 h-auto rounded cursor-pointer"
                      >
                        <ChevronRight size={14} />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {isMinimized && (
              <div className="p-3.5 flex items-center justify-between relative z-10 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center space-x-2 select-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">saitama-stdout: idle</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 text-[10px] font-mono cursor-pointer"
                  onClick={() => setIsMinimized(false)}
                >
                  restore_shell
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
