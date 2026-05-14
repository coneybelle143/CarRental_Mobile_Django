// screens/BookingsScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

const C = {
  primary: '#3F9B84',
  primaryDk: '#2d7a67',
  primaryLt: '#ecfdf5',
  navy: '#1a2c5e',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  g50: '#f9fafb',
  g100: '#f3f4f6',
  g200: '#e5e7eb',
  g300: '#d1d5db',
  g400: '#9ca3af',
  g500: '#6b7280',
  g700: '#374151',
  g900: '#111827',
  white: '#ffffff',
};

const BADGE = {
  pending:   { bg: '#fef3c7', col: '#92400e', label: 'Pending' },
  approved:  { bg: '#d1fae5', col: '#065f46', label: 'Active' },
  active:    { bg: '#d1fae5', col: '#065f46', label: 'Active' },
  completed: { bg: '#dbeafe', col: '#1e40af', label: 'Completed' },
  rejected:  { bg: '#fee2e2', col: '#991b1b', label: 'Rejected' },
};

function BookingCard({ item, isExpanded, onToggle, userRole }) {
  const { setBookingStatus } = useBookings();
  const bc = BADGE[item.status] || BADGE.pending;
  const days = Math.max(0, Math.round((new Date(item.endDate) - new Date(item.startDate)) / 86400000));
  const dailyRate = days > 0 ? Math.round(item.totalPrice / days) : 0;

  const handleCancel = () => {
    Alert.alert('Cancel Booking?', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => {
          // Add your cancel logic here (update booking status)
          Alert.alert('Cancelled', 'Booking has been cancelled.');
        }}
    ]);
  };

  const handleReturnVehicle = () => {
    Alert.alert(
      'Return Vehicle?',
      'Are you sure you want to mark this vehicle as returned? This will complete the booking.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Return',
          style: 'default',
          onPress: () => {
            if (typeof setBookingStatus === 'function') {
              setBookingStatus(item.id, 'completed');
            }
            Alert.alert('Success', 'Vehicle return has been recorded. The owner can now add a check-out report.');
          },
        },
      ]
    );
  };

  return (
    <View style={s.bookingCard}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.9}>
        {/* Image + Info Row */}
        <View style={s.cardHeader}>
          <View style={s.imageContainer}>
            {item.vehiclePhotoUri ? (
              <Image source={{ uri: item.vehiclePhotoUri }} style={s.vehicleImage} resizeMode="cover" />
            ) : (
              <View style={[s.vehicleImage, s.fallbackImage]}>
                <Text style={s.fallbackText}>🚗</Text>
              </View>
            )}
          </View>

          <View style={s.cardInfo}>
            <View style={s.titleRow}>
              <Text style={s.vehicleName} numberOfLines={1}>{item.vehicleName}</Text>
              <View style={[s.badge, { backgroundColor: bc.bg }]}>
                <Text style={[s.badgeText, { color: bc.col }]}>{bc.label}</Text>
              </View>
            </View>

            <Text style={s.modelText}>{item.vehicleModel} • {item.year || ''}</Text>

            <Text style={s.metaText}>
              {userRole === 'renter' ? `Owner: ${item.ownerName}` : `Renter: ${item.renterName}`}
            </Text>

            <View style={s.dateRow}>
              <Text style={s.dateText}>
                📅 {new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                {' → '} 
                {new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={s.duration}>• {days} day{days !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        {/* Price Row */}
        <View style={s.priceRow}>
          <View>
            <Text style={s.totalPrice}>₱{item.totalPrice.toLocaleString()}</Text>
            <Text style={s.dailyRate}>₱{dailyRate.toLocaleString()}/day</Text>
          </View>
          <Text style={s.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={s.expandedContent}>
          <View style={s.divider} />

          <View style={s.detailGrid}>
            <DetailItem label="Start Date" value={new Date(item.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
            <DetailItem label="End Date" value={new Date(item.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
            <DetailItem label="Duration" value={`${days} day${days !== 1 ? 's' : ''}`} />
            <DetailItem label="Daily Rate" value={`₱${dailyRate.toLocaleString()}`} />
          </View>

          {item.notes && (
            <View style={{ marginTop: 12 }}>
              <Text style={s.fieldLabel}>Notes</Text>
              <Text style={s.notesText}>{item.notes}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={s.actionContainer}>
            {item.status === 'pending' && (
              <TouchableOpacity style={s.btnDanger} onPress={handleCancel}>
                <Text style={s.btnDangerText}>Cancel Request</Text>
              </TouchableOpacity>
            )}

            {(item.status === 'approved' || item.status === 'active') && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={s.btnPrimary} onPress={handleReturnVehicle}>
                  <Text style={s.btnPrimaryText}>Request Return</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnOutline} onPress={() => Alert.alert('Contact Owner', `Contact ${item.ownerName || 'the owner'} to coordinate vehicle return.`)}>
                  <Text style={s.btnOutlineText}>Contact Owner</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'completed' && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={s.btnOutline} onPress={() => Alert.alert('Review', 'Review feature coming soon')}>
                  <Text style={s.btnOutlineText}>Leave Review</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]}>
                  <Text style={s.btnPrimaryText}>Book Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'rejected' && item.rejectionReason && (
              <View style={s.rejectionBox}>
                <Text style={s.rejectionTitle}>Rejection Reason</Text>
                <Text style={s.rejectionText}>{item.rejectionReason}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function DetailItem({ label, value }) {
  return (
    <View style={s.detailItem}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

export default function BookingsScreen({ hideHeader = false }) {
  const router = useRouter();
  const { user } = useAuth();
  const { getBookingsForOwner, getBookingsForRenter, refreshBookings } = useBookings();

  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (typeof refreshBookings === 'function') await refreshBookings();
    setRefreshing(false);
  };

  useFocusEffect(React.useCallback(() => { handleRefresh(); }, []));

  const baseData = useMemo(() => {
    if (user?.role === 'owner') return getBookingsForOwner(user?.id || user?.email);
    if (user?.role === 'renter') return getBookingsForRenter(user?.email);
    return [];
  }, [user, getBookingsForOwner, getBookingsForRenter]);

  const stats = useMemo(() => ({
    total: baseData.length,
    pending: baseData.filter(x => x.status === 'pending').length,
    approved: baseData.filter(x => x.status === 'approved' || x.status === 'active').length,
    completed: baseData.filter(x => x.status === 'completed').length,
  }), [baseData]);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? baseData : baseData.filter(i => {
      if (activeTab === 'approved') return i.status === 'approved' || i.status === 'active';
      return i.status === activeTab;
    });
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(i =>
        (i.vehicleName?.toLowerCase().includes(q)) ||
        (i.ownerName?.toLowerCase().includes(q)) ||
        (i.renterName?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeTab, baseData, query]);

  const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const roleTitle = user?.role === 'owner' ? 'Rental Requests' : 'My Bookings';

  const content = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: C.primary },
          { label: 'Pending', value: stats.pending, color: C.warning },
          { label: 'Active', value: stats.approved, color: C.success },
          { label: 'Done', value: stats.completed, color: '#3b82f6' },
        ].map(st => (
          <View key={st.label} style={[s.statCard, { borderLeftColor: st.color }]}>
            <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="Search vehicle, owner or renter..."
          placeholderTextColor={C.g400}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[s.filterTab, active && s.filterTabActive]}
            >
              <Text style={[s.filterTabText, active && s.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📭</Text>
          <Text style={s.emptyTitle}>No bookings found</Text>
          <Text style={s.emptySub}>
            {activeTab === 'all' ? "You don't have any bookings yet." : `No ${activeTab} bookings.`}
          </Text>
        </View>
      ) : (
        filtered.map(item => (
          <BookingCard
            key={item.id}
            item={item}
            isExpanded={expanded === item.id}
            onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
            userRole={user?.role}
          />
        ))
      )}
    </ScrollView>
  );

  if (hideHeader) {
    return <View style={{ flex: 1, backgroundColor: '#edf1f7' }}>{content}</View>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#edf1f7' }} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={{ color: C.white, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{roleTitle}</Text>
          <Text style={s.headerSub}>
            {user?.role === 'owner' ? 'Manage incoming rental requests' : 'Track all your rentals'}
          </Text>
        </View>
      </View>

      {content}
    </SafeAreaView>
  );
}

/* ==================== STYLES ==================== */
const s = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 100 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: C.g500, marginTop: 2 },

  // Search & Tabs
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.g200,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: C.g900 },
  clearBtn: { fontSize: 16, color: C.g400, padding: 4, fontWeight: '600' },

  tabsScroll: { marginBottom: 16 },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.g200,
    marginRight: 8,
  },
  filterTabActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterTabText: { fontSize: 13.5, color: C.g500, fontWeight: '600' },
  filterTabTextActive: { color: C.white, fontWeight: '700' },

  // Booking Card
  bookingCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e9f0',
    overflow: 'hidden',
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', padding: 14 },
  imageContainer: { width: 110, height: 78, borderRadius: 12, overflow: 'hidden', marginRight: 12 },
  vehicleImage: { width: '100%', height: '100%' },
  fallbackImage: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontSize: 32 },

  cardInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  vehicleName: { fontSize: 17, fontWeight: '700', color: C.navy, flex: 1, marginRight: 8 },
  modelText: { fontSize: 13, color: C.g500, marginBottom: 6 },
  metaText: { fontSize: 13, color: C.g600, marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 13, color: C.g700 },
  duration: { fontSize: 13, color: C.g500, marginLeft: 6 },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: C.g100,
  },
  totalPrice: { fontSize: 19, fontWeight: '800', color: C.primary },
  dailyRate: { fontSize: 12, color: C.g500 },
  chevron: { fontSize: 18, color: C.g400, fontWeight: '600' },

  // Expanded
  expandedContent: { padding: 14, paddingTop: 0 },
  divider: { height: 1, backgroundColor: C.g200, marginVertical: 12 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: C.g50,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.g100,
  },
  detailLabel: { fontSize: 10, fontWeight: '700', color: C.g400, textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '600', color: C.g900, marginTop: 2 },

  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.g400, marginBottom: 6, textTransform: 'uppercase' },
  notesText: { fontSize: 14, color: C.g700, lineHeight: 20 },

  actionContainer: { marginTop: 16, gap: 10 },

  btnPrimary: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: { color: C.white, fontWeight: '700', fontSize: 14 },

  btnOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.g300,
    alignItems: 'center',
  },
  btnOutlineText: { fontWeight: '600', color: C.g700 },

  btnDanger: {
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDangerText: { color: C.danger, fontWeight: '700' },

  rejectionBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectionTitle: { fontWeight: '700', color: C.danger, marginBottom: 4 },
  rejectionText: { color: '#b91c1c', fontSize: 13.5 },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: C.g50,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.g200,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.g700 },
  emptySub: { fontSize: 14, color: C.g400, textAlign: 'center', marginTop: 6 },

  // Header
  header: {
    backgroundColor: C.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 13.5, color: 'rgba(255,255,255,0.7)' },
});