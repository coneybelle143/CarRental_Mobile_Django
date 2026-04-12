import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

const VehicleContext = createContext(null);
const ACCESS_TOKEN_KEY = 'carRental.accessToken.v2';

const fromApiVehicle = (vehicle) => {
  const price = Number(vehicle.pricePerDay ?? vehicle.daily_rate ?? 0);
  const status = vehicle.status || (vehicle.available ? 'available' : 'rented');
  return {
    ...vehicle,
    id: Number(vehicle.id),
    name: vehicle.name || vehicle.model || '',
    model: vehicle.model || vehicle.name || '',
    pricePerDay: Number.isNaN(price) ? 0 : price,
    available: status === 'available',
    status,
    ownerId: vehicle.ownerId || null,
    ownerName: vehicle.owner || '',
  };
};

const toApiVehicle = (vehicleData) => {
  const rawPrice = Number(vehicleData.pricePerDay ?? vehicleData.price ?? 0);
  return {
    brand: vehicleData.brand || '',
    model: vehicleData.model || vehicleData.name || '',
    year: Number(vehicleData.year || new Date().getFullYear()),
    daily_rate: Number.isNaN(rawPrice) ? 0 : rawPrice,
    available: (vehicleData.status || 'available') === 'available',
  };
};

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await apiRequest('/api/cars/');
      setVehicles(Array.isArray(data) ? data.map(fromApiVehicle) : []);
    } catch (error) {
      console.warn('[VehicleContext] Failed to load vehicles', error);
      setVehicles([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await loadVehicles();
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [loadVehicles]);

  const addVehicle = async (vehicleData, owner) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      console.warn('[VehicleContext] addVehicle requires auth token.');
      return null;
    }

    try {
      const created = await apiRequest('/api/cars/', {
        method: 'POST',
        token,
        body: toApiVehicle(vehicleData),
      });
      const normalized = fromApiVehicle(created);
      setVehicles((prev) => [normalized, ...prev]);
      return normalized;
    } catch (error) {
      console.warn('[VehicleContext] Failed to add vehicle', error);
      return null;
    }
  };

  const updateVehicle = async (id, updates) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    try {
      const updated = await apiRequest(`/api/cars/${id}/`, {
        method: 'PATCH',
        token,
        body: toApiVehicle({ ...updates, model: updates.model || updates.name }),
      });
      const normalized = fromApiVehicle(updated);
      setVehicles((prev) => prev.map((v) => (v.id === id ? normalized : v)));
    } catch (error) {
      console.warn('[VehicleContext] Failed to update vehicle', error);
    }
  };

  const deleteVehicle = async (id) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    try {
      await apiRequest(`/api/cars/${id}/`, {
        method: 'DELETE',
        token,
      });
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.warn('[VehicleContext] Failed to delete vehicle', error);
    }
  };

  const approveVehicle = useCallback(() => {}, []);
  const rejectVehicle = useCallback(() => {}, []);

  const getOwnerVehicles = useCallback((ownerId) =>
    vehicles.filter((v) => String(v.ownerId) === String(ownerId)),
  [vehicles]);

  const getPendingVehicles = useCallback(() => [], []);

  const getApprovedVehicles = useCallback(() =>
    vehicles.filter((v) => (v.approvalStatus || 'approved') !== 'rejected'),
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
