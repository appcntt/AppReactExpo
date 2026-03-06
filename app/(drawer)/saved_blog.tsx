import { useBSCT } from '@/contexts/BsctContext';
import { Colors, useTheme } from '@/contexts/ThemeContext';
import { BSCT } from '@/types/bsct';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookmarksScreen() {
    const { theme } = useTheme();
    const { bookmarks, bookmarksLoading, clearAllBookmarks, toggleBookmark, fetchBookmarks } = useBSCT();
    const navigation = useNavigation<any>();
    const styles = createStyles(theme);
    const [clearModal, setClearModal] = useState(false);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('vi-VN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

    const renderItem = ({ item }: { item: BSCT }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/bsct/${item.id}`)}
            activeOpacity={0.85}
        >
            {/* Image */}
            <View style={styles.cardImageWrapper}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.cardImagePlaceholder}>
                        <Ionicons name="newspaper-outline" size={28} color={theme.textSecondary} />
                    </View>
                )}
                {item.categoryBSCT && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText} numberOfLines={1}>
                            {item.categoryBSCT.name}
                        </Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.summary && (
                    <Text style={styles.cardSummary} numberOfLines={2}>
                        {item.summary}
                    </Text>
                )}
                <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="bookmark" size={13} color={theme.primary} />
                        <Text style={styles.metaText}>
                            {item.bookmarkedAt ? formatDate(item.bookmarkedAt) : ''}
                        </Text>
                    </View>
                    <View style={styles.metaRight}>
                        {item.viewCount !== undefined && (
                            <View style={styles.metaItem}>
                                <Ionicons name="eye-outline" size={13} color={theme.textSecondary} />
                                <Text style={styles.metaText}>{item.viewCount}</Text>
                            </View>
                        )}
                        {item.likeCount !== undefined && (
                            <View style={styles.metaItem}>
                                <Ionicons name="heart-outline" size={13} color={theme.textSecondary} />
                                <Text style={styles.metaText}>{item.likeCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Remove button */}
            <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => toggleBookmark(String(item.id))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="bookmark" size={22} color={theme.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.empty}>
            <View style={styles.emptyIconWrapper}>
                <Ionicons name="bookmark-outline" size={56} color={theme.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
            <Text style={styles.emptyDesc}>
                Nhấn vào biểu tượng bookmark khi đọc bài để lưu lại
            </Text>
            <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push('/(drawer)/bsct')}
            >
                <Ionicons name="newspaper-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.exploreBtnText}>Khám phá bài viết</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            {/* <View style={styles.header}>

                {bookmarks.length > 0 ? (
                    <TouchableOpacity
                        style={styles.trashButton}
                        onPress={() => setClearModal(true)}
                    >
                        <Ionicons name="trash-outline" size={22} color={theme.error} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View> */}
            {bookmarksLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            ) : (
                <FlatList
                    data={bookmarks}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={[
                        styles.list,
                        bookmarks.length === 0 && styles.listEmpty
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    onRefresh={fetchBookmarks}
                    refreshing={bookmarksLoading}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
            )}

            {/* Clear All Modal */}
            <Modal visible={clearModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalIcon}>
                            <Ionicons name="trash-outline" size={32} color={theme.error} />
                        </View>
                        <Text style={styles.modalTitle}>Xóa tất cả?</Text>
                        <Text style={styles.modalDesc}>
                            Tất cả bài viết đã lưu sẽ bị xóa. Bạn không thể hoàn tác thao tác này.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancel}
                                onPress={() => setClearModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirm}
                                onPress={async () => {
                                    await clearAllBookmarks();
                                    setClearModal(false);
                                }}
                            >
                                <Ionicons name="trash-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={styles.modalConfirmText}>Xóa hết</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (theme: Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: theme.surface,
        borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    menuButton: { padding: 4, width: 40 },
    headerCenter: {
        flex: 1, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    countBadge: {
        backgroundColor: theme.primary,
        borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
    },
    countBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    trashButton: { padding: 4, width: 40, alignItems: 'flex-end' },

    // List
    list: { padding: 16 },
    listEmpty: { flex: 1 },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: theme.card,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
        borderWidth: 1, borderColor: theme.border,
    },
    cardImageWrapper: { width: 110, position: 'relative' },
    cardImage: { width: '100%', height: '100%', minHeight: 120 },
    cardImagePlaceholder: {
        width: '100%', minHeight: 120,
        backgroundColor: theme.surface,
        justifyContent: 'center', alignItems: 'center',
    },
    categoryBadge: {
        position: 'absolute', bottom: 6, left: 6,
        backgroundColor: theme.primary + 'CC',
        paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 8, maxWidth: 98,
    },
    categoryText: { fontSize: 10, fontWeight: '600', color: '#fff' },

    cardContent: {
        flex: 1, padding: 12,
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 15, fontWeight: '700',
        color: theme.text, lineHeight: 22, marginBottom: 4,
    },
    cardSummary: {
        fontSize: 13, color: theme.textSecondary,
        lineHeight: 18, marginBottom: 8,
    },
    cardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaRight: { flexDirection: 'row', gap: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: theme.textSecondary },

    removeBtn: {
        padding: 12,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    // Empty
    empty: {
        flex: 1, justifyContent: 'center',
        alignItems: 'center', paddingHorizontal: 40,
    },
    emptyIconWrapper: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: theme.surface,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2, borderColor: theme.border,
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 20, fontWeight: '700',
        color: theme.text, marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 15, color: theme.textSecondary,
        textAlign: 'center', lineHeight: 22, marginBottom: 28,
    },
    exploreBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.primary,
        paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: 24,
    },
    exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    // Loading
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    loadingText: {
        marginTop: 12, fontSize: 16, color: theme.textSecondary,
    },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalBox: {
        backgroundColor: theme.card, borderRadius: 20,
        padding: 24, width: '100%', alignItems: 'center',
    },
    modalIcon: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: theme.error + '15',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18, fontWeight: '700',
        color: theme.text, marginBottom: 8,
    },
    modalDesc: {
        fontSize: 14, color: theme.textSecondary,
        textAlign: 'center', lineHeight: 20, marginBottom: 24,
    },
    modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    modalCancel: {
        flex: 1, paddingVertical: 13, borderRadius: 12,
        borderWidth: 1.5, borderColor: theme.border,
        backgroundColor: theme.surface, alignItems: 'center',
    },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: theme.text },
    modalConfirm: {
        flex: 1, paddingVertical: 13, borderRadius: 12,
        backgroundColor: theme.error, alignItems: 'center',
        flexDirection: 'row', justifyContent: 'center',
    },
    modalConfirmText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});