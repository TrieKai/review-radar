import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getOpenAIUserPrompt } from "./openai";
import { getGeminiUserPrompt } from "./gemini";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
});

export async function POST(req: Request) {
  try {
    const {
      personalReviews,
      placeReviews,
      personalNotes,
      sentiment,
      model,
      temperature,
    } = await req.json();

    if (model === "gpt") {
      const openaiUserPrompt = getOpenAIUserPrompt(
        personalReviews,
        placeReviews,
        personalNotes,
        sentiment
      );
      console.time("OpenAI generate review");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: temperature,
        messages: [
          {
            role: "user",
            content: openaiUserPrompt,
          },
        ],
      });
      console.timeEnd("OpenAI generate review");

      return NextResponse.json(
        { review: completion.choices[0].message.content },
        { status: 200 }
      );
    } else if (model === "gemini") {
      const geminiUserPrompt = getGeminiUserPrompt(
        personalNotes,
        personalReviews,
        placeReviews,
        sentiment
      );
      console.time("Gemini generate review");
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: geminiUserPrompt }] }],
        generationConfig: {
          temperature: temperature,
        },
      });
      console.timeEnd("Gemini generate review");

      const response = result.response;
      const text = response.text();
      return NextResponse.json({ review: text }, { status: 200 });
    }

    throw new Error("Invalid model selected");
  } catch (error) {
    console.error("Error generating review:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate review",
      },
      { status: 500 }
    );
  }
}
