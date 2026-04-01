// context/AuthContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);
const USERS_KEY = 'carRental.users.v1';
const SESSION_KEY = 'carRental.session.v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawUsers, rawSession] = await Promise.all([
          AsyncStorage.getItem(USERS_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);

        if (!mounted) return;

        const parsedUsers = rawUsers ? JSON.parse(rawUsers) : [];
        setUsers(Array.isArray(parsedUsers) ? parsedUsers : []);

        if (rawSession) setUser(JSON.parse(rawSession));
      } catch (error) {
        console.warn('[AuthContext] Failed to load auth data', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistUsers = useCallback(async (nextUsers) => {
    setUsers(nextUsers);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  }, []);

  const persistSession = useCallback(async (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const found = users.find(
      (item) => item.email === normalizedEmail && item.password === password
    );

    if (!found) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const { password: _pw, ...safeUser } = found;
    await persistSession(safeUser);
    return { ok: true, user: safeUser };
  }, [persistSession, users]);

  const register = useCallback(async (userData, password) => {
    const normalizedEmail = (userData?.email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }

    if (users.some((item) => item.email === normalizedEmail)) {
      return { ok: false, error: 'Email is already registered.' };
    }

    const account = {
      ...userData,
      email: normalizedEmail,
      password,
      photoUri: userData?.photoUri || null,
    };

    const nextUsers = [...users, account];
    await persistUsers(nextUsers);

    const { password: _pw, ...safeUser } = account;
    await persistSession(safeUser);
    return { ok: true, user: safeUser };
  }, [persistSession, persistUsers, users]);

  const logout = useCallback(async () => {
    await persistSession(null);
  }, [persistSession]);

  const updateUser = useCallback(async (partial) => {
    if (!user) return;

    const nextUser = { ...user, ...partial };
    setUser(nextUser);

    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));

      const nextUsers = users.map((item) =>
        item.email === user.email ? { ...item, ...partial } : item
      );
      setUsers(nextUsers);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
    } catch (error) {
      console.warn('[AuthContext] Failed to update user', error);
    }
  }, [user, users]);

  /**
   * Set or clear the profile photo.
   * Pass a local URI string (from expo-image-picker) to set it,
   * or null / undefined to remove it.
   *
   * @param {string|null} uri
   */
  const updatePhoto = useCallback((uri) =>
    updateUser({ photoUri: uri ?? null }),
  [updateUser]);

  return (
    <AuthContext.Provider
      value={{ user, users, loading, login, register, logout, updateUser, updatePhoto }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook — throws if used outside <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}