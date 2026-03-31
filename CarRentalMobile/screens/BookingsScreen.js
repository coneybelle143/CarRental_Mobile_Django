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

const RENTAL_DATA = [
  {
    id: 'b1',
    renterEmail: 'renter@test.com',
    vehicleName: 'Toyota Vios',
    ownerName: 'Alex Reyes',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    totalPrice: 5000,
    status: 'pending',
  },
  {
    id: 'b2',
    renterEmail: 'renter@test.com',
    vehicleName: 'Honda City',
    ownerName: 'Alex Reyes',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    totalPrice: 12000,
    status: 'completed',
  },
  {
    id: 'b3',
    renterEmail: 'renter@test.com',
    vehicleName: 'Ford Everest',
    ownerName: 'Ana Vehicle',
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    totalPrice: 20000,
    status: 'approved',
  },
  {
    id: 'b4',
    renterEmail: 'other@test.com',
    vehicleName: 'Toyota Hi-Ace',
    ownerName: 'Alex Reyes',
    startDate: '2026-03-16',
    endDate: '2026-03-18',
    totalPrice: 9000,
    status: 'rejected',
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');

  const baseData = useMemo(() => {
    if (user?.role === 'owner') return RENTAL_DATA.filter(item => item.ownerName === 'Alex Reyes');
    if (user?.role === 'renter') return RENTAL_DATA.filter(item => item.renterEmail === user?.email);
    return [];
  }, [user]);

  const stats = useMemo(() => ({
    total: baseData.length,
    pending: baseData.filter(x => x.status === 'pending').length,
    approved: baseData.filter(x => x.status === 'approved').length,
    completed: baseData.filter(x => x.status === 'completed').length,
    rejected: baseData.filter(x => x.status === 'rejected').length,
  }), [baseData]);

  const filtered = useMemo(() => {
    let list = baseData;
    if (activeTab !== 'all') list = list.filter(item => item.status === activeTab);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(item =>
        item.vehicleName.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, baseData, query]);

  const roleTitle = user?.role === 'owner' ? 'Rental Requests' : 'My Bookings';

  return (
    <ScrollView contentContainerStyle={s.root}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>{roleTitle}</Text>
      </View>

      <View style={s.statsRow}>
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Active" value={stats.approved} />
      </View>

      <TextInput
        style={s.input}
        placeholder="Search bookings"
        placeholderTextColor={C.g400}
        value={query}
        onChangeText={setQuery}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={s.tabsRow}>
          {['all', 'pending', 'approved', 'completed', 'rejected'].map(tab => (
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
          <Text style={s.emptyTitle}>No bookings found</Text>
          <Text style={s.emptySub}>Try another filter or search query.</Text>
        </View>
      ) : (
        filtered.map(item => (
          <View key={item.id} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.vehicle}>{item.vehicleName}</Text>
              <View style={s.statusPill}>
                <Text style={s.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={s.meta}>Owner: {item.ownerName}</Text>
            <Text style={s.meta}>From: {item.startDate}  To: {item.endDate}</Text>
            <Text style={s.price}>PHP {item.totalPrice.toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: C.g100,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.g200,
    padding: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
  },
  statLabel: {
    fontSize: 11,
    color: C.g600,
    marginTop: 3,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.navy,
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.g600,
  },
  meta: {
    marginTop: 5,
    color: C.g600,
    fontSize: 12,
  },
  price: {
    marginTop: 8,
    color: C.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});
