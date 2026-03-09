import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import HtmlDescription from '@/components/HtmlDescription';
import { useProduct } from '@/contexts/ProductCTGDContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getProduct } = useProduct();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const { theme, isDark } = useTheme();
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setProduct(null);

        const data = getProduct(id);
        if (data instanceof Promise) {
            data.then(p => setProduct(p)).finally(() => setLoading(false));
        } else {
            setProduct(data);
            setLoading(false);
        }
    }, [id]);

    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const swipeDirection = useSharedValue(0);

    const resetZoom = () => {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
    };

    const openImageModal = (index: number) => {
        setModalImageIndex(index);
        setIsImageModalVisible(true);
        resetZoom();
    };

    const closeImageModal = () => {
        setIsImageModalVisible(false);
        resetZoom();
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = Math.max(1, Math.min(event.scale, 4));
        });

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (scale.value > 1) {
                translateX.value = event.translationX;
                translateY.value = event.translationY;
            } else {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (scale.value === 1) {
                if (event.translationX < -100) {
                    swipeDirection.value = -1;
                } else if (event.translationX > 100) {
                    swipeDirection.value = 1;
                }
            }
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1) {
                resetZoom();
            } else {
                scale.value = withSpring(2.5);
            }
        });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

    const animatedImageStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    const styles = React.useMemo(() => createStyles(theme, isDark), [theme, isDark]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
                <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundTitle}>Product Not Found</Text>
                    <Text style={styles.notFoundText}>The product you're looking for doesn't exist.</Text>
                </View>
            </SafeAreaView>
        );
    }


    if (!product || !id) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
                <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundTitle}>Product Not Found</Text>
                    <Text style={styles.notFoundText}>The product you're looking for doesn't exist.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const images = Array.isArray(product.images) ? product.images : [];
    const currentImage = images[selectedImageIndex] || images[0];
    const modalImage = images[modalImageIndex];


    const getImageUrl = (image: any) => {
        if (!image) return "";
        if (typeof image === "string") return image;
        return image.imageUrl || image.url || "";
    };
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#64748b" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
                {product.name}
            </Text>

            {/* <TouchableOpacity
                onPress={() => toggleFavorite(product._id)}
                style={styles.favoriteHeaderButton}
            >
                <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorite ? "#ef4444" : "#64748b"}
                />
            </TouchableOpacity> */}
        </View>
    );


    const renderImageGallery = () => (
        <View style={styles.imageSection}>
            <View style={styles.mainImageContainer}>
                {currentImage ? (
                    <TouchableOpacity onPress={() => openImageModal(selectedImageIndex)}>
                        <Image
                            source={{ uri: getImageUrl(currentImage) }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholderMainImage}>
                        <Ionicons name="image-outline" size={64} color="#94a3b8" />
                    </View>
                )}
            </View>

            {images.length > 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbnailContainer}
                    contentContainerStyle={styles.thumbnailContent}
                >
                    {images.map((image: any, index: any) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedImageIndex(index)}
                            style={[
                                styles.thumbnail,
                                selectedImageIndex === index && styles.thumbnailActive
                            ]}
                        >
                            <Image
                                source={{ uri: getImageUrl(image) }}
                                style={styles.thumbnailImage}
                                resizeMode="cover"
                            />
                            {selectedImageIndex === index && (
                                <View style={styles.thumbnailActiveIndicator}>
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <Modal visible={isImageModalVisible} transparent animationType="fade">
                <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={closeImageModal} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalImageCounter}>
                            {modalImageIndex + 1} / {images.length}
                        </Text>
                    </View>

                    <View style={styles.modalImageContainer}>
                        <GestureDetector gesture={composedGesture}>
                            <Animated.Image
                                source={{ uri: getImageUrl(modalImage) }}
                                style={[styles.modalImage, animatedImageStyle]}
                                resizeMode="contain"
                            />
                        </GestureDetector>

                        {modalImageIndex > 0 && (
                            <TouchableOpacity
                                style={styles.modalNavLeft}
                                onPress={() => {
                                    setModalImageIndex(prev => prev - 1);
                                    resetZoom();
                                }}
                            >
                                <Ionicons name="chevron-back" size={32} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {modalImageIndex < images.length - 1 && (
                            <TouchableOpacity
                                style={styles.modalNavRight}
                                onPress={() => {
                                    setModalImageIndex(prev => prev + 1);
                                    resetZoom();
                                }}
                            >
                                <Ionicons name="chevron-forward" size={32} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );

    const renderProductInfo = () => (
        <View style={styles.infoSection}>
            <Text style={styles.productTitle}>{product.name}</Text>

            {product.categoryName && (
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{product.categoryName}</Text>
                </View>
            )}

            {product.average_rating && (
                <View style={styles.ratingContainer}>
                    <View style={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                            <Ionicons
                                key={i}
                                name={i < Math.floor(product.average_rating!) ? "star" : "star-outline"}
                                size={20}
                                color="#fbbf24"
                            />
                        ))}
                    </View>
                    <Text style={styles.ratingText}>
                        {product.average_rating}
                    </Text>
                </View>
            )}

            {product.description && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>HƯỚNG DẪN SỬ DỤNG</Text>
                    {/* <Text style={styles.description}>{product.description}</Text> */}

                    <HtmlDescription
                        htmlContent={product.description}
                        containerStyle={styles.htmlContainer}
                    />
                </View>
            )}
            <TouchableOpacity style={[styles.writeButton, { marginBottom: insets.bottom + 16 }]} onPress={() => router.push({
                pathname: '/reviews/[id]',
                params: {
                    id: product.id,
                    productType: 'ProductConTrungGiaDung',
                },
            })}>
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.writeButtonText}>Xem đánh giá</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaProvider style={styles.container}>
            {renderHeader()}
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={theme.background}
            />
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {renderImageGallery()}
                {renderProductInfo()}
            </ScrollView>
        </SafeAreaProvider>
    );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 50,
    },

    writeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primary,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },

    writeButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },

    header: {
        backgroundColor: theme.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        ...(!isDark ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        } : {}),
    },

    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },

    htmlContainer: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: theme.border,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        flex: 1,
        marginHorizontal: 16,
    },

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },

    thumbnailActiveIndicator: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#3b82f6',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalCloseButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    modalImageCounter: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    modalShareButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    modalImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalImage: {
        width: width,
        height: height * 0.7,
    },

    modalNavButton: {
        position: 'absolute',
        top: '50%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
        padding: 12,
        transform: [{ translateY: -25 }],
    },

    modalPrevButton: {
        left: 16,
    },

    modalNextButton: {
        right: 16,
    },

    modalFooter: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        alignItems: 'center',
    },

    modalZoomHint: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    backButton: {
        padding: 8,
        borderRadius: 20,
    },

    
    ratingBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 2,
    },

    ratingText: {
        color: theme.text,
        fontSize: 12,
        fontWeight: '500',
    },

    cardContent: {
        padding: 12,
    },

    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 8,
        lineHeight: 18,
    },

    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: theme.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 16,
    },

    categoryBadgeText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.primary,
    },

    // Product Detail Styles
    content: {
        flex: 1,
    },

    imageSection: {
        backgroundColor: theme.card,
        paddingBottom: 16,
    },

    mainImageContainer: {
        width: width,
        height: width * 1.1,
        backgroundColor: theme.surface,
        position: 'relative',
    },

    mainImage: {
        width: '100%',
        height: '100%',
    },

    placeholderMainImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderStyle: 'dashed',
    },

    thumbnailContainer: {
        marginTop: 16,
    },

    thumbnailContent: {
        paddingHorizontal: 16,
        gap: 8,
    },

    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: theme.border,
    },

    thumbnailActive: {
        borderColor: theme.primary,
    },

    thumbnailImage: {
        width: '100%',
        height: '100%',
    },

    infoSection: {
        backgroundColor: theme.card,
        padding: 16,
        marginTop: 8,
    },

    productTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 12,
        lineHeight: 30,
    },

    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    stars: {
        flexDirection: 'row',
        marginRight: 8,
    },

    section: {
        marginTop: 24,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 12,
    },

    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },

    notFoundTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 8,
        textAlign: 'center',
    },

    notFoundText: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
    },
    modalNavLeft: {
        position: 'absolute',
        left: 8,
        top: '50%',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
    },
    modalNavRight: {
        position: 'absolute',
        right: 8,
        top: '50%',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
    },
});