import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { booksAPI } from '../../services/api';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';

const GENRES = [
  { label: 'Roman', emoji: '📝' },
  { label: 'Bilim Kurgu', emoji: '🚀' },
  { label: 'Tarih', emoji: '🏰' },
  { label: 'Polisiye', emoji: '🕵️' },
  { label: 'Biyografi', emoji: '👤' },
  { label: 'Şiir', emoji: '🎶' },
  { label: 'Diğer', emoji: '🔖' },
];

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Puanlama
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Favori
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // AI Özet
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [summary, setSummary] = useState('');

  // Düzenleme Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editPageCount, setEditPageCount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ─── Kitap Verisi Yükle ──────────────────────────────────────────────────────
  const fetchBook = async () => {
    setError(null);
    try {
      const res = await booksAPI.getById(id);
      const data = res.data?.book || res.data?.data || res.data;
      console.log('[BookDetail] Kitap verisi:', JSON.stringify(data)?.substring(0, 400));
      setBook(data);
      setSelectedRating(data.userRating || data.userScore || data.score || 0);
      setIsFavorite(data.isFavorite || data.favorite || false);
    } catch (e) {
      console.log('[BookDetail] Yükleme hatası:', e.response?.status, e.response?.data);
      setError(e.response?.data?.message || 'Kitap bilgileri yüklenemedi.');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchBook();
      setLoading(false);
    };
    load();
  }, [id]);

  // ─── Puanlama ────────────────────────────────────────────────────────────────
  const handleRateBook = async () => {
    if (selectedRating === 0) {
      Alert.alert('Puan Seçin', 'Lütfen bir yıldıza tıklayarak puan verin.');
      return;
    }
    setRatingLoading(true);
    try {
      await booksAPI.rateBook(id, selectedRating);
      setBook((prev) => ({ ...prev, userRating: selectedRating }));
      Alert.alert('Başarılı', `Kitaba ${selectedRating} yıldız verdiniz. ⭐`);
    } catch (e) {
      console.log('[BookDetail] Puanlama hatası:', e.response?.status, e.response?.data);
      Alert.alert('Hata', e.response?.data?.message || 'Puanlama başarısız oldu.');
    } finally {
      setRatingLoading(false);
    }
  };

  // ─── Favori ──────────────────────────────────────────────────────────────────
  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await booksAPI.removeFavorite(id);
        setIsFavorite(false);
      } else {
        await booksAPI.addFavorite(id);
        setIsFavorite(true);
      }
    } catch (e) {
      console.log('[BookDetail] Favori hatası:', e.response?.status, e.response?.data);
      Alert.alert('Hata', e.response?.data?.message || 'İşlem başarısız oldu.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ─── AI Özeti ────────────────────────────────────────────────────────────────
  const handleGenerateSummary = async () => {
    // Özet için kitap metni — açıklama varsa onu, yoksa başlık + yazar kullan
    const textToSummarize = book?.description?.trim()
      || `${book?.title || ''} by ${book?.author || ''}`;

    if (!textToSummarize || textToSummarize.length < 5) {
      Alert.alert(
        'Metin Gerekli',
        'Özet oluşturmak için kitaba önce bir açıklama ekleyin.'
      );
      return;
    }

    console.log('[BookDetail] AI özeti için gönderilen metin:', textToSummarize.substring(0, 100));
    setSummaryLoading(true);
    try {
      // Web: POST /ai/summarize { text, bookId }
      const res = await booksAPI.generateSummary(id, textToSummarize);
      console.log('[BookDetail] AI özet yanıtı:', JSON.stringify(res.data)?.substring(0, 400));

      // Backend farklı field'lardan biri ile döner:
      const summaryText =
        res.data?.summary ||
        res.data?.content ||
        res.data?.text ||
        res.data?.result ||
        res.data?.message ||
        (typeof res.data === 'string' ? res.data : null);

      if (!summaryText) {
        Alert.alert('Hata', 'AI özetini ayrıştıramadık. Lütfen tekrar deneyin.');
        return;
      }

      setSummary(summaryText);
      setSummaryModalVisible(true);
    } catch (e) {
      console.log('[BookDetail] AI özet hatası:', e.response?.status, JSON.stringify(e.response?.data));
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        (e.response?.status === 500 ? 'Sunucu hatası. AI servisi şu an kullanılamıyor.' : null) ||
        'AI özeti oluşturulamadı.';
      Alert.alert('AI Özet Hatası', msg);
    } finally {
      setSummaryLoading(false);
    }
  };

  // ─── Kitabı Sil ──────────────────────────────────────────────────────────────
  const handleDeleteBook = () => {
    Alert.alert(
      'Kitabı Sil',
      'Bu kitabı kütüphanenizden silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await booksAPI.delete(id);
              router.back();
            } catch (e) {
              console.log('[BookDetail] Silme hatası:', e.response?.data);
              Alert.alert('Hata', e.response?.data?.message || 'Kitap silinemedi.');
            }
          },
        },
      ]
    );
  };

  // ─── Düzenleme Modal Aç ───────────────────────────────────────────────────────
  const openEditModal = () => {
    setEditTitle(book.title || '');
    setEditAuthor(book.author || '');
    setEditGenre(book.genre || '');
    // Backend'de publishYear alanı
    setEditYear(book.publishYear ? String(book.publishYear) : (book.year ? String(book.year) : ''));
    setEditPageCount(book.pageCount ? String(book.pageCount) : '');
    setEditDescription(book.description || '');
    // Backend'de coverImage alanı
    setEditCoverUrl(book.coverImage || book.coverUrl || book.imageUrl || '');
    setEditModalVisible(true);
  };

  // ─── Düzenleme Kaydet ────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editAuthor.trim()) {
      Alert.alert('Eksik Bilgi', 'Kitap adı ve yazar zorunludur.');
      return;
    }

    if (editYear) {
      const yearParsed = parseInt(editYear);
      const currentYear = new Date().getFullYear();
      if (yearParsed > currentYear || yearParsed < 1000) {
        Alert.alert('Geçersiz Yıl', `Yayın yılı 1000 ile ${currentYear} arasında olmalıdır.`);
        return;
      }
    }

    if (editPageCount) {
      const pageParsed = parseInt(editPageCount);
      if (pageParsed <= 0) {
        Alert.alert('Geçersiz Sayfa Sayısı', 'Sayfa sayısı 0 veya negatif olamaz.');
        return;
      }
    }

    setEditLoading(true);
    try {
      // normalizeBookData coverUrl→coverImage, year→publishYear çevirisini yapar
      const payload = {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        genre: editGenre.trim() || undefined,
        year: editYear ? parseInt(editYear) : undefined,      // normalizeBookData çevirir
        pageCount: editPageCount ? parseInt(editPageCount) : undefined,
        description: editDescription.trim() || undefined,
        coverUrl: editCoverUrl.trim() || null,                 // normalizeBookData çevirir
      };
      console.log('[BookDetail] Güncelleme payload:', JSON.stringify(payload));
      await booksAPI.update(id, payload);
      // Sunucudan taze veriyi al — coverImage gibi alanlar doğru gelsin
      await fetchBook();
      setEditModalVisible(false);
      Alert.alert('Başarılı', 'Kitap bilgileri güncellendi.');
    } catch (e) {
      console.log('[BookDetail] Düzenleme hatası:', e.response?.data);
      Alert.alert('Hata', e.response?.data?.message || 'Kitap güncellenemedi.');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner message="Kitap yükleniyor..." />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchBook}>
          <Text style={styles.retryBtnText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!book) return null;

  const genreColor = colors.genreColors[book.genre] || colors.genreColors['default'];
  // Backend'de coverImage alanı
  const coverUri = book.coverImage || book.coverUrl || book.imageUrl;
  const displayRating = book.averageRating
    ? parseFloat(book.averageRating).toFixed(1)
    : book.rating
    ? parseFloat(book.rating).toFixed(1)
    : '—';

  return (
    <>
      <Stack.Screen options={{ title: book.title, headerBackTitle: 'Kütüphane' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Büyük Kapak Alanı ── */}
        <View style={[styles.coverArea, { backgroundColor: genreColor }]}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.coverImage}
              resizeMode="cover"
              onError={(e) => console.log('[BookDetail] Kapak resmi yüklenemedi:', e.nativeEvent.error)}
            />
          ) : (
            <Text style={styles.coverEmoji}>📖</Text>
          )}
          {book.genre && (
            <View style={styles.genreBadge}>
              <Text style={styles.genreBadgeText}>{book.genre}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>

          {/* Yyıl stats — publishYear veya year alanını destekle */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{book.pageCount || '—'}</Text>
              <Text style={styles.statLabel}>Sayfa</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{book.publishYear || book.year || '—'}</Text>
              <Text style={styles.statLabel}>Yıl</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{displayRating}</Text>
              <Text style={styles.statLabel}>Ort. Puan</Text>
            </View>
          </View>

          {/* Açıklama */}
          {book.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{book.description}</Text>
            </View>
          ) : null}

          {/* Düzenle & Sil */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editBtn} onPress={openEditModal} activeOpacity={0.8}>
              <Ionicons name="pencil" size={16} color={colors.text} />
              <Text style={styles.editBtnText}>Kitabı Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteBook} activeOpacity={0.8}>
              <Ionicons name="trash" size={16} color={colors.danger} />
              <Text style={styles.deleteBtnText}>Kitabı Sil</Text>
            </TouchableOpacity>
          </View>

          {/* Puanlama Kartı */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Kitabı Puanla</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={selectedRating} onRate={setSelectedRating} size={32} />
            </View>
            <Text style={styles.ratingText}>
              {selectedRating > 0 ? `Seçilen puan: ${selectedRating} / 5` : 'Yıldıza tıklayarak puan verin'}
            </Text>
            <TouchableOpacity
              style={[styles.saveRatingBtn, ratingLoading && { opacity: 0.7 }]}
              onPress={handleRateBook}
              disabled={ratingLoading}
              activeOpacity={0.8}
            >
              {ratingLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveRatingBtnText}>Puanı Kaydet</Text>}
            </TouchableOpacity>
          </View>

          {/* Favoriler Kartı */}
          <View style={styles.card}>
            <View style={styles.favoriteRow}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? colors.danger : colors.textMuted}
              />
              <View style={styles.favoriteInfo}>
                <Text style={styles.cardTitle}>
                  {isFavorite ? 'Favorilerinizde' : 'Favorilere Ekle'}
                </Text>
                <Text style={styles.favoriteSubtitle}>
                  {isFavorite ? 'Favorilerden çıkarmak için tıklayın' : 'Favori listenize eklemek için tıklayın'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.favoriteBtn,
                isFavorite ? styles.favoriteBtnActive : styles.favoriteBtnInactive,
                favoriteLoading && { opacity: 0.7 },
              ]}
              onPress={handleToggleFavorite}
              disabled={favoriteLoading}
              activeOpacity={0.8}
            >
              {favoriteLoading ? (
                <ActivityIndicator color={isFavorite ? '#fff' : colors.danger} />
              ) : (
                <Text style={[styles.favoriteBtnText, isFavorite && { color: '#fff' }]}>
                  {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Özeti Kartı */}
          <View style={[styles.card, styles.aiCard]}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiEmoji}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Yapay Zeka Özeti</Text>
                <Text style={styles.aiSubtitle}>
                  {book.description
                    ? 'Kitabın açıklamasından özet oluştur'
                    : '⚠️ Özet için önce açıklama ekleyin'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.aiBtn, summaryLoading && { opacity: 0.7 }]}
              onPress={handleGenerateSummary}
              disabled={summaryLoading}
              activeOpacity={0.8}
            >
              {summaryLoading ? (
                <View style={styles.aiBtnContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.aiBtnText}>  Özet oluşturuluyor...</Text>
                </View>
              ) : (
                <Text style={styles.aiBtnText}>✨ Özet Oluştur</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      {/* ── AI Özet Modal ── */}
      <Modal visible={summaryModalVisible} animationType="slide" transparent onRequestClose={() => setSummaryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.summaryModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🤖 Yapay Zeka Özeti</Text>
              <TouchableOpacity onPress={() => setSummaryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.summaryText}>{summary}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Düzenleme Modal ── */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kitabı Düzenle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <Text style={styles.editLabel}>Kitap Adı *</Text>
              <TextInput
                style={styles.editInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Kitabın adını girin"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.editLabel}>Yazar *</Text>
              <TextInput
                style={styles.editInput}
                value={editAuthor}
                onChangeText={setEditAuthor}
                placeholder="Yazar adını girin"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.editLabel}>Tür</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {GENRES.map((g) => (
                    <TouchableOpacity
                      key={g.label}
                      style={[
                        styles.genreChip,
                        editGenre === g.label && styles.genreChipActive,
                      ]}
                      onPress={() => setEditGenre(g.label)}
                    >
                      <Text style={styles.genreEmoji}>{g.emoji}</Text>
                      <Text style={[styles.genreText, editGenre === g.label && styles.genreTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.editLabel}>Yayın Yılı</Text>
              <TextInput
                style={styles.editInput}
                value={editYear}
                onChangeText={setEditYear}
                keyboardType="numeric"
                placeholder="örn: 2020"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.editLabel}>Sayfa Sayısı</Text>
              <TextInput
                style={styles.editInput}
                value={editPageCount}
                onChangeText={setEditPageCount}
                keyboardType="numeric"
                placeholder="örn: 350"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.editLabel}>Açıklama</Text>
              <TextInput
                style={[styles.editInput, { minHeight: 80, textAlignVertical: 'top' }]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                placeholder="Kitap hakkında kısa bir açıklama..."
                placeholderTextColor={colors.textMuted}
              />

              {/* ── Kapak URL Alanı ── */}
              <Text style={styles.editLabel}>Kapak Resmi URL</Text>

              {/* Anlık önizleme */}
              {editCoverUrl.trim() ? (
                <View style={styles.coverPreviewContainer}>
                  <Image
                    source={{ uri: editCoverUrl.trim() }}
                    style={styles.coverPreview}
                    resizeMode="cover"
                    onError={() => console.log('[Edit] Kapak önizleme yüklenemedi')}
                  />
                  <TouchableOpacity
                    style={styles.removeCoverBtn}
                    onPress={() => setEditCoverUrl('')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.danger} />
                    <Text style={styles.removeCoverText}>Kapağı Kaldır</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noCoverPlaceholder}>
                  <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.noCoverText}>Kapak resmi yok</Text>
                </View>
              )}

              <TextInput
                style={styles.editInput}
                value={editCoverUrl}
                onChangeText={setEditCoverUrl}
                placeholder="https://... (boş bırakırsan kapak kaldırılır)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />

              <TouchableOpacity
                style={[styles.saveRatingBtn, editLoading && { opacity: 0.7 }]}
                onPress={handleSaveEdit}
                disabled={editLoading}
                activeOpacity={0.8}
              >
                {editLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveRatingBtnText}>Değişiklikleri Kaydet</Text>}
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // ── Kapak ──
  coverArea: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  genreBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  genreBadgeText: { fontSize: 12, fontWeight: '600', color: colors.text },
  coverEmoji: { fontSize: 80 },

  content: { padding: 20 },
  bookTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  bookAuthor: { fontSize: 16, color: colors.textMuted, marginBottom: 20 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  description: { fontSize: 15, color: colors.text, lineHeight: 24 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 12 },
  editBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.danger, borderRadius: 12, paddingVertical: 12 },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: colors.danger },

  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  ratingRow: { marginBottom: 10 },
  ratingText: { fontSize: 14, color: colors.textMuted, marginBottom: 14 },
  saveRatingBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveRatingBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  favoriteRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  favoriteInfo: { flex: 1 },
  favoriteSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  favoriteBtn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1 },
  favoriteBtnActive: { backgroundColor: colors.danger, borderColor: colors.danger },
  favoriteBtnInactive: { backgroundColor: 'transparent', borderColor: colors.danger },
  favoriteBtnText: { fontSize: 15, fontWeight: '700', color: colors.danger },

  aiCard: { borderWidth: 2, borderColor: colors.accent },
  aiHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  aiEmoji: { fontSize: 32 },
  aiSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  aiBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  aiBtnContent: { flexDirection: 'row', alignItems: 'center' },
  aiBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // ── Modaller ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  summaryModal: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '75%' },
  editModal: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  summaryText: { fontSize: 15, color: colors.text, lineHeight: 26 },

  editLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 10 },
  editInput: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: colors.text, marginBottom: 4,
  },

  // ── Tür Filtresi (edit modal) ──
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#F1F0FF',
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginRight: 6,
  },
  genreChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genreEmoji: { fontSize: 14 },
  genreText: { fontSize: 13, fontWeight: '600', color: '#5B5B8A' },
  genreTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // ── Kapak Önizleme (edit modal) ──
  coverPreviewContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  coverPreview: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background,
  },
  removeCoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#FFF5F5',
  },
  removeCoverText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  noCoverPlaceholder: {
    height: 80,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 8,
    gap: 8,
  },
  noCoverText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
