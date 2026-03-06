import { useTheme } from "@/contexts/ThemeContext";
import { useThuVien } from "@/contexts/ThuVienContext";
import { apiCall } from "@/utils/apiCall";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

interface CategoryThuVien {
  id: string;
  name: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32) / 2;

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

export default function ThuVienScreen() {
  const { thuviens, fetchThuVien, error, loading } = useThuVien();
  const { theme, isDark } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState<CategoryThuVien[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [refreshing, setRefreshing] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, data } = await apiCall<any>({
        endpoint: "/catthuvien",
        method: "GET",
        requireAuth: false,
      });
      if (success) {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data?.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (data?.data && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      }
    };
    fetchCategories();
  }, []);

  const filteredThuVien = thuviens
    .filter((b) =>
      b.title.toLowerCase().includes(searchText.toLowerCase().trim()),
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchThuVien(selectedCategory || undefined);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory, fetchThuVien]);

  const getSelectedCategoryText = () => {
    if (!selectedCategory) return "Tất cả danh mục";
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.name || "Tất cả danh mục";
  };

  const getSelectedSortText = () => {
    const sortOption = sortOptions.find((option) => option.value === sortOrder);
    return sortOption?.label || "Mới nhất";
  };

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bài viết..."
          placeholderTextColor={theme.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Danh mục</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {getSelectedCategoryText()}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.textSecondary}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Sắp xếp</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {getSelectedSortText()}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.textSecondary}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn danh mục</Text>
            </View>

            <View style={styles.optionsContainer}>
              <FlatList
                data={[{ id: "", name: "Tất cả danh mục" }, ...categories]}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      index === categories.length && styles.lastOptionItem,
                    ]}
                    onPress={async () => {
                      setSelectedCategory(item.id);
                      setShowCategoryModal(false);
                      await fetchThuVien(item.id || undefined);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedCategory === item.id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selectedCategory === item.id && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sắp xếp theo</Text>
            </View>

            <View style={styles.optionsContainer}>
              <FlatList
                data={sortOptions}
                keyExtractor={(item) => item.value}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      index === sortOptions.length - 1 && styles.lastOptionItem,
                    ]}
                    onPress={() => {
                      setSortOrder(item.value as "newest" | "oldest");
                      setShowSortModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        sortOrder === item.value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {sortOrder === item.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Loading indicator */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      )}

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Video List */}
      <FlatList
        data={filteredThuVien}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
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
            />
            <View style={styles.videoInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemCategory}>
                {item.categoryThuVien?.name || "Không có danh mục"}
              </Text>
            </View>
          </View>
        )}
        // ListEmptyComponent={
        //     !loading && (
        //         <View style={styles.emptyContainer}>
        //             <Ionicons name="videocam-outline" size={64} color={theme.textSecondary} />
        //             <Text style={styles.emptyText}>
        //                 Không có video nào được tìm thấy
        //             </Text>
        //         </View>
        //     )
        // }
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    // Search Box Styles
    searchContainer: {
      position: "relative",
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingLeft: 45,
      fontSize: 16,
      color: theme.text,
      ...(!isDark
        ? {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }
        : {
            borderWidth: 1,
            borderColor: theme.border,
          }),
    },
    searchIcon: {
      position: "absolute",
      left: 13,
      top: 12,
      zIndex: 1,
    },

    // Filters Row
    filtersRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    filterContainer: {
      flex: 1,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 6,
    },

    // Custom Dropdown Styles
    dropdownButton: {
      backgroundColor: theme.card,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      ...(!isDark
        ? {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.08,
            shadowRadius: 2.84,
            elevation: 3,
          }
        : {
            borderWidth: 1,
            borderColor: theme.border,
          }),
    },
    dropdownButtonText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    dropdownIcon: {
      marginLeft: 8,
    },

    // Modal Dropdown Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      width: "80%",
      maxHeight: "60%",
      ...(!isDark
        ? {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 5.84,
            elevation: 10,
          }
        : {
            borderWidth: 1,
            borderColor: theme.border,
          }),
    },
    modalHeader: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    optionItem: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    optionText: {
      fontSize: 16,
      color: theme.text,
    },
    selectedOptionText: {
      color: theme.primary,
      fontWeight: "600",
    },

    // List Item Styles
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      marginHorizontal: 2,
      ...(!isDark
        ? {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 12,
          }
        : {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 10,
            borderWidth: 0.5,
            borderColor: theme.border + "40",
          }),
    },
    videoInfo: {
      padding: 8,
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
      lineHeight: 24,
    },
    itemCategory: {
      fontSize: 14,
      color: theme.textSecondary,
      backgroundColor: theme.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
    },

    // Loading & Error Styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 50,
    },
    loadingText: {
      marginTop: 10,
      color: theme.textSecondary,
      fontSize: 16,
    },
    errorText: {
      color: theme.error,
      fontSize: 16,
      textAlign: "center",
      marginBottom: 16,
      backgroundColor: isDark ? theme.error + "20" : "#fef2f2",
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: theme.error,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 50,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 16,
      color: theme.textSecondary,
      fontSize: 16,
    },

    // iOS Modal Styles
    modalHandle: {
      width: 36,
      height: 5,
      backgroundColor: theme.textSecondary,
      borderRadius: 3,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 8,
    },
    optionsContainer: {
      backgroundColor: theme.surface,
      marginHorizontal: 16,
      borderRadius: 12,
      marginTop: 8,
      overflow: "hidden",
    },
    lastOptionItem: {
      borderBottomWidth: 0,
    },
    cancelButton: {
      backgroundColor: theme.surface,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.primary,
    },
  });
