"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { StarIcon, MessageIcon } from "@/app/icons";
import { analyzeReviews, getPlaceReviews } from "@/services/api";
import type { Analysis, Review } from "@/types/analysis";

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function ReviewAnalysis() {
  const [url, setUrl] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [totalRating, setTotalRating] = useState("");
  const [totalReviewCount, setTotalReviewCount] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const radarData = {
    labels: ["語言自然度", "相關性", "評論長度", "發文時間一致性", "用戶歷史"],
    datasets: [
      {
        label: "評論指標",
        data: analysis
          ? [
              analysis.radarData.languageArtificialness,
              analysis.radarData.irrelevance,
              analysis.radarData.unusualCommentLength,
              analysis.radarData.postingTimeAnomalies,
              analysis.radarData.userInactivity,
            ]
          : [],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setError("");

      // valid URL format
      const urlPattern = /^https:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+$/;
      if (!urlPattern.test(url)) {
        setError(
          "請輸入有效的 Google Maps 短網址 (例如: https://maps.app.goo.gl/xxxxx)"
        );
        return;
      }

      setLoading(true);
      setPlaceName("");
      setTotalRating("");
      setTotalReviewCount("");
      setReviews([]);
      setAnalysis(null);

      try {
        // Step 1：get reviews
        const response = await getPlaceReviews({
          url,
          sort: "newest",
        });

        if (response.error) {
          throw new Error(response.error);
        }

        setPlaceName(response.placeName);
        setTotalRating(response.totalRating.toString());
        setTotalReviewCount(response.totalReviewCount.toString());
        setReviews(response.reviews);
      } catch (error) {
        console.error("Error:", error);
        setError("無法取得評論資料，請稍後再試");
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    const analyzing = async (): Promise<void> => {
      if (!reviews.length) {
        return;
      }

      try {
        // Filter reviews to only include essential data for analysis
        const filteredReviews = reviews.map((review) => ({
          userInfo: review.userInfo.replace(/\s/g, ""),
          rating: review.rating,
          time: review.time,
          content: review.content,
          photoCount: review.photos.length,
        }));

        setAnalyzing(true);
        // Step 2：get analysis
        const response = await analyzeReviews({
          placeName,
          reviews: filteredReviews,
        });

        if (response.error) {
          throw new Error(response.error);
        }

        setAnalysis(response);
      } catch (error) {
        console.error("Error:", error);
        setError("無法分析評論，請稍後再試");
      } finally {
        setAnalyzing(false);
      }
    };

    void analyzing();
  }, [placeName, reviews]);

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          <Link href="/" className="hover:opacity-80">
            <span className="text-blue-600">AI</span> Review Radar 🤖
          </Link>
        </h1>

        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="輸入 Google Maps 短網址 (例如: https://maps.app.goo.gl/xxxxx)"
                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading || !url}
                className={`px-4 py-2 rounded bg-blue-500 text-white font-semibold ${
                  loading || !url
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
              >
                {loading ? <>🔄 AI 正在分析中...</> : <>🔍 開始 AI 分析</>}
              </button>
            </div>
          </form>
        </div>

        {analyzing && (
          <div className="text-center py-4">
            <p className="text-blue-600">AI 正在分析評論中...</p>
          </div>
        )}

        {placeName && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{placeName}</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <StarIcon />
                <span>{totalRating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageIcon />
                <span>{totalReviewCount}</span>
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold mb-4">AI 可疑程度評估</h2>
                <div className="text-5xl font-bold text-red-500 mb-4">
                  {analysis.suspicionScore}
                </div>
                <div className="mt-4">
                  <h3 className="font-bold mb-2">AI 發現：</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.findings.map((finding: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold mb-4">AI 評論指標分析</h2>
                <Radar data={radarData} />
              </div>
            </div>
          </>
        )}

        {reviews.length > 0 && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>評論列表</span>
                <span className="text-sm font-normal text-gray-500">
                  ({reviews.length} 則評論)
                </span>
              </h2>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex justify-between items-start flex-col md:flex-row gap-2">
                      <div>
                        <Link
                          href={review.userUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 hover:opacity-80 transition-opacity"
                        >
                          <Image
                            src={review.userAvatar}
                            alt={review.userName}
                            width={44}
                            height={44}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold">{review.userName}</span>
                            <span className="text-sm text-gray-600">
                              {review.userInfo}
                            </span>
                          </div>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 flex-row-reverse md:flex-row">
                        <span className="text-gray-500">{review.time}</span>
                        <span className="text-gray-500">・</span>
                        <span className="text-yellow-500">★</span>
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p className="mt-2">{review.content}</p>
                    {review.photos.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        📷 {review.photos.length} 張相片
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
