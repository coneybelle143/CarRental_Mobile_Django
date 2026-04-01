// components/ProfileAvatar.js
// Tap this in any dashboard header to go to /profile.
// Shows the user's profile photo when set, otherwise falls back to
// coloured initials circle.

import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  owner:  '#f59e0b',
  renter: '#6366f1',
  admin:  '#a855f7',
};

export default function ProfileAvatar({ size = 40 }) {
  const router  = useRouter();
  const { user } = useAuth();

  const name     = user?.fullName || user?.firstName || 'U';
  const role     = user?.role || 'renter';
  const bgColor  = ROLE_COLORS[role] || ROLE_COLORS.renter;
  const photoUri = user?.photoUri || null;

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => (w[0] || '').toUpperCase())
    .join('');

  const circle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <TouchableOpacity
      onPress={() => router.push('/profile')}
      activeOpacity={0.8}
      style={[
        styles.base,
        circle,
        !photoUri && { backgroundColor: bgColor },
      ]}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={[styles.photo, circle]}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
          {initials || 'U'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  photo: {
    // fills the circle exactly
  },
  initials: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});