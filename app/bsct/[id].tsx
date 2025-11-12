// app/bsct/[id].tsx
import HtmlDescription from "@/components/HtmlDescription";
import { Colors, useTheme } from '@/contexts/ThemeContext';
import { BSCT } from "@/types/bsct";
import { apiCall } from "@/utils/apiCall";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get('window');

interface BSCTDetailProps {
    // Có thể thêm props nếu cần
}

export default function BSCTDetailScreen({ }: BSCTDetailProps) {
    const { theme, isDark } = useTheme();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [bsct, setBsct] = useState<BSCT | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);

    const styles = createStyles(theme);

    const fetchBSCTDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const { success, data, error: apiError } = await apiCall<BSCT>({
                endpoint: `/bsct/${id}`,
                method: 'GET',
                requireAuth: false,
            });

            if (success && data) {
                setBsct(data);
            } else {
                setError(apiError || "Không thể tải thông tin blog");
            }
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBSCTDetail();
        }
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = async () => {
        try {
            if (bsct) {
                await Share.share({
                    message: `${bsct.title}\n\nĐọc thêm tại app của chúng tôi!`,
                    title: bsct.title,
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        // TODO: Call API to like/unlike
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    if (error || !bsct) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={theme.textSecondary} />
                <Text style={styles.errorText}>
                    {error || "Không tìm thấy blog này"}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchBSCTDetail}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Header Image */}
            <View style={styles.headerImage}>
                {bsct.images && (
                    <Image
                        source={{ uri: bsct.images }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.imageOverlay} />

                {/* Header Actions */}
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <View style={styles.headerActionsRight}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Ionicons name="share-outline" size={20} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="bookmark-outline" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* Category & Date */}
                <View style={styles.categoryContainer}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                            {bsct.categoryBSCT?.name || 'Không có danh mục'}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{bsct.title}</Text>

                {/* Author Section */}
                <View style={styles.authorSection}>
                    <View style={styles.authorAvatar}>
                        <Ionicons name="person" size={20} color={theme.primary} />
                    </View>
                    <View style={styles.authorInfo}>
                        <Text style={styles.publishDate}>
                            Đăng ngày {formatDate(bsct.createdAt)}
                        </Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>2.1K</Text>
                            <Text style={styles.statLabel}>Lượt xem</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>45</Text>
                            <Text style={styles.statLabel}>Lượt thích</Text>
                        </View>
                    </View>
                </View>

                {/* Content */}
                {bsct.description && (
                    <View style={styles.contentBody}>
                        <HtmlDescription
                            htmlContent={bsct.description}
                            containerStyle={styles.htmlContainer}
                        />
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const createStyles = (theme: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },

    // Header & Image Styles
    headerImage: {
        width: '100%',
        height: width * 0.65,
        position: 'relative',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    headerActions: {
        position: 'absolute',
        top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.card,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.border,
    },
    headerActionsRight: {
        flexDirection: 'row',
        gap: 12,
    },

    // Content Styles
    contentContainer: {
        flex: 1,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: theme.background,
        paddingHorizontal: 20,
        paddingTop: 30,
    },

    // Category & Meta Info
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: theme.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 12,
    },
    categoryText: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    dateText: {
        color: theme.textSecondary,
        fontSize: 14,
    },

    // Title & Content
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.text,
        lineHeight: 36,
        marginBottom: 20,
    },

    // Author & Stats
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.border,
        marginBottom: 24,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
    },
    publishDate: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.primary,
    },
    statLabel: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 2,
    },

    // Content Body
    contentBody: {
        lineHeight: 26,
        fontSize: 16,
        color: theme.text,
        marginBottom: 30,
    },

    // Loading & Error
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
    loadingText: {
        marginTop: 16,
        color: theme.textSecondary,
    },
    htmlContainer: {
        borderRadius: 12,
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: theme.background,
    },
    errorText: {
        fontSize: 18,
        color: theme.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 16,
    },
    retryButton: {
        backgroundColor: theme.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: theme.headerText,
        fontSize: 16,
        fontWeight: '600',
    },

    // Action Buttons
    actionBar: {
        flexDirection: 'row',
        paddingHorizontal: 150,
        paddingVertical: 16,
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        gap: 12,
        marginBottom: 8,
    },
    actionBarButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    likeButton: {
        borderColor: theme.error,
        backgroundColor: theme.error + '10',
    },
    likeButtonActive: {
        backgroundColor: theme.error,
        borderColor: theme.error,
    },
    shareButton: {
        borderColor: theme.primary,
        backgroundColor: theme.primary + '10',
    },
    actionButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    likeButtonText: {
        color: theme.error,
    },
    likeButtonTextActive: {
        color: '#ffffff',
    },
    shareButtonText: {
        color: theme.primary,
    },
});