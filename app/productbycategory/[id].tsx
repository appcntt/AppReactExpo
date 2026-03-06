// app/productbycategory/[id].tsx
import { useFavourite } from '@/contexts/FavouriteContext';
import { Colors, useTheme } from '@/contexts/ThemeContext';
import { BASE_URL } from '@env';
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProductImage = {
    productId: number;
    imageType: string;
    imageName: string;
    imageSize: number;
    imageUrl: string | null;
    url?: string;
}

type Product = {
    id: string;
    name: string;
    images: ProductImage[];
    isMoi: boolean;
    isActive: boolean;
};

interface ProductCardProps {
    item: Product;
    index: number;
    theme: Colors;
    toggleFavourite: (id: string, type: "Product" | "ProductNongNghiepDoThi" | "ProductConTrungGiaDung") => Promise<any>;
    isFavourite: (id: string) => boolean;
    router: ReturnType<typeof useRouter>;
}

export default function ProductByCategoryScreen() {
    const { theme, isDark } = useTheme();
    const { toggleFavourite, isFavourite } = useFavourite();
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const styles = useMemo(() => createStyles(theme), [theme]);

    const fetchProducts = async () => {
        try {
            if (!refreshing) setLoading(true);
            const res = await fetch(`${BASE_URL}/product/category/${id}?search=${search}`);
            const data = await res.json();
            setProducts(data.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [id]);


    const filteredBSCTs = useMemo(() =>
        products.filter((b) =>
            b.name.toLowerCase().includes(search.toLowerCase().trim())
        ),
        [products, search, theme, isDark]
    )


    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    };

    const ProductCard = ({ item, index, theme, toggleFavourite, isFavourite, router }: ProductCardProps) => {
        const styles = useMemo(() => createStyles(theme), [theme]);

        const firstImage = useMemo(() => {
            if (!Array.isArray(item.images) || item.images.length === 0) return null;
            const img = item.images[0];
            if (typeof img === "string") return img;
            return img.imageUrl || img.url || null;
        }, [item.images]);

        return (
            <TouchableOpacity
                style={[styles.card, { marginLeft: index % 2 === 0 ? 0 : 8 }]}
                onPress={() => router.push(`/product/${item.id}`)}
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

                    {/* Gradient overlay */}
                    <View style={styles.imageOverlay} />

                    {/* Badge Mới */}
                    {item.isMoi && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>MỚI</Text>
                        </View>
                    )}

                    {/* Heart button */}
                    <TouchableOpacity
                        onPress={async () => {
                            try {
                                await toggleFavourite(item.id, "Product")
                                router.push('/(drawer)/(tabs)/favourite')
                            } catch (error) {
                                console.log("Toggle failed", error)
                            }
                        }}
                        style={[
                            styles.favoriteButton,
                            isFavourite(item.id) && styles.favoriteButtonActive
                        ]}
                    >
                        <Ionicons
                            name={isFavourite(item.id) ? "heart" : "heart-outline"}
                            size={16}
                            color={isFavourite(item.id) ? "white" : theme.error}
                        />
                    </TouchableOpacity>
                </View>

                {/* Product info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item, index }: { item: Product; index: number }) => {
        // const styles = createStyles(theme);
        // const handleProductPress = () => {
        //     router.push(`/product/${item.id}`);
        // };

        return (
            <ProductCard
                item={item}
                index={index}
                theme={theme}
                toggleFavourite={toggleFavourite}
                isFavourite={isFavourite}
                router={router}
            />
        );
    };

    const renderEmptyState = () => {
        const styles = createStyles(theme);
        return (
            <View style={styles.emptyContainer}>
                <AntDesign name="inbox" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
                <Text style={styles.emptySubText}>Hãy thử tìm kiếm với từ khóa khác</Text>
            </View>
        )
    };

    if (loading) {
        const styles = createStyles(theme);
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle={isDark ? "light-content" : "dark-content"}
                    backgroundColor={theme.background}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
            </SafeAreaView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={theme.background}
                translucent={false}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sản phẩm</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <TextInput
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                        placeholderTextColor={theme.textSecondary}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <AntDesign name="close" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Products grid */}
            <FlatList
                data={filteredBSCTs}
                keyExtractor={(item) => `${item.id}-${isDark}`}
                extraData={isDark}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                columnWrapperStyle={styles.row}
            />
        </SafeAreaView>
    );
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 32) / 2;

const createStyles = (theme: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    //images
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

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.textSecondary,
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        elevation: 2,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.text,
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },

    // Search
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.surface,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: theme.border,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: theme.text,
        marginLeft: 10,
    },

    // Grid
    gridContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    // Product card
    card: {
        width: CARD_WIDTH,
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 15,
        shadowColor: theme.text,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: theme.border,
    },

    imageContainer: {
        position: 'relative',
        height: height * 0.25,
        borderRadius: 12,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.surface,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
    },

    // Badges and buttons
    newBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: theme.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        elevation: 2,
        shadowColor: theme.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 8,
        elevation: 2,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: theme.border,
    },

    favoriteButtonActive: {
        backgroundColor: theme.error,
        borderColor: theme.error,
    },

    // Product info
    productInfo: {
        padding: 12,
        alignItems: 'center'
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
        lineHeight: 18,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
});