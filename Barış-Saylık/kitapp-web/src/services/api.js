import axios from 'axios';

// Merkezi Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kitapp-api.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Her isteğe otomatik token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 401 gelirse oturumu temizle ve login'e yönlendir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API İsteğinde Hata:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    if (error.response?.status === 401) {
      console.warn("401 Unauthorized alındı, çıkış yapılıyor -> URL:", error.config?.url);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// ─── Kullanıcı ───────────────────────────────────
export const getUser = (userId) => api.get(`/users/${userId}`);
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);

// ─── Kitaplar ────────────────────────────────────
export const getBooks = (params) => api.get('/books', { params });
export const getBook = (bookId) => api.get(`/books/${bookId}`);
export const addBook = (data) => api.post('/books', data);
export const updateBook = (bookId, data) => api.put(`/books/${bookId}`, data);
export const deleteBook = (bookId) => api.delete(`/books/${bookId}`);
export const searchBooks = (query) => api.get('/books', { params: { search: query } });
export const filterBooks = (genre) => api.get('/books', { params: { genre } });

// ─── Puanlama & Favoriler ────────────────────────
export const rateBook = (bookId, score) =>
  api.post('/ratings', { bookId, score });
export const addFavorite = (bookId) =>
  api.post('/favorites', { bookId });

// ─── Yapay Zeka ──────────────────────────────────
export const getRecommendations = (userId) =>
  api.get(`/ai/recommendations/${userId}`);
export const summarizeBook = (text, bookId) =>
  api.post('/ai/summarize', { text, bookId });
export const getReadingAnalysis = (userId) =>
  api.get(`/ai/analysis/${userId}`);

export default api;
