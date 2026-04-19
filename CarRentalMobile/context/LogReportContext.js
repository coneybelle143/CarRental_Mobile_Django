// context/LogReportContext.js
// Provides log report CRUD for owners and renters.
// Uses @react-native-async-storage/async-storage for persistence.
// Run: npx expo install @react-native-async-storage/async-storage

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest } from '../services/api';

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
        // 1) load local cache
        if (AsyncStorage) {
          const raw = await AsyncStorage.getItem(LOG_KEY);
          if (raw) setReports(JSON.parse(raw));
        }

        // 2) try to fetch remote reports from several possible endpoints
        const endpoints = ['/api/log-reports/', '/api/logs/', '/api/reports/'];
        for (const ep of endpoints) {
          try {
            const data = await apiRequest(ep, { method: 'GET' });
            if (Array.isArray(data)) {
              setReports(data.map(d => ({ id: d.id ?? d.pk ?? `lr_${Date.now()}`, ...d })));
              if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(data)).catch(()=>{});
              break;
            }
          } catch (e) {
            // try next
          }
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

    // optimistic local add
    setReports(prev => {
      const next = prev.some(r => r.id === newReport.id) ? prev : [...prev, newReport];
      try { if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(()=>{}); } catch(_){}
      return next;
    });

    // attempt to persist remotely
    (async () => {
      const endpoints = ['/api/log-reports/', '/api/logs/', '/api/reports/'];
      for (const ep of endpoints) {
        try {
          const created = await apiRequest(ep, { method: 'POST', body: report });
          if (created) {
            const normalized = { id: created.id ?? created.pk ?? newReport.id, ...created };
            setReports(prev => prev.map(r => (String(r.id) === String(newReport.id) ? normalized : r)));
            if (AsyncStorage) {
              try {
                const raw = await AsyncStorage.getItem(LOG_KEY);
                const cur = raw ? JSON.parse(raw) : [];
                const next = cur.map(r => (String(r.id) === String(newReport.id) ? normalized : r));
                if (!next.some(r => String(r.id) === String(normalized.id))) next.push(normalized);
                await AsyncStorage.setItem(LOG_KEY, JSON.stringify(next));
              } catch (_) {}
            }
          }
          break;
        } catch (e) {
          // try next
        }
      }
    })();

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

    // attempt to persist checkout to server
    (async () => {
      const endpoints = [`/api/log-reports/${reportId}/`, `/api/logs/${reportId}/`, `/api/reports/${reportId}/`];
      for (const ep of endpoints) {
        try {
          await apiRequest(ep, { method: 'PATCH', body: { checkout: checkoutData } });
          break;
        } catch (e) {}
      }
    })();
  }, []);

  /** Update check-in fields on an existing report */
  const updateReport = useCallback(async (reportId, updates) => {
    setReports(prev => {
      const next = prev.map(r => r.id === reportId ? { ...r, ...updates } : r);
      if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    (async () => {
      const endpoints = [`/api/log-reports/${reportId}/`, `/api/logs/${reportId}/`, `/api/reports/${reportId}/`];
      for (const ep of endpoints) {
        try {
          await apiRequest(ep, { method: 'PATCH', body: updates });
          break;
        } catch (e) {}
      }
    })();
  }, []);

  /** Delete a report */
  const deleteReport = useCallback(async (reportId) => {
    setReports(prev => {
      const next = prev.filter(r => r.id !== reportId);
      if (AsyncStorage) AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    (async () => {
      const endpoints = [`/api/log-reports/${reportId}/`, `/api/logs/${reportId}/`, `/api/reports/${reportId}/`];
      for (const ep of endpoints) {
        try { await apiRequest(ep, { method: 'DELETE' }); break; } catch (e) {}
      }
    })();
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

    // attempt to persist comment remotely
    (async () => {
      const endpoints = [`/api/log-reports/${reportId}/comments/`, `/api/logs/${reportId}/comments/`, `/api/reports/${reportId}/comments/`];
      for (const ep of endpoints) {
        try { await apiRequest(ep, { method: 'POST', body: comment }); break; } catch (e) {}
      }
    })();
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