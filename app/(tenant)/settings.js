import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [showSavedProperties, setShowSavedProperties] = useState(true);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications',
          title: 'Push Notifications',
          description: 'Receive alerts for new listings and booking updates',
          value: pushNotifications,
          onValueChange: setPushNotifications,
          type: 'switch'
        },
        {
          icon: 'mail',
          title: 'Email Updates',
          description: 'Get new listing matches and recommendations',
          value: emailUpdates,
          onValueChange: setEmailUpdates,
          type: 'switch'
        },
        {
          icon: 'chatbubble',
          title: 'SMS Alerts',
          description: 'Important booking alerts via text message',
          value: smsAlerts,
          onValueChange: setSmsAlerts,
          type: 'switch'
        },
        {
          icon: 'location',
          title: 'Location Services',
          description: 'Show properties near your current location',
          value: locationServices,
          onValueChange: setLocationServices,
          type: 'switch'
        },
        {
          icon: 'heart',
          title: 'Show Saved Properties',
          description: 'Display your saved properties in search results',
          value: showSavedProperties,
          onValueChange: setShowSavedProperties,
          type: 'switch'
        }
      ]
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: 'cloud-upload',
          title: 'Auto Backup',
          description: 'Automatically backup your searches and preferences',
          value: autoBackup,
          onValueChange: setAutoBackup,
          type: 'switch'
        },
        {
          icon: 'download',
          title: 'Export Data',
          description: 'Download your search history and saved properties',
          type: 'action',
          onPress: () => Alert.alert('Export', 'Your data will be prepared for download.')
        },
        {
          icon: 'trash',
          title: 'Clear Search History',
          description: 'Remove your recent searches and filters',
          type: 'action',
          onPress: () => Alert.alert('History Cleared', 'Your search history has been removed.')
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'lock-closed',
          title: 'Privacy & Security',
          description: 'Manage your privacy settings',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy', 'Privacy settings screen')
        },
        {
          icon: 'card',
          title: 'Payment Methods',
          description: 'Manage your payment options for bookings',
          type: 'navigation',
          onPress: () => Alert.alert('Payment Methods', 'Payment methods screen')
        },
        {
          icon: 'document-text',
          title: 'Terms of Service',
          description: 'Read our terms and conditions',
          type: 'navigation',
          onPress: () => Alert.alert('Terms', 'Terms of service screen')
        },
        {
          icon: 'help-circle',
          title: 'Help & Support',
          description: 'Get help with using the app',
          type: 'navigation',
          onPress: () => Alert.alert('Help', 'Help and support screen')
        },
      ]
    }
  ];

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setPushNotifications(true);
            setEmailUpdates(true);
            setSmsAlerts(false);
            setAutoBackup(true);
            setLocationServices(true);
            setShowSavedProperties(true);
            Alert.alert('Success', 'All settings have been reset to default.');
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'App Settings',
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
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={item.onPress}
                  disabled={item.type === 'switch'}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <Ionicons name={item.icon} size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingDescription}>{item.description}</Text>
                    </View>
                  </View>
                  
                  {item.type === 'switch' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: '#f1f5f9', true: '#c7d2fe' }}
                      thumbColor={item.value ? Colors.primary : '#f8fafc'}
                    />
                  )}
                  
                  {(item.type === 'action' || item.type === 'navigation') && (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Reset Settings Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
          <Ionicons name="refresh" size={20} color="#666" />
          <Text style={styles.resetButtonText}>Reset to Default Settings</Text>
        </TouchableOpacity>

        {/* Version Information */}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
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