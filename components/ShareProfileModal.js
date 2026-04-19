import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/Colors';

const ShareProfileModal = ({ visible, onClose, user }) => {
  const [qrCodeError, setQrCodeError] = useState(false);

  if (!user) return null;

  // Create a profile slug from the user's name
  const createProfileSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  // Generate profile URL with slugified name or fallback to email
  const profileSlug = user.name ? createProfileSlug(user.name) : user.email;
  const profileUrl = `https://boardease.app/landlord/${profileSlug}`;

  // Safe QR Code rendering with error handling
  const renderQRCode = () => {
    if (qrCodeError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={40} color={Colors.error || '#ff0000'} />
          <Text style={styles.errorText}>
            Unable to generate QR code at this time
          </Text>
        </View>
      );
    }
    
    try {
      return (
        <QRCode
          value={profileUrl}
          size={220}
          logo={user.photoURL ? { uri: user.photoURL } : undefined}
          logoSize={40}
          logoBackgroundColor="white"
          logoBorderRadius={20}
          onError={() => setQrCodeError(true)}
        />
      );
    } catch (error) {
      console.error('Error rendering QR code:', error);
      setQrCodeError(true);
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={40} color={Colors.error || '#ff0000'} />
          <Text style={styles.errorText}>
            Unable to generate QR code at this time
          </Text>
        </View>
      );
    }
  };

  const onShare = async () => {
    try {
      const shareOptions = {
        title: 'Share Landlord Profile',
        message: `Check out ${user.name} on BoardEase`,
      };

      // Platform-specific options
      if (Platform.OS === 'ios') {
        shareOptions.url = profileUrl;
        shareOptions.subject = 'BoardEase Landlord Profile';
      } else {
        shareOptions.message = `Check out ${user.name} on BoardEase: ${profileUrl}`;
      }

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        // Share was successful
        console.log('Share was successful');
      } else if (result.action === Share.dismissedAction) {
        // Share was dismissed
        console.log('Share was dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
      // Here you could show a toast message to the user
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            accessibilityLabel="Close share modal"
            accessibilityRole="button"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={30} color="#ccc" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Share Profile</Text>

          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
              accessibilityLabel={`Profile picture of ${user.name}`}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>

          <View style={styles.qrContainer}>
            {renderQRCode()}
          </View>

          <Text style={styles.shareInstructions}>
            Scan this QR code to view the landlord's profile.
          </Text>

          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={onShare}
            accessibilityLabel="Share profile link"
            accessibilityRole="button"
          >
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: { 
    position: 'absolute', 
    top: 15, 
    right: 15,
    zIndex: 1,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333',
    textAlign: 'center',
  },
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 25, 
    width: '100%',
  },
  profileImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333',
  },
  profileEmail: { 
    fontSize: 14, 
    color: '#666',
    marginTop: 2,
  },
  qrContainer: {
    marginBottom: 25,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.error || '#ff0000',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    marginTop: 10,
  },
  shareInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  shareButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    marginLeft: 10, 
    fontSize: 16,
  },
});

export default React.memo(ShareProfileModal);