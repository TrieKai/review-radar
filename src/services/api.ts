import axios from "axios";
import {
  GenerateReviewResponse,
  PersonalReviewsResponse,
  PlaceReviewsParams,
  PlaceReviewsResponse,
  GenerateReviewParams,
} from "@/types/api";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPersonalReviews = async (
  profileUrl: string
): Promise<PersonalReviewsResponse> => {
  const { data } = await api.get<PersonalReviewsResponse>(
    `/personal-reviews?url=${encodeURIComponent(profileUrl)}`
  );
  return data;
};

export const getPlaceReviews = async ({
  url,
  sort,
  fullContent,
  scrollTimes,
}: PlaceReviewsParams): Promise<PlaceReviewsResponse> => {
  const { data } = await api.get<PlaceReviewsResponse>("/place-reviews", {
    params: {
      url,
      sort,
      fullContent,
      scrollTimes,
    },
  });
  return data;
};

export const generateReview = async (
  params: GenerateReviewParams
): Promise<string> => {
  const { data } = await api.post<GenerateReviewResponse>(
    "/generate-review",
    params
  );

  if (data.error) {
    throw new Error(data.error);
  }

  return data.review;
};
