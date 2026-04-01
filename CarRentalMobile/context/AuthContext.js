// context/AuthContext.js
// Global auth state — wraps the whole app so any screen can read/write the
// current user without prop-drilling or AsyncStorage for this demo.
//
// Added: `photoUri` field on the user object + dedicated `updatePhoto` helper
// that sets / clears the profile picture URI.

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  /** Call this after a successful login (demo only — no real backend). */
  const login = (userData) =>
    setUser({ photoUri: null, ...userData });

  /** Call this after a successful registration. */
  const register = (userData) =>
    setUser({ photoUri: null, ...userData });

  /** Wipe the session and go back to login. */
  const logout = () => setUser(null);

  /** Merge partial updates into the current user object (e.g. from ProfileScreen). */
  const updateUser = (partial) =>
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));

  /**
   * Set or clear the profile photo.
   * Pass a local URI string (from expo-image-picker) to set it,
   * or null / undefined to remove it.
   *
   * @param {string|null} uri
   */
  const updatePhoto = (uri) =>
    setUser((prev) => (prev ? { ...prev, photoUri: uri ?? null } : prev));

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, updatePhoto }}
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