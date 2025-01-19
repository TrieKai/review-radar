import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-8">
          Google Maps AI Review
        </h1>

        <p className="text-xl mb-8 max-w-2xl">
          Your all-in-one solution for review management: Analyze authenticity
          and generate personalized responses
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Link
            href="/review-analysis"
            className="p-6 border rounded-xl hover:border-blue-600 transition-colors"
          >
            <h2 className="text-2xl font-bold mb-4">Review Analysis →</h2>
            <p>
              Analyze Google Maps reviews to detect patterns and potential fake
              reviews using AI.
            </p>
          </Link>

          <Link
            href="/review-generator"
            className="p-6 border rounded-xl hover:border-blue-600 transition-colors"
          >
            <h2 className="text-2xl font-bold mb-4">Review Generator →</h2>
            <p>
              Generate personalized and authentic review responses based on
              historical data.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
