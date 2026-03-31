// screens/RegisterScreen.js  – with AuthContext integration
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform, StatusBar, Modal, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';   // ← NEW

const C = {
  primary:   '#3F9B84', primaryDk: '#2d7a67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#ef4444', warning: '#f59e0b', success: '#22c55e',
  g50:  '#f8fafc', g100: '#f1f5f9', g200: '#e2e8f0',
  g300: '#cbd5e1', g400: '#94a3b8', g500: '#64748b',
  g600: '#475569', g700: '#334155', g800: '#1e293b',
  white: '#ffffff',
};

// ── Icons ────────────────────────────────────────────────────────────────────
const CarIcon = ({ size = 26, color = C.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <Circle cx="7" cy="17" r="2" /><Path d="M9 17h6" /><Circle cx="17" cy="17" r="2" />
  </Svg>
);
const UserIcon = ({ size = 24, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" />
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
const CalendarIcon = ({ color = C.g400 }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);
const AlertIcon = ({ color = C.danger }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </Svg>
);
const CheckIcon = ({ size = 12, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 13l4 4L19 7" />
  </Svg>
);
const ArrowIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);
const ChevLeft = ({ color = C.g600 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);
const ChevRight = ({ color = C.g600 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 5l7 7-7 7" />
  </Svg>
);

// ── Strength meter ────────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { level: 0, text: '', color: C.g200, pct: '0%' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = [C.g200, C.danger, C.warning, C.warning, C.primary, C.success];
  return { level: s, text: labels[s], color: colors[s], pct: `${s * 20}%` };
}

// ── Calendar Date Picker ──────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function DatePickerModal({ visible, onClose, onConfirm, currentDate }) {
  const maxYear = new Date().getFullYear() - 18;
  const initDate = currentDate || new Date(maxYear, 0, 1);

  const [year,  setYear]  = useState(initDate.getFullYear());
  const [month, setMonth] = useState(initDate.getMonth());
  const [day,   setDay]   = useState(initDate.getDate());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const nextY = month === 11 ? year + 1 : year;
    const nextM = month === 11 ? 0 : month + 1;
    if (nextY > maxYear) return;
    if (nextY === maxYear && nextM > 11) return;
    setMonth(nextM);
    if (month === 11) setYear(y => y + 1);
  };
  const prevYear = () => setYear(y => Math.max(1940, y - 1));
  const nextYear = () => setYear(y => Math.min(maxYear, y + 1));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dp.overlay}>
        <View style={dp.sheet}>
          <Text style={dp.title}>Date of Birth</Text>
          <Text style={dp.subtitle}>Must be 18 years or older to register</Text>

          <View style={dp.navRow}>
            <TouchableOpacity onPress={prevYear} style={dp.navBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevLeft color={year <= 1940 ? C.g300 : C.g600} />
            </TouchableOpacity>
            <Text style={dp.yearText}>{year}</Text>
            <TouchableOpacity onPress={nextYear} style={dp.navBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevRight color={year >= maxYear ? C.g300 : C.g600} />
            </TouchableOpacity>
          </View>

          <View style={dp.navRow}>
            <TouchableOpacity onPress={prevMonth} style={dp.navBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevLeft />
            </TouchableOpacity>
            <Text style={dp.monthText}>{MONTHS[month]}</Text>
            <TouchableOpacity onPress={nextMonth} style={dp.navBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevRight color={year >= maxYear ? C.g300 : C.g600} />
            </TouchableOpacity>
          </View>

          <View style={dp.weekRow}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <Text key={d} style={dp.weekDay}>{d}</Text>
            ))}
          </View>

          <View style={dp.grid}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <View key={`blank-${i}`} style={dp.cell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <TouchableOpacity
                key={d}
                style={[dp.cell, safeDay === d && dp.cellActive]}
                onPress={() => setDay(d)}
              >
                <Text style={[dp.cellText, safeDay === d && dp.cellTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={dp.actions}>
            <TouchableOpacity style={dp.cancelBtn} onPress={onClose}>
              <Text style={dp.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dp.confirmBtn}
              onPress={() => onConfirm(new Date(year, month, safeDay))}
            >
              <Text style={dp.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dp = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet:      { backgroundColor: C.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 },
  title:      { fontSize: 18, fontWeight: '800', color: C.g800, marginBottom: 2 },
  subtitle:   { fontSize: 12, color: C.g400, marginBottom: 18 },
  navRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navBtn:     { padding: 4 },
  yearText:   { fontSize: 15, fontWeight: '700', color: C.g600, minWidth: 50, textAlign: 'center' },
  monthText:  { fontSize: 17, fontWeight: '800', color: C.navy, minWidth: 120, textAlign: 'center' },
  weekRow:    { flexDirection: 'row', marginBottom: 6, marginTop: 4 },
  weekDay:    { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: C.g400 },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  cell:       { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellActive: { backgroundColor: C.primary, borderRadius: 999 },
  cellText:   { fontSize: 14, color: C.g700 },
  cellTextActive: { color: C.white, fontWeight: '700' },
  actions:    { flexDirection: 'row', gap: 12 },
  cancelBtn:  { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.g200, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700', color: C.g600 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center' },
  confirmText:{ fontSize: 15, fontWeight: '700', color: C.white },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router    = useRouter();
  const { register } = useAuth();          // ← NEW
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();

  const lastNameInput  = useRef(null);
  const middleInput    = useRef(null);
  const emailInput     = useRef(null);
  const passwordInput  = useRef(null);
  const confirmInput   = useRef(null);

  const fieldY = useRef({});

  const scrollToField = (name) => {
    const y = fieldY.current[name];
    if (y != null && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 120), animated: true });
      }, 150);
    }
  };

  const [role,    setRole]    = useState('owner');
  const [form,    setForm]    = useState({
    firstName: '', lastName: '', middleName: '',
    sex: '', dob: null, email: '', password: '', confirmPassword: '',
  });
  const [showPw,   setShowPw]   = useState(false);
  const [showCPw,  setShowCPw]  = useState(false);
  const [focused,  setFocused]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [dobError, setDobError] = useState('');
  const [showDob,  setShowDob]  = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const formatDob = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleDobConfirm = (date) => {
    setShowDob(false);
    const today   = new Date();
    const age18   = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (date > age18) {
      setDobError('You must be at least 18 years old.');
      set('dob', null);
    } else {
      setDobError('');
      set('dob', date);
    }
  };

  const strength = getStrength(form.password);
  const pwMatch    = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const pwNoMatch  = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  // ── UPDATED handleRegister ────────────────────────────────────────────────
  const handleRegister = () => {
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields.'); return;
    }
    if (!form.sex) { setError('Please select your sex.'); return; }
    if (!form.dob) { setError(dobError || 'Please select your date of birth.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Build the user object and store it in AuthContext
      const newUser = {
        id:         Date.now().toString(),
        role,
        firstName:  form.firstName.trim(),
        lastName:   form.lastName.trim(),
        middleName: form.middleName.trim(),
        fullName:   `${form.firstName.trim()} ${form.lastName.trim()}`,
        email:      form.email.trim().toLowerCase(),
        sex:        form.sex,
        dob:        form.dob ? form.dob.toISOString() : null,
        joinedAt:   new Date().toISOString(),
        phone:      '',
        avatar:     null,
      };

      register(newUser);   // ← Store user globally

      // Navigate based on role (switch makes intent explicit)
      switch (role) {
        case 'owner':
          router.replace('/dashboard');
          break;
        case 'renter':
          router.replace('/renter');
          break;
        default:
          router.replace('/login');
      }
    }, 1000);
  };

  const SEX_OPTIONS = [
    { key: 'male', label: 'Male' },
    { key: 'female', label: 'Female' },
    { key: 'prefer_not', label: 'Prefer not to say' },
  ];

  const SectionHead = ({ title }) => (
    <View style={r.sectionHead}>
      <View style={r.sectionBar} />
      <Text style={r.sectionText}>{title}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.navy }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 10}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[r.scroll, { paddingBottom: Math.max(160, insets.bottom + 40) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardDismissMode="interactive"
      >
        {/* ── HERO ── */}
        <View style={r.hero}>
          <View style={r.bubble1} /><View style={r.bubble2} />
          <View style={r.logoBox}><CarIcon size={26} color={C.primary} /></View>
          <Text style={r.heroTitle}>Create Account</Text>
          <Text style={r.heroSub}>Join CarRental today — it's free!</Text>
        </View>

        {/* ── ROLE SELECTOR ── */}
        <View style={r.roleSection}>
          <Text style={r.roleSectionLabel}>I WANT TO:</Text>
          <View style={r.roleRow}>
            {[
              { key: 'owner',  icon: <CarIcon  size={22} color={role === 'owner'  ? C.primary : 'rgba(255,255,255,0.45)'} />, title: 'List My Car', desc: 'Earn by renting out your vehicle' },
              { key: 'renter', icon: <UserIcon size={22} color={role === 'renter' ? C.primary : 'rgba(255,255,255,0.45)'} />, title: 'Rent a Car',  desc: 'Browse and book available cars'   },
            ].map(ro => (
              <TouchableOpacity key={ro.key}
                style={[r.roleCard, role === ro.key && r.roleCardActive]}
                onPress={() => setRole(ro.key)} activeOpacity={0.8}
              >
                <View style={[r.roleIconBox, role === ro.key && r.roleIconBoxActive]}>{ro.icon}</View>
                <Text style={[r.roleCardTitle, role === ro.key && r.roleCardTitleActive]}>{ro.title}</Text>
                <Text style={r.roleCardDesc}>{ro.desc}</Text>
                {role === ro.key && (
                  <View style={r.roleCheck}><CheckIcon size={10} color={C.white} /></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── FORM CARD ── */}
        <View style={r.card}>

          {!!error && (
            <View style={r.errorBox}>
              <AlertIcon /><Text style={r.errorText}>{error}</Text>
            </View>
          )}

          {/* Personal Information */}
          <SectionHead title="PERSONAL INFORMATION" />

          {/* First + Last name row */}
          <View style={r.row2}>
            <View
              style={{ flex: 1, marginRight: 8 }}
              onLayout={e => { fieldY.current['first'] = e.nativeEvent.layout.y + 300; }}
            >
              <Text style={r.label}>First Name <Text style={{ color: C.danger }}>*</Text></Text>
              <View style={[r.inputWrap, r.inputRow, focused === 'first' && r.inputFocused]}>
                <TextInput
                  style={[r.textInput, { flex: 1 }]}
                  placeholder="First"
                  placeholderTextColor={C.g300}
                  value={form.firstName}
                  onChangeText={v => { set('firstName', v); setError(''); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameInput.current?.focus()}
                  onFocus={() => { setFocused('first'); scrollToField('first'); }}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>

            <View
              style={{ flex: 1 }}
              onLayout={e => { fieldY.current['last'] = e.nativeEvent.layout.y + 300; }}
            >
              <Text style={r.label}>Last Name <Text style={{ color: C.danger }}>*</Text></Text>
              <View style={[r.inputWrap, r.inputRow, focused === 'last' && r.inputFocused]}>
                <TextInput
                  ref={lastNameInput}
                  style={[r.textInput, { flex: 1 }]}
                  placeholder="Last"
                  placeholderTextColor={C.g300}
                  value={form.lastName}
                  onChangeText={v => { set('lastName', v); setError(''); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => middleInput.current?.focus()}
                  onFocus={() => { setFocused('last'); scrollToField('last'); }}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </View>
          </View>

          {/* Middle name */}
          <View onLayout={e => { fieldY.current['middle'] = e.nativeEvent.layout.y + 300; }}>
            <Text style={r.label}>Middle Name <Text style={r.optional}>(optional)</Text></Text>
            <View style={[r.inputWrap, r.inputRow, focused === 'middle' && r.inputFocused]}>
              <TextInput
                ref={middleInput}
                style={[r.textInput, { flex: 1 }]}
                placeholder="Middle name"
                placeholderTextColor={C.g300}
                value={form.middleName}
                onChangeText={v => set('middleName', v)}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailInput.current?.focus()}
                onFocus={() => { setFocused('middle'); scrollToField('middle'); }}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Sex */}
          <Text style={r.label}>Sex <Text style={{ color: C.danger }}>*</Text></Text>
          <View style={r.segRow}>
            {SEX_OPTIONS.map(o => (
              <TouchableOpacity
                key={o.key}
                style={[r.segBtn, form.sex === o.key && r.segBtnActive]}
                onPress={() => { set('sex', o.key); setError(''); }}
              >
                <Text style={[r.segBtnText, form.sex === o.key && r.segBtnTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date of Birth */}
          <View style={{ marginTop: 16 }}>
            <Text style={r.label}>Date of Birth <Text style={{ color: C.danger }}>*</Text></Text>
            <TouchableOpacity
              style={[r.dobBtn, dobError ? r.dobBtnError : form.dob ? r.dobBtnFilled : null]}
              onPress={() => setShowDob(true)}
              activeOpacity={0.8}
            >
              <View style={r.iconBox}><CalendarIcon color={dobError ? C.danger : form.dob ? C.primary : C.g400} /></View>
              <Text style={[r.dobText, !form.dob && r.dobPlaceholder, dobError && r.dobTextDanger]}>
                {form.dob ? formatDob(form.dob) : 'Select date of birth'}
              </Text>
            </TouchableOpacity>
            {!!dobError && (
              <View style={r.inlineError}>
                <AlertIcon color={C.danger} />
                <Text style={r.inlineErrorText}>{dobError}</Text>
              </View>
            )}
          </View>

          {/* Account */}
          <SectionHead title="ACCOUNT DETAILS" />

          {/* Email */}
          <View onLayout={e => { fieldY.current['email'] = e.nativeEvent.layout.y + 300; }}>
            <Text style={r.label}>Email Address <Text style={{ color: C.danger }}>*</Text></Text>
            <View style={[r.inputWrap, r.inputRow, focused === 'email' && r.inputFocused]}>
              <View style={r.iconBox}>
                <MailIcon color={focused === 'email' ? C.primary : C.g400} />
              </View>
              <TextInput
                ref={emailInput}
                style={[r.textInput, { flex: 1 }]}
                placeholder="name@example.com"
                placeholderTextColor={C.g300}
                value={form.email}
                onChangeText={v => { set('email', v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
                onFocus={() => { setFocused('email'); scrollToField('email'); }}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View onLayout={e => { fieldY.current['password'] = e.nativeEvent.layout.y + 300; }}>
            <Text style={r.label}>Password <Text style={{ color: C.danger }}>*</Text></Text>
            <View style={[r.inputWrap, r.inputRow, focused === 'pw' && r.inputFocused]}>
              <View style={r.iconBox}>
                <LockIcon color={focused === 'pw' ? C.primary : C.g400} />
              </View>
              <TextInput
                ref={passwordInput}
                style={[r.textInput, { flex: 1 }]}
                placeholder="Min. 8 characters"
                placeholderTextColor={C.g300}
                value={form.password}
                onChangeText={v => { set('password', v); setError(''); }}
                secureTextEntry={!showPw}
                returnKeyType="next"
                onSubmitEditing={() => confirmInput.current?.focus()}
                onFocus={() => { setFocused('pw'); scrollToField('password'); }}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity style={r.eyeBtn} onPress={() => setShowPw(p => !p)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </TouchableOpacity>
            </View>
            {/* Strength */}
            {form.password.length > 0 && (
              <View style={r.strengthWrap}>
                <View style={r.strengthTrack}>
                  <View style={[r.strengthBar, { width: strength.pct, backgroundColor: strength.color }]} />
                </View>
                <Text style={[r.strengthLabel, { color: strength.color }]}>{strength.text}</Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View onLayout={e => { fieldY.current['confirm'] = e.nativeEvent.layout.y + 300; }}>
            <Text style={r.label}>Confirm Password <Text style={{ color: C.danger }}>*</Text></Text>
            <View style={[
              r.inputWrap, r.inputRow,
              focused === 'cp' && r.inputFocused,
              pwNoMatch && r.inputError,
              pwMatch   && r.inputSuccess,
            ]}>
              <View style={r.iconBox}>
                <LockIcon color={pwNoMatch ? C.danger : pwMatch ? C.success : focused === 'cp' ? C.primary : C.g400} />
              </View>
              <TextInput
                ref={confirmInput}
                style={[r.textInput, { flex: 1 }]}
                placeholder="Repeat your password"
                placeholderTextColor={C.g300}
                value={form.confirmPassword}
                onChangeText={v => set('confirmPassword', v)}
                secureTextEntry={!showCPw}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                onFocus={() => { setFocused('cp'); scrollToField('confirm'); }}
                onBlur={() => setFocused(null)}
              />
              {pwMatch && <View style={{ paddingRight: 14 }}><CheckIcon size={16} color={C.success} /></View>}
              <TouchableOpacity style={r.eyeBtn} onPress={() => setShowCPw(p => !p)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                {showCPw ? <EyeOffIcon /> : <EyeIcon />}
              </TouchableOpacity>
            </View>
            {pwNoMatch && <Text style={r.matchError}>Passwords do not match</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[r.btn, loading && { opacity: 0.75 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.87}
          >
            {loading
              ? <ActivityIndicator color={C.white} size="small" />
              : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={r.btnText}>Create Account</Text><ArrowIcon />
                </View>}
          </TouchableOpacity>

          <View style={r.footer}>
            <Text style={r.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={r.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <DatePickerModal
        visible={showDob}
        onClose={() => setShowDob(false)}
        onConfirm={handleDobConfirm}
        currentDate={form.dob}
      />
    </KeyboardAvoidingView>
  );
}

const r = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: C.g50 },

  hero: { backgroundColor: C.navy, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 44, paddingHorizontal: 24, overflow: 'hidden' },
  bubble1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: C.primary, opacity: 0.07, top: -60, right: -40 },
  bubble2: { position: 'absolute', width: 120, height: 120, borderRadius: 60,  backgroundColor: C.primary, opacity: 0.05, bottom: -30, left: -20 },
  logoBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: C.white, letterSpacing: -0.5, marginBottom: 6 },
  heroSub:   { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 20 },

  roleSection: { backgroundColor: C.navy, paddingHorizontal: 16, paddingBottom: 20 },
  roleSectionLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8, marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16, alignItems: 'center', position: 'relative' },
  roleCardActive: { backgroundColor: 'rgba(63,155,132,0.15)', borderColor: C.primary },
  roleIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  roleIconBoxActive: { backgroundColor: 'rgba(63,155,132,0.2)' },
  roleCardTitle:       { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.65)', marginBottom: 4, textAlign: 'center' },
  roleCardTitleActive: { color: '#7dd3c0' },
  roleCardDesc:        { fontSize: 11, color: 'rgba(255,255,255,0.38)', textAlign: 'center', lineHeight: 15 },
  roleCheck: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },

  card: { backgroundColor: C.white, marginHorizontal: 16, marginTop: -4, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 20 },
  errorText: { color: C.danger, fontSize: 13, fontWeight: '600', flex: 1 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 4, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.g100 },
  sectionBar:  { width: 4, height: 14, backgroundColor: C.primary, borderRadius: 2 },
  sectionText: { fontSize: 11, fontWeight: '800', color: C.g600, letterSpacing: 0.8 },

  row2:     { flexDirection: 'row', marginBottom: 16 },
  label:    { fontSize: 13, fontWeight: '700', color: C.g700, marginBottom: 8 },
  optional: { fontSize: 11, color: C.g400, fontWeight: '400' },

  inputWrap: { backgroundColor: C.g50, borderWidth: 1.5, borderColor: C.g200, borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  inputRow:  { flexDirection: 'row', alignItems: 'center' },
  inputFocused: { borderColor: C.primary, backgroundColor: C.primaryLt, shadowColor: C.primary, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  inputError:   { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  inputSuccess: { borderColor: '#6ee7b7', backgroundColor: '#f0fdf4' },

  iconBox:   { paddingLeft: 13, paddingRight: 4 },
  textInput: { paddingVertical: 15, paddingHorizontal: 14, fontSize: 15, color: C.g800, fontWeight: '500' },
  eyeBtn:    { paddingHorizontal: 14, paddingVertical: 14 },

  segRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  segBtn: { paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1.5, borderColor: C.g200, borderRadius: 999, backgroundColor: C.white },
  segBtnActive:     { borderColor: C.primary, backgroundColor: C.primaryLt },
  segBtnText:       { fontSize: 13, color: C.g500, fontWeight: '500' },
  segBtnTextActive: { color: C.primary, fontWeight: '700' },

  dobBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.g50, borderWidth: 1.5, borderColor: C.g200, borderRadius: 12, marginBottom: 4, overflow: 'hidden' },
  dobBtnError:  { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  dobBtnFilled: { borderColor: C.primary, backgroundColor: C.primaryLt },
  dobText:         { flex: 1, paddingVertical: 15, fontSize: 15, color: C.g800, fontWeight: '500' },
  dobPlaceholder:  { color: C.g300 },
  dobTextDanger:   { color: C.danger },

  inlineError:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  inlineErrorText: { fontSize: 12, color: C.danger, fontWeight: '600' },

  strengthWrap:  { marginTop: 8, marginBottom: 4 },
  strengthTrack: { height: 4, backgroundColor: C.g200, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  strengthBar:   { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '600' },

  matchError: { fontSize: 12, color: C.danger, fontWeight: '600', marginTop: 4, marginBottom: 8 },

  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 17, alignItems: 'center', justifyContent: 'center', marginTop: 20, minHeight: 56, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 7 },
  btnText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  footerText: { fontSize: 14, color: C.g500 },
  footerLink: { fontSize: 14, color: C.primary, fontWeight: '700' },
});