import { RadarData } from "./analysis";

export interface PersonalReview {
  rating: string;
  time: string;
  content: string;
  photos: string[];
}

export interface PlaceReview {
  userName: string;
  userAvatar: string;
  userUrl: string;
  userInfo: string;
  rating: string;
  time: string;
  content: string;
  photos: string[];
}

export interface PersonalReviewsResponse {
  error?: string;
  reviews: PersonalReview[];
}

export interface PlaceReviewsParams {
  url: string;
  sort?: "relevant" | "newest" | "highest" | "lowest";
  fullContent?: boolean;
  scrollTimes?: number;
}

export interface PlaceReviewsResponse {
  error?: string;
  placeName: string;
  totalRating: number;
  totalReviewCount: number;
  reviews: PlaceReview[];
}

export interface AnalysisParams {
  placeName: string;
  reviews: {
    userInfo: string;
    rating: string;
    time: string;
    content: string;
    photoCount: number;
  }[];
}

export interface AnalysisResponse {
  error?: string;
  suspicionScore: number;
  findings: string[];
  radarData: RadarData;
}

export interface GenerateReviewParams {
  personalReviews: string[];
  placeReviews: string[];
  personalNotes: string;
  sentiment: string;
}

export interface GenerateReviewResponse {
  review: string;
  error?: string;
}
