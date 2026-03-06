import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface Props {
  visible: boolean;
  message: string;
  onClose: () => void;
  theme: any;
}

export default function ErrorModal({
  visible,
  message,
  onClose,
  theme,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <Ionicons
            name="close-circle"
            size={60}
            color="#ff4d4f"
            style={{ marginBottom: 12 }}
          />

          <Text style={[styles.title, { color: theme.text }]}>
            Đăng nhập thất bại
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={{ color: theme.card, fontWeight: "bold" }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 15,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 14,
  },
});
