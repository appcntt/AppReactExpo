import { BSCT } from "@/types/bsct";
import { apiCall } from "@/utils/apiCall";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface BSCTContextType {
  bscts: BSCT[];
  loading: boolean;
  error: string | null;
  categoryBSCT?: string;
  fetchBSCTs: (categoryBSCT?: string) => Promise<void>;
  getNewBSCTs: (limit?: number) => Promise<BSCT[]>;
  bookmarks: BSCT[];
  bookmarksLoading: boolean;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => Promise<void>;
  fetchBookmarks: () => Promise<void>;
  clearAllBookmarks: () => Promise<void>;
}

const BSCTContext = createContext<BSCTContextType | undefined>(undefined);

export const BSCTProvider = ({ children }: { children: ReactNode }) => {
  const [bscts, setBscts] = useState<BSCT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryBSCT, setCategoryBSCT] = useState<string | undefined>(
    undefined,
  );
  const [bookmarks, setBookmarks] = useState<BSCT[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const { user } = useAuth();

  const isBookmarked = (id: string): boolean => {
    return bookmarks.some(b => String(b.id) === String(id));
  }

  useEffect(() => {
    fetchBSCTs();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user?.id]);

  const fetchBookmarks = async () => {
    try {
      setBookmarksLoading(true);
      const { success, data } = await apiCall<any>({
        endpoint: '/bsct/user/bookmarks',
        method: 'GET',
        requireAuth: true,
      });
      if (success) {
        setBookmarks(data?.blogs || []);
      }
    } catch (error) {
      console.error('fetchBookmarks error:', error);
    } finally {
      setBookmarksLoading(false)
    }
  }

  const toggleBookmark = async (id: string): Promise<void> => {
    try {
      const alreadyBookmarked = isBookmarked(id);
      if (alreadyBookmarked) {
        setBookmarks(prev => prev.filter(b => String(b.id) !== String(id)));
      }

      const { success, data } = await apiCall<any>({
        endpoint: `/bsct/${id}/bookmark`,
        method: 'POST',
        requireAuth: true,
      });

      if (success) {
        if (data.bookmarked) {
          await fetchBookmarks();
        }
      } else {
        await fetchBookmarks();
      }
    } catch (err) {
      console.error('toggleBookmark error:', err);
      await fetchBookmarks();
    }
  };

  const clearAllBookmarks = async (): Promise<void> => {
    try {
      await apiCall({
        endpoint: '/bsct/user/bookmarks',
        method: 'DELETE',
        requireAuth: true,
      });
      setBookmarks([]);
    } catch (err) {
      console.error('clearAllBookmarks error:', err);
    }
  };

  const fetchBSCTs = async (categoryParam?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { success, data, error } = await apiCall<any>({
        endpoint: "/bsct",
        method: "GET",
        params: {
          ...(categoryParam ? { categoryBSCT: categoryParam } : {}),
        },
        requireAuth: false,
      });

      if (success) {
        if (Array.isArray(data)) {
          setBscts(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setBscts(data.data);
        } else if (data?.bscts && Array.isArray(data.bscts)) {
          setBscts(data.bscts);
        } else {
          setBscts([]);
        }
        setCategoryBSCT(categoryParam);
      } else {
        setError(error || "Lỗi không xác định");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const getNewBSCTs = async (limit: number = 10): Promise<BSCT[]> => {
    try {
      const { success, data } = await apiCall<any>({
        endpoint: `/bsct/new`,
        method: "GET",
        params: { limit },
        requireAuth: false,
      });

      if (success) {
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.bscts && Array.isArray(data.bscts)) return data.bscts;
        return [];
      }
      return [];
    } catch (error: any) {
      console.error("getNewBSCTs error:", error.message);
      return [];
    }
  };

  return (
    <BSCTContext.Provider
      value={{
        bscts,
        loading,
        error,
        categoryBSCT,
        fetchBSCTs,
        getNewBSCTs,
        bookmarks,
        bookmarksLoading,
        isBookmarked,
        toggleBookmark,
        fetchBookmarks,
        clearAllBookmarks
      }}
    >
      {children}
    </BSCTContext.Provider>
  );
};

export const useBSCT = () => {
  const context = useContext(BSCTContext);
  if (!context) {
    throw new Error("useBSCT phải dùng trong BSCTProvider");
  }
  return context;
};
