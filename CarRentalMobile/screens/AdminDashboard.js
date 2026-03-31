import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, StatusBar, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const C = {
  primary:   '#3F9B84', primaryDk: '#2d7a67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#ef4444', warning: '#f59e0b', success: '#22c55e',
  g50:  '#f8fafc', g100: '#f1f5f9', g200: '#e2e8f0',
  g300: '#cbd5e1', g400: '#94a3b8', g500: '#64748b',
  g600: '#475569', g700: '#334155', g800: '#1e293b',
  white: '#ffffff',
};

// ── Icons ────────────────────────────────────────────────────────────────────
const GridIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Rect x="3" y="3" width="7" height="7" /><Rect x="14" y="3" width="7" height="7" /><Rect x="14" y="14" width="7" height="7" /><Rect x="3" y="14" width="7" height="7" /></Svg>
);
const UsersIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><Circle cx="9" cy="7" r="4" /><Path d="M23 21v-2a4 4 0 0 0-3-3.87" /><Path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>
);
const CarIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><Circle cx="7" cy="17" r="2" /><Circle cx="17" cy="17" r="2" /></Svg>
);
const CheckCircleIcon = ({ color = C.g500 }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><Polyline points="22 4 12 14.01 9 11.01" /></Svg>
);
const SearchIcon = ({ color = C.g400 }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><Circle cx="11" cy="11" r="8" /><Line x1="21" y1="21" x2="16.65" y2="16.65" /></Svg>
);

// ── Mock Data ────────────────────────────────────────────────────────────────
// Default/demo data has been removed. Real data should be supplied
// via props, context, or fetched from a backend service.
const STATS = [];

const MOCK_USERS = [];

const MOCK_APPROVALS = [];


const TABS = [
  { id: 'overview',  label: 'Overview',  icon: GridIcon },
  { id: 'approvals', label: 'Approvals', icon: CheckCircleIcon },
  { id: 'users',     label: 'Users',     icon: UsersIcon },
  { id: 'vehicles',  label: 'Vehicles',  icon: CarIcon },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace(user.role === 'owner' ? '/dashboard' : '/renter');
    }
  }, [router, user]);

  const toggleProfileMenu = () => setProfileMenuOpen(o => !o);
  const closeProfileMenu = () => setProfileMenuOpen(false);
  const onLogout = () => {
    closeProfileMenu();
    router.replace('/login');
  };
  const onProfile = () => {
    closeProfileMenu();
    router.push('/profile');
  };
  const onEmailLog = () => {
    closeProfileMenu();
    router.push('/email-log');
  };

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

  const ApprovalItem = ({ item }) => (
    <View style={s.listItem}>
      <View style={[s.iconCircle, { backgroundColor: item.type === 'Vehicle' ? '#e0f2fe' : '#fef3c7' }]}>
        <Text style={{ fontSize: 16 }}>{item.type === 'Vehicle' ? '🚗' : '📄'}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={s.itemTitle}>{item.title}</Text>
        <Text style={s.itemSub}>{item.type} • {item.owner}</Text>
        <Text style={s.itemDate}>{item.date}</Text>
        <Text style={s.mobileLimitNote}>Review-only on mobile. Use web app to approve or reject.</Text>
      </View>
      <TouchableOpacity style={s.btnSmOutline} onPress={onEmailLog}>
        <Text style={s.btnSmText}>Open Logs</Text>
      </TouchableOpacity>
    </View>
  );

  const UserItem = ({ item }) => (
    <View style={s.listItem}>
      <View style={[s.avatar, { backgroundColor: item.role === 'Owner' ? C.navy : C.primary }]}>
        <Text style={s.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={s.itemTitle}>{item.name}</Text>
          {item.status === 'banned' && (
            <View style={s.badgeDanger}><Text style={s.badgeTextDanger}>BANNED</Text></View>
          )}
        </View>
        <Text style={s.itemSub}>{item.email}</Text>
        <Text style={s.itemRole}>{item.role}</Text>
      </View>
      <TouchableOpacity style={s.iconBtn}>
        <Text style={{ fontSize: 18, color: C.g400 }}>⋮</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render Content ─────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={s.sectionTitle}>Dashboard Stats</Text>
            <View style={s.statsGrid}>
              {STATS.map((stat, i) => <StatCard key={i} item={stat} />)}
            </View>

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Pending Approvals</Text>
              <TouchableOpacity onPress={() => setActiveTab('approvals')}>
                <Text style={s.linkText}>See All</Text>
              </TouchableOpacity>
            </View>
            {MOCK_APPROVALS.slice(0, 2).map(item => <ApprovalItem key={item.id} item={item} />)}

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recent Users</Text>
              <TouchableOpacity onPress={() => setActiveTab('users')}>
                <Text style={s.linkText}>Manage</Text>
              </TouchableOpacity>
            </View>
            {MOCK_USERS.slice(0, 3).map(item => <UserItem key={item.id} item={item} />)}
          </ScrollView>
        );

      case 'approvals':
        return (
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={s.pageTitle}>Pending Approvals ({MOCK_APPROVALS.length})</Text>
            <Text style={s.pageSub}>Review vehicles and documents.</Text>
            <View style={{ height: 16 }} />
            {MOCK_APPROVALS.map(item => <ApprovalItem key={item.id} item={item} />)}
            {MOCK_APPROVALS.length === 0 && <Text style={s.emptyText}>No pending items.</Text>}
          </ScrollView>
        );

      case 'users':
        const filteredUsers = MOCK_USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
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
              renderItem={({ item }) => <UserItem item={item} />}
              contentContainerStyle={s.listContent}
              ListEmptyComponent={<Text style={s.emptyText}>No users found.</Text>}
            />
          </View>
        );

      case 'vehicles':
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <View style={[s.iconCircle, { width: 60, height: 60, backgroundColor: C.g100, marginBottom: 16 }]}>
              <CarIcon color={C.g400} />
            </View>
            <Text style={s.emptyTitle}>Vehicle Management</Text>
            <Text style={s.emptyText}>This module would contain the full fleet list, status toggles, and edit functions.</Text>
          </View>
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

      {/* ── Tabs ── */}
      <View style={s.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
          {TABS.map(t => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <TouchableOpacity
                key={t.id}
                style={[s.tabItem, isActive && s.tabItemActive]}
                onPress={() => setActiveTab(t.id)}
              >
                <Icon color={isActive ? C.white : C.g500} />
                <Text style={[s.tabText, isActive && s.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.g50 },

  /* Header */
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.g200,
  },
  profileWrapper: {
    position: 'relative',
  },
  profileBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  profileInitials: { color: '#fff', fontWeight: '700' },
  profileMenu: {
    position: 'absolute', top: 44, right: 0,
    backgroundColor: '#fff', borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
    zIndex: 10, width: 120,
  },
  profileMenuItem: { paddingVertical: 8, paddingHorizontal: 12 },
  profileMenuText: { fontSize: 14, color: C.g700 },
  logoutText: { color: C.danger },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.navy },
  headerSub:   { fontSize: 13, color: C.g500 },
  logoutBtn:   { padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 },

  /* Tabs */
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

  /* Content Area */
  contentContainer: { flex: 1 },
  scrollContent:    { padding: 20, paddingBottom: 40 },
  listContent:      { padding: 20, paddingBottom: 40 },

  /* Typography */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: C.navy },
  pageTitle:     { fontSize: 22, fontWeight: '800', color: C.navy, marginBottom: 4 },
  pageSub:       { fontSize: 14, color: C.g500 },
  linkText:      { fontSize: 13, fontWeight: '600', color: C.primary },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: C.g700, marginTop: 12 },
  emptyText:     { fontSize: 14, color: C.g400, textAlign: 'center', marginTop: 4 },

  /* Stats Grid */
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

  /* List Items */
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, padding: 14, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: C.g200,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.white, fontWeight: '700', fontSize: 16 },
  itemTitle:  { fontSize: 14, fontWeight: '700', color: C.g800 },
  itemSub:    { fontSize: 12, color: C.g500, marginTop: 2 },
  mobileLimitNote: { fontSize: 10, color: C.g400, marginTop: 4 },
  itemRole:   { fontSize: 10, fontWeight: '700', color: C.g400, marginTop: 2, textTransform: 'uppercase' },
  itemDate:   { fontSize: 11, color: C.g400, marginTop: 4 },
  iconBtn:    { padding: 8 },

  /* Badges */
  badgeDanger:     { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeTextDanger: { fontSize: 9, fontWeight: '700', color: C.danger },

  /* Buttons */
  btnSmOutline: {
    borderWidth: 1, borderColor: C.g300, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 6, alignItems: 'center',
  },
  btnSmText:      { fontSize: 11, fontWeight: '600', color: C.g600 },

  /* Search */
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, margin: 20, marginBottom: 10,
    paddingHorizontal: 14, borderRadius: 10,
    borderWidth: 1, borderColor: C.g200,
  },
  searchInput: {
    flex: 1, paddingVertical: 12, marginLeft: 8,
    fontSize: 14, color: C.navy,
  },
});