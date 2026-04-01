// context/VehicleContext.js
import React, { createContext, useContext, useState } from 'react';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);

  const addVehicle = (vehicleData, owner) => {
    const newVehicle = {
      ...vehicleData,
      id: Date.now(),
      ownerId: owner.id || owner.email,
      ownerName: owner.firstName
        ? `${owner.firstName} ${owner.lastName || ''}`.trim()
        : owner.fullName || owner.email || 'Unknown Owner',
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

  const getOwnerVehicles = (ownerId) =>
    vehicles.filter(v => v.ownerId === ownerId);

  return (
    <VehicleContext.Provider value={{
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      getOwnerVehicles,
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