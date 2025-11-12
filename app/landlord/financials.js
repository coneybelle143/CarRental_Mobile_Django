import React from 'react';
import { View, Text, TouchableOpacity ,StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FinancialsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Financials & Payments',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/landlord/menu')} style={{ paddingLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Financials & Payments</Text>
        <Text style={styles.subtitle}>Track rent collections and view statements.</Text>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});