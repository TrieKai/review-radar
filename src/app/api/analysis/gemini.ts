import { Schema, SchemaType } from "@google/generative-ai";
import { Review } from "@/types/analysis";

export const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    suspicionScore: {
      type: SchemaType.INTEGER,
      description:
        "Suspicion score of the review, 0-100, higher = more suspicious.",
    },
    findings: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: "Findings of the review",
    },
    radarData: {
      type: SchemaType.OBJECT,
      properties: {
        languageArtificialness: {
          type: SchemaType.INTEGER,
          description:
            "Language artificialness of the review, 0-100, higher = less natural and more artificial.",
        },
        irrelevance: {
          type: SchemaType.INTEGER,
          description:
            "Irrelevance of the review, 0-100, higher = less relevant to the location.",
        },
        unusualCommentLength: {
          type: SchemaType.INTEGER,
          description:
            "Unusual comment length of the review, 0-100, higher = abnormally short or long.",
        },
        postingTimeAnomalies: {
          type: SchemaType.INTEGER,
          description:
            "Posting time anomalies of the review, 0-100, higher = irregular timing.",
        },
        userInactivity: {
          type: SchemaType.INTEGER,
          description:
            "User inactivity of the review, 0-100, higher = limited user activity or engagement.",
        },
      },
      required: [
        "languageArtificialness",
        "irrelevance",
        "unusualCommentLength",
        "postingTimeAnomalies",
        "userInactivity",
      ],
    },
  },
  required: ["suspicionScore", "findings", "radarData"],
};

export const getGeminiUserPrompt = (
  placeName: string,
  reviews: Review[]
): string => {
  return `你是一位專業的評論分析專家，擅長偵測可疑的評論模式。分析Google Maps上「${placeName}」的評論是否有洗評論的可能性。以下是該地點依序由新到舊的評論資料，請考慮發文時間、寫作風格、照片數量、評分模式、使用者資訊（是否為在地嚮導、過去評論的數量和過去上傳的照片數量）和內容品質。
    Reviews: ${JSON.stringify(reviews)}

    在地嚮導的評論應該降低 30-50% 的可疑分數。`;
};
