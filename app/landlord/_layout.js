import React, { useState, useCallback, useEffect } from 'react'; // ADDED: useEffect
import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; // ADDED: ActivityIndicator
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { boardingHouses } from '../../data/mockData'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // ADDED

// ADDED: A unique key to save your data
const LISTINGS_STORAGE_KEY = '@landlord_listings';

export const GlobalListingContext = React.createContext({
    listings: boardingHouses,
    updateListing: () => {},
    deleteListing: () => {},
});

export default function LandlordLayout() {
  const primaryColor = Colors.primary || '#667eea'; 
 
  const [listingsData, setListingsData] = useState([]); // CHANGED: Start with empty
  const [isLoading, setIsLoading] = useState(true); // ADDED: Loading state

  // ADDED: 1. Load data from storage when the app starts
  useEffect(() => {
    const loadListingsFromStorage = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
        if (jsonValue !== null) {
          // We found saved data
          setListingsData(JSON.parse(jsonValue));
        } else {
          // No saved data, so use the mock data for the first time
          setListingsData(boardingHouses);
        }
      } catch (e) {
        console.error("Failed to load listings", e);
        setListingsData(boardingHouses); // Use mock data as a fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadListingsFromStorage();
  }, []); // The empty [] means this only runs once on startup

  // ADDED: 2. Save data to storage every time it changes
  useEffect(() => {
    // We don't want to save while it's still loading
    if (!isLoading) {
      const saveListingsToStorage = async () => {
        try {
          const jsonValue = JSON.stringify(listingsData);
          await AsyncStorage.setItem(LISTINGS_STORAGE_KEY, jsonValue);
        } catch (e) {
          console.error("Failed to save listings", e);
        }
      };
      saveListingsToStorage();
    }
  }, [listingsData, isLoading]); // This runs every time listingsData changes


  // This function doesn't change. When it runs, the `useEffect` above will save the new data.
  const updateListing = useCallback((id, updatedPayload) => {
    setListingsData(prevListings => {
      const index = prevListings.findIndex(l => String(l.id) === String(id));
      if (index === -1) {
        const newId = Date.now();
        return [...prevListings, { id: newId, ...updatedPayload }];
      }
      const newArray = [...prevListings];
      newArray[index] = { ...newArray[index], ...updatedPayload };
      return newArray;
    });
  }, []);

  // This function also doesn't change.
  const deleteListing = useCallback((id) => {
    setListingsData(prevListings => prevListings.filter(l => String(l.id) !== String(id)));
  }, []);


  const contextValue = {
    listings: listingsData,
    updateListing: updateListing,
    deleteListing: deleteListing,
  };

  // ADDED: Show a loading indicator while data is being loaded
  if (isLoading) {
    return (
      <ActivityIndicator size="large" color={primaryColor} style={{ flex: 1 }} />
    );
  }

  return (
    <GlobalListingContext.Provider value={contextValue}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopColor: '#e5e5e5',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: '#666',
          headerStyle: {
            backgroundColor: primaryColor,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        
        <Tabs.Screen
          name="index" 
          options={{
            title: 'Dashboard',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="inquiries" 
          options={{
            title: 'Messages',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="create-listing" 
          options={{
            title: 'Add Listing',
            headerShown: false, 
            tabBarIcon: ({ color, size }) => (
              <Feather name="plus-square" size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="notifications" 
          options={{
            title: 'Notifications',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="menu" 
          options={{
            title: 'Account',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="menu" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="support" options={{ href: null }} />
        <Tabs.Screen name="financials" options={{ href: null }} />
      </Tabs>
    </GlobalListingContext.Provider>
  );
}