// screens/OwnerDashboardScreen.js
// Tabs: Home | Rentals | Add | Log Report
// Rentals tab has "Record to Log Report" button on approved/active rentals.

import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StyleSheet, Alert, Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuth }      from '../context/AuthContext';
import { useLogReport } from '../context/LogReportContext';
import BottomNav        from '../components/BottomNav';
import ProfileAvatar    from '../components/ProfileAvatar';
import LogReportScreen  from './LogReportScreen';

const C = {
  primary:   '#3F9B84', primaryDk: '#2d7a67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#ef4444', warning: '#f59e0b', success: '#22c55e',
  g50:  '#f9fafb', g100: '#f3f4f6', g200: '#e5e7eb',
  g300: '#d1d5db', g400: '#9ca3af', g500: '#6b7280',
  g700: '#374151', g900: '#111827', white: '#ffffff',
};

/* ── Icons ── */
const IcSearch = ({ s = 15, c = C.g400 }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" /><Path d="M21 21l-4.35-4.35" />
  </Svg>
);
const IcEdit = ({ s = 15, c = C.primary }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);
const IcTrash = ({ s = 15, c = C.danger }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" /><Path d="M9 6V4h6v2" />
  </Svg>
);
const IcBook = ({ s = 14, c = C.white }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6M9 13h6M9 17h4" />
  </Svg>
);

/* ── Vehicle Card ── */
function VehicleCard({ vehicle, onEdit, onDelete }) {
  const statusColors = {
    available:   { bg: '#d1fae5', color: '#065f46' },
    rented:      { bg: '#fee2e2', color: '#991b1b' },
    unavailable: { bg: '#fef3c7', color: '#92400e' },
  };
  const sc = statusColors[vehicle.status] || statusColors.available;
  return (
    <View style={s.vehicleCard}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text style={s.vehicleName}>{vehicle.name || 'Unnamed Vehicle'}</Text>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.color }]}>
              {(vehicle.status || 'available').charAt(0).toUpperCase() + (vehicle.status || 'available').slice(1)}
            </Text>
          </View>
        </View>
        <Text style={s.vehicleSub}>{[vehicle.model, vehicle.year].filter(Boolean).join(' · ')}</Text>
        {vehicle.location && <Text style={[s.vehicleSub, { marginTop: 2 }]}>{vehicle.location}</Text>}
        {vehicle.pricePerDay && (
          <Text style={s.vehiclePrice}>₱{parseFloat(vehicle.pricePerDay).toLocaleString()}/day</Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => onEdit(vehicle)} style={s.iconBtn}>
          <IcEdit s={15} c={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(vehicle.id)} style={[s.iconBtn, { borderColor: '#fecaca' }]}>
          <IcTrash s={15} c={C.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Vehicle Form Modal ── */
function VehicleFormModal({ visible, onClose, onSave, initial, isEdit }) {
  const blank = { name: '', model: '', year: '', pricePerDay: '', location: '', description: '', status: 'available', seats: '', fuel: '' };
  const [form, setForm] = useState(initial || blank);
  React.useEffect(() => { if (visible) setForm(initial || blank); }, [visible]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    if (!form.name.trim())    { Alert.alert('Required', 'Vehicle name is required.'); return; }
    if (!form.pricePerDay)    { Alert.alert('Required', 'Price per day is required.'); return; }
    onSave(form);
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: C.white }}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</Text>
          <TouchableOpacity onPress={onClose}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {[
            { key: 'name',        label: 'Vehicle Name *',      placeholder: 'e.g. Toyota Vios' },
            { key: 'model',       label: 'Model',               placeholder: 'e.g. 1.3 E CVT' },
            { key: 'year',        label: 'Year',                placeholder: 'e.g. 2022', numeric: true },
            { key: 'pricePerDay', label: 'Price per Day (₱) *', placeholder: 'e.g. 2500',  numeric: true },
            { key: 'location',    label: 'Pickup Location',     placeholder: 'e.g. Davao City' },
            { key: 'seats',       label: 'Seats',               placeholder: 'e.g. 5', numeric: true },
            { key: 'fuel',        label: 'Fuel Type',           placeholder: 'e.g. Gasoline' },
          ].map(f => (
            <View key={f.key} style={{ marginBottom: 14 }}>
              <Text style={s.fieldLabel}>{f.label}</Text>
              <TextInput style={s.input} placeholder={f.placeholder} placeholderTextColor={C.g400}
                value={String(form[f.key] || '')} onChangeText={v => set(f.key, v)}
                keyboardType={f.numeric ? 'numeric' : 'default'} />
            </View>
          ))}
          <View style={{ marginBottom: 14 }}>
            <Text style={s.fieldLabel}>Status</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['available', 'unavailable'].map(st => (
                <TouchableOpacity key={st} onPress={() => set('status', st)}
                  style={[s.pillBtn, form.status === st && { backgroundColor: C.primary, borderColor: C.primary }]}>
                  <Text style={[s.pillBtnText, form.status === st && { color: C.white }]}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={handleSave} style={s.btnPrimary}>
            <Text style={s.btnPrimaryText}>{isEdit ? 'Save Changes' : 'Add Vehicle'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ── Rentals Tab ── */
function RentalsTab({ rentalHistory, setRentalHistory, reports, onRecordLog }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const isLogged = rental => reports.some(r => r.rental?.rentalId === rental.id);

  const filtered = useMemo(() => {
    let list = rentalHistory;
    if (filter !== 'all') list = list.filter(r => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.vehicleName?.toLowerCase().includes(q) || r.renterName?.toLowerCase().includes(q)
      );
    }
    return list.slice().reverse();
  }, [rentalHistory, filter, search]);

  const stats = useMemo(() => ({
    total:    rentalHistory.length,
    pending:  rentalHistory.filter(r => r.status === 'pending').length,
    approved: rentalHistory.filter(r => r.status === 'approved').length,
    completed:rentalHistory.filter(r => r.status === 'completed').length,
  }), [rentalHistory]);

  const TABS = ['all', 'pending', 'approved', 'completed', 'rejected'];
  const SHORT_LABELS = { all: 'All', pending: 'Pend', approved: 'Appr', completed: 'Done', rejected: 'Rej' };
  const BC = {
    pending:   { bg: '#fef3c7', color: '#92400e' },
    approved:  { bg: '#d1fae5', color: '#065f46' },
    completed: { bg: '#dbeafe', color: '#1e40af' },
    rejected:  { bg: '#fee2e2', color: '#991b1b' },
  };
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const handleApprove = rental => {
    Alert.alert('Approve Rental?', `Approve for ${rental.vehicleName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => setRentalHistory(prev => prev.map(r => r.id === rental.id ? { ...r, status: 'approved' } : r)) },
    ]);
  };
  const handleReject = rental => {
    Alert.alert('Reject Rental?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => setRentalHistory(prev => prev.map(r => r.id === rental.id ? { ...r, status: 'rejected' } : r)) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0 }}>
        {[
          { label: 'Total',   value: stats.total,     color: C.primary },
          { label: 'Pending', value: stats.pending,   color: C.warning },
          { label: 'Active',  value: stats.approved,  color: C.success },
          { label: 'Done',    value: stats.completed, color: '#3b82f6' },
        ].map(st => (
          <View key={st.label} style={{ flex: 1, backgroundColor: C.white, borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: st.color, elevation: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: st.color }}>{st.value}</Text>
            <Text style={{ fontSize: 10, color: C.g500 }}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TABS.map((t, i) => (
            <TouchableOpacity
              key={t}
              onPress={() => setFilter(t)}
              style={[s.filterTab, filter === t && s.filterTabActive, i < TABS.length - 1 && { marginRight: 6 }]}
            >
              <Text style={[s.filterTabText, filter === t && s.filterTabTextActive]}>
                {SHORT_LABELS[t] || (t.charAt(0).toUpperCase() + t.slice(1))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={[s.searchWrap, { marginHorizontal: 16, marginBottom: 10 }]}>
        <IcSearch s={15} c={C.g400} />
        <TextInput style={[s.searchInput, { marginLeft: 8 }]} placeholder="Search rentals…" placeholderTextColor={C.g400}
          value={search} onChangeText={setSearch} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}>
        {filtered.length === 0 ? (
          <View style={s.empty}><Text style={s.emptyTitle}>No rentals found</Text></View>
        ) : (
          filtered.map((rental, i) => {
            const bc      = BC[rental.status] || BC.pending;
            const logged  = isLogged(rental);
            const canLog  = rental.status === 'approved' || rental.status === 'completed';
            return (
              <View key={rental.id || i} style={s.rentalCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.navy, flex: 1 }}>{rental.vehicleName}</Text>
                  <View style={{ backgroundColor: bc.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: bc.color }}>{(rental.status).toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: C.g500 }}>Renter: <Text style={{ color: C.g700, fontWeight: '600' }}>{rental.renterName}</Text></Text>
                <Text style={{ fontSize: 13, color: C.g500, marginTop: 2 }}>
                  {fmtDate(rental.startDate)} – {fmtDate(rental.endDate)}
                </Text>
                {rental.totalPrice && (
                  <Text style={{ fontSize: 13, color: C.primary, fontWeight: '700', marginTop: 4 }}>
                    ₱{parseFloat(rental.totalPrice).toLocaleString()}
                  </Text>
                )}

                {/* Approve / Reject */}
                {rental.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <TouchableOpacity onPress={() => handleApprove(rental)} style={[s.btnPrimary, { flex: 1, paddingVertical: 9 }]}>
                      <Text style={[s.btnPrimaryText, { fontSize: 13 }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReject(rental)} style={[s.btnDanger, { flex: 1, paddingVertical: 9 }]}>
                      <Text style={[s.btnPrimaryText, { fontSize: 13 }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Record to Log Report */}
                {canLog && (
                  <TouchableOpacity
                    onPress={() => !logged && onRecordLog(rental)}
                    disabled={logged}
                    style={[s.logBtn, logged && s.logBtnDone]}>
                    <IcBook s={13} c={logged ? C.g400 : C.white} />
                    <Text style={[s.logBtnText, logged && { color: C.g400 }]}>
                      {logged ? 'Recorded in Log Report' : 'Record to Log Report'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

/* ── Home Tab ── */
function HomeTab({ vehicles, stats, searchQuery, setSearchQuery, filtered, onEdit, onDelete }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={s.statsRow}>
        {[
          { label: 'Total',     value: stats.total,                          color: C.primary },
          { label: 'Available', value: stats.available,                       color: C.success },
          { label: 'Rented',    value: stats.rented,                          color: C.danger  },
          { label: 'Est./Day',  value: `₱${stats.earnings.toLocaleString()}`, color: C.navy    },
        ].map(st => (
          <View key={st.label} style={s.statCard}>
            <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>
      <View style={[s.searchWrap, { marginHorizontal: 16 }]}>
        <IcSearch s={15} c={C.g400} />
        <TextInput style={[s.searchInput, { marginLeft: 8 }]} placeholder="Search your vehicles…"
          placeholderTextColor={C.g400} value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No vehicles found</Text>
            <Text style={s.emptySub}>Tap the "+" tab to add your first car.</Text>
          </View>
        ) : (
          filtered.map(v => <VehicleCard key={v.id} vehicle={v} onEdit={onEdit} onDelete={onDelete} />)
        )}
      </View>
    </ScrollView>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function OwnerDashboardScreen() {
  const router  = useRouter();
  const { user } = useAuth();
  const { reports } = useLogReport();

  const [activeTab, setActiveTab] = useState('home');
  const [pendingLogRental, setPendingLogRental] = useState(null);

  // vehicles array starts empty; real data should come from persistent storage or backend
  const [vehicles, setVehicles] = useState([
    { id: 1, name: 'Toyota Vios', model: '1.3 E', year: '2022', pricePerDay: '2500', status: 'available', location: 'Davao City', seats: '5', fuel: 'Gasoline' },
    { id: 2, name: 'Honda City',  model: '1.5 RS', year: '2021', pricePerDay: '3000', status: 'rented',    location: 'Davao City', seats: '5', fuel: 'Gasoline' },
  ]);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);

  // rentalHistory initially empty; populate from server or storage
  const [rentalHistory, setRentalHistory] = useState([
    { id: 'r1', vehicleId: 2, vehicleName: 'Honda City',  renterName: 'Juan Dela Cruz', renterId: 'u_renter', startDate: '2026-03-01', endDate: '2026-03-05', totalPrice: 15000, pricePerDay: 3000, status: 'approved'  },
    { id: 'r2', vehicleId: 1, vehicleName: 'Toyota Vios', renterName: 'Maria Santos',   renterId: 'u_renter', startDate: '2026-02-15', endDate: '2026-02-20', totalPrice: 12500, pricePerDay: 2500, status: 'completed' },
    { id: 'r3', vehicleId: 1, vehicleName: 'Toyota Vios', renterName: 'Pedro Reyes',    renterId: 'u_renter', startDate: '2026-03-10', endDate: '2026-03-12', totalPrice: 5000,  pricePerDay: 2500, status: 'pending'   },
  ]);

  const userName    = user?.firstName || user?.fullName || 'Owner';
  const pendingCount = rentalHistory.filter(r => r.status === 'pending').length;

  const stats = useMemo(() => ({
    total:     vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    rented:    vehicles.filter(v => v.status === 'rented').length,
    earnings:  vehicles.reduce((a, v) => a + (parseFloat(v.pricePerDay) || 0), 0),
  }), [vehicles]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const q = searchQuery.toLowerCase();
    return vehicles.filter(v => v.name?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q));
  }, [vehicles, searchQuery]);

  const openEdit   = v => { setEditTarget(v); setShowEditModal(true); };
  const handleAdd  = form => { setVehicles(prev => [...prev, { ...form, id: Date.now() }]); setShowAddModal(false); };
  const handleEdit = form => {
    setVehicles(prev => prev.map(v => v.id === editTarget.id ? { ...v, ...form } : v));
    setShowEditModal(false); setEditTarget(null);
  };
  const handleDelete = id => {
    Alert.alert('Delete Vehicle?', 'This will permanently remove the vehicle listing.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setVehicles(prev => prev.filter(v => v.id !== id)) },
    ]);
  };

  // Called from Rentals tab — switch to Log Report and pre-populate
  const handleRecordLog = rental => {
    setPendingLogRental({ ...rental, rentalId: rental.id });
    setActiveTab('logreport');
  };

  const handleTabPress = tab => {
    if (tab === 'add')     { setShowAddModal(true); return; }
    if (tab === 'profile') { router.push('/profile'); return; }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab vehicles={vehicles} stats={stats}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            filtered={filtered} onEdit={openEdit} onDelete={handleDelete} />
        );
      case 'rentals':
        return (
          <RentalsTab
            rentalHistory={rentalHistory}
            setRentalHistory={setRentalHistory}
            reports={reports}
            onRecordLog={handleRecordLog}
          />
        );
      case 'logreport':
        return (
          <LogReportScreen
            pendingRental={pendingLogRental}
            onClearPendingRental={() => setPendingLogRental(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#edf1f7' }}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Owner Dashboard</Text>
          <Text style={s.headerSub}>Welcome back, {userName}</Text>
        </View>
        <ProfileAvatar size={38} />
      </View>

      <View style={{ flex: 1 }}>{renderContent()}</View>

      <BottomNav role="owner" activeTab={activeTab} onTabPress={handleTabPress} badges={{ rentals: pendingCount }} />

      <VehicleFormModal visible={showAddModal}  onClose={() => setShowAddModal(false)}  onSave={handleAdd}  initial={null}        isEdit={false} />
      <VehicleFormModal visible={showEditModal} onClose={() => { setShowEditModal(false); setEditTarget(null); }} onSave={handleEdit} initial={editTarget} isEdit />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: C.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 },
  statsRow:    { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  statCard:    { flex: 1, backgroundColor: C.white, borderRadius: 12, padding: 12, alignItems: 'center', elevation: 2 },
  statNum:     { fontSize: 20, fontWeight: '800' },
  statLabel:   { fontSize: 11, color: C.g500, marginTop: 3 },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 10, borderWidth: 1, borderColor: C.g200, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: C.g900 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.g200, elevation: 2 },
  vehicleName: { fontSize: 15, fontWeight: '700', color: C.navy },
  vehicleSub:  { fontSize: 12, color: C.g500, marginTop: 2 },
  vehiclePrice:{ fontSize: 13, color: C.primary, fontWeight: '700', marginTop: 4 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  iconBtn:     { width: 36, height: 36, borderRadius: 8, backgroundColor: C.g50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.g200 },
  rentalCard:  { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.g200, elevation: 2 },
  filterTab:   { flex: 1, height: 36, paddingHorizontal: 8, paddingVertical: 0, borderRadius: 8, backgroundColor: C.white, borderWidth: 1, borderColor: C.g200, alignItems: 'center', justifyContent: 'center' },
  filterTabActive:     { backgroundColor: C.primary, borderColor: C.primary },
  filterTabText:       { fontSize: 12, color: C.g500 },
  filterTabTextActive: { color: C.white, fontWeight: '700' },
  empty:       { alignItems: 'center', padding: 48, backgroundColor: C.g50, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: C.g200 },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: C.g700, marginBottom: 6 },
  emptySub:    { fontSize: 13, color: C.g400, textAlign: 'center' },
  logBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: C.primary, borderRadius: 9, paddingVertical: 10,
    marginTop: 10, elevation: 2,
  },
  logBtnDone: { backgroundColor: C.g100, borderWidth: 1, borderColor: C.g200, elevation: 0 },
  logBtnText: { fontSize: 13, fontWeight: '700', color: C.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.g200 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: C.navy },
  modalClose:  { fontSize: 22, color: C.g400 },
  fieldLabel:  { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: C.g400, marginBottom: 6 },
  input:       { padding: 12, borderWidth: 1.5, borderColor: C.g200, borderRadius: 10, fontSize: 14, color: C.g900, backgroundColor: C.white },
  pillBtn:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: C.g200, backgroundColor: C.white },
  pillBtnText: { fontSize: 13, fontWeight: '600', color: C.g500 },
  btnPrimary:  { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: C.white, fontSize: 14, fontWeight: '700' },
  btnDanger:   { backgroundColor: C.danger, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
});