// screens/AdminDashboard.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, StatusBar, FlatList, Alert, Modal, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';

const C = {
  primary:   '#3F9B84', primaryDk: '#2d7a67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#ef4444', warning: '#f59e0b', success: '#22c55e',
  g50:  '#f8fafc', g100: '#f1f5f9', g200: '#e2e8f0',
  g300: '#cbd5e1', g400: '#94a3b8', g500: '#64748b',
  g600: '#475569', g700: '#334155', g800: '#1e293b',
  white: '#ffffff',
};

const GridIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="3" width="7" height="7" /><Rect x="14" y="3" width="7" height="7" />
    <Rect x="14" y="14" width="7" height="7" /><Rect x="3" y="14" width="7" height="7" />
  </Svg>
);
const UsersIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);
const CarIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <Circle cx="7" cy="17" r="2" /><Circle cx="17" cy="17" r="2" />
  </Svg>
);
const CheckCircleIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Polyline points="22 4 12 14.01 9 11.01" />
  </Svg>
);
const SearchIcon = ({ color = C.g400 }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" /><Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: GridIcon },
  { id: 'approvals', label: 'Approvals', icon: CheckCircleIcon },
  { id: 'users',     label: 'Users',     icon: UsersIcon },
  { id: 'vehicles',  label: 'Vehicles',  icon: CarIcon },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    vehicles,
    getPendingVehicles,
    getApprovedVehicles,
    approveVehicle,
    rejectVehicle,
  } = useVehicles();

  const [activeTab,       setActiveTab]       = useState('overview');
  const [search,          setSearch]          = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [rejectModal,     setRejectModal]     = useState(false);
  const [rejectTarget,    setRejectTarget]    = useState(null);
  const [rejectNote,      setRejectNote]      = useState('');

  React.useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'admin') {
      router.replace(user.role === 'owner' ? '/dashboard' : '/renter');
    }
  }, [router, user]);

  const pendingVehicles  = getPendingVehicles();
  const approvedVehicles = getApprovedVehicles();

  // ── Stats computed from live context ───────────────────────────────────────
  const STATS = [
    { label: 'Total Vehicles',   value: vehicles.length,         color: C.navy,    change: 'All' },
    { label: 'Pending Review',   value: pendingVehicles.length,  color: C.warning, change: pendingVehicles.length > 0 ? 'Urgent' : 'Clear' },
    { label: 'Approved',         value: approvedVehicles.length, color: C.success, change: 'Active' },
    { label: 'Rejected',         value: vehicles.filter(v => v.approvalStatus === 'rejected').length, color: C.danger, change: 'Review' },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleApprove = (vehicle) => {
    Alert.alert(
      'Approve Vehicle?',
      `Approve "${vehicle.name}" by ${vehicle.ownerName}? It will become visible to renters.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            approveVehicle(vehicle.id);
            Alert.alert('Approved ✓', `"${vehicle.name}" is now visible to renters.`);
          },
        },
      ]
    );
  };

  const openRejectModal = (vehicle) => {
    setRejectTarget(vehicle);
    setRejectNote('');
    setRejectModal(true);
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    rejectVehicle(rejectTarget.id, rejectNote.trim());
    setRejectModal(false);
    setRejectTarget(null);
    setRejectNote('');
    Alert.alert('Rejected', `"${rejectTarget.name}" has been rejected.`);
  };

  const toggleProfileMenu = () => setProfileMenuOpen(o => !o);
  const closeProfileMenu  = () => setProfileMenuOpen(false);
  const onLogout = () => { closeProfileMenu(); router.replace('/login'); };
  const onProfile = () => { closeProfileMenu(); router.push('/profile'); };
  const onEmailLog = () => { closeProfileMenu(); router.push('/email-log'); };

  // ── Sub-components ─────────────────────────────────────────────────────────
  const StatCard = ({ item }) => (
    <View style={s.statCard}>
      <Text style={s.statLabel}>{item.label}</Text>
      <Text style={[s.statValue, { color: item.color }]}>{item.value}</Text>
      <View style={[s.statBadge, { backgroundColor: item.change === 'Urgent' ? '#fef2f2' : C.g100 }]}>
        <Text style={[s.statChange, { color: item.change === 'Urgent' ? C.danger : C.g600 }]}>
          {item.change}
        </Text>
      </View>
    </View>
  );

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const fmtPrice = value => {
    const amount = parseFloat(value);
    return Number.isFinite(amount) ? `₱${amount.toLocaleString()}/day` : '—';
  };

  const ApprovalItem = ({ item }) => {
    const isPending  = item.approvalStatus === 'pending';
    const isApproved = item.approvalStatus === 'approved';
    const isRejected = item.approvalStatus === 'rejected';
    const hasPhoto = !!item.photoUri;
    const specs = [
      item.model,
      item.year,
      item.seats ? `${item.seats} seats` : null,
      item.fuel,
    ].filter(Boolean).join(' · ');

    return (
      <View style={s.listItem}>
        <View style={[s.iconCircle, { backgroundColor: '#e0f2fe' }]}>
          <Text style={{ fontSize: 16 }}>🚗</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.itemTitle}>{item.name || 'Unnamed Vehicle'}</Text>
          {specs ? <Text style={s.itemSub}>{specs}</Text> : null}
          <Text style={s.itemSub}>Owner: {item.ownerName || 'Unknown Owner'}</Text>

          <View style={s.approvalPreviewWrap}>
            {hasPhoto ? (
              <Image source={{ uri: item.photoUri }} style={s.approvalPreviewImage} resizeMode="cover" />
            ) : (
              <View style={[s.approvalPreviewImage, s.approvalPreviewFallback]}>
                <Text style={s.approvalPreviewFallbackText}>No photo</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.itemSub}>Price: {fmtPrice(item.pricePerDay)}</Text>
              <Text style={s.itemSub}>Status: {(item.status || 'available').toUpperCase()}</Text>
              {item.location ? <Text style={s.itemSub}>Location: {item.location}</Text> : null}
            </View>
          </View>

          {item.description ? (
            <Text style={s.approvalDesc}>{item.description}</Text>
          ) : null}

          <Text style={s.itemDate}>Submitted: {fmtDate(item.submittedAt)}</Text>
          {item.pricePerDay ? <Text style={s.itemPrice}>{fmtPrice(item.pricePerDay)}</Text> : null}

          {/* Status badge */}
          <View style={{ marginTop: 6 }}>
            {isPending  && <View style={s.badgeWarning}><Text style={s.badgeTextWarning}>PENDING REVIEW</Text></View>}
            {isApproved && <View style={s.badgeSuccess}><Text style={s.badgeTextSuccess}>APPROVED</Text></View>}
            {isRejected && (
              <View>
                <View style={s.badgeDanger}><Text style={s.badgeTextDanger}>REJECTED</Text></View>
                {item.approvalNote ? (
                  <Text style={{ fontSize: 11, color: C.danger, marginTop: 3 }}>Note: {item.approvalNote}</Text>
                ) : null}
              </View>
            )}
          </View>
        </View>

        {/* Action buttons — only for pending */}
        {isPending && (
          <View style={{ flexDirection: 'column', gap: 8, marginLeft: 8 }}>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: C.primaryLt, borderColor: C.primary }]}
              onPress={() => handleApprove(item)}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.primaryDk }}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: '#fef2f2', borderColor: C.danger }]}
              onPress={() => openRejectModal(item)}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.danger }}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const VehicleItem = ({ item }) => {
    const statusColor =
      item.approvalStatus === 'approved' ? C.success :
      item.approvalStatus === 'rejected' ? C.danger  : C.warning;
    return (
      <View style={s.listItem}>
        <View style={[s.iconCircle, { backgroundColor: C.g100 }]}>
          <CarIcon color={C.g400} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.itemTitle}>{item.name}</Text>
          <Text style={s.itemSub}>{[item.model, item.year].filter(Boolean).join(' · ')}</Text>
          <Text style={s.itemSub}>{item.ownerName}</Text>
          <Text style={[s.itemDate, { color: statusColor, fontWeight: '700', marginTop: 4 }]}>
            {(item.approvalStatus || 'pending').toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  // ── Render Content ─────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={s.sectionTitle}>Dashboard Status</Text>
            <View style={s.statsGrid}>
              {STATS.map((stat, i) => <StatCard key={i} item={stat} />)}
            </View>

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>
                Pending Approvals
                {pendingVehicles.length > 0 && (
                  <Text style={{ color: C.danger }}> ({pendingVehicles.length})</Text>
                )}
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('approvals')}>
                <Text style={s.linkText}>See All</Text>
              </TouchableOpacity>
            </View>
            {pendingVehicles.length === 0
              ? <Text style={s.emptyText}>No pending approvals.</Text>
              : pendingVehicles.slice(0, 2).map(item => <ApprovalItem key={item.id} item={item} />)
            }

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>All Vehicles</Text>
              <TouchableOpacity onPress={() => setActiveTab('vehicles')}>
                <Text style={s.linkText}>View All</Text>
              </TouchableOpacity>
            </View>
            {vehicles.slice(0, 3).map(item => <VehicleItem key={item.id} item={item} />)}
            {vehicles.length === 0 && <Text style={s.emptyText}>No vehicles submitted yet.</Text>}
          </ScrollView>
        );

      case 'approvals':
        return (
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={s.pageTitle}>Pending Approvals ({pendingVehicles.length})</Text>
            <Text style={s.pageSub}>Review and approve or reject vehicle listings.</Text>
            <View style={{ height: 16 }} />
            {pendingVehicles.length === 0
              ? <Text style={s.emptyText}>No pending items.</Text>
              : pendingVehicles.map(item => <ApprovalItem key={item.id} item={item} />)
            }
          </ScrollView>
        );

      case 'users': {
        const filteredUsers = []; // wire up your users source here
        return (
          <View style={{ flex: 1 }}>
            <View style={s.searchBar}>
              <SearchIcon />
              <TextInput
                style={s.searchInput}
                placeholder="Search users..."
                placeholderTextColor={C.g400}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <FlatList
              data={filteredUsers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => null}
              contentContainerStyle={s.listContent}
              ListEmptyComponent={<Text style={s.emptyText}>No users found.</Text>}
            />
          </View>
        );
      }

      case 'vehicles':
        return (
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={s.pageTitle}>All Vehicles ({vehicles.length})</Text>
            <Text style={s.pageSub}>Complete fleet across all owners.</Text>
            <View style={{ height: 16 }} />
            {vehicles.length === 0
              ? <Text style={s.emptyText}>No vehicles submitted yet.</Text>
              : vehicles.map(item => <ApprovalItem key={item.id} item={item} />)
            }
          </ScrollView>
        );

      default: return null;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Admin Portal</Text>
          <Text style={s.headerSub}>Welcome back, Admin</Text>
        </View>
        <View style={s.profileWrapper}>
          <TouchableOpacity style={s.profileBtn} onPress={toggleProfileMenu}>
            <Text style={s.profileInitials}>A</Text>
          </TouchableOpacity>
          {profileMenuOpen && (
            <View style={s.profileMenu}>
              <TouchableOpacity style={s.profileMenuItem} onPress={onProfile}>
                <Text style={s.profileMenuText}>My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.profileMenuItem} onPress={onEmailLog}>
                <Text style={s.profileMenuText}>Email Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.profileMenuItem} onPress={onLogout}>
                <Text style={[s.profileMenuText, s.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── Pending badge on Approvals tab ── */}
      <View style={s.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
          {TABS.map(t => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            const badge = t.id === 'approvals' && pendingVehicles.length > 0;
            return (
              <TouchableOpacity
                key={t.id}
                style={[s.tabItem, isActive && s.tabItemActive]}
                onPress={() => setActiveTab(t.id)}
              >
                <Icon color={isActive ? C.white : C.g500} />
                <Text style={[s.tabText, isActive && s.tabTextActive]}>{t.label}</Text>
                {badge && (
                  <View style={s.tabBadge}>
                    <Text style={s.tabBadgeText}>{pendingVehicles.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      <View style={s.contentContainer}>{renderContent()}</View>

      {/* ── Reject Modal ── */}
      <Modal visible={rejectModal} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Reject Vehicle</Text>
            <Text style={s.modalSub}>
              Rejecting "{rejectTarget?.name}" by {rejectTarget?.ownerName}.
            </Text>
            <Text style={[s.modalSub, { marginTop: 14, marginBottom: 6, fontWeight: '700', color: C.g700 }]}>
              Reason (optional)
            </Text>
            <TextInput
              style={s.rejectInput}
              placeholder="e.g. Missing documents, incomplete info…"
              placeholderTextColor={C.g400}
              value={rejectNote}
              onChangeText={setRejectNote}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: C.g100, flex: 1 }]}
                onPress={() => setRejectModal(false)}
              >
                <Text style={{ color: C.g700, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: C.danger, flex: 1 }]}
                onPress={handleReject}
              >
                <Text style={{ color: C.white, fontWeight: '700' }}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.g50 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.g200,
  },
  profileWrapper:  { position: 'relative' },
  profileBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  profileInitials: { color: '#fff', fontWeight: '700' },
  profileMenu:     { position: 'absolute', top: 44, right: 0, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4, zIndex: 10, width: 130 },
  profileMenuItem: { paddingVertical: 8, paddingHorizontal: 12 },
  profileMenuText: { fontSize: 14, color: C.g700 },
  logoutText:      { color: C.danger },
  headerTitle:     { fontSize: 20, fontWeight: '800', color: C.navy },
  headerSub:       { fontSize: 13, color: C.g500 },

  tabContainer: { backgroundColor: C.white, paddingBottom: 12 },
  tabScroll:    { paddingHorizontal: 16, gap: 8 },
  tabItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: C.g50, borderWidth: 1, borderColor: C.g200,
  },
  tabItemActive: { backgroundColor: C.navy, borderColor: C.navy },
  tabText:       { fontSize: 13, fontWeight: '600', color: C.g600 },
  tabTextActive: { color: C.white },
  tabBadge:      { backgroundColor: C.danger, borderRadius: 999, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText:  { fontSize: 10, fontWeight: '800', color: C.white },

  contentContainer: { flex: 1 },
  scrollContent:    { padding: 20, paddingBottom: 40 },
  listContent:      { padding: 20, paddingBottom: 40 },

  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: C.navy },
  pageTitle:      { fontSize: 22, fontWeight: '800', color: C.navy, marginBottom: 4 },
  pageSub:        { fontSize: 14, color: C.g500 },
  linkText:       { fontSize: 13, fontWeight: '600', color: C.primary },
  emptyText:      { fontSize: 14, color: C.g400, textAlign: 'center', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  statCard: {
    width: '48%', backgroundColor: C.white, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.g200,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
  },
  statLabel:  { fontSize: 11, color: C.g500, fontWeight: '600', marginBottom: 6 },
  statValue:  { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  statBadge:  { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statChange: { fontSize: 10, fontWeight: '700' },

  listItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: C.white, padding: 14, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: C.g200,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemTitle:  { fontSize: 14, fontWeight: '700', color: C.g800 },
  itemSub:    { fontSize: 12, color: C.g500, marginTop: 2 },
  itemDate:   { fontSize: 11, color: C.g400, marginTop: 4 },
  itemPrice:  { fontSize: 12, color: C.primary, fontWeight: '700', marginTop: 4 },
  approvalPreviewWrap: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
  approvalPreviewImage: { width: 92, height: 68, borderRadius: 8, backgroundColor: C.g100 },
  approvalPreviewFallback: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.g200 },
  approvalPreviewFallbackText: { fontSize: 11, color: C.g400 },
  approvalDesc: { fontSize: 12, color: C.g600, marginTop: 8 },

  badgeWarning:     { alignSelf: 'flex-start', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeTextWarning: { fontSize: 10, fontWeight: '700', color: '#92400e' },
  badgeSuccess:     { alignSelf: 'flex-start', backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeTextSuccess: { fontSize: 10, fontWeight: '700', color: '#065f46' },
  badgeDanger:      { alignSelf: 'flex-start', backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeTextDanger:  { fontSize: 10, fontWeight: '700', color: C.danger },

  actionBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, alignItems: 'center',
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, margin: 20, marginBottom: 10,
    paddingHorizontal: 14, borderRadius: 10,
    borderWidth: 1, borderColor: C.g200,
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 14, color: C.navy },

  // Reject modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox:     { backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: C.navy, marginBottom: 4 },
  modalSub:     { fontSize: 13, color: C.g500 },
  rejectInput:  { borderWidth: 1.5, borderColor: C.g200, borderRadius: 10, padding: 12, fontSize: 14, color: C.g800, minHeight: 80, textAlignVertical: 'top', marginTop: 4 },
  modalBtn:     { paddingVertical: 13, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});