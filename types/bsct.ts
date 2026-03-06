export interface BSCT {
  id: string;
  title: string;
  summary: string;
  categoryBSCT?: {
    id: string;
    name: string;
  };
  description?: string;
  images?: string;
  imageUrl?: string;
  imageType?: string;
  imageName?: string;
  likeCount?: number;
  isActive?: boolean;
  isMoi?: boolean;
  viewCount?: number;
  bookmarkId?: number;
  bookmarkedAt?: string;
  createdAt: string;
}
