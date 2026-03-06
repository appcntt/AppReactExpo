import { BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { clearTokens } from "./tokenManager";

interface ApiCallOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const apiCall = async <T = any>({
  endpoint,
  method = "GET",
  data,
  params,
  headers = {},
  requireAuth = true,
}: ApiCallOptions): Promise<ApiResponse<T>> => {
  try {
    let url = `${BASE_URL}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });
      url += `?${queryString.toString()}`;
    }

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (requireAuth) {
      let token = await AsyncStorage.getItem("token");

      if (!token) {
        try {
          token = await SecureStore.getItemAsync("token");
        } catch (error) {
          console.log("SecureStore token retrieval failed:", error);
        }
      }

      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      } else {
        console.log(
          "No authentication token found in both AsyncStorage and SecureStore",
        );
        throw new Error("Authentication required. Please login.");
      }
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: responseData,
        message: responseData.message,
      };
    } else {
      if (response.status === 401) {
        console.log("401 Unauthorized - but NOT clearing tokens automatically");
        if (!endpoint.includes("/check/")) {
          await clearTokens(`401 error from ${endpoint}`);
        } else {
          console.log("Skipping token clear for check endpoint");
        }
      }

      throw new Error(
        responseData.message || responseData.error || `HTTP ${response.status}`,
      );
    }
  } catch (error) {
    console.log("API Call Error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        data: null as T,
        error: error.message,
      };
    }

    return {
      success: false,
      data: null as T,
      error: "An unexpected error occurred",
    };
  }
};
