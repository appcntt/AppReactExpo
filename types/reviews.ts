export interface Review {
  id: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  rating: number;
  comment: string;
  images?: Array<{ url: string }>;
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: string;
  isEdited: boolean;
  replies?: Array<{
    userId: number;
    userName?: string;
    comment: string;
    createdAt: string;
  }>;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Array<{ _id: number; count: number }>;
}
