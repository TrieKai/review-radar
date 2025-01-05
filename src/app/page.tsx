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
import { useState } from "react";

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Home() {
  const [url, setUrl] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/reviews?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();
      setPlaceName(data.placeName);
      setAnalysis(data.analysis);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching analysis:", error);
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

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google Maps Review Radar</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="輸入 Google Maps 短網址"
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "分析中..." : "開始分析"}
          </button>
        </form>

        {analysis && (
          <>
            <h2 className="text-2xl font-bold mb-4">{placeName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">可疑程度分數</h2>
                <div className="text-4xl font-bold text-red-500">
                  {analysis.suspicionScore}
                </div>
                <div className="mt-4">
                  <h3 className="font-bold mb-2">發現：</h3>
                  <ul className="list-disc pl-5">
                    {analysis.findings.map((finding: string, index: number) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">評論指標分析</h2>
                <Radar data={radarData} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">評論列表</h2>
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
                        <span className="text-yellow-500">★</span>
                        <span>{review.rating}</span>
                        <span className="text-gray-500">・</span>
                        <span className="w-20 text-gray-500">
                          {review.time}
                        </span>
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
