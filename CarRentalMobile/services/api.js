import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const SESSION_KEY = 'carRental.session.v2';

const defaultBase = 'http://192.168.254.107:8000';

function normalizeApiBase(rawBase)  {
  const trimmed = rawBase.trim().replace(/\/$/, '');
  const withProtocol = trimmed.match(/^[a-zA-Z][a-zA-Z\d+-.]*:\/\//)
    ? trimmed
    : `http://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (['0.0.0.0', '127.0.0.1', 'localhost'].includes(url.hostname)) {
      if (Platform.OS === 'android') {
        url.hostname = '10.0.2.2';
      } else if (Platform.OS === 'ios') {
        url.hostname = '127.0.0.1';
      }
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return withProtocol;
  }
}

function getExpoPackagerHost() {
  const manifest = Constants.manifest || Constants.expoConfig;
  const rawHost = manifest?.debuggerHost || manifest?.packagerOpts?.hostUri || manifest?.hostUri;
  if (!rawHost || typeof rawHost !== 'string') return null;
  const [host] = rawHost.split(':');
  if (!host || ['localhost', '127.0.0.1', '0.0.0.0'].includes(host)) return null;
  return host;
}

const expoPackagerHost = getExpoPackagerHost();
const expoHostBase = expoPackagerHost ? normalizeApiBase(`${expoPackagerHost}:8000`) : null;
export const API_BASE = normalizeApiBase(process.env.EXPO_PUBLIC_API_URL || defaultBase);

function toErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  if (payload.detail) return payload.detail;
  const firstKey = Object.keys(payload)[0];
  if (!firstKey) return fallback;
  const firstValue = payload[firstKey];
  if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0]);
  if (typeof firstValue === 'string') return firstValue;
  return fallback;
}

export async function apiRequest(path, options = {}) {
  const { body, headers = {}, ...rest } = options;
  const url = `${API_BASE}${path}`;

  const isFormData = body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };

  let response;
  try {
    response = await fetch(url, {
      credentials: 'omit',
      ...rest,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch (networkError) {
    const message = networkError?.message || String(networkError);
    const details = `Network request failed calling ${url}: ${message}`;
    console.warn('[apiRequest] network error', details);

    if (Platform.OS === 'android' && expoHostBase && expoHostBase !== API_BASE) {
      const fallbackUrl = `${expoHostBase}${path}`;
      console.warn('[apiRequest] retrying against expo packager host', fallbackUrl);
      try {
        response = await fetch(fallbackUrl, {
          credentials: 'omit',
          ...rest,
          headers: {
            ...defaultHeaders,
            ...headers,
          },
          body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
        });
      } catch (fallbackError) {
        const fallbackMessage = fallbackError?.message || String(fallbackError);
        const fallbackDetails = `Fallback network request failed calling ${fallbackUrl}: ${fallbackMessage}`;
        console.warn('[apiRequest] fallback network error', fallbackDetails);
        throw new Error(`${details} | ${fallbackDetails}`);
      }
    } else {
      throw new Error(details);
    }
  }

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('[apiRequest] unauthorized, clearing session and redirecting to login');
      await AsyncStorage.removeItem(SESSION_KEY);
      router.replace('/login');
    }
    // Log full response for server (5xx) errors to aid debugging
    if (response.status >= 500) {
      console.warn('[apiRequest] server error', { url, status: response.status, statusText: response.statusText, bodyText: text, parsed: payload });
    } else {
      console.warn('[apiRequest] client error', { url, status: response.status, body: payload });
    }
    throw new Error(toErrorMessage(payload, `Request failed: ${response.status}`));
  }

  return payload;
}
