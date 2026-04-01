// context/VehicleContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);

  /**
   * approvalStatus values:
   *   'pending'  — waiting for admin review
   *   'approved' — admin approved, visible to renters
   *   'rejected' — admin rejected, not visible to renters
   */
  const addVehicle = (vehicleData, owner) => {
    const newVehicle = {
      ...vehicleData,
      id: Date.now(),
      ownerId: owner.id || owner.email,
      ownerName: owner.firstName
        ? `${owner.firstName} ${owner.lastName || ''}`.trim()
        : owner.fullName || owner.email || 'Unknown Owner',
      approvalStatus: 'pending', // always starts pending
      approvalNote: '',          // admin can attach a rejection note
      submittedAt: new Date().toISOString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  const updateVehicle = (id, updates) => {
    setVehicles(prev =>
      prev.map(v => v.id === id ? { ...v, ...updates } : v)
    );
  };

  const deleteVehicle = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Admin: approve a vehicle
  const approveVehicle = useCallback((id) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, approvalStatus: 'approved', approvalNote: '', reviewedAt: new Date().toISOString() }
          : v
      )
    );
  }, []);

  // Admin: reject a vehicle with optional note
  const rejectVehicle = useCallback((id, note = '') => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, approvalStatus: 'rejected', approvalNote: note, reviewedAt: new Date().toISOString() }
          : v
      )
    );
  }, []);

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