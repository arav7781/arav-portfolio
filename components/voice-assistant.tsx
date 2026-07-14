"use client"

import type React from "react"
import { User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  X,
  Mic,
  MicOff,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Brain,
  Code,
  Award,
  Briefcase,
  Play,
  Pause,
  Loader2,
  Volume2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Orb from "@/components/orb"
import RippleGrid from "@/components/RippleGrid"

export default function VoiceAssistant() {
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
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<
    "idle" | "recording" | "transcribing" | "thinking" | "speaking"
  >("idle")
  const [showVoicePrompt, setShowVoicePrompt] = useState(false)
  const [textMode, setTextMode] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [orbHue, setOrbHue] = useState(260) // Purple hue

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Create audio element for playback
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.onended = () => {
      setIsPlaying(false)
      setProcessingStage("idle")
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      setRecordingTime(0)
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  // Change orb hue based on state
  useEffect(() => {
    if (isRecording) {
      setOrbHue(0) // Red hue for recording
    } else if (processingStage === "thinking") {
      setOrbHue(200) // Blue hue for thinking
    } else if (processingStage === "speaking") {
      setOrbHue(120) // Green hue for speaking
    } else {
      setOrbHue(260) // Purple hue for default
    }
  }, [isRecording, processingStage])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processVoiceInput(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setProcessingStage("recording")
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access your microphone. Please check your permissions.")
      setProcessingStage("idle")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setProcessingStage("transcribing")

    try {
      const formData = new FormData()
      formData.append("file", audioBlob, "recording.wav")

      const transcriptionResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!transcriptionResponse.ok) {
        throw new Error("Failed to transcribe audio")
      }

      const transcriptionData = await transcriptionResponse.json()
      const transcribedText = transcriptionData.text

      if (!transcribedText.trim()) {
        setProcessingStage("idle")
        setIsProcessing(false)
        return
      }

      const userMessage = { role: "user" as const, content: transcribedText }
      setMessages((prev) => [...prev, userMessage])

      setProcessingStage("thinking")
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
        throw new Error("Failed to get response from Llama model")
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

      setProcessingStage("speaking")
      const speechResponse = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: assistantResponse }),
      })

      if (!speechResponse.ok) {
        throw new Error("Failed to generate speech")
      }

      const speechBlob = await speechResponse.blob()
      const url = URL.createObjectURL(speechBlob)
      setAudioUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error in voice processing pipeline:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your voice. Please try again.",
        },
      ])
      setProcessingStage("idle")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!textInput.trim()) return

    const userMessage = { role: "user" as const, content: textInput }
    setMessages((prev) => [...prev, userMessage])
    setTextInput("")
    setIsProcessing(true)
    setProcessingStage("thinking")

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
        throw new Error("Failed to get response from Llama model")
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

      setProcessingStage("idle")
    } catch (error) {
      console.error("Error processing text input:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
      setProcessingStage("idle")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setTextInput(question)
    setTextMode(true)
    setTimeout(() => {
      const event = { preventDefault: () => {} } as React.FormEvent
      handleTextSubmit(event)
    }, 300)
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setProcessingStage("idle")
    } else {
      audioRef.current.play()
      setIsPlaying(true)
      setProcessingStage("speaking")
    }
  }

  const getStatusMessage = () => {
    switch (processingStage) {
      case "recording":
        return `Recording... ${formatTime(recordingTime)}`
      case "transcribing":
        return "Transcribing your voice..."
      case "thinking":
        return "Processing your question..."
      case "speaking":
        return "Speaking..."
      default:
        return ""
    }
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
          className="relative w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
              forceHoverState={isRecording || processingStage !== "idle"}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            {isOpen ? (
              <X size={20} className="text-white drop-shadow-md" />
            ) : (
              <Volume2 size={20} className="text-white drop-shadow-md" />
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

      {/* Try Voice Assistant Button */}
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
                setShowVoicePrompt(true)
                setIsMinimized(false)
              }}
            >
              <Volume2 size={16} className="mr-2 text-violet-400" />
              <span className="text-sm font-medium">Try Saitama</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant Window */}
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
            {/* RippleGrid Background Animation - Voice Mode Only */}
            {!textMode && !isMinimized && (
              <RippleGrid
                enableRainbow={false}
                gridColor="#8b5cf6"
                rippleIntensity={0.04}
                gridSize={12}
                gridThickness={12}
                mouseInteraction={true}
                mouseInteractionRadius={0.7}
                opacity={0.45}
                fadeDistance={1.4}
                vignetteStrength={2.5}
                glowIntensity={0.1}
                gridRotation={0}
              />
            )}

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
                <AnimatePresence mode="wait">
                  {showVoicePrompt && (
                    <motion.div
                      className="absolute top-3 left-0 right-0 mx-auto w-[92%] bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3.5 shadow-xl z-20 font-mono"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                      <div className="flex items-start">
                        <Volume2 size={16} className="text-violet-500 dark:text-violet-400 mt-0.5 mr-2.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">saitama-assistant --init</h4>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mb-2.5">
                            interactive console model active. use the microphone interface to transmit live query signals.
                          </p>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] border-slate-300 dark:border-zinc-700 hover:border-violet-500 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-transparent"
                              onClick={() => setShowVoicePrompt(false)}
                            >
                              acknowledge
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {textMode ? (
                    <motion.div
                      key="text-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="flex-1 flex flex-col overflow-hidden"
                    >
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
                                  {index === messages.length - 1 && audioUrl && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 ml-2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white"
                                      onClick={togglePlayback}
                                    >
                                      {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                                    </Button>
                                  )}
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
                                  <span className="text-violet-600 dark:text-violet-500 mr-2.5 select-none">&gt;</span>
                                  <span>{question}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Loader / Thinking Status */}
                      {processingStage !== "idle" && (
                        <div className="px-4 py-2 border-t border-slate-200 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-950 select-none">
                          <div className="flex items-center text-xs text-slate-500 dark:text-zinc-400">
                            <Loader2 size={12} className="animate-spin mr-2 text-violet-500" />
                            <span>{getStatusMessage().toLowerCase()}</span>
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
                        <div className="mt-3 flex justify-center select-none">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTextMode(false)}
                            className="text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 text-[10px] font-mono cursor-pointer"
                          >
                            <Mic size={10} className="mr-1.5" /> switch_mode --voice
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="voice-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className="flex-1 flex flex-col justify-between p-6"
                    >
                      {/* Orb Speaking/Listening Assistant in the center */}
                      <div className="flex-1 flex flex-col items-center justify-center relative">
                        <div className="relative h-36 w-36 rounded-full flex items-center justify-center mb-6">
                          <Button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isProcessing && !isRecording}
                            className="relative z-10 w-28 h-28 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 bg-background border-none shadow-none hover:scale-105 cursor-pointer"
                          >
                            <div className="absolute inset-0 w-full h-full scale-105">
                              <Orb
                                hue={isRecording ? 0 : orbHue}
                                hoverIntensity={0.5}
                                rotateOnHover={true}
                                forceHoverState={isRecording || processingStage !== "idle"}
                              />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-transparent transition-colors z-20">
                              {isRecording ? (
                                <MicOff size={24} className="text-white drop-shadow-md" />
                              ) : (
                                <Mic size={24} className="text-white drop-shadow-md" />
                              )}
                            </div>
                          </Button>
                        </div>

                        <div className="text-center select-none">
                          <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1 uppercase tracking-wider font-mono">
                            {isRecording ? "status: listening" : `status: ${processingStage === "thinking" ? "thinking" : processingStage === "speaking" ? "speaking" : "idle"}`}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono min-h-[16px] lowercase">
                            {isRecording ? `transmitting... ${formatTime(recordingTime)}` : getStatusMessage()}
                          </p>
                        </div>
                      </div>

                      {/* Microphone instruction and Switch Mode button at the bottom */}
                      <div className="flex flex-col items-center border-t border-slate-200 dark:border-zinc-900 pt-4 bg-transparent select-none">
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mb-4">
                          {isRecording ? "tap the orb to stop transmission" : "tap the orb to start transmission"}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTextMode(true)}
                          className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 text-[10px] font-mono cursor-pointer"
                        >
                          <MessageSquare size={10} className="mr-1.5" /> switch_mode --text
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {isMinimized && (
              <div className="p-3.5 flex items-center justify-between relative z-10 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center space-x-2 select-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
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