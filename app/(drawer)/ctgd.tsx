import { useFavourite } from "@/contexts/FavouriteContext";
import { useProduct } from "@/contexts/ProductCTGDContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CTGD } from "@/types/ctgd";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScrollTabHide } from "./_layout";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32) / 2;

export default function ProductListScreen() {
  const {
    products,
    categories,
    loading,
    searchQuery,
    selectedCategory,
    totalProducts,
    setSearchQuery,
    setSelectedCategory,
  } = useProduct();

  const { theme, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { handleScroll } = useScrollTabHide();

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [isDark, theme]);

  const [tempSearchQuery, setTempSearchQuery] = useState<string>("");

  const handleCategorySelect = useCallback(
    (categoryCTGDId: string) => {
      if (selectedCategory !== categoryCTGDId) {
        setSelectedCategory(categoryCTGDId);
      }
    },
    [selectedCategory, setSelectedCategory],
  );

  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
  };

  const clearSearch = () => {
    setTempSearchQuery("");
    setSearchQuery("");
  };

  const CategoryTab = React.memo(
    ({
      categoryctgd,
      isSelected,
      onPress,
    }: {
      categoryctgd: any;
      isSelected: boolean;
      onPress: () => void;
    }) => {
      const styles = createStyles(theme, isDark);

      return (
        <TouchableOpacity
          onPress={onPress}
          style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.categoryTabText,
              isSelected && styles.categoryTabTextActive,
            ]}
          >
            {categoryctgd.name}
          </Text>
        </TouchableOpacity>
      );
    },
  );

  const renderSearchBar = () => {
    const styles = createStyles(theme, isDark);

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            value={tempSearchQuery}
            onChangeText={setTempSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={theme.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
            multiline={false}
          />
          {tempSearchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategoryTabs = useCallback(() => {
    const styles = createStyles(theme, isDark);

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map((categoryctgd) => (
          <CategoryTab
            key={categoryctgd.id}
            categoryctgd={categoryctgd}
            isSelected={selectedCategory === categoryctgd.id}
            onPress={() => handleCategorySelect(categoryctgd.id)}
          />
        ))}
      </ScrollView>
    );
  }, [categories, selectedCategory, handleCategorySelect, theme, isDark]);

  const renderSearchInfo = useCallback(() => {
    if (!searchQuery) return null;

    const styles = createStyles(theme, isDark);

    return (
      <View style={styles.searchInfo}>
        <Text style={styles.searchInfoText}>
          Tìm kiếm cho từ khoá: "{searchQuery}"
        </Text>
        <Text style={styles.searchInfoCount}>
          {totalProducts} sản phẩm được tìm thấy
        </Text>
      </View>
    );
  }, [searchQuery, totalProducts, theme, isDark]);

  const ProductCard = React.memo(({ item }: { item: CTGD }) => {
    const { toggleFavourite, favourites } = useFavourite();
    const [localFavouriteState, setLocalFavouriteState] = useState<
      boolean | null
    >(null);
    const styles = createStyles(theme, isDark);

    const isFavouriteFromContext = useMemo(() => {
      return favourites.some((fav) => fav.id === item.id);
    }, [favourites, item.id]);

    const isFavourite =
      localFavouriteState !== null
        ? localFavouriteState
        : isFavouriteFromContext;

    useEffect(() => {
      setLocalFavouriteState(null);
    }, [favourites]);

    const firstImage = useMemo(() => {
      if (!Array.isArray(item.images) || item.images.length === 0) return null;
      const img = item.images[0];
      if (typeof img === "string") return img;
      return img.imageUrl || img.url || null;
    }, [item.images]);


    const handleProductPress = useCallback(() => {
      router.push(`/ctgd/${item.id}`);
    }, [item.id]);

    const handleFavoritePress = useCallback(async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("user");

        if (!token && !userData) {
          router.push("/(auth)/login");
          return;
        }

        const newFavouriteState = !isFavourite;
        setLocalFavouriteState(newFavouriteState);

        await toggleFavourite(item.id, "ProductConTrungGiaDung");

        setTimeout(() => {
          setLocalFavouriteState(null);
        }, 100);
      } catch (error) {
        console.error("Error toggling favourite:", error);
        setLocalFavouriteState(null);
      }
    }, [item.id, toggleFavourite, isFavourite]);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handleProductPress}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons
                name="image-outline"
                size={32}
                color={theme.textSecondary}
              />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          {item.isMoi && (
            <Animated.View
              style={[styles.newBadge, { transform: [{ scale: scaleAnim }] }]}
            >
              <Text style={styles.newText}>MỚI</Text>
            </Animated.View>
          )}
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={[
              styles.favoriteButton,
              isFavourite && styles.favoriteButtonActive,
            ]}
          >
            <Ionicons
              name={isFavourite ? "heart" : "heart-outline"}
              size={16}
              color={isFavourite ? "white" : theme.textSecondary}
            />
          </TouchableOpacity>

          {item.average_rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={styles.ratingText}>{item.average_rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          {item.categoryctgd && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {item.categoryctgd.name}
              </Text>
            </View>
          )}
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });

  const renderProductCard = useCallback(
    ({ item }: { item: CTGD }) => <ProductCard item={item} />,
    [theme, isDark],
  );

  const renderEmptyState = useCallback(() => {
    const styles = createStyles(theme, isDark);

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={64} color={theme.textSecondary} />
        <Text style={styles.emptyStateTitle}>Không tìm thấy sản phẩm</Text>
        <Text style={styles.emptyStateText}>
          {searchQuery
            ? `Không tìm thấy sản phẩm cho "${searchQuery}"`
            : "Không có sản phẩm nào trong danh mục này"}
        </Text>
      </View>
    );
  }, [searchQuery, theme, isDark]);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: CARD_WIDTH * 1.2 + 32,
      offset: (CARD_WIDTH * 1.2 + 32) * Math.floor(index / 2),
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: CTGD) => item.id, []);

  const styles = createStyles(theme, isDark);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />
        <View style={styles.headerWrapper}>
          {renderSearchBar()}
          {renderCategoryTabs()}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: 0 }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <View style={styles.headerWrapper}>
        {renderSearchBar()}
        {renderCategoryTabs()}
        {renderSearchInfo()}
      </View>
      <FlatList
        key={`${refreshKey}-${isDark}-${theme.card}`}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        data={products}
        renderItem={renderProductCard}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={renderEmptyState}
        getItemLayout={getItemLayout}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
        style={[{ flex: 1 }, { backgroundColor: theme.background }]}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    headerWrapper: {
      backgroundColor: theme.surface,
      marginTop: Platform.OS === 'ios' ? -55 : -25,
      ...(!isDark
        ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }
        : {
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }),
    },

    // Search Styles
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.surface,
    },

    searchInputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 25,
      paddingHorizontal: 16,
      height: 40,
      ...(!isDark
        ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }
        : {
          borderWidth: 1,
          borderColor: theme.border,
        }),
    },

    searchIcon: {
      marginRight: 8,
    },

    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },

    clearButton: {
      padding: 4,
    },

    searchButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      height: 40,
      justifyContent: "center",
    },

    searchButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },

    // Category Styles
    categoryContainer: {
      backgroundColor: theme.card,
      maxHeight: 60,
      minHeight: 60,
    },

    categoryContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },

    categoryTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },

    categoryTabActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },

    categoryTabText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
    },

    categoryTabTextActive: {
      color: "white",
    },

    // Search Info
    searchInfo: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.card,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.border,
      minHeight: 48,
    },

    searchInfoText: {
      fontSize: 14,
      color: theme.textSecondary,
    },

    searchInfoCount: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },

    // List Styles
    listContainer: {
      padding: 12,
      paddingBottom: 20,
    },

    row: {
      justifyContent: "space-between",
    },

    // Card Styles
    card: {
      width: CARD_WIDTH,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 15,
      ...(!isDark
        ? {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        }
        : {
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        }),
      marginBottom: 4,
    },

    imageContainer: {
      position: "relative",
      height: CARD_WIDTH * 1.2,
      backgroundColor: theme.surface,
      borderRadius: 8,
      overflow: "hidden",
    },

    productImage: {
      width: "100%",
      height: "100%",
    },

    placeholderImage: {
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
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "500",
      marginTop: 4,
    },

    newBadge: {
      position: "absolute",
      top: -8,
      left: -8,
      backgroundColor: theme.error,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      borderWidth: 2,
      borderColor: theme.card,
    },

    newText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    favoriteButton: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    favoriteButtonActive: {
      backgroundColor: theme.error,
    },

    ratingBadge: {
      position: "absolute",
      bottom: 8,
      left: 8,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
      gap: 2,
    },

    ratingText: {
      color: "white",
      fontSize: 12,
      fontWeight: "500",
    },

    cardContent: {
      alignItems: "center",
      paddingTop: 10,
    },

    productName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      textAlign: "center",
    },

    categoryBadge: {
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 8,
      alignItems: "center",
    },

    categoryBadgeText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.primary,
      alignItems: "center",
    },

    // Loading Styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },

    // Empty State
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },

    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },

    emptyStateText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      paddingHorizontal: 32,
    },
  });
