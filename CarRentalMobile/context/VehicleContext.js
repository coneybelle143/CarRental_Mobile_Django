// context/VehicleContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VehicleContext = createContext(null);
const VEHICLES_KEY = 'carRental.vehicles.v1';

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(VEHICLES_KEY);
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          setVehicles(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.warn('[VehicleContext] Failed to load vehicles', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const mutateVehicles = useCallback((updater) => {
    setVehicles((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(VEHICLES_KEY, JSON.stringify(next)).catch((error) => {
        console.warn('[VehicleContext] Failed to persist vehicles', error);
      });
      return next;
    });
  }, []);

  /**
   * approvalStatus values:
   *   'pending'  — waiting for admin review
   *   'approved' — admin approved, visible to renters
   *   'rejected' — admin rejected, not visible to renters
   */
  const addVehicle = (vehicleData, owner) => {
    if (!owner) {
      console.warn('[VehicleContext] addVehicle called without owner.');
      return null;
    }

    const ownerId = owner?.id || owner?.email;
    const ownerName = owner?.firstName
      ? `${owner.firstName} ${owner.lastName || ''}`.trim()
      : owner?.fullName || owner?.email || 'Unknown Owner';

    if (!ownerId) {
      console.warn('[VehicleContext] addVehicle missing owner identifier.');
      return null;
    }

    const newVehicle = {
      ...vehicleData,
      id: Date.now(),
      ownerId,
      ownerName,
      approvalStatus: 'pending', // always starts pending
      approvalNote: '',          // admin can attach a rejection note
      submittedAt: new Date().toISOString(),
    };
    mutateVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  const updateVehicle = (id, updates) => {
    mutateVehicles(prev =>
      prev.map(v => v.id === id ? { ...v, ...updates } : v)
    );
  };

  const deleteVehicle = (id) => {
    mutateVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Admin: approve a vehicle
  const approveVehicle = useCallback((id) => {
    mutateVehicles(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, approvalStatus: 'approved', approvalNote: '', reviewedAt: new Date().toISOString() }
          : v
      )
    );
  }, [mutateVehicles]);

  // Admin: reject a vehicle with optional note
  const rejectVehicle = useCallback((id, note = '') => {
    mutateVehicles(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, approvalStatus: 'rejected', approvalNote: note, reviewedAt: new Date().toISOString() }
          : v
      )
    );
  }, [mutateVehicles]);

  // Owner: all their vehicles (any approval status)
  const getOwnerVehicles = useCallback((ownerId) =>
    vehicles.filter(v => v.ownerId === ownerId),
  [vehicles]);

  // Admin: vehicles waiting for review
  const getPendingVehicles = useCallback(() =>
    vehicles.filter(v => v.approvalStatus === 'pending'),
  [vehicles]);

  // Renter: only approved + available vehicles
  const getApprovedVehicles = useCallback(() =>
    vehicles.filter(v => v.approvalStatus === 'approved'),
  [vehicles]);

  return (
    <VehicleContext.Provider value={{
      vehicles,
      loading,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      approveVehicle,
      rejectVehicle,
      getOwnerVehicles,
      getPendingVehicles,
      getApprovedVehicles,
    }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicles must be used inside <VehicleProvider>');
  return ctx;
}