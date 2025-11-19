import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { AppState } from 'react-native';

export const MessagesTabIcon = ({ color, size, focused }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadMessages();
      // Set up listener for app state changes
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription.remove();
    }, [])
  );

  const handleAppStateChange = (state) => {
    if (state === 'active') {
      loadUnreadMessages();
    }
  };

  const loadUnreadMessages = async () => {
    try {
      const messagesJson = await AsyncStorage.getItem('@tenant_messages');
      const tenantMessages = messagesJson ? JSON.parse(messagesJson) : [];
      const unread = tenantMessages.filter(msg => msg.unread).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load unread messages', error);
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="chatbubbles" size={size} color={color} />
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -6,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'white',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

export const NotificationsTabIcon = ({ color, size, focused }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadNotifications();
      // Set up listener for app state changes
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription.remove();
    }, [])
  );

  const handleAppStateChange = (state) => {
    if (state === 'active') {
      loadUnreadNotifications();
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const notificationsJson = await AsyncStorage.getItem('@tenant_notifications');
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      const unread = notifications.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load unread notifications', error);
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="notifications" size={size} color={color} />
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -6,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'white',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

export const InquiriesTabIcon = ({ color, size, focused }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadInquiries();
      // Set up listener for app state changes
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription.remove();
    }, [])
  );

  const handleAppStateChange = (state) => {
    if (state === 'active') {
      loadUnreadInquiries();
    }
  };

  const loadUnreadInquiries = async () => {
    try {
      const inquiriesJson = await AsyncStorage.getItem('@landlord_inquiries');
      const inquiries = inquiriesJson ? JSON.parse(inquiriesJson) : [];
      const unread = inquiries.filter(inq => inq.unread).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load unread inquiries', error);
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="chatbubbles" size={size} color={color} />
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -6,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'white',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

export const LandlordNotificationsTabIcon = ({ color, size, focused }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadNotifications();
      // Set up listener for app state changes
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription.remove();
    }, [])
  );

  const handleAppStateChange = (state) => {
    if (state === 'active') {
      loadUnreadNotifications();
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const notificationsJson = await AsyncStorage.getItem('@landlord_notifications');
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      const unread = notifications.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load unread notifications', error);
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="notifications" size={size} color={color} />
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -6,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'white',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};
