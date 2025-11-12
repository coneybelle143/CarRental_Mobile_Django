import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InquiriesScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      tenant: {
        name: 'Jesse Pinkman',
        image: 'https://i.insider.com/5d9f454ee94e865e924818da?width=700',
        phone: '+1 234 567 8900'
      },
      property: 'Sunrise Boarding House',
      lastMessage: 'Hi, is the room still available for March? I\'d like to schedule a viewing.',
      time: '2 hours ago',
      unread: true,
      status: 'new'
    },
    {
      id: '2',
      tenant: {
        name: 'Walter White',
        image: 'https://i.pinimg.com/736x/50/4d/ab/504dab425e2cda6b74b3fd57e56baa30.jpg',
        phone: '+1 234 567 8901'
      },
      property: 'CDO Student Dorm',
      lastMessage: 'Can you send me more photos of the shared bathroom?',
      time: '5 hours ago',
      unread: true,
      status: 'interested'
    },
    {
      id: '3',
      tenant: {
        name: 'Mike Ehrmantraut',
        image: 'https://static.wikia.nocookie.net/breakingbad/images/9/9f/Season_4_-_Mike.jpg/revision/latest?cb=20250728074206',
        phone: '+1 234 567 8902'
      },
      property: 'Green Valley Apartelle',
      lastMessage: 'I\'ll take it. When can I move in?',
      time: '1 day ago',
      unread: false,
      status: 'ready_to_book'
    },
    {
      id: '4',
      tenant: {
        name: 'Skyler White',
        image: 'https://ew.com/thmb/c-e9oofgxwj9jDc9qWm2RLVND1I=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/breaking-bad-anna-gunn-1-101ba7b9fc7443709d9b75e47aeb2e93.jpg',
        phone: '+1 234 567 8903'
      },
      property: 'Downtown Comfort',
      lastMessage: 'Do you allow pets? I have a small dog.',
      time: '2 days ago',
      unread: false,
      status: 'inquiry'
    },
    {
      id: '5',
      tenant: {
        name: 'Gustavo Fring',
        image: 'https://shapes.inc/api/public/avatar/gustavofring',
        phone: '+1 234 567 8904'
      },
      property: 'XU Area Boarding',
      lastMessage: 'The location is perfect for my employees. Do you offer corporate rates?',
      time: '3 days ago',
      unread: false,
      status: 'corporate'
    }
  ]);

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
    console.log('Opening chat with:', message.tenant.name);
   
  };

  const markAllAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, unread: false })));
  };

  const unreadCount = messages.filter(msg => msg.unread).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/landlord/menu')} style={{ paddingLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
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
            <Text style={styles.endOfListSubtext}>You're all caught up!</Text>
          </View>
        </ScrollView>
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
});