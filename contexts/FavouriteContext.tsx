import { Product } from "@/types/product";
import { apiCall } from "@/utils/apiCall";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useAuth } from "./AuthContext";

interface BaseFavouriteProduct extends Product {
  favouriteId: string;
  favouriteAt: string;
  isFavourite: true;
  productType: "Product" | "ProductNongNghiepDoThi" | "ProductConTrungGiaDung";
}

export interface FavouriteProduct extends BaseFavouriteProduct {
  productType: "Product";
}

export interface FavouriteProductNNDT extends BaseFavouriteProduct {
  productType: "ProductNongNghiepDoThi";
}

export interface FavouriteProductCTGD extends BaseFavouriteProduct {
  productType: "ProductConTrungGiaDung";
}

export type AnyFavouriteProduct =
  | FavouriteProduct
  | FavouriteProductNNDT
  | FavouriteProductCTGD;

interface Pagination {
  total: number;
}

interface FavouriteState {
  favourites: AnyFavouriteProduct[];
  favouriteCount: number;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  favouriteStatus: Map<string, boolean>;
}

interface FavouriteContextType extends FavouriteState {
  getFavourites: (refresh?: boolean) => Promise<void>;
  toggleFavourite: (
    productId: string,
    productType:
      | "Product"
      | "ProductNongNghiepDoThi"
      | "ProductConTrungGiaDung",
  ) => Promise<{
    message: string;
    isFavourite: boolean;
    action: string;
    favouriteId?: string;
  } | null>;
  checkFavourite: (
    productId: string,
    productType:
      | "Product"
      | "ProductNongNghiepDoThi"
      | "ProductConTrungGiaDung",
  ) => Promise<boolean>;
  getFavouriteCount: (productType?: string) => Promise<void>;
  refreshFavourites: () => Promise<void>;
  clearError: () => void;
  resetFavourites: () => void;
  isFavourite: (productId: string) => boolean;
}

const initialState: FavouriteState = {
  favourites: [],
  favouriteCount: 0,
  pagination: { total: 0 },
  loading: false,
  error: null,
  refreshing: false,
  favouriteStatus: new Map(),
};

const FAVOURITE_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_REFRESHING: "SET_REFRESHING",
  SET_FAVOURITES: "SET_FAVOURITES",
  SET_FAVOURITE_COUNT: "SET_FAVOURITE_COUNT",
  ADD_FAVOURITE: "ADD_FAVOURITE",
  REMOVE_FAVOURITE: "REMOVE_FAVOURITE",
  UPDATE_FAVOURITE_STATUS: "UPDATE_FAVOURITE_STATUS",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  RESET: "RESET",
} as const;

type FavouriteAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | {
    type: "SET_FAVOURITES";
    payload: { products: AnyFavouriteProduct[]; pagination: Pagination };
  }
  | { type: "SET_FAVOURITE_COUNT"; payload: number }
  | { type: "ADD_FAVOURITE"; payload: AnyFavouriteProduct }
  | { type: "REMOVE_FAVOURITE"; payload: string }
  | {
    type: "UPDATE_FAVOURITE_STATUS";
    payload: { productId: string; isFavourite: boolean };
  }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" };

const favouriteReducer = (
  state: FavouriteState,
  action: FavouriteAction,
): FavouriteState => {
  switch (action.type) {
    case FAVOURITE_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case FAVOURITE_ACTIONS.SET_REFRESHING:
      return { ...state, refreshing: action.payload };

    case FAVOURITE_ACTIONS.SET_FAVOURITES:
      const productsWithType = action.payload.products.map((product) => ({
        ...product,
        productType: product.productType,
      }));

      const updatedStatusMap = new Map(state.favouriteStatus);

      action.payload.products.forEach((product) => {
        updatedStatusMap.set(String(product.id), true);
      });

      return {
        ...state,
        favourites: productsWithType,
        pagination: action.payload.pagination,
        favouriteStatus: updatedStatusMap,
        loading: false,
        refreshing: false,
        error: null,
      };

    case FAVOURITE_ACTIONS.SET_FAVOURITE_COUNT:
      return {
        ...state,
        favouriteCount: action.payload,
      };

    case FAVOURITE_ACTIONS.ADD_FAVOURITE:
      return {
        ...state,
        favourites: [action.payload, ...state.favourites],
        favouriteCount: state.favouriteCount + 1,
      };

    case FAVOURITE_ACTIONS.REMOVE_FAVOURITE:
      return {
        ...state,
        favourites: state.favourites.filter((fav) => fav.id !== action.payload),
        favouriteCount: Math.max(0, state.favouriteCount - 1),
      };

    case FAVOURITE_ACTIONS.UPDATE_FAVOURITE_STATUS:
      const updatedStatus = new Map(state.favouriteStatus);

      updatedStatus.set(String(action.payload.productId), action.payload.isFavourite);

      return {
        ...state,
        favouriteStatus: updatedStatus,
      };

    case FAVOURITE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        refreshing: false,
      };

    case FAVOURITE_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case FAVOURITE_ACTIONS.RESET:
      return initialState;

    default:
      return state;
  }
};

const FavouriteContext = createContext<FavouriteContextType | undefined>(
  undefined,
);

export const FavouriteProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(favouriteReducer, initialState);
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // const getFavourites = async (
  //   sortBy: string = "createdAt",
  //   sortOrder: string = "desc",
  //   refresh: boolean = false,
  //   productType?: string,
  // ): Promise<void> => {
  //   const tokenFromSecure = await SecureStore.getItemAsync("token").catch(
  //     () => null,
  //   );
  //   const tokenFromAsync = await AsyncStorage.getItem("token").catch(
  //     () => null,
  //   );

  //   if (!isLoggedIn || !user || (!tokenFromSecure && !tokenFromAsync)) {
  //     resetFavourites();
  //     return;
  //   }

  //   try {
  //     if (refresh) {
  //       dispatch({ type: FAVOURITE_ACTIONS.SET_REFRESHING, payload: true });
  //     } else {
  //       dispatch({ type: FAVOURITE_ACTIONS.SET_LOADING, payload: true });
  //     }

  //     const params: Record<string, any> = { sortBy, sortOrder };
  //     if (productType) {
  //       params.productType = productType;
  //     }

  //     const res = await apiCall<{
  //       products: AnyFavouriteProduct[];
  //       pagination: Pagination;
  //     }>({
  //       endpoint: "/favourite",
  //       method: "GET",
  //       params,
  //       requireAuth: true,
  //     });

  //     if (res.success && res.data) {
  //       dispatch({
  //         type: FAVOURITE_ACTIONS.SET_FAVOURITES,
  //         payload: {
  //           products: res.data.products,
  //           pagination: res.data.pagination,
  //         },
  //       });
  //     } else {
  //       throw new Error(res.error || "Failed to fetch favourites");
  //     }
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Failed to fetch favourites";
  //     dispatch({
  //       type: FAVOURITE_ACTIONS.SET_ERROR,
  //       payload: errorMessage,
  //     });
  //   }
  // };

  const getFavourites = async (refresh: boolean = false): Promise<void> => {
    const tokenFromSecure = await SecureStore.getItemAsync("token").catch(() => null);
    const tokenFromAsync = await AsyncStorage.getItem("token").catch(() => null);

    if (!isLoggedIn || !user || (!tokenFromSecure && !tokenFromAsync)) {
      resetFavourites();
      return;
    }

    try {
      dispatch({
        type: refresh ? FAVOURITE_ACTIONS.SET_REFRESHING : FAVOURITE_ACTIONS.SET_LOADING,
        payload: true
      });

      const res = await apiCall<{ products: AnyFavouriteProduct[]; pagination: Pagination }>({
        endpoint: "/favourite",
        method: "GET",
        requireAuth: true,
      });

      if (res.success && res.data) {
        dispatch({
          type: FAVOURITE_ACTIONS.SET_FAVOURITES,
          payload: {
            products: res.data.products,
            pagination: res.data.pagination,
          },
        });
      } else {
        throw new Error(res.error || "Failed to fetch favourites");
      }
    } catch (error) {
      dispatch({
        type: FAVOURITE_ACTIONS.SET_ERROR,
        payload: error instanceof Error ? error.message : "Failed to fetch favourites",
      });
    }
  };

  const toggleFavourite = async (
    productId: string,
    productType:
      | "Product"
      | "ProductNongNghiepDoThi"
      | "ProductConTrungGiaDung",
  ) => {
    if (!isLoggedIn || !productId) return null;

    try {
      const currentStatus = state.favouriteStatus.get(String(productId)) || false;
      dispatch({
        type: FAVOURITE_ACTIONS.UPDATE_FAVOURITE_STATUS,
        payload: { productId, isFavourite: !currentStatus },
      });

      const requestData: any = { productType };
      switch (productType) {
        case "Product":
          requestData.productId = productId;
          break;
        case "ProductNongNghiepDoThi":
          requestData.productnndtId = productId;
          break;
        case "ProductConTrungGiaDung":
          requestData.productctgdId = productId;
          break;
      }

      const res = await apiCall<{
        message: string;
        isFavourite: boolean;
        action: string;
        favouriteId?: string;
      }>({
        endpoint: "/favourite/toggle",
        method: "POST",
        data: requestData,
        requireAuth: true,
      });

      if (res.success && res.data) {
        dispatch({
          type: FAVOURITE_ACTIONS.UPDATE_FAVOURITE_STATUS,
          payload: { productId : String(productId), isFavourite: res.data.isFavourite },
        });

        await getFavourites();

        if (res.data.action === "added") {
          await getFavourites();
          dispatch({
            type: FAVOURITE_ACTIONS.SET_FAVOURITE_COUNT,
            payload: state.favouriteCount + 1,
          });
        } else {
          dispatch({
            type: FAVOURITE_ACTIONS.REMOVE_FAVOURITE,
            payload: productId,
          });
        }
        return res.data;
      } else {
        dispatch({
          type: FAVOURITE_ACTIONS.UPDATE_FAVOURITE_STATUS,
          payload: { productId, isFavourite: currentStatus },
        });
        throw new Error(res.error || "Failed to toggle favourite");
      }
    } catch (error) {
      const currentStatus = state.favouriteStatus.get(productId) || false;
      dispatch({
        type: FAVOURITE_ACTIONS.UPDATE_FAVOURITE_STATUS,
        payload: { productId, isFavourite: currentStatus },
      });
      console.error("Toggle favourite error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to toggle favourite";
      dispatch({
        type: FAVOURITE_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  };

  const checkFavourite = async (
    productId: string,
    productType:
      | "Product"
      | "ProductNongNghiepDoThi"
      | "ProductConTrungGiaDung",
  ): Promise<boolean> => {
    if (!isLoggedIn || !productId) return false;

    try {
      const response = await apiCall<{
        isFavourite: boolean;
        favouriteId?: string;
        favouritedAt?: string;
      }>({
        endpoint: `/favourite/check/${productId}`,
        method: "GET",
        params: { productType },
        requireAuth: true,
      });

      return response.success ? response.data?.isFavourite || false : false;
    } catch (error) {
      console.error("Check favourite error:", error);
      return false;
    }
  };

  const getFavouriteCount = async (productType?: string): Promise<void> => {
    if (!isLoggedIn) return;

    try {
      const params = productType ? { productType } : undefined;
      const response = await apiCall<{ success: boolean; count: number }>({
        endpoint: "/favourite/count",
        method: "GET",
        params,
        requireAuth: true,
      });

      if (response.success && response.data) {
        dispatch({
          type: FAVOURITE_ACTIONS.SET_FAVOURITE_COUNT,
          payload: response.data.count,
        });
      }
    } catch (error) {
      console.error("Get favourite count error:", error);
    }
  };

  // const loadMoreFavourites = async (): Promise<void> => {
  //   const { page, pages } = state.pagination;
  //   if (page < pages && !state.loading) {
  //     await getFavourites();
  //   }
  // };

  const refreshFavourites = async (): Promise<void> => {
    await getFavourites();
  };

  const isFavourite = (productId: string): boolean => {
    return state.favouriteStatus.get(String(productId)) || false;
  };

  const clearError = (): void => {
    dispatch({ type: FAVOURITE_ACTIONS.CLEAR_ERROR });
  };

  const resetFavourites = (): void => {
    dispatch({ type: FAVOURITE_ACTIONS.RESET });
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      getFavourites();
      getFavouriteCount();
    } else {
      resetFavourites();
    }
  }, [isLoggedIn, user]);

  const value: FavouriteContextType = {
    ...state,
    getFavourites,
    toggleFavourite,
    checkFavourite,
    getFavouriteCount,
    refreshFavourites,
    clearError,
    resetFavourites,
    isFavourite,
  };

  return (
    <FavouriteContext.Provider value={value}>
      {children}
    </FavouriteContext.Provider>
  );
};

export const useFavourite = (): FavouriteContextType => {
  const context = useContext(FavouriteContext);
  if (!context) {
    throw new Error("useFavourite must be used within a FavouriteProvider");
  }
  return context;
};
