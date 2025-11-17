import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BoardingHouseCard from '../../components/BoardingHouseCard';

const FAVORITES_STORAGE_KEY = '@tenant_favorites';
const LISTINGS_STORAGE_KEY = '@landlord_listings';
const boardingHouses = require('../../data/mockData').boardingHouses;

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      const savedFavorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      
      // Get all listings to match with favorites
      const listingsJson = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
      const allListings = listingsJson ? JSON.parse(listingsJson) : boardingHouses;
      
      // Match favorite IDs with actual house data and deduplicate
      const favoriteHousesMap = new Map();
      savedFavorites.forEach(favId => {
        const house = allListings.find(house => String(house.id) === String(favId));
        if (house && house.id) {
          favoriteHousesMap.set(String(house.id), house);
        }
      });
      
      const favoriteHouses = Array.from(favoriteHousesMap.values());
      setFavorites(favoriteHouses);
    } catch (error) {
      console.error('Failed to load favorites', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromFavorites = async (houseId) => {
    try {
      const updatedFavorites = favorites.filter(house => house.id !== houseId);
      const favoriteIds = updatedFavorites.map(house => house.id);
      
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Failed to remove favorite', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const handleHousePress = (house) => {
    router.push({
      pathname: '/(tenant)/boarding-house-details',
      params: { id: house.id }
    });
  };

  const handleRemoveFavorite = (house) => {
    Alert.alert(
      'Remove Favorite',
      `Remove ${house.name} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromFavorites(house.id)
        }
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteItem}>
      <BoardingHouseCard 
        house={item} 
        onPress={() => handleHousePress(item)}
      />
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'My Favorites',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#667eea',
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
          }}
        />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Favorites',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#667eea',
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
        }}
      />

      <View style={styles.container}>
        {/* Content */}
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={[styles.centerContent, styles.emptyState]}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on boarding houses to add them to your favorites
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tenant)/home')}
            >
              <Text style={styles.browseButtonText}>Browse Houses</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  favoriteItem: {
    position: 'relative',
    marginBottom: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyState: {
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});