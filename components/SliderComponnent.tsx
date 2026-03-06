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

const SliderComponent: React.FC<SliderComponentProps> = ({
  height = screenWidth * 0.5,
  autoPlay = true,
  autoPlayInterval = 3000,
  showIndicators = true,
  borderRadius = 12,
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

  const handleRetry = () => {
    clearError();
    getSliders();
  };

  useEffect(() => {
    if (sliders.length > 0) {
      setCurrentIndex(0);
    }
  }, [sliders]);

  const renderSliderItem = ({
    item,
    index,
  }: {
    item: Slider;
    index: number;
  }) => {
    if (!item) {
      return <View style={styles.slide} />;
    }

    return (
      <View style={styles.slide}>
        <TouchableOpacity style={styles.imageContainer} activeOpacity={0.9}>
          <Image
            source={{ uri: item.imageUrl }}
            style={[
              styles.sliderImage,
              {
                height: height,
                borderRadius: borderRadius,
                width: "100%",
              },
            ]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && sliders.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error && sliders.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải slider</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (sliders.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        width={screenWidth - 20}
        height={height}
        data={sliders.filter((slider) => slider && slider.id)}
        renderItem={renderSliderItem}
        onSnapToItem={handleSlideChange}
        autoPlay={autoPlay && sliders.length > 1}
        autoPlayInterval={autoPlayInterval}
        loop={sliders.length > 1}
        pagingEnabled={true}
        snapEnabled={true}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 0,
          parallaxAdjacentItemScale: 1,
        }}
        style={styles.carousel}
      />

      {showIndicators && sliders.length > 1 && (
        <View style={styles.indicatorContainer}>
          {sliders.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    index === currentIndex
                      ? "#007AFF"
                      : "rgba(255, 255, 255, 0.5)",
                },
              ]}
              onPress={() => handleIndicatorPress(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    position: "relative",
    paddingHorizontal: 10,
  },
  carousel: {
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    position: "relative",
  },
  sliderImage: {
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default SliderComponent;
