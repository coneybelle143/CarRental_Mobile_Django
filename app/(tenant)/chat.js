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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import * as ImagePicker from 'expo-image-picker';

const TENANT_MESSAGES_KEY = '@tenant_messages'; 
const LANDLORD_INQUIRIES_KEY = '@landlord_inquiries';

export default function ChatScreen() {
  const { landlordId, landlordEmail, landlordPhone, landlordName, houseName, landlordImage } = useLocalSearchParams();
  
  // Create a flexible landlord key that tries to match by any available identifier
  const createFlexibleKey = () => {
    if (landlordId) return landlordId.toString();
    if (landlordEmail) return landlordEmail.toString();
    if (landlordPhone) return landlordPhone.toString();
    if (landlordName) return landlordName.toString();
    return '';
  };
  
  const landlordKey = createFlexibleKey();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationStatus, setConversationStatus] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const currentUser = {
    id: 'tenant_jesse_pinkman_01',
    name: 'Jesse Pinkman',
    image: 'https://i.insider.com/5d9f454ee94e865e924818da?width=700',
    phone: '+1 234 567 8900'
  };
  const currentUserId = currentUser.id;

  useEffect(() => {
    loadConversation();
  }, [landlordId]);

  const loadConversation = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
      const allConversations = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // Find conversation using flexible matching
      const conversation = allConversations.find(conv => {
        const convLandlord = conv.landlord || {};
        return (
          (landlordId && convLandlord.id === landlordId) ||
          (landlordEmail && convLandlord.email === landlordEmail) ||
          (landlordPhone && convLandlord.phone === landlordPhone) ||
          (landlordName && convLandlord.name === landlordName)
        );
      });
      
      if (conversation) {
        const initialMessages = conversation.history || [];
        setMessages(initialMessages);
        setConversationStatus(conversation.status || null);
        setConversationId(conversation.id);
      } else {
        setMessages([]);
        setConversationStatus(null);
        setConversationId(null);
      }
    } catch (e) {
      console.error("Failed to load conversation", e);
      setMessages([]);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await sendMessage('', result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image pick error', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const sendMessage = async (text = '', imageUri = '') => {
    if (!text.trim() && !imageUri) return;

    const messageData = {
      id: `msg_${Date.now()}`,
      sender: currentUserId,
      text: text.trim(),
      image: imageUri,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: imageUri ? 'image' : 'text',
    };

    // Update UI immediately
    setMessages((prevMessages) => [messageData, ...prevMessages]);
    if (text) setNewMessage('');

    try {
      // Update tenant messages
      const tenantJson = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
      let tenantConversations = tenantJson != null ? JSON.parse(tenantJson) : [];

      const tenantConvoIndex = tenantConversations.findIndex(c => {
        const convLandlord = c.landlord || {};
        return (
          (landlordId && convLandlord.id === landlordId) ||
          (landlordEmail && convLandlord.email === landlordEmail) ||
          (landlordPhone && convLandlord.phone === landlordPhone) ||
          (landlordName && convLandlord.name === landlordName)
        );
      });

      if (tenantConvoIndex > -1) {
        if (!tenantConversations[tenantConvoIndex].history) {
          tenantConversations[tenantConvoIndex].history = [];
        }
        tenantConversations[tenantConvoIndex].history.unshift(messageData);
        tenantConversations[tenantConvoIndex].lastMessage = messageData.text || '📷 Image';
        tenantConversations[tenantConvoIndex].time = 'Just now';
        tenantConversations[tenantConvoIndex].unread = false;
      } else {
        const newConversation = {
          id: `convo_${Date.now()}`,
          landlord: {
            id: landlordId,
            email: landlordEmail,
            phone: landlordPhone,
            name: landlordName,
            image: landlordImage,
          },
          houseName: houseName || 'General Inquiry',
          lastMessage: messageData.text || '📷 Image',
          time: 'Just now',
          unread: false,
          history: [messageData],
        };
        tenantConversations.unshift(newConversation);
        setConversationId(newConversation.id);
      }
      await AsyncStorage.setItem(TENANT_MESSAGES_KEY, JSON.stringify(tenantConversations));
    } catch (e) {
      console.error("Failed to save tenant message", e);
    }
    
    try {
      // Update landlord inquiries
      const landlordJson = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
      let landlordInquiries = landlordJson != null ? JSON.parse(landlordJson) : [];
      
      const landlordConvoIndex = landlordInquiries.findIndex(c => c.tenant.id === currentUser.id);

      if (landlordConvoIndex > -1) {
        if (!landlordInquiries[landlordConvoIndex].history) {
          landlordInquiries[landlordConvoIndex].history = [];
        }
        landlordInquiries[landlordConvoIndex].history.unshift(messageData);
        landlordInquiries[landlordConvoIndex].lastMessage = messageData.text || '📷 Image';
        landlordInquiries[landlordConvoIndex].time = 'Just now';
        landlordInquiries[landlordConvoIndex].unread = true;
        landlordInquiries[landlordConvoIndex].property = houseName || landlordInquiries[landlordConvoIndex].property;
        landlordInquiries[landlordConvoIndex].status = 'new';
      } else {
        landlordInquiries.unshift({
          id: `inq_${Date.now()}`,
          tenant: currentUser,
          property: houseName || 'General Inquiry',
          lastMessage: messageData.text || '📷 Image',
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
  };

  const handleSend = useCallback(() => {
    sendMessage(newMessage);
  }, [newMessage]);

  const handleDeleteConversation = () => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // Remove conversation from tenant messages
              const tenantJson = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
              let tenantConversations = tenantJson != null ? JSON.parse(tenantJson) : [];
              
              const updatedConversations = tenantConversations.filter(conv => {
                const convLandlord = conv.landlord || {};
                return !(
                  (landlordId && convLandlord.id === landlordId) ||
                  (landlordEmail && convLandlord.email === landlordEmail) ||
                  (landlordPhone && convLandlord.phone === landlordPhone) ||
                  (landlordName && convLandlord.name === landlordName)
                );
              });
              
              await AsyncStorage.setItem(TENANT_MESSAGES_KEY, JSON.stringify(updatedConversations));
              
              // Clear local state and navigate back
              setMessages([]);
              router.back();
            } catch (e) {
              console.error('Failed to delete conversation', e);
              Alert.alert('Error', 'Failed to delete conversation.');
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === currentUserId
          ? styles.myMessage
          : styles.otherMessage,
      ]}
    >
      {item.image ? (
        <TouchableOpacity onPress={() => Alert.alert('Image', 'View image full screen')}>
          <Image source={{ uri: item.image }} style={styles.messageImage} />
        </TouchableOpacity>
      ) : (
        <Text
          style={
            item.sender === currentUserId
              ? styles.myMessageText
              : styles.otherMessageText
          }
        >
          {item.text}
        </Text>
      )}
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
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Ionicons name="image" size={24} color="#667eea" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
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
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
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
  attachButton: {
    padding: 8,
    marginRight: 8,
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