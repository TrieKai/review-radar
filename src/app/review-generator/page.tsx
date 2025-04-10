"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/ReviewForm";
import { GeneratedReview } from "@/components/GeneratedReview";
import {
  getPersonalReviews,
  getPlaceReviews,
  generateReview,
} from "@/services/api";
import type { FormData } from "@/types/generator";

const SENTIMENT_SORT_MAP = {
  negative: "lowest",
  neutral: "relevant",
  positive: "highest",
} as const;

export default function ReviewGenerator() {
  const [formData, setFormData] = useState<FormData>({
    profileUrl: "",
    placeUrl: "",
    personalNotes: "",
    sentiment: "neutral",
    model: "gpt",
    temperature: 0.7,
  });
  const [loading, setLoading] = useState<"crawling" | "generating" | false>(
    false
  );
  const [generatedReview, setGeneratedReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!formData.profileUrl || !formData.placeUrl) {
      setError("請填寫所有必填欄位");
      return;
    }

    setLoading("crawling");
    setError(null);

    try {
      const [personalReviewsData, placeReviewsData] = await Promise.all([
        getPersonalReviews(formData.profileUrl),
        getPlaceReviews({
          url: formData.placeUrl,
          sort: SENTIMENT_SORT_MAP[formData.sentiment],
          fullContent: true,
          scrollTimes: 0,
        }),
      ]);

      if (personalReviewsData.error) {
        throw new Error(personalReviewsData.error);
      }

      if (placeReviewsData.error) {
        throw new Error(placeReviewsData.error);
      }

      const filteredPersonalReviews = personalReviewsData.reviews
        .filter((review) => review.content !== "")
        .slice(0, 5)
        .map((review) => review.content);

      const filteredPlaceReviews = placeReviewsData.reviews
        .filter((review) => review.content !== "")
        .slice(0, 3)
        .map((review) => review.content);

      setLoading("generating");
      const review = await generateReview({
        personalReviews: filteredPersonalReviews,
        placeReviews: filteredPlaceReviews,
        personalNotes: formData.personalNotes,
        sentiment: formData.sentiment,
        model: formData.model,
        temperature: formData.temperature,
      });

      setGeneratedReview(review);
    } catch (error) {
      console.error("Error generating review:", error);
      setError(error instanceof Error ? error.message : "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Google Maps AI 評論生成器
          </h1>
          <ReviewForm
            formData={formData}
            onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
            onSubmit={handleSubmit}
            loading={loading}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          <GeneratedReview review={generatedReview} />
        </div>
      </main>
    </div>
  );
}
