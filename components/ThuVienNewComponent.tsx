import { useTheme } from "@/contexts/ThemeContext";
import { useThuVien } from "@/contexts/ThuVienContext";
import { ThuVien } from "@/types/thuvien";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

export default function ThuVienNewComponent() {
  const { getNewThuVien } = useThuVien();
  const { theme, isDark } = useTheme();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [newPosts, setNewPosts] = useState<ThuVien[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getNewThuVien(1); // lấy 1 video mới
        setNewPosts(data);
      } catch (error) {
        console.error("Error fetching ThuVien posts:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = createStyles(theme, isDark);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Thư viện video</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải video...</Text>
        </View>
      </View>
    );
  }

  if (newPosts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Thư viện video</Text>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="videocam-outline"
            size={48}
            color={theme.textSecondary}
          />
          <Text style={styles.emptyText}>Chưa có video nào</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Thư viện video</Text>
        <TouchableOpacity onPress={() => router.push("/thuviens")}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {newPosts.map((item) => (
        <View key={item.id || item.videoId} style={styles.listItem}>
          {/* Video Player Container */}
          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={220}
              play={playingVideo === item.videoId}
              videoId={item.videoId}
              onChangeState={(state: any) => {
                if (state === "ended") {
                  setPlayingVideo(null);
                } else if (state === "playing") {
                  setPlayingVideo(item.videoId);
                }
              }}
              webViewStyle={{
                backgroundColor: theme.surface,
              }}
            />
          </View>

          {/* Video Info */}
          <View style={styles.videoInfo}>
            <Text style={styles.itemTitle} numberOfLines={3}>
              {item.title}
            </Text>

            {item.categoryThuVien?.name && (
              <View style={styles.categoryContainer}>
                <Ionicons
                  name="library-outline"
                  size={12}
                  color={theme.primary}
                />
                <Text style={styles.itemCategory}>
                  {item.categoryThuVien.name}
                </Text>
              </View>
            )}

            {/* Video Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons
                  name="play-circle-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.statText}>Video</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.statText}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                    : "Không rõ"}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
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
    videoContainer: {
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: theme.surface,
      marginBottom: 12,
    },
    videoInfo: {
      paddingHorizontal: 4,
    },
    itemTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
      lineHeight: 24,
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary + "15", // 15% opacity
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginBottom: 12,
    },
    itemCategory: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "600",
      marginLeft: 4,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "500",
    },
  });
