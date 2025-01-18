import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

export type Sentiment = "negative" | "neutral" | "positive";

const sentimentConfig = {
  negative: {
    icon: ThumbsDown,
    label: "負面",
    color: "text-red-500",
  },
  neutral: {
    icon: Minus,
    label: "中立",
    color: "text-gray-500",
  },
  positive: {
    icon: ThumbsUp,
    label: "正面",
    color: "text-green-500",
  },
} as const;

interface SentimentSelectorProps {
  value: Sentiment;
  onChange: (sentiment: Sentiment) => void;
}

export function SentimentSelector({ value, onChange }: SentimentSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        整體評價
      </label>
      <div className="flex gap-4">
        {(
          Object.entries(sentimentConfig) as [
            Sentiment,
            typeof sentimentConfig.positive
          ][]
        ).map(([sentimentValue, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={sentimentValue}
              type="button"
              onClick={() => onChange(sentimentValue)}
              className={`flex flex-col items-center p-4 rounded-lg border ${
                value === sentimentValue
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-6 h-6 ${config.color}`} />
              <span className="mt-2 text-sm font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
