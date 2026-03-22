import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import BookDetailPage from './pages/BookDetailPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/"          element={<Navigate to="/home" replace />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/home"      element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/books/:bookId" element={<PrivateRoute><BookDetailPage /></PrivateRoute>} />
            <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="*"          element={<Navigate to="/home" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
