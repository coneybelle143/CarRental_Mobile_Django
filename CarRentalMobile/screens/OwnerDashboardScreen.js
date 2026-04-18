// screens/OwnerDashboardScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StyleSheet, Alert, Platform, StatusBar, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter }     from 'expo-router';
import { useAuth }       from '../context/AuthContext';
import { useBookings }   from '../context/BookingContext';
import { useLogReport }  from '../context/LogReportContext';
import { useVehicles }   from '../context/VehicleContext';
import BottomNav         from '../components/BottomNav';
import ProfileAvatar     from '../components/ProfileAvatar';
import LogReportScreen   from './LogReportScreen';

const C = {
  primary:   '#3F9B84', primaryDk: '#2d7a67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#ef4444', warning: '#f59e0b', success: '#22c55e',
  g50:  '#f9fafb', g100: '#f3f4f6', g200: '#e5e7eb',
  g300: '#d1d5db', g400: '#9ca3af', g500: '#6b7280',
  g700: '#374151', g900: '#111827', white: '#ffffff',
};

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
  const vehicleName = vehicle.name || 'Unnamed Vehicle';
  const yearLabel = vehicle.year || '----';
  const modelLabel = vehicle.model || 'Vehicle';
  const transmissionLabel = vehicle.transmission || 'Automatic';
  const seatsLabel = vehicle.seats ? `${vehicle.seats} seats` : 'Seats n/a';
  const fuelLabel = vehicle.fuel || 'Fuel n/a';
  const priceLabel = Number.isFinite(parseFloat(vehicle.pricePerDay))
    ? `₱${parseFloat(vehicle.pricePerDay).toLocaleString()}`
    : '₱0';

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
        <View style={[s.vehicleStatusPill, { backgroundColor: sc.bg }]}>
          <Text style={[s.vehicleStatusPillText, { color: sc.color }]}>
            {(vehicle.status || 'available').charAt(0).toUpperCase() + (vehicle.status || 'available').slice(1)}
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
          <View style={s.vehicleInfoChip}><Text style={s.vehicleInfoChipText}>{transmissionLabel}</Text></View>
          <View style={s.vehicleInfoChip}><Text style={s.vehicleInfoChipText}>{seatsLabel}</Text></View>
          <View style={s.vehicleInfoChip}><Text style={s.vehicleInfoChipText}>{fuelLabel}</Text></View>
        </View>

        {vehicle.location ? <Text style={s.vehicleLocation}>{vehicle.location}</Text> : null}

        <View style={s.vehicleDivider} />

        <View style={s.vehicleFooter}>
          <Text style={s.vehiclePrice}>{priceLabel}<Text style={s.vehiclePricePer}>/day</Text></Text>
          <View style={s.vehicleActions}>
            <TouchableOpacity onPress={() => onEdit(vehicle)} style={s.editBtn}>
              <Text style={s.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(vehicle.id)} style={s.deleteBtn}>
              <Text style={s.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ── Vehicle Form Modal ── */
function VehicleFormModal({ visible, onClose, onSave, initial, isEdit }) {
  const blank = { name: '', model: '', year: '', pricePerDay: '', location: '', description: '', status: 'available', seats: '', fuel: '' };
  const [form, setForm] = useState(initial || blank);
  const [photoUri, setPhotoUri] = useState((initial && initial.photoUri) || null);
  React.useEffect(() => { if (visible) setForm(initial || blank); }, [visible]);
  React.useEffect(() => { if (visible) setPhotoUri((initial && initial.photoUri) || null); }, [visible]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const MEDIA_IMAGES = ImagePicker.MediaType?.Images || 'images';
  const PICKER_OPTIONS = { mediaTypes: [MEDIA_IMAGES], allowsEditing: true, aspect: [4,3], quality: 0.8 };

  async function ensurePermission(type) {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  const pickFromLibrary = async () => {
    const ok = await ensurePermission('library');
    if (!ok) { Alert.alert('Permission required', 'Please allow photo library access in Settings.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!r.canceled && r.assets?.[0]?.uri) setPhotoUri(r.assets[0].uri);
  };

  const pickCamera = async () => {
    const ok = await ensurePermission('camera');
    if (!ok) { Alert.alert('Permission required', 'Please allow camera access in Settings.'); return; }
    const r = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!r.canceled && r.assets?.[0]?.uri) setPhotoUri(r.assets[0].uri);
  };

  const handleSave = () => {
    if (!form.name.trim())  { Alert.alert('Required', 'Vehicle name is required.'); return; }
    if (!form.pricePerDay)  { Alert.alert('Required', 'Price per day is required.'); return; }
    const payload = { ...form, photoUri };
    onSave(payload);
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: C.white }}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</Text>
          <TouchableOpacity onPress={onClose}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Image upload */}
          <View style={{ marginBottom: 14 }} key="photo">
            <Text style={s.fieldLabel}>Vehicle Photo</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {photoUri ? (
                <View style={{ width: 100, height: 74, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f3f6fb' }}>
                  <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
              ) : (
                <View style={{ width: 100, height: 74, borderRadius: 8, backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.g400 }}>No photo</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={pickFromLibrary} style={[s.btnSecondary, { marginBottom: 8 }]}>
                  <Text style={s.btnSecondaryText}>Choose from Library</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickCamera} style={s.btnSecondary}>
                  <Text style={s.btnSecondaryText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {[
            { key: 'name',        label: 'Vehicle Name *',      placeholder: 'e.g. Toyota Vios' },
            { key: 'model',       label: 'Model',               placeholder: 'e.g. 1.3 E CVT' },
            { key: 'year',        label: 'Year',                placeholder: 'e.g. 2022', numeric: true },
            { key: 'pricePerDay', label: 'Price per Day (₱) *', placeholder: 'e.g. 2500', numeric: true },
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
function RentalsTab({ rentalHistory, onUpdateStatus, reports, onRecordLog }) {
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
    total:     rentalHistory.length,
    pending:   rentalHistory.filter(r => r.status === 'pending').length,
    approved:  rentalHistory.filter(r => r.status === 'approved').length,
    completed: rentalHistory.filter(r => r.status === 'completed').length,
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
      { text: 'Approve', onPress: () => onUpdateStatus(rental.id, 'approved') },
    ]);
  };
  const handleReject = rental => {
    Alert.alert('Reject Rental?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => onUpdateStatus(rental.id, 'rejected') },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
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
      <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TABS.map((t, i) => (
            <TouchableOpacity key={t} onPress={() => setFilter(t)}
              style={[s.filterTab, filter === t && s.filterTabActive, i < TABS.length - 1 && { marginRight: 6 }]}>
              <Text style={[s.filterTabText, filter === t && s.filterTabTextActive]}>
                {SHORT_LABELS[t] || (t.charAt(0).toUpperCase() + t.slice(1))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={[s.searchWrap, { marginHorizontal: 16, marginBottom: 10 }]}>
        <IcSearch s={15} c={C.g400} />
        <TextInput style={[s.searchInput, { marginLeft: 8 }]} placeholder="Search rentals…"
          placeholderTextColor={C.g400} value={search} onChangeText={setSearch} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}>
        {filtered.length === 0 ? (
          <View style={s.empty}><Text style={s.emptyTitle}>No rentals found</Text></View>
        ) : (
          filtered.map((rental, i) => {
            const bc     = BC[rental.status] || BC.pending;
            const logged = isLogged(rental);
            const canLog = rental.status === 'approved' || rental.status === 'completed';
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
                {canLog && (
                  <TouchableOpacity onPress={() => !logged && onRecordLog(rental)} disabled={logged}
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
function HomeTab({ vehicles, stats, searchQuery, setSearchQuery, filtered, onEdit, onDelete, filters, onToggleFilter, onSetPriceFilter, onClearFilters }) {
  const activeFilterCount =
    filters.statuses.length + filters.fuels.length + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={s.statsRow}>
        {[
          { label: 'Total',     value: stats.total,                            color: C.primary },
          { label: 'Available', value: stats.available,                        color: C.success },
          { label: 'Rented',    value: stats.rented,                           color: C.danger  },
          { label: 'Est./Day',  value: `₱${stats.earnings.toLocaleString()}`,  color: C.navy    },
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

      <View style={s.filterPanel}>
        <View style={s.filterPanelHeader}>
          <Text style={s.filterPanelTitle}>Filters</Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={onClearFilters}>
              <Text style={s.clearFilterText}>Clear ({activeFilterCount})</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={s.filterLabel}>Status</Text>
        <View style={s.filterRow}>
          {['available', 'rented', 'unavailable'].map(st => {
            const active = filters.statuses.includes(st);
            return (
              <TouchableOpacity key={st} onPress={() => onToggleFilter('statuses', st)} style={[s.filterPill, active && s.filterPillActive]}>
                <Text style={[s.filterPillText, active && s.filterPillTextActive]}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.filterLabel}>Fuel</Text>
        <View style={s.filterRow}>
          {['Gasoline', 'Diesel', 'Hybrid', 'Electric'].map(fuel => {
            const active = filters.fuels.includes(fuel);
            return (
              <TouchableOpacity key={fuel} onPress={() => onToggleFilter('fuels', fuel)} style={[s.filterPill, active && s.filterPillActive]}>
                <Text style={[s.filterPillText, active && s.filterPillTextActive]}>{fuel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.filterLabel}>Price / Day</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            keyboardType="numeric"
            placeholder="Min"
            placeholderTextColor={C.g400}
            value={filters.minPrice}
            onChangeText={v => onSetPriceFilter('minPrice', v.replace(/[^0-9]/g, ''))}
          />
          <TextInput
            style={[s.input, { flex: 1 }]}
            keyboardType="numeric"
            placeholder="Max"
            placeholderTextColor={C.g400}
            value={filters.maxPrice}
            onChangeText={v => onSetPriceFilter('maxPrice', v.replace(/[^0-9]/g, ''))}
          />
        </View>
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
  const { getBookingsForOwner, setBookingStatus } = useBookings();
  const { reports } = useLogReport();
  const { getOwnerVehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const ownerId = user?.id || user?.email;

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const [activeTab,        setActiveTab]        = useState('home');
  const [pendingLogRental, setPendingLogRental]  = useState(null);
  const [searchQuery,      setSearchQuery]       = useState('');
  const [ownerFilters,     setOwnerFilters]      = useState({ statuses: [], fuels: [], minPrice: '', maxPrice: '' });
  const [showAddModal,     setShowAddModal]      = useState(false);
    const toggleOwnerFilter = (key, value) => {
      setOwnerFilters(prev => ({
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter(v => v !== value)
          : [...prev[key], value],
      }));
    };

    const setOwnerPriceFilter = (key, value) => {
      setOwnerFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearOwnerFilters = () => {
      setOwnerFilters({ statuses: [], fuels: [], minPrice: '', maxPrice: '' });
    };

  const [showEditModal,    setShowEditModal]     = useState(false);
  const [editTarget,       setEditTarget]        = useState(null);

  const vehicles = getOwnerVehicles(ownerId);
  const rentalHistory = getBookingsForOwner(ownerId);
  const userName     = user?.firstName || user?.fullName || 'Owner';
  const pendingCount = rentalHistory.filter(r => r.status === 'pending').length;

  const stats = useMemo(() => ({
    total:     vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    rented:    vehicles.filter(v => v.status === 'rented').length,
    earnings:  vehicles.reduce((a, v) => a + (parseFloat(v.pricePerDay) || 0), 0),
  }), [vehicles]);

  const filtered = useMemo(() => {
    let result = vehicles;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        v.location?.toLowerCase().includes(q)
      );
    }

    if (ownerFilters.statuses.length > 0) {
      result = result.filter(v => ownerFilters.statuses.includes(v.status));
    }

    if (ownerFilters.fuels.length > 0) {
      result = result.filter(v => ownerFilters.fuels.includes(v.fuel));
    }

    if (ownerFilters.minPrice) {
      result = result.filter(v => (parseFloat(v.pricePerDay) || 0) >= Number(ownerFilters.minPrice));
    }

    if (ownerFilters.maxPrice) {
      result = result.filter(v => (parseFloat(v.pricePerDay) || 0) <= Number(ownerFilters.maxPrice));
    }

    return result;
  }, [vehicles, searchQuery, ownerFilters]);

  const openEdit = v => { setEditTarget(v); setShowEditModal(true); };

  const handleAdd = async form => {
    if (!user) {
      Alert.alert('Session expired', 'Please sign in again to continue.');
      return;
    }

    const created = await addVehicle(form, user);
    if (!created) {
      Alert.alert('Unable to add vehicle', 'Please sign in again and try once more.');
      return;
    }

    setShowAddModal(false);
    Alert.alert(
      'Vehicle Added',
      'Your vehicle listing is now live and visible to renters.'
    );
  };

  const handleEdit = async form => {
    if (!editTarget?.id) {
      Alert.alert('No vehicle selected', 'Please choose a vehicle to edit first.');
      return;
    }

    const updated = await updateVehicle(editTarget.id, form);
    if (!updated) {
      Alert.alert('Unable to update vehicle', 'Please try again later.');
      return;
    }

    setShowEditModal(false);
    setEditTarget(null);
  };

  const handleDelete = id => {
    Alert.alert('Delete Vehicle?', 'This will permanently remove the vehicle listing.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVehicle(id) },
    ]);
  };

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
          <HomeTab
            vehicles={vehicles} stats={stats}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            filtered={filtered} onEdit={openEdit} onDelete={handleDelete}
            filters={ownerFilters}
            onToggleFilter={toggleOwnerFilter}
            onSetPriceFilter={setOwnerPriceFilter}
            onClearFilters={clearOwnerFilters}
          />
        );
      case 'rentals':
        return (
          <RentalsTab
            rentalHistory={rentalHistory}
            onUpdateStatus={setBookingStatus}
            reports={reports}
            onRecordLog={handleRecordLog}
          />
        );
      case 'logreport':
        return (
          <LogReportScreen
            hideHeader={true}
            pendingRental={pendingLogRental}
            onClearPendingRental={() => setPendingLogRental(null)}
          />
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e7eef6' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerKicker}>OWNER PORTAL</Text>
          <Text style={s.headerTitle}>Owner Dashboard</Text>
          <Text style={s.headerSub}>Welcome back, {userName}</Text>
        </View>
        <View style={s.avatarWrap}>
          <ProfileAvatar size={40} />
        </View>
      </View>
      <View style={s.bodyWrap}>
        <View style={s.contentShell}>{renderContent()}</View>
      </View>
      <BottomNav role="owner" activeTab={activeTab} onTabPress={handleTabPress} badges={{ rentals: pendingCount }} />
      <VehicleFormModal visible={showAddModal}  onClose={() => setShowAddModal(false)}  onSave={handleAdd}  initial={null}        isEdit={false} />
      <VehicleFormModal visible={showEditModal} onClose={() => { setShowEditModal(false); setEditTarget(null); }} onSave={handleEdit} initial={editTarget} isEdit />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header:       { backgroundColor: C.navy, paddingTop: Platform.OS === 'ios' ? 44 : 28, paddingBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerKicker: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,.6)', letterSpacing: 1.1 },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: C.white, marginTop: 2 },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,.78)', marginTop: 2 },
  avatarWrap:   { backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 999, padding: 3, marginTop: 2 },
  bodyWrap:     { flex: 1, marginTop: -4, backgroundColor: '#e7eef6' },
  contentShell: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center' },
  statsRow:     { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, gap: 8 },
  statCard:     { flex: 1, backgroundColor: C.white, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ebeff5', elevation: 1 },
  statNum:      { fontSize: 20, fontWeight: '800' },
  statLabel:    { fontSize: 11, color: C.g500, marginTop: 3 },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: '#dbe3ee', paddingHorizontal: 12, paddingVertical: 9, marginBottom: 14 },
  searchInput:  { flex: 1, fontSize: 14, color: C.g900 },
  vehicleCard:  { backgroundColor: C.white, borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: '#dfe7f3', elevation: 2, overflow: 'hidden' },
  vehicleImageWrap: { position: 'relative', backgroundColor: '#f3f6fb' },
  vehicleImage: { width: '100%', height: 190, backgroundColor: '#f3f6fb' },
  vehicleStatusPill: { position: 'absolute', top: 12, left: 12, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  vehicleStatusPillText: { fontSize: 12, fontWeight: '800' },
  vehicleBody: { padding: 14 },
  vehicleTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  yearPill: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  yearPillText: { fontSize: 12, color: C.g500, fontWeight: '700' },
  vehicleChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  vehicleInfoChip: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  vehicleInfoChipText: { fontSize: 11, color: C.g700, fontWeight: '600' },
  vehicleLocation: { fontSize: 13, color: C.g500, marginTop: 12 },
  vehicleDivider: { height: 1, backgroundColor: '#e5e7eb', marginTop: 14, marginBottom: 12 },
  vehicleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  vehicleActions: { flexDirection: 'row', gap: 10 },
  editBtn: { backgroundColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  editBtnText: { color: C.g700, fontSize: 13, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  deleteBtnText: { color: C.white, fontSize: 13, fontWeight: '700' },
  vehicleThumbFallback: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dbe3ee' },
  vehicleThumbFallbackText: { fontSize: 10, color: C.g400, fontWeight: '600' },
  vehicleName:  { fontSize: 22, fontWeight: '800', color: C.navy, flex: 1 },
  vehicleSub:   { fontSize: 12, color: C.g500, marginTop: 2 },
  vehiclePrice: { fontSize: 20, color: C.primary, fontWeight: '800' },
  vehiclePricePer: { fontSize: 12, color: C.primaryDk, fontWeight: '700' },
  statusBadge:  { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:   { fontSize: 10, fontWeight: '700' },
  approvalBadge:{ alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8 },
  approvalText: { fontSize: 11, fontWeight: '700' },
  iconBtn:      { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f7f9fc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dbe3ee' },
  rentalCard:   { backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#dfe7f3', elevation: 2 },
  filterTab:    { flex: 1, height: 36, paddingHorizontal: 8, borderRadius: 10, backgroundColor: C.white, borderWidth: 1, borderColor: '#dfe7f3', alignItems: 'center', justifyContent: 'center' },
  filterTabActive:     { backgroundColor: C.primary, borderColor: C.primary },
  filterTabText:       { fontSize: 12, color: C.g500 },
  filterTabTextActive: { color: C.white, fontWeight: '700' },
  filterPanel: { marginHorizontal: 16, marginBottom: 14, backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: '#dbe3ee', padding: 12 },
  filterPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  filterPanelTitle: { fontSize: 13, fontWeight: '700', color: C.g700 },
  clearFilterText: { fontSize: 12, fontWeight: '700', color: C.primary },
  filterLabel: { fontSize: 11, fontWeight: '700', color: C.g400, marginBottom: 6, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#dbe3ee', backgroundColor: C.white },
  filterPillActive: { backgroundColor: C.primaryLt, borderColor: C.primary },
  filterPillText: { fontSize: 12, color: C.g500, fontWeight: '600' },
  filterPillTextActive: { color: C.primaryDk },
  empty:        { alignItems: 'center', padding: 48, backgroundColor: '#f6f9fd', borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#d5dfec' },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: C.g700, marginBottom: 6 },
  emptySub:     { fontSize: 13, color: C.g400, textAlign: 'center' },
  logBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: C.primary, borderRadius: 9, paddingVertical: 10, marginTop: 10, elevation: 2 },
  logBtnDone:   { backgroundColor: C.g100, borderWidth: 1, borderColor: C.g200, elevation: 0 },
  logBtnText:   { fontSize: 13, fontWeight: '700', color: C.white },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#dfe7f3', backgroundColor: '#f8fbff' },
  modalTitle:   { fontSize: 18, fontWeight: '700', color: C.navy },
  modalClose:   { fontSize: 22, color: C.g400 },
  fieldLabel:   { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: C.g400, marginBottom: 6 },
  input:        { padding: 12, borderWidth: 1.5, borderColor: '#dbe3ee', borderRadius: 11, fontSize: 14, color: C.g900, backgroundColor: C.white },
  pillBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: '#dbe3ee', backgroundColor: C.white },
  pillBtnText:  { fontSize: 13, fontWeight: '600', color: C.g500 },
  btnPrimary:   { backgroundColor: C.primary, borderRadius: 11, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: C.white, fontSize: 14, fontWeight: '700' },
  btnDanger:    { backgroundColor: C.danger, borderRadius: 11, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { borderWidth: 1.5, borderColor: '#dbe3ee', borderRadius: 11, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', backgroundColor: C.white },
  btnSecondaryText: { color: C.g700, fontSize: 13, fontWeight: '700' },
});