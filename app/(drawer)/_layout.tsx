import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useBSCT } from "@/contexts/BsctContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useFocusEffect, useRouter } from "expo-router";
import { Drawer } from 'expo-router/drawer';
import { useCallback, useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTabVisibility } from "./(tabs)/_layout";

function CustomDrawerContent(props: any) {
  const { isLoggedIn, user, logout, checkAuthStatus, isLoading } = useAuth();
  const { theme, isDark, toggleTheme, themeMode } = useTheme();

  const router = useRouter();
  const currentRoute = props.state.routes[props.state.index].name;

  const handleLogin = () => {
    props.navigation.closeDrawer();
    router.push('/(auth)/login');
  };

  useFocusEffect(
    useCallback(() => {
      checkAuthStatus();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            props.navigation.navigate('(tabs)', { screen: 'home' });
          }
        }
      ]
    )
  }

  const handleAccountPress = () => {
    if (isLoggedIn === true) {
      props.navigation.navigate('account');
    }
  }

  const isRouteActive = (routeName: string) => {
    return currentRoute === routeName;
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return isDark ? "phone-portrait" : "phone-portrait-outline";
    return isDark ? "moon" : "sunny";
  };

  const getThemeText = () => {
    if (themeMode === 'system') return 'Hệ thống';
    return isDark ? 'Chế độ tối' : 'Chế độ sáng';
  };

  const styles = createStyles(theme);

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      {/* User Info Section */}
      <View style={styles.userSection}>
        {isLoggedIn === true ? (
          <>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={theme.drawerText} />
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </>
        ) : (
          <>
            <View style={styles.avatarGuest}>
              <Ionicons name="person-outline" size={24} color={theme.primary} />
            </View>
            <Text style={styles.guestName}>Khách</Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        <DrawerItem
          label="Trang chủ"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("(tabs)") ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('(tabs)', { screen: 'home' })}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("(tabs)")}
          style={isRouteActive("(tabs)") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("(tabs)") ? styles.activeDrawerLabel : null
          ]}
        />
        <DrawerItem
          label="Nông nghiệp đô thị"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("nndt") ? "leaf" : "leaf-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('nndt')}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("nndt")}
          style={isRouteActive("nndt") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("nndt") ? styles.activeDrawerLabel : null
          ]}
        />
        <DrawerItem
          label="Côn trùng gia dụng"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("ctgd") ? "bug" : "bug-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('ctgd')}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("ctgd")}
          style={isRouteActive("ctgd") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("ctgd") ? styles.activeDrawerLabel : null
          ]}
        />
        <DrawerItem
          label="Bác sĩ cây trồng"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("bsct") ? "medical" : "medical-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('bsct')}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("bsct")}
          style={isRouteActive("bsct") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("bsct") ? styles.activeDrawerLabel : null
          ]}
        />
        <DrawerItem
          label="Thư viện"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("thuviens") ? "library" : "library-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('thuviens')}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("thuviens")}
          style={isRouteActive("thuviens") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("thuviens") ? styles.activeDrawerLabel : null
          ]}
        />

        <DrawerItem
          label="Bài viết đã lưu"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("saved_blog") ? "library" : "library-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('saved_blog')}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("saved_blog")}
          style={isRouteActive("saved_blog") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("saved_blog") ? styles.activeDrawerLabel : null
          ]}
        />
        <DrawerItem
          label={isLoggedIn === true ? "Tài khoản" : "Đăng nhập"}
          icon={({ color, size }) => (
            <Ionicons
              name={isLoggedIn === true
                ? (isRouteActive("account") ? "person-circle" : "person-circle-outline")
                : "log-in-outline"
              }
              size={size}
              color={color}
            />
          )}
          onPress={handleAccountPress}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("account")}
          style={isRouteActive("account") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("account") ? styles.activeDrawerLabel : null
          ]}
        />

        <DrawerItem
          label="Cài đặt"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("settings") ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('settings')}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("settings")}
          style={isRouteActive("settings") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("settings") ? styles.activeDrawerLabel : null
          ]}
        />

        {/* Theme Toggle */}
        <DrawerItem
          label={getThemeText()}
          icon={({ color, size }) => (
            <Ionicons
              name={getThemeIcon()}
              size={size}
              color={color}
            />
          )}
          onPress={toggleTheme}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          labelStyle={{ color: theme.text }}
        />

        <DrawerItem
          label="Trợ giúp"
          icon={({ color, size }) => (
            <Ionicons
              name={isRouteActive("support") ? "help-circle" : "help-circle-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => props.navigation.navigate('support')}
          activeTintColor={theme.drawerActiveTint}
          inactiveTintColor={theme.drawerInactiveTint}
          focused={isRouteActive("support")}
          style={isRouteActive("support") ? styles.activeDrawerItem : null}
          labelStyle={[
            { color: theme.text },
            isRouteActive("support") ? styles.activeDrawerLabel : null
          ]}
        />
      </View>

      {/* Logout Button - Only show if logged in */}
      {isLoggedIn === true && (
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      )}
    </DrawerContentScrollView>
  )
}

function HeaderTrashButton() {
  const { theme } = useTheme();
  const { bookmarks } = useBSCT();
  const [clearModal, setClearModal] = useState(false);
  const { clearAllBookmarks } = useBSCT();

  if (bookmarks.length === 0) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setClearModal(true)}
        style={{ marginRight: 16, padding: 4 }}
      >
        <Ionicons name="trash-outline" size={22} color={theme.error} />
      </TouchableOpacity>

      <Modal visible={clearModal} transparent animationType="fade">
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32
        }}>
          <View style={{
            backgroundColor: theme.card, borderRadius: 20,
            padding: 24, width: '100%', alignItems: 'center'
          }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: theme.error + '15',
              justifyContent: 'center', alignItems: 'center', marginBottom: 16
            }}>
              <Ionicons name="trash-outline" size={32} color={theme.error} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
              Xóa tất cả?
            </Text>
            <Text style={{
              fontSize: 14, color: theme.textSecondary,
              textAlign: 'center', lineHeight: 20, marginBottom: 24
            }}>
              Tất cả bài viết đã lưu sẽ bị xóa. Bạn không thể hoàn tác thao tác này.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1, paddingVertical: 13, borderRadius: 12,
                  borderWidth: 1.5, borderColor: theme.border,
                  backgroundColor: theme.surface, alignItems: 'center'
                }}
                onPress={() => setClearModal(false)}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1, paddingVertical: 13, borderRadius: 12,
                  backgroundColor: theme.error, alignItems: 'center',
                  flexDirection: 'row', justifyContent: 'center', gap: 6
                }}
                onPress={async () => {
                  await clearAllBookmarks();
                  setClearModal(false);
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Xóa hết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function DrawerLayoutContent() {
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={CustomDrawerContent}
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.drawerBackground,
            width: 280,
          },
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.headerText,
          drawerActiveTintColor: theme.drawerActiveTint,
          drawerInactiveTintColor: theme.drawerInactiveTint,
        }}
        initialRouteName="(tabs)"
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Main App',
            title: 'TRANG CHỦ',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="nndt"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'NÔNG NGHIỆP ĐÔ THỊ',
          }}
        />
        <Drawer.Screen
          name="ctgd"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'CÔN TRÙNG GIA DỤNG',
          }}
        />
        <Drawer.Screen
          name="account"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'TÀI KHOẢN',
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'CÀI ĐẶT',
          }}
        />
        <Drawer.Screen
          name="support"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'TRỢ GIÚP & HỖ TRỢ',
          }}
        />
        <Drawer.Screen
          name="bsct"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'BÁC SĨ CÂY TRỒNG',
          }}
        />
        <Drawer.Screen
          name="thuviens"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'THƯ VIỆN',
          }}
        />
        <Drawer.Screen
          name="saved_blog"
          options={{
            title: 'BÀI VIẾT ĐÃ LƯU',
            drawerItemStyle: { display: 'none' },
            headerRight: () => <HeaderTrashButton />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function DrawerLayout() {
  return (
    <AuthProvider>
      <DrawerLayoutContent />
    </AuthProvider>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: theme.drawerBackground,
  },
  userSection: {
    padding: 20,
    backgroundColor: theme.drawerSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarGuest: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.buttonBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.drawerText,
    marginBottom: 4,
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.drawerText,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: theme.drawerTextSecondary,
  },
  loginButton: {
    backgroundColor: theme.buttonBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  loginButtonText: {
    color: theme.buttonText,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  navSection: {
    flex: 1,
    paddingTop: 16,
  },
  logoutSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.error,
    fontWeight: '500',
  },
  activeDrawerItem: {
    backgroundColor: theme.drawerActiveBackground,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  activeDrawerLabel: {
    fontWeight: 'bold',
    color: theme.drawerActiveTint,
  },
});

export const useScrollTabHide = () => {
  const context = useTabVisibility();

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    context.setScrollOffset(offsetY);
  };

  return { handleScroll };
};