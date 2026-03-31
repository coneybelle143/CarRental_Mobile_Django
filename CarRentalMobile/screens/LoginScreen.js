// screens/LoginScreen.js  – with AuthContext integration
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform, StatusBar, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';   // ← NEW

const C = {
  primary:   '#3F9B84', primaryDk: '#2d7a67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#e86161',
  g50:  '#f8fafc', g100: '#f1f5f9', g200: '#e2e8f0',
  g300: '#cbd5e1', g400: '#94a3b8', g500: '#64748b',
  g600: '#475569', g700: '#334155', g800: '#1e293b',
  white: '#ffffff',
};

const CarIcon = ({ size = 28, color = C.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <Circle cx="7" cy="17" r="2" /><Path d="M9 17h6" /><Circle cx="17" cy="17" r="2" />
  </Svg>
);
const MailIcon = ({ color = C.g400 }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="16" rx="2" />
    <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Svg>
);
const LockIcon = ({ color = C.g400 }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" /><Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);
const EyeIcon = ({ color = C.g400 }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><Circle cx="12" cy="12" r="3" />
  </Svg>
);
const EyeOffIcon = ({ color = C.g400 }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <Path d="M6.51 6.51 17.49 17.49" />
  </Svg>
);
const AlertIcon = ({ color = C.danger }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </Svg>
);
const ArrowIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);

// ── Demo users (simulate a user DB) ──────────────────────────────────────────
const DEMO_USERS = {
  'owner@test.com': {
    id: 'u_owner', role: 'owner',
    firstName: 'Alex', lastName: 'Reyes', middleName: 'B.',
    fullName: 'Alex Reyes', email: 'owner@test.com',
    sex: 'male', dob: '1990-05-15T00:00:00.000Z',
    phone: '+63 912 345 6789',
    joinedAt: '2024-01-10T00:00:00.000Z',
    avatar: null,
  },
  'renter@test.com': {
    id: 'u_renter', role: 'renter',
    firstName: 'Maria', lastName: 'Santos', middleName: 'C.',
    fullName: 'Maria Santos', email: 'renter@test.com',
    sex: 'female', dob: '1995-08-22T00:00:00.000Z',
    phone: '+63 917 654 3210',
    joinedAt: '2024-03-01T00:00:00.000Z',
    avatar: null,
  },
  'admin@test.com': {
    id: 'u_admin', role: 'admin',
    firstName: 'Admin', lastName: 'User', middleName: '',
    fullName: 'Admin User', email: 'admin@test.com',
    sex: '', dob: null, phone: '',
    joinedAt: '2023-01-01T00:00:00.000Z',
    avatar: null,
  },
};

const DEMO = [
  { label: 'Owner',  email: 'owner@test.com',  pass: 'password' },
  { label: 'Renter', email: 'renter@test.com', pass: 'password' },
  { label: 'Admin',  email: 'admin@test.com',  pass: 'admin123' },
];

export default function LoginScreen() {
  const router    = useRouter();
  const { login } = useAuth();   // ← NEW
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const pwInputRef = useRef(null);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState(null);

  const fieldY = useRef({});

  const scrollToField = (name) => {
    const y = fieldY.current[name];
    if (y != null && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 120), animated: true });
      }, 150);
    }
  };

  const handleLogin = () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const e = email.trim().toLowerCase();
      const demoUser = DEMO_USERS[e];

      if (demoUser) {
        login(demoUser);   // ← Store user in context
        // route according to the user's role rather than email
        switch (demoUser.role) {
          case 'owner':
            router.replace('/dashboard');
            break;
          case 'renter':
            router.replace('/renter');
            break;
          case 'admin':
            router.replace('/admin');
            break;
          default:
            // fallback just in case
            router.replace('/login');
        }
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.navy }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 10}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[s.scroll, { paddingBottom: Math.max(160, insets.bottom + 40) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardDismissMode="interactive"
      >
        {/* ── HERO ── */}
        <View style={s.hero}>
          <View style={s.bubble1} /><View style={s.bubble2} />
          <View style={s.logoBox}><CarIcon size={28} color={C.primary} /></View>
          <Text style={s.heroTitle}>Welcome Back</Text>
          <Text style={s.heroSub}>Sign in to continue to CarRental</Text>
          <Text style={s.demoHeading}>TAP TO AUTO-FILL DEMO CREDENTIALS</Text>
          <View style={s.demoRow}>
            {DEMO.map(d => (
              <TouchableOpacity key={d.label} style={s.demoChip}
                onPress={() => { setEmail(d.email); setPassword(d.pass); setError(''); }}>
                <Text style={s.demoChipText}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── FORM CARD ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sign In</Text>
          <Text style={s.cardSub}>Enter your account details below</Text>

          {!!error && (
            <View style={s.errorBox}>
              <AlertIcon /><Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View onLayout={e => { fieldY.current['email'] = e.nativeEvent.layout.y + 300; }}>
            <Text style={s.label}>Email Address</Text>
            <View style={[s.inputWrap, focused === 'email' && s.inputFocused]}>
              <View style={s.iconBox}>
                <MailIcon color={focused === 'email' ? C.primary : C.g400} />
              </View>
              <TextInput
                style={s.textInput}
                placeholder="name@example.com"
                placeholderTextColor={C.g300}
                value={email}
                onChangeText={v => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => pwInputRef.current?.focus()}
                onFocus={() => { setFocused('email'); scrollToField('email'); }}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View onLayout={e => { fieldY.current['password'] = e.nativeEvent.layout.y + 300; }}>
            <View style={s.labelRow}>
              <Text style={s.label}>Password</Text>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={s.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.inputWrap, focused === 'pw' && s.inputFocused]}>
              <View style={s.iconBox}>
                <LockIcon color={focused === 'pw' ? C.primary : C.g400} />
              </View>
              <TextInput
                ref={pwInputRef}
                style={s.textInput}
                placeholder="Enter your password"
                placeholderTextColor={C.g300}
                value={password}
                onChangeText={v => { setPassword(v); setError(''); }}
                secureTextEntry={!showPw}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => { setFocused('pw'); scrollToField('password'); }}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity
                style={s.eyeBtn}
                onPress={() => setShowPw(p => !p)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {showPw ? <EyeOffIcon color={C.g400} /> : <EyeIcon color={C.g400} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.87}
          >
            {loading
              ? <ActivityIndicator color={C.white} size="small" />
              : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={s.btnText}>Sign In</Text><ArrowIcon />
                </View>}
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>New to CarRental?</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity style={s.outlineBtn} onPress={() => router.push('/register')} activeOpacity={0.85}>
            <Text style={s.outlineBtnText}>Create an Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: C.g50 },
  hero: { backgroundColor: C.navy, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 52, paddingHorizontal: 24, overflow: 'hidden' },
  bubble1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: C.primary, opacity: 0.07, top: -70, right: -50 },
  bubble2: { position: 'absolute', width: 130, height: 130, borderRadius: 65,  backgroundColor: C.primary, opacity: 0.05, bottom: -30, left: -30 },
  logoBox: { width: 58, height: 58, borderRadius: 18, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: C.white, letterSpacing: -0.5, marginBottom: 8 },
  heroSub:   { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 20 },
  demoHeading: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  demoRow:  { flexDirection: 'row', gap: 10 },
  demoChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(63,155,132,0.2)', borderWidth: 1, borderColor: 'rgba(63,155,132,0.4)' },
  demoChipText: { fontSize: 13, fontWeight: '700', color: '#7dd3c0' },

  card: { backgroundColor: C.white, marginHorizontal: 16, marginTop: -24, borderRadius: 24, padding: 28, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.g800, marginBottom: 4 },
  cardSub:   { fontSize: 14, color: C.g500, marginBottom: 24 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 20 },
  errorText: { color: C.danger, fontSize: 13, fontWeight: '600', flex: 1 },

  label:     { fontSize: 13, fontWeight: '700', color: C.g700, marginBottom: 8 },
  labelRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotLink:{ fontSize: 12, color: C.primary, fontWeight: '600', marginBottom: 8 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.g50, borderWidth: 1.5, borderColor: C.g200, borderRadius: 14, marginBottom: 20, overflow: 'hidden' },
  inputFocused: { borderColor: C.primary, backgroundColor: C.primaryLt, shadowColor: C.primary, shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 },
  iconBox:   { paddingLeft: 14, paddingRight: 4 },
  textInput: { flex: 1, paddingVertical: 16, paddingRight: 12, fontSize: 15, color: C.g800, fontWeight: '500' },
  eyeBtn:    { paddingHorizontal: 14, paddingVertical: 16 },

  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 17, alignItems: 'center', justifyContent: 'center', marginTop: 4, minHeight: 56, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 7 },
  btnText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  divLine: { flex: 1, height: 1, backgroundColor: C.g200 },
  divText: { fontSize: 12, color: C.g400, marginHorizontal: 14, fontWeight: '600' },

  outlineBtn:     { borderWidth: 1.5, borderColor: C.g200, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  outlineBtnText: { fontSize: 15, fontWeight: '700', color: C.g600 },
});