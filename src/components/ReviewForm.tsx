import { Loader2 } from "lucide-react";
import { SentimentSelector, type Sentiment } from "./SentimentSelector";

interface FormData {
  profileUrl: string;
  placeUrl: string;
  personalNotes: string;
  sentiment: Sentiment;
}

interface ReviewFormProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ReviewForm({
  formData,
  onChange,
  onSubmit,
  loading,
}: ReviewFormProps) {
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="profileUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Google Maps 個人頁面網址
        </label>
        <input
          type="url"
          id="profileUrl"
          value={formData.profileUrl}
          onChange={(e) => onChange({ profileUrl: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="placeUrl"
          className="block text-sm font-medium text-gray-700"
        >
          想評論的地點短網址
        </label>
        <input
          type="url"
          id="placeUrl"
          value={formData.placeUrl}
          onChange={(e) => onChange({ placeUrl: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="personalNotes"
          className="block text-sm font-medium text-gray-700"
        >
          個人見解（選填）
        </label>
        <textarea
          id="personalNotes"
          value={formData.personalNotes}
          onChange={(e) => onChange({ personalNotes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder="例如：價格便宜, 餐點好吃, 服務親切"
          maxLength={300}
        />
      </div>

      <SentimentSelector
        value={formData.sentiment}
        onChange={(sentiment) => onChange({ sentiment })}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            生成中...
          </>
        ) : (
          "生成評論"
        )}
      </button>
    </form>
  );
}
