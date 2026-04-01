import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

// ─── Theme (matches RenterDashboardScreen exactly) ────────────────────
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

// ─── Status badge config ──────────────────────────────────────────────
const BADGE = {
  pending:   { bg: '#fef3c7', col: '#92400e' },
  approved:  { bg: '#d1fae5', col: '#065f46' },
  completed: { bg: '#dbeafe', col: '#1e40af' },
  rejected:  { bg: '#fee2e2', col: '#991b1b' },
};

const IconBack     = ({ size = 20, color = C.g600 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function daysBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

// ─── Main Screen ──────────────────────────────────────────────────────
export default function BookingsScreen({ hideHeader = false }) {
  const router   = useRouter();
  const { user } = useAuth();
  const { getBookingsForOwner, getBookingsForRenter } = useBookings();
  const [activeTab, setActiveTab] = useState('all');
  const [query,     setQuery]     = useState('');
  const [expanded,  setExpanded]  = useState(null);

  const baseData = useMemo(() => {
    if (user?.role === 'owner')  return getBookingsForOwner(user?.id || user?.email);
    if (user?.role === 'renter') return getBookingsForRenter(user?.email);
    return [];
  }, [getBookingsForOwner, getBookingsForRenter, user]);

  const stats = useMemo(() => ({
    total:     baseData.length,
    pending:   baseData.filter(x => x.status === 'pending').length,
    approved:  baseData.filter(x => x.status === 'approved').length,
    completed: baseData.filter(x => x.status === 'completed').length,
  }), [baseData]);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? baseData : baseData.filter(i => i.status === activeTab);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(i =>
        i.vehicleName.toLowerCase().includes(q) ||
        i.ownerName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, baseData, query]);

  const TABS = [
    { key: 'all',       label: 'All'       },
    { key: 'pending',   label: 'Pending'   },
    { key: 'approved',  label: 'Active'    },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected',  label: 'Rejected'  },
  ];

  const roleTitle = user?.role === 'owner' ? 'Rental Requests' : 'My Bookings';

  if (hideHeader) {
    return (
      <View style={{ flex: 1, backgroundColor: '#edf1f7' }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Stats — matches BookingsTab stat cards ── */}
          <View style={s.statsRow}>
            {[
              { label: 'Total',   value: stats.total,     color: C.primary  },
              { label: 'Pending', value: stats.pending,   color: C.warning  },
              { label: 'Active',  value: stats.approved,  color: C.success  },
              { label: 'Done',    value: stats.completed, color: '#3b82f6'  },
            ].map(st => (
              <View key={st.label} style={[s.statCard, { borderLeftColor: st.color }]}>
                <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Search — matches dashboard searchWrap ── */}
          <View style={s.searchWrap}>
            <TextInput
              style={s.searchInput}
              placeholder="Search vehicle or owner…"
              placeholderTextColor={C.g400}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
                <Text style={s.clearBtn}>{'✕'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Filter tabs — matches dashboard filterTab ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.tabsScroll}
            contentContainerStyle={s.tabsContent}
          >
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[s.filterTab, active && s.filterTabActive, { marginHorizontal: 1.7 }]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.filterTabText, active && s.filterTabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Cards — matches rentalCard style ── */}
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyTitle}>No bookings found</Text>
              <Text style={s.emptySub}>
                {activeTab === 'all'
                  ? "You haven't made any bookings yet."
                  : 'No ' + activeTab + ' bookings.'}
              </Text>
            </View>
          ) : (
            filtered.map(item => (
              <BookingCard
                key={item.id}
                item={item}
                isExpanded={expanded === item.id}
                onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              />
            ))
          )}

        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#edf1f7' }} edges={['top', 'bottom']}>
      {/* Only show header if hideHeader is false */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <IconBack size={20} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{roleTitle}</Text>
          <Text style={s.headerSub}>
            {user?.role === 'owner' ? 'Manage incoming requests' : 'Track your rentals'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Stats — matches BookingsTab stat cards ── */}
        <View style={s.statsRow}>
          {[
            { label: 'Total',   value: stats.total,     color: C.primary  },
            { label: 'Pending', value: stats.pending,   color: C.warning  },
            { label: 'Active',  value: stats.approved,  color: C.success  },
            { label: 'Done',    value: stats.completed, color: '#3b82f6'  },
          ].map(st => (
            <View key={st.label} style={[s.statCard, { borderLeftColor: st.color }]}>
              <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Search — matches dashboard searchWrap ── */}
        <View style={s.searchWrap}>
          <TextInput
            style={s.searchInput}
            placeholder="Search vehicle or owner…"
            placeholderTextColor={C.g400}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Text style={s.clearBtn}>{'✕'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filter tabs — matches dashboard filterTab ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabsScroll}
          contentContainerStyle={s.tabsContent}
        >
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[s.filterTab, active && s.filterTabActive, { marginHorizontal: 1.7 }]}
                activeOpacity={0.7}
              >
                <Text style={[s.filterTabText, active && s.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Cards — matches rentalCard style ── */}
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyTitle}>No bookings found</Text>
            <Text style={s.emptySub}>
              {activeTab === 'all'
                ? "You haven't made any bookings yet."
                : 'No ' + activeTab + ' bookings.'}
            </Text>
          </View>
        ) : (
          filtered.map(item => (
            <BookingCard
              key={item.id}
              item={item}
              isExpanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── BookingCard ──────────────────────────────────────────────────────
function BookingCard({ item, isExpanded, onToggle }) {
  const bc   = BADGE[item.status] || BADGE.pending;
  const days = daysBetween(item.startDate, item.endDate);
  const pd   = Math.round(item.totalPrice / (days || 1));

  return (
    <View style={s.rentalCard}>

      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        {/* Name + badge */}
        <View style={s.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardVehicleName}>{item.vehicleName}</Text>
            <Text style={{ fontSize: 12, color: C.g500 }}>{item.vehicleModel}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: bc.bg }]}>
            <Text style={[s.badgeText, { color: bc.col }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Meta */}
        <Text style={s.cardMeta}>
          {'Owner: '}
          <Text style={{ color: C.g700, fontWeight: '600' }}>{item.ownerName}</Text>
        </Text>
        <Text style={[s.cardMeta, { marginTop: 2 }]}>
          {'📅 '}
          {fmtDate(item.startDate)}
          {'  –  '}
          {fmtDate(item.endDate)}
          {'  ·  '}
          {days}
          {days !== 1 ? ' days' : ' day'}
        </Text>

        {/* Price + chevron */}
        <View style={s.cardPriceRow}>
          <Text style={s.cardPrice}>{'₱' + item.totalPrice.toLocaleString()}</Text>
          <Text style={s.cardPerDay}>{'₱' + pd.toLocaleString() + '/day'}</Text>
          <Text style={s.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* ── Expanded section ── */}
      {isExpanded && (
        <View style={s.expandWrap}>
          <View style={s.divider} />

          {/* Detail grid */}
          <View style={s.detailGrid}>
            <DetailItem label="Start Date" value={fmtDate(item.startDate)} />
            <DetailItem label="End Date"   value={fmtDate(item.endDate)}   />
            <DetailItem label="Duration"   value={days + (days !== 1 ? ' days' : ' day')} />
            <DetailItem label="Daily Rate" value={'₱' + pd.toLocaleString()} />
          </View>

          {/* Total — matches modal price summary */}
          <View style={s.totalRow}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.navy }}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary }}>
              {'₱' + item.totalPrice.toLocaleString()}
            </Text>
          </View>

          {/* Action buttons */}
          {item.status === 'pending' && (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.btnOutlineDanger} activeOpacity={0.8}>
                <Text style={s.btnOutlineDangerText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.status === 'completed' && (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.btnOutline} activeOpacity={0.8}>
                <Text style={s.btnOutlineText}>Leave Review</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} activeOpacity={0.8}>
                <Text style={s.btnPrimaryText}>Book Again</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.status === 'rejected' && item.rejectionReason ? (
            <View style={s.rejectionBox}>
              <Text style={s.rejectionText}>
                <Text style={{ fontWeight: '700' }}>{'Reason: '}</Text>
                {item.rejectionReason}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

// ─── DetailItem ───────────────────────────────────────────────────────
function DetailItem({ label, value }) {
  return (
    <View style={s.detailItem}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#edf1f7' },

  // Header — identical to dashboard
  header: {
    backgroundColor: C.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow:   { color: C.white, fontSize: 18, fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 },

  scrollContent: { padding: 16, paddingBottom: 100 },

  // Stats — identical to BookingsTab
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    elevation: 2,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, color: C.g500 },

  // Search — identical to dashboard searchWrap
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.g200,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: C.g900 },
  clearBtn:    { fontSize: 13, color: C.g400, paddingHorizontal: 4, fontWeight: '700' },

  // Filter tabs — identical to dashboard filterTab
  tabsScroll:  { marginBottom: 14 },
  tabsContent: { flexDirection: 'row', gap: 4 },
  filterTab: {
    paddingHorizontal: 15.7,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.g200,
  },
  filterTabActive:     { backgroundColor: C.primary, borderColor: C.primary },
  filterTabText:       { fontSize: 13, color: C.g500 },
  filterTabTextActive: { color: C.white, fontWeight: '700' },

  // Card — identical to dashboard rentalCard
  rentalCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.g200,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardVehicleName: { fontSize: 15, fontWeight: '700', color: C.navy },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  cardMeta:     { fontSize: 13, color: C.g500 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  cardPrice:    { fontSize: 14, color: C.primary, fontWeight: '700' },
  cardPerDay:   { fontSize: 12, color: C.g400, flex: 1 },
  chevron:      { fontSize: 11, color: C.g400 },

  // Expanded
  expandWrap: { marginTop: 10 },
  divider:    { height: 1, backgroundColor: C.g200, marginBottom: 12 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  detailItem: {
    width: '47.5%',
    backgroundColor: C.g50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.g200,
    padding: 10,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: C.g400,
    marginBottom: 3,
  },
  detailValue: { fontSize: 13, fontWeight: '700', color: C.navy },

  // Total row — matches modal price summary style
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.g50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.g200,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },

  actionRow: { flexDirection: 'row', gap: 8 },

  // Buttons — identical to dashboard btnPrimary
  btnPrimary: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  btnPrimaryText: { color: C.white, fontSize: 13, fontWeight: '700' },
  btnOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.g300,
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: 13, fontWeight: '700', color: C.g700 },
  btnOutlineDanger: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    alignItems: 'center',
  },
  btnOutlineDangerText: { fontSize: 13, fontWeight: '700', color: C.danger },

  rejectionBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectionText: { fontSize: 12, color: '#dc2626' },

  // Empty state
  empty: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: C.g50,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.g200,
  },
  emptyIcon:  { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.g700, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: C.g400, textAlign: 'center' },
});