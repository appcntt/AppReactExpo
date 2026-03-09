import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import HtmlDescription from "@/components/HtmlDescription";
import { useProduct } from "@/contexts/ProductContext";
import { useTheme } from "@/contexts/ThemeContext";
import { BASE_URL } from "@env";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProduct } = useProduct();
  const { theme, isDark } = useTheme();

  //loading
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const styles = createStyles(theme, isDark);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setProduct(null);

    const localProduct = getProduct(id);
    if (localProduct) {
      setProduct(localProduct);
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProduct(data.data);
        } else if (data.data) {
          setProduct(data.data);
        } else {
          setProduct(data);
        }
      })
      .catch((err) => console.error("Fetch product error:", err))
      .finally(() => setLoading(false));
  }, [id]);


  //loading
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const resetZoom = () => {
    "worklet";
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setIsImageModalVisible(true);
    resetZoom();
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
    resetZoom();
  };

  const nextImage = () => {
    if (modalImageIndex < product.images.length - 1) {
      setModalImageIndex(modalImageIndex + 1);
      resetZoom();
    }
  };

  const prevImage = () => {
    if (modalImageIndex > 0) {
      setModalImageIndex(modalImageIndex - 1);
      resetZoom();
    }
  };

  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    scale.value = Math.max(1, Math.min(event.scale, 4));
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      } else {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (scale.value === 1) {
        if (event.translationX < -100) {
          runOnJS(nextImage)();
        } else if (event.translationX > 100) {
          runOnJS(prevImage)();
        }
      }
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (scale.value > 1) {
        resetZoom();
      } else {
        scale.value = withSpring(2.5);
        translateX.value = withSpring((width / 2 - event.x) / 2.5);
        translateY.value = withSpring((height / 2 - event.y) / 2.5);
      }
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTapGesture,
    pinchGesture,
    panGesture,
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (loading) {

    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingOuter,
            { transform: [{ scale: pulseValue }], borderColor: theme.primary + "30" },
          ]}
        >
          <View style={[styles.loadingMiddle, { borderColor: theme.primary + "60" }]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="leaf" size={36} color={theme.primary} />
            </Animated.View>
          </View>
        </Animated.View>

        <Text style={[styles.loadingTitle, { color: theme.text }]}>
          Đang tải sản phẩm
        </Text>
        <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
          Vui lòng chờ trong giây lát...
        </Text>
      </View>
    );
  }

  if (!product || !id) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons
            name="search-outline"
            size={64}
            color={theme.textSecondary}
          />
          <Text style={styles.notFoundTitle}>Không tìm thấy sản phẩm</Text>
          <Text style={styles.notFoundText}>
            Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const currentImage = images[selectedImageIndex] || images[0];
  const modalImage = images[modalImageIndex];

  const getImageUrl = (image: any) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.imageUrl || image.url || "";
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: product.name,
        message: `${product.name}\n\nXem chi tiết sản phẩm tại: ${BASE_URL}/product/${product.id}`,
        url: `${BASE_URL}/product/${product.id}`,
      });
    } catch (error: any) {
      console.error("Error sharing:", error);
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerActionButton}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderImageGallery = () => {
    return (
      <View style={styles.imageSection}>
        <View style={styles.mainImageContainer}>
          {currentImage ? (
            <TouchableOpacity
              onPress={() => openImageModal(selectedImageIndex)}
            >
              <Image
                source={{ uri: getImageUrl(currentImage) }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.zoomHint}>
                <Ionicons
                  name="expand-outline"
                  size={16}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.zoomHintText}>Nhấn để phóng to</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderMainImage}>
              <Ionicons
                name="image-outline"
                size={64}
                color={theme.textSecondary}
              />
              <Text style={styles.placeholderText}>Không có hình ảnh</Text>
            </View>
          )}
        </View>

        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
            contentContainerStyle={styles.thumbnailContent}
          >
            {images.map((image: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailActive,
                ]}
              >
                <Image
                  source={{ uri: getImageUrl(image) }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                {selectedImageIndex === index && (
                  <View style={styles.thumbnailActiveIndicator}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Modal visible={isImageModalVisible} transparent animationType="fade">
          <StatusBar
            backgroundColor="rgba(0,0,0,0.95)"
            barStyle="light-content"
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={closeImageModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalImageCounter}>
                {modalImageIndex + 1} / {images.length}
              </Text>
              <TouchableOpacity style={styles.modalShareButton}>
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalImageContainer}>
              <GestureDetector gesture={composedGesture}>
                <Animated.Image
                  source={{ uri: getImageUrl(modalImage) }}
                  style={[styles.modalImage, animatedImageStyle]}
                  resizeMode="contain"
                />
              </GestureDetector>
            </View>

            <View style={styles.modalFooter}>
              <Text style={styles.modalZoomHint}>
                Nhấp đôi để phóng to • Vuốt để chuyển ảnh
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderProductInfo = () => {
    const styles = createStyles(theme, isDark);
    return (
      <View style={styles.infoSection}>
        <Text style={styles.productTitle}>{product.name}</Text>

        {(product.categoryName || product.category) && (
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag-outline" size={12} color={theme.primary} />
            <Text style={styles.categoryBadgeText}>
              {product.categoryName ||
                (typeof product.category === "object"
                  ? product.category.name
                  : product.category)}
            </Text>
          </View>
        )}

        {product.average_rating != null && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={
                    i < Math.floor(product.average_rating!)
                      ? "star"
                      : "star-outline"
                  }
                  size={18}
                  color="#fbbf24"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.average_rating} ({product.rating_count ?? 0} đánh giá)
            </Text>
          </View>
        )}

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hướng dẫn sử dụng</Text>
            <HtmlDescription
              htmlContent={product.description}
              containerStyle={styles.htmlContainer}
            />
          </View>
        )}

        {/* Additional product info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
          <View style={styles.productInfoGrid}>
            {product.isMoi && (
              <View style={styles.infoItem}>
                <Ionicons name="flash" size={16} color="#22c55e" />
                <Text style={styles.infoLabel}>Sản phẩm mới</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={theme.primary}
              />
              <Text style={styles.infoLabel}>Chất lượng đảm bảo</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="leaf" size={16} color="#22c55e" />
              <Text style={styles.infoLabel}>An toàn sinh học</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.writeButton, { marginBottom: insets.bottom + 16 }]}
          onPress={() => router.push(`/reviews/${product.id}`)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.writeButtonText}>Xem đánh giá</Text>
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderImageGallery()}
        {renderProductInfo()}
      </ScrollView>
    </SafeAreaProvider>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: 50,
    },

    writeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },

    writeButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "600",
    },

    // Header Styles
    header: {
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      ...(!isDark
        ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
        : {}),
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      flex: 1,
      marginHorizontal: 16,
    },

    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },

    headerActionButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.background + "80",
      marginLeft: 8,
    },

    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.background + "80",
    },

    // Loading Styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },

    loadingSpinner: {
      marginBottom: 16,
    },

    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
    },

    // Content Styles
    content: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    imageSection: {
      backgroundColor: theme.card,
      paddingBottom: 16,
    },

    mainImageContainer: {
      width: width,
      height: width * 1.1,
      backgroundColor: theme.surface,
      position: "relative",
    },

    mainImage: {
      width: "100%",
      height: "100%",
    },

    zoomHint: {
      position: "absolute",
      bottom: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },

    zoomHintText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 10,
      marginLeft: 4,
    },

    placeholderMainImage: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderStyle: "dashed",
    },

    placeholderText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 8,
    },

    thumbnailContainer: {
      marginTop: 16,
    },

    thumbnailContent: {
      paddingHorizontal: 16,
      gap: 8,
    },

    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: theme.border,
      position: "relative",
    },

    thumbnailActive: {
      borderColor: theme.primary,
      borderWidth: 3,
    },

    thumbnailImage: {
      width: "100%",
      height: "100%",
    },

    thumbnailActiveIndicator: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: theme.primary,
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: "center",
      alignItems: "center",
    },

    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.95)",
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 16,
    },

    modalCloseButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.1)",
    },

    modalImageCounter: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },

    modalShareButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.1)",
    },

    modalImageContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    modalImage: {
      width: width,
      height: height * 0.7,
    },

    modalFooter: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      alignItems: "center",
    },

    modalZoomHint: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 12,
      textAlign: "center",
      fontStyle: "italic",
    },

    // Product Info Styles
    infoSection: {
      backgroundColor: theme.card,
      padding: 16,
      marginTop: 8,
    },

    productTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 12,
      lineHeight: 32,
    },

    categoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      marginBottom: 16,
    },

    categoryBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.primary,
      marginLeft: 4,
    },

    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    stars: {
      flexDirection: "row",
      marginRight: 8,
    },

    ratingText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },

    section: {
      marginTop: 24,
      marginBottom : 10,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },

    htmlContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },

    productInfoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },

    infoLabel: {
      fontSize: 12,
      color: theme.text,
      fontWeight: "500",
      marginLeft: 6,
    },

    // Not Found Styles
    notFoundContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },

    notFoundTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },

    notFoundText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    //loading
    loadingOuter: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    loadingMiddle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 6,
    },
    loadingSubtext: {
      fontSize: 14,
    },
  });
