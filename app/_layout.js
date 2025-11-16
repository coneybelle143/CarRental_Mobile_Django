import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './landlord/AuthContext';


const primaryColor = '#667eea'; 

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tenant)" options={{ headerShown: false }} />
          
          
          <Stack.Screen name="landlord" options={{ headerShown: false }} />
          
          
          <Stack.Screen 
            name="landlord/edit-profile" 
            options={{ 
              title: 'Edit Profile', 
              headerTintColor: 'white', 
              headerStyle: { backgroundColor: primaryColor }, 
              tabBarStyle: { display: 'none' }, 
            }} 
          />
          <Stack.Screen 
            name="landlord/financials" 
            options={{ 
              title: 'Financials & Payments', 
              headerTintColor: 'white', 
              headerStyle: { backgroundColor: primaryColor }, 
              tabBarStyle: { display: 'none' }, 
            }} 
          />
          <Stack.Screen 
            name="landlord/settings" 
            options={{ 
              title: 'App Settings', 
              headerTintColor: 'white', 
              headerStyle: { backgroundColor: primaryColor }, 
              tabBarStyle: { display: 'none' }, 
            }} 
          />
          <Stack.Screen 
            name="landlord/support" 
            options={{ 
              title: 'Help & Support', 
              headerTintColor: 'white', 
              headerStyle: { backgroundColor: primaryColor }, 
              tabBarStyle: { display: 'none' }, 
            }} 
          />

          
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
} 
