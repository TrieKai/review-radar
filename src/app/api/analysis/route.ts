import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getOpenAIUserPrompt, getOpenAISystemPrompt } from "./openai";
import {
  getGeminiSystemPrompt,
  getGeminiUserPrompt,
  GEMINI_RESPONSE_SCHEMA,
  analysisResponseSchema,
} from "./gemini";
import { Analysis } from "@/types/analysis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const validateAndParseResponse = (
  content: string,
  source: string
): Analysis => {
  try {
    const data = JSON.parse(content);
    const result = analysisResponseSchema.safeParse(data);

    if (!result.success) {
      console.error(`Invalid ${source} response format:`, result.error);
      throw new Error(`Invalid response format from ${source}`);
    }

    return result.data;
  } catch (error) {
    console.error("Failed to parse response from", source, error);
    throw new Error(`Invalid JSON response from ${source}`);
  }
};

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const { placeName, reviews, model } = await request.json();

    if (model === "gemini") {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-8b",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      });

      const result = await model.generateContent([
        getGeminiSystemPrompt(),
        getGeminiUserPrompt(placeName, reviews),
      ]);

      const response = result.response;
      const text = response.text();
      const data = await validateAndParseResponse(text, "Gemini");
      return NextResponse.json(data, { status: 200 });
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: getOpenAISystemPrompt(),
          },
          {
            role: "user",
            content: getOpenAIUserPrompt(placeName, reviews),
          },
        ],
      });

      if (!completion.choices[0].message.content) {
        throw new Error("Empty response from OpenAI");
      }

      let content = completion.choices[0].message.content;
      // Remove markdown code block if present
      content = content.replace(/^```json\n|```$/g, "").trim();

      const data = await validateAndParseResponse(content, "OpenAI");
      return NextResponse.json(data, { status: 200 });
    }
  } catch (error) {
    console.error("Error in analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze reviews" },
      { status: 500 }
    );
  }
}
