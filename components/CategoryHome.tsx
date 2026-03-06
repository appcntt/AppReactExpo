import { useTheme } from "@/contexts/ThemeContext";
import { BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Category = {
  id: string;
  name: string;
};

const getCategoryIcon = (
  categoryName: string,
): keyof typeof Ionicons.glyphMap => {
  const name = categoryName.toLowerCase();
  if (name.includes("rau") || name.includes("củ") || name.includes("thực phẩm"))
    return "leaf";
  if (name.includes("hạt") || name.includes("giống")) return "flower";
  if (name.includes("phân") || name.includes("bón")) return "nutrition";
  if (name.includes("thuốc") || name.includes("bảo vệ")) return "shield";
  if (name.includes("dụng cụ") || name.includes("công cụ")) return "build";
  if (name.includes("máy") || name.includes("thiết bị")) return "hardware-chip";
  return "cube-outline";
};

export default function CategoryForHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.log("Error fetching categories: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push(`/productbycategory/${item.id}`)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getCategoryIcon(item.name)}
          size={24}
          color={theme.primary}
        />
      </View>
      <Text style={styles.categoryLabel}>{item.name}</Text>
    </TouchableOpacity>
  );

  const styles = createStyles(theme, isDark);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
      {categories.length > 0 ? (
        <FlatList
          data={categories.slice(0, 6)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.categoriesGrid}
          renderItem={renderItem}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="apps-outline" size={48} color={theme.textSecondary} />
          <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      top: -15,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: 0.3,
      marginBottom: 12,
    },
    viewAllText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "600",
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 40,
      backgroundColor: theme.surface,
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
    categoriesGrid: {
      justifyContent: "space-between",
      marginBottom: 12,
    },
    categoryItem: {
      flex: 1,
      backgroundColor: theme.card,
      margin: 6,
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      minHeight: 110,
      justifyContent: "center",
      ...(!isDark
        ? {
            // Light theme shadow
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }
        : {
            // Dark theme border
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }),
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primary + "15", // 15% opacity
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      textAlign: "center",
      lineHeight: 18,
    },
  });
