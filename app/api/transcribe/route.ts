import { type NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Create a File object from the buffer
    const file = new File([buffer], audioFile.name, { type: audioFile.type });

    // Call Groq API for transcription using Whisper model
    const transcription = await groq.audio.transcriptions.create({
      file, // Pass the File object instead of a file path
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      language: "en",
      temperature: 0.0,
    });

    // Return the transcription
    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}