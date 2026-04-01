// screens/ProfileScreen.js
// Unified profile screen — works for both owner and renter roles.
// Reads/writes via AuthContext so changes persist within the session.

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Platform, StatusBar, Alert, Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:   '#3F9B84', primaryDk: '#2d7a67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e', navyLt:    '#2d4a8a',
  danger:    '#ef4444', success: '#22c55e', warning: '#f59e0b',
  g50:  '#f8fafc', g100: '#f1f5f9', g200: '#e2e8f0',
  g300: '#cbd5e1', g400: '#94a3b8', g500: '#64748b',
  g600: '#475569', g700: '#334155', g800: '#1e293b',
  white: '#ffffff',
  ownerAccent:  '#f59e0b',
  renterAccent: '#6366f1',
};

const ROLE_META = {
  owner:  { label: 'Vehicle Owner', color: '#d97706', bg: 'rgba(245,158,11,.12)', dot: '#f59e0b' },
  renter: { label: 'Renter',        color: '#4f46e5', bg: 'rgba(99,102,241,.12)', dot: '#6366f1' },
  admin:  { label: 'Administrator',  color: '#7e22ce', bg: 'rgba(168,85,247,.12)', dot: '#a855f7' },
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconUser     = ({ size = 20, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" />
  </Svg>
);
const IconMail     = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="16" rx="2" /><Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Svg>
);
const IconPhone    = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);
const IconCalendar = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" /><Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);
const IconEdit     = ({ size = 15, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);
const IconBack     = ({ size = 20, color = C.g600 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);
const IconGo     = ({ size = 20, color = C.g600 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 5l 7 7 -7 7" />
  </Svg>
);
const IconCar      = ({ size = 18, color = C.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <Circle cx="7" cy="17" r="2" /><Path d="M9 17h6" /><Circle cx="17" cy="17" r="2" />
  </Svg>
);
const IconLogout   = ({ size = 16, color = C.danger }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);
const IconCheck    = ({ size = 14, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 13l4 4L19 7" />
  </Svg>
);
const IconLock     = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" /><Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);
const IconBooking  = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
  </Svg>
);
const IconStar     = ({ size = 16, color = '#f59e0b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
  </Svg>
);

// ── Avatar initials ───────────────────────────────────────────────────────────
function AvatarCircle({ name = '', size = 72, fontSize = 26, style }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase();
  return (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: C.primary,
      alignItems: 'center', justifyContent: 'center',
    }, style]}>
      <Text style={{ fontSize, fontWeight: '800', color: C.white, letterSpacing: -0.5 }}>
        {initials || '?'}
      </Text>
    </View>
  );
}

// ── Field row (view mode) ─────────────────────────────────────────────────────
function FieldRow({ icon, label, value, placeholder = '—' }) {
  return (
    <View style={p.fieldRow}>
      <View style={p.fieldIcon}>{icon}</View>
      <View style={p.fieldBody}>
        <Text style={p.fieldLabel}>{label}</Text>
        <Text style={[p.fieldValue, !value && p.fieldEmpty]}>
          {value || placeholder}
        </Text>
      </View>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();

  // Fallback so screen doesn't crash if visited without auth (demo)
  const u = user || {
    id: 'demo', role: 'owner', firstName: 'Demo', lastName: 'User',
    fullName: 'Demo User', email: 'demo@example.com',
    sex: '', dob: null, phone: '', joinedAt: new Date().toISOString(),
  };

  const roleMeta = ROLE_META[u.role] || ROLE_META.renter;

  // ── Edit mode state ──────────────────────────────────────────────────────
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [focused,  setFocused]  = useState(null);

  const [draft, setDraft] = useState({
    firstName:  u.firstName  || '',
    lastName:   u.lastName   || '',
    middleName: u.middleName || '',
    phone:      u.phone      || '',
    email:      u.email      || '',
  });
  const [editError, setEditError] = useState('');

  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const cancelEdit = () => {
    setDraft({
      firstName:  u.firstName  || '',
      lastName:   u.lastName   || '',
      middleName: u.middleName || '',
      phone:      u.phone      || '',
      email:      u.email      || '',
    });
    setEditError('');
    setEditing(false);
  };

  const saveEdit = () => {
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim()) {
      setEditError('First name, last name and email are required.'); return;
    }
    setSaving(true);
    setTimeout(() => {
      updateUser({
        firstName:  draft.firstName.trim(),
        lastName:   draft.lastName.trim(),
        middleName: draft.middleName.trim(),
        fullName:   `${draft.firstName.trim()} ${draft.lastName.trim()}`,
        phone:      draft.phone.trim(),
        email:      draft.email.trim().toLowerCase(),
      });
      setSaving(false);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 900);
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: () => { logout(); router.replace('/login'); },
      },
    ]);
  };

  // ── Computed ─────────────────────────────────────────────────────────────
  const joinedLabel = u.joinedAt
    ? new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';
  const dobLabel = u.dob
    ? new Date(u.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const sexLabel = u.sex === 'prefer_not' ? 'Prefer not to say'
    : u.sex ? (u.sex.charAt(0).toUpperCase() + u.sex.slice(1)) : '';

  // ── Stats placeholders removed; compute from real user data or context
  const stats = []; // replace with real stats when available

  // ── Input style helper ────────────────────────────────────────────────────
  const inputStyle = (field) => [
    p.input,
    focused === field && p.inputFocused,
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.g50 }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER BANNER ── */}
        <View style={p.banner}>
          <View style={p.bannerBubble1} />
          <View style={p.bannerBubble2} />

          {/* Top bar */}
          <View style={p.topBar}>
            <TouchableOpacity
              style={p.backBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconBack color={C.white} />
            </TouchableOpacity>
            <Text style={p.topBarTitle}>My Profile</Text>
            <TouchableOpacity
              style={p.editBannerBtn}
              onPress={() => setEditing(e => !e)}
            >
              <IconEdit size={13} color={editing ? C.navy : C.white} />
              <Text style={[p.editBannerText, editing && { color: C.navy }]}>
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={p.bannerContent}>
            <AvatarCircle
              name={u.fullName || `${u.firstName} ${u.lastName}`}
              size={80}
              fontSize={28}
              style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' }}
            />
            <View style={p.bannerInfo}>
              <Text style={p.bannerName}>{u.fullName || `${u.firstName} ${u.lastName}`}</Text>
              <Text style={p.bannerEmail}>{u.email}</Text>
              <View style={[p.rolePill, { backgroundColor: roleMeta.bg }]}>
                <View style={[p.roleDot, { backgroundColor: roleMeta.dot }]} />
                <Text style={[p.roleLabel, { color: roleMeta.color }]}>{roleMeta.label}</Text>
              </View>
            </View>
          </View>

          {/* Stats strip */}
          <View style={p.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={[p.statBox, i < stats.length - 1 && p.statBorder]}>
                <Text style={[p.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={p.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── SUCCESS TOAST ── */}
        {saved && (
          <View style={p.toast}>
            <IconCheck size={14} color={C.success} />
            <Text style={p.toastText}>Profile updated successfully!</Text>
          </View>
        )}

        {/* ── EDIT FORM / VIEW MODE ── */}
        <View style={p.card}>
          <View style={p.cardHeader}>
            <View style={p.cardHeaderDot} />
            <Text style={p.cardHeaderTitle}>
              {editing ? 'Edit Profile' : 'Personal Information'}
            </Text>
          </View>

          {editing ? (
            // ── EDIT FORM ──────────────────────────────────────────────────
            <View style={p.form}>
              {!!editError && (
                <View style={p.errorBox}>
                  <Text style={p.errorText}>{editError}</Text>
                </View>
              )}

              <View style={p.formRow}>
                <View style={p.formHalf}>
                  <Text style={p.formLabel}>First Name <Text style={p.req}>*</Text></Text>
                  <TextInput
                    style={inputStyle('firstName')}
                    value={draft.firstName}
                    onChangeText={v => { setD('firstName', v); setEditError(''); }}
                    placeholder="First name"
                    placeholderTextColor={C.g300}
                    autoCapitalize="words"
                    onFocus={() => setFocused('firstName')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
                <View style={p.formHalf}>
                  <Text style={p.formLabel}>Last Name <Text style={p.req}>*</Text></Text>
                  <TextInput
                    style={inputStyle('lastName')}
                    value={draft.lastName}
                    onChangeText={v => { setD('lastName', v); setEditError(''); }}
                    placeholder="Last name"
                    placeholderTextColor={C.g300}
                    autoCapitalize="words"
                    onFocus={() => setFocused('lastName')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>

              <Text style={p.formLabel}>Middle Name <Text style={p.opt}>(optional)</Text></Text>
              <TextInput
                style={[inputStyle('middleName'), { marginBottom: 16 }]}
                value={draft.middleName}
                onChangeText={v => setD('middleName', v)}
                placeholder="Middle name"
                placeholderTextColor={C.g300}
                autoCapitalize="words"
                onFocus={() => setFocused('middleName')}
                onBlur={() => setFocused(null)}
              />

              <Text style={p.formLabel}>Email Address <Text style={p.req}>*</Text></Text>
              <TextInput
                style={[inputStyle('email'), { marginBottom: 16 }]}
                value={draft.email}
                onChangeText={v => { setD('email', v); setEditError(''); }}
                placeholder="Email"
                placeholderTextColor={C.g300}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />

              <Text style={p.formLabel}>Phone Number <Text style={p.opt}>(optional)</Text></Text>
              <TextInput
                style={[inputStyle('phone'), { marginBottom: 16 }]}
                value={draft.phone}
                onChangeText={v => setD('phone', v)}
                placeholder="+63 9XX XXX XXXX"
                placeholderTextColor={C.g300}
                keyboardType="phone-pad"
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
              />

              {/* Action buttons */}
              <View style={p.formActions}>
                <TouchableOpacity style={p.cancelBtn} onPress={cancelEdit}>
                  <Text style={p.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[p.saveBtn, saving && { opacity: 0.75 }]}
                  onPress={saveEdit}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color={C.white} size="small" />
                    : <><IconCheck size={13} color={C.white} /><Text style={p.saveBtnText}>Save Changes</Text></>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // ── VIEW MODE ─────────────────────────────────────────────────
            <View style={p.viewFields}>
              <FieldRow
                icon={<IconUser size={15} color={C.primary} />}
                label="Full Name"
                value={u.fullName || `${u.firstName} ${u.lastName}`}
              />
              <FieldRow
                icon={<IconMail size={15} color={C.primary} />}
                label="Email Address"
                value={u.email}
              />
              <FieldRow
                icon={<IconPhone size={15} color={C.primary} />}
                label="Phone Number"
                value={u.phone}
                placeholder="Not set"
              />
              <FieldRow
                icon={<IconCalendar size={15} color={C.primary} />}
                label="Date of Birth"
                value={dobLabel}
                placeholder="Not set"
              />
              <FieldRow
                icon={<IconUser size={15} color={C.primary} />}
                label="Sex"
                value={sexLabel}
                placeholder="Not set"
              />
              <FieldRow
                icon={<IconCar size={15} color={C.primary} />}
                label="Member Since"
                value={joinedLabel}
              />
            </View>
          )}
        </View>

        {/* ── QUICK LINKS CARD ── */}
        {!editing && (
          <View style={[p.card, { marginTop: 14 }]}>
            <View style={p.cardHeader}>
              <View style={p.cardHeaderDot} />
              <Text style={p.cardHeaderTitle}>Account</Text>
            </View>

            {/* Role-specific quick action */}
            <TouchableOpacity
              style={p.quickItem}
              onPress={() =>
                router.push(
                  u.role === 'owner' ? '/dashboard' : u.role === 'admin' ? '/admin' : '/renter'
                )
              }
            >
              <View style={[p.quickIcon, { backgroundColor: 'rgba(63,155,132,0.1)' }]}>
                <IconCar size={16} color={C.primary} />
              </View>
              <Text style={p.quickLabel}>
                {u.role === 'owner' ? 'My Dashboard' : 'Browse Vehicles'}
              </Text>
              <IconGo size={14} color={C.g400} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={p.divider} />

            <TouchableOpacity style={p.quickItem} onPress={() => router.push('/bookings')}>
              <View style={[p.quickIcon, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                <IconBooking size={16} color="#6366f1" />
              </View>
              <Text style={p.quickLabel}>
                {u.role === 'owner' ? 'Rental Requests' : u.role === 'admin' ? 'Booking Summary' : 'My Bookings'}
              </Text>
              <IconGo size={14} color={C.g400} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={p.divider} />

            <TouchableOpacity style={p.quickItem} onPress={() => router.push('/change-password')}>
              <View style={[p.quickIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                <IconLock size={16} color={C.warning} />
              </View>
              <Text style={p.quickLabel}>Change Password</Text>
              <IconGo size={14} color={C.g400} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            {u.role === 'admin' && (
              <>
                <View style={p.divider} />
                <TouchableOpacity style={p.quickItem} onPress={() => router.push('/email-log')}>
                  <View style={[p.quickIcon, { backgroundColor: 'rgba(63,155,132,0.1)' }]}>
                    <IconMail size={15} color={C.primary} />
                  </View>
                  <Text style={p.quickLabel}>Email Log</Text>
                  <IconBack size={14} color={C.g400} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              </>
            )}

            <View style={p.divider} />

            <TouchableOpacity style={[p.quickItem, { marginBottom: 4 }]} onPress={handleLogout}>
              <View style={[p.quickIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <IconLogout size={16} color={C.danger} />
              </View>
              <Text style={[p.quickLabel, { color: C.danger }]}>Log Out</Text>
              <IconGo size={14} color={C.danger} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── ROLE-SPECIFIC INFO CARD ── */}
        {!editing && (
          <View style={[p.card, { marginTop: 14 }]}>
            <View style={p.cardHeader}>
              <View style={[p.cardHeaderDot, { backgroundColor: roleMeta.dot }]} />
              <Text style={p.cardHeaderTitle}>
                {u.role === 'owner' ? 'Owner Details' : 'Renter Details'}
              </Text>
            </View>
            <View style={{ padding: 16 }}>
              {u.role === 'owner' ? (
                <>
                  <Text style={p.roleInfoText}>
                    As a <Text style={p.roleInfoBold}>Vehicle Owner</Text>, you can list your cars
                    for rent and manage incoming booking requests from renters.
                  </Text>
                  <View style={[p.roleInfoChip, { backgroundColor: 'rgba(63,155,132,0.08)', borderColor: 'rgba(63,155,132,0.2)' }]}>
                    <IconCar size={14} color={C.primary} />
                    <Text style={[p.roleInfoChipText, { color: C.primaryDk }]}>Active fleet management</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={p.roleInfoText}>
                    As a <Text style={p.roleInfoBold}>Renter</Text>, you can browse available vehicles
                    and submit booking requests to vehicle owners.
                  </Text>
                  <View style={[p.roleInfoChip, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }]}>
                    <IconBooking size={14} color="#6366f1" />
                    <Text style={[p.roleInfoChipText, { color: '#4f46e5' }]}>Instant booking requests</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const p = StyleSheet.create({
  // Banner
  banner: {
    backgroundColor: C.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  bannerBubble1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: C.primary, opacity: 0.07, top: -80, right: -60 },
  bannerBubble2: { position: 'absolute', width: 140, height: 140, borderRadius: 70,  backgroundColor: C.primary, opacity: 0.05, bottom: 0,  left: -40 },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.white, textAlign: 'center' },
  editBannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10,
  },
  editBannerText: { fontSize: 13, fontWeight: '700', color: C.white },

  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, marginBottom: 24 },
  bannerInfo: { flex: 1 },
  bannerName:  { fontSize: 20, fontWeight: '800', color: C.white, letterSpacing: -0.4, marginBottom: 3 },
  bannerEmail: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  roleDot:  { width: 6, height: 6, borderRadius: 3 },
  roleLabel:{ fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16, borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  statBox:  { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)' },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 3, letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600', textAlign: 'center' },

  // Toast
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0',
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 12, padding: 12,
  },
  toastText: { fontSize: 13, color: '#16a34a', fontWeight: '600' },

  // Cards
  card: {
    backgroundColor: C.white, marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.g100,
    backgroundColor: C.g50,
  },
  cardHeaderDot:   { width: 4, height: 16, borderRadius: 2, backgroundColor: C.primary },
  cardHeaderTitle: { fontSize: 13, fontWeight: '800', color: C.navy, letterSpacing: 0.2 },

  // View fields
  viewFields: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.g100 },
  fieldIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(63,155,132,0.08)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  fieldBody: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.g400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  fieldValue: { fontSize: 14, fontWeight: '600', color: C.g800 },
  fieldEmpty: { color: C.g300, fontStyle: 'italic', fontWeight: '400' },

  // Edit form
  form: { padding: 18 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  formHalf: { flex: 1 },
  formLabel: { fontSize: 12, fontWeight: '700', color: C.g700, marginBottom: 7, marginTop: 4 },
  req: { color: C.danger },
  opt: { color: C.g400, fontWeight: '400' },
  input: {
    borderWidth: 1.5, borderColor: C.g200, borderRadius: 11,
    paddingHorizontal: 13, paddingVertical: 13,
    fontSize: 14, color: C.g800, fontWeight: '500',
    backgroundColor: C.g50, marginBottom: 4,
  },
  inputFocused: {
    borderColor: C.primary, backgroundColor: C.primaryLt,
    shadowColor: C.primary, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { color: C.danger, fontSize: 13, fontWeight: '600' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: C.g200, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: C.g600 },
  saveBtn: {
    flex: 2, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  // Quick items
  quickItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 18, paddingVertical: 14,
  },
  quickIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: C.g700 },
  divider: { height: 1, backgroundColor: C.g100, marginLeft: 64 },

  // Role info
  roleInfoText: { fontSize: 13, color: C.g500, lineHeight: 20, marginBottom: 12 },
  roleInfoBold: { fontWeight: '700', color: C.g700 },
  roleInfoChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  roleInfoChipText: { fontSize: 12, fontWeight: '700' },
});