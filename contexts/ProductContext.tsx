import { BASE_URL } from "@env";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiParams, ApiResponse, Category, Product } from "../types/product";

interface ProductContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  newProducts: Product[];
  newProductsLoading: boolean;
  toggleFavorite: (productId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  setCurrentPage: (page: number) => void;
  getProduct: (productId: string) => Product | undefined;
  loadProducts: () => Promise<void>;
  loadNewProducts: (limit?: number) => Promise<void>;
  refreshNewProducts: () => Promise<void>;

  categoryProducts: Product[];
  categoryLoading: boolean;
  categoryPagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
  loadProductsByCategory: (
    categoryId: string,
    page?: number,
    pageSize?: number,
    search?: string,
  ) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const api = {
  baseUrl: BASE_URL,

  async getProducts(params: ApiParams = {}): Promise<ApiResponse> {
    const { page = 1, pageSize = 12, search = "" } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(search && { search }),
    });

    try {
      const response = await fetch(`${this.baseUrl}/product?${queryParams}`);
      const data = await response.json();
      if (data.success && data.data) {
        return {
          products: data.data,
          total: data.count || data.data.length,
          page,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((data.count || data.data.length) / pageSize),
            totalProducts: data.count || data.data.length,
            hasMore: false,
          },
        };
      }
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getNewProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/product/new?limit=${limit}`,
      );
      const data = await response.json();

      if (data.success && data.data) return data.data;
      if (Array.isArray(data)) return data;
      return data.products || [];
    } catch (error) {
      console.error("API Error - New Products:", error);
      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      const data = await response.json();
      const categoryList = Array.isArray(data) ? data : data.categories || [];
      return [{ id: "all", name: "Tất cả" }, ...categoryList];
    } catch (error) {
      console.error("API Error:", error);
      return [
        { id: "all", name: "All Products" },
        { id: "electronics", name: "Electronics" },
        { id: "clothing", name: "Clothing" },
        { id: "books", name: "Books" },
        { id: "home", name: "Home & Garden" },
        { id: "sports", name: "Sports" },
      ];
    }
  },

  async getProductsByCategory(
    categoryId: string,
    params: ApiParams = {},
  ): Promise<ApiResponse> {
    const { page = 1, pageSize = 12, search = "" } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      ...(search && { search }),
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/product/category/${categoryId}?${queryParams}`,
      );
      const data = await response.json();
      if (data.success && data.data) {
        return {
          products: data.data,
          total: data.count || data.data.length,
          page,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((data.count || data.data.length) / pageSize),
            totalProducts: data.count || data.data.length,
            hasMore: false,
          },
        };
      }
      return data;
    } catch (error) {
      console.error("API Error - Category:", error);
      throw error;
    }
  },
};

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [newProductsLoading, setNewProductsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const pageSize = 12;
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  const loadProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      let response: ApiResponse;

      if (selectedCategory && selectedCategory !== "all") {
        response = await api.getProductsByCategory(selectedCategory, {
          page: currentPage,
          pageSize,
          search: searchQuery,
        });
      } else {
        response = await api.getProducts({
          page: currentPage,
          pageSize,
          search: searchQuery,
        });
      }

      setProducts(response.products || []);
      setTotalProducts(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / pageSize));
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (
    categoryId: string,
    page: number = 1,
    pageSize: number = 12,
    search: string = "",
  ): Promise<void> => {
    setCategoryLoading(true);
    try {
      const response = await api.getProductsByCategory(categoryId, {
        page,
        pageSize,
        search,
      });

      setCategoryProducts(response.products || []);
      setCategoryPagination({
        currentPage: response.pagination?.currentPage || page,
        totalPages: response.pagination?.totalPages || 1,
        totalProducts: response.pagination?.totalProducts || 0,
      });
    } catch (error) {
      console.error("Error loading products by category:", error);
      setCategoryProducts([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const loadNewProducts = async (limit: number = 10): Promise<void> => {
    setNewProductsLoading(true);
    try {
      const response = await api.getNewProducts(limit);
      setNewProducts(response);
    } catch (error) {
      console.error("Error loading new products:", error);
      setNewProducts([]);
    } finally {
      setNewProductsLoading(false);
    }
  };

  const refreshNewProducts = async (): Promise<void> => {
    try {
      const response = await api.getNewProducts(10);
      setNewProducts(response);
    } catch (error) {
      console.error("Error refreshing new products:", error);
    }
  };

  const loadCategories = async (): Promise<void> => {
    try {
      const response = await api.getCategories();
      setCategories(response);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
    loadNewProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchQuery, selectedCategory]);

  const toggleFavorite = (productId: string): void => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleSetSearchQuery = (query: string): void => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSetSelectedCategory = (categoryId: string): void => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const getProduct = (productId: string): Product | undefined => {
    let product = products.find((p) => p.id === productId);
    if (!product) {
      product = newProducts.find((p) => p.id === productId);
    }
    return product;
  };

  const value: ProductContextType = {
    products,
    categories,
    loading,
    searchQuery,
    newProducts,
    newProductsLoading,
    selectedCategory,
    currentPage,
    totalPages,
    totalProducts,
    toggleFavorite,
    setSearchQuery: handleSetSearchQuery,
    setSelectedCategory: handleSetSelectedCategory,
    setCurrentPage,
    getProduct,
    loadProducts,
    loadNewProducts,
    refreshNewProducts,
    categoryProducts,
    categoryLoading,
    categoryPagination,
    loadProductsByCategory,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export const useProduct = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};

export const useProductsByCategory = (
  categoryId: string,
  page: number = 1,
  pageSize: number = 12,
  search: string = "",
) => {
  const {
    categoryProducts,
    categoryLoading,
    categoryPagination,
    loadProductsByCategory,
  } = useProduct();

  useEffect(() => {
    if (categoryId && categoryId !== "all") {
      loadProductsByCategory(categoryId, page, pageSize, search);
    }
  }, [categoryId, page, pageSize, search]);

  return { categoryProducts, categoryLoading, categoryPagination };
};
