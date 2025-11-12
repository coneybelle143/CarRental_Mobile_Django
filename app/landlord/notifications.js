import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: '1',
      type: 'booking',
      title: 'New Booking Request',
      message: 'Jesse Pinkman wants to book "Sunrise Boarding House" for March 2024',
      time: '2 hours ago',
      status: 'pending',
      unread: true
    },
    {
      id: '2',
      type: 'inquiry',
      title: 'New Property Inquiry',
      message: 'Kim Wexler is interested in "CDO Student Dorm". Check messages for details.',
      time: '5 hours ago',
      status: 'new',
      unread: true
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₱3,500 confirmed for "Green Valley Apartelle" from Flynn White',
      time: '1 day ago',
      status: 'completed',
      unread: false
    },
    {
      id: '4',
      type: 'review',
      title: 'New Review Received',
      message: 'Howard Hamlin left a 5-star review for "XU Area Boarding"',
      time: '2 days ago',
      status: 'completed',
      unread: false
    },
    {
      id: '5',
      type: 'maintenance',
      title: 'Maintenance Reminder',
      message: 'Quarterly maintenance check for "Downtown Comfort" is due next week',
      time: '3 days ago',
      status: 'upcoming',
      unread: false
    },
    {
      id: '6',
      type: 'system',
      title: 'Listing Performance',
      message: 'Your listing "Sunrise Boarding House" has 128 views this week (+15% from last week)',
      time: '1 week ago',
      status: 'info',
      unread: false
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return { name: 'calendar', color: '#3b82f6' };
      case 'inquiry':
        return { name: 'chatbubble', color: '#8b5cf6' };
      case 'payment':
        return { name: 'card', color: '#10b981' };
      case 'review':
        return { name: 'star', color: '#f59e0b' };
      case 'maintenance':
        return { name: 'build', color: '#ef4444' };
      case 'system':
        return { name: 'analytics', color: '#6b7280' };
      default:
        return { name: 'notifications', color: '#667eea' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'new':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'upcoming':
        return '#8b5cf6';
      case 'info':
        return '#6b7280';
      default:
        return '#667eea';
    }
  };

  const handleNotificationPress = (notification) => {
    console.log('Notification pressed:', notification.title);
    
  };

  const markAllAsRead = () => {
    console.log('Marking all notifications as read');
    
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Updates on your listings and account activity</Text>
        </View>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => {
          const icon = getNotificationIcon(notification.type);
          const statusColor = getStatusColor(notification.status);
          
          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                notification.unread && styles.unreadNotification
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIconContainer}>
                  <View style={[styles.iconBackground, { backgroundColor: `${icon.color}15` }]}>
                    <Ionicons name={icon.name} size={20} color={icon.color} />
                  </View>
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationTitleRow}>
                    <Text style={styles.notificationTitle} numberOfLines={1}>
                      {notification.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {notification.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
              </View>
              {notification.unread && (
                <View style={styles.unreadIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
        
        
        <View style={styles.endOfList}>
          <Ionicons name="checkmark-done" size={32} color="#ccc" />
          <Text style={styles.endOfListText}>No more notifications</Text>
          <Text style={styles.endOfListSubtext}>You're all caught up!</Text>
        </View>
        
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  notificationsList: {
    flex: 1,
    padding: 20,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    backgroundColor: '#f8faff',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  endOfList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  endOfListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
  },
  endOfListSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});