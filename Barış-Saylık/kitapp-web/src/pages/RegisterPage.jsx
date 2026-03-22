import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useToast } from '../context/ToastContext'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const pwStrength = () => {
    const p = form.password
    if (!p) return { width: 0, color: '#e2e8f0' }
    if (p.length < 5)  return { width: '33%', color: '#ef4444' }
    if (p.length < 8)  return { width: '66%', color: '#eab308' }
    return { width: '100%', color: '#22c55e' }
  }

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Şifre en az 6 karakter olmalıdır.')
    if (form.password !== form.confirmPassword) return setError('Şifreler eşleşmiyor.')
    setLoading(true)
    try {
      const payload = { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }
      if (form.phone) payload.phone = form.phone
      await registerUser(payload)
      showToast('Hesabın oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz.', 'success')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
  const strength = pwStrength()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SOL PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 flex-col items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="text-8xl mb-6">📚</div>
          <h1 className="text-4xl font-bold text-white mb-3">KitApp</h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">Kişisel kütüphanenizi dijital ortama taşıyın.</p>
          <div className="space-y-3 text-left">
            {['Kitaplarınızı organize edin', 'AI destekli öneriler alın', 'Okuma analizinizi görün'].map(f => (
              <div key={f} className="flex items-center gap-3 text-indigo-100 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500/50 flex items-center justify-center text-indigo-200 text-xs flex-shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SAĞ PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Hesap oluştur 🚀</h2>
          <p className="text-slate-500 text-sm mt-1 mb-8">Kütüphaneni oluşturmaya başla</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-600">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ad *</label>
                <input name="firstName" required value={form.firstName} onChange={handleChange} placeholder="Barış" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Soyad *</label>
                <input name="lastName" required value={form.lastName} onChange={handleChange} placeholder="Saylık" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>E-posta *</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="ornek@email.com" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Şifre * <span className="text-slate-400 font-normal normal-case">(min. 8 karakter)</span></label>
              <input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
              {form.password && (
                <div className="h-1 rounded-full mt-2 bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, backgroundColor: strength.color }} />
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Şifre Tekrar *</label>
              <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Telefon <span className="text-slate-400 font-normal normal-case">(opsiyonel)</span></label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+90 555 000 00 00" className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Hesap oluşturuluyor...</> : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Giriş yap →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
