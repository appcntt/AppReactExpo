import { Colors, useTheme } from '@/contexts/ThemeContext';
import { getToken } from '@/utils/tokenManager';
import { BASE_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type ProductType = 'Product' | 'ProductNongNghiepDoThi' | 'ProductConTrungGiaDung';

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productType: ProductType;
  onReviewSubmitted?: () => void;
}

interface CustomAlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: CustomAlertButton[];
  type?: 'success' | 'error' | 'warning' | 'confirm';
}

export default function WriteReviewModal({
  visible,
  onClose,
  productId,
  productType,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<CustomAlertProps>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'confirm',
  });


  const styles = createStyles(theme);

  const showAlert = (
    title: string,
    message: string,
    buttons: CustomAlertButton[],
    type: CustomAlertProps['type'] = 'confirm'
  ) => {
    setAlert({ visible: true, title, message, buttons, type });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  const alertIconMap = {
    success: { name: 'checkmark-circle' as const, color: '#22c55e' },
    error: { name: 'close-circle' as const, color: theme.error },
    warning: { name: 'warning' as const, color: '#f59e0b' },
    confirm: { name: 'help-circle' as const, color: theme.primary },
  };

  const CustomAlert = () => {
    const icon = alertIconMap[alert.type || 'confirm'];
    return (
      <Modal visible={alert.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconWrapper, { backgroundColor: icon.color + '15' }]}>
              <Ionicons name={icon.name} size={40} color={icon.color} />
            </View>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <View style={[
              styles.alertButtons,
              alert.buttons.length === 1 && { justifyContent: 'center' }
            ]}>
              {alert.buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.alertBtn,
                    alert.buttons.length === 1 && { flex: 0, paddingHorizontal: 40 },
                    btn.style === 'cancel' && styles.alertBtnCancel,
                    btn.style === 'destructive' && styles.alertBtnDestructive,
                    btn.style === 'default' && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => {
                    hideAlert();
                    btn.onPress?.();
                  }}
                >
                  <Text style={[
                    styles.alertBtnText,
                    btn.style === 'cancel' && styles.alertBtnTextCancel,
                    btn.style === 'destructive' && styles.alertBtnTextDestructive,
                    btn.style === 'default' && { color: '#fff' },
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showAlert('Chưa chọn sao', 'Vui lòng chọn số sao đánh giá trước khi gửi.', [
        { text: 'Đồng ý', style: 'default' }
      ], 'warning');
      return;
    }

    if (comment.trim().length < 10) {
      showAlert('Nhận xét quá ngắn', 'Bình luận phải có ít nhất 10 ký tự.', [
        { text: 'Đồng ý', style: 'default' }
      ], 'warning');
      return;
    }
    try {
      setLoading(true);

      const uploadedImages = await uploadImages(images);

      const token = await getToken();

      const response = await fetch(`${BASE_URL}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          productType,
          rating,
          comment: comment.trim(),
          images: uploadedImages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Gửi thành công!', 'Cảm ơn bạn đã đánh giá sản phẩm.', [
          {
            text: 'Đóng', style: 'default', onPress: () => {
              resetForm();
              onClose();
              setTimeout(() => onReviewSubmitted?.(), 400);
            }
          }
        ], 'success');
      } else {
        showAlert('Gửi thất bại', data.error || 'Không thể gửi đánh giá. Vui lòng thử lại.', [
          { text: 'Thử lại', style: 'default' }
        ], 'error');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      showAlert('Có lỗi xảy ra', 'Vui lòng kiểm tra kết nối và thử lại.', [
        { text: 'Đồng ý', style: 'default' }
      ], 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (imageUris: string[]) => {

    try {
      const uploadedImages = await Promise.all(
        imageUris.map(async (uri) => {
          const formData = new FormData();
          formData.append('image', {
            uri,
            type: 'image/jpeg',
            name: `review_${Date.now()}.jpg`,
          } as any);
          return { url: uri, imageId: Date.now().toString() };
        })
      );

      return uploadedImages;
    } catch (error) {
      console.error('Upload images error:', error);
      showAlert('Lỗi tải ảnh', 'Không thể tải ảnh lên. Vui lòng thử lại.', [
        { text: 'Đồng ý', style: 'default' }
      ], 'error');
      return [];
    }
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      showAlert('Đã đạt giới hạn', 'Bạn chỉ có thể tải lên tối đa 5 ảnh.', [
        { text: 'Đồng ý', style: 'default' }
      ], 'warning');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showAlert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục.', [
        { text: 'Đồng ý', style: 'default' }
      ], 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setImages([]);
  };

  const handleClose = () => {
    if (rating > 0 || comment.trim()) {
      showAlert(
        'Hủy đánh giá?',
        'Nội dung bạn đang viết sẽ bị mất nếu thoát.',
        [
          { text: 'Tiếp tục viết', style: 'cancel' },
          { text: 'Hủy bỏ', style: 'destructive', onPress: () => { resetForm(); onClose(); } },
        ],
        'confirm'
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <CustomAlert />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Viết đánh giá</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Đánh giá của bạn <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#FFA500' : theme.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Tốt'}
                {rating === 5 && 'Rất tốt'}
              </Text>
            )}
          </View>

          {/* Comment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Nhận xét của bạn <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              placeholderTextColor={theme.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {comment.length}/1000 ký tự (tối thiểu 10 ký tự)
            </Text>
          </View>

          {/* Images Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thêm hình ảnh (tùy chọn)</Text>
            <Text style={styles.sectionSubtitle}>Tối đa 5 ảnh</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                  <Ionicons name="camera-outline" size={32} color={theme.textSecondary} />
                  <Text style={styles.addImageText}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Mẹo viết đánh giá hay:</Text>
            <Text style={styles.tipItem}>• Mô tả chi tiết về sản phẩm</Text>
            <Text style={styles.tipItem}>• Chia sẻ trải nghiệm thực tế</Text>
            <Text style={styles.tipItem}>• Đánh giá khách quan</Text>
            <Text style={styles.tipItem}>• Thêm hình ảnh để minh họa</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (rating === 0 || comment.trim().length < 10 || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || comment.trim().length < 10 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    closeButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    required: {
      color: theme.error,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    ratingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
    },
    ratingLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
      textAlign: 'center',
      marginTop: 8,
    },
    commentInput: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 15,
      color: theme.text,
      minHeight: 150,
    },
    characterCount: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'right',
      marginTop: 8,
    },
    imagesScroll: {
      marginTop: 8,
    },
    imageContainer: {
      position: 'relative',
      marginRight: 12,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.card,
      borderRadius: 12,
    },
    addImageButton: {
      width: 100,
      height: 100,
      borderRadius: 8,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.surface,
    },
    addImageText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    tipsContainer: {
      backgroundColor: theme.primary + '10',
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    tipsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    tipItem: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 22,
    },
    footer: {
      padding: 16,
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    submitButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      backgroundColor: theme.textSecondary,
      opacity: 0.5,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },

    // Custom Alert
    alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    alertBox: { backgroundColor: theme.card, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
    alertIconWrapper: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    alertTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8, textAlign: 'center' },
    alertMessage: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    alertButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    alertBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: theme.primary },
    alertBtnCancel: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    alertBtnDestructive: { backgroundColor: theme.error + '15', borderWidth: 1, borderColor: theme.error },
    alertBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
    alertBtnTextCancel: { color: theme.text },
    alertBtnTextDestructive: { color: theme.error },
  });
