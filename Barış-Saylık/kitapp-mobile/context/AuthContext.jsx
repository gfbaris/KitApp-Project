import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  authAPI,
  setToken, clearToken, loadToken,
  saveUser, getSavedUser,
} from '../services/api';

const AuthContext = createContext(null);

// Backend farklı formatlar kullanabilir — tümünü yakala
function extractUserData(data) {
  if (!data) return null;
  // { user: { id, name, email } }
  if (data.user && typeof data.user === 'object' && (data.user._id || data.user.id || data.user.email)) {
    return data.user;
  }
  // { data: { id, name, email } }
  if (data.data && typeof data.data === 'object' && (data.data._id || data.data.id || data.data.email)) {
    return data.data;
  }
  // Aynı seviyede: { token, _id, name, email }
  const { token, accessToken, access_token, ...rest } = data;
  if (rest.email || rest._id || rest.id || rest.name) return rest;
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkStoredToken(); }, []);

  // ─── Uygulama açılışında oturum kontrolü ─────────────────────────────────────
  const checkStoredToken = async () => {
    try {
      const token = await loadToken();
      if (!token) { setLoading(false); return; }

      // 1. AsyncStorage'daki son kullanıcıyı hemen yükle (anlık gösterim)
      const savedUser = await getSavedUser();
      if (savedUser) setUser(savedUser);

      // 2. Sunucudan taze veriyi al (id biliniyorsa)
      const userId = savedUser?._id || savedUser?.id;
      if (userId) {
        try {
          const res = await authAPI.getUserById(userId);
          const freshUser = extractUserData(res.data) || res.data;
          console.log('[Auth] Taze kullanıcı verisi:', JSON.stringify(freshUser));
          await saveUser(freshUser);
          setUser(freshUser);
        } catch (e) {
          console.log('[Auth] Kullanıcı yenilemesi başarısız (offline olabilir):', e.message);
          // Kaydedilmiş user ile devam et
        }
      }
    } catch (e) {
      console.log('[Auth] Token kontrolü başarısız:', e.message);
      await clearToken();
    } finally {
      setLoading(false);
    }
  };

  // ─── Giriş ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    console.log('[Auth] Login yanıtı:', JSON.stringify(res.data));

    const token = res.data?.token || res.data?.accessToken || res.data?.access_token;
    const userData = extractUserData(res.data);

    console.log('[Auth] Çıkarılan kullanıcı:', JSON.stringify(userData));
    if (!token) throw new Error('Sunucu token döndürmedi.');

    await setToken(token);
    await saveUser(userData);   // AsyncStorage'a kaydet
    setUser(userData);
    router.replace('/(tabs)/');
  };

  // ─── Kayıt ───────────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password);
    console.log('[Auth] Register yanıtı:', JSON.stringify(res.data));
    
    // Uygulamaya doğrudan girme, sadece API'den olumlu yanıtı geri döndür
    return res;
  };

  // ─── Çıkış ───────────────────────────────────────────────────────────────────
  const logout = async () => {
    await clearToken();       // token + user AsyncStorage'dan silinir
    setUser(null);
    router.replace('/(auth)/login');
  };

  // ─── Kullanıcıyı direkt güncelle (profil sayfası için) ──────────────────────
  const updateUser = async (newData) => {
    const merged = { ...user, ...newData };
    setUser(merged);
    await saveUser(merged);  // AsyncStorage'ı da güncelle
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
