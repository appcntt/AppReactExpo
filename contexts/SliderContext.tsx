import { apiCall } from "@/utils/apiCall";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

interface Slider {
  id: string;
  title?: string;
  imageUrl: string;
  isActive: boolean;
}

interface SliderState {
  sliders: Slider[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface SliderContextType extends SliderState {
  getSliders: (refresh?: boolean) => Promise<void>;
  refreshSliders: () => Promise<void>;
  clearError: () => void;
}

const initialState: SliderState = {
  sliders: [],
  loading: false,
  error: null,
  refreshing: false,
};

const SLIDER_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_REFRESHING: "SET_REFRESHING",
  SET_SLIDERS: "SET_SLIDERS",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  RESET: "RESET",
} as const;

type SliderAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_SLIDERS"; payload: Slider[] }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" };

const sliderReducer = (
  state: SliderState,
  action: SliderAction,
): SliderState => {
  switch (action.type) {
    case SLIDER_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case SLIDER_ACTIONS.SET_REFRESHING:
      return { ...state, refreshing: action.payload };

    case SLIDER_ACTIONS.SET_SLIDERS:
      return {
        ...state,
        sliders: action.payload,
        loading: false,
        refreshing: false,
        error: null,
      };

    case SLIDER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        refreshing: false,
      };

    case SLIDER_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case SLIDER_ACTIONS.RESET:
      return initialState;

    default:
      return state;
  }
};

const SliderContext = createContext<SliderContextType | undefined>(undefined);

export const SliderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sliderReducer, initialState);

  const getSliders = async (refresh: boolean = false): Promise<void> => {
    try {
      if (refresh) {
        dispatch({ type: SLIDER_ACTIONS.SET_REFRESHING, payload: true });
      } else {
        dispatch({ type: SLIDER_ACTIONS.SET_LOADING, payload: true });
      }

      const res = await apiCall<any>({
        endpoint: "/slider",
        method: "GET",
        requireAuth: false,
      });

      if (res.success && res.data) {
        let sliderList: any[] = [];
        if (Array.isArray(res.data)) {
          sliderList = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          sliderList = res.data.data;
        }

        const activeSliders = sliderList
          .filter((slider) => slider.isActive)
          .map((slider) => ({
            ...slider,
            image: slider.imageUrl || slider.image || "",
          }));

        dispatch({ type: SLIDER_ACTIONS.SET_SLIDERS, payload: activeSliders });
      } else {
        throw new Error(res.error || "Failed to fetch slider");
      }
    } catch (error) {
      console.error("Get sliders error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch sliders";
      dispatch({
        type: SLIDER_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
    }
  };

  const refreshSliders = async (): Promise<void> => {
    await getSliders(true);
  };

  const clearError = (): void => {
    dispatch({ type: SLIDER_ACTIONS.CLEAR_ERROR });
  };

  useEffect(() => {
    getSliders();
  }, []);

  const value: SliderContextType = {
    ...state,
    getSliders,
    refreshSliders,
    clearError,
  };

  return (
    <SliderContext.Provider value={value}>{children}</SliderContext.Provider>
  );
};

export const useSlider = (): SliderContextType => {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("useSlider must be used within a SliderProvider");
  }
  return context;
};
