// context/LogReportContext.js
// Provides log report CRUD for owners and renters.
// Uses @react-native-async-storage/async-storage for persistence.
// Run: npx expo install @react-native-async-storage/async-storage

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

let AsyncStorage = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (_) {
  // Package not yet installed — data will not persist between app restarts.
  // Fix: run  npx expo install @react-native-async-storage/async-storage
  console.warn('[LogReportContext] AsyncStorage not available. Data will not persist.');
}

const LOG_KEY = 'logReports';

/* ─── Context ─── */
const LogReportContext = createContext(null);

export function LogReportProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Load persisted reports on mount */
  useEffect(() => {
    (async () => {
      try {
        if (AsyncStorage) {
          const raw = await AsyncStorage.getItem(LOG_KEY);
          if (raw) setReports(JSON.parse(raw));
        }
      } catch (e) {
        console.warn('[LogReportContext] load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Persist helper */
  const persist = useCallback(async (next) => {
    setReports(next);
    try {
      if (AsyncStorage) await AsyncStorage.setItem(LOG_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('[LogReportContext] persist error', e);
    }
  }, []);

  /* ── CRUD ── */

  /** Create a new check-in report */
  const addReport = useCallback(async (report) => {
    const newReport = {
      ...report,
      id: report.id || `lr_${Date.now()}`,
      createdAt: report.createdAt || new Date().toISOString(),
      checkout: null,
    };
    // Add the new report and persist the array (avoid passing functions to persist)
    setReports(prev => {
      const next = prev.some(r => r.id === newReport.id) ? prev : [...prev, newReport];
      try {
        if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
      } catch (_) {}
      return next;
    });
    return newReport;
  }, []);

  /** Add / update check-out on an existing report */
  const addCheckout = useCallback(async (reportId, checkoutData) => {
    setReports(prev => {
      const next = prev.map(r =>
        r.id === reportId
          ? { ...r, checkout: { ...checkoutData, createdAt: new Date().toISOString() } }
          : r
      );
      if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Update check-in fields on an existing report */
  const updateReport = useCallback(async (reportId, updates) => {
    setReports(prev => {
      const next = prev.map(r => r.id === reportId ? { ...r, ...updates } : r);
      if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Delete a report */
  const deleteReport = useCallback(async (reportId) => {
    setReports(prev => {
      const next = prev.filter(r => r.id !== reportId);
      if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Add a comment to a report */
  const addComment = useCallback(async (reportId, comment) => {
    setReports(prev => {
      const next = prev.map(r =>
        r.id === reportId
          ? { ...r, comments: [...(r.comments || []), { ...comment, id: `c_${Date.now()}`, createdAt: new Date().toISOString() }] }
          : r
      );
      if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = {
    reports,
    loading,
    addReport,
    addCheckout,
    updateReport,
    deleteReport,
    addComment,
  };

  return (
    <LogReportContext.Provider value={value}>
      {children}
    </LogReportContext.Provider>
  );
}

export function useLogReport() {
  const ctx = useContext(LogReportContext);
  if (!ctx) throw new Error('useLogReport must be used inside <LogReportProvider>');
  return ctx;
}

export default LogReportContext;