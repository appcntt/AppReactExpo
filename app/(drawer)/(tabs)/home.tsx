import BSCTNewComponent from '@/components/BsctNewComponent';
import CategoryForHome from '@/components/CategoryHome';
import { CustomDrawer } from '@/components/CustomDrawer';
import ProductNewComponent from '@/components/ProductCardComponent';
import SliderComponent from '@/components/SliderComponnent';
import ThuVienNewComponent from '@/components/ThuVienNewComponent';
import { useProduct } from '@/contexts/ProductContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScrollTabHide } from './_layout';


type RootDrawerParamList = {
  "(tabs)": undefined;
};

type HomeScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList>;

const HomeScreen: React.FC = () => {

  const [drawerVisible, setDrawerVisible] = useState(false);

  const { handleScroll } = useScrollTabHide();

  const { theme, isDark } = useTheme();

  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
  }, []);

  const {
    refreshNewProducts,
  } = useProduct();

  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNewProducts();
    setRefreshing(false);
  };

  const handleNavigateTo = useCallback((screen: string) => {
    setDrawerVisible(false);
  }, []);

  const styles = createStyles(theme);

  const { width: screenWidth } = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
        translucent={false}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons
            name="menu"
            size={28}
            color={theme.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Trang Chủ</Text>
        <TouchableOpacity onPress={() => router.push('/notification/notification')} style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.card} />
        }
        showsVerticalScrollIndicator={false}

      >

        <SliderComponent
          autoPlay={true}
          autoPlayInterval={3000}
          showIndicators={true}
          borderRadius={12}
        />

        <ProductNewComponent />

        <CategoryForHome />

        <BSCTNewComponent />

        <ThuVienNewComponent />
      </ScrollView>
      {drawerVisible && (
        <CustomDrawer isOpen={drawerVisible}
          onClose={handleCloseDrawer}
          navigateTo={handleNavigateTo} />
      )}
    </SafeAreaView>
  );
};


const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    // Add shadow for light theme
    ...(!theme.isDark && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.background + '100',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.background + '100',
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.surface,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for floating tab bar
  },
  sliderContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  componentContainer: {
    marginTop: 24,
  },
  bottomPadding: {
    height: 20,
  },

  // Legacy styles (keeping for compatibility)
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: theme.card,
    paddingTop: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 5,
    elevation: 5,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.text,
  },
  menuItem: {
    paddingVertical: 12,
  },
});
// const styles = StyleSheet.create({
//   drawer: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: 250,
//     backgroundColor: "#fff",
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowOffset: { width: 3, height: 0 },
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   drawerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
//   menuItem: { paddingVertical: 12 },
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   menuButton: {
//     padding: 8,
//   },
//   menuIcon: {
//     fontSize: 30,
//     color: '#2C3E50',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     // backgroundColor: '#FFFFFF',

//     borderBottomColor: '#E5E5E5',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#2C3E50',
//   },
//   notificationButton: {
//     padding: 8,
//   },
//   notificationText: {
//     fontSize: 20,
//   },

// });

export default HomeScreen;