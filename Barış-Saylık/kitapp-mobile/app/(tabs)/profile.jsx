import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI, aiAPI, booksAPI, parseListResponse } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false); // sadece ilk yüklemede true
  const fetchingRef = useRef(false); // aynı anda iki istek gitmesin

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ─── Tüm verileri yükle ────────────────────────────────────────────────────────
  // showSpinner: sadece ilk yüklemede true, sekme geçişlerinde false
  const fetchAll = useCallback(async (showSpinner = false) => {
    // Aynı anda iki istek gitmesini engelle
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const userId = user?._id || user?.id;
    if (!userId) {
      fetchingRef.current = false;
      setLoading(false);
      return;
    }

    if (showSpinner) setLoading(true);

    try {
      const [userRes, analysisRes, booksRes, favRes] = await Promise.allSettled([
        authAPI.getUserById(userId),
        aiAPI.getAnalysis(userId),
        booksAPI.getAll(),
        booksAPI.getFavorites(),
      ]);

      // Profil
      if (userRes.status === 'fulfilled') {
        const raw = userRes.value.data;
        const profileData = raw?.user || raw?.data || raw;
        setProfile(profileData);
        // context güncelle — döngüyü tetiklememek için user prop'unu kullanma
        updateUser(profileData);
      } else {
        if (!profile) setProfile(user); // hiç veri yoksa context user'ı göster
      }

      // AI analiz
      if (analysisRes.status === 'fulfilled') {
        setAiInsights(analysisRes.value.data);
      }

      // Kitap istatistikleri
      let bookList = [];
      if (booksRes.status === 'fulfilled') {
        bookList = parseListResponse(booksRes.value.data);
      }

      // Favorilerden favori türü bul
      let favTopGenre = '—';
      if (favRes.status === 'fulfilled') {
        const favList = parseListResponse(favRes.value.data);
        const genreCounts = {};
        favList.forEach((b) => {
          if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
        });
        const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
        favTopGenre = sorted[0]?.[0] || '—';
      }

      setStats({
        totalBooks: bookList.length,
        totalPages: bookList.reduce((s, b) => s + (parseInt(b.pageCount) || 0), 0),
        favoriteGenre: favTopGenre,
      });
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [user?._id, user?.id]); // sadece userId değişince yeniden oluştur

  // Sekmeye dönünce yenile — veri varsa spinner gösterme, arka planda güncelle
  useFocusEffect(
    useCallback(() => {
      const isFirstLoad = !profile && !stats;
      fetchAll(isFirstLoad);
    }, [fetchAll])
  );

  // ─── Profil Düzenleme ──────────────────────────────────────────────────────────
  const openEditModal = () => {
    const src = profile || user;
    const nameVal = src?.firstName 
      ? (`${src.firstName} ${src.lastName || ''}`).trim()
      : (src?.name || src?.fullName || '');
    const phoneVal = src?.phone || src?.phoneNumber || '';
    console.log('[Profile] Modal açılıyor — isim:', nameVal, 'tel:', phoneVal);
    setEditName(nameVal);
    setEditPhone(phoneVal);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    const userId = user?._id || user?.id;
    if (!userId) { Alert.alert('Hata', 'Kullanıcı ID bulunamadı.'); return; }

    setEditLoading(true);
    try {
      const parts = editName.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const payload = { firstName, lastName, phone: editPhone.trim() };
      console.log('[Profile] Güncelleme gönderiliyor:', JSON.stringify(payload), 'id:', userId);

      const res = await authAPI.updateProfile(userId, payload);
      console.log('[Profile] Güncelleme yanıtı:', JSON.stringify(res.data));

      const updated = res.data?.user || res.data?.data || res.data;
      setProfile(updated);
      await updateUser(updated); // context + AsyncStorage

      setEditModalVisible(false);
      Alert.alert('Başarılı', 'Profiliniz güncellendi.');
    } catch (e) {
      console.log('[Profile] Güncelleme hatası:', e.response?.status, JSON.stringify(e.response?.data));
      Alert.alert('Güncelleme Başarısız', e.response?.data?.message || 'Profil güncellenemedi.');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Hesap Silme ──────────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert('Hesabı Sil', 'Tüm verileriniz kalıcı olarak silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Son Onay', 'Emin misiniz?', [
            { text: 'Vazgeç', style: 'cancel' },
            {
              text: 'Kalıcı Sil',
              style: 'destructive',
              onPress: async () => {
                const userId = user?._id || user?.id;
                try {
                  await authAPI.deleteAccount(userId);
                  await logout();
                } catch (e) {
                  Alert.alert('Hata', e.response?.data?.message || 'Hesap silinemedi.');
                }
              },
            },
          ]),
      },
    ]);
  };

  // ─── AI topGenres objesinden en çok olanı bul ────────────────────────────────
  const getTopAiGenre = () => {
    const topGenres = aiInsights?.stats?.topGenres;
    if (!topGenres || typeof topGenres !== 'object') return null;
    const sorted = Object.entries(topGenres).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  };

  const displayUser = profile || user;
  const fullName = displayUser?.firstName 
    ? (`${displayUser.firstName} ${displayUser.lastName || ''}`).trim()
    : (displayUser?.name || '—');
  const avatarLetter = fullName !== '—' ? fullName.charAt(0).toUpperCase() : '?';

  // Spinner: sadece ilk yüklemede (veri hiç yokken)
  if (loading && !displayUser) return <LoadingSpinner message="Profil yükleniyor..." />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Arka plan güncelleme göstergesi */}
      {loading && (
        <View style={styles.refreshBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.refreshBannerText}>Güncelleniyor...</Text>
        </View>
      )}

      {/* ── Kullanıcı Kartı ── */}
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.userEmail}>{displayUser?.email || ''}</Text>
            {displayUser?.phone ? <Text style={styles.userPhone}>{displayUser.phone}</Text> : null}
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={openEditModal} activeOpacity={0.8}>
          <Ionicons name="pencil" size={15} color={colors.primary} />
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </TouchableOpacity>
      </View>

      {/* ── Kütüphane İstatistikleri ── */}
      {stats && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderEmoji}>📊</Text>
            <View>
              <Text style={styles.cardTitle}>Okuma Profilin</Text>
              <Text style={styles.cardSubtitle}>Kütüphane istatistiklerin</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalBooks}</Text>
              <Text style={styles.statLabel}>Kitap</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalPages}</Text>
              <Text style={styles.statLabel}>Sayfa</Text>
            </View>
            <View style={[styles.statBox, { flex: 1.4 }]}>
              <Text numberOfLines={1} style={[styles.statValue, { fontSize: 14 }]}>
                {stats.favoriteGenre || '—'}
              </Text>
              <Text style={styles.statLabel}>Favori Tür</Text>
            </View>
          </View>

          {/* AI istatistikleri (varsa) */}
          {aiInsights?.stats && (
            <View style={styles.extraStats}>
              <View style={styles.extraStatItem}>
                <Ionicons name="star" size={14} color={colors.star} />
                <Text style={styles.extraStatText}>
                  Ort. puan: <Text style={styles.extraStatBold}>{aiInsights.stats.averageScore?.toFixed(1) ?? '—'}</Text>
                </Text>
              </View>
              <View style={styles.extraStatItem}>
                <Ionicons name="heart" size={14} color={colors.danger} />
                <Text style={styles.extraStatText}>
                  Favoriler: <Text style={styles.extraStatBold}>{aiInsights.stats.totalFavorites ?? '—'}</Text>
                </Text>
              </View>
              <View style={styles.extraStatItem}>
                <Ionicons name="bar-chart" size={14} color={colors.primary} />
                <Text style={styles.extraStatText}>
                  Değerlendirme: <Text style={styles.extraStatBold}>{aiInsights.stats.totalRatings ?? '—'}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* Tür dağılımı */}
          {aiInsights?.stats?.topGenres && Object.keys(aiInsights.stats.topGenres).length > 0 && (
            <View style={styles.genreSection}>
              <Text style={styles.genreSectionTitle}>Tür Dağılımı</Text>
              {Object.entries(aiInsights.stats.topGenres)
                .sort((a, b) => b[1] - a[1])
                .map(([genre, count]) => (
                  <View key={genre} style={styles.genreRow}>
                    <Text style={styles.genreLabel}>{genre}</Text>
                    <View style={styles.genreBarBg}>
                      <View
                        style={[
                          styles.genreBarFill,
                          {
                            width: `${Math.round(
                              (count / Math.max(...Object.values(aiInsights.stats.topGenres))) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.genreCount}>{count}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>
      )}

      {/* ── AI Okuma Analizi ── */}
      {aiInsights?.insights ? (
        <View style={[styles.card, styles.aiCard]}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconCircle}>
              <Text style={{ fontSize: 24 }}>🤖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Yapay Zeka Analizi</Text>
              <Text style={styles.cardSubtitle}>Okuma alışkanlıklarına özel yorum</Text>
            </View>
          </View>

          {/* insights string ise paragraf olarak göster */}
          {typeof aiInsights.insights === 'string' ? (
            <Text style={styles.insightsText}>{aiInsights.insights}</Text>
          ) : Array.isArray(aiInsights.insights) ? (
            <View style={styles.insightsList}>
              {aiInsights.insights.map((item, i) => (
                <View key={i} style={styles.insightItem}>
                  <View style={styles.insightNum}>
                    <Text style={styles.insightNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.insightItemText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* ── Tehlikeli Bölge ── */}
      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.dangerTitle}>⚠️ Tehlikeli Bölge</Text>
        <Text style={styles.dangerDesc}>
          Hesabınızı sildiğinizde tüm kitap verileriniz, puanlarınız ve favorileriniz kalıcı olarak silinecektir.
        </Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
          <Ionicons name="trash" size={15} color="#fff" />
          <Text style={styles.dangerButtonText}>Kalıcı Olarak Sil</Text>
        </TouchableOpacity>
      </View>

      {/* ── Çıkış ── */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* ── Profil Düzenleme Modal ── */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Adınızı girin"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.modalLabel}>Telefon</Text>
            <TextInput
              style={styles.modalInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Telefon numaranız"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[styles.saveButton, editLoading && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={editLoading}
              activeOpacity={0.8}
            >
              {editLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.card, borderRadius: 20, padding: 20,
    margin: 16, marginBottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  // Arka plan güncelleme banner
  refreshBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 10, margin: 16, marginBottom: 0,
  },
  refreshBannerText: { fontSize: 13, color: colors.primary, fontWeight: '500' },

  // Avatar + isim
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  userPhone: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  editButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 14, alignSelf: 'flex-start',
  },
  editButtonText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  // Kart header
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardHeaderEmoji: { fontSize: 30 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  // İstatistik kutuları
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: colors.primaryLight,
    borderRadius: 14, padding: 12, alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  // Ek istatistikler
  extraStats: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, marginBottom: 4,
  },
  extraStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  extraStatText: { fontSize: 13, color: colors.textMuted },
  extraStatBold: { fontWeight: '700', color: colors.text },
  // Tür dağılımı
  genreSection: { marginTop: 16, gap: 8 },
  genreSectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
  genreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  genreLabel: { fontSize: 13, color: colors.text, width: 80 },
  genreBarBg: {
    flex: 1, height: 8, backgroundColor: colors.border,
    borderRadius: 4, overflow: 'hidden',
  },
  genreBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  genreCount: { fontSize: 12, fontWeight: '700', color: colors.primary, width: 20, textAlign: 'right' },
  // AI analiz kartı
  aiCard: { borderWidth: 2, borderColor: colors.accent + '60' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  aiIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.accent + '20', alignItems: 'center', justifyContent: 'center',
  },
  insightsText: { fontSize: 14, color: colors.text, lineHeight: 24, fontStyle: 'italic' },
  insightsList: { gap: 10 },
  insightItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  insightNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  insightNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  insightItemText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },
  // Tehlike
  dangerCard: { borderWidth: 1, borderColor: '#FCA5A5', marginTop: 16 },
  dangerTitle: { fontSize: 15, fontWeight: '700', color: colors.danger, marginBottom: 8 },
  dangerDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 14 },
  dangerButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.danger, borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 14, alignSelf: 'flex-start',
  },
  dangerButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  // Çıkış
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 16, marginTop: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.danger, borderRadius: 14, gap: 8,
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  modalInput: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.text, marginBottom: 14,
  },
  saveButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
