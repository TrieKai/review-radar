import { NextRequest, NextResponse } from "next/server";
import { getOpenAIUserPrompt, getOpenAISystemPrompt } from "./openai";
import {
  getGeminiSystemPrompt,
  getGeminiUserPrompt,
  GEMINI_RESPONSE_SCHEMA,
} from "./gemini";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

      try {
        const data = JSON.parse(text);
        // Validate the response
        if (
          typeof data.suspicionScore !== "number" ||
          !Array.isArray(data.findings) ||
          !data.radarData ||
          typeof data.radarData.languageArtificialness !== "number" ||
          typeof data.radarData.irrelevance !== "number" ||
          typeof data.radarData.unusualCommentLength !== "number" ||
          typeof data.radarData.postingTimeAnomalies !== "number" ||
          typeof data.radarData.userInactivity !== "number"
        ) {
          console.error("Invalid response format:", data);
          throw new Error("Invalid response format");
        }
        return NextResponse.json(data, { status: 200 });
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("Invalid JSON response from Gemini");
      }
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
        response_format: { type: "json_object" },
      });

      if (!completion.choices[0].message.content) {
        throw new Error("Empty response from OpenAI");
      }

      const data = JSON.parse(completion.choices[0].message.content);
      // Validate the response
      if (
        typeof data.suspicionScore !== "number" ||
        !Array.isArray(data.findings) ||
        !data.radarData ||
        typeof data.radarData.languageArtificialness !== "number" ||
        typeof data.radarData.irrelevance !== "number" ||
        typeof data.radarData.unusualCommentLength !== "number" ||
        typeof data.radarData.postingTimeAnomalies !== "number" ||
        typeof data.radarData.userInactivity !== "number"
      ) {
        console.error("Invalid response format from OpenAI:", data);
        throw new Error("Invalid response format from OpenAI");
      }

      return NextResponse.json(data, { status: 200 });
    }
  } catch (error) {
    console.error("Error in analysis:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze reviews",
      },
      { status: 500 }
    );
  }
}
