import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const C = {
  primary: '#3F9B84',
  navy: '#1a2c5e',
  g100: '#f1f5f9',
  g200: '#e2e8f0',
  g400: '#94a3b8',
  g600: '#475569',
  white: '#ffffff',
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
      <View style={s.blockedRoot}>
        <Text style={s.blockedTitle}>Admin Access Only</Text>
        <Text style={s.blockedSub}>Email logs are only available for administrators.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.back()}>
          <Text style={s.primaryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.root}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Email Log</Text>
      </View>

      <Text style={s.notice}>Mobile admin can only review logs. Management actions stay on web.</Text>

      <TextInput
        style={s.input}
        placeholder="Search email logs"
        placeholderTextColor={C.g400}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={s.tabsRow}>
          {['all', 'registration', 'rental', 'password'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.tab, activeTab === tab && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No emails found</Text>
          <Text style={s.emptySub}>Try changing filters.</Text>
        </View>
      ) : (
        filtered.map(item => (
          <View key={item.id} style={s.card}>
            <Text style={s.type}>{item.type.toUpperCase()}</Text>
            <Text style={s.label}>To: <Text style={s.value}>{item.to}</Text></Text>
            <Text style={s.label}>Subject: <Text style={s.value}>{item.subject}</Text></Text>
            <Text style={s.body}>{item.body}</Text>
            <Text style={s.time}>{new Date(item.sentAt).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: C.g100,
    padding: 16,
  },
  blockedRoot: {
    flex: 1,
    backgroundColor: C.g100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.navy,
  },
  blockedSub: {
    marginTop: 8,
    color: C.g600,
    textAlign: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  back: {
    color: C.primary,
    fontWeight: '700',
  },
  title: {
    color: C.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  notice: {
    fontSize: 12,
    color: C.g600,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 10,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: C.navy,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    borderWidth: 1,
    borderColor: C.g200,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.white,
  },
  tabActive: {
    borderColor: C.primary,
    backgroundColor: '#ecfdf5',
  },
  tabText: {
    textTransform: 'capitalize',
    color: C.g600,
    fontWeight: '600',
    fontSize: 12,
  },
  tabTextActive: {
    color: C.primary,
  },
  empty: {
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.g200,
    padding: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    color: C.navy,
    fontWeight: '700',
  },
  emptySub: {
    marginTop: 4,
    color: C.g600,
    fontSize: 12,
  },
  card: {
    marginBottom: 10,
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.g200,
    padding: 12,
  },
  type: {
    color: C.primary,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  label: {
    color: C.g600,
    fontSize: 12,
    marginBottom: 3,
  },
  value: {
    color: C.navy,
    fontWeight: '700',
  },
  body: {
    marginTop: 8,
    color: C.g600,
    fontSize: 12,
    lineHeight: 18,
  },
  time: {
    marginTop: 8,
    color: C.g400,
    fontSize: 11,
  },
  primaryBtn: {
    borderRadius: 10,
    backgroundColor: C.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  primaryText: {
    color: C.white,
    fontWeight: '700',
  },
});
