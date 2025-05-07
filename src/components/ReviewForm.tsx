import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import type { Sentiment, Model, FormData } from "@/types/generator";

interface ReviewFormProps {
  formData: FormData;
  onChange: (data: Partial<FormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: "crawling" | "generating" | false;
}

const SENTIMENT_OPTIONS: {
  value: Sentiment;
  label: string;
  description: string;
}[] = [
  {
    value: "positive",
    label: "正面評價",
    description: "滿意的體驗，推薦給他人",
  },
  {
    value: "neutral",
    label: "中性評價",
    description: "一般體驗，有優點也有缺點",
  },
  {
    value: "negative",
    label: "負面評價",
    description: "不滿意的體驗，需要改進",
  },
];

const MODEL_OPTIONS: {
  value: Model;
  label: string;
  description: string;
  maxTemp: number;
}[] = [
  {
    value: "gpt",
    label: "ChatGPT",
    description: "OpenAI GPT-4o-mini 模型",
    maxTemp: 1,
  },
  {
    value: "gemini",
    label: "Gemini",
    description: "Google Gemini-2.0-flash-lite 模型",
    maxTemp: 2,
  },
];

export function ReviewForm({
  formData,
  onChange,
  onSubmit,
  loading,
}: ReviewFormProps) {
  const currentModel = MODEL_OPTIONS.find(
    (option) => option.value === formData.model
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="profileUrl"
          className="block text-sm font-medium text-gray-700"
        >
          您的 Google Maps 個人檔案網址（需要公開）
        </label>
        <div className="mt-1">
          <input
            type="url"
            name="profileUrl"
            id="profileUrl"
            required
            value={formData.profileUrl}
            onChange={(e) => onChange({ profileUrl: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
            placeholder="https://maps.app.goo.gl/xxxxx"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">用於分析您的評論風格和偏好</p>
      </div>

      <div>
        <label
          htmlFor="placeUrl"
          className="block text-sm font-medium text-gray-700"
        >
          想要評論的地點短網址
        </label>
        <div className="mt-1">
          <input
            type="url"
            name="placeUrl"
            id="placeUrl"
            required
            value={formData.placeUrl}
            onChange={(e) => onChange({ placeUrl: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
            placeholder="https://maps.app.goo.gl/xxxxx"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="personalNotes"
          className="block text-sm font-medium text-gray-700"
        >
          個人心得（選填）
        </label>
        <div className="mt-1">
          <textarea
            id="personalNotes"
            name="personalNotes"
            rows={3}
            value={formData.personalNotes}
            onChange={(e) => onChange({ personalNotes: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
            placeholder="例如：價格便宜, 餐點好吃, 服務親切"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label>選擇模型</label>
        <RadioGroup
          value={formData.model}
          onChange={(value) => onChange({ model: value as Model })}
          className="space-y-4"
        >
          {MODEL_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              className={({ checked }) =>
                `${checked ? "bg-sky-900 bg-opacity-75 text-white" : "bg-white"}
                relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <Label
                          as="p"
                          className={`font-medium ${
                            checked ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {option.label}
                        </Label>
                        <Description
                          as="span"
                          className={`inline ${
                            checked ? "text-sky-100" : "text-gray-500"
                          }`}
                        >
                          {option.description}
                        </Description>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Radio>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <label htmlFor="temperature">
          Temperature ({formData.temperature})
        </label>
        <input
          type="range"
          name="temperature"
          id="temperature"
          min="0"
          max={currentModel?.maxTemp || 1}
          step="0.1"
          value={formData.temperature}
          onChange={(e) =>
            onChange({ temperature: parseFloat(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>保守</span>
          <span>創意</span>
        </div>
      </div>

      <RadioGroup
        value={formData.sentiment}
        onChange={(value) => onChange({ sentiment: value })}
      >
        <Label className="block text-sm font-medium text-gray-700">
          評價傾向
        </Label>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SENTIMENT_OPTIONS.map((sentiment) => (
            <Radio
              key={sentiment.value}
              value={sentiment.value}
              className={({ checked }) =>
                `${
                  checked
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-900 hover:bg-gray-50"
                } relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <Label
                          as="p"
                          className={`font-medium ${
                            checked ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {sentiment.label}
                        </Label>
                        <Description
                          as="span"
                          className={`inline ${
                            checked ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {sentiment.description}
                        </Description>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Radio>
          ))}
        </div>
      </RadioGroup>

      <div>
        <button
          type="submit"
          disabled={!!loading}
          className={`flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading === "crawling"
            ? "取得資料中..."
            : loading === "generating"
            ? "生成評論中..."
            : "✨ 生成評論"}
        </button>
      </div>
    </form>
  );
}
