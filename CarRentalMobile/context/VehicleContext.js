// context/VehicleContext.js
// Shared vehicle state — any owner can add vehicles, and ALL renters can see them.

import React, { createContext, useContext, useState } from 'react';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);

  /** Owner calls this when adding a vehicle. Attaches ownerName + ownerId automatically. */
  const addVehicle = (form, ownerName, ownerId) => {
    const newVehicle = {
      ...form,
      id:        Date.now(),
      ownerName: ownerName || 'Unknown Owner',
      ownerId:   ownerId   || null,
      status:    form.status || 'available',
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  /** Owner calls this when editing one of their vehicles. */
  const updateVehicle = (id, updates) => {
    setVehicles(prev =>
      prev.map(v => v.id === id ? { ...v, ...updates } : v)
    );
  };

  /** Owner calls this when deleting one of their vehicles. */
  const deleteVehicle = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  /** Returns only the vehicles belonging to a specific owner (used on Owner Dashboard). */
  const getVehiclesByOwner = (ownerId) =>
    vehicles.filter(v => v.ownerId === ownerId);

  return (
    <VehicleContext.Provider value={{
      vehicles,          // ALL vehicles from ALL owners — read by RenterDashboard
      addVehicle,
      updateVehicle,
      deleteVehicle,
      getVehiclesByOwner,
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