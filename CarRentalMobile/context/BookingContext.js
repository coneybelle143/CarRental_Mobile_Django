import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

const BookingContext = createContext(null);
const BOOKINGS_KEY = 'carRental.bookings.v1';

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) Load local cache first
        const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
        if (!mounted) return;
        const localBookings = raw ? JSON.parse(raw) : [];
        if (Array.isArray(localBookings) && localBookings.length > 0) {
          setBookings(localBookings);
        }

        // 2) Try fetching from backend (multiple possible endpoints)
        const endpoints = ['/api/bookings/', '/api/rentals/', '/api/reservations/'];
        let remote = null;
        for (const ep of endpoints) {
          try {
            const data = await apiRequest(ep, { method: 'GET' });
            if (Array.isArray(data)) { remote = data; break; }
          } catch (e) {
            // try next
          }
        }

        if (!mounted) return;
        if (Array.isArray(remote)) {
          // Normalize remote items into local shape (best-effort)
          const normalized = remote.map((b) => ({
            id: b.id ?? b.pk ?? `bk_${Date.now()}`,
            renterEmail: b.renterEmail ?? b.renter_email ?? b.user_email ?? b.user?.email,
            renterName: b.renterName ?? b.renter_name ?? b.user?.name ?? b.user?.username,
            vehicleId: b.vehicle ?? b.vehicleId ?? b.vehicle_id ?? b.car ?? b.carId,
            startDate: b.startDate ?? b.start_date ?? b.from ?? null,
            endDate: b.endDate ?? b.end_date ?? b.to ?? null,
            totalPrice: b.totalPrice ?? b.total_price ?? b.amount ?? b.price ?? null,
            status: b.status ?? 'pending',
            createdAt: b.createdAt ?? b.created_at ?? b.timestamp ?? new Date().toISOString(),
            ...b,
          }));

          // Merge remote and local (remote authoritative)
          const byId = new Map();
          normalized.forEach(r => byId.set(String(r.id), r));
          (localBookings || []).forEach(l => { if (!byId.has(String(l.id))) byId.set(String(l.id), l); });
          const merged = Array.from(byId.values());
          setBookings(merged);
          // persist merged cache
          AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(merged)).catch(() => {});
        }
      } catch (error) {
        console.warn('[BookingContext] Failed to load bookings', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next) => {
    setBookings(next);
    try {
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('[BookingContext] Failed to persist bookings', error);
    }
  }, []);

  const mutateBookings = useCallback((updater) => {
    setBookings((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next)).catch((error) => {
        console.warn('[BookingContext] Failed to persist bookings', error);
      });
      return next;
    });
  }, []);

  const addBooking = useCallback((bookingData) => {
    // attempt to create on server, fallback to local
    const createRemote = async () => {
      const toNumericId = (value) => {
        const n = Number(value);
        return Number.isFinite(n) && n > 0 ? n : null;
      };

      // Read session first; backend usually expects auth user PK for renterId.
      let sessionUserId = null;
      let sessionEmail = null;
      try {
        const sessRaw = await AsyncStorage.getItem('carRental.session.v2');
        if (sessRaw) {
          const sess = JSON.parse(sessRaw);
          sessionUserId = toNumericId(sess?.id ?? sess?.pk ?? sess?.userId);
          sessionEmail = sess?.email ?? null;
        }
      } catch (e) {
        // ignore session read errors
      }

      // build a resilient payload that supplies multiple field variants
      const payload = {
        ...bookingData,
        // duplicate common fields under different names the backend might expect
        renterId: toNumericId(sessionUserId ?? bookingData.renterId ?? bookingData.renter_id ?? bookingData.renter),
        renter: bookingData.renter ?? bookingData.renter_email ?? bookingData.renterEmail ?? sessionEmail ?? null,
        vehicle: bookingData.vehicle ?? bookingData.vehicleId ?? bookingData.vehicle_id ?? bookingData.car ?? bookingData.carId ?? null,
        vehicleId: bookingData.vehicleId ?? bookingData.vehicle ?? bookingData.vehicle_id ?? null,
        start_date: bookingData.startDate ?? bookingData.start_date ?? bookingData.from ?? null,
        end_date: bookingData.endDate ?? bookingData.end_date ?? bookingData.to ?? null,
        total_price: bookingData.totalPrice ?? bookingData.total_price ?? bookingData.amount ?? bookingData.price ?? null,
      };

      // Provide alternate FK aliases often used by DRF serializers.
      if (payload.renterId) {
        payload.renter_id = payload.renterId;
        // Some serializers expect `renter` itself to be a numeric FK.
        payload.renter = payload.renterId;
      }

      // If we still don't have a numeric renterId but have an email, try to resolve the user id from the backend
      async function resolveUserIdByEmail(email) {
        if (!email) return null;
        const tryEndpoints = ['/api/users/', '/api/customers/', '/api/accounts/', '/api/profiles/'];
        for (const ep of tryEndpoints) {
          try {
            // many list endpoints accept ?email= query param
            const res = await apiRequest(`${ep}?email=${encodeURIComponent(email)}`, { method: 'GET' });
            if (Array.isArray(res) && res.length > 0) {
              const first = res[0];
              return first.user?.id ?? first.user?.pk ?? first.id ?? first.pk ?? first.userId ?? null;
            }
            if (res && (res.id || res.pk || res.user?.id || res.user?.pk)) {
              return res.user?.id ?? res.user?.pk ?? res.id ?? res.pk;
            }
          } catch (e) {
            // try next
          }
        }
        return null;
      }

      try {
        if ((!payload.renterId || payload.renterId === null) && payload.renter) {
          const resolved = await resolveUserIdByEmail(payload.renter);
          if (resolved) {
            console.warn('[BookingContext] resolved renterId from email', payload.renter, '->', resolved);
            payload.renterId = toNumericId(resolved);
            payload.renter_id = payload.renterId;
            payload.renter = payload.renterId;
          }
        }
      } catch (e) {
        // ignore resolve errors
      }

      // Remove non-numeric renterId values to avoid backend validation failures.
      if (!toNumericId(payload.renterId)) {
        delete payload.renterId;
        delete payload.renter_id;
      }

      // Clean undefined/null fields that would confuse some backends
      Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });

      const endpoints = ['/api/bookings/', '/api/rentals/', '/api/reservations/'];
      let created = null;
      for (const ep of endpoints) {
        try {
          console.log('[BookingContext] createRemote trying', ep, 'body:', payload);
          created = await apiRequest(ep, { method: 'POST', body: payload });
          break;
        } catch (e) {
          // try next endpoint
        }
      }
      return created;
    };

    const local = {
      ...bookingData,
      id: bookingData.id || `bk_${Date.now()}`,
      status: bookingData.status || 'pending',
      createdAt: bookingData.createdAt || new Date().toISOString(),
    };

    // optimistic local add
    mutateBookings((prev) => [...prev, local]);

    // Try to persist remotely and reconcile
    createRemote().then(async (created) => {
      if (created) {
        const normalized = {
          id: created.id ?? created.pk ?? local.id,
          renterEmail: created.renterEmail ?? created.renter_email ?? local.renterEmail,
          renterName: created.renterName ?? created.renter_name ?? local.renterName,
          vehicleId: created.vehicle ?? created.vehicleId ?? local.vehicleId,
          startDate: created.startDate ?? created.start_date ?? local.startDate,
          endDate: created.endDate ?? created.end_date ?? local.endDate,
          totalPrice: created.totalPrice ?? created.total_price ?? local.totalPrice,
          status: created.status ?? local.status,
          createdAt: created.createdAt ?? created.created_at ?? local.createdAt,
          ...created,
        };
        // replace local placeholder with server-normalized record
        mutateBookings(prev => prev.map(b => (String(b.id) === String(local.id) ? normalized : b)));

        try {
          const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
          const cur = raw ? JSON.parse(raw) : [];
          const next = cur.map(b => (String(b.id) === String(local.id) ? normalized : b));
          // if local wasn't present for some reason, append
          if (!next.some(b => String(b.id) === String(normalized.id))) next.push(normalized);
          await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
        } catch (e) {
          // ignore persisting error
        }
      }
    }).catch(()=>{});

    return local;
  }, [mutateBookings]);

  const updateBooking = useCallback((bookingId, updates) => {
    // update locally
    mutateBookings((prev) =>
      prev.map((item) => (item.id === bookingId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item))
    );

    // attempt to patch on server (best-effort)
    (async () => {
      const endpoints = [`/api/bookings/${bookingId}/`, `/api/rentals/${bookingId}/`, `/api/reservations/${bookingId}/`];
      for (const ep of endpoints) {
        try {
          await apiRequest(ep, { method: 'PATCH', body: updates });
          break;
        } catch (e) {
          // try next
        }
      }
    })();
  }, [mutateBookings]);

  const setBookingStatus = useCallback((bookingId, status, rejectionReason = '') => {
    mutateBookings((prev) =>
      prev.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              status,
              rejectionReason: status === 'rejected' ? rejectionReason : '',
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    // attempt to persist status change remotely
    (async () => {
      const payload = { status };
      if (status === 'rejected') payload.rejectionReason = rejectionReason;
      const endpoints = [`/api/bookings/${bookingId}/`, `/api/rentals/${bookingId}/`, `/api/reservations/${bookingId}/`];
      for (const ep of endpoints) {
        try {
          await apiRequest(ep, { method: 'PATCH', body: payload });
          break;
        } catch (e) {
          // try next
        }
      }
    })();
  }, [mutateBookings]);

  const getBookingsForRenter = useCallback((renterEmail) => {
    if (!renterEmail) return [];
    const normalized = renterEmail.toLowerCase();
    return bookings.filter((item) => (item.renterEmail || '').toLowerCase() === normalized);
  }, [bookings]);

  const getBookingsForOwner = useCallback((ownerId) => {
    if (!ownerId) return [];
    return bookings.filter((item) => item.ownerId === ownerId);
  }, [bookings]);

  const getRentersForOwner = useCallback((ownerId) => {
    if (!ownerId) return [];
    const ownerBookings = bookings.filter((b) => b.ownerId === ownerId && b.renterEmail);
    const map = new Map();
    ownerBookings.forEach((b) => {
      const email = (b.renterEmail || '').toLowerCase();
      if (!email) return;
      if (!map.has(email)) {
        map.set(email, {
          email,
          name: b.renterName || b.renterFullName || b.renter || '',
          renterId: b.renterId || b.renterEmail || null,
        });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  const clearBookings = useCallback(() => persist([]), [persist]);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        addBooking,
        updateBooking,
        setBookingStatus,
        getBookingsForRenter,
        getBookingsForOwner,
        getRentersForOwner,
        clearBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used inside <BookingProvider>');
  return ctx;
}
