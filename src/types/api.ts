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

export interface PlaceReviewsResponse {
  error?: string;
  placeName: string;
  totalRating: number;
  totalReviewCount: number;
  reviews: PlaceReview[];
}

export interface GenerateReviewResponse {
  review: string;
  error?: string;
}

export interface PlaceReviewsParams {
  url: string;
  sort?: "relevant" | "newest" | "highest" | "lowest";
  fullContent?: boolean;
  scrollTimes?: number;
}

export interface GenerateReviewParams {
  personalReviews: string[];
  placeReviews: string[];
  personalNotes: string;
  sentiment: string;
}
