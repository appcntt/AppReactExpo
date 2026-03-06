import { useBSCT } from "@/contexts/BsctContext";
import { useTheme } from "@/contexts/ThemeContext";
import { BSCT } from "@/types/bsct";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BSCTNewComponent() {
  const { getNewBSCTs } = useBSCT();
  const { theme, isDark } = useTheme();
  const [newPosts, setNewPosts] = useState<BSCT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getNewBSCTs(2);
        setNewPosts(data);
      } catch (error) {
        console.error("Error fetching BSCT posts:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = createStyles(theme, isDark);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hôm qua";
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Bác sĩ cây trồng</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      </View>
    );
  }

  if (newPosts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Bác sĩ cây trồng</Text>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={theme.textSecondary}
          />
          <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Bác sĩ cây trồng</Text>
        <TouchableOpacity onPress={() => router.push("/bsct")}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {newPosts.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => router.push(`/bsct/${item.id}`)}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri:
                item.imageUrl ||
                item.images ||
                "https://via.placeholder.com/400x220/e2e8f0/64748b?text=No+Image",
            }}
            style={styles.image}
            defaultSource={{
              uri: "https://via.placeholder.com/400x220/e2e8f0/64748b?text=Loading...",
            }}
          />
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text numberOfLines={3} style={styles.title}>
                {item.title}
              </Text>
            </View>

            {item.summary && (
              <Text numberOfLines={4} style={styles.summary}>
                {item.summary}
              </Text>
            )}

            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons
                  name="medical-outline"
                  size={14}
                  color={theme.primary}
                />
                <Text style={styles.categoryText}>Hướng dẫn kĩ thuật</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const { width } = Dimensions.get("window");

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: theme.background,
      paddingVertical: 8,
    },
    header: {
      top: -15,
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
    card: {
      width: "100%",
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 16,
      ...(!isDark
        ? {
            // Light theme shadow
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },

            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
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
            overflow: "hidden",
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          }),
    },
    image: {
      width: "100%",
      height: width * 0.6,
      backgroundColor: theme.surface,
    },
    content: {
      padding: 16,
    },
    titleContainer: {
      marginBottom: 12,
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.text,
      lineHeight: 24,
    },
    summary: {
      fontSize: 14,
      fontWeight: "400",
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    meta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    date: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    categoryText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "600",
    },
  });
