import { useProduct } from "@/contexts/ProductContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductNewComponent() {
  const { newProducts, newProductsLoading, loadNewProducts } = useProduct();

  const { theme, isDark } = useTheme();

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [isDark, theme]);

  const ProductCard = React.memo(
    ({
      item,
      theme,
      isDark,
    }: {
      item: Product;
      theme: any;
      isDark: boolean;
    }) => {
      const [showNewBadge, setShowNewBadge] = useState(false);
      const firstImage = useMemo(() => {
        if (!Array.isArray(item.images) || item.images.length === 0) return null;
        const img = item.images[0];
        if (typeof img === "string") return img;
        return img.imageUrl || img.url || null;
      }, [item.images]);

      const handleProductPress = useCallback(() => {
        router.push(`/product/${item.id}`);
      }, [item.id]);

      useEffect(() => {
        if (item.isMoi) {
          setShowNewBadge(true);
          const timer = setTimeout(() => {
            setShowNewBadge(false);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }, [item.isMoi]);

      return (
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => handleProductPress()}
          activeOpacity={0.8}
        >
          <View style={styles.productImageContainer}>
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
            {item.isMoi && showNewBadge && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>MỚI</Text>
              </View>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
  );

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard item={item} theme={theme} isDark={isDark} />
    ),
    [theme, isDark],
  );

  useEffect(() => {
    if (newProducts.length === 0 && !newProductsLoading) {
      loadNewProducts(2);
    }
  }, []);

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.productsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sản Phẩm Mới</Text>
        <TouchableOpacity></TouchableOpacity>
      </View>

      {newProductsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm mới...</Text>
        </View>
      ) : newProducts.length > 0 ? (
        <FlatList
          key={`${refreshKey}-${isDark}-${theme.card}`}
          data={newProducts.slice(0, 2)}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          ItemSeparatorComponent={() => (
            <View style={styles.productSeparator} />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="storefront-outline"
            size={48}
            color={theme.textSecondary}
          />
          <Text style={styles.emptyText}>Chưa có sản phẩm mới</Text>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    productsSection: {
      marginTop: 20,
      paddingBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: 0.3,
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 40,
      backgroundColor: theme.surface,
      marginHorizontal: 20,
      borderRadius: 12,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 50,
      backgroundColor: theme.surface,
      marginHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 12,
      fontWeight: "500",
    },
    productsList: {
      paddingHorizontal: 10,
    },
    productSeparator: {
      width: 15,
    },
    productCard: {
      width: width * 0.46,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 15,
      ...(!isDark
        ? {
          // Light theme shadow
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
          // Dark theme border
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
    productImageContainer: {
      position: "relative",
      marginBottom: 10,
    },
    productImage: {
      width: "100%",
      height: height * 0.25,
      borderRadius: 8,
      backgroundColor: theme.surface,
    },
    placeholderImage: {
      width: "100%",
      height: height * 0.25,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      borderStyle: "dashed",
    },
    placeholderText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "500",
      marginTop: 8,
    },
    newBadge: {
      position: "absolute",
      top: -8,
      left: -8,
      backgroundColor: theme.error,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      borderWidth: 2,
      borderColor: theme.card,
    },
    newBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    productInfo: {
      alignItems: "center",
    },
    productName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      lineHeight: 20,
      textAlign: "center",
    },
    viewAllText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "600",
    },
  });
