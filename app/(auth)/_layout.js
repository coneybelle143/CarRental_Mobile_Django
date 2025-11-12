import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="tenant-signup" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="landlord-signup" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}