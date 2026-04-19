import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Lightweight calendar picker — no native deps
// Props:
// - visible: boolean
// - initialDate: Date
// - onClose: () => void
// - onSelect: (Date) => void
export default function CalendarPicker({ visible, initialDate, onClose, onSelect }) {
  const today = new Date();
  const start = initialDate ? new Date(initialDate) : today;
  const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const [monthDate, setMonthDate] = useState(monthStart);

  // Use a stable primitive (monthKey) in the dependency array to avoid
  // triggering the effect on every render when a new Date object is passed.
  const monthKey = `${start.getFullYear()}-${start.getMonth()}`;
  React.useEffect && React.useEffect(() => {
    if (visible) setMonthDate(new Date(start.getFullYear(), start.getMonth(), 1));
  }, [visible, monthKey]);

  const monthLabel = useMemo(() => {
    return monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [monthDate]);

  const days = useMemo(() => {
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    return cells;
  }, [monthDate]);

  const prev = () => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1));
  const next = () => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1));

  const handleSelect = (d) => {
    onSelect && onSelect(d);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{monthLabel}</Text>
            <View style={styles.controls}>
              <TouchableOpacity onPress={prev} style={styles.ctrlBtn}><Text style={styles.ctrlText}>◀</Text></TouchableOpacity>
              <TouchableOpacity onPress={next} style={styles.ctrlBtn}><Text style={styles.ctrlText}>▶</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.weekRow}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.weekLabel}>{d}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((cell, idx) => {
              if (!cell) return <View key={idx} style={styles.cell} />;
              const isToday = cell.toDateString() === new Date().toDateString();
              return (
                <TouchableOpacity key={idx} onPress={() => handleSelect(cell)} style={styles.cell}>
                  <View style={[styles.dayWrap, isToday && styles.todayWrap]}>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>{cell.getDate()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => onClose && onClose()} style={styles.actionBtn}><Text style={styles.actionText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleSelect(new Date())} style={[styles.actionBtn, styles.todayBtn]}><Text style={[styles.actionText, styles.todayBtnText]}>Today</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  card: { width: 320, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  controls: { flexDirection: 'row', gap: 6 },
  ctrlBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  ctrlText: { fontSize: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, marginBottom: 6 },
  weekLabel: { width: 36, textAlign: 'center', color: '#6b7280', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', margin: 2 },
  dayWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  todayWrap: { backgroundColor: '#e6f4ea' },
  dayText: { color: '#111827' },
  todayText: { color: '#065f46', fontWeight: '800' },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  actionText: { color: '#6b7280', fontWeight: '700' },
  todayBtn: { backgroundColor: '#3F9B84', borderRadius: 8 },
  todayBtnText: { color: '#fff' },
});
