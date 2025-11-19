import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MessagesTabIcon, NotificationsTabIcon } from '../../components/TabBarBadge';

export default function TenantLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e5e5',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages" 
        options={{
          title: 'Messages',
          headerShown: false,
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <MessagesTabIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications" 
        options={{
          title: 'Notifications',
          headerShown: false,
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <NotificationsTabIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu" 
        options={{
          title: 'Menu',
          headerShown: false,
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="boarding-house-details"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="landlord-profile"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      
      {/* New screens added with headerShown: false */}
      <Tabs.Screen
        name="favorites"
        options={{
          headerShown: true,
          href: null,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="help-support"
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}