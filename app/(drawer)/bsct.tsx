import { useBSCT } from "@/contexts/BsctContext";
import { useTheme } from "@/contexts/ThemeContext";
import { apiCall } from "@/utils/apiCall";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CategoryBSCT {
  id: string;
  name: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32) / 2;

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

export default function BSCTScreen() {
  const { bscts, loading, error, fetchBSCTs } = useBSCT();
  const { theme, isDark } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState<CategoryBSCT[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, data } = await apiCall<CategoryBSCT[]>({
        endpoint: "/categoriesBSCT",
        method: "GET",
        requireAuth: false,
      });
      if (success && Array.isArray((data as any)?.data)) {
        setCategories((data as any).data.map((item: any) => ({
          ...item,
          id: String(item.id),
        })));
      }
    };
    fetchCategories();
  }, []);

  const filteredBSCTs = bscts
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
      await fetchBSCTs(selectedCategory || undefined);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory, fetchBSCTs]);

  const getSelectedCategoryText = () => {
    if (!selectedCategory) return "Tất cả danh mục";
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.name || "Tất cả danh mục";
  };

  const getSelectedSortText = () => {
    const sortOption = sortOptions.find((option) => option.value === sortOrder);
    return sortOption?.label || "Mới nhất";
  };

  const handleBlogPress = useCallback(
    (blogId: string) => {
      router.push(`/bsct/${blogId}`);
    },
    [router],
  );

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
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
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters Row */}
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
                      await fetchBSCTs(item.id || undefined);
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
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Blog List */}
      <FlatList
        data={filteredBSCTs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.card}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => handleBlogPress(item.id)}
            activeOpacity={0.7}
          >
            {(item.imageUrl || item.images) && (
              <Image
                source={{ uri: item.imageUrl || item.images }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={3}>
                {item.title}
              </Text>

              {item.categoryBSCT?.name && (
                <View style={styles.categoryContainer}>
                  <Ionicons
                    name="medical-outline"
                    size={12}
                    color={theme.primary}
                  />
                  <Text style={styles.itemCategory}>
                    {item.categoryBSCT.name}
                  </Text>
                </View>
              )}

              {item.summary && (
                <Text style={styles.itemSummary} numberOfLines={4}>
                  {item.summary}
                </Text>
              )}

              <View style={styles.itemMeta}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.itemDate}>
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        // ListEmptyComponent={
        //   !loading && (
        //     <View style={styles.emptyContainer}>
        //       <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
        //       <Text style={styles.emptyText}>
        //         Không có bài viết nào được tìm thấy
        //       </Text>
        //     </View>
        //   )
        // }
        contentContainerStyle={
          filteredBSCTs.length === 0 ? { flex: 1 } : undefined
        }
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

    // Search Styles
    searchContainer: {
      marginBottom: 16,
    },
    
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      ...(!isDark
        ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
        : {
          borderWidth: 1,
          borderColor: theme.border,
        }),
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    clearButton: {
      padding: 4,
    },

    // Filter Styles
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
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
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

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
      paddingBottom: 40,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "60%",
    },
    modalHandle: {
      width: 36,
      height: 5,
      backgroundColor: theme.textSecondary,
      borderRadius: 3,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 8,
    },
    modalHeader: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      textAlign: "center",
    },
    optionsContainer: {
      backgroundColor: theme.card,
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
    lastOptionItem: {
      borderBottomWidth: 0,
    },
    optionText: {
      fontSize: 16,
      color: theme.text,
    },
    selectedOptionText: {
      color: theme.primary,
      fontWeight: "600",
    },
    cancelButton: {
      backgroundColor: theme.surface,
      marginTop: 1,
      paddingVertical: 16,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.primary,
    },

    // List Item Styles
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 16,
      marginHorizontal: 2,
      ...(!isDark
        ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }
        : {
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: "#000",
          overflow: "hidden",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }),
    },
    itemImage: {
      width: "100%",
      height: CARD_WIDTH * 1.2,
      backgroundColor: theme.surface,
    },
    itemContent: {
      padding: 16,
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
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
      marginBottom: 8,
    },
    itemCategory: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "600",
      marginLeft: 4,
    },
    itemSummary: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    itemMeta: {
      flexDirection: "row",
      alignItems: "center",
    },
    itemDate: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
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
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.error + "15",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.error,
    },
    errorText: {
      color: theme.error,
      fontSize: 14,
      marginLeft: 8,
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 16,
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: "500",
    },
  });
