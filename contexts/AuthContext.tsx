import { User } from "@/types/user";
import { BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  getToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearAllData: () => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const [secureToken, asyncToken] = await Promise.all([
        SecureStore.getItemAsync("token"),
        AsyncStorage.getItem("token"),
      ]);
      return secureToken || asyncToken;
    } catch (error) {
      console.error("❌ Get token error:", error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      await SecureStore.setItemAsync("token", data.token);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
      setIsLoggedIn(true);
    } else {
      throw new Error(data.message || "Đăng nhập thất bại");
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const secureToken = await SecureStore.getItemAsync("token");
      const asyncToken = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      const token = secureToken || asyncToken;

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        await clearAllData();
      }
    } catch (error) {
      console.error("❌ Check auth error:", error);
      await clearAllData();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Đăng kí thất bại");
    }
  };

  const clearAllData = async () => {
    try {
      setIsLoggedIn(false);
      setUser(null);
      await Promise.all([
        SecureStore.deleteItemAsync("token").catch((e) =>
          console.log("Clear", e.message),
        ),
        AsyncStorage.removeItem("token").catch((e) =>
          console.log("as", e.message),
        ),
        AsyncStorage.removeItem("user").catch((e) =>
          console.log("as", e.message),
        ),
        AsyncStorage.removeItem("favourite").catch((e) =>
          console.log("as", e.message),
        ),
      ]);
    } catch (error) {
      console.error("❌ Clear data error:", error);
    }
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn");
      }
      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          message: data.message || "Đổi mật khẩu thành công",
        };
      } else {
        return {
          success: false,
          message: data.message || "Đổi mật khẩu thất bại",
        };
      }
    } catch (error) {
      console.error("❌ Change password error:", error);

      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
      };
    }
  };

  const getToken = async () => {
    try {
      if (token) return token;
      const storedToken = await AsyncStorage.getItem("token");
      console.log(storedToken);
      if (storedToken) {
        setToken(storedToken);
      }

      return storedToken;
    } catch (error) {
      console.error("❌ Get token error:", error);
      return null;
    }
  };

  const logout = async () => {
    await clearAllData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        checkAuthStatus,
        clearAllData,
        isLoggedIn,
        changePassword,
        getToken,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
