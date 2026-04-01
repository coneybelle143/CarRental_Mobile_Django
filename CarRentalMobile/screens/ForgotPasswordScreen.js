import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const C = {
  primary: '#3F9B84',
  navy: '#1a2c5e',
  g100: '#f1f5f9',
  g200: '#e2e8f0',
  g400: '#94a3b8',
  g600: '#475569',
  white: '#ffffff',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <ScrollView contentContainerStyle={s.root} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
        <Text style={s.title}>Reset Password</Text>
        <Text style={s.subtitle}>
          {submitted
            ? 'Check your inbox for a password reset link.'
            : 'Enter your email to receive reset instructions.'}
        </Text>

        {!submitted ? (
          <>
            <TextInput
              style={s.input}
              placeholder="name@example.com"
              placeholderTextColor={C.g400}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={[s.btn, (!email.trim() || loading) && { opacity: 0.7 }]}
              onPress={onSubmit}
              disabled={!email.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={s.btnText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={s.successBox}>
            <Text style={s.successText}>
              If an account exists for {email}, a reset email will be sent shortly.
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={s.link}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.white,
  },
  root: {
    flexGrow: 1,
    backgroundColor: C.g100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.g200,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.navy,
  },
  subtitle: {
    fontSize: 13,
    color: C.g600,
    marginTop: 8,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: C.navy,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  btnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    color: '#065f46',
    fontSize: 13,
  },
  link: {
    marginTop: 16,
    color: C.primary,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});
