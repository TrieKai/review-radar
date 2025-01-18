import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { personalReviews, placeReviews, personalNotes, sentiment } =
      await req.json();
    console.log(personalReviews, placeReviews, personalNotes, sentiment);

    // 準備 prompt
    const prompt = `
      你是一個擅長模仿用戶的專業的評論家。請根據以下資訊，生成一篇評論：

      1. 用戶過往的評論風格：
      ${JSON.stringify(personalReviews)}

      2. 其他人對這個地方的評論（參考用）：
      ${JSON.stringify(placeReviews)}

      3. 用戶的個人見解：
      ${personalNotes}

      4. 用戶給予的情緒：${sentiment}

      請生成一篇符合以下要求的評論：
      1. 完全依照用戶的寫作風格和用詞習慣
      2. 必須完全將個人見解與寫作風格和用詞習慣融入評論中
      3. 評論長度約150-300字
    `;

    // 使用 OpenAI API 生成評論
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一個擅長模仿用戶的專業的評論家。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const generatedReview = completion.choices[0].message.content;

    return NextResponse.json({ review: generatedReview });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error generating review", error: error },
      { status: 500 }
    );
  }
}
