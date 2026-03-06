import { AnyFavouriteProduct, useFavourite } from '@/contexts/FavouriteContext';
import { Colors, useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  ListRenderItem,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useScrollTabHide } from './_layout';

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  addListener: (event: string, callback: () => void) => () => void;
  dispatch: (action: any) => void;
};

const FavouriteScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const {
    favourites,
    loading,
    refreshing,
    error,
    pagination,
    getFavourites,
    toggleFavourite,
    refreshFavourites,
    clearError,
  } = useFavourite();

  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { handleScroll } = useScrollTabHide();

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    productId: string;
    productName: string;
    productType: 'Product' | 'ProductNongNghiepDoThi' | 'ProductConTrungGiaDung';
  }>({ visible: false, productId: '', productName: '', productType: 'Product' });

  const styles = createStyles(theme);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getFavourites();
    });

    return unsubscribe;
  }, [navigation, getFavourites]);

  const handleRemoveFavourite = (productId: string, productName: string, productType: 'Product' | 'ProductNongNghiepDoThi' | 'ProductConTrungGiaDung'): void => {
    setConfirmModal({ visible: true, productId, productName, productType });
  };

  const confirmRemove = async (): Promise<void> => {
    const { productId, productType } = confirmModal;
    setConfirmModal(prev => ({ ...prev, visible: false }));
    setRemovingItems(prev => new Set([...prev, productId]));
    try {
      await toggleFavourite(productId, productType);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm yêu thích');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      })
    }
  }

  const getImageUri = (item: AnyFavouriteProduct): string => {
    if (item.images && item.images.length > 0) {
      const img = item.images[0];
      return img.imageUrl || img.url || 'https://via.placeholder.com/100';
    }
    return 'https://via.placeholder.com/100';
  };


  const handleProductPress = (product: AnyFavouriteProduct): void => {
    switch (product.productType) {
      case 'Product':
        router.push(`/product/${product.id}`);
        break;
      case 'ProductNongNghiepDoThi':
        router.push(`/nndt/${product.id}`);
        break;
      case 'ProductConTrungGiaDung':
        router.push(`/ctgd/${product.id}`);
        break;
    }
  };

  const renderFavouriteItem: ListRenderItem<AnyFavouriteProduct> = ({ item }) => {
    const isRemoving = removingItems.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.favouriteItem, isRemoving && styles.removingItem]}
        onPress={() => handleProductPress(item)}
        disabled={isRemoving}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{
              uri: getImageUri(item)
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {item.isMoi && (
            <Animated.View style={[styles.newBadge, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.newText}>MỚI</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category.name}</Text>
            </View>
          )}
          <View style={styles.metaInfo}>
            <Text style={styles.favouritedDate}>
              Đã thích: {new Date(item.favouriteAt).toLocaleDateString('vi-VN')}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color={theme.warning} />
              <Text style={styles.rating}>
                {item.average_rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavourite(item.id, item.name, item.productType)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={theme.error} />
          ) : (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
              <Icon name="favorite" size={24} color={theme.error} />
            </Animated.View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = (): JSX.Element => (
    <View style={styles.emptyState}>
      <Icon name="favorite-border" size={80} color={theme.textSecondary} />
      <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
      <Text style={styles.emptyDescription}>
        Hãy khám phá và thêm những sản phẩm bạn yêu thích vào danh sách này
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('product')}
      >
        <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = (): JSX.Element => (
    <View style={styles.errorState}>
      <Icon name="error-outline" size={80} color={theme.error} />
      <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          clearError();
          getFavourites();
        }}
      >
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = (): JSX.Element | null => {
    if (!loading || favourites.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
      </View>
    );
  };

  if (error && favourites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
        </View>
        {renderError()}
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
        {favourites.length > 0 && (
          <Text style={styles.itemCount}>
            {pagination.total} sản phẩm
          </Text>
        )}
      </View>

      {favourites.length === 0 && !loading ? (
        renderEmptyState()
      ) : (
        <FlatList
          onScroll={handleScroll}
          scrollEventThrottle={16}
          data={favourites}
          renderItem={renderFavouriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshFavourites}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {loading && favourites.length === 0 && (
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loaderText}>Đang tải...</Text>
        </View>
      )}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType='fade'
        onRequestClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View style={styles.modalIconWrapper}>
              <Icon name="favorite" size={36} color={theme.error} />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Xóa khỏi yêu thích?</Text>

            {/* Product name */}
            <Text style={styles.modalProductName} numberOfLines={2}>
              {confirmModal.productName}
            </Text>

            <Text style={styles.modalMessage}>
              Sản phẩm này sẽ bị xóa khỏi danh sách yêu thích của bạn.
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.modalCancelText}>Giữ lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmRemove}
              >
                <Icon name="delete" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.modalConfirmText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  header: {
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text
  },
  itemCount: {
    fontSize: 14,
    color: theme.textSecondary
  },
  listContainer: {
    padding: 15
  },
  favouriteItem: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  removingItem: {
    opacity: 0.6
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 15
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between'
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 5
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  menuButton: {
    padding: 8,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  favouritedDate: {
    fontSize: 12,
    color: theme.textSecondary
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rating: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 4
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 5,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 20,
    marginBottom: 10
  },
  emptyDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  },
  exploreButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25
  },
  exploreButtonText: {
    color: theme.headerText,
    fontSize: 16,
    fontWeight: '600'
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 20,
    marginBottom: 10
  },
  errorDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 30
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25
  },
  retryButtonText: {
    color: theme.headerText,
    fontSize: 16,
    fontWeight: '600'
  },
  initialLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textSecondary
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  footerLoaderText: {
    marginLeft: 10,
    fontSize: 14,
    color: theme.textSecondary
  },

  //modal remove
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.error + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  modalProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.primary,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: theme.error,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FavouriteScreen;