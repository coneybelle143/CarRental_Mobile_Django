import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'carRental.session.v2';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (!session) return;

        const savedUser = JSON.parse(session);
        if (!mounted) return;

        setUser(savedUser);
      } catch {
        if (!mounted) return;
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistAuth = useCallback(async (nextUser) => {
    setUser(nextUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const loginData = await apiRequest('/api/login/', {
        method: 'POST',
        body: { username: normalizedEmail, password },
      });

      // Accept the login data directly as the user profile since tokens are removed
      const me = loginData?.user || loginData;
      await persistAuth(me);
      return { ok: true, user: me };
    } catch (error) {
      return { ok: false, error: error.message || 'Invalid email or password.' };
    }
  }, [persistAuth]);

  const register = useCallback(async (userData, password) => {
    try {
      const normalizedEmail = (userData?.email || '').trim().toLowerCase();
      if (!normalizedEmail || !password) {
        return { ok: false, error: 'Email and password are required.' };
      }

      await apiRequest('/api/register/', {
        method: 'POST',
        body: {
          email: normalizedEmail,
          username: normalizedEmail,
          password,
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          middleName: userData?.middleName || '',
          role: userData?.role || 'renter',
          sex: userData?.sex || '',
          dateOfBirth: userData?.dateOfBirth || null,
        },
      });

      return await login(normalizedEmail, password);
    } catch (error) {
      return { ok: false, error: error.message || 'Registration failed.' };
    }
  }, [login]);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const updateUser = useCallback(async (partial) => {
    try {
      const updated = await apiRequest('/api/me/', {
        method: 'PATCH',
        body: {
          firstName: partial?.firstName,
          lastName: partial?.lastName,
          middleName: partial?.middleName,
          sex: partial?.sex,
          dateOfBirth: partial?.dateOfBirth,
        },
      });

      setUser(updated);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('[AuthContext] Failed to update user', error);
    }
  }, []);

  const updatePhoto = useCallback((uri) => updateUser({ photoUri: uri ?? null }), [updateUser]);

  return (
    <AuthContext.Provider value={{ user, users: [], loading, login, register, logout, updateUser, updatePhoto }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
