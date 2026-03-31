import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

const C = {
  primary: '#3F9B84',
  navy: '#1a2c5e',
  danger: '#ef4444',
  g100: '#f1f5f9',
  g200: '#e2e8f0',
  g400: '#94a3b8',
  g600: '#475569',
  white: '#ffffff',
};

function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);

  const onSubmit = () => {
    setError('');
    if (!currentPassword.trim()) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Password Updated', 'Your password was updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 900);
  };

  return (
    <ScrollView contentContainerStyle={s.root} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <Text style={s.title}>Change Password</Text>
        <Text style={s.subtitle}>Use a strong password to secure your account.</Text>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Text style={s.label}>Current Password</Text>
        <TextInput
          style={s.input}
          placeholder="Enter current password"
          placeholderTextColor={C.g400}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Text style={s.label}>New Password</Text>
        <TextInput
          style={s.input}
          placeholder="Enter new password"
          placeholderTextColor={C.g400}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <View style={s.strengthWrap}>
          <View style={[s.strengthBar, { width: `${strength * 20}%` }]} />
        </View>

        <Text style={s.label}>Confirm Password</Text>
        <TextInput
          style={s.input}
          placeholder="Confirm new password"
          placeholderTextColor={C.g400}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={s.actions}>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => router.back()}>
            <Text style={s.secondaryText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.primaryBtn} onPress={onSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={s.primaryText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: C.g100,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.g200,
    padding: 18,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: C.navy,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
    color: C.g600,
  },
  error: {
    color: C.danger,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: C.g600,
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.navy,
    fontSize: 14,
  },
  strengthWrap: {
    height: 6,
    backgroundColor: C.g200,
    borderRadius: 999,
    marginTop: 10,
  },
  strengthBar: {
    height: 6,
    backgroundColor: C.primary,
    borderRadius: 999,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  secondaryText: {
    color: C.g600,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  primaryText: {
    color: C.white,
    fontWeight: '700',
  },
});
