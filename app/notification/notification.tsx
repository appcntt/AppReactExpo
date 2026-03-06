import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useNotificationActions, useNotificationData } from '@/contexts/NotificationContext';
import { Colors, useTheme } from '@/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationItem = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
  theme,
}: {
  notification: any;
  onPress: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  theme: Colors;
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      case 'system': return 'settings';
      default: return 'information-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      case 'error': return theme.error;
      case 'system': return theme.textSecondary;
      default: return theme.primary;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Vừa xong';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} giờ trước`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const styles = createItemStyles(theme);

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadItem,
        notification.priority === 'high' && styles.highPriorityItem,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {notification.priority === 'high' && (
        <View style={styles.priorityIndicator} />
      )}

      <View style={styles.itemContent}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(notification.type) + '20' }]}>
          <Ionicons
            name={getTypeIcon(notification.type)}
            size={24}
            color={getTypeColor(notification.type)}
          />
        </View>

        <View style={styles.textContent}>
          <Text style={[styles.title, !notification.isRead && styles.unreadTitle]}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.time}>
            {formatTime(notification.createdAt)}
          </Text>
        </View>

        <View style={styles.actions}>
          {!notification.isRead && (
            <TouchableOpacity
              onPress={onMarkAsRead}
              style={styles.actionButton}
            >
              <Ionicons name="checkmark" size={20} color={theme.success} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onDelete}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      {!notification.isRead && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  const { theme, isDark } = useTheme();
  const { notifications, unreadCount, loading, refreshing } = useNotificationData();
  const { fetchNotifications, refreshNotifications, markAsRead, deleteNotification, markAllAsRead } = useNotificationActions();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = Array.isArray(notifications)
    ? notifications.filter(notif => {
      switch (filter) {
        case 'unread': return !notif.isRead;
        case 'read': return notif.isRead;
        default: return true;
      }
    })
    : [];

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllAsRead} style={styles.headerAction}>
          <Ionicons name="checkmark-done" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'unread', 'read'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.activeFilterTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.activeFilterTabText]}>
              {tab === 'all' ? 'Tất cả' : tab === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
            </Text>
            {tab === 'unread' && unreadCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>Không có thông báo</Text>
          <Text style={styles.emptyMessage}>
            {filter === 'unread'
              ? 'Bạn đã đọc tất cả thông báo'
              : filter === 'read'
                ? 'Chưa có thông báo nào được đọc'
                : 'Chưa có thông báo nào'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshNotifications}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          {filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={() => markAsRead(notification.id)}
              onMarkAsRead={() => markAsRead(notification.id)}
              onDelete={() => deleteNotification(notification.id)}
              theme={theme}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    elevation: 2,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  badge: {
    backgroundColor: theme.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerAction: {
    marginLeft: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeFilterTab: {
    backgroundColor: theme.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeFilterTabText: {
    color: 'white',
  },
  filterBadge: {
    backgroundColor: theme.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

const createItemStyles = (theme: Colors) => StyleSheet.create({
  notificationItem: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.border,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  highPriorityItem: {
    borderLeftColor: theme.error,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: theme.error,
    borderRadius: 4,
    margin: 8,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: theme.text,
  },
  message: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
});

export default NotificationsScreen;