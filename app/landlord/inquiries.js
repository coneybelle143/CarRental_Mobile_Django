import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InquiriesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
        title: 'Tenant Inquiries',
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.push('/landlord/menu')} style={{ paddingLeft: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          ),
        }}
      />
    <View style={styles.container}>
      <Text style={styles.title}>Property Inquiries (Messages)</Text>
      <Text style={styles.subtitle}>List of incoming messages from prospective tenants.</Text>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f7fb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  }
});