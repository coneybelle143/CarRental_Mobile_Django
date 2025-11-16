import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
const INQUIRIES_STORAGE_KEY = '@landlord_inquiries'; 
export default function InquiriesScreen() {
  const [messages, setMessages] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  
  const loadInquiries = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(INQUIRIES_STORAGE_KEY);
      if (jsonValue !== null) {
        setMessages(JSON.parse(jsonValue));
      } else {
        
        await AsyncStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify([]));
        setMessages([]);
      }
    } catch (e) {
      console.error("Failed to load inquiries", e);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadInquiries();
    }, [])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return '#3b82f6';
      case 'interested':
        return '#8b5cf6';
      case 'ready_to_book':
        return '#10b981';
      case 'inquiry':
        return '#f59e0b';
      case 'corporate':
        return '#6366f1';
      default:
        return '#667eea';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'interested':
        return 'Interested';
      case 'ready_to_book':
        return 'Ready to Book';
      case 'inquiry':
        return 'General Inquiry';
      case 'corporate':
        return 'Corporate';
      default:
        return 'Inquiry';
    }
  };

  const handleMessagePress = (message) => {
    
    (async () => {
      try {
        const updated = messages.map(m => m.id === message.id ? { ...m, unread: false } : m);
        await AsyncStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
        setMessages(updated);
      } catch (e) {
        console.error('Failed to mark read', e);
      }
      router.push({
        pathname: '/landlord/chat',
        params: {
          tenantId: message.tenant.id,
          tenantName: message.tenant.name,
          tenantImage: message.tenant.image,
          property: message.property,
        }
      });
    })();
  };

  
  const markAllAsRead = async () => {
    const readMessages = messages.map(msg => ({ ...msg, unread: false }));
    try {
      await AsyncStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(readMessages));
      setMessages(readMessages);
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const unreadCount = messages.filter(msg => msg.unread).length;

  
  if (isLoading) {
     return (
       <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Property Inquiries</Text>
            </View>
          </View>
          <ActivityIndicator size="large" color="#667eea" />
       </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerShown: false,
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Property Inquiries</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
            </Text>
          </View>
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
        
        
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No inquiries yet</Text>
            <Text style={styles.emptySubtext}>New inquiries from tenants will appear here.</Text>
          </View>
        ) : (
          <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
            {messages.map((message) => {
              const statusColor = getStatusColor(message.status);
              
              return (
                <TouchableOpacity
                  key={message.id}
                  style={[
                    styles.messageCard,
                    message.unread && styles.unreadMessage
                  ]}
                  onPress={() => handleMessagePress(message)}
                >
                  <View style={styles.messageHeader}>
                    <Image source={{ uri: message.tenant.image }} style={styles.tenantImage} />
                    <View style={styles.messageContent}>
                      <View style={styles.messageTopRow}>
                        <Text style={styles.tenantName} numberOfLines={1}>
                          {message.tenant.name}
                        </Text>
                        <Text style={styles.messageTime}>
                          {message.time}
                        </Text>
                      </View>
                      <View style={styles.messageMiddleRow}>
                        <Text style={styles.propertyName} numberOfLines={1}>
                          {message.property}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusText(message.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.lastMessage} numberOfLines={2}>
                        {message.lastMessage}
                      </Text>
                    </View>
                  </View>
                  {message.unread && (
                    <View style={styles.unreadIndicator} />
                  )}
                </TouchableOpacity>
              );
            })}
            
            
            <View style={styles.endOfList}>
              <Ionicons name="chatbubble-ellipses" size={32} color="#ccc" />
              <Text style={styles.endOfListText}>No more messages</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </>
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
  messagesList: {
    flex: 1,
    padding: 20,
  },
  messageCard: {
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
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    backgroundColor: '#f8faff',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tenantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  propertyName: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
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
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
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
  // ADDED: Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
  },
});