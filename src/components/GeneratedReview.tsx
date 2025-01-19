import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { Clipboard } from "lucide-react";

interface GeneratedReviewProps {
  review: string | null;
}

export function GeneratedReview({ review }: GeneratedReviewProps) {
  const handleCopy = (): void => {
    if (review) {
      void navigator.clipboard.writeText(review);
    }
  };

  return (
    <Transition
      show={!!review}
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1"
    >
      <div className="mt-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              AI 生成的評論
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>根據您的個人風格和情感傾向生成的評論:</p>
            </div>
            <div className="mt-5">
              <div className="relative rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
                <div className="pt-4 sm:flex sm:items-start">
                  <div className="mt-3 sm:mt-0">
                    <div className="text-sm text-gray-900">{review}</div>
                  </div>
                </div>
                <div className="absolute top-1 right-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center rounded-md bg-white px-2 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <Clipboard
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
