import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_STORAGE_KEY = '@tenant_notifications';
const LISTINGS_STORAGE_KEY = '@landlord_listings';
const BOOKINGS_STORAGE_KEY = '@bookings_data';
const PAYMENTS_STORAGE_KEY = '@payments_data';
const TENANT_MESSAGES_KEY = '@tenant_messages';

const currentUser = {
  id: 'tenant_jesse_pinkman_01',
  name: 'Jesse Pinkman',
};

export default function Notifications() {
  const [notificationList, setNotificationList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications and check for updates
  useEffect(() => {
    loadNotifications();
    checkForNewNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      checkForNewNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (notificationsJson) {
        const notifications = JSON.parse(notificationsJson);
        // Sort by timestamp (newest first)
        const sorted = notifications.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setNotificationList(sorted);
      } else {
        setNotificationList([]);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
      setNotificationList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      // Check for new listings
      await checkNewListings();
      
      // Check for booking updates
      await checkBookingUpdates();
      
      // Check for payment updates
      await checkPaymentUpdates();
      
      // Check for new messages
      await checkNewMessages();
      
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const checkNewListings = async () => {
    try {
      const listingsJson = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!listingsJson) return;
      
      const listings = JSON.parse(listingsJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Get listings created in the last 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      listings.forEach(listing => {
        const listingDate = listing.createdAt ? new Date(listing.createdAt).getTime() : Date.now();
        
        // Check if this is a new listing and we haven't notified about it yet
        const alreadyNotified = existingNotifications.some(
          notif => notif.type === 'new_listing' && notif.listingId === listing.id
        );
        
        if (listingDate > oneDayAgo && !alreadyNotified) {
          const notification = {
            id: `new_listing_${listing.id}_${Date.now()}`,
            type: 'new_listing',
            title: 'New Property Available! 🏠',
            message: `${listing.name} is now available for ₱${listing.price.toLocaleString()}/month in ${listing.location}`,
            timestamp: new Date().toISOString(),
            read: false,
            listingId: listing.id,
            actionType: 'view_listing',
            actionData: { listingId: listing.id }
          };
          
          existingNotifications.unshift(notification);
        }
      });
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error checking new listings:', error);
    }
  };

  const checkBookingUpdates = async () => {
    try {
      const bookingsJson = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!bookingsJson) return;
      
      const bookings = JSON.parse(bookingsJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Filter bookings for current user
      const userBookings = bookings.filter(b => b.tenantId === currentUser.id);
      
      userBookings.forEach(booking => {
        // Check for booking approval
        if (booking.status === 'approved') {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'booking_approved' && notif.bookingId === booking.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `booking_approved_${booking.id}_${Date.now()}`,
              type: 'booking_approved',
              title: '✅ Booking Approved!',
              message: `Great news! Your booking for ${booking.property} has been approved by the landlord.`,
              timestamp: new Date().toISOString(),
              read: false,
              bookingId: booking.id,
              actionType: 'view_booking',
              actionData: { bookingId: booking.id }
            };
            
            existingNotifications.unshift(notification);
          }
        }
        
        // Check for booking cancellation
        if (booking.status === 'cancelled' && booking.cancelledBy === 'landlord') {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'booking_cancelled' && notif.bookingId === booking.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `booking_cancelled_${booking.id}_${Date.now()}`,
              type: 'booking_cancelled',
              title: '❌ Booking Cancelled',
              message: `Your booking for ${booking.property} has been cancelled by the landlord. ${booking.cancelReason || ''}`,
              timestamp: new Date().toISOString(),
              read: false,
              bookingId: booking.id,
              actionType: 'view_booking',
              actionData: { bookingId: booking.id }
            };
            
            existingNotifications.unshift(notification);
          }
        }
      });
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error checking booking updates:', error);
    }
  };

  const checkPaymentUpdates = async () => {
    try {
      const paymentsJson = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!paymentsJson) return;
      
      const payments = JSON.parse(paymentsJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Filter payments for current user
      const userPayments = payments.filter(p => p.tenantId === currentUser.id);
      
      userPayments.forEach(payment => {
        // Check for payment confirmation
        if (payment.status === 'completed') {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'payment_confirmed' && notif.paymentId === payment.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `payment_confirmed_${payment.id}_${Date.now()}`,
              type: 'payment_confirmed',
              title: '💳 Payment Confirmed',
              message: `Your payment of ₱${payment.amount.toLocaleString()} for ${payment.property} has been confirmed.`,
              timestamp: new Date().toISOString(),
              read: false,
              paymentId: payment.id,
              actionType: 'view_payment',
              actionData: { paymentId: payment.id }
            };
            
            existingNotifications.unshift(notification);
          }
        }
        
        // Check for payment due reminders
        if (payment.status === 'pending' && payment.dueDate) {
          const dueDate = new Date(payment.dueDate);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          
          // Notify 3 days before due
          if (daysUntilDue === 3) {
            const alreadyNotified = existingNotifications.some(
              notif => notif.type === 'payment_reminder' && notif.paymentId === payment.id
            );
            
            if (!alreadyNotified) {
              const notification = {
                id: `payment_reminder_${payment.id}_${Date.now()}`,
                type: 'payment_reminder',
                title: '⏰ Payment Reminder',
                message: `Your rent payment of ₱${payment.amount.toLocaleString()} for ${payment.property} is due in 3 days.`,
                timestamp: new Date().toISOString(),
                read: false,
                paymentId: payment.id,
                actionType: 'view_payment',
                actionData: { paymentId: payment.id }
              };
              
              existingNotifications.unshift(notification);
            }
          }
        }
      });
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error checking payment updates:', error);
    }
  };

  const checkNewMessages = async () => {
    try {
      const messagesJson = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!messagesJson) return;
      
      const conversations = JSON.parse(messagesJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Check for unread messages
      conversations.forEach(conversation => {
        if (conversation.unread) {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'new_message' && 
            notif.conversationId === conversation.id &&
            notif.messageText === conversation.lastMessage
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `new_message_${conversation.id}_${Date.now()}`,
              type: 'new_message',
              title: '💬 New Message',
              message: `${conversation.landlord.name}: ${conversation.lastMessage}`,
              timestamp: new Date().toISOString(),
              read: false,
              conversationId: conversation.id,
              messageText: conversation.lastMessage,
              actionType: 'view_message',
              actionData: { 
                landlordId: conversation.landlord.id,
                landlordName: conversation.landlord.name,
                landlordImage: conversation.landlord.image,
                houseName: conversation.houseName
              }
            };
            
            existingNotifications.unshift(notification);
          }
        }
      });
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error checking new messages:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkForNewNotifications();
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    const updatedNotifications = notificationList.map(notif =>
      notif.id === notification.id ? { ...notif, read: true } : notif
    );
    setNotificationList(updatedNotifications);
    
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to update notification', error);
    }

    // Handle action based on type
    switch (notification.actionType) {
      case 'view_listing':
        router.push({
          pathname: '/(tenant)/boarding-house-details',
          params: { id: notification.actionData.listingId }
        });
        break;
      
      case 'view_booking':
        router.push('/(tenant)/bookings');
        break;
      
      case 'view_payment':
        router.push('/(tenant)/payments');
        break;
      
      case 'view_message':
        router.push({
          pathname: '/(tenant)/chat',
          params: notification.actionData
        });
        break;
      
      default:
        break;
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
              setNotificationList([]);
            } catch (error) {
              console.error('Failed to clear notifications', error);
            }
          }
        }
      ]
    );
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notificationList.map(notif => ({ ...notif, read: true }));
    setNotificationList(updatedNotifications);
    
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_listing':
        return { name: 'home', color: '#3b82f6' };
      case 'booking_approved':
        return { name: 'checkmark-circle', color: '#10b981' };
      case 'booking_cancelled':
        return { name: 'close-circle', color: '#ef4444' };
      case 'payment_confirmed':
        return { name: 'card', color: '#10b981' };
      case 'payment_reminder':
        return { name: 'time', color: '#f59e0b' };
      case 'new_message':
        return { name: 'chatbubble', color: '#8b5cf6' };
      case 'price_drop':
        return { name: 'trending-down', color: '#10b981' };
      case 'favorite_available':
        return { name: 'heart', color: '#ef4444' };
      default:
        return { name: 'notifications', color: '#667eea' };
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifTime.toLocaleDateString();
  };

  const unreadCount = notificationList.filter(notif => !notif.read).length;

  const renderNotificationItem = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>
          
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.notificationTime}>{getTimeAgo(item.timestamp)}</Text>
          </View>
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Text style={[styles.headerButtonText, unreadCount === 0 && styles.disabledText]}>
              Mark all read
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={clearAllNotifications}
            disabled={notificationList.length === 0}
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={notificationList.length === 0 ? '#ccc' : '#ef4444'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {notificationList.length > 0 ? (
          <FlatList
            data={notificationList}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#667eea']}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#667eea',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledText: {
    color: '#ccc',
  },
  content: {
    flex: 1,
  },
  listContent: {
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
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    backgroundColor: '#f8faff',
  },
  notificationContent: {
    flexDirection: 'row',
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
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  emptyState: {
    flex: 1,
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
    paddingHorizontal: 40,
  },
});