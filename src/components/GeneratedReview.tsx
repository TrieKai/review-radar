interface GeneratedReviewProps {
  review: string;
}

export function GeneratedReview({ review }: GeneratedReviewProps) {
  if (!review) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-2">生成的評論：</h2>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="whitespace-pre-wrap">{review}</p>
      </div>
    </div>
  );
}
