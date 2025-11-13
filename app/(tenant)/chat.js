import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView, 
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { messages as mockConversations } from '../../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const TENANT_MESSAGES_KEY = '@tenant_messages'; 
// 1. ADDED: Define the key for the landlord's inbox
const LANDLORD_INQUIRIES_KEY = '@landlord_inquiries';

export default function ChatScreen() {
  const { landlordId, landlordName, houseName, landlordImage } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // 2. MODIFIED: We need a full tenant object to send to the landlord
  // This is mocked from your app/(tenant)/profile.js file
  const currentUser = {
      id: 'tenant_jesse_pinkman_01', // A unique ID for the tenant
      name: 'Jesse Pinkman',
      image: 'https://i.insider.com/5d9f454ee94e865e924818da?width=700',
      phone: '+1 234 567 8900'
  };
  const currentUserId = currentUser.id; // Use the new ID

  // This useEffect (loading the chat) is unchanged
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
        const allConversations = jsonValue != null ? JSON.parse(jsonValue) : [];
        
        const conversation = allConversations.find(
          (conv) => conv.landlord.id === landlordId
        );
        
        const initialMessages = conversation?.history || [];
        setMessages(initialMessages);
      } catch (e) {
        console.error("Failed to load conversation", e);
        setMessages([]);
      }
    };

    loadConversation();
  }, [landlordId]);

  
  // 3. MODIFIED: This function now saves to two different places
  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim()) {
      const messageText = newMessage.trim();
      const messageData = {
        id: `msg_${Date.now()}`,
        sender: currentUserId,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // --- PART 1: UPDATE TENANT'S OWN INBOX (Unchanged) ---
      setMessages((prevMessages) => [messageData, ...prevMessages]);
      setNewMessage('');

      try {
        const tenantJson = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
        let tenantConversations = tenantJson != null ? JSON.parse(tenantJson) : []; 

        const tenantConvoIndex = tenantConversations.findIndex(c => c.landlord.id === landlordId);

        if (tenantConvoIndex > -1) {
          if (!tenantConversations[tenantConvoIndex].history) {
            tenantConversations[tenantConvoIndex].history = [];
          }
          tenantConversations[tenantConvoIndex].history.unshift(messageData); 
          tenantConversations[tenantConvoIndex].lastMessage = messageText;
          tenantConversations[tenantConvoIndex].time = 'Just now';
          tenantConversations[tenantConvoIndex].unread = false; 
        } else {
          tenantConversations.unshift({
            id: `convo_${Date.now()}`,
            landlord: {
              id: landlordId,
              name: landlordName,
              image: landlordImage,
            },
            houseName: houseName || 'General Inquiry',
            lastMessage: messageText,
            time: 'Just now',
            unread: false,
            history: [messageData],
          });
        }
        await AsyncStorage.setItem(TENANT_MESSAGES_KEY, JSON.stringify(tenantConversations));
      } catch (e) {
        console.error("Failed to save tenant message", e); 
      }
      
      // --- PART 2: UPDATE LANDLORD'S INBOX (New Logic) ---
      try {
        const landlordJson = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
        let landlordInquiries = landlordJson != null ? JSON.parse(landlordJson) : [];
        
        // Find the conversation *from this tenant's ID*
        const landlordConvoIndex = landlordInquiries.findIndex(c => c.tenant.id === currentUser.id);

        if (landlordConvoIndex > -1) {
          // Landlord already has a thread with this tenant, update it
          if (!landlordInquiries[landlordConvoIndex].history) {
            landlordInquiries[landlordConvoIndex].history = [];
          }
          landlordInquiries[landlordConvoIndex].history.unshift(messageData);
          landlordInquiries[landlordConvoIndex].lastMessage = messageText;
          landlordInquiries[landlordConvoIndex].time = 'Just now';
          landlordInquiries[landlordConvoIndex].unread = true; // <-- True, because it's new for the landlord
          landlordInquiries[landlordConvoIndex].property = houseName || landlordInquiries[landlordConvoIndex].property;
          landlordInquiries[landlordConvoIndex].status = 'new';
        } else {
          // New inquiry from this tenant
          landlordInquiries.unshift({
            id: `inq_${Date.now()}`,
            tenant: currentUser, // Send the full tenant object
            property: houseName || 'General Inquiry',
            lastMessage: messageText,
            time: 'Just now',
            unread: true, // <-- True, new for landlord
            status: 'new',
            history: [messageData],
          });
        }
        
        // Save the updated list to the landlord's storage
        await AsyncStorage.setItem(LANDLORD_INQUIRIES_KEY, JSON.stringify(landlordInquiries));

      } catch (e) {
        console.error("Failed to save landlord inquiry", e);
      }
    }
  }, [newMessage, currentUserId, landlordId, landlordName, landlordImage, houseName]);

  // ... (rest of the file is unchanged) ...
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === currentUserId
          ? styles.myMessage
          : styles.otherMessage,
      ]}
    >
      <Text
        style={
          item.sender === currentUserId
            ? styles.myMessageText
            : styles.otherMessageText
        }
      >
        {item.text}
      </Text>
      <Text style={styles.messageTime}>{item.timestamp}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {landlordImage && <Image source={{ uri: landlordImage }} style={styles.avatar} />}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{landlordName}</Text>
          {houseName && <Text style={styles.headerSubtitle}>Regarding: {houseName}</Text>}
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ... (styles are unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  myMessageText: {
    color: 'white',
    fontSize: 16,
  },
  otherMessageText: {
    color: '#333',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#667eea',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});