// app/(tenant)/landlord-profile.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { boardingHouses as mockData } from '../../data/mockData'; 

const LISTINGS_STORAGE_KEY = '@landlord_listings';

export default function LandlordProfile() {
  const { landlordId } = useLocalSearchParams(); // This 'landlordId' now contains the email
  const [landlord, setLandlord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLandlordData = async () => {
      if (!landlordId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const jsonValue = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
        const allListings = jsonValue != null ? JSON.parse(jsonValue) : mockData;
        
        // --- THIS IS THE FIX ---
        // Find the landlord by their email, not their ID
        const listing = allListings.find(h => h.landlord?.email === landlordId);
        // --- END OF FIX ---
        
        if (listing && listing.landlord) {
          setLandlord(listing.landlord);
        }
      } catch (e) {
        console.error("Failed to load landlord data", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandlordData();
  }, [landlordId]);

  // ... (rest of the file is unchanged) ...
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!landlord) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Landlord Profile</Text>
        </View>
        <Text style={{fontSize: 18, color: '#666'}}>Landlord not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Landlord Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: landlord.image || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{landlord.name}</Text>
          <View style={styles.userTypeContainer}>
             <Ionicons 
                name={landlord.verified ? "shield-checkmark" : "shield-outline"} 
                size={16} 
                color={landlord.verified ? "#10b981" : "#666"} 
              />
            <Text style={[styles.userType, {color: landlord.verified ? "#10b981" : "#666"}]}>
              {landlord.verified ? 'Verified Landlord' : 'Not Verified'}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.infoText}>{landlord.name}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.infoText}>{landlord.email}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.infoText}>{landlord.phone}</Text>
          </View>
        </View>

        {/* Other Listings (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Listings from {landlord.name}</Text>
          <Text style={styles.infoText}>This feature is coming soon.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ... (styles are unchanged) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#667eea',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  userType: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
});