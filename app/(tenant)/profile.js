// app/(tenant)/profile.js
import React, { useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

export default function Profile() {
  const [userData, setUserData] = React.useState({
    name: 'Jesse Pinkman',
    email: 'jessepinkmanyo@gmail.com',
    phone: '+1 234 567 8900',
    bio: 'Looking for a cozy boarding house near Xavier University. Prefer quiet neighborhoods with good internet connection.',
    type: 'Tenant',
    photoURL: 'https://i.insider.com/5d9f454ee94e865e924818da?width=700'
  });

  const [isEditing, setIsEditing] = React.useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset any changes here if needed
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile photo.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUserData({...userData, photoURL: result.assets[0].uri});
      }
    } catch (err) {
      console.warn('Image pick error', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

    // Handle System Back Action
  useFocusEffect(
    useCallback(() => {
      
      const handleBackPress = () => {
        // This function is executed when the system "Back" action occurs.
        router.replace('/(tenant)/menu');
        
        return true; 
      };
      let backHandlerSubscription; // variable to hold the listener object

      if (Platform.OS === 'android') {
        // listener and capture the returned subscription object
        backHandlerSubscription = BackHandler.addEventListener(
          'hardwareBackPress', 
          handleBackPress
        );
      }
      //Removes the listener when the screen is no longer focused.
      return () => {
        if (Platform.OS === 'android' && backHandlerSubscription) {
          backHandlerSubscription.remove();
        }
      };
    }, []) 
  );
  
  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUserData({...userData, photoURL: result.assets[0].uri});
      }
    } catch (err) {
      console.warn('Camera error', err);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const stats = [
    { label: 'Saved', value: '12', icon: 'heart' },
    { label: 'Viewed', value: '24', icon: 'eye' },
    { label: 'Applied', value: '5', icon: 'document-text' },
  ];

  const contactInfo = [
    { label: 'Email', value: userData.email, icon: 'mail' },
    { label: 'Phone', value: userData.phone, icon: 'call' },
    { label: 'Status', value: 'Active', icon: 'checkmark-circle' },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tenant)/menu')}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={isEditing ? handleCancelEdit : () => setIsEditing(true)}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.page} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={isEditing ? showImagePickerOptions : null}
            disabled={!isEditing}
          >
            <Image
              source={{ uri: userData.photoURL }}
              style={styles.profileImage}
            />
            {isEditing && (
              <View style={styles.editPhotoOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          {isEditing ? (
            <>
              <TextInput
                style={styles.editNameInput}
                value={userData.name}
                onChangeText={(text) => setUserData({...userData, name: text})}
                placeholder="Your name"
              />
            </>
          ) : (
            <>
              <Text style={styles.name}>{userData.name}</Text>
              <Text style={styles.userType}>{userData.type}</Text>
            </>
          )}
          
          <View style={styles.verificationSection}>
            <Text style={styles.joinDate}>Member since 2023</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name={stat.icon} size={20} color="#667eea" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* About Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={styles.editBioInput}
              value={userData.bio}
              onChangeText={(text) => setUserData({...userData, bio: text})}
              placeholder="Tell us about yourself and what you're looking for..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.bioText}>{userData.bio}</Text>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactList}>
            {contactInfo.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Ionicons name={contact.icon} size={18} color="#667eea" />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>{contact.label}</Text>
                  {isEditing && contact.label === 'Email' ? (
                    <TextInput
                      style={styles.editContactInput}
                      value={userData.email}
                      onChangeText={(text) => setUserData({...userData, email: text})}
                      placeholder="Email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  ) : isEditing && contact.label === 'Phone' ? (
                    <TextInput
                      style={styles.editContactInput}
                      value={userData.phone}
                      onChangeText={(text) => setUserData({...userData, phone: text})}
                      placeholder="Phone number"
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text style={styles.contactValue}>{contact.value}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editButtonBottom}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create" size={20} color="#667eea" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#667eea',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    padding: 8,
  },
  page: {
    backgroundColor: '#f6f7fb',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#667eea',
  },
  editPhotoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  editNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#667eea',
    width: '100%',
    padding: 4,
  },
  userType: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  verificationSection: {
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 12,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  editBioInput: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contactList: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  editContactInput: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#667eea',
    padding: 4,
  },
  editActions: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 16,
  },
  editButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 40,
  },
  editButtonText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 16,
  },
});