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
  user: string;
  userInfo: string;
  rating: string;
  time: string;
  content: string;
  photos: string[];
}

interface RadarData {
  languageNaturalness: number;
  relevance: number;
  commentLength: number;
  postingTimeConsistency: number;
  userHistory: number;
}

interface Analysis {
  suspicionScore: number;
  findings: string[];
  radarData: RadarData;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const radarData = {
    labels: ["語言自然度", "相關性", "評論長度", "發文時間一致性", "用戶歷史"],
    datasets: [
      {
        label: "評論指標",
        data: analysis
          ? [
              analysis.radarData.languageNaturalness,
              analysis.radarData.relevance,
              analysis.radarData.commentLength,
              analysis.radarData.postingTimeConsistency,
              analysis.radarData.userHistory,
            ]
          : [],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    const analyzing = async () => {
      if (!reviews.length) {
        return;
      }

      // Filter reviews to only include essential data for analysis
      const filteredReviews = reviews.map((review) => ({
        userInfo: review.userInfo.replace(/\s/g, ""),
        rating: review.rating,
        time: review.time,
        content: review.content,
        photoCount: review.photos.length,
      }));

      // Step 2: AI analysis
      setAnalyzing(true);
      const analysisResponse = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeName: placeName,
          reviews: filteredReviews,
        }),
      });
      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData);
      setAnalyzing(false);
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

        {analysis && (
          <>
            <h2 className="text-2xl font-bold mb-4">{placeName}</h2>
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
                        <div className="font-bold">{review.user}</div>
                        <div className="text-sm text-gray-600">
                          {review.userInfo}
                        </div>
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
