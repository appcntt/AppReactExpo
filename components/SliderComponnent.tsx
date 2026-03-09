import { useSlider } from "@/contexts/SliderContext";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

interface Slider {
  id: string;
  title?: string;
  imageUrl: string;
  isActive: boolean;
}

interface SliderComponentProps {
  height?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showTitle?: boolean;
  borderRadius?: number;
}

const { width: screenWidth } = Dimensions.get("window");
const SLIDE_WIDTH = screenWidth;
const SLIDE_HEIGHT = Math.round(SLIDE_WIDTH * (640 / 1920));

const SliderComponent: React.FC<SliderComponentProps> = ({
  autoPlay = true,
  autoPlayInterval = 3000,
  showIndicators = true,
  borderRadius = 0,
}) => {
  const { sliders, loading, error, getSliders, clearError } = useSlider();
  const carouselRef = useRef<ICarouselInstance>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
  };

  const handleIndicatorPress = (index: number) => {
    setCurrentIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  };

  useEffect(() => {
    if (sliders.length > 0) {
      setCurrentIndex(0);
    }
  }, [sliders]);

  const renderSliderItem = ({ item }: { item: Slider }) => {
    if (!item) return <View style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }} />;
    return (
      <TouchableOpacity activeOpacity={0.95} style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}>
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            borderRadius: borderRadius,
          }}
          resizeMode="stretch"
        />
      </TouchableOpacity>
    );
  };

  if (loading && sliders.length === 0) {
    return (
      <View style={[styles.placeholder, { height: SLIDE_HEIGHT }]}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (error && sliders.length === 0) {
    return (
      <View style={[styles.placeholder, { height: SLIDE_HEIGHT }]}>
        <Text style={styles.errorText}>Không thể tải banner</Text>
        <TouchableOpacity onPress={() => { clearError(); getSliders(); }}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (sliders.length === 0) return null;

  return (
    <View style={{ width: screenWidth, height: SLIDE_HEIGHT }}>
      <Carousel
        ref={carouselRef}
        width={SLIDE_WIDTH}
        height={SLIDE_HEIGHT}
        data={sliders.filter(s => s && s.id)}
        renderItem={renderSliderItem}
        onSnapToItem={handleSlideChange}
        autoPlay={autoPlay && sliders.length > 1}
        autoPlayInterval={autoPlayInterval}
        loop={sliders.length > 1}
        pagingEnabled
        snapEnabled
      />

      {showIndicators && sliders.length > 1 && (
        <View style={styles.indicatorContainer}>
          {sliders.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleIndicatorPress(index)}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentIndex
                    ? "#007AFF"
                    : "rgba(255,255,255,0.6)",
                  width: index === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    transition: "width 0.3s",
  } as any,
});

export default SliderComponent;