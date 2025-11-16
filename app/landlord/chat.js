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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANDLORD_INQUIRIES_KEY = '@landlord_inquiries';
const TENANT_MESSAGES_KEY = '@tenant_messages';

export default function LandlordChat() {
  const { tenantId, tenantName, tenantImage, property } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

 
  const currentLandlord = {
    id: 'landlord_walter_white_01',
    name: 'Walter White',
    image: 'https://lucien0maverick.wordpress.com/wp-content/uploads/2014/07/walter-white.jpg',
  };

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const json = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
        const all = json != null ? JSON.parse(json) : [];
        const contactKey = (c) => (c?.id || c?.email || c?.phone || c?.name || '').toString();

        
        const map = {};
        all.forEach(conv => {
          const key = contactKey(conv.tenant);
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
        if (deduped.length !== all.length) {
          await AsyncStorage.setItem(LANDLORD_INQUIRIES_KEY, JSON.stringify(deduped));
        }

        const convo = deduped.find(c => c.tenant && contactKey(c.tenant) === (tenantId ? tenantId.toString() : ''));
        setMessages(convo?.history || []);
      } catch (e) {
        console.error('Failed to load landlord conversation', e);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [tenantId]);

  const handleDeleteConversation = () => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This will remove it only from your inbox.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const json = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
            let all = json != null ? JSON.parse(json) : [];
            const contactKey = (c) => (c?.id || c?.email || c?.phone || c?.name || '').toString();
            const tenantKey = tenantId ? tenantId.toString() : '';
            all = all.filter(c => !(c.tenant && contactKey(c.tenant) === tenantKey));
            await AsyncStorage.setItem(LANDLORD_INQUIRIES_KEY, JSON.stringify(all));
            setMessages([]);
            router.back();
          } catch (e) {
            console.error('Failed to delete landlord conversation', e);
            Alert.alert('Error', 'Failed to delete conversation.');
          }
        }}
      ]
    );
  };

  const handleSend = useCallback(async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      id: `msg_${Date.now()}`,
      sender: currentLandlord.id,
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      
      const json = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
      let all = json != null ? JSON.parse(json) : [];

      const idx = all.findIndex(c => c.tenant?.id === tenantId);
      if (idx > -1) {
        if (!all[idx].history) all[idx].history = [];
        all[idx].history.unshift(messageData);
        all[idx].lastMessage = messageData.text;
        all[idx].time = 'Just now';
        all[idx].unread = false;
      } else {
        all.unshift({
          id: `inq_${Date.now()}`,
          tenant: { id: tenantId, name: tenantName, image: tenantImage },
          property: property || 'Property',
          lastMessage: messageData.text,
          time: 'Just now',
          unread: false,
          status: 'responded',
          history: [messageData],
        });
      }

      await AsyncStorage.setItem(LANDLORD_INQUIRIES_KEY, JSON.stringify(all));

    
      const tenantJson = await AsyncStorage.getItem(TENANT_MESSAGES_KEY);
      let tenantConvos = tenantJson != null ? JSON.parse(tenantJson) : [];

      const matchContact = (a, b) => {
        if (!a || !b) return false;
        if (a.id && b.id && a.id === b.id) return true;
        if (a.email && b.email && a.email === b.email) return true;
        if (a.phone && b.phone && a.phone === b.phone) return true;
        if (a.name && b.name && a.name === b.name) return true;
        return false;
      };

      const tIdx = tenantConvos.findIndex(c => matchContact(c.landlord, currentLandlord));
      if (tIdx > -1) {
        if (!tenantConvos[tIdx].history) tenantConvos[tIdx].history = [];
        tenantConvos[tIdx].history.unshift(messageData);
        tenantConvos[tIdx].lastMessage = messageData.text;
        tenantConvos[tIdx].time = 'Just now';
        tenantConvos[tIdx].unread = true;
      } else {
        tenantConvos.unshift({
          id: `convo_${Date.now()}`,
          landlord: { id: currentLandlord.id, name: currentLandlord.name, image: currentLandlord.image },
          houseName: property || 'Property',
          lastMessage: messageData.text,
          time: 'Just now',
          unread: true,
          history: [messageData],
        });
      }

      await AsyncStorage.setItem(TENANT_MESSAGES_KEY, JSON.stringify(tenantConvos));

      
      setMessages(prev => [messageData, ...prev]);
      setNewMessage('');
    } catch (e) {
      console.error('Failed to send landlord message', e);
      Alert.alert('Error', 'Failed to send message.');
    }
  }, [newMessage, tenantId, tenantName, tenantImage, property]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {tenantImage && <Image source={{ uri: tenantImage }} style={styles.avatar} />}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{tenantName}</Text>
          {property && <Text style={styles.headerSubtitle}>{property}</Text>}
        </View>
        <TouchableOpacity style={{ padding: 8 }} onPress={handleDeleteConversation}>
          <Ionicons name="trash" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.sender === currentLandlord.id ? styles.myMessage : styles.otherMessage]}>
            <Text style={item.sender === currentLandlord.id ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
            <Text style={styles.messageTime}>{item.timestamp}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a reply..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
  backButton: { padding: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666' },
  messageBubble: { padding: 12, borderRadius: 18, marginVertical: 6, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#667eea' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb' },
  myMessageText: { color: 'white', fontSize: 16 },
  otherMessageText: { color: '#333', fontSize: 16 },
  messageTime: { fontSize: 10, color: 'rgba(0,0,0,0.5)', alignSelf: 'flex-end', marginTop: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#e5e5e5', backgroundColor: 'white' },
  textInput: { flex: 1, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, marginRight: 10, maxHeight: 100 },
  sendButton: { backgroundColor: '#667eea', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
