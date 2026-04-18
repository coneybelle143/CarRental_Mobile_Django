import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, API_BASE } from '../services/api';

const VehicleContext = createContext(null);

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
  const price = Number(vehicle.pricePerDay ?? vehicle.daily_rate ?? vehicle.price ?? vehicle.rate ?? 0);
  const status = vehicle.status || (vehicle.available ? 'available' : 'rented');

  let parsedOwnerId = vehicle.ownerId ?? vehicle.owner_id ?? vehicle.userId ?? vehicle.user_id ?? null;
  let parsedOwnerName = vehicle.ownerName ?? vehicle.userName ?? '';

  // Safely extract the owner ID if the backend sends it simply as 'owner'
  const ownerData = vehicle.owner ?? vehicle.user;
  if (ownerData !== undefined && ownerData !== null) {
    if (typeof ownerData === 'object') {
      parsedOwnerId = parsedOwnerId ?? ownerData.id ?? ownerData.pk ?? ownerData.email;
      parsedOwnerName = parsedOwnerName || ownerData.username || ownerData.name || ownerData.fullName;
    } else if (!isNaN(Number(ownerData)) && typeof ownerData !== 'boolean') {
      parsedOwnerId = parsedOwnerId ?? ownerData;
    } else if (typeof ownerData === 'string') {
      parsedOwnerId = parsedOwnerId ?? ownerData;
      parsedOwnerName = parsedOwnerName || ownerData;
    }
  }

  return {
    ...vehicle,
    id: Number(vehicle.id),
    name: vehicle.name || vehicle.model || vehicle.brand || '',
    model: vehicle.model || vehicle.name || '',
    photoUri: getVehiclePhotoUri(vehicle),
    pricePerDay: Number.isNaN(price) ? 0 : price,
    available: status === 'available',
    status,
    ownerId: parsedOwnerId,
    ownerName: parsedOwnerName || 'Unknown Owner',
  };
};

const toApiVehicle = (vehicleData) => {
  const rawPrice = Number(vehicleData.pricePerDay ?? vehicleData.price ?? vehicleData.daily_rate ?? 0);
  const payload = {
    name: vehicleData.name || vehicleData.model || 'Unknown Vehicle',
    brand: vehicleData.brand || 'Unknown Brand',
    model: vehicleData.model || vehicleData.name || 'Unknown Model',
    year: Number(vehicleData.year || new Date().getFullYear()),
    price: Number.isNaN(rawPrice) ? 0 : rawPrice,
    pricePerDay: Number.isNaN(rawPrice) ? 0 : rawPrice,
    daily_rate: Number.isNaN(rawPrice) ? 0 : rawPrice,
    available: (vehicleData.status || 'available') === 'available',
    status: vehicleData.status || 'available',
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

  // Helper to update both React State and Local Storage at the same time
  const mutateVehicles = useCallback((updater) => {
    setVehicles((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('carRental.vehicles.local', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const loadVehicles = useCallback(async () => {
    try {
      // 1. Load locally saved cars immediately so they don't disappear
      const localData = await AsyncStorage.getItem('carRental.vehicles.local');
      const localVehicles = localData ? JSON.parse(localData) : [];
      if (localVehicles.length > 0) {
        setVehicles(localVehicles);
      }

      // 2. Fetch from backend
      const data = await apiRequest('/api/cars/');
      console.warn('[VehicleContext] loadVehicles fetched', Array.isArray(data) ? data.length : 0, 'items');
      if (Array.isArray(data)) {
        const apiVehicles = data.map(fromApiVehicle);
        
        // 3. Merge API and local data to ensure backend doesn't overwrite your added cars
        const merged = [...apiVehicles];
        const apiIds = new Set(apiVehicles.map(v => v.id));

        localVehicles.forEach(localV => {
          if (!apiIds.has(localV.id)) {
            merged.push(localV); // Keep cars that backend failed to return
          } else {
            const apiIdx = merged.findIndex(v => v.id === localV.id);
            if (apiIdx >= 0 && !merged[apiIdx].ownerId && localV.ownerId) {
              // Restore owner info if backend forgot it
              merged[apiIdx] = { ...merged[apiIdx], ownerId: localV.ownerId, ownerName: localV.ownerName };
            }
          }
        });

        mutateVehicles(merged);
      }
    } catch (error) {
      console.warn('[VehicleContext] Failed to load vehicles', error);
    }
  }, [mutateVehicles]);

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
    const payloadObj = toApiVehicle(vehicleData);

    // Resolve owner identifier from passed owner or from saved session as fallback
    let ownerIdentifier = owner?.id || owner?.pk || owner?.userId || owner?.email || null;
    let ownerName = owner?.firstName || owner?.fullName || owner?.username || owner?.email || null;
    if (!ownerIdentifier) {
      try {
        const sess = await AsyncStorage.getItem('carRental.session.v2');
        if (sess) {
          const sessUser = JSON.parse(sess);
          ownerIdentifier = ownerIdentifier || sessUser?.id || sessUser?.pk || sessUser?.userId || sessUser?.email || null;
          ownerName = ownerName || sessUser?.firstName || sessUser?.fullName || sessUser?.username || sessUser?.email || null;
          // also set owner object so local fallback works
          owner = owner || sessUser;
        }
      } catch (e) {
        // ignore
      }
    }

    // Include owner identifiers in payload so backend can set owner when unauthenticated
    if (ownerIdentifier) {
      payloadObj.owner = ownerIdentifier;
      payloadObj.ownerId = ownerIdentifier;
      payloadObj.owner_id = ownerIdentifier;
      payloadObj.user = ownerIdentifier;
      payloadObj.user_id = ownerIdentifier;
      payloadObj.ownerEmail = ownerIdentifier;
      payloadObj.owner_email = ownerIdentifier;
    }

    let payload = payloadObj;
    if (vehicleData.photoUri && !vehicleData.photoUri.startsWith('http')) {
      payload = new FormData();
      Object.entries(payloadObj).forEach(([k, v]) => {
        if (k !== 'photoUri' && v !== undefined && v !== null) payload.append(k, String(v));
      });
      
      const uri = vehicleData.photoUri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const type = `image/${filename.split('.').pop() || 'jpeg'}`;
      payload.append('photo', { uri, name: filename, type });
      payload.append('image', { uri, name: filename, type });
    }

    const created = await apiRequest('/api/cars/', {
      method: 'POST',
      body: payload,
    });
    let normalized = fromApiVehicle(created);
    console.warn('[VehicleContext] addVehicle created', normalized?.id, 'ownerId=', normalized?.ownerId, 'ownerName=', normalized?.ownerName);
    // Ensure owner info is present so owner views update immediately
    if ((ownerIdentifier || ownerName) && (!normalized.ownerId || normalized.ownerId === null)) {
      normalized = {
        ...normalized,
        ownerId: normalized.ownerId || ownerIdentifier,
        ownerName: normalized.ownerName || ownerName || 'Unknown Owner',
      };
    }
    mutateVehicles((prev) => [normalized, ...prev]);
    return normalized;
  };

  const updateVehicle = async (id, updates) => {
    try {
      const body = {};
      if (updates.brand) body.brand = updates.brand;
      if (updates.name || updates.model) body.name = updates.name || updates.model;
      if (updates.model || updates.name) body.model = updates.model || updates.name;
      if (updates.year) body.year = Number(updates.year);
      if (updates.pricePerDay || updates.price) {
        const rawPrice = Number(updates.pricePerDay ?? updates.price);
        body.daily_rate = Number.isNaN(rawPrice) ? 0 : rawPrice;
        body.price = Number.isNaN(rawPrice) ? 0 : rawPrice;
        body.pricePerDay = Number.isNaN(rawPrice) ? 0 : rawPrice;
      }
      if (updates.status) {
        body.available = updates.status === 'available';
        body.status = updates.status;
      }
      if (updates.location) body.location = updates.location;
      if (updates.description) body.description = updates.description;
      if (updates.seats !== undefined && updates.seats !== null && updates.seats !== '') {
        body.seats = Number(updates.seats) || updates.seats;
      }
      if (updates.fuel) body.fuel = updates.fuel;
      if (updates.photoUri) body.photoUri = updates.photoUri;

      let payload = body;
      if (updates.photoUri && !updates.photoUri.startsWith('http')) {
        payload = new FormData();
        Object.entries(body).forEach(([k, v]) => {
          if (k !== 'photoUri' && v !== undefined && v !== null) payload.append(k, String(v));
        });
        const uri = updates.photoUri;
        const filename = uri.split('/').pop() || 'photo.jpg';
        const type = `image/${filename.split('.').pop() || 'jpeg'}`;
        payload.append('photo', { uri, name: filename, type });
        payload.append('image', { uri, name: filename, type });
      }

      const updated = await apiRequest(`/api/cars/${id}/`, {
        method: 'PATCH',
        body: payload,
      });
      const normalized = fromApiVehicle(updated);
      mutateVehicles((prev) => prev.map((v) => (v.id === id ? normalized : v)));
      return normalized;
    } catch (error) {
      console.warn('[VehicleContext] Failed to update vehicle', error);
      return null;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await apiRequest(`/api/cars/${id}/`, {
        method: 'DELETE',
      });
      mutateVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.warn('[VehicleContext] Failed to delete vehicle', error);
    }
  };

  const approveVehicle = useCallback(() => {}, []);
  const rejectVehicle = useCallback(() => {}, []);

  const getOwnerVehicles = useCallback((ownerId, ownerEmail) =>
    vehicles.filter((v) => {
      const matchId = ownerId && String(v.ownerId) === String(ownerId);
      const matchEmail = ownerEmail && String(v.ownerId).toLowerCase() === String(ownerEmail).toLowerCase();
      return matchId || matchEmail;
    }),
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
      refreshVehicles: loadVehicles,
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
