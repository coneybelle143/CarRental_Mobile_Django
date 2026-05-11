import { Platform } from 'react-native';

const defaultBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl;
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.detail || payload?.message || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export const api = {
  request: apiRequest,
  login: (credentials) => apiRequest('/api/login', { method: 'POST', body: credentials }),
  register: (payload) => apiRequest('/api/register', { method: 'POST', body: payload }),
  getMe: (email) => apiRequest(`/api/me?email=${encodeURIComponent(email)}`),
  getListings: (ownerEmail) => apiRequest(ownerEmail ? `/api/listings?owner_email=${encodeURIComponent(ownerEmail)}` : '/api/listings'),
  getListing: (id) => apiRequest(`/api/listings/${id}`),
  createListing: (payload) => apiRequest('/api/listings', { method: 'POST', body: payload }),
  updateListing: (id, payload) => apiRequest(`/api/listings/${id}`, { method: 'PUT', body: payload }),
  deleteListing: (id) => apiRequest(`/api/listings/${id}`, { method: 'DELETE' }),
  getBookings: (params = {}) => {
    const search = new URLSearchParams();
    if (params.tenantEmail) search.set('tenant_email', params.tenantEmail);
    if (params.landlordEmail) search.set('landlord_email', params.landlordEmail);
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return apiRequest(`/api/bookings${suffix}`);
  },
  getBooking: (id) => apiRequest(`/api/bookings/${id}`),
  createBooking: (payload) => apiRequest('/api/bookings', { method: 'POST', body: payload }),
  updateBooking: (id, payload) => apiRequest(`/api/bookings/${id}`, { method: 'PUT', body: payload }),
  deleteBooking: (id) => apiRequest(`/api/bookings/${id}`, { method: 'DELETE' }),
};

export default api;