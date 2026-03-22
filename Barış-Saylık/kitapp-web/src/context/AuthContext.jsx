import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('userId', newUser._id)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, token, loading,
      isAuthenticated: !!token,
      login, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
