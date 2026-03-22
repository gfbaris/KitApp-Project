import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { loginUser } from '../services/api'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginUser({ email, password })
      const { token, user } = res.data
      login(token, user)
      showToast('Giriş başarılı! Hoş geldin 👋', 'success')
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SOL PANEL — Indigo gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 flex-col items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="text-8xl mb-6">📚</div>
          <h1 className="text-4xl font-bold text-white mb-3">KitApp</h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Kişisel kütüphanenizi dijital ortama taşıyın.
          </p>
          <div className="space-y-3 text-left">
            {[
              'Kitaplarınızı organize edin',
              'AI destekli öneriler alın',
              'Okuma analizinizi görün',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-indigo-100 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500/50 flex items-center justify-center text-indigo-200 text-xs flex-shrink-0">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SAĞ PANEL — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Tekrar hoş geldin 👋</h2>
          <p className="text-slate-500 text-sm mt-1 mb-8">Hesabına giriş yap</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>E-posta Adresi</label>
              <input
                id="login-email" name="email"
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Şifre</label>
              <div className="relative">
                <input
                  id="login-password" name="password"
                  type={showPass ? 'text' : 'password'}
                  required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputClass + ' pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                >
                  {showPass ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-600">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Ücretsiz kayıt ol →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
