import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getOpenAISystemPrompt, getOpenAIUserPrompt } from "./openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { placeName, reviews } = await req.json();

    const openaiPrompt = getOpenAIUserPrompt(placeName, reviews);

    console.time("OpenAI analysis");
    const openaiResult = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: getOpenAISystemPrompt(),
        },
        { role: "user", content: openaiPrompt },
      ],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
    });
    console.timeEnd("OpenAI analysis");

    const analysis = JSON.parse(openaiResult.choices[0].message.content || "");
    return NextResponse.json(analysis);
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
