import axios from 'axios'

const api = axios.create({
  baseURL: 'https://kitapp-api.vercel.app'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    // Eğer istek login ise ve 401 dönüyorsa sayfayı yenileme (hata mesajını göstermesine izin ver)
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const loginUser    = data => api.post('/auth/login', data)
export const registerUser = data => api.post('/auth/register', data)

// Kullanıcı
export const getUser    = id         => api.get(`/users/${id}`)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = id         => api.delete(`/users/${id}`)

// Kitaplar
export const getBooks    = params        => api.get('/books', { params })
export const getBook     = id            => api.get(`/books/${id}`)
export const addBook     = data          => api.post('/books', data)
export const updateBook  = (id, data)   => api.put(`/books/${id}`, data)
export const deleteBook  = id            => api.delete(`/books/${id}`)
export const searchBooks = query         => api.get('/books/search', { params: { query } })
export const filterBooks = genre         => api.get('/books/filter', { params: { genre } })

// Puanlama & Favori
export const rateBook     = (id, score) => api.post(`/books/${id}/ratings`, { score })
export const addFavorite  = id          => api.post(`/users/favorites/${id}`)
export const deleteFavorite = id        => api.delete(`/users/favorites/${id}`)
export const getFavorites = ()          => api.get('/users/favorites')

// AI
export const getRecommendations = id => api.get(`/ai/recommendations/${id}`)
export const summarizeBook      = (text, bookId) => api.post('/ai/summarize', { text, bookId })
export const getReadingAnalysis = id => api.get(`/ai/analysis/${id}`)

export default api
