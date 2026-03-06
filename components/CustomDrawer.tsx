import React, { useRef } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.7;

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  navigateTo: (screen: string) => void;
  isPushMode?: boolean;
};

export const CustomDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  navigateTo,
  isPushMode = false,
}) => {
  const translateX = useRef(
    useSharedValue(isPushMode ? 0 : -DRAWER_WIDTH),
  ).current;
  const overlayOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (!isPushMode) {
      if (isOpen) {
        translateX.value = withSpring(0, { damping: 15 });
      } else {
        translateX.value = withSpring(-DRAWER_WIDTH, { damping: 15 });
      }
    }
  }, [isOpen, isPushMode, translateX]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleNavigation = React.useCallback(
    (screen: string) => {
      navigateTo(screen);
      onClose();
    },
    [navigateTo, onClose],
  );

  return (
    <>
      {isOpen && (
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.drawer,
          drawerStyle,
          isPushMode && styles.drawerPushMode,
          !isPushMode && drawerStyle,
        ]}
      >
        <Text style={styles.title}>Menu</Text>

        <TouchableOpacity
          onPress={() => navigateTo("/home")}
          style={styles.item}
        >
          <Text>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateTo("/product")}
          style={styles.item}
        >
          <Text>🛒 Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateTo("/favourite")}
          style={styles.item}
        >
          <Text>❤️ Favourites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.item, { marginTop: 30 }]}
        >
          <Text>❌ Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "black",
    zIndex: 99,
  },
  drawerPushMode: {
    transform: [{ translateX: 0 }],
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 5,
    zIndex: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
