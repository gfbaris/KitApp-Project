import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://kitapp-api.vercel.app';

// ─── TOKEN CACHE ───────────────────────────────────────────────────────────────
// Her istekte AsyncStorage okumak yerine memory'de tut → daha güvenilir
let cachedToken = null;

export const setToken = async (token) => {
  cachedToken = token;
  await AsyncStorage.setItem('token', token);
};

export const clearToken = async () => {
  cachedToken = null;
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const loadToken = async () => {
  cachedToken = await AsyncStorage.getItem('token');
  return cachedToken;
};

// Kullanıcı objesini AsyncStorage'da sakla / getir
export const saveUser = async (user) => {
  if (user) await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const getSavedUser = async () => {
  try {
    const str = await AsyncStorage.getItem('user');
    return str ? JSON.parse(str) : null;
  } catch { return null; }
};

// ─── AXIOS INSTANCE ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    // DEBUG — terminalde API isteklerini gör
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) console.log('[API] BODY:', JSON.stringify(config.data));
    console.log('[API] TOKEN:', cachedToken ? cachedToken.substring(0, 20) + '...' : 'YOK');
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.status} ${response.config?.url}`);
    return response;
  },
  async (error) => {
    console.log(`[API] ❌ ${error.response?.status} ${error.config?.url}`);
    console.log('[API] HATA:', JSON.stringify(error.response?.data));
    if (error.response?.status === 401) {
      await clearToken();
    }
    return Promise.reject(error);
  }
);

// ─── YARDIMCI: Liste yanıtlarını parse et ─────────────────────────────────────
// Backend bazen dizi, bazen { books: [...] }, bazen { data: [...] } döndürür
export const parseListResponse = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.books)) return responseData.books;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.results)) return responseData.results;
  if (Array.isArray(responseData?.favorites)) return responseData.favorites;
  console.warn('[API] Beklenmeyen yanıt formatı:', JSON.stringify(responseData)?.substring(0, 200));
  return [];
};

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password) => {
    const parts = name.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return api.post('/auth/register', { firstName, lastName, email, password });
  },

  // /auth/me yok — GET /users/:id kullan
  getUserById: (id) => api.get(`/users/${id}`),

  // PUT /users/:id
  updateProfile: (id, data) => api.put(`/users/${id}`, data),

  // DELETE /users/:id
  deleteAccount: (id) => api.delete(`/users/${id}`),
};

// ─── KİTAPLAR ─────────────────────────────────────────────────────────────────
// ÖNEMLİ — Book model'deki gerçek field adları:
//   coverImage (coverUrl değil!), publishYear (year değil!)
export const booksAPI = {
  getAll: (page = 1) => api.get('/books', { params: { page, limit: 12 } }),

  getByGenre: (genre, page = 1) => api.get('/books/filter', { params: { genre, page, limit: 12 } }),

  getById: (id) => api.get(`/books/${id}`),

  create: (data) => api.post('/books', normalizeBookData(data)),

  update: (id, data) => api.put(`/books/${id}`, normalizeBookData(data)),

  delete: (id) => api.delete(`/books/${id}`),

  rateBook: (id, score) => api.post(`/books/${id}/ratings`, { score }),

  getFavorites: () => api.get('/users/favorites'),

  addFavorite: (id) => api.post(`/users/favorites/${id}`),
  removeFavorite: (id) => api.delete(`/users/favorites/${id}`),

  generateSummary: (bookId, text) =>
    api.post('/ai/summarize', { text: text || '', bookId }),

  search: (query, page = 1) => api.get('/books/search', { params: { query, page, limit: 12 } }),
};

// Backend field adlarını güncelle: coverUrl→coverImage, year→publishYear
function normalizeBookData(data) {
  const normalized = { ...data };
  if ('coverUrl' in normalized) {
    normalized.coverImage = normalized.coverUrl;
    delete normalized.coverUrl;
  }
  if ('year' in normalized) {
    normalized.publishYear = normalized.year;
    delete normalized.year;
  }
  return normalized;
}

// ─── AI ───────────────────────────────────────────────────────────────────────
// Web'de: GET /ai/recommendations/:id, GET /ai/analysis/:id
export const aiAPI = {
  getRecommendations: (userId) => api.get(`/ai/recommendations/${userId}`),
  getAnalysis: (userId) => api.get(`/ai/analysis/${userId}`),
};

export default api;
