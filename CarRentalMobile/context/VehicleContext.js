import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, API_BASE } from '../services/api';

const VehicleContext = createContext(null);
const ACCESS_TOKEN_KEY = 'carRental.accessToken.v2';

const resolvePhotoUri = (uri) => {
  if (!uri) return null;
  if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:') || uri.startsWith('file:')) {
    return uri;
  }
  if (uri.startsWith('//')) {
    return `https:${uri}`;
  }
  if (uri.startsWith('/')) {
    return `${API_BASE}${uri}`;
  }
  return `${API_BASE}/${uri}`;
};

const unwrapPhotoValue = (photoValue) => {
  if (!photoValue) return null;
  if (typeof photoValue === 'string') return photoValue;
  if (typeof photoValue === 'object') {
    return photoValue.url || photoValue.path || photoValue.uri || null;
  }
  return null;
};

const getVehiclePhotoUri = (vehicle) => {
  const uri = unwrapPhotoValue(vehicle.photoUri)
    || unwrapPhotoValue(vehicle.photo_url)
    || unwrapPhotoValue(vehicle.image_url)
    || unwrapPhotoValue(vehicle.photo)
    || unwrapPhotoValue(vehicle.image)
    || null;
  return resolvePhotoUri(uri);
};

const fromApiVehicle = (vehicle) => {
  const price = Number(vehicle.pricePerDay ?? vehicle.daily_rate ?? 0);
  const status = vehicle.status || (vehicle.available ? 'available' : 'rented');
  return {
    ...vehicle,
    id: Number(vehicle.id),
    name: vehicle.name || vehicle.model || '',
    model: vehicle.model || vehicle.name || '',
    photoUri: getVehiclePhotoUri(vehicle),
    pricePerDay: Number.isNaN(price) ? 0 : price,
    available: status === 'available',
    status,
    ownerId: vehicle.ownerId || null,
    ownerName: vehicle.owner || '',
  };
};

const toApiVehicle = (vehicleData) => {
  const rawPrice = Number(vehicleData.pricePerDay ?? vehicleData.price ?? 0);
  const payload = {
    brand: vehicleData.brand || 'Unknown Brand',
    model: vehicleData.model || vehicleData.name || 'Unknown Model',
    year: Number(vehicleData.year || new Date().getFullYear()),
    daily_rate: Number.isNaN(rawPrice) ? 0 : rawPrice,
    available: (vehicleData.status || 'available') === 'available',
  };

  if (vehicleData.location) payload.location = vehicleData.location;
  if (vehicleData.description) payload.description = vehicleData.description;
  if (vehicleData.seats !== undefined && vehicleData.seats !== null && vehicleData.seats !== '') {
    payload.seats = Number(vehicleData.seats) || vehicleData.seats;
  }
  if (vehicleData.fuel) payload.fuel = vehicleData.fuel;
  if (vehicleData.photoUri) payload.photoUri = vehicleData.photoUri;

  return payload;
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
    if (!token) return null;

    try {
      const body = {};
      if (updates.brand) body.brand = updates.brand;
      if (updates.model || updates.name) body.model = updates.model || updates.name;
      if (updates.year) body.year = Number(updates.year);
      if (updates.pricePerDay || updates.price) {
        const rawPrice = Number(updates.pricePerDay ?? updates.price);
        body.daily_rate = Number.isNaN(rawPrice) ? 0 : rawPrice;
      }
      if (updates.status) body.available = updates.status === 'available';
      if (updates.location) body.location = updates.location;
      if (updates.description) body.description = updates.description;
      if (updates.seats !== undefined && updates.seats !== null && updates.seats !== '') {
        body.seats = Number(updates.seats) || updates.seats;
      }
      if (updates.fuel) body.fuel = updates.fuel;
      if (updates.photoUri) body.photoUri = updates.photoUri;

      const updated = await apiRequest(`/api/cars/${id}/`, {
        method: 'PATCH',
        token,
        body,
      });
      const normalized = fromApiVehicle(updated);
      setVehicles((prev) => prev.map((v) => (v.id === id ? normalized : v)));
      return normalized;
    } catch (error) {
      console.warn('[VehicleContext] Failed to update vehicle', error);
      return null;
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
