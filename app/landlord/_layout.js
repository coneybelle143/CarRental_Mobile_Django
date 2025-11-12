import React, { useState, useCallback } from 'react';
import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { boardingHouses } from '../../data/mockData'; 


export const GlobalListingContext = React.createContext({
    listings: boardingHouses,
    updateListing: () => {},
    deleteListing: () => {},
});

export default function LandlordLayout() {
  const primaryColor = Colors.primary || '#667eea'; 

 
  const [listingsData, setListingsData] = useState(boardingHouses);

  
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

  
  const deleteListing = useCallback((id) => {
    setListingsData(prevListings => prevListings.filter(l => String(l.id) !== String(id)));
  }, []);


  const contextValue = {
    listings: listingsData,
    updateListing: updateListing,
    deleteListing: deleteListing,
  };

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