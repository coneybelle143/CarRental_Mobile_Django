import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StyleSheet, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLogReport } from '../context/LogReportContext';
import BottomNav from '../components/BottomNav';
import ProfileAvatar from '../components/ProfileAvatar';
import LogReportScreen from './LogReportScreen';

const C = {
  primary:   '#3F9B84',
  primaryDk: '#2d7a67',
  primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#ef4444',
  warning:   '#f59e0b',
  success:   '#22c55e',
  g50:  '#f9fafb',
  g100: '#f3f4f6',
  g200: '#e5e7eb',
  g300: '#d1d5db',
  g400: '#9ca3af',
  g500: '#6b7280',
  g700: '#374151',
  g900: '#111827',
  white: '#ffffff',
};

const DEMO_VEHICLES = [
  { id: 1, name: 'Toyota Vios',    model: '1.3 E CVT',  year: '2022', pricePerDay: '2500', status: 'available', location: 'Davao City',    seats: '5', fuel: 'Gasoline', ownerName: 'Carlos Owner' },
  { id: 2, name: 'Honda City',     model: '1.5 RS CVT', year: '2021', pricePerDay: '3000', status: 'available', location: 'Davao City',    seats: '5', fuel: 'Gasoline', ownerName: 'Carlos Owner' },
  { id: 3, name: 'Mitsubishi Xpander', model: 'GLS',    year: '2023', pricePerDay: '3500', status: 'rented',   location: 'Tagum City',    seats: '7', fuel: 'Gasoline', ownerName: 'Ana Vehicle' },
  { id: 4, name: 'Ford Everest',   model: 'Titanium',   year: '2022', pricePerDay: '5000', status: 'available', location: 'Davao City',   seats: '7', fuel: 'Diesel',   ownerName: 'Ana Vehicle' },
  { id: 5, name: 'Toyota Hi-Ace',  model: 'GL Grandia', year: '2020', pricePerDay: '4500', status: 'available', location: 'Gensan',        seats: '15', fuel: 'Diesel',   ownerName: 'Ben Rentals' },
];


function VehicleCard({ vehicle, onRent }) {
  const available = vehicle.status === 'available';
  return (
    <View style={s.vehicleCard}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Text style={s.vehicleName}>{vehicle.name}</Text>
          <View style={{ backgroundColor: available ? '#d1fae5' : '#fef3c7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: available ? '#065f46' : '#92400e' }}>
              {available ? 'Available' : 'Rented'}
            </Text>
          </View>
        </View>
        <Text style={s.vehicleSub}>{vehicle.model} · {vehicle.year}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: C.g500 }}>📍 {vehicle.location}</Text>
          <Text style={{ fontSize: 12, color: C.g500 }}>👥 {vehicle.seats} seats</Text>
          <Text style={{ fontSize: 12, color: C.g500 }}>⛽ {vehicle.fuel}</Text>
        </View>
        <Text style={s.vehiclePrice}>₱{parseFloat(vehicle.pricePerDay).toLocaleString()}<Text style={{ fontSize: 12, fontWeight: '400', color: C.g500 }}>/day</Text></Text>
      </View>
      <TouchableOpacity
        onPress={() => onRent(vehicle)}
        disabled={!available}
        style={[s.rentBtn, !available && s.rentBtnDisabled]}
      >
        <Text style={[s.rentBtnText, !available && { color: C.g400 }]}>
          {available ? 'Rent' : 'Taken'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function RentModal({ visible, vehicle, onClose, onConfirm }) {
  const [startDate, setStart] = useState('');
  const [endDate,   setEnd]   = useState('');
  const [notes,     setNotes] = useState('');

  React.useEffect(() => { if (visible) { setStart(''); setEnd(''); setNotes(''); } }, [visible]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    return Math.max(0, Math.ceil(diff / 86400000));
  }, [startDate, endDate]);

  const total = days * (parseFloat(vehicle?.pricePerDay) || 0);

  const handleConfirm = () => {
    if (!startDate || !endDate) { Alert.alert('Required', 'Please enter both start and end dates.'); return; }
    if (days <= 0) { Alert.alert('Invalid', 'End date must be after start date.'); return; }
    onConfirm({ startDate, endDate, days, total, notes });
  };

  if (!vehicle) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: C.white }}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Rent Vehicle</Text>
          <TouchableOpacity onPress={onClose}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Vehicle summary */}
          <View style={{ backgroundColor: C.primaryLt, borderRadius: 12, borderWidth: 1, borderColor: C.primary + '28', padding: 14, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.navy }}>{vehicle.name}</Text>
            <Text style={{ fontSize: 13, color: C.g500, marginTop: 2 }}>{vehicle.model} · {vehicle.year}</Text>
            <Text style={{ fontSize: 14, color: C.primary, fontWeight: '700', marginTop: 6 }}>₱{parseFloat(vehicle.pricePerDay).toLocaleString()}/day</Text>
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={s.fieldLabel}>Start Date</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={C.g400} value={startDate} onChangeText={setStart} />
          </View>
          <View style={{ marginBottom: 14 }}>
            <Text style={s.fieldLabel}>End Date</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={C.g400} value={endDate} onChangeText={setEnd} />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={s.fieldLabel}>Notes (optional)</Text>
            <TextInput style={[s.input, { height: 70, textAlignVertical: 'top' }]} multiline placeholder="Any special requests…" placeholderTextColor={C.g400} value={notes} onChangeText={setNotes} />
          </View>

          {/* Price summary */}
          {days > 0 && (
            <View style={{ backgroundColor: C.g50, borderRadius: 12, borderWidth: 1, borderColor: C.g200, padding: 14, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: C.g500 }}>Duration</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.g700 }}>{days} day{days > 1 ? 's' : ''}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: C.g500 }}>Rate</Text>
                <Text style={{ fontSize: 13, color: C.g700 }}>₱{parseFloat(vehicle.pricePerDay).toLocaleString()}/day</Text>
              </View>
              <View style={{ height: 1, backgroundColor: C.g200, marginVertical: 8 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.navy }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary }}>₱{total.toLocaleString()}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleConfirm} style={s.btnPrimary}>
            <Text style={s.btnPrimaryText}>Submit Rental Request</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ─── HOME TAB ─── */
function HomeTab({ userName, vehicles, myRentals }) {
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [rentModal, setRentModal] = useState(false);
  const [selVehicle, setSelVehicle] = useState(null);

  const [bookings, setBookings] = useState(myRentals);

  const filtered = useMemo(() => {
    let list = vehicles;
    if (filter === 'available') list = list.filter(v => v.status === 'available');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v => v.name?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q) || v.location?.toLowerCase().includes(q));
    }
    return list;
  }, [vehicles, filter, search]);

  const openRent = v => { setSelVehicle(v); setRentModal(true); };

  const handleConfirmRent = data => {
    if (!selVehicle) {
      // defensive: nothing selected, shouldn't happen
      Alert.alert('Error', 'No vehicle selected. Please try again.');
      return;
    }
    const newBooking = {
      id: `rent-${Date.now()}`,
      vehicleId:   selVehicle.id,
      vehicleName: selVehicle.name,
      vehicleModel:selVehicle.model,
      ownerName:   selVehicle.ownerName,
      pricePerDay: selVehicle.pricePerDay,
      totalPrice:  data.total,
      startDate:   data.startDate,
      endDate:     data.endDate,
      days:        data.days,
      notes:       data.notes,
      status:      'pending',
      createdAt:   new Date().toISOString(),
    };
    setBookings(prev => [...prev, newBooking]);
    setRentModal(false);
    Alert.alert('Request Sent! 🎉', 'Your rental request has been submitted and is awaiting approval from the owner.');
  };

  const activeBooking = bookings.find(r => r.status === 'approved');

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Welcome banner */}
      <View style={{ backgroundColor: C.navy, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 }}>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>Find your next ride</Text>
        {activeBooking && (
          <View style={{ backgroundColor: 'rgba(63,155,132,.3)', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(63,155,132,.5)' }}>
            <Text style={{ fontSize: 12, color: '#6ee7b7', fontWeight: '600', marginBottom: 2 }}>✓ Active Rental</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.white }}>{activeBooking.vehicleName}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{activeBooking.startDate} → {activeBooking.endDate}</Text>
          </View>
        )}
      </View>

      <View style={{ padding: 16 }}>
        {/* Search */}
        <View style={s.searchWrap}>
          
          <TextInput style={s.searchInput} placeholder="Search vehicles, location…" placeholderTextColor={C.g400} value={search} onChangeText={setSearch} />
        </View>

        {/* Filter */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['all', 'available'].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)}
              style={[s.filterTab, filter === f && s.filterTabActive]}>
              <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
                {f === 'all' ? 'All Vehicles' : 'Available Only'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vehicle list */}
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🚗</Text>
            <Text style={s.emptyTitle}>No vehicles found</Text>
            <Text style={s.emptySub}>Try adjusting your search filters.</Text>
          </View>
        ) : (
          filtered.map(v => <VehicleCard key={v.id} vehicle={v} onRent={openRent} />)
        )}
      </View>

      <RentModal
        visible={rentModal}
        vehicle={selVehicle}
        onClose={() => setRentModal(false)}
        onConfirm={handleConfirmRent}
      />
    </ScrollView>
  );
}

/* ─── BOOKINGS TAB ─── */
function BookingsTab() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Demo bookings
  const [bookings] = useState([
    { id: 'b1', vehicleName: 'Toyota Vios',  vehicleModel: '1.3 E',    ownerName: 'Carlos Owner', startDate: '2026-03-10', endDate: '2026-03-12', totalPrice: 5000,  status: 'pending',   createdAt: '2026-03-08' },
    { id: 'b2', vehicleName: 'Honda City',   vehicleModel: '1.5 RS',   ownerName: 'Carlos Owner', startDate: '2026-02-15', endDate: '2026-02-20', totalPrice: 15000, status: 'completed', createdAt: '2026-02-10' },
    { id: 'b3', vehicleName: 'Ford Everest', vehicleModel: 'Titanium', ownerName: 'Ana Vehicle',  startDate: '2026-03-01', endDate: '2026-03-05', totalPrice: 20000, status: 'approved',  createdAt: '2026-02-28' },
  ]);


  const stats = useMemo(() => ({
    total:    bookings.length,
    pending:  bookings.filter(r => r.status === 'pending').length,
    approved: bookings.filter(r => r.status === 'approved').length,
    completed:bookings.filter(r => r.status === 'completed').length,
  }), [bookings]);

  const filtered = useMemo(() => {
    let list = bookings;
    if (activeFilter !== 'all') list = list.filter(r => r.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.vehicleName?.toLowerCase().includes(q) || r.ownerName?.toLowerCase().includes(q));
    }
    return list;
  }, [bookings, activeFilter, search]);

  const BADGE = { pending: { bg: '#fef3c7', col: '#92400e' }, approved: { bg: '#d1fae5', col: '#065f46' }, completed: { bg: '#dbeafe', col: '#1e40af' }, rejected: { bg: '#fee2e2', col: '#991b1b' } };
  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <View style={{ flex: 1 }}>
      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0 }}>
        {[
          { label: 'Total',    value: stats.total,     color: C.primary },
          { label: 'Pending',  value: stats.pending,   color: C.warning },
          { label: 'Active',   value: stats.approved,  color: C.success },
          { label: 'Done',     value: stats.completed, color: '#3b82f6' },
        ].map(st => (
          <View key={st.label} style={{ flex: 1, backgroundColor: C.white, borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: st.color, elevation: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: st.color }}>{st.value}</Text>
            <Text style={{ fontSize: 10, color: C.g500 }}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['all', 'pending', 'approved', 'completed', 'rejected'].map(t => (
            <TouchableOpacity key={t} onPress={() => setActiveFilter(t)}
              style={[s.filterTab, activeFilter === t && s.filterTabActive]}>
              <Text style={[s.filterTabText, activeFilter === t && s.filterTabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Search */}
      <View style={[s.searchWrap, { marginHorizontal: 16, marginBottom: 12 }]}>
        
        <TextInput style={s.searchInput} placeholder="Search bookings…" placeholderTextColor={C.g400} value={search} onChangeText={setSearch} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
            <Text style={s.emptyTitle}>No bookings found</Text>
            <Text style={s.emptySub}>
              {activeFilter === 'all' ? "You haven't made any bookings yet." : `No ${activeFilter} bookings.`}
            </Text>
          </View>
        ) : (
          filtered.map((b, i) => {
            const bc = BADGE[b.status] || BADGE.pending;
            return (
              <View key={b.id || i} style={s.rentalCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.navy }}>{b.vehicleName}</Text>
                    <Text style={{ fontSize: 12, color: C.g500 }}>{b.vehicleModel}</Text>
                  </View>
                  <View style={{ backgroundColor: bc.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: bc.col }}>{b.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: C.g500 }}>Owner: <Text style={{ color: C.g700, fontWeight: '600' }}>{b.ownerName}</Text></Text>
                <Text style={{ fontSize: 13, color: C.g500, marginTop: 2 }}>📅 {fmtDate(b.startDate)} – {fmtDate(b.endDate)}</Text>
                {b.totalPrice && <Text style={{ fontSize: 14, color: C.primary, fontWeight: '700', marginTop: 6 }}>₱{parseFloat(b.totalPrice).toLocaleString()}</Text>}
                {b.status === 'rejected' && b.rejectionReason && (
                  <View style={{ marginTop: 8, backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#fecaca' }}>
                    <Text style={{ fontSize: 12, color: '#dc2626' }}><Text style={{ fontWeight: '700' }}>Reason: </Text>{b.rejectionReason}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function RenterDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // if somehow this screen is shown without an authenticated user
  // (race condition during login or manual deep link), kick back to login
  React.useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState('home');

  const userName = user?.firstName || user?.fullName || 'Renter';

  // Demo my rentals (empty placeholder)
  const myRentals = [];

  const handleTabPress = tab => {
    if (tab === 'profile') { router.push('/profile'); return; }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':     return <HomeTab userName={userName} vehicles={DEMO_VEHICLES} myRentals={myRentals} />;
      case 'bookings': return <BookingsTab />;
      case 'logreport': return <LogReportScreen />;
      default:         return null;
    }
  };

  // Pending bookings badge
  const pendingCount = 1; // from demo data

  return (
    <View style={{ flex: 1, backgroundColor: '#edf1f7' }}>
      {/* ── HEADER ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Renter Dashboard</Text>
          <Text style={s.headerSub}>Welcome back, {userName}</Text>
        </View>
        <ProfileAvatar size={38} />
      </View>

      {/* ── CONTENT ── */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* ── BOTTOM NAV ── */}
      <BottomNav
        role="renter"
        activeTab={activeTab}
        onTabPress={handleTabPress}
        badges={{ bookings: pendingCount }}
      />
    </View>
  );
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  header: {
    backgroundColor: C.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 10, borderWidth: 1, borderColor: C.g200, paddingHorizontal: 12, marginBottom: 14 },
  searchIcon:  { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: C.g900 },
  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
    borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.g200, elevation: 2,
  },
  vehicleName:  { fontSize: 15, fontWeight: '700', color: C.navy },
  vehicleSub:   { fontSize: 12, color: C.g500, marginTop: 2 },
  vehiclePrice: { fontSize: 14, color: C.primary, fontWeight: '700', marginTop: 6 },
  rentBtn: {
    backgroundColor: C.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14,
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
  rentBtnDisabled: { backgroundColor: C.g100 },
  rentBtnText:  { color: C.white, fontSize: 13, fontWeight: '700' },
  rentalCard: {
    backgroundColor: C.white, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: C.g200, elevation: 2,
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.g200,
  },
  filterTabActive:     { backgroundColor: C.primary, borderColor: C.primary },
  filterTabText:       { fontSize: 13, color: C.g500 },
  filterTabTextActive: { color: C.white, fontWeight: '700' },
  empty: {
    alignItems: 'center', padding: 48, backgroundColor: C.g50,
    borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: C.g200,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.g700, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: C.g400, textAlign: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.g200 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: C.navy },
  modalClose:  { fontSize: 22, color: C.g400 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: C.g400, marginBottom: 6 },
  input: {
    padding: 12, borderWidth: 1.5, borderColor: C.g200, borderRadius: 10,
    fontSize: 14, color: C.g900, backgroundColor: C.white,
  },
  btnPrimary: {
    backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },
  btnPrimaryText: { color: C.white, fontSize: 14, fontWeight: '700' },
});