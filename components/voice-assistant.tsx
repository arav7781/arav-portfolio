"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Mic, MicOff, Volume2, Loader2, Play, Pause, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant" | "system"; content: string }[]>([
    {
      role: "assistant",
      content: "Hi there! I'm Arav's AI assistant. Ask me anything about Arav Saxena.",
    },
  ])
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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

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

        // Stop all tracks on the stream to release the microphone
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
      // Step 1: Transcribe audio using Groq Whisper
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
      const transcribedText: string = transcriptionData.text

      if (!transcribedText.trim()) {
        setProcessingStage("idle")
        setIsProcessing(false)
        return
      }

      // Add transcription as user message
      const userMessage = { role: "user" as const, content: transcribedText }
      setMessages((prev) => [...prev, userMessage])

      // Step 2: Process with Llama model
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
      const assistantResponse: string = chatData.response

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: assistantResponse }])

      // Step 3: Convert response to speech using Groq PlayAI TTS
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

      // Auto-play the response
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

    // Add user message to chat
    const userMessage = { role: "user" as const, content: textInput }
    setMessages((prev) => [...prev, userMessage])
    setTextInput("")
    setIsProcessing(true)
    setProcessingStage("thinking")

    try {
      // Process with Llama model
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
      const assistantResponse: string = chatData.response

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: assistantResponse }])

      // Convert response to speech
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

      // Auto-play the response
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
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

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close voice assistant" : "Open voice assistant"}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-70 blur-sm -z-10"></div>
          {isOpen ? <X size={24} /> : <Volume2 size={24} />}

          {/* Notification dot when closed */}
          {!isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            />
          )}
        </motion.button>
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsOpen(true)
                setShowVoicePrompt(true)
              }}
            >
              <Volume2 size={16} className="mr-2 text-violet-400" />
              <span className="text-sm font-medium">Try Arav's Voice Assistant Goku</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-black border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-violet-500/30 bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-violet-500">
                <Image src="/aiia.png?height=100&width=100" alt="Arav Saxena" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-white">Arav's Voice Assistant</h3>
                <p className="text-xs text-gray-300">Powered by personalised finetuned LLM</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-gray-400 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>

            {/* Voice Assistant Prompt */}
            <AnimatePresence>
              {showVoicePrompt && (
                <motion.div
                  className="absolute top-20 left-0 right-0 mx-auto w-[90%] bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 backdrop-blur-md rounded-xl p-4 shadow-xl z-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-start">
                    <Volume2 size={20} className="text-violet-300 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white mb-1">Voice-Powered Assistant</h4>
                      <p className="text-sm text-gray-200 mb-3">
                        Click the microphone button and speak. I'll listen, understand, and respond with voice!
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

11:30
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/80">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                        : "bg-gray-800 text-gray-200"
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

                      {/* Play button for assistant messages */}
                      {message.role === "assistant" && index === messages.length - 1 && audioUrl && (
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
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Processing Status */}
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

            {/* Input Controls */}
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
                    Send
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing && !isRecording}
                    className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center mb-2",
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700",
                    )}
                  >
                    {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                  </Button>
                  <p className="text-xs text-gray-400">
                    {isRecording ? "Tap to stop recording" : "Tap to start speaking"}
                  </p>
                </div>
              )}

              {/* Toggle between voice and text */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}