import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Call Groq API for text-to-speech using PlayAI TTS
    const response = await groq.audio.speech.create({
      model: "playai-tts", // Groq's PlayAI TTS model
      voice: "Basil-PlayAI", // You can customize this to be "Arav's voice"
      input: text,
      response_format: "wav",

    })

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer()

    // Return the audio data
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/wav",
      },
    })
  } catch (error) {
    console.error("Error generating speech:", error)
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
  }
}
