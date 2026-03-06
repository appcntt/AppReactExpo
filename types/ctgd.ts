export interface ImageCTGD {
  id: number;
  productId: number;
  imageType: string;
  imageName: string;
  imageSize: number;
  imageUrl: string | null;
  url?: string;
}

export interface CategoryCTGD {
  id: string;
  name: string;
}

export interface CTGD {
  id: string;
  name: string;
  description: string;
  average_rating?: number;
  rating_count?: number;
  images?: ImageCTGD[];
  categoryctgd?: CategoryCTGD;
  isActive?: boolean;
  isMoi?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasMore: boolean;
}

export interface ApiResponse {
  products: CTGD[];
  total: number;
  page: number;
  pagination: Pagination;
}

export interface ApiParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryctgd?: string;
}
