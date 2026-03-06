import ErrorModal from '@/components/ErrorModal';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from "expo-local-authentication";
import { Link, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: ''
  });

  const { login } = useAuth();
  const router = useRouter();

  const styles = createStyles(theme, isDark);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBiometricLogin = async () => {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        return Alert.alert("Thông báo", "Thiết bị chưa cài đặt Face ID / Touch ID.");
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Đăng nhập bằng Face ID / Touch ID",
        fallbackLabel: "Nhập mật khẩu",
      });

      if (result.success) {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          Alert.alert("✅ Thành công", "Đăng nhập tự động thành công!");
          router.push('/(drawer)/(tabs)/home');
        } else {
          Alert.alert("⚠️ Lỗi", "Không tìm thấy token. Vui lòng đăng nhập lại.");
        }
      } else {
        Alert.alert("❌ Thất bại", "Xác thực không thành công.");
      }
    } catch (err) {
      console.error(err);
    }
  };


  const validateForm = () => {
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setErrorModal({
        visible: true,
        message: 'Email và mật khẩu không được để trống'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorModal({
        visible: true,
        message: 'Email không hợp lệ'
      })
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      router.replace('/(drawer)/(tabs)/home');
    } catch (error: any) {
      setErrorModal({
        visible: true,
        message: error.message || 'Email hoặc mật khẩu không đúng'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        scrollEnabled={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={theme.textSecondary}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.card} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
          {/* Switch Mode */}
          <View style={styles.switchMode}>
            <Text style={styles.switchModeText}>
              Chưa có tài khoản?{' '}
            </Text>
            <Link href="/(auth)/register" style={styles.switchModeLink}>
              <Text style={styles.switchModeLinkText}>Đăng ký ngay</Text>
            </Link>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Bằng cách tiếp tục, bạn đồng ý với{'\n'}
          <Text style={styles.footerBold}>Điều khoản dịch vụ</Text> và{' '}
          <Text style={styles.footerBold}>Chính sách bảo mật</Text>
        </Text>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/(drawer)/(tabs)/home')}
        >
          <Text style={styles.homeButtonText}>Vào ngay</Text>
        </TouchableOpacity>
      </ScrollView>
      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
};


const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formCard: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconContainer: {
    padding: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  biometricButtonText: {
    color: theme.card,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchModeText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  switchModeLink: {
    marginLeft: 4,
  },
  switchModeLinkText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 13,
  },
  footerBold: {
    fontWeight: '600',
    color: theme.text,
  },
  homeButton: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  homeButtonText: {
    color: theme.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});