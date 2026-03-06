import { ApiParams, ApiResponse, CategoryCTGD, CTGD } from "@/types/ctgd";
import { apiCall } from "@/utils/apiCall";
import { BASE_URL } from "@env";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ProductCTGDContextType {
  products: CTGD[];
  categories: CategoryCTGD[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  newProducts: CTGD[];
  newProductsLoading: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categogyCTGDId: string) => void;
  setCurrentPage: (page: number) => void;
  getProduct: (productId: string) => CTGD | undefined;
  loadProducts: () => Promise<void>;
  loadNewProducts: (limit?: number) => Promise<void>;
  refreshNewProducts: () => Promise<void>;

  categoryProducts: CTGD[];
  categoryLoading: boolean;
  categoryPagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
  loadProductsByCategory: (
    categoryCTGDId: string,
    page?: number,
    pageSize?: number,
    search?: string,
  ) => Promise<void>;
}

const ProductCTGDContext = createContext<ProductCTGDContextType | undefined>(
  undefined,
);

const api = {
  baseUrl: BASE_URL,

  async getProducts(params: ApiParams = {}): Promise<ApiResponse> {
    const { search = "", categoryctgd = "" } = params;
    const queryParams: Record<string, any> = {};

    if (search) queryParams.search = search;
    if (categoryctgd && categoryctgd !== "all")
      queryParams.categoryctgd = categoryctgd;

    try {
      const res = await apiCall<ApiResponse>({
        endpoint: "/ctgds",
        method: "GET",
        params: queryParams,
        requireAuth: false,
      });
      if (res.success) {
        return res.data;
      } else {
        throw new Error(res.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("API Error", error);
      throw error;
    }
  },

  async getNewProducts(limit: number = 10): Promise<CTGD[]> {
    try {
      const res = await apiCall<CTGD[] | { products: CTGD[] }>({
        endpoint: "/ctgds/new",
        method: "GET",
        params: { limit: limit.toString() },
        requireAuth: false,
      });
      if (res.success) {
        const data = res.data;
        return Array.isArray(data) ? data : data.products || [];
      } else {
        throw new Error(res.error || "Failed to fetch new products");
      }
    } catch (error) {
      console.error("API Error - New Products:", error);
      throw error;
    }
  },

  async getCategories(): Promise<CategoryCTGD[]> {
    try {
      const res = await apiCall<
        CategoryCTGD[] | { categories: CategoryCTGD[] }
      >({
        endpoint: "/categoryCTGD",
        method: "GET",
        requireAuth: false,
      });

      if (res.success) {
        const data = res.data;
        const categoryList = Array.isArray(data) ? data : data.categories || [];
        return [{ id: "all", name: "Tất cả" }, ...categoryList];
      } else {
        throw new Error(res.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  async getProductsByCategory(
    categoryCTGDId: string,
    params: ApiParams = {},
  ): Promise<ApiResponse> {
    const { page = 1, pageSize = 12, search = "" } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      ...(search && { search }),
    });

    try {
      const response = await apiCall<ApiResponse>({
        endpoint: `/ctgds/categoryctgd/${categoryCTGDId}`,
        method: "GET",
        params: queryParams,
        requireAuth: false,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(
          response.error || "Failed to fetch products by category",
        );
      }
    } catch (error) {
      console.error("API Error - Category:", error);
      throw error;
    }
  },
};

interface ProductCTGDProviderProps {
  children: ReactNode;
}

export function ProductCTGDProvider({ children }: ProductCTGDProviderProps) {
  const [products, setProducts] = useState<CTGD[]>([]);
  const [categories, setCategories] = useState<CategoryCTGD[]>([]);
  const [newProducts, setNewProducts] = useState<CTGD[]>([]);
  const [newProductsLoading, setNewProductsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const pageSize = 12;
  const [categoryProducts, setCategoryProducts] = useState<CTGD[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  const loadProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.getProducts({
        page: currentPage,
        pageSize,
        search: searchQuery,
        categoryctgd: selectedCategory,
      });

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
    categoryCTGDId: string,
    page: number = 1,
    pageSize: number = 12,
    search: string = "",
  ): Promise<void> => {
    setCategoryLoading(true);
    try {
      const response = await api.getProductsByCategory(categoryCTGDId, {
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

  const handleSetSearchQuery = (query: string): void => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSetSelectedCategory = (categoryId: string): void => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const getProduct = (productId: string): CTGD | undefined => {
    // return products.find(product => product._id === productId);
    let product = products.find((p) => p.id === productId);
    if (!product) {
      product = newProducts.find((p) => p.id === productId);
    }
    return product;
  };

  const value: ProductCTGDContextType = {
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
    <ProductCTGDContext.Provider value={value}>
      {children}
    </ProductCTGDContext.Provider>
  );
}

export const useProduct = (): ProductCTGDContextType => {
  const context = useContext(ProductCTGDContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductCTGDProvider");
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
