export interface Review {
  userName: string;
  userAvatar: string;
  userUrl: string;
  userInfo: string;
  rating: string;
  time: string;
  content: string;
  photos: string[];
}

export interface RadarData {
  languageArtificialness: number;
  irrelevance: number;
  unusualCommentLength: number;
  postingTimeAnomalies: number;
  userInactivity: number;
}

export interface Analysis {
  suspicionScore: number;
  findings: string[];
  radarData: RadarData;
}
