import { Review } from "@/types/analysis";

export const getOpenAIUserPrompt = (
  personalReviews: Review[],
  placeReviews: Review[],
  personalNotes: string,
  sentiment: string
): string => {
  return `
    你是一個擅長模仿用戶的專業的評論家。請根據以下資訊，生成一篇評論：

    1. 用戶過往的評論風格：
    ${JSON.stringify(personalReviews)}

    2. 其他人對這個地方的評論（參考用）：
    ${JSON.stringify(placeReviews)}

    3. 用戶的個人見解：
    ${personalNotes}

    4. 用戶給予的情緒：${sentiment}

    請生成一篇符合以下要求的評論：
    1. 完全依照用戶的寫作格式和用詞習慣
    2. 必須完全將個人見解與寫作風格和用詞習慣融入評論中
    3. 評論長度約150-300字
  `;
};
