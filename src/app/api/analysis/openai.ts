import { Review } from "@/types/analysis";

export const getOpenAISystemPrompt = (): string => {
  return `你是一位專業的評論分析專家，擅長偵測可疑的評論模式。請使用以下指標來分析評論：
    - Language Artificialness: 0-100, higher = less natural and more artificial.
    - Irrelevance: 0-100, higher = less relevant to the location.
    - Unusual Comment Length: 0-100, higher = abnormally short or long.
    - Posting Time Anomalies: 0-100, higher = irregular timing.
    - User Inactivity: 0-100, higher = limited user activity or engagement.

    特別注意：
    - 如果評論提及「送」、「贈」、「抽獎」、「打卡」等促銷行為，請顯著提高可疑分數（例如 +50%）。
    - 如果評論非上述促銷行為且為在地嚮導的評論，請降低 30-50% 的可疑分數。`;
};

export const getOpenAIUserPrompt = (
  placeName: string,
  reviews: Review[]
): string => {
  return `分析Google Maps上「${placeName}」的評論是否有洗評論的可能性。以下是該地點依序由新到舊的評論資料，請考慮發文時間、寫作風格、照片數量、評分模式、使用者資訊（是否為在地嚮導、過去評論的數量和過去上傳的照片數量）和內容品質。
    Reviews: ${JSON.stringify(reviews)}

    Reply in concise JSON:
    {
      "suspicionScore": number,
      "findings": string[],
      "radarData": {
        "languageArtificialness": number,
        "irrelevance": number,
        "unusualCommentLength": number,
        "postingTimeAnomalies": number,
        "userInactivity": number
      }
    }`;
};
