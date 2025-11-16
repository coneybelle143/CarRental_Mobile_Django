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
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { messages as mockConversations } from '../../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const TENANT_MESSAGES_KEY = '@tenant_messages'; 

const LANDLORD_INQUIRIES_KEY = '@landlord_inquiries';

export default function ChatScreen() {
  const { landlordId, landlordName, houseName, landlordImage } = useLocalSearchParams();
  const contactKey = (c) => (c?.id || c?.email || c?.phone || c?.name || '').toString();
  const landlordKey = landlordId ? landlordId.toString() : null;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationStatus, setConversationStatus] = useState(null);

 
  const currentUser = {
      id: 'tenant_jesse_pinkman_01',
      name: 'Jesse Pinkman',
      image: 'https://i.insider.com/5d9f454ee94e865e924818da?width=700',
      phone: '+1 234 567 8900'
  };
  const currentUserId = currentUser.id; 

 
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
        const allConversations = jsonValue != null ? JSON.parse(jsonValue) : [];
        
        const map = {};
        allConversations.forEach(conv => {
          const key = contactKey(conv.landlord);
          if (!map[key]) {
            map[key] = { ...conv };
            
            map[key].history = map[key].history || [];
          } else {
           
            const existingIds = new Set(map[key].history.map(m => m.id));
            const merged = [...map[key].history];
            (conv.history || []).forEach(m => { if (!existingIds.has(m.id)) merged.push(m); });
            map[key].history = merged;
           
            map[key].lastMessage = map[key].lastMessage || conv.lastMessage;
            map[key].time = map[key].time || conv.time;
            map[key].unread = map[key].unread || conv.unread;
          }
        });

        const deduped = Object.values(map);
       
        if (deduped.length !== allConversations.length) {
          await AsyncStorage.setItem(TENANT_MESSAGES_KEY, JSON.stringify(deduped));
        }

        const conversation = deduped.find(
          (conv) => contactKey(conv.landlord) === landlordKey
        );
        
        const initialMessages = conversation?.history || [];
        setMessages(initialMessages);
        setConversationStatus(conversation?.status || null);
      } catch (e) {
        console.error("Failed to load conversation", e);
        setMessages([]);
      }
    };

    loadConversation();
  }, [landlordId]);

  const handleDeleteConversation = () => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This will remove it only from your messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const jsonValue = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
            let allConversations = jsonValue != null ? JSON.parse(jsonValue) : [];
            allConversations = allConversations.filter(c => contactKey(c.landlord) !== landlordKey);
            await AsyncStorage.setItem(TENANT_MESSAGES_KEY, JSON.stringify(allConversations));
            setMessages([]);
            router.back();
          } catch (e) {
            console.error('Failed to delete conversation', e);
          }
        }}
      ]
    );
  };

  
  
  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim()) {
      const messageText = newMessage.trim();
      const messageData = {
        id: `msg_${Date.now()}`,
        sender: currentUserId,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

     
      setMessages((prevMessages) => [messageData, ...prevMessages]);
      setNewMessage('');

      try {
        const tenantJson = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
        let tenantConversations = tenantJson != null ? JSON.parse(tenantJson) : []; 

      const tenantConvoIndex = tenantConversations.findIndex(c => contactKey(c.landlord) === landlordKey);

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
      
     
      try {
        const landlordJson = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
        let landlordInquiries = landlordJson != null ? JSON.parse(landlordJson) : [];
        
    
        const landlordConvoIndex = landlordInquiries.findIndex(c => c.tenant.id === currentUser.id);
        

        if (landlordConvoIndex > -1) {
          
          if (!landlordInquiries[landlordConvoIndex].history) {
            landlordInquiries[landlordConvoIndex].history = [];
          }
          landlordInquiries[landlordConvoIndex].history.unshift(messageData);
          landlordInquiries[landlordConvoIndex].lastMessage = messageText;
          landlordInquiries[landlordConvoIndex].time = 'Just now';
          landlordInquiries[landlordConvoIndex].unread = true; 
          landlordInquiries[landlordConvoIndex].property = houseName || landlordInquiries[landlordConvoIndex].property;
          landlordInquiries[landlordConvoIndex].status = 'new';
        } else {
          
          landlordInquiries.unshift({
            id: `inq_${Date.now()}`,
            tenant: currentUser, 
            property: houseName || 'General Inquiry',
            lastMessage: messageText,
            time: 'Just now',
            unread: true,
            status: 'new',
            history: [messageData],
          });
        }
        
        
        await AsyncStorage.setItem(LANDLORD_INQUIRIES_KEY, JSON.stringify(landlordInquiries));

      } catch (e) {
        console.error("Failed to save landlord inquiry", e);
      }
    }
  }, [newMessage, currentUserId, landlordId, landlordName, landlordImage, houseName]);

  
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
          {conversationStatus ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {conversationStatus === 'ready_to_book' ? 'Booking Request' : (conversationStatus === 'interested' ? 'Interested' : conversationStatus)}
              </Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity style={{ padding: 8 }} onPress={handleDeleteConversation}>
          <Ionicons name="trash" size={22} color="#ef4444" />
        </TouchableOpacity>
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
  statusBadge: {
    marginTop: 6,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
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