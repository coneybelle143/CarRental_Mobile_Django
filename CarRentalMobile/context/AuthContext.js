import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'carRental.session.v2';
const ACCESS_TOKEN_KEY = 'carRental.accessToken.v2';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (!token) return;

        const me = await apiRequest('/api/me/', { token });
        if (!mounted) return;

        setUser(me);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(me));
      } catch {
        if (!mounted) return;
        await AsyncStorage.multiRemove([SESSION_KEY, ACCESS_TOKEN_KEY]);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistAuth = useCallback(async (nextUser, accessToken) => {
    setUser(nextUser);
    await AsyncStorage.multiSet([
      [SESSION_KEY, JSON.stringify(nextUser)],
      [ACCESS_TOKEN_KEY, accessToken],
    ]);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const loginData = await apiRequest('/api/login/', {
        method: 'POST',
        body: { username: normalizedEmail, password },
      });

      const accessToken = loginData?.access;
      if (!accessToken) {
        return { ok: false, error: 'Login failed. Missing access token.' };
      }

      const me = await apiRequest('/api/me/', { token: accessToken });
      await persistAuth(me, accessToken);
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
    await AsyncStorage.multiRemove([SESSION_KEY, ACCESS_TOKEN_KEY]);
  }, []);

  const updateUser = useCallback(async (partial) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    try {
      const updated = await apiRequest('/api/me/', {
        method: 'PATCH',
        token,
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
