export interface ProductImage {
  id: number;
  productId: number;
  imageType: string;
  imageName: string;
  imageSize: number;
  imageUrl: string | null;
  url?: string;
}

export interface Product {
  id: string;
  name: string;
  images: ProductImage[];
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  average_rating?: number;
  rating_count?: number;
  isActive?: boolean;
  isMoi: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasMore: boolean;
}

export interface ApiResponse {
  products: Product[];
  total: number;
  page: number;
  pagination: Pagination;
}

export interface ApiParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}
