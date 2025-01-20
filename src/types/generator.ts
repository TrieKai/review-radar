export type Sentiment = "positive" | "neutral" | "negative";
export type Model = "gpt" | "gemini";

export interface FormData {
  profileUrl: string;
  placeUrl: string;
  personalNotes: string;
  sentiment: Sentiment;
  model: Model;
  temperature: number;
}
