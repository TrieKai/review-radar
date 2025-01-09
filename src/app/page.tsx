"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Review {
  userName: string;
  userAvatar: string;
  userUrl: string;
  userInfo: string;
  rating: string;
  time: string;
  content: string;
  photos: string[];
}

interface RadarData {
  languageArtificialness: number;
  irrelevance: number;
  unusualCommentLength: number;
  postingTimeAnomalies: number;
  userInactivity: number;
}

interface Analysis {
  suspicionScore: number;
  findings: string[];
  radarData: RadarData;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [totalRating, setTotalRating] = useState("");
  const [totalReviewCount, setTotalReviewCount] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setReviews([]);
    setAnalysis(null);

    try {
      // Step 1：get reviews
      const response = await fetch(
        `/api/reviews?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();
      setPlaceName(data.placeName);
      setTotalRating(data.totalRating);
      setTotalReviewCount(data.totalReviewCount);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

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
        const analysisResponse = await fetch("/api/analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            placeName,
            reviews: filteredReviews,
          }),
        });
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
      } catch (error) {
        console.error("Error:", error);
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
          <span className="text-blue-600">AI</span> Review Radar 🤖
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="輸入 Google Maps 短網址，讓 AI 為您分析評論"
            className="w-full p-4 border rounded-lg mb-4 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center gap-2"
          >
            {loading ? <>🔄 AI 正在分析中...</> : <>🔍 開始 AI 分析</>}
          </button>
        </form>

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{totalRating}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
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
                    <div className="flex justify-between items-start">
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
                      <div className="flex items-center gap-2">
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
