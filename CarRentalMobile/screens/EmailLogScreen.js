import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const C = {
  primary: '#3F9B84',
  primaryDk: '#2d7a67',
  navy: '#1a2c5e',
  g50: '#f8fafc',
  g100: '#f1f5f9',
  g200: '#e2e8f0',
  g300: '#cbd5e1',
  g400: '#94a3b8',
  g600: '#475569',
  white: '#ffffff',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  info: '#3b82f6',
};

const EMAIL_LOGS = [
  {
    id: 'e1',
    type: 'registration',
    to: 'renter@test.com',
    subject: 'Welcome to Car Rental',
    body: 'Your account has been created successfully.',
    sentAt: '2026-03-10T08:22:00.000Z',
  },
  {
    id: 'e2',
    type: 'rental',
    to: 'owner@test.com',
    subject: 'New booking request',
    body: 'A renter requested your vehicle for 3 days.',
    sentAt: '2026-03-11T11:10:00.000Z',
  },
  {
    id: 'e3',
    type: 'password',
    to: 'admin@test.com',
    subject: 'Password changed',
    body: 'Your password was changed successfully.',
    sentAt: '2026-03-13T12:35:00.000Z',
  },
];

const TAB_LABELS = {
  all: 'All',
  registration: 'Register',
  rental: 'Rental',
  password: 'Pass',
};

export default function EmailLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = EMAIL_LOGS;
    if (activeTab !== 'all') list = list.filter(item => item.type === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item =>
        item.to.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q)
      );
    }
    return list.slice().sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }, [activeTab, search]);

  if (user?.role !== 'admin') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={C.white} />
        <View style={s.blockedRoot}>
          <View style={s.blockedIconBox}>
            <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m-1-13h2v6h-2zm0 8h2v2h-2z" fill={C.danger} />
            </Svg>
          </View>
          <Text style={s.blockedTitle}>Admin Access Only</Text>
          <Text style={s.blockedSub}>Email logs are only available for administrators.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.back()}>
            <Text style={s.primaryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <ScrollView contentContainerStyle={s.root} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke={C.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <View style={s.headerContent}>
            <Text style={s.title}>Email Log</Text>
            <Text style={s.subtitle}>Admin Activity Logs</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Info Banner */}
        <View style={s.infoBanner}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke={C.info} strokeWidth={2} />
            <Path d="M12 8v4M12 16h.01" stroke={C.info} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text style={s.bannerText}>Read-only view. Full management available on web dashboard.</Text>
        </View>

        {/* Search Bar */}
        <View style={s.searchContainer}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke={C.g400} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <TextInput
            style={s.searchInput}
            placeholder="Search by email, subject..."
            placeholderTextColor={C.g400}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tab Filters */}
        <View style={s.tabsContainer}>
          <View style={s.tabsRow}>
            {['all', 'registration', 'rental', 'password'].map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[s.tab, activeTab === tab && s.tabActive]}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {TAB_LABELS[tab] || tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Email List */}
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
              <Path d="M3 8l9 6 9-6M3 8v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8M3 8l9 6" stroke={C.g300} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={s.emptyTitle}>No emails found</Text>
            <Text style={s.emptySub}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          <View>
            <Text style={s.countLabel}>{filtered.length} Email{filtered.length !== 1 ? 's' : ''}</Text>
            {filtered.map((item, idx) => (
              <View key={item.id} style={s.card}>
                <View style={s.cardHeader}>
                  <View style={[s.typeBadge, s[`type_${item.type}`]]}>
                    <Text style={s.typeText}>{item.type.toUpperCase()}</Text>
                  </View>
                  <Text style={s.time}>{new Date(item.sentAt).toLocaleString()}</Text>
                </View>

                <Text style={s.recipient}>To: <Text style={s.recipientEmail}>{item.to}</Text></Text>
                
                <View style={s.subjectBox}>
                  <Text style={s.label}>Subject</Text>
                  <Text style={s.subject}>{item.subject}</Text>
                </View>

                <View style={s.bodyBox}>
                  <Text style={s.label}>Message</Text>
                  <Text style={s.body}>{item.body}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.g50,
  },
  root: {
    flexGrow: 1,
    backgroundColor: C.g50,
  },

  // ─── BLOCKED STATE ───────────────────────────────────────────────────────
  blockedRoot: {
    flex: 1,
    backgroundColor: C.g50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  blockedIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.g200,
  },
  blockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.navy,
    marginBottom: 8,
  },
  blockedSub: {
    fontSize: 14,
    color: C.g600,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // ─── HEADER ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.g100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.g50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.navy,
  },
  subtitle: {
    fontSize: 12,
    color: C.g400,
    marginTop: 2,
  },

  // ─── INFO BANNER ─────────────────────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: C.info,
    marginLeft: 8,
    lineHeight: 18,
  },

  // ─── SEARCH ──────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.g200,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.navy,
    paddingVertical: 0,
  },

  // ─── TABS ────────────────────────────────────────────────────────────────
  tabsContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.g200,
  },
  tab: {
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: C.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.g400,
  },
  tabTextActive: {
    color: C.navy,
    fontWeight: '700',
  },

  // ─── COUNT LABEL ─────────────────────────────────────────────────────────
  countLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.g400,
    marginHorizontal: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── EMPTY STATE ─────────────────────────────────────────────────────────
  empty: {
    marginHorizontal: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: C.white,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.g200,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.navy,
  },
  emptySub: {
    fontSize: 13,
    color: C.g400,
    marginTop: 6,
  },

  // ─── EMAIL CARD ──────────────────────────────────────────────────────────
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.g200,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  type_registration: {
    backgroundColor: '#dbeafe',
  },
  type_rental: {
    backgroundColor: '#fef3c7',
  },
  type_password: {
    backgroundColor: '#dcfce7',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 11,
    color: C.g400,
    fontWeight: '500',
  },

  // ─── RECIPIENT ───────────────────────────────────────────────────────────
  recipient: {
    fontSize: 12,
    color: C.g600,
    marginBottom: 10,
  },
  recipientEmail: {
    fontWeight: '700',
    color: C.navy,
  },

  // ─── SUBJECT BOX ─────────────────────────────────────────────────────────
  subjectBox: {
    backgroundColor: C.g50,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: C.g400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  subject: {
    fontSize: 13,
    fontWeight: '600',
    color: C.navy,
    lineHeight: 18,
  },

  // ─── BODY BOX ────────────────────────────────────────────────────────────
  bodyBox: {
    backgroundColor: C.g50,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  body: {
    fontSize: 12,
    color: C.g600,
    lineHeight: 18,
  },

  // ─── BUTTON ──────────────────────────────────────────────────────────────
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});
