// screens/RenterDashboardScreen.js
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StyleSheet, Alert, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter }    from 'expo-router';
import { useAuth }      from '../context/AuthContext';
import { useBookings }  from '../context/BookingContext';
import { useLogReport } from '../context/LogReportContext';
import { useVehicles }  from '../context/VehicleContext';
import BottomNav        from '../components/BottomNav';
import ProfileAvatar    from '../components/ProfileAvatar';
import LogReportScreen  from './LogReportScreen';
import BookingsScreen   from './BookingsScreen';

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

const TAB_HEADERS = {
  home: {
    title: 'Renter Dashboard',
    getSubtitle: (userName) => `Welcome back, ${userName}!`,
    showAvatar: true,
  },
  bookings: {
    title: 'My Bookings',
    getSubtitle: () => 'Track your rental requests',
    showAvatar: true,
  },
  logreport: {
    title: 'Log & Report',
    getSubtitle: () => 'Your rental conditions reported by owners',
    showAvatar: true,
  },
};

function DashboardHeader({ activeTab, userName }) {
  const config   = TAB_HEADERS[activeTab] || TAB_HEADERS.home;
  const subtitle = config.getSubtitle(userName);
  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        <Text style={s.headerKicker}>RENTER PORTAL</Text>
        <Text style={s.headerTitle}>{config.title}</Text>
        <Text style={s.headerSub}>{subtitle}</Text>
      </View>
      {config.showAvatar !== false && <ProfileAvatar size={38} />}
    </View>
  );
}

function VehicleCard({ vehicle, onRent }) {
  const available = vehicle.status === 'available';
  const vehicleName = vehicle.name || 'Unnamed Vehicle';
  const yearLabel = vehicle.year || '----';
  const modelLabel = vehicle.model || 'Vehicle';
  const seatsLabel = vehicle.seats ? `${vehicle.seats} seats` : 'Seats n/a';
  const fuelLabel = vehicle.fuel || 'Fuel n/a';
  const ownerLabel = vehicle.ownerName || 'Owner n/a';

  return (
    <View style={s.vehicleCard}>
      <View style={s.vehicleImageWrap}>
        {vehicle.photoUri ? (
          <Image source={{ uri: vehicle.photoUri }} style={s.vehicleImage} resizeMode="cover" />
        ) : (
          <View style={[s.vehicleImage, s.vehicleThumbFallback]}>
            <Text style={s.vehicleThumbFallbackText}>No Image</Text>
          </View>
        )}
        <View style={[s.vehicleStatusPill, { backgroundColor: available ? '#d1fae5' : '#fef3c7' }]}>
          <Text style={[s.vehicleStatusPillText, { color: available ? '#065f46' : '#92400e' }]}>
            {available ? 'Available' : 'Rented'}
          </Text>
        </View>
      </View>

      <View style={s.vehicleBody}>
        <View style={s.vehicleTopRow}>
          <Text style={s.vehicleName}>{vehicleName}</Text>
          <View style={s.yearPill}><Text style={s.yearPillText}>{yearLabel}</Text></View>
        </View>

        <View style={s.vehicleChipRow}>
          <View style={s.vehicleInfoChip}><Text style={s.vehicleInfoChipText}>{modelLabel}</Text></View>
          <View style={s.vehicleInfoChip}><Text style={s.vehicleInfoChipText}>{seatsLabel}</Text></View>
          <View style={s.vehicleInfoChip}><Text style={s.vehicleInfoChipText}>{fuelLabel}</Text></View>
          <View style={s.vehicleInfoChip}><Text style={s.vehicleInfoChipText}>{ownerLabel}</Text></View>
        </View>

        {vehicle.location ? <Text style={s.vehicleLocation}>{vehicle.location}</Text> : null}

        <View style={s.vehicleDivider} />

        <View style={s.vehicleFooter}>
          <Text style={s.vehiclePrice}>
            ₱{parseFloat(vehicle.pricePerDay).toLocaleString()}
            <Text style={s.vehiclePricePer}>/day</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onRent(vehicle)}
            disabled={!available}
            style={[s.rentBtn, !available && s.rentBtnDisabled]}
          >
            <Text style={[s.rentBtnText, !available && { color: C.g400 }]}>
              {available ? 'Rent Now' : 'Taken'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function RentModal({ visible, vehicle, onClose, onConfirm }) {
  const [startDate, setStart] = useState('');
  const [endDate,   setEnd]   = useState('');
  const [notes,     setNotes] = useState('');

  React.useEffect(() => {
    if (visible) { setStart(''); setEnd(''); setNotes(''); }
  }, [visible]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    return Math.max(0, Math.ceil(diff / 86400000));
  }, [startDate, endDate]);

  const total = days * (parseFloat(vehicle?.pricePerDay) || 0);

  const handleConfirm = () => {
    if (!startDate || !endDate) { Alert.alert('Required', 'Please enter both start and end dates.'); return; }
    if (days <= 0)              { Alert.alert('Invalid',  'End date must be after start date.');      return; }
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
          <View style={{
            backgroundColor: C.primaryLt, borderRadius: 12,
            borderWidth: 1, borderColor: C.primary + '28',
            padding: 14, marginBottom: 20,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.navy }}>{vehicle.name}</Text>
            <Text style={{ fontSize: 13, color: C.g500, marginTop: 2 }}>{vehicle.model} · {vehicle.year}</Text>
            {vehicle.ownerName && (
              <Text style={{ fontSize: 12, color: C.g500, marginTop: 2 }}>Owner: {vehicle.ownerName}</Text>
            )}
            <Text style={{ fontSize: 14, color: C.primary, fontWeight: '700', marginTop: 6 }}>
              ₱{parseFloat(vehicle.pricePerDay).toLocaleString()}/day
            </Text>
          </View>
          <View style={{ marginBottom: 14 }}>
            <Text style={s.fieldLabel}>Start Date</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={C.g400}
              value={startDate} onChangeText={setStart} />
          </View>
          <View style={{ marginBottom: 14 }}>
            <Text style={s.fieldLabel}>End Date</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={C.g400}
              value={endDate} onChangeText={setEnd} />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={s.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={[s.input, { height: 70, textAlignVertical: 'top' }]}
              multiline placeholder="Any special requests…"
              placeholderTextColor={C.g400} value={notes} onChangeText={setNotes}
            />
          </View>
          {days > 0 && (
            <View style={{
              backgroundColor: C.g50, borderRadius: 12,
              borderWidth: 1, borderColor: C.g200,
              padding: 14, marginBottom: 20,
            }}>
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

function HomeTab({ vehicles, bookings, onCreateBooking, user }) {
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');
  const [rentModal,  setRentModal]  = useState(false);
  const [selVehicle, setSelVehicle] = useState(null);

  const filtered = useMemo(() => {
    let list = vehicles;
    if (filter === 'available') list = list.filter(v => v.status === 'available');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.name?.toLowerCase().includes(q)     ||
        v.model?.toLowerCase().includes(q)    ||
        v.location?.toLowerCase().includes(q) ||
        v.ownerName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [vehicles, filter, search]);

  const openRent = v => { setSelVehicle(v); setRentModal(true); };

  const handleConfirmRent = data => {
    if (!selVehicle) { Alert.alert('Error', 'No vehicle selected. Please try again.'); return; }
    const newBooking = {
      id:           `rent-${Date.now()}`,
      vehicleId:    selVehicle.id,
      vehicleName:  selVehicle.name,
      vehicleModel: selVehicle.model,
      ownerId:      selVehicle.ownerId,
      ownerName:    selVehicle.ownerName,
      renterEmail:  user?.email,
      renterName:   user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Renter',
      pricePerDay:  selVehicle.pricePerDay,
      totalPrice:   data.total,
      startDate:    data.startDate,
      endDate:      data.endDate,
      days:         data.days,
      notes:        data.notes,
      status:       'pending',
      createdAt:    new Date().toISOString(),
    };
    onCreateBooking(newBooking);
    setRentModal(false);
    Alert.alert('Request Sent! 🎉', 'Your rental request has been submitted and is awaiting approval from the owner.');
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ padding: 16 }}>
        <View style={s.searchWrap}>
          <TextInput
            style={s.searchInput}
            placeholder="Search vehicles, location, owner…"
            placeholderTextColor={C.g400}
            value={search}
            onChangeText={setSearch}
          />
        </View>
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

        {vehicles.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🚗</Text>
            <Text style={s.emptyTitle}>No vehicles listed yet</Text>
            <Text style={s.emptySub}>No approved vehicles available. Check back soon!</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🔍</Text>
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

export default function RenterDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addBooking, getBookingsForRenter } = useBookings();
  const { getApprovedVehicles } = useVehicles(); // ← only approved vehicles

  React.useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const [activeTab, setActiveTab] = useState('home');
  const userName  = user?.firstName || user?.fullName || 'Renter';
  const myRentals = getBookingsForRenter(user?.email);

  // Only show vehicles the admin has approved
  const approvedVehicles = getApprovedVehicles();

  const handleTabPress = tab => {
    if (tab === 'profile') { router.push('/profile'); return; }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            vehicles={approvedVehicles}
            bookings={myRentals}
            onCreateBooking={addBooking}
            user={user}
          />
        );
      case 'bookings':
        return <BookingsScreen hideHeader={true} />;
      case 'logreport':
        return <LogReportScreen hideHeader={true} />;
      default:
        return null;
    }
  };

  const pendingCount = myRentals.filter((booking) => booking.status === 'pending').length;
  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#edf1f7' }} edges={['top', 'bottom']}>
      <DashboardHeader activeTab={activeTab} userName={userName} />
      <View style={s.bodyWrap}>
        <View style={s.contentShell}>{renderContent()}</View>
      </View>
      <BottomNav
        role="renter"
        activeTab={activeTab}
        onTabPress={handleTabPress}
        badges={{ bookings: pendingCount }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: C.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : 34,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerKicker:        { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,.6)', letterSpacing: 1.1 },
  headerTitle:         { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub:           { fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 },
  bodyWrap:            { flex: 1, marginTop: -4, backgroundColor: '#e7eef6' },
  contentShell:        { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center' },
  searchWrap:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 10, borderWidth: 1, borderColor: C.g200, paddingHorizontal: 12, marginBottom: 12 },
  searchInput:         { flex: 1, paddingVertical: 10, fontSize: 14, color: C.g900 },
  filterTab:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: C.white, borderWidth: 1, borderColor: C.g200 },
  filterTabActive:     { backgroundColor: C.primary, borderColor: C.primary },
  filterTabText:       { fontSize: 13, color: C.g500 },
  filterTabTextActive: { color: C.white, fontWeight: '700' },
  vehicleCard:         { backgroundColor: C.white, borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: '#dfe7f3', elevation: 2, overflow: 'hidden' },
  vehicleImageWrap:    { position: 'relative', backgroundColor: '#f3f6fb' },
  vehicleImage:        { width: '100%', height: 184, backgroundColor: '#f3f6fb' },
  vehicleStatusPill:   { position: 'absolute', top: 12, left: 12, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  vehicleStatusPillText:{ fontSize: 12, fontWeight: '800' },
  vehicleBody:         { padding: 14 },
  vehicleTopRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  yearPill:            { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  yearPillText:        { fontSize: 12, color: C.g500, fontWeight: '700' },
  vehicleChipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  vehicleInfoChip:     { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  vehicleInfoChipText: { fontSize: 11, color: C.g700, fontWeight: '600' },
  vehicleLocation:     { fontSize: 13, color: C.g500, marginTop: 12 },
  vehicleDivider:      { height: 1, backgroundColor: '#e5e7eb', marginTop: 14, marginBottom: 12 },
  vehicleFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  vehicleThumbFallback:{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.g200 },
  vehicleThumbFallbackText: { fontSize: 10, color: C.g400, fontWeight: '600' },
  vehicleName:         { fontSize: 19, fontWeight: '800', color: C.navy, flex: 1 },
  vehicleSub:          { fontSize: 12, color: C.g500, marginTop: 2 },
  vehiclePrice:        { fontSize: 20, color: C.primary, fontWeight: '800' },
  vehiclePricePer:     { fontSize: 12, color: C.primaryDk, fontWeight: '700' },
  rentBtn:             { backgroundColor: C.primary, borderRadius: 11, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  rentBtnDisabled:     { backgroundColor: C.g100 },
  rentBtnText:         { color: C.white, fontSize: 13, fontWeight: '800' },
  empty:               { alignItems: 'center', padding: 48, backgroundColor: C.g50, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: C.g200 },
  emptyTitle:          { fontSize: 16, fontWeight: '700', color: C.g700, marginBottom: 6 },
  emptySub:            { fontSize: 13, color: C.g400, textAlign: 'center' },
  modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.g200 },
  modalTitle:          { fontSize: 18, fontWeight: '700', color: C.navy },
  modalClose:          { fontSize: 22, color: C.g400 },
  fieldLabel:          { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: C.g400, marginBottom: 6 },
  input:               { padding: 12, borderWidth: 1.5, borderColor: C.g200, borderRadius: 10, fontSize: 14, color: C.g900, backgroundColor: C.white },
  btnPrimary:          { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  btnPrimaryText:      { color: C.white, fontSize: 14, fontWeight: '700' },
});