import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { useAuth } from './AuthContext';

export default function LandlordProfile() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  
  const [name, setName] = useState(user?.name || 'Walter White');
  const [email, setEmail] = useState(user?.email || 'wwhite@los-pollos.com');
  const [phone, setPhone] = useState(user?.phone || '+63 912 345 6789');
  const [bio, setBio] = useState(user?.bio || 'Professional landlord with 5+ years of experience providing quality student accommodations in CDO. All properties are well-maintained and located near universities.');
  const [company, setCompany] = useState(user?.company || 'Los Pollos Hermanos Properties');
  const [yearsExperience, setYearsExperience] = useState(user?.yearsExperience || '5');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || 'https://i.insider.com/5d9f454ee94e865e924818da?width=700');
  
 
  const [emailNotifications, setEmailNotifications] = useState(user?.settings?.emailNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(user?.settings?.smsNotifications ?? true);
  const [showContactInfo, setShowContactInfo] = useState(user?.settings?.showContactInfo ?? true);

  const landlordData = {
    name,
    email,
    phone,
    bio,
    company,
    yearsExperience,
    photoURL,
    joinDate: '2022-03-15',
    verified: true,
    totalProperties: 5,
    responseRate: '95%',
    responseTime: 'within 2 hours',
  };

  const stats = [
    { label: 'Properties', value: landlordData.totalProperties, icon: 'business' },
    { label: 'Years Experience', value: landlordData.yearsExperience, icon: 'trophy' },
    { label: 'Response Rate', value: landlordData.responseRate, icon: 'speedometer' },
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image pick error', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name and Email are required.');
      return;
    }

    
    const updatedUser = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      company: company.trim(),
      yearsExperience: yearsExperience,
      photoURL: photoURL,
      settings: {
        emailNotifications,
        smsNotifications,
        showContactInfo,
      },
    };

    login(updatedUser);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    
    setName(user?.name || 'Walter White');
    setEmail(user?.email || 'wwhite@los-pollos.com');
    setPhone(user?.phone || '+63 912 345 6789');
    setBio(user?.bio || 'Professional landlord with 5+ years of experience providing quality student accommodations in CDO. All properties are well-maintained and located near universities.');
    setCompany(user?.company || 'Los Pollos Hermanos Properties');
    setYearsExperience(user?.yearsExperience || '5');
    setPhotoURL(user?.photoURL || 'https://i.insider.com/5d9f454ee94e865e924818da?width=700');
    setIsEditing(false);
  };

  const contactInfo = [
    { label: 'Email', value: landlordData.email, icon: 'mail' },
    { label: 'Phone', value: landlordData.phone, icon: 'call' },
    { label: 'Response Time', value: landlordData.responseTime, icon: 'time' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)} 
              style={{ paddingRight: 16 }}
            >
              <Ionicons 
                name={isEditing ? "close" : "create-outline"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.page} contentContainerStyle={styles.container}>
        
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.photoContainer} 
            onPress={isEditing ? pickImage : null}
            disabled={!isEditing}
          >
            <Image
              source={{ uri: landlordData.photoURL }}
              style={styles.profileImage}
            />
            {isEditing && (
              <View style={styles.editPhotoOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
            {landlordData.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
            )}
          </TouchableOpacity>
          
          {isEditing ? (
            <>
              <TextInput
                style={styles.editNameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
              />
              <TextInput
                style={styles.editCompanyInput}
                value={company}
                onChangeText={setCompany}
                placeholder="Company name"
              />
            </>
          ) : (
            <>
              <Text style={styles.name}>{landlordData.name}</Text>
              <Text style={styles.company}>{landlordData.company}</Text>
            </>
          )}
          
          <View style={styles.verificationSection}>
            <View style={styles.verificationBadge}>
              <Ionicons 
                name={landlordData.verified ? "shield-checkmark" : "time"} 
                size={16} 
                color={landlordData.verified ? "#10b981" : "#666"} 
              />
              <Text style={[
                styles.verificationText,
                { color: landlordData.verified ? "#10b981" : "#666" }
              ]}>
                {landlordData.verified ? 'Verified Landlord' : 'Pending Verification'}
              </Text>
            </View>
            <Text style={styles.joinDate}>Member since {landlordData.joinDate}</Text>
          </View>
        </View>

        
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name={stat.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

       
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={styles.editBioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell tenants about yourself and your experience..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.bioText}>{landlordData.bio}</Text>
          )}
          <View style={styles.experienceBadge}>
            <Ionicons name="trophy" size={16} color="#f59e0b" />
            <Text style={styles.experienceText}>
              {landlordData.yearsExperience}+ years experience
            </Text>
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactList}>
            {contactInfo.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Ionicons name={contact.icon} size={18} color={Colors.primary} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>{contact.label}</Text>
                  {isEditing && contact.label === 'Email' ? (
                    <TextInput
                      style={styles.editContactInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email address"
                      keyboardType="email-address"
                    />
                  ) : isEditing && contact.label === 'Phone' ? (
                    <TextInput
                      style={styles.editContactInput}
                      value={phone}
                      onChangeText={setPhone}
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

       
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive booking requests and messages via email</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#f1f5f9', true: '#c7d2fe' }}
                thumbColor={emailNotifications ? Colors.primary : '#f8fafc'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>Get important updates via text message</Text>
              </View>
              <Switch
                value={smsNotifications}
                onValueChange={setSmsNotifications}
                trackColor={{ false: '#f1f5f9', true: '#c7d2fe' }}
                thumbColor={smsNotifications ? Colors.primary : '#f8fafc'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Show Contact Info</Text>
                <Text style={styles.settingDescription}>Display your contact information to tenants</Text>
              </View>
              <Switch
                value={showContactInfo}
                onValueChange={setShowContactInfo}
                trackColor={{ false: '#f1f5f9', true: '#c7d2fe' }}
                thumbColor={showContactInfo ? Colors.primary : '#f8fafc'}
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create" size={20} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f6f7fb',
    flex: 1,
  },
  container: {
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
    borderColor: Colors.primary,
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
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    borderBottomColor: Colors.primary,
    width: '100%',
    padding: 4,
  },
  company: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  editCompanyInput: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    width: '100%',
    padding: 4,
  },
  verificationSection: {
    alignItems: 'center',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 12,
  },
  editBioInput: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  experienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  experienceText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
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
    borderBottomColor: Colors.primary,
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  editActions: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.primary,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 40,
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});