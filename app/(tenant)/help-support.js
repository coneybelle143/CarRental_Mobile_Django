import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function HelpSupport() {
  const supportOptions = [
    {
      icon: 'help-circle',
      title: 'FAQs',
      description: 'Find answers to common questions',
      action: 'faq',
    },
    {
      icon: 'chatbubble-ellipses',
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'chat',
    },
    {
      icon: 'call',
      title: 'Call Support',
      description: 'Speak directly with our team',
      action: 'call',
    },
    {
      icon: 'mail',
      title: 'Email Support',
      description: 'Send us an email',
      action: 'email',
    },
    {
      icon: 'document-text',
      title: 'Terms & Conditions',
      description: 'Read our terms of service',
      action: 'terms',
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy Policy',
      description: 'Learn about our privacy practices',
      action: 'privacy',
    },
  ];

  const handleSupportAction = (action) => {
    switch (action) {
      case 'faq':
        Alert.alert('FAQs', 'FAQs section will be available soon!');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Connecting you to our support team...');
        break;
      case 'call':
        Linking.openURL('tel:+639123456789').catch(err =>
          Alert.alert('Error', 'Could not open phone app')
        );
        break;
      case 'email':
        Linking.openURL('mailto:support@boardease.com?subject=Tenant Support Request').catch(err =>
          Alert.alert('Error', 'Could not open email app')
        );
        break;
      case 'terms':
        Alert.alert('Terms & Conditions', 'Terms and conditions will be available soon!');
        break;
      case 'privacy':
        Alert.alert('Privacy Policy', 'Privacy policy will be available soon!');
        break;
      default:
        break;
    }
  };

  const emergencyContacts = [
    {
      name: 'Emergency Maintenance',
      phone: '+639123456790',
      description: '24/7 emergency repairs',
    },
    {
      name: 'Property Manager',
      phone: '+639123456791',
      description: 'Direct line to property manager',
    },
    {
      name: 'Campus Security',
      phone: '+639123456792',
      description: 'University security services',
    },
  ];

  const handleEmergencyCall = (phoneNumber, contactName) => {
    Alert.alert(
      'Emergency Call',
      `Call ${contactName} at ${phoneNumber}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => Linking.openURL(`tel:${phoneNumber}`).catch(err =>
            Alert.alert('Error', 'Could not open phone app')
          ),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Help & Support',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tenant)/menu')} style={{ paddingLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeDescription}>
            Get assistance with your bookings, accommodations, or any questions you may have as a student tenant.
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Support</Text>
          <View style={styles.optionsGrid}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionCard}
                onPress={() => handleSupportAction(option.action)}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={Colors?.primary || '#667eea'} 
                  />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionDescription}>
            Critical contacts for urgent accommodation matters
          </Text>
          <View style={styles.emergencyList}>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emergencyItem}
                onPress={() => handleEmergencyCall(contact.phone, contact.name)}
              >
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyName}>{contact.name}</Text>
                  <Text style={styles.emergencyDescription}>
                    {contact.description}
                  </Text>
                  <Text style={styles.emergencyPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.callButton}>
                  <Ionicons name="call" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Hours</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Monday - Friday</Text>
              <Text style={styles.hoursTime}>9:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Saturday</Text>
              <Text style={styles.hoursTime}>10:00 AM - 4:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Sunday</Text>
              <Text style={styles.hoursTime}>Emergency Only</Text>
            </View>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips for Tenants</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>
                Check our FAQs before contacting support for faster answers
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>
                Have your booking details ready when calling for support
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>
                Use the app to document any issues with photos for faster resolution
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>
                Contact your landlord directly for non-emergency maintenance requests
              </Text>
            </View>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>BoardEase Tenant v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 BoardEase. All rights reserved.</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 16,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  emergencyList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  emergencyPhone: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hoursDay: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  hoursTime: {
    fontSize: 14,
    color: '#666',
  },
  tipsCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#ccc',
  },
});