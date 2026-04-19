// components/BottomNav.js
// Owner tabs : Home | Rentals | Add | Log Report
// Renter tabs: Home | Bookings | Log Report
// SVG icons only (Path/Rect/Circle — no Line which is unreliable)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const PRIMARY = '#3F9B84';
const G400    = '#9ca3af';
const WHITE   = '#ffffff';
const DANGER  = '#ef4444';

const IcHome = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <Path d="M9 21V12h6v9" />
  </Svg>
);

const IcRentals = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="8" y="2" width="8" height="4" rx="1" />
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <Path d="M9 12h6M9 16h4" />
  </Svg>
);

const IcBookings = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

const IcLogReport = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6M9 13h6M9 17h4M9 9h1" />
  </Svg>
);

const IcPlus = ({ color = WHITE, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

const IcProfile = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const OWNER_TABS = [
  { key: 'home',      label: 'Home',       Icon: IcHome      },
  { key: 'rentals',   label: 'Rentals',    Icon: IcRentals   },
  { key: 'add',       label: 'Add',        Icon: IcPlus, isFab: true },
  { key: 'logreport', label: 'Log Report', Icon: IcLogReport },
  { key: 'profile',   label: 'Profile',    Icon: IcProfile   },
];

const RENTER_TABS = [
  { key: 'home',      label: 'Home',       Icon: IcHome      },
  { key: 'bookings',  label: 'Bookings',   Icon: IcBookings  },
  { key: 'logreport', label: 'Log Report', Icon: IcLogReport },
  { key: 'profile',   label: 'Profile',    Icon: IcProfile   },
];

export default function BottomNav({ role = 'owner', activeTab, onTabPress, badges = {} }) {
  const tabs = role === 'owner' ? OWNER_TABS : RENTER_TABS;

  return (
    <View style={st.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const badge    = badges[tab.key];

        if (tab.isFab) {
          return (
            <TouchableOpacity key={tab.key} style={st.fabWrap}
              onPress={() => onTabPress(tab.key)} activeOpacity={0.85}>
              <View style={st.fab}><IcPlus color={WHITE} size={24} /></View>
              <Text style={st.fabLabel}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={tab.key} style={st.tabItem}
            onPress={() => onTabPress(tab.key)} activeOpacity={0.7}>
            {isActive && <View style={st.activePill} />}
            <View style={st.iconWrap}>
              <tab.Icon color={isActive ? PRIMARY : G400} size={22} />
              {!!badge && badge > 0 && (
                <View style={st.badge}>
                  <Text style={st.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              )}
            </View>
            <Text style={[st.label, isActive && st.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 10, paddingHorizontal: 4,
    elevation: 16,
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 12, shadowOffset: { width: 0, height: -3 },
    minHeight: Platform.OS === 'ios' ? 82 : 64,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 6, position: 'relative',
  },
  activePill: {
    position: 'absolute', top: 0, width: 32, height: 3,
    borderRadius: 2, backgroundColor: PRIMARY,
  },
  iconWrap:    { position: 'relative', marginBottom: 3 },
  label:       { fontSize: 10, color: G400, fontWeight: '500', textAlign: 'center' },
  labelActive: { color: PRIMARY, fontWeight: '700' },
  badge: {
    position: 'absolute', top: -4, right: -8,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: DANGER, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: WHITE,
  },
  badgeText: { fontSize: 9, color: WHITE, fontWeight: '800' },
  fabWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    marginTop: -22, marginBottom: 2, elevation: 10,
    shadowColor: PRIMARY, shadowOpacity: 0.5,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  fabLabel: { fontSize: 10, color: PRIMARY, fontWeight: '700', textAlign: 'center' },
});