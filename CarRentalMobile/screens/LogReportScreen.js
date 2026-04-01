// screens/LogReportScreen.js
// Full mobile Log Report — owner CRUD + renter read-only
// Matches web spec exactly: check-in/check-out, fuel gauge, damage compare,
// trip summary, signatures, comments, stats bar, search, detail view.

import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StyleSheet, Alert, Platform, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useLogReport } from '../context/LogReportContext';

/* ─── Design tokens ─── */
const C = {
  primary:   '#3F9B84', primaryDk: '#2e7d67', primaryLt: '#ecfdf5',
  navy:      '#1a2c5e',
  danger:    '#ef4444', dangerLt: '#fef2f2',
  warning:   '#f59e0b', warningLt: '#fffbeb',
  success:   '#22c55e', successLt: '#f0fdf4',
  blue:      '#3b82f6', blueLt:   '#eff6ff',
  purple:    '#8b5cf6', purpleLt: '#f5f3ff',
  g50:  '#f9fafb', g100: '#f3f4f6', g200: '#e5e7eb',
  g300: '#d1d5db', g400: '#9ca3af', g500: '#6b7280',
  g700: '#374151', g900: '#111827',
  white: '#ffffff',
};

/* ─── SVG Icons ─── */
const Ic = {
  Search: ({ s = 16, c = C.g400 }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" /><Path d="M21 21l-4.35-4.35" />
    </Svg>
  ),
  Trash: ({ s = 16, c = C.danger }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" /><Path d="M9 6V4h6v2" />
    </Svg>
  ),
  Edit: ({ s = 15, c = C.primary }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  ),
  Back: ({ s = 18, c = C.white }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  ),
  Plus: ({ s = 16, c = C.white }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  Check: ({ s = 14, c = C.white }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 13l4 4L19 7" />
    </Svg>
  ),
  Close: ({ s = 14, c = C.g500 }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  ),
  Send: ({ s = 16, c = C.white }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
    </Svg>
  ),
  Camera: ({ s = 18, c = C.g500 }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  ),
  Car: ({ s = 16, c = C.primary }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <Circle cx="7" cy="17" r="2" /><Path d="M9 17h6" /><Circle cx="17" cy="17" r="2" />
    </Svg>
  ),
};

/* ─── Constants ─── */
const DEFAULT_CHECKLIST = [
  { id: 'exterior_scratches', label: 'Exterior scratches / dents' },
  { id: 'windshield',         label: 'Windshield cracks / chips'  },
  { id: 'tires',              label: 'Tire damage / flat tires'   },
  { id: 'interior',           label: 'Interior damage'            },
  { id: 'missing_parts',      label: 'Missing parts / accessories'},
  { id: 'engine',             label: 'Engine / mechanical issue'  },
  { id: 'lights',             label: 'Lights / signals broken'    },
  { id: 'fuel_low',           label: 'Fuel level low'             },
];

const FUEL_OPTS = ['Full', '3/4', '1/2', '1/4', 'Empty'];
const COND_OPTS = [
  { v: 'Excellent', bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  { v: 'Good',      bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  { v: 'Fair',      bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  { v: 'Poor',      bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
];

const fmtDate     = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString() : '—';

/* ═══════════════════════════════════════════
   SMALL SHARED COMPONENTS
═══════════════════════════════════════════ */

function Pill({ label, bg, color, border }) {
  return (
    <View style={{ backgroundColor: bg, borderColor: border || bg, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color, letterSpacing: 0.4 }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: C.g100, paddingBottom: 6, marginBottom: 12, marginTop: 4 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.g400, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
    </View>
  );
}

/* ─── Fuel Gauge Bar ─── */
function FuelGauge({ level }) {
  if (!level) return null;
  const idx = FUEL_OPTS.indexOf(level);
  if (idx < 0) return null;
  const pct = [1, 0.75, 0.5, 0.25, 0.05][idx];
  const color = pct >= 0.5 ? C.success : pct >= 0.25 ? C.warning : C.danger;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: C.g500 }}>Fuel Level</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color }}>{level}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: C.g200, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${pct * 100}%`, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

/* ─── Condition Badge ─── */
function CondBadge({ value }) {
  const opt = COND_OPTS.find(o => o.v === value);
  if (!opt) return null;
  return <Pill label={value} bg={opt.bg} color={opt.color} border={opt.border} />;
}

/* ─── Stats Bar ─── */
function StatsBar({ reports }) {
  const complete = reports.filter(r => !!r.checkout).length;
  const awaiting = reports.filter(r => !r.checkout).length;
  const newDmg   = reports.filter(r => {
    if (!r.checkout) return false;
    const ci = r.issues || [], co = r.checkout.issues || [];
    return co.some(i => !ci.includes(i));
  }).length;
  const stats = [
    { label: 'Total',           value: reports.length, color: C.primary },
    { label: 'Trips Complete',  value: complete,        color: C.blue    },
    { label: 'Awaiting C/O',    value: awaiting,        color: C.warning },
    { label: 'New Damage',      value: newDmg,          color: C.danger  },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
      {stats.map(s => (
        <View key={s.label} style={{ flex: 1, backgroundColor: C.white, borderRadius: 10, padding: 9, borderLeftWidth: 3, borderLeftColor: s.color, elevation: 2 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.value}</Text>
          <Text style={{ fontSize: 9, color: C.g500, fontWeight: '500', marginTop: 2, lineHeight: 12 }}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ═══════════════════════════════════════════
   CHECKLIST EDITOR
═══════════════════════════════════════════ */
function ChecklistEditor({ issues, onChange, isCheckout = false, checkinIssues = [] }) {
  const [customInput, setCustomInput] = useState('');
  const [customItems, setCustomItems] = useState([]);
  const allItems = [...DEFAULT_CHECKLIST, ...customItems];

  const toggle = id => {
    issues.includes(id) ? onChange(issues.filter(i => i !== id)) : onChange([...issues, id]);
  };
  const addCustom = () => {
    const t = customInput.trim(); if (!t) return;
    const id = `custom_${Date.now()}`;
    setCustomItems(prev => [...prev, { id, label: t }]);
    onChange([...issues, id]);
    setCustomInput('');
  };
  const removeCustom = id => {
    setCustomItems(prev => prev.filter(c => c.id !== id));
    onChange(issues.filter(i => i !== id));
  };

  return (
    <View style={{ marginBottom: 18 }}>
      <SectionHeader title="Condition Checklist" />
      {allItems.map(item => {
        const checked  = issues.includes(item.id);
        const isNew    = isCheckout && checked && !checkinIssues.includes(item.id);
        const isCustom = !DEFAULT_CHECKLIST.find(d => d.id === item.id);
        return (
          <TouchableOpacity key={item.id} onPress={() => toggle(item.id)}
            style={[st.checkRow, checked && st.checkRowActive, isNew && st.checkRowNew]}>
            <View style={[st.checkBox, checked && st.checkBoxActive]}>
              {checked && <Ic.Check s={10} c={C.white} />}
            </View>
            <Text style={[st.checkLabel, checked && { color: C.primaryDk, fontWeight: '600' }]}>{item.label}</Text>
            {isNew && <View style={st.newBadge}><Text style={st.newBadgeText}>NEW</Text></View>}
            {isCustom && (
              <TouchableOpacity onPress={() => removeCustom(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ic.Close s={13} c={C.danger} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <TextInput
          style={[st.input, { flex: 1, marginBottom: 0, paddingVertical: 10 }]}
          placeholder="Add custom issue…"
          value={customInput}
          onChangeText={setCustomInput}
          onSubmitEditing={addCustom}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addCustom} style={[st.btnPrimary, { paddingHorizontal: 16, paddingVertical: 10 }]}>
          <Text style={st.btnPrimaryText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   REPORT FORM  (check-in OR check-out)
═══════════════════════════════════════════ */
function ReportForm({ initial = {}, onSave, onCancel, isCheckout = false, checkinIssues = [], rental = {} }) {
  const [odometer,   setOdometer]   = useState(String(initial.odometer   || ''));
  const [fuel,       setFuel]       = useState(initial.fuel       || '');
  const [condition,  setCondition]  = useState(initial.condition  || '');
  const [issues,     setIssues]     = useState(initial.issues     || []);
  const [notes,      setNotes]      = useState(initial.notes      || '');
  const [photos,     setPhotos]     = useState(initial.photos     || []);
  const [dmgCost,    setDmgCost]    = useState(String(initial.damageCost || ''));

  const newIssues = isCheckout ? issues.filter(i => !checkinIssues.includes(i)) : [];

  const doSave = () => {
    Alert.alert(
      'Save Record',
      'Are you sure you want to save this condition record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save', onPress: () => onSave({
            odometer: parseFloat(odometer) || 0,
            fuel, condition, issues, notes, photos,
            damageCost: isCheckout ? (parseFloat(dmgCost) || 0) : 0,
          }),
        },
      ]
    );
  };

  const doCancel = () => {
    Alert.alert('Discard Changes?', 'Go back without saving? Your changes will be lost.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onCancel },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled">

      {/* Rental info banner */}
      <RentalBanner rental={rental} />

      {/* New issues warning */}
      {isCheckout && newIssues.length > 0 && (
        <View style={st.dmgWarning}>
          <Text style={st.dmgWarningText}>{newIssues.length} new issue{newIssues.length > 1 ? 's' : ''} found at check-out</Text>
        </View>
      )}

      {/* 1 — Vehicle Data */}
      <View style={{ marginBottom: 18 }}>
        <SectionHeader title="Vehicle Data" />
        <Text style={st.fieldLabel}>Odometer (km)</Text>
        <TextInput
          style={st.input}
          keyboardType="numeric"
          placeholder="e.g. 45200"
          value={odometer}
          onChangeText={setOdometer}
        />
        <Text style={[st.fieldLabel, { marginTop: 10 }]}>Fuel Level</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FUEL_OPTS.map(f => (
            <TouchableOpacity key={f} onPress={() => setFuel(fuel === f ? '' : f)}
              style={[st.pillBtn, fuel === f && st.pillBtnActive]}>
              <Text style={[st.pillBtnText, fuel === f && st.pillBtnTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FuelGauge level={fuel} />
      </View>

      {/* 2 — Overall Condition */}
      <View style={{ marginBottom: 18 }}>
        <SectionHeader title="Overall Condition" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COND_OPTS.map(o => (
            <TouchableOpacity key={o.v} onPress={() => setCondition(condition === o.v ? '' : o.v)}
              style={[st.condBtn, { borderColor: o.border, backgroundColor: condition === o.v ? o.bg : C.white }]}>
              <Text style={[st.condBtnText, { color: condition === o.v ? o.color : C.g500 }]}>{o.v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3 — Checklist */}
      <ChecklistEditor
        issues={issues}
        onChange={setIssues}
        isCheckout={isCheckout}
        checkinIssues={checkinIssues}
      />

      {/* 4 — Notes */}
      <View style={{ marginBottom: 18 }}>
        <SectionHeader title="Notes" />
        <TextInput
          style={[st.input, { height: 90, textAlignVertical: 'top' }]}
          multiline
          placeholder="Any additional observations…"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* 5 — Damage cost (checkout only) */}
      {isCheckout && (
        <View style={{ marginBottom: 18 }}>
          <SectionHeader title="Damage Assessment" />
          <Text style={st.fieldLabel}>Estimated Damage Cost (₱)</Text>
          <TextInput
            style={st.input}
            keyboardType="numeric"
            placeholder="0"
            value={dmgCost}
            onChangeText={setDmgCost}
          />
        </View>
      )}

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <TouchableOpacity onPress={doCancel} style={[st.btnSecondary, { flex: 1 }]}>
          <Text style={st.btnSecondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={doSave} style={[st.btnPrimary, { flex: 2 }]}>
          <Text style={st.btnPrimaryText}>Save Record</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ─── Rental Info Banner ─── */
function RentalBanner({ rental }) {
  if (!rental || !rental.vehicleName) return null;
  return (
    <View style={st.rentalBanner}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Ic.Car s={14} c={C.primary} />
        <Text style={{ fontSize: 14, fontWeight: '800', color: C.navy }}>{rental.vehicleName}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {rental.renterName  && <Text style={st.bannerMeta}>Renter: <Text style={{ color: C.g900, fontWeight: '600' }}>{rental.renterName}</Text></Text>}
        {rental.startDate   && <Text style={st.bannerMeta}>{fmtDate(rental.startDate)} – {fmtDate(rental.endDate)}</Text>}
        {rental.pricePerDay && <Text style={st.bannerMeta}>₱{parseFloat(rental.pricePerDay).toLocaleString()}/day</Text>}
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   TRIP SUMMARY CARD
═══════════════════════════════════════════ */
function TripSummary({ report }) {
  const { checkin, checkout, rental } = report;
  if (!checkin || !checkout) return null;

  const start = rental?.startDate ? new Date(rental.startDate) : null;
  const end   = rental?.endDate   ? new Date(rental.endDate)   : null;
  const days  = (start && end) ? Math.max(1, Math.ceil((end - start) / 86400000)) : null;
  const rate  = parseFloat(rental?.pricePerDay) || 0;
  const rev   = days ? days * rate : null;
  const kmDriven = (checkout.odometer > checkin.odometer) ? checkout.odometer - checkin.odometer : null;

  const ciIssues = checkin.issues  || [];
  const coIssues = checkout.issues || [];
  const newDmg   = coIssues.filter(i => !ciIssues.includes(i));

  let statusLabel = 'Clean Return';
  let statusBg    = C.successLt;
  let statusColor = C.success;
  if (newDmg.length > 0)         { statusLabel = 'Damage Reported'; statusBg = C.dangerLt;  statusColor = C.danger;  }
  else if (coIssues.length > 0)  { statusLabel = 'Minor Issues';    statusBg = C.warningLt; statusColor = C.warning; }

  return (
    <View style={st.tripCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.navy }}>Trip Summary</Text>
        <View style={{ backgroundColor: statusBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor }}>{statusLabel}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {days     != null && <MetricBox label="Days Rented"  value={String(days)}                              />}
        {rev      != null && <MetricBox label="Revenue"      value={`₱${rev.toLocaleString()}`}                />}
        {kmDriven != null && <MetricBox label="km Driven"    value={`${kmDriven.toLocaleString()} km`}         />}
        <MetricBox label="New Issues" value={String(newDmg.length)} danger={newDmg.length > 0} />
        {checkout.damageCost > 0 && <MetricBox label="Damage Est." value={`₱${checkout.damageCost.toLocaleString()}`} danger />}
      </View>
      {checkout.damageCost > 0 && (
        <View style={[st.dmgWarning, { marginTop: 12 }]}>
          <Text style={st.dmgWarningText}>Damage estimated at ₱{checkout.damageCost.toLocaleString()}</Text>
        </View>
      )}
    </View>
  );
}

function MetricBox({ label, value, danger = false }) {
  return (
    <View style={{ backgroundColor: C.g50, borderRadius: 8, padding: 10, minWidth: 80, borderWidth: 1, borderColor: danger ? C.danger + '30' : C.g200 }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: danger ? C.danger : C.navy }}>{value}</Text>
      <Text style={{ fontSize: 10, color: C.g500, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════
   CONDITION COLUMN (before / after)
═══════════════════════════════════════════ */
function ConditionColumn({ title, data, newIssues = [], onEdit, isOwner }) {
  if (!data) return (
    <View style={[st.condCol, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: C.g400, fontSize: 13, fontStyle: 'italic' }}>No data</Text>
    </View>
  );
  return (
    <View style={st.condCol}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: C.navy }}>{title}</Text>
        {isOwner && onEdit && (
          <TouchableOpacity onPress={onEdit} style={st.editBtn}>
            <Ic.Edit s={13} c={C.primary} />
            <Text style={{ fontSize: 11, color: C.primary, fontWeight: '600', marginLeft: 3 }}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={st.miniField}>
        <Text style={st.miniLabel}>Odometer</Text>
        <Text style={st.miniVal}>{data.odometer ? `${data.odometer.toLocaleString()} km` : '—'}</Text>
      </View>
      <View style={st.miniField}>
        <Text style={st.miniLabel}>Fuel</Text>
        <Text style={st.miniVal}>{data.fuel || '—'}</Text>
        <FuelGauge level={data.fuel} />
      </View>
      {data.condition && (
        <View style={[st.miniField, { alignItems: 'flex-start' }]}>
          <Text style={st.miniLabel}>Condition</Text>
          <CondBadge value={data.condition} />
        </View>
      )}
      {data.issues && data.issues.length > 0 && (
        <View style={st.miniField}>
          <Text style={st.miniLabel}>Issues</Text>
          {data.issues.map(id => {
            const item = DEFAULT_CHECKLIST.find(d => d.id === id);
            const label = item ? item.label : id;
            const isNew = newIssues.includes(id);
            return (
              <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isNew ? C.danger : C.g400 }} />
                <Text style={{ fontSize: 12, color: isNew ? C.danger : C.g700, flex: 1 }}>{label}</Text>
                {isNew && <View style={st.newBadge}><Text style={st.newBadgeText}>NEW</Text></View>}
              </View>
            );
          })}
        </View>
      )}
      {!!data.notes && (
        <View style={st.miniField}>
          <Text style={st.miniLabel}>Notes</Text>
          <Text style={{ fontSize: 12, color: C.g700, lineHeight: 18 }}>{data.notes}</Text>
        </View>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════
   SIGNATURES
═══════════════════════════════════════════ */
function SignaturesSection({ report, onUpdate, isOwner }) {
  const [editing,   setEditing]   = useState(false);
  const [ownerSig,  setOwnerSig]  = useState(report.ownerSignature  || '');
  const [renterSig, setRenterSig] = useState(report.renterSignature || '');

  const doSave = () => {
    Alert.alert('Save Signatures?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save', onPress: () => {
          onUpdate({
            ownerSignature:  { name: ownerSig,  signedAt: new Date().toISOString() },
            renterSignature: { name: renterSig, signedAt: new Date().toISOString() },
          });
          setEditing(false);
        },
      },
    ]);
  };

  const doCancel = () => {
    Alert.alert('Discard Changes?', '', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => { setEditing(false); } },
    ]);
  };

  return (
    <View style={st.sigSection}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.navy }}>Signatures</Text>
        {isOwner && !editing && (
          <TouchableOpacity onPress={() => setEditing(true)} style={st.editBtn}>
            <Ic.Edit s={13} c={C.primary} />
            <Text style={{ fontSize: 11, color: C.primary, fontWeight: '600', marginLeft: 3 }}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <>
          <Text style={st.fieldLabel}>Owner Signature</Text>
          <TextInput style={[st.input, { marginBottom: 12 }]} value={ownerSig} onChangeText={setOwnerSig} placeholder="Type name to sign…" />
          <Text style={st.fieldLabel}>Renter Acknowledgement</Text>
          <TextInput style={[st.input, { marginBottom: 16 }]} value={renterSig} onChangeText={setRenterSig} placeholder="Type name to sign…" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={doCancel} style={[st.btnSecondary, { flex: 1 }]}>
              <Text style={st.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={doSave} style={[st.btnPrimary, { flex: 1 }]}>
              <Text style={st.btnPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SigBox label="Owner Signature" sig={report.ownerSignature} />
          <SigBox label="Renter Acknowledgement" sig={report.renterSignature} />
        </View>
      )}
    </View>
  );
}

function SigBox({ label, sig }) {
  return (
    <View style={[st.sigBox, { flex: 1 }]}>
      <Text style={st.miniLabel}>{label}</Text>
      {sig?.name ? (
        <>
          <Text style={{ fontSize: 14, color: C.navy, fontStyle: 'italic', fontWeight: '600', marginTop: 4 }}>{sig.name}</Text>
          <Text style={{ fontSize: 10, color: C.g400, marginTop: 3 }}>{fmtDateTime(sig.signedAt)}</Text>
        </>
      ) : (
        <Text style={{ fontSize: 12, color: C.g300, fontStyle: 'italic', marginTop: 4 }}>Not signed</Text>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════
   COMMENTS
═══════════════════════════════════════════ */
function CommentsSection({ report, onAddComment, currentUser }) {
  const [text, setText] = useState('');
  const comments = report.comments || [];

  const doSend = () => {
    const t = text.trim(); if (!t) return;
    onAddComment(report.id, { text: t, authorName: currentUser.fullName || currentUser.firstName, authorRole: currentUser.role });
    setText('');
  };

  return (
    <View style={st.commSection}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: C.navy, marginBottom: 12 }}>Comments</Text>
      {comments.length === 0 ? (
        <Text style={{ fontSize: 13, color: C.g400, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 }}>No comments yet.</Text>
      ) : (
        comments.map((c, i) => (
          <View key={c.id || i} style={[st.commentCard, { borderLeftColor: c.authorRole === 'owner' ? C.primary : C.purple }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.g900 }}>{c.authorName}</Text>
              <View style={{ backgroundColor: c.authorRole === 'owner' ? C.primaryLt : C.purpleLt, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: c.authorRole === 'owner' ? C.primary : C.purple }}>
                  {c.authorRole === 'owner' ? 'Owner' : 'Renter'}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: C.g400, marginLeft: 'auto' }}>{fmtDateTime(c.createdAt)}</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.g700, lineHeight: 19 }}>{c.text}</Text>
          </View>
        ))
      )}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <TextInput
          style={[st.input, { flex: 1, marginBottom: 0, paddingVertical: 10 }]}
          placeholder="Write a comment…"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          onPress={doSend}
          disabled={!text.trim()}
          style={[st.btnPrimary, { paddingHorizontal: 14, paddingVertical: 10, opacity: text.trim() ? 1 : 0.4 }]}>
          <Ic.Send s={16} c={C.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   DETAIL VIEW
═══════════════════════════════════════════ */
function DetailView({ report, onBack, onUpdateReport, isOwner, currentUser, onAddComment }) {
  const [view, setView] = useState('detail'); // detail | editCI | editCO | addCO

  const ciIssues = report.checkin?.issues  || [];
  const coIssues = report.checkout?.issues || [];
  const newIssues = report.checkout ? coIssues.filter(i => !ciIssues.includes(i)) : [];

  if (view === 'editCI') {
    return (
      <View style={{ flex: 1 }}>
        <View style={st.subHeader}>
          <Text style={st.subHeaderTitle}>Edit Check-in</Text>
        </View>
        <ReportForm
          initial={report.checkin}
          rental={report.rental}
          onSave={data => { onUpdateReport(report.id, { checkin: { ...report.checkin, ...data } }); setView('detail'); }}
          onCancel={() => setView('detail')}
        />
      </View>
    );
  }
  if (view === 'addCO' || view === 'editCO') {
    return (
      <View style={{ flex: 1 }}>
        <View style={st.subHeader}>
          <Text style={st.subHeaderTitle}>{view === 'addCO' ? 'Add Check-out' : 'Edit Check-out'}</Text>
        </View>
        <ReportForm
          initial={view === 'editCO' ? report.checkout : {}}
          rental={report.rental}
          isCheckout
          checkinIssues={ciIssues}
          onSave={data => { onUpdateReport(report.id, { checkout: { ...data } }); setView('detail'); }}
          onCancel={() => setView('detail')}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={[st.subHeader, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ic.Back s={18} c={C.white} />
        </TouchableOpacity>
        <Text style={[st.subHeaderTitle, { flex: 1 }]}>Log Report Detail</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <RentalBanner rental={report.rental} />
        <TripSummary report={report} />

        {report.checkout ? (
          <>
            <Text style={{ fontSize: 12, fontWeight: '800', color: C.g500, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 }}>Condition Comparison</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ConditionColumn title="Before Trip" data={report.checkin} onEdit={isOwner ? () => setView('editCI') : null} isOwner={isOwner} />
              <ConditionColumn title="After Trip"  data={report.checkout} newIssues={newIssues} onEdit={isOwner ? () => setView('editCO') : null} isOwner={isOwner} />
            </View>
          </>
        ) : (
          <>
            <View style={st.pendingNotice}>
              <Text style={{ fontSize: 13, color: '#92400e', fontWeight: '600', textAlign: 'center' }}>
                No check-out report yet.{'\n'}Add one when the vehicle is returned.
              </Text>
            </View>
            {isOwner && (
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setView('editCI')} style={[st.btnSecondary, { flex: 1 }]}>
                  <Text style={st.btnSecondaryText}>Edit Check-in</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setView('addCO')} style={[st.btnPrimary, { flex: 1 }]}>
                  <Text style={st.btnPrimaryText}>Add Check-out</Text>
                </TouchableOpacity>
              </View>
            )}
            {report.checkin && (
              <ConditionColumn title="Check-in Record" data={report.checkin} onEdit={isOwner ? () => setView('editCI') : null} isOwner={isOwner} />
            )}
          </>
        )}

        <SignaturesSection report={report} isOwner={isOwner} onUpdate={updates => onUpdateReport(report.id, updates)} />
        <CommentsSection   report={report} onAddComment={onAddComment} currentUser={currentUser} />
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════
   NEW ENTRY FORM
═══════════════════════════════════════════ */
function NewEntryForm({ rental, onSave, onCancel }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={st.subHeader}>
        <Text style={st.subHeaderTitle}>New Check-in Record</Text>
      </View>
      <ReportForm
        initial={{}}
        rental={rental}
        onSave={data => onSave({ rental, checkin: data })}
        onCancel={onCancel}
      />
    </View>
  );
}

/* ═══════════════════════════════════════════
   MAIN LIST VIEW
   Props:
     hideHeader       — boolean, hides the internal navy header when true
                        (used when embedded inside RenterDashboardScreen
                        which already renders its own header)
     pendingRental    — rental object to pre-open as a new entry
     onClearPendingRental — callback to clear the pending rental
═══════════════════════════════════════════ */
export default function LogReportScreen({ hideHeader = false, pendingRental, onClearPendingRental }) {
  const { user }                                                        = useAuth();
  const { reports, addReport, updateReport, deleteReport, addComment } = useLogReport();

  const isOwner  = user?.role === 'owner';
  const isRenter = user?.role === 'renter';

  const [search,   setSearch]   = useState('');
  const [reportFilter, setReportFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [newEntry, setNewEntry] = useState(null);

  React.useEffect(() => {
    if (pendingRental) {
      setNewEntry(pendingRental);
      onClearPendingRental?.();
    }
  }, [pendingRental]);

  const myReports = useMemo(() => {
    if (isOwner)  return reports;
    if (isRenter) return reports.filter(r => r.rental?.renterId === user?.id);
    return [];
  }, [reports, user]);

  const searchedReports = useMemo(() => {
    if (!search.trim()) return myReports;
    const q = search.toLowerCase();
    return myReports.filter(r =>
      r.rental?.vehicleName?.toLowerCase().includes(q) ||
      r.rental?.renterName?.toLowerCase().includes(q)
    );
  }, [myReports, search]);

  const filtered = useMemo(() => {
    if (reportFilter === 'all') return searchedReports;
    if (reportFilter === 'awaiting') return searchedReports.filter(r => !r.checkout);
    if (reportFilter === 'complete') return searchedReports.filter(r => !!r.checkout);
    if (reportFilter === 'damaged') {
      return searchedReports.filter(r => {
        if (!r.checkout) return false;
        const ci = r.checkin?.issues || [];
        const co = r.checkout?.issues || [];
        return co.some(i => !ci.includes(i));
      });
    }
    if (reportFilter === 'commented') return searchedReports.filter(r => (r.comments || []).length > 0);
    return searchedReports;
  }, [searchedReports, reportFilter]);

  const handleNewSave = async ({ rental, checkin }) => {
    await addReport({ rental, checkin, checkout: null, comments: [] });
    setNewEntry(null);
  };

  const handleUpdateReport = async (id, updates) => {
    await updateReport(id, updates);
    setSelected(prev => prev ? { ...prev, ...updates } : prev);
  };

  const handleDelete = id => {
    Alert.alert('Delete Entry?', 'This will permanently remove the log entry.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteReport(id); setSelected(null); } },
    ]);
  };

  /* ── Sub-views (always rendered without outer header) ── */
  if (newEntry) {
    return (
      <NewEntryForm
        rental={newEntry}
        onSave={handleNewSave}
        onCancel={() => setNewEntry(null)}
      />
    );
  }

  if (selected) {
    const fresh = reports.find(r => r.id === selected.id) || selected;
    return (
      <DetailView
        report={fresh}
        onBack={() => setSelected(null)}
        onUpdateReport={handleUpdateReport}
        onAddComment={addComment}
        isOwner={isOwner}
        currentUser={user}
      />
    );
  }

  /* ── Main list ── */
  const listContent = (
    <>
      {/* Internal header — hidden when dashboard provides its own */}
      {!hideHeader && (
        <View style={st.header}>
          <Text style={st.headerTitle}>Log Report</Text>
          <Text style={st.headerSub}>
            {isOwner ? 'Vehicle condition records' : 'Your rental condition reports'}
          </Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <StatsBar reports={myReports} />

        <View style={st.searchWrap}>
          <Ic.Search s={15} c={C.g400} />
          <TextInput
            style={st.searchInput}
            placeholder="Search by vehicle or renter…"
            placeholderTextColor={C.g400}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={st.filterRow}>
            {[
              { key: 'all',      label: 'All' },
              { key: 'awaiting', label: 'Awaiting C/O' },
              { key: 'complete', label: 'Complete' },
              { key: 'damaged',  label: 'Damaged' },
              { key: 'commented', label: 'Commented' },
            ].map(item => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setReportFilter(item.key)}
                style={[st.filterPill, reportFilter === item.key && st.filterPillActive]}
              >
                <Text style={[st.filterPillText, reportFilter === item.key && st.filterPillTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {filtered.length === 0 ? (
          <View style={st.emptyBox}>
            <Text style={st.emptyTitle}>No log entries yet</Text>
            <Text style={st.emptySub}>
              {isOwner
                ? 'Go to Rentals, open an approved rental and tap "Record to Log Report".'
                : 'Your rental condition reports will appear here.'}
            </Text>
          </View>
        ) : (
          [...filtered].reverse().map(r => {
            const ciIssues = r.checkin?.issues  || [];
            const coIssues = r.checkout?.issues || [];
            const newDmg   = r.checkout ? coIssues.filter(i => !ciIssues.includes(i)) : [];
            const comments = r.comments || [];
            const condOpt  = COND_OPTS.find(o => o.v === r.checkin?.condition);
            return (
              <TouchableOpacity key={r.id} onPress={() => setSelected(r)} style={st.logCard} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 7 }}>
                    <Pill label="Check-in" bg="rgba(16,185,129,.1)" color="#059669" border="rgba(16,185,129,.25)" />
                    {r.checkout
                      ? <Pill label="Trip Complete"       bg={C.primary + '14'} color={C.primary}  border={C.primary + '35'} />
                      : <Pill label="Awaiting Check-out"  bg="rgba(245,158,11,.1)" color="#b45309" border="rgba(245,158,11,.3)" />
                    }
                    {condOpt && <Pill label={r.checkin.condition} bg={condOpt.bg} color={condOpt.color} border={condOpt.border} />}
                    {newDmg.length > 0 && <Pill label={`${newDmg.length} New Damage`} bg="#fef2f2" color="#991b1b" border="#fca5a5" />}
                    {comments.length > 0 && (
                      <View style={{ backgroundColor: C.purpleLt, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.purple + '40' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: C.purple }}>{comments.length} Comment{comments.length > 1 ? 's' : ''}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 4 }}>{r.rental?.vehicleName || 'Vehicle'}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <Text style={{ fontSize: 12, color: C.g500 }}>{fmtDate(r.checkin?.createdAt || r.createdAt)}</Text>
                    {ciIssues.length > 0
                      ? <Text style={{ fontSize: 12, color: '#b45309', fontWeight: '600' }}>{ciIssues.length} issue{ciIssues.length > 1 ? 's' : ''}</Text>
                      : <Text style={{ fontSize: 12, color: C.success, fontWeight: '600' }}>Clean check-in</Text>}
                    {r.rental?.renterName && <Text style={{ fontSize: 12, color: C.g500 }}>{r.rental.renterName}</Text>}
                    {r.checkout?.damageCost > 0 && (
                      <Text style={{ fontSize: 12, color: C.danger, fontWeight: '700' }}>₱{r.checkout.damageCost.toLocaleString()} est.</Text>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {isOwner && (
                    <TouchableOpacity onPress={() => handleDelete(r.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ic.Trash s={16} c={C.danger} />
                    </TouchableOpacity>
                  )}
                  <Text style={{ fontSize: 20, color: C.g400 }}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </>
  );

  /* When embedded in the dashboard, skip SafeAreaView + StatusBar */
  if (hideHeader) {
    return <View style={{ flex: 1, backgroundColor: C.g50 }}>{listContent}</View>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.g50 }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      {listContent}
    </SafeAreaView>
  );
}

/* ─── Styles ─── */
const st = StyleSheet.create({
  header: {
    backgroundColor: C.navy,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 2 },
  subHeader: {
    backgroundColor: C.navy,
    paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20,
  },
  subHeaderTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  backBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white, borderRadius: 10,
    borderWidth: 1, borderColor: C.g200,
    paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.g900 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: C.g200, backgroundColor: C.white },
  filterPillActive: { borderColor: C.primary, backgroundColor: C.primaryLt },
  filterPillText: { fontSize: 12, color: C.g500, fontWeight: '600' },
  filterPillTextActive: { color: C.primaryDk },
  logCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: C.g200, elevation: 2,
  },
  emptyBox: {
    alignItems: 'center', padding: 48,
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderStyle: 'dashed', borderColor: C.g200,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.g700, marginBottom: 8 },
  emptySub:   { fontSize: 13, color: C.g400, textAlign: 'center', lineHeight: 20 },
  rentalBanner: {
    backgroundColor: C.primaryLt, borderRadius: 12,
    borderWidth: 1, borderColor: C.primary + '30',
    padding: 14, marginBottom: 14,
  },
  bannerMeta: { fontSize: 12, color: C.g500 },
  tripCard: {
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.g200,
    padding: 14, marginBottom: 14, elevation: 2,
  },
  pendingNotice: {
    backgroundColor: C.warningLt, borderRadius: 10,
    borderWidth: 1, borderColor: '#fde68a',
    padding: 14, marginBottom: 14,
    borderStyle: 'dashed',
  },
  condCol: {
    flex: 1, backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.g200, padding: 12, marginBottom: 14,
  },
  miniField: { marginBottom: 10 },
  miniLabel: { fontSize: 10, fontWeight: '700', color: C.g400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  miniVal:   { fontSize: 13, fontWeight: '600', color: C.g900 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.primaryLt, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: C.primary + '30',
  },
  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, borderWidth: 1, borderColor: C.g200,
    borderRadius: 8, marginBottom: 6, backgroundColor: C.g50,
    gap: 10,
  },
  checkRowActive: { borderColor: C.primary + '55', backgroundColor: C.primary + '08' },
  checkRowNew:    { borderColor: C.danger + '55',   backgroundColor: '#fef2f2' },
  checkBox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: C.g300,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkBoxActive: { backgroundColor: C.primary, borderColor: C.primary },
  checkLabel: { flex: 1, fontSize: 13, color: C.g700 },
  newBadge: {
    backgroundColor: C.danger, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  newBadgeText: { fontSize: 9, fontWeight: '800', color: C.white },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: C.g400, marginBottom: 6 },
  input: {
    padding: 12, borderWidth: 1.5, borderColor: C.g200,
    borderRadius: 10, fontSize: 14, color: C.g900,
    backgroundColor: C.white, marginBottom: 4,
  },
  pillBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1.5, borderColor: C.g200, backgroundColor: C.white,
  },
  pillBtnActive:     { borderColor: C.primary, backgroundColor: C.primaryLt },
  pillBtnText:       { fontSize: 13, fontWeight: '600', color: C.g500 },
  pillBtnTextActive: { color: C.primary },
  condBtn: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    borderWidth: 1.5,
  },
  condBtnText: { fontSize: 13, fontWeight: '600' },
  dmgWarning: {
    backgroundColor: '#fef2f2', borderRadius: 10,
    borderWidth: 1, borderColor: '#fecaca',
    padding: 12, marginBottom: 14,
  },
  dmgWarningText: { fontSize: 13, fontWeight: '700', color: C.danger, textAlign: 'center' },
  btnPrimary: {
    backgroundColor: C.primary, borderRadius: 10,
    paddingVertical: 13, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },
  btnPrimaryText: { color: C.white, fontSize: 14, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: C.g100, borderRadius: 10,
    paddingVertical: 13, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.g200,
  },
  btnSecondaryText: { color: C.g700, fontSize: 14, fontWeight: '600' },
  sigSection: {
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.g200,
    padding: 14, marginBottom: 14,
  },
  sigBox: {
    backgroundColor: C.g50, borderRadius: 10,
    borderWidth: 1, borderColor: C.g200,
    padding: 12, borderTopWidth: 3, borderTopColor: C.primary,
  },
  commSection: {
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.g200,
    padding: 14, marginBottom: 14,
  },
  commentCard: {
    borderLeftWidth: 3, borderRadius: 8,
    backgroundColor: C.g50, padding: 12,
    marginBottom: 10,
  },
});