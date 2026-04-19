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

const NOTIFICATIONS_STORAGE_KEY = '@landlord_notifications';
const LANDLORD_INQUIRIES_KEY = '@landlord_inquiries';
const BOOKINGS_STORAGE_KEY = '@bookings_data';
const PAYMENTS_STORAGE_KEY = '@payments_data';
const LISTINGS_STORAGE_KEY = '@landlord_listings';

const currentLandlord = {
  id: 'landlord_walter_white_01',
  name: 'Walter White',
};

export default function NotificationsScreen() {
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
      // Check for new booking requests
      await checkNewBookings();
      
      // Check for payment updates
      await checkPaymentUpdates();
      
      // Check for new inquiries/messages
      await checkNewInquiries();
      
      // Check for property views/interest
      await checkPropertyActivity();
      
      // Check for booking cancellations by tenants
      await checkBookingCancellations();
      
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const checkNewBookings = async () => {
    try {
      const bookingsJson = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!bookingsJson) return;
      
      const bookings = JSON.parse(bookingsJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Filter bookings for current landlord
      const landlordBookings = bookings.filter(b => b.landlordId === currentLandlord.id);
      
      landlordBookings.forEach(booking => {
        // Check for new booking requests (pending status)
        if (booking.status === 'pending') {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'new_booking' && notif.bookingId === booking.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `new_booking_${booking.id}_${Date.now()}`,
              type: 'new_booking',
              title: '📅 New Booking Request',
              message: `${booking.tenantName} wants to book ${booking.property} for ${booking.moveInDate}. ${booking.guests} guest(s).`,
              timestamp: new Date().toISOString(),
              read: false,
              bookingId: booking.id,
              actionType: 'view_booking',
              actionData: { 
                bookingId: booking.id,
                tenantId: booking.tenantId,
                tenantName: booking.tenantName
              }
            };
            
            existingNotifications.unshift(notification);
          }
        }
        
        // Check for booking confirmations (when tenant confirms approved booking)
        if (booking.status === 'approved' && booking.confirmedByTenant) {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'booking_confirmed' && notif.bookingId === booking.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `booking_confirmed_${booking.id}_${Date.now()}`,
              type: 'booking_confirmed',
              title: '✅ Booking Confirmed',
              message: `${booking.tenantName} has confirmed their booking for ${booking.property}. Move-in: ${booking.moveInDate}`,
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
      console.error('Error checking new bookings:', error);
    }
  };

  const checkBookingCancellations = async () => {
    try {
      const bookingsJson = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!bookingsJson) return;
      
      const bookings = JSON.parse(bookingsJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Filter bookings for current landlord that were cancelled by tenant
      const landlordBookings = bookings.filter(
        b => b.landlordId === currentLandlord.id && 
        b.status === 'cancelled' && 
        b.cancelledBy === 'tenant'
      );
      
      landlordBookings.forEach(booking => {
        const alreadyNotified = existingNotifications.some(
          notif => notif.type === 'booking_cancelled_tenant' && notif.bookingId === booking.id
        );
        
        if (!alreadyNotified) {
          const notification = {
            id: `booking_cancelled_tenant_${booking.id}_${Date.now()}`,
            type: 'booking_cancelled_tenant',
            title: '❌ Booking Cancelled by Tenant',
            message: `${booking.tenantName} cancelled their booking for ${booking.property}. Reason: ${booking.cancelReason || 'Not specified'}`,
            timestamp: new Date().toISOString(),
            read: false,
            bookingId: booking.id,
            actionType: 'view_booking',
            actionData: { bookingId: booking.id }
          };
          
          existingNotifications.unshift(notification);
        }
      });
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error checking booking cancellations:', error);
    }
  };

  const checkPaymentUpdates = async () => {
    try {
      const paymentsJson = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!paymentsJson) return;
      
      const payments = JSON.parse(paymentsJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Filter payments for current landlord
      const landlordPayments = payments.filter(p => p.landlordId === currentLandlord.id);
      
      landlordPayments.forEach(payment => {
        // Check for payment received
        if (payment.status === 'completed') {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'payment_received' && notif.paymentId === payment.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `payment_received_${payment.id}_${Date.now()}`,
              type: 'payment_received',
              title: '💰 Payment Received',
              message: `${payment.tenantName} paid ₱${payment.amount.toLocaleString()} for ${payment.property}. Payment confirmed.`,
              timestamp: new Date().toISOString(),
              read: false,
              paymentId: payment.id,
              actionType: 'view_payment',
              actionData: { paymentId: payment.id }
            };
            
            existingNotifications.unshift(notification);
          }
        }
        
        // Check for overdue payments
        if (payment.status === 'pending' && payment.dueDate) {
          const dueDate = new Date(payment.dueDate);
          const today = new Date();
          const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
          
          // Notify if payment is overdue
          if (daysOverdue > 0) {
            const alreadyNotified = existingNotifications.some(
              notif => notif.type === 'payment_overdue' && notif.paymentId === payment.id
            );
            
            if (!alreadyNotified) {
              const notification = {
                id: `payment_overdue_${payment.id}_${Date.now()}`,
                type: 'payment_overdue',
                title: '⚠️ Payment Overdue',
                message: `${payment.tenantName}'s rent payment of ₱${payment.amount.toLocaleString()} for ${payment.property} is ${daysOverdue} day(s) overdue.`,
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

  const checkNewInquiries = async () => {
    try {
      const inquiriesJson = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!inquiriesJson) return;
      
      const inquiries = JSON.parse(inquiriesJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      inquiries.forEach(inquiry => {
        // Check for new inquiries
        if (inquiry.unread) {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'new_inquiry' && 
            notif.inquiryId === inquiry.id &&
            notif.messageText === inquiry.lastMessage
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `new_inquiry_${inquiry.id}_${Date.now()}`,
              type: 'new_inquiry',
              title: '💬 New Inquiry',
              message: `${inquiry.tenant.name} is interested in ${inquiry.property}: "${inquiry.lastMessage}"`,
              timestamp: new Date().toISOString(),
              read: false,
              inquiryId: inquiry.id,
              messageText: inquiry.lastMessage,
              actionType: 'view_inquiry',
              actionData: {
                tenantId: inquiry.tenant.id,
                tenantName: inquiry.tenant.name,
                tenantImage: inquiry.tenant.image,
                property: inquiry.property
              }
            };
            
            existingNotifications.unshift(notification);
          }
        }
        
        // Check for status changes (interested -> ready_to_book)
        if (inquiry.status === 'ready_to_book') {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'ready_to_book' && notif.inquiryId === inquiry.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `ready_to_book_${inquiry.id}_${Date.now()}`,
              type: 'ready_to_book',
              title: '🎯 Tenant Ready to Book',
              message: `${inquiry.tenant.name} is ready to book ${inquiry.property}! Respond quickly to secure the booking.`,
              timestamp: new Date().toISOString(),
              read: false,
              inquiryId: inquiry.id,
              actionType: 'view_inquiry',
              actionData: {
                tenantId: inquiry.tenant.id,
                tenantName: inquiry.tenant.name,
                tenantImage: inquiry.tenant.image,
                property: inquiry.property
              }
            };
            
            existingNotifications.unshift(notification);
          }
        }
      });
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error checking new inquiries:', error);
    }
  };

  const checkPropertyActivity = async () => {
    try {
      const listingsJson = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (!listingsJson) return;
      
      const listings = JSON.parse(listingsJson);
      const existingNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      // Filter listings for current landlord
      const landlordListings = listings.filter(
        l => l.landlord?.id === currentLandlord.id
      );
      
      landlordListings.forEach(listing => {
        // Check for high view count milestones
        const viewMilestones = [10, 25, 50, 100, 250, 500];
        const views = listing.views || 0;
        
        viewMilestones.forEach(milestone => {
          if (views >= milestone) {
            const alreadyNotified = existingNotifications.some(
              notif => notif.type === 'view_milestone' && 
              notif.listingId === listing.id &&
              notif.milestone === milestone
            );
            
            if (!alreadyNotified) {
              const notification = {
                id: `view_milestone_${listing.id}_${milestone}_${Date.now()}`,
                type: 'view_milestone',
                title: '👀 Property Milestone',
                message: `${listing.name} has reached ${milestone} views! Your property is getting attention.`,
                timestamp: new Date().toISOString(),
                read: false,
                listingId: listing.id,
                milestone: milestone,
                actionType: 'view_listing',
                actionData: { listingId: listing.id }
              };
              
              existingNotifications.unshift(notification);
            }
          }
        });
        
        // Check for high inquiry rate
        const inquiryCount = listing.inquiries || 0;
        if (inquiryCount >= 5) {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'high_interest' && notif.listingId === listing.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `high_interest_${listing.id}_${Date.now()}`,
              type: 'high_interest',
              title: '🔥 High Interest Property',
              message: `${listing.name} has ${inquiryCount} inquiries! This property is in high demand.`,
              timestamp: new Date().toISOString(),
              read: false,
              listingId: listing.id,
              actionType: 'view_listing',
              actionData: { listingId: listing.id }
            };
            
            existingNotifications.unshift(notification);
          }
        }
        
        // Check for low occupancy alert
        if (listing.status === 'available' && listing.views > 50 && (listing.inquiries || 0) < 2) {
          const alreadyNotified = existingNotifications.some(
            notif => notif.type === 'low_engagement' && notif.listingId === listing.id
          );
          
          if (!alreadyNotified) {
            const notification = {
              id: `low_engagement_${listing.id}_${Date.now()}`,
              type: 'low_engagement',
              title: '📊 Low Engagement Alert',
              message: `${listing.name} has ${listing.views} views but few inquiries. Consider updating your listing or adjusting the price.`,
              timestamp: new Date().toISOString(),
              read: false,
              listingId: listing.id,
              actionType: 'view_listing',
              actionData: { listingId: listing.id }
            };
            
            existingNotifications.unshift(notification);
          }
        }
      });
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error checking property activity:', error);
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
      case 'view_booking':
        // Navigate to booking management or chat with tenant
        router.push({
          pathname: '/landlord/chat',
          params: notification.actionData
        });
        break;
      
      case 'view_payment':
        router.push('/landlord/financials');
        break;
      
      case 'view_inquiry':
        router.push({
          pathname: '/landlord/chat',
          params: notification.actionData
        });
        break;
      
      case 'view_listing':
        router.push({
          pathname: '/landlord/listing-details',
          params: { id: notification.actionData.listingId }
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
      case 'new_booking':
        return { name: 'calendar', color: '#3b82f6' };
      case 'booking_confirmed':
        return { name: 'checkmark-circle', color: '#10b981' };
      case 'booking_cancelled_tenant':
        return { name: 'close-circle', color: '#ef4444' };
      case 'payment_received':
        return { name: 'cash', color: '#10b981' };
      case 'payment_overdue':
        return { name: 'alert-circle', color: '#ef4444' };
      case 'new_inquiry':
        return { name: 'chatbubble', color: '#8b5cf6' };
      case 'ready_to_book':
        return { name: 'flame', color: '#f59e0b' };
      case 'view_milestone':
        return { name: 'eye', color: '#3b82f6' };
      case 'high_interest':
        return { name: 'trending-up', color: '#10b981' };
      case 'low_engagement':
        return { name: 'trending-down', color: '#f59e0b' };
      case 'review':
        return { name: 'star', color: '#f59e0b' };
      case 'maintenance':
        return { name: 'build', color: '#6b7280' };
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
    backgroundColor: '#f6f7fb',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#667eea',
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