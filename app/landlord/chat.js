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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const LANDLORD_INQUIRIES_KEY = '@landlord_inquiries';
const TENANT_MESSAGES_KEY = '@tenant_messages';
const BOOKINGS_STORAGE_KEY = '@bookings_data';

export default function LandlordChat() {
  const { tenantId, tenantName, tenantImage, property } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const currentLandlord = {
    id: 'landlord_walter_white_01',
    name: 'Walter White',
    image: 'https://lucien0maverick.wordpress.com/wp-content/uploads/2014/07/walter-white.jpg',
  };

  useEffect(() => {
    loadConversation();
  }, [tenantId]);

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
      const convo = deduped.find(c => c.tenant && contactKey(c.tenant) === (tenantId ? tenantId.toString() : ''));
      setMessages(convo?.history || []);
    } catch (e) {
      console.error('Failed to load landlord conversation', e);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      sender: currentLandlord.id,
      text: text.trim(),
      image: imageUri,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: imageUri ? 'image' : 'text',
    };

    try {
      // Update landlord inquiries
      const json = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
      let all = json != null ? JSON.parse(json) : [];

      const idx = all.findIndex(c => c.tenant?.id === tenantId);
      if (idx > -1) {
        if (!all[idx].history) all[idx].history = [];
        all[idx].history.unshift(messageData);
        all[idx].lastMessage = messageData.text || '📷 Image';
        all[idx].time = 'Just now';
        all[idx].unread = false;
      } else {
        all.unshift({
          id: `inq_${Date.now()}`,
          tenant: { id: tenantId, name: tenantName, image: tenantImage },
          property: property || 'Property',
          lastMessage: messageData.text || '📷 Image',
          time: 'Just now',
          unread: false,
          status: 'responded',
          history: [messageData],
        });
      }

      await AsyncStorage.setItem(LANDLORD_INQUIRIES_KEY, JSON.stringify(all));

      // Update tenant messages
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
        tenantConvos[tIdx].lastMessage = messageData.text || '📷 Image';
        tenantConvos[tIdx].time = 'Just now';
        tenantConvos[tIdx].unread = true;
      } else {
        tenantConvos.unshift({
          id: `convo_${Date.now()}`,
          landlord: { id: currentLandlord.id, name: currentLandlord.name, image: currentLandlord.image },
          houseName: property || 'Property',
          lastMessage: messageData.text || '📷 Image',
          time: 'Just now',
          unread: true,
          history: [messageData],
        });
      }

      await AsyncStorage.setItem(TENANT_MESSAGES_KEY, JSON.stringify(tenantConvos));

      // Update UI
      setMessages(prev => [messageData, ...prev]);
      if (text) setNewMessage('');
    } catch (e) {
      console.error('Failed to send message', e);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  const handleSend = useCallback(() => {
    sendMessage(newMessage);
  }, [newMessage]);

  const handleApproveBooking = async (bookingMessage) => {
    try {
      // Extract booking details from message
      const bookingDetails = {
        id: `booking_${Date.now()}`,
        tenantId: tenantId,
        tenantName: tenantName,
        landlordId: currentLandlord.id,
        landlordName: currentLandlord.name,
        property: property,
        status: 'approved',
        date: new Date().toISOString(),
        moveInDate: bookingMessage.bookingDate || 'Not specified',
        guests: bookingMessage.bookingGuests || '1',
        amount: bookingMessage.amount || 0,
        bookedAt: new Date().toISOString(),
      };

      // Save booking to storage
      const bookingsJson = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      const bookings = bookingsJson ? JSON.parse(bookingsJson) : [];
      bookings.push(bookingDetails);
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

      // Send approval message
      const approvalMessage = `✅ Booking Approved! \n\nYour booking for ${property} has been approved. \nMove-in date: ${bookingDetails.moveInDate} \nGuests: ${bookingDetails.guests} \n\nWe'll contact you soon for the next steps.`;
      await sendMessage(approvalMessage);

      setShowBookingModal(false);
      setSelectedBooking(null);
      
      Alert.alert('Booking Approved', 'The booking has been approved and the tenant has been notified.');
    } catch (error) {
      console.error('Failed to approve booking', error);
      Alert.alert('Error', 'Failed to approve booking.');
    }
  };

  const handleRejectBooking = async (bookingMessage) => {
    const rejectionMessage = `❌ Booking Declined \n\nUnfortunately, your booking request for ${property} cannot be accommodated at this time. \n\nReason: ${bookingMessage.reason || 'Not available for the requested dates.'}`;
    await sendMessage(rejectionMessage);
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const handleModifyBooking = async (bookingDetails) => {
    Alert.alert(
      'Modify Booking',
      'This would open a modification screen where you can adjust dates, pricing, or other details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          const modificationMessage = `📝 Booking Modification Requested \n\nI'd like to discuss some changes to your booking request. Let me know what works for you.`;
          sendMessage(modificationMessage);
          setShowBookingModal(false);
          setSelectedBooking(null);
        }}
      ]
    );
  };

  const extractBookingDetails = (message) => {
    // Simple parsing for booking messages
    if (message.text && message.text.toLowerCase().includes('book')) {
      return {
        isBooking: true,
        text: message.text,
        bookingDate: extractDate(message.text),
        bookingGuests: extractGuests(message.text),
        amount: extractAmount(message.text),
      };
    }
    return null;
  };

  const extractDate = (text) => {
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    return dateMatch ? dateMatch[0] : 'Not specified';
  };

  const extractGuests = (text) => {
    const guestMatch = text.match(/for (\d+) guest/);
    return guestMatch ? guestMatch[1] : '1';
  };

  const extractAmount = (text) => {
    const amountMatch = text.match(/₱(\d+)/);
    return amountMatch ? parseInt(amountMatch[1]) : 0;
  };

  const renderMessage = ({ item }) => {
    const bookingDetails = extractBookingDetails(item);
    
    return (
      <View style={[styles.messageBubble, item.sender === currentLandlord.id ? styles.myMessage : styles.otherMessage]}>
        {item.image ? (
          <TouchableOpacity onPress={() => Alert.alert('Image', 'View image full screen')}>
            <Image source={{ uri: item.image }} style={styles.messageImage} />
          </TouchableOpacity>
        ) : (
          <Text style={item.sender === currentLandlord.id ? styles.myMessageText : styles.otherMessageText}>
            {item.text}
          </Text>
        )}
        
        {bookingDetails?.isBooking && item.sender !== currentLandlord.id && (
          <TouchableOpacity 
            style={styles.bookingActionButton}
            onPress={() => {
              setSelectedBooking(bookingDetails);
              setShowBookingModal(true);
            }}
          >
            <Text style={styles.bookingActionText}>Manage Booking</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.messageTime}>{item.timestamp}</Text>
      </View>
    );
  };

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
        renderItem={renderMessage}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Ionicons name="image" size={24} color="#667eea" />
        </TouchableOpacity>
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

      {/* Booking Management Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Booking Request</Text>
            <Text style={styles.modalSubtitle}>
              {tenantName} wants to book {property}
            </Text>
            
            {selectedBooking && (
              <View style={styles.bookingDetails}>
                <Text style={styles.bookingDetail}>Move-in Date: {selectedBooking.bookingDate}</Text>
                <Text style={styles.bookingDetail}>Guests: {selectedBooking.bookingGuests}</Text>
                <Text style={styles.bookingDetail}>Suggested Amount: ₱{selectedBooking.amount || 'To be discussed'}</Text>
                <Text style={styles.bookingMessage}>{selectedBooking.text}</Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.rejectButton]}
                onPress={() => handleRejectBooking(selectedBooking)}
              >
                <Text style={styles.rejectButtonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modifyButton]}
                onPress={() => handleModifyBooking(selectedBooking)}
              >
                <Text style={styles.modifyButtonText}>Modify</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.approveButton]}
                onPress={() => handleApproveBooking(selectedBooking)}
              >
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  messageBubble: { 
    padding: 12, 
    borderRadius: 18, 
    marginVertical: 6, 
    maxWidth: '80%',
    minWidth: 120,
  },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#667eea' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb' },
  myMessageText: { color: 'white', fontSize: 16 },
  otherMessageText: { color: '#333', fontSize: 16 },
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
    marginTop: 6 
  },
  bookingActionButton: {
    backgroundColor: '#f59e0b',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  bookingActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#e5e5e5', 
    backgroundColor: 'white' 
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
    maxHeight: 100 
  },
  sendButton: { 
    backgroundColor: '#667eea', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  bookingDetails: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  bookingDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bookingMessage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  modifyButton: {
    backgroundColor: '#f59e0b',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  modifyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  approveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});