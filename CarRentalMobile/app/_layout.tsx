// app/_layout.tsx  –  Root layout
import { Stack } from 'expo-router';
import { AuthProvider }      from '../context/AuthContext';
import { BookingProvider }   from '../context/BookingContext';
import { LogReportProvider } from '../context/LogReportContext';
import { VehicleProvider }   from '../context/VehicleContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <BookingProvider>
          <LogReportProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index"           />
              <Stack.Screen name="login"           />
              <Stack.Screen name="register"        />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="change-password" />
              <Stack.Screen name="bookings"        />
              <Stack.Screen name="email-log"       />
              <Stack.Screen name="dashboard"       />
              <Stack.Screen name="renter"          />
              <Stack.Screen name="profile"         />
              <Stack.Screen name="admin"           />
            </Stack>
          </LogReportProvider>
        </BookingProvider>
      </VehicleProvider>
    </AuthProvider>
  );
}