import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingContext = createContext(null);
const BOOKINGS_KEY = 'carRental.bookings.v1';

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          setBookings(Array.isArray(parsed) ? parsed : []);
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
    const booking = {
      ...bookingData,
      id: bookingData.id || `bk_${Date.now()}`,
      status: bookingData.status || 'pending',
      createdAt: bookingData.createdAt || new Date().toISOString(),
    };

    mutateBookings((prev) => [...prev, booking]);
    return booking;
  }, [mutateBookings]);

  const updateBooking = useCallback((bookingId, updates) => {
    mutateBookings((prev) =>
      prev.map((item) => (item.id === bookingId ? { ...item, ...updates } : item))
    );
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
