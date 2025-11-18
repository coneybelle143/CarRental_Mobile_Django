// app/landlord/privacy-security.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from './AuthContext';

export default function PrivacySecurityScreen() {
  const { user } = useAuth();

  const handleViewPrivacyPolicy = () => {
    router.push('/landlord/privacy');
  };

  const handleViewTerms = () => {
    router.push('/landlord/terms');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy & Security',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Security Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={styles.statusTitle}>
              Security Status: {user ? 'Protected' : 'Please Log In'}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {user 
              ? `Welcome back, ${user.name || 'Landlord'}. Your account security is strong.`
              : 'Please log in to access all security features.'
            }
          </Text>
        </View>

        {/* Legal Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.sectionContent}>
            {/* Privacy Policy */}
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={handleViewPrivacyPolicy}
            >
              <View style={styles.legalLeft}>
                <View style={styles.legalIcon}>
                  <Ionicons name="document-text" size={20} color={Colors.primary} />
                </View>
                <View style={styles.legalText}>
                  <Text style={styles.legalTitle}>Privacy Policy</Text>
                  <Text style={styles.legalDescription}>
                    Read our data protection and privacy policy
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            {/* Terms of Service */}
            <TouchableOpacity 
              style={[styles.legalItem, { borderBottomWidth: 0 }]}
              onPress={handleViewTerms}
            >
              <View style={styles.legalLeft}>
                <View style={styles.legalIcon}>
                  <Ionicons name="document" size={20} color={Colors.primary} />
                </View>
                <View style={styles.legalText}>
                  <Text style={styles.legalTitle}>Terms of Service</Text>
                  <Text style={styles.legalDescription}>
                    Review our terms and conditions
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.updateSection}>
          <Text style={styles.updateText}>
            Last security review: {new Date().toLocaleDateString()}
          </Text>
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
  statusCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
  },
  statusDescription: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
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
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legalText: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  legalDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  updateSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  updateText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});