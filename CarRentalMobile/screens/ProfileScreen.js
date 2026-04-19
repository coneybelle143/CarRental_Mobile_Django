// screens/ProfileScreen.js
// Unified profile screen — works for owner, renter, and admin roles.
// Reads/writes via AuthContext so changes persist within the session.
//
// Profile picture CRUD
//   CREATE / UPDATE  — tap camera badge → custom modal overlay appears
//                      → choose "Take Photo" or "Choose from Library"
//                      → preview + confirm Save or Discard
//   DELETE           — "Remove Photo" inside the modal (only when photo exists)
//                      → confirm overlay before deleting
//   The static "Profile Photo" card is removed — everything lives in the modal.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  primary:    '#3F9B84',
  primaryDk:  '#2d7a67',
  primaryLt:  '#ecfdf5',
  navy:       '#1a2c5e',
  danger:     '#ef4444',
  success:    '#22c55e',
  warning:    '#f59e0b',
  g50:  '#f8fafc', g100: '#f1f5f9', g200: '#e2e8f0',
  g300: '#cbd5e1', g400: '#94a3b8', g500: '#64748b',
  g600: '#475569', g700: '#334155', g800: '#1e293b',
  white: '#ffffff',
};

const ROLE_META = {
  owner:  { label: 'Vehicle Owner',  color: '#d97706', bg: 'rgba(245,158,11,.12)',  dot: '#f59e0b' },
  renter: { label: 'Renter',         color: '#4f46e5', bg: 'rgba(99,102,241,.12)',  dot: '#6366f1' },
  admin:  { label: 'Administrator',  color: '#7e22ce', bg: 'rgba(168,85,247,.12)',  dot: '#a855f7' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG icons
// ─────────────────────────────────────────────────────────────────────────────
const SB = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconUser     = ({ size = 20, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" />
  </Svg>
);
const IconMail     = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Rect x="2" y="4" width="20" height="16" rx="2" />
    <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Svg>
);
const IconPhone    = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);
const IconCalendar = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Rect x="3" y="4" width="18" height="18" rx="2" /><Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);
const IconEdit     = ({ size = 15, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);
const IconBack     = ({ size = 20, color = C.g600 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2.5" {...SB}>
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);
const IconGo       = ({ size = 20, color = C.g600 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2.5" {...SB}>
    <Path d="M9 5l7 7-7 7" />
  </Svg>
);
const IconCar      = ({ size = 18, color = C.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <Circle cx="7" cy="17" r="2" /><Path d="M9 17h6" /><Circle cx="17" cy="17" r="2" />
  </Svg>
);
const IconLogout   = ({ size = 16, color = C.danger }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);
const IconCheck    = ({ size = 14, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="3" {...SB}>
    <Path d="M5 13l4 4L19 7" />
  </Svg>
);
const IconLock     = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Rect x="3" y="11" width="18" height="11" rx="2" /><Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);
const IconBooking  = ({ size = 16, color = C.g400 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
  </Svg>
);
const IconCamera   = ({ size = 14, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);
const IconTrash    = ({ size = 16, color = C.danger }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
  </Svg>
);
const IconGallery  = ({ size = 16, color = C.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Rect x="3" y="3" width="18" height="18" rx="2" />
    <Circle cx="8.5" cy="8.5" r="1.5" />
    <Path d="M21 15l-5-5L5 21" />
  </Svg>
);
const IconX        = ({ size = 16, color = C.g500 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2.5" {...SB}>
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);
const IconWarning  = ({ size = 28, color = C.danger }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth="2" {...SB}>
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Path d="M12 9v4M12 17h.01" />
  </Svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// AvatarCircle — photo or initials
// ─────────────────────────────────────────────────────────────────────────────
function AvatarCircle({ name = '', photoUri = null, size = 72, fontSize = 26, style }) {
  const initials = name.split(' ').slice(0, 2).map(w => (w[0] || '').toUpperCase()).join('');
  return (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
      backgroundColor: C.primary,
    }, style]}>
      {photoUri
        ? <Image source={{ uri: photoUri }} style={{ width: size, height: size }} resizeMode="cover" />
        : <Text style={{ fontSize, fontWeight: '800', color: C.white, letterSpacing: -0.5 }}>{initials || '?'}</Text>
      }
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FieldRow
// ─────────────────────────────────────────────────────────────────────────────
function FieldRow({ icon, label, value, placeholder = '—' }) {
  return (
    <View style={s.fieldRow}>
      <View style={s.fieldIcon}>{icon}</View>
      <View style={s.fieldBody}>
        <Text style={s.fieldLabel}>{label}</Text>
        <Text style={[s.fieldValue, !value && s.fieldEmpty]}>{value || placeholder}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────────────────────────
async function ensurePermission(type) {
  if (type === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

const MEDIA_IMAGES = ImagePicker.MediaType?.Images || 'images';
const PICKER_OPTIONS = {
  mediaTypes: [MEDIA_IMAGES],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

// ─────────────────────────────────────────────────────────────────────────────
// Photo Modal — step 1: action picker  |  step 2: preview + confirm
//               step 3: remove confirm
// ─────────────────────────────────────────────────────────────────────────────
function PhotoModal({ visible, currentUri, onClose, onSave, onRemove }) {
  // 'picker' | 'preview' | 'removeConfirm'
  const [step, setStep]         = useState('picker');
  const [pendingUri, setPending] = useState(null);

  // Reset whenever modal opens
  const open = (s2 = 'picker') => { setStep(s2); setPending(null); };

  const handlePickLibrary = async () => {
    const ok = await ensurePermission('library');
    if (!ok) { Alert.alert('Permission required', 'Please allow photo library access in Settings.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!r.canceled && r.assets?.[0]?.uri) { setPending(r.assets[0].uri); setStep('preview'); }
  };

  const handlePickCamera = async () => {
    const ok = await ensurePermission('camera');
    if (!ok) { Alert.alert('Permission required', 'Please allow camera access in Settings.'); return; }
    const r = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!r.canceled && r.assets?.[0]?.uri) { setPending(r.assets[0].uri); setStep('preview'); }
  };

  const handleSave = () => { onSave(pendingUri); onClose(); };
  const handleDiscard = () => setStep('picker');
  const handleRemoveConfirm = () => { onRemove(); onClose(); };

  // When modal closes reset state
  const handleClose = () => { setStep('picker'); setPending(null); onClose(); };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={m.backdrop} />
      </TouchableWithoutFeedback>

      <View style={m.sheet} pointerEvents="box-none">

        {/* ── STEP 1 : action picker ───────────────────────────────── */}
        {step === 'picker' && (
          <View style={m.card}>
            {/* header */}
            <View style={m.header}>
              <View style={m.headerIcon}>
                <IconCamera size={18} color={C.primary} />
              </View>
              <Text style={m.title}>Profile Photo</Text>
              <TouchableOpacity style={m.closeBtn} onPress={handleClose}>
                <IconX size={15} color={C.g500} />
              </TouchableOpacity>
            </View>

            {/* current preview */}
            <View style={m.previewRow}>
              <AvatarCircle name="" photoUri={currentUri} size={64} fontSize={22} />
              <Text style={m.previewLabel}>
                {currentUri ? 'Current photo' : 'No photo set'}
              </Text>
            </View>

            <View style={m.separator} />

            {/* options */}
            <TouchableOpacity style={m.option} onPress={handlePickLibrary}>
              <View style={[m.optIcon, { backgroundColor: 'rgba(63,155,132,0.1)' }]}>
                <IconGallery size={17} color={C.primary} />
              </View>
              <View style={m.optBody}>
                <Text style={m.optLabel}>{currentUri ? 'Replace from Library' : 'Choose from Library'}</Text>
                <Text style={m.optSub}>Pick a photo from your device</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={m.option} onPress={handlePickCamera}>
              <View style={[m.optIcon, { backgroundColor: 'rgba(63,155,132,0.1)' }]}>
                <IconCamera size={17} color={C.primary} />
              </View>
              <View style={m.optBody}>
                <Text style={m.optLabel}>Take a Photo</Text>
                <Text style={m.optSub}>Use your camera right now</Text>
              </View>
            </TouchableOpacity>

            {currentUri && (
              <TouchableOpacity style={m.option} onPress={() => setStep('removeConfirm')}>
                <View style={[m.optIcon, { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
                  <IconTrash size={17} color={C.danger} />
                </View>
                <View style={m.optBody}>
                  <Text style={[m.optLabel, { color: C.danger }]}>Remove Photo</Text>
                  <Text style={m.optSub}>Revert to initials avatar</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={m.cancelBtn} onPress={handleClose}>
              <Text style={m.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2 : preview + confirm save ─────────────────────── */}
        {step === 'preview' && (
          <View style={m.card}>
            <View style={m.header}>
              <View style={m.headerIcon}>
                <IconCheck size={16} color={C.primary} />
              </View>
              <Text style={m.title}>Confirm Photo</Text>
              <TouchableOpacity style={m.closeBtn} onPress={handleClose}>
                <IconX size={15} color={C.g500} />
              </TouchableOpacity>
            </View>

            <Text style={m.confirmSubtitle}>Does this look good?</Text>

            {/* large preview */}
            <View style={m.largePreviewWrap}>
              <AvatarCircle
                name=""
                photoUri={pendingUri}
                size={120}
                style={{ borderWidth: 3, borderColor: C.g200 }}
              />
            </View>

            <View style={m.confirmActions}>
              <TouchableOpacity style={m.discardBtn} onPress={handleDiscard}>
                <Text style={m.discardText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={m.saveBtn} onPress={handleSave}>
                <IconCheck size={13} color={C.white} />
                <Text style={m.saveText}>Save Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 3 : remove confirmation ────────────────────────── */}
        {step === 'removeConfirm' && (
          <View style={m.card}>
            <View style={m.header}>
              <View style={[m.headerIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <IconWarning size={18} color={C.danger} />
              </View>
              <Text style={[m.title, { color: C.danger }]}>Remove Photo?</Text>
              <TouchableOpacity style={m.closeBtn} onPress={handleClose}>
                <IconX size={15} color={C.g500} />
              </TouchableOpacity>
            </View>

            <Text style={m.removeBody}>
              Your profile picture will be removed and replaced with your initials avatar. This cannot be undone.
            </Text>

            {/* current photo mini preview */}
            <View style={[m.largePreviewWrap, { marginBottom: 8 }]}>
              <AvatarCircle
                name=""
                photoUri={currentUri}
                size={88}
                style={{ opacity: 0.5, borderWidth: 3, borderColor: C.danger + '55' }}
              />
              <View style={m.removeBadge}>
                <IconX size={14} color={C.white} />
              </View>
            </View>

            <View style={m.confirmActions}>
              <TouchableOpacity style={m.discardBtn} onPress={() => setStep('picker')}>
                <Text style={m.discardText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[m.saveBtn, { backgroundColor: C.danger }]} onPress={handleRemoveConfirm}>
                <IconTrash size={13} color={C.white} />
                <Text style={m.saveText}>Yes, Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, updatePhoto, logout } = useAuth();
  const u = user || {};

  React.useEffect(() => {
    if (!user) router.replace('/login');
  }, [router, user]);

  const roleMeta    = ROLE_META[u.role] || ROLE_META.renter;
  const displayName = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User';

  // ── Photo modal visibility ─────────────────────────────────────────────────
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [focused,   setFocused]   = useState(null);
  const [editError, setEditError] = useState('');

  const [draft, setDraft] = useState({
    firstName:  u.firstName  || '',
    lastName:   u.lastName   || '',
    middleName: u.middleName || '',
    phone:      u.phone      || '',
    email:      u.email      || '',
  });

  React.useEffect(() => {
    setDraft({
      firstName:  user?.firstName  || '',
      lastName:   user?.lastName   || '',
      middleName: user?.middleName || '',
      phone:      user?.phone      || '',
      email:      user?.email      || '',
    });
  }, [user]);

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
      setEditError('First name, last name, and email are required.');
      return;
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

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const joinedLabel = u.joinedAt
    ? new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  const dobLabel = u.dob
    ? new Date(u.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const sexLabel =
    u.sex === 'prefer_not' ? 'Prefer not to say'
    : u.sex ? u.sex.charAt(0).toUpperCase() + u.sex.slice(1) : '';

  const inputStyle = (field) => [s.input, focused === field && s.inputFocused];

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.g50 }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* ── Photo modal ─────────────────────────────────────────────────── */}
      <PhotoModal
        visible={photoModalOpen}
        currentUri={u.photoUri}
        onClose={() => setPhotoModalOpen(false)}
        onSave={(uri) => updatePhoto(uri)}
        onRemove={() => updatePhoto(null)}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ══ HEADER BANNER ══════════════════════════════════════════════ */}
        <View style={s.banner}>
          <View style={s.bannerBubble1} />
          <View style={s.bannerBubble2} />

          <View style={s.topBar}>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconBack color={C.white} />
            </TouchableOpacity>
            <Text style={s.topBarTitle}>My Profile</Text>
            <TouchableOpacity
              style={s.editBannerBtn}
              onPress={() => (editing ? cancelEdit() : setEditing(true))}
            >
              <IconEdit size={13} color={editing ? C.navy : C.white} />
              <Text style={[s.editBannerText, editing && { color: C.navy }]}>
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Avatar — camera badge opens the photo modal */}
          <View style={s.bannerContent}>
            <View>
              <AvatarCircle
                name={displayName}
                photoUri={u.photoUri}
                size={80}
                fontSize={28}
                style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' }}
              />
              {/* Camera badge — the ONLY entry point to photo CRUD */}
              <TouchableOpacity
                style={s.cameraBadge}
                onPress={() => setPhotoModalOpen(true)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <IconCamera size={11} color={C.white} />
              </TouchableOpacity>
            </View>

            <View style={s.bannerInfo}>
              <Text style={s.bannerName}>{displayName}</Text>
              <Text style={s.bannerEmail}>{u.email}</Text>
              <View style={[s.rolePill, { backgroundColor: roleMeta.bg }]}>
                <View style={[s.roleDot, { backgroundColor: roleMeta.dot }]} />
                <Text style={[s.roleLabel, { color: roleMeta.color }]}>{roleMeta.label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ══ SUCCESS TOAST ══════════════════════════════════════════════ */}
        {saved && (
          <View style={s.toast}>
            <IconCheck size={14} color={C.success} />
            <Text style={s.toastText}>Profile updated successfully!</Text>
          </View>
        )}

        {/* ══ PERSONAL INFORMATION CARD ══════════════════════════════════ */}
        <View style={[s.card, { marginTop: 14 }]}> 
          <View style={s.cardHeader}>
            <View style={s.cardHeaderDot} />
            <Text style={s.cardHeaderTitle}>
              {editing ? 'Edit Profile' : 'Personal Information'}
            </Text>
          </View>

          {editing ? (
            <View style={s.form}>
              {!!editError && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{editError}</Text>
                </View>
              )}

              <View style={s.formRow}>
                <View style={s.formHalf}>
                  <Text style={s.formLabel}>First Name <Text style={s.req}>*</Text></Text>
                  <TextInput
                    style={inputStyle('firstName')}
                    value={draft.firstName}
                    onChangeText={v => { setD('firstName', v); setEditError(''); }}
                    placeholder="First name" placeholderTextColor={C.g300}
                    autoCapitalize="words"
                    onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)}
                  />
                </View>
                <View style={s.formHalf}>
                  <Text style={s.formLabel}>Last Name <Text style={s.req}>*</Text></Text>
                  <TextInput
                    style={inputStyle('lastName')}
                    value={draft.lastName}
                    onChangeText={v => { setD('lastName', v); setEditError(''); }}
                    placeholder="Last name" placeholderTextColor={C.g300}
                    autoCapitalize="words"
                    onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)}
                  />
                </View>
              </View>

              <Text style={s.formLabel}>Middle Name <Text style={s.opt}>(optional)</Text></Text>
              <TextInput
                style={[inputStyle('middleName'), { marginBottom: 16 }]}
                value={draft.middleName} onChangeText={v => setD('middleName', v)}
                placeholder="Middle name" placeholderTextColor={C.g300} autoCapitalize="words"
                onFocus={() => setFocused('middleName')} onBlur={() => setFocused(null)}
              />

              <Text style={s.formLabel}>Email Address <Text style={s.req}>*</Text></Text>
              <TextInput
                style={[inputStyle('email'), { marginBottom: 16 }]}
                value={draft.email}
                onChangeText={v => { setD('email', v); setEditError(''); }}
                placeholder="Email" placeholderTextColor={C.g300}
                keyboardType="email-address" autoCapitalize="none"
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              />

              <Text style={s.formLabel}>Phone Number <Text style={s.opt}>(optional)</Text></Text>
              <TextInput
                style={[inputStyle('phone'), { marginBottom: 16 }]}
                value={draft.phone} onChangeText={v => setD('phone', v)}
                placeholder="+63 9XX XXX XXXX" placeholderTextColor={C.g300} keyboardType="phone-pad"
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
              />

              <View style={s.formActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={cancelEdit}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.75 }]} onPress={saveEdit} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color={C.white} size="small" />
                    : <><IconCheck size={13} color={C.white} /><Text style={s.saveBtnText}>Save Changes</Text></>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.viewFields}>
              <FieldRow icon={<IconUser size={15} color={C.primary} />}     label="Full Name"     value={displayName} />
              <FieldRow icon={<IconMail size={15} color={C.primary} />}     label="Email Address" value={u.email} />
              <FieldRow icon={<IconPhone size={15} color={C.primary} />}    label="Phone Number"  value={u.phone}   placeholder="Not set" />
              <FieldRow icon={<IconCalendar size={15} color={C.primary} />} label="Date of Birth" value={dobLabel}  placeholder="Not set" />
              <FieldRow icon={<IconUser size={15} color={C.primary} />}     label="Sex"           value={sexLabel}  placeholder="Not set" />
              <FieldRow icon={<IconCar size={15} color={C.primary} />}      label="Member Since"  value={joinedLabel} />
            </View>
          )}
        </View>

        {/* ══ ACCOUNT QUICK-LINKS ════════════════════════════════════════ */}
        {!editing && (
          <View style={[s.card, { marginTop: 14 }]}>
            <View style={s.cardHeader}>
              <View style={s.cardHeaderDot} />
              <Text style={s.cardHeaderTitle}>Account</Text>
            </View>

            <TouchableOpacity style={s.quickItem}
              onPress={() => router.push(u.role === 'owner' ? '/dashboard' : u.role === 'admin' ? '/admin' : '/renter')}
            >
              <View style={[s.quickIcon, { backgroundColor: 'rgba(63,155,132,0.1)' }]}>
                <IconCar size={16} color={C.primary} />
              </View>
              <Text style={s.quickLabel}>
                {u.role === 'owner' ? 'My Dashboard' : u.role === 'admin' ? 'Admin Dashboard' : 'Browse Vehicles'}
              </Text>
              <IconGo size={14} color={C.g400} />
            </TouchableOpacity>

            <View style={s.divider} />

            <TouchableOpacity style={s.quickItem} onPress={() => router.push('/bookings')}>
              <View style={[s.quickIcon, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                <IconBooking size={16} color="#6366f1" />
              </View>
              <Text style={s.quickLabel}>
                {u.role === 'owner' ? 'Rental Requests' : u.role === 'admin' ? 'Booking Summary' : 'My Bookings'}
              </Text>
              <IconGo size={14} color={C.g400} />
            </TouchableOpacity>

            <View style={s.divider} />

            <TouchableOpacity style={s.quickItem} onPress={() => router.push('/change-password')}>
              <View style={[s.quickIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                <IconLock size={16} color={C.warning} />
              </View>
              <Text style={s.quickLabel}>Change Password</Text>
              <IconGo size={14} color={C.g400} />
            </TouchableOpacity>

            {u.role === 'admin' && (
              <>
                <View style={s.divider} />
                <TouchableOpacity style={s.quickItem} onPress={() => router.push('/email-log')}>
                  <View style={[s.quickIcon, { backgroundColor: 'rgba(63,155,132,0.1)' }]}>
                    <IconMail size={15} color={C.primary} />
                  </View>
                  <Text style={s.quickLabel}>Email Log</Text>
                  <IconGo size={14} color={C.g400} />
                </TouchableOpacity>
              </>
            )}

            <View style={s.divider} />

            <TouchableOpacity style={[s.quickItem, { marginBottom: 4 }]} onPress={handleLogout}>
              <View style={[s.quickIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <IconLogout size={16} color={C.danger} />
              </View>
              <Text style={[s.quickLabel, { color: C.danger }]}>Log Out</Text>
              <IconGo size={14} color={C.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* ══ ROLE INFO CARD ═════════════════════════════════════════════ */}
        {!editing && (
          <View style={[s.card, { marginTop: 14 }]}>
            <View style={s.cardHeader}>
              <View style={[s.cardHeaderDot, { backgroundColor: roleMeta.dot }]} />
              <Text style={s.cardHeaderTitle}>
                {u.role === 'owner' ? 'Owner Details' : u.role === 'admin' ? 'Admin Details' : 'Renter Details'}
              </Text>
            </View>
            <View style={{ padding: 16 }}>
              {u.role === 'owner' ? (
                <>
                  <Text style={s.roleInfoText}>
                    As a <Text style={s.roleInfoBold}>Vehicle Owner</Text>, you can list your cars
                    for rent and manage incoming booking requests from renters.
                  </Text>
                  <View style={[s.roleInfoChip, { backgroundColor: 'rgba(63,155,132,0.08)', borderColor: 'rgba(63,155,132,0.2)' }]}>
                    <IconCar size={14} color={C.primary} />
                    <Text style={[s.roleInfoChipText, { color: C.primaryDk }]}>Active fleet management</Text>
                  </View>
                </>
              ) : u.role === 'admin' ? (
                <>
                  <Text style={s.roleInfoText}>
                    As an <Text style={s.roleInfoBold}>Administrator</Text>, you can monitor platform
                    analytics and oversee system-level activity for the mobile app.
                  </Text>
                  <View style={[s.roleInfoChip, { backgroundColor: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)' }]}>
                    <IconUser size={14} color="#7e22ce" />
                    <Text style={[s.roleInfoChipText, { color: '#6b21a8' }]}>Analytics and operations</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={s.roleInfoText}>
                    As a <Text style={s.roleInfoBold}>Renter</Text>, you can browse available vehicles
                    and submit booking requests to vehicle owners.
                  </Text>
                  <View style={[s.roleInfoChip, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }]}>
                    <IconBooking size={14} color="#6366f1" />
                    <Text style={[s.roleInfoChipText, { color: '#4f46e5' }]}>Instant booking requests</Text>
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

// ─────────────────────────────────────────────────────────────────────────────
// Screen styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  banner: { backgroundColor: C.navy, paddingTop: Platform.OS === 'ios' ? 44 : 28, paddingBottom: 6, overflow: 'hidden' },
  bannerBubble1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: C.primary, opacity: 0.07, top: -80, right: -60 },
  bannerBubble2: { position: 'absolute', width: 140, height: 140, borderRadius: 70,  backgroundColor: C.primary, opacity: 0.05, bottom: 0,  left: -40 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: C.white, textAlign: 'center' },
  editBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  editBannerText: { fontSize: 12, fontWeight: '700', color: C.white },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  bannerInfo:  { flex: 1 },
  bannerName:  { fontSize: 18, fontWeight: '800', color: C.white, letterSpacing: -0.4, marginBottom: 2 },
  bannerEmail: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  roleDot:  { width: 6, height: 6, borderRadius: 3 },
  roleLabel:{ fontSize: 11, fontWeight: '700' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.primaryDk,
    borderWidth: 2, borderColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', marginHorizontal: 16, marginTop: 14, borderRadius: 12, padding: 12 },
  toastText: { fontSize: 13, color: '#16a34a', fontWeight: '600' },
  card: { backgroundColor: C.white, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.g100, backgroundColor: C.g50 },
  cardHeaderDot:   { width: 4, height: 16, borderRadius: 2, backgroundColor: C.primary },
  cardHeaderTitle: { fontSize: 13, fontWeight: '800', color: C.navy, letterSpacing: 0.2 },
  viewFields: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.g100 },
  fieldIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(63,155,132,0.08)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  fieldBody:  { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.g400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  fieldValue: { fontSize: 14, fontWeight: '600', color: C.g800 },
  fieldEmpty: { color: C.g300, fontStyle: 'italic', fontWeight: '400' },
  form:      { padding: 18 },
  formRow:   { flexDirection: 'row', gap: 12, marginBottom: 4 },
  formHalf:  { flex: 1 },
  formLabel: { fontSize: 12, fontWeight: '700', color: C.g700, marginBottom: 7, marginTop: 4 },
  req: { color: C.danger },
  opt: { color: C.g400, fontWeight: '400' },
  input: { borderWidth: 1.5, borderColor: C.g200, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 13, fontSize: 14, color: C.g800, fontWeight: '500', backgroundColor: C.g50, marginBottom: 4 },
  inputFocused: { borderColor: C.primary, backgroundColor: C.primaryLt, shadowColor: C.primary, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { color: C.danger, fontSize: 13, fontWeight: '600' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: C.g200, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: C.g600 },
  saveBtn: { flex: 2, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, shadowColor: C.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  quickItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  quickIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: C.g700 },
  divider:    { height: 1, backgroundColor: C.g100, marginLeft: 64 },
  roleInfoText:     { fontSize: 13, color: C.g500, lineHeight: 20, marginBottom: 12 },
  roleInfoBold:     { fontWeight: '700', color: C.g700 },
  roleInfoChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  roleInfoChipText: { fontSize: 12, fontWeight: '700' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Modal styles
// ─────────────────────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: -4 }, elevation: 20,
  },

  // header
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14 },
  headerIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(63,155,132,0.1)', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: C.navy },
  closeBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },

  // current preview row (step 1)
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingBottom: 16 },
  previewLabel: { fontSize: 13, color: C.g500, fontWeight: '500' },

  separator: { height: 1, backgroundColor: C.g100, marginHorizontal: 18, marginBottom: 6 },

  // options (step 1)
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 13 },
  optIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optBody: { flex: 1 },
  optLabel: { fontSize: 14, fontWeight: '700', color: C.g800, marginBottom: 1 },
  optSub:   { fontSize: 12, color: C.g400 },

  cancelBtn: { marginHorizontal: 18, marginTop: 6, marginBottom: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.g200, alignItems: 'center', backgroundColor: C.g50 },
  cancelText: { fontSize: 14, fontWeight: '700', color: C.g500 },

  // preview (step 2) + remove (step 3)
  confirmSubtitle: { fontSize: 13, color: C.g400, textAlign: 'center', marginBottom: 16, marginTop: -4 },
  largePreviewWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  confirmActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingBottom: 20 },
  discardBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: C.g200, alignItems: 'center', backgroundColor: C.g50 },
  discardText: { fontSize: 14, fontWeight: '700', color: C.g600 },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 14, borderRadius: 14, backgroundColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  saveText: { fontSize: 14, fontWeight: '700', color: C.white },

  // remove confirm (step 3)
  removeBody: { fontSize: 13, color: C.g500, lineHeight: 20, paddingHorizontal: 18, paddingBottom: 16, textAlign: 'center' },
  removeBadge: { position: 'absolute', bottom: 0, right: '32%', width: 26, height: 26, borderRadius: 13, backgroundColor: C.danger, borderWidth: 2, borderColor: C.white, alignItems: 'center', justifyContent: 'center' },
});