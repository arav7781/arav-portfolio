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

export default function VoiceAssistant() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant" | "system"; content: string; hasAudio?: boolean }[]
  >([
    {
      role: "assistant",
      content: "Hi there! I'm Arav's AI assistant. Ask me anything about Arav Saxena.",
      hasAudio: false,
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
          hasAudio: true,
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
          hasAudio: false,
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
          hasAudio: false,
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
          hasAudio: false,
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
              <span className="text-sm font-medium">Try Goku</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              "fixed right-6 z-50 bg-black/90 backdrop-blur-md border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              isMinimized ? "bottom-24 w-64 h-auto" : "bottom-24 w-80 md:w-96 h-[500px]",
            )}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3), 0 8px 10px -6px rgba(139, 92, 246, 0.2)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-fuchsia-500/5 pointer-events-none" />
            <div className="p-4 border-b border-violet-500/30 bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 flex items-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10" />
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-violet-500">
                <Image src="/placeholder.svg?height=100&width=100" alt="Arav Saxena" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 animate-pulse"></div>
              </div>
              <div className="relative">
                <h3 className="font-bold text-white">Goku</h3>
                <p className="text-xs text-gray-300">Powered by personalised LLM</p>
              </div>
              <div className="ml-auto flex items-center space-x-2 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  ) : (
                    <ChevronRight className="h-4 w-4 -rotate-90" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <AnimatePresence>
                  {showVoicePrompt && (
                    <motion.div
                      className="absolute top-20 left-0 right-0 mx-auto w-[90%] bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md rounded-xl p-4 shadow-xl z-10"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                      <div className="flex items-start">
                        <Volume2 size={20} className="text-violet-300 mt-1 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-white mb-1">Voice-Powered Assistant</h4>
                          <p className="text-sm text-gray-200 mb-3">
                            Click the microphone button and speak. I'll listen, understand, and respond with Arav's
                            voice!
                          </p>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-violet-400/50 text-violet-300 hover:bg-violet-500/10"
                              onClick={() => setShowVoicePrompt(false)}
                            >
                              Got it
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/80 bg-grid-pattern relative">
                  {/* Orb Background in Message Area for Voice Mode */}
                  {!textMode && (
                    <div className="absolute inset-0 opacity-20 z-[-10] pointer-events-none scale-125">
                      <Orb
                        hue={orbHue}
                        hoverIntensity={0.3}
                        rotateOnHover={true}
                        forceHoverState={isRecording || processingStage !== "idle"}
                      />
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                            : "bg-gray-800/90 backdrop-blur-sm text-gray-200 border border-gray-700/50"
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                              message.role === "user" ? "bg-violet-500" : "bg-fuchsia-500"
                            }`}
                          >
                            {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
                          </div>
                          <span className="text-xs font-medium">
                            {message.role === "user" ? "You" : "Arav's Assistant"}
                          </span>
                          {message.role === "assistant" &&
                            message.hasAudio &&
                            index === messages.length - 1 &&
                            audioUrl && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 text-gray-400 hover:text-white"
                                onClick={togglePlayback}
                              >
                                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                              </Button>
                            )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions in Text Mode Only */}
                {textMode && messages.length < 3 && (
                  <div className="px-4 py-3 border-t border-violet-500/20 bg-black/90">
                    <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          className="text-xs bg-violet-900/30 hover:bg-violet-900/50 text-violet-300 px-3 py-1.5 rounded-full border border-violet-500/30 flex items-center"
                          onClick={() => handleSuggestedQuestion(question)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {getIconForQuestion(question)}
                          <span className="ml-1">{question}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {processingStage !== "idle" && (
                  <div className="px-4 py-2 bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border-t border-violet-500/20">
                    <div className="flex items-center justify-center">
                      {processingStage === "recording" ? (
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                      ) : (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      )}
                      <span className="text-sm text-gray-300">{getStatusMessage()}</span>
                    </div>
                  </div>
                )}

                <div className="p-4 border-t border-violet-500/30 bg-black">
                  {textMode ? (
                    <form onSubmit={handleTextSubmit} className="flex items-center">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-1 bg-gray-900 border border-violet-500/30 focus:border-violet-500 rounded-l-xl px-4 py-2 text-white"
                        disabled={isProcessing}
                      />
                      <Button
                        type="submit"
                        disabled={isProcessing || !textInput.trim()}
                        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-r-xl rounded-l-none"
                      >
                        <ChevronRight size={18} />
                      </Button>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "relative h-16 w-16 rounded-full flex items-center justify-center mb-2",
                          isRecording ? "border-2 border-red-500 animate-pulse" : "border-2 border-violet-500/50",
                        )}
                      >
                        <Button
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={isProcessing && !isRecording}
                          className="absolute inset-0 rounded-full bg-gray-900/50 hover:bg-gray-800/50 flex items-center justify-center"
                        >
                          {isRecording ? (
                            <MicOff size={24} className="text-white drop-shadow-md" />
                          ) : (
                            <Mic size={24} className="text-white drop-shadow-md" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        {isRecording ? "Tap to stop recording" : "Tap to start speaking"}
                      </p>
                    </div>
                  )}
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTextMode(!textMode)}
                      className="text-violet-400 hover:text-violet-300 text-xs"
                    >
                      {textMode ? (
                        <>
                          <Mic size={12} className="mr-1" /> Switch to voice mode
                        </>
                      ) : (
                        <>
                          <MessageSquare size={12} className="mr-1" /> Switch to text mode
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
            {isMinimized && (
              <div className="p-3 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm text-gray-300">Goku is ready</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-violet-400 hover:text-violet-300 text-xs"
                  onClick={() => setIsMinimized(false)}
                >
                  Expand
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}