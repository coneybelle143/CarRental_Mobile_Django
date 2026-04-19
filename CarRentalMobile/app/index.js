// app/index.js  –  redirects root based on current auth session
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#3F9B84" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (user.role === 'owner') return <Redirect href="/dashboard" />;
  if (user.role === 'renter') return <Redirect href="/renter" />;
  if (user.role === 'admin') return <Redirect href="/admin" />;

  return <Redirect href="/login" />;
}