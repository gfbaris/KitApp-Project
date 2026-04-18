import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { booksAPI, aiAPI, parseListResponse } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';

// Kart genişliği — 2 sütun, 8px padding + 4px boşluk arası
const CARD_WIDTH = (Dimensions.get('window').width - 16 - 8) / 2;

const GENRES = [
  { label: 'Hepsi', emoji: '📚' },
  { label: 'Roman', emoji: '📝' },
  { label: 'Bilim Kurgu', emoji: '🚀' },
  { label: 'Tarih', emoji: '🏰' },
  { label: 'Polisiye', emoji: '🕵️' },
  { label: 'Biyografi', emoji: '👤' },
  { label: 'Şiir', emoji: '🎶' },
  { label: 'Diğer', emoji: '🔖' },
];

export default function LibraryScreen() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('Hepsi');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Kitap ekleme form
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formPageCount, setFormPageCount] = useState('');
  const [formGenre, setFormGenre] = useState('Roman');
  const [formYear, setFormYear] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const searchDebounceRef = useRef(null);

  // ─── Kitapları getir ───────────────────────────────────────────────────────
  const fetchBooks = useCallback(async (genre = 'Hepsi', page = 1, query = '') => {
    setError(null);
    try {
      let res;
      if (query && query.trim()) {
        res = await booksAPI.search(query.trim(), page);
      } else if (genre && genre !== 'Hepsi') {
        res = await booksAPI.getByGenre(genre, page);
      } else {
        res = await booksAPI.getAll(page);
      }
      
      setBooks(parseListResponse(res.data));
      
      // Sayfalama bilgisini güncelle
      if (res.data?.pagination) {
        setCurrentPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (e) {
      console.log('[Library] Kitap yükleme hatası:', e.response?.data);
      setError(e.response?.data?.message || 'Kitaplar yüklenemedi. Lütfen tekrar deneyin.');
    }
  }, []);

  // ─── İlk yükleme ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchBooks('Hepsi', 1, '');
      setLoading(false);
    };
    init();
  }, []);

  // ─── Sekmeye dönünce listeyi sessizce yenile (silinen kitap hemen gitsin) ────
  const initialLoadDone = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (initialLoadDone.current) {
        fetchBooks(selectedGenre, currentPage, searchQuery); 
      } else {
        initialLoadDone.current = true;
      }
    }, [selectedGenre, currentPage, searchQuery, fetchBooks])
  );

  // ─── Kategori değişince ────────────────────────────────────────────────────
  const handleGenreChange = async (genre) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    await fetchBooks(genre, 1, '');
  };

  // ─── Arama (500ms debounce) ────────────────────────────────────────────────
  const handleSearch = (text) => {
    setSearchQuery(text);
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!text.trim()) {
      fetchBooks(selectedGenre, 1, '');
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      await fetchBooks(selectedGenre, 1, text.trim());
      setIsSearching(false);
    }, 500);
  };

  // ─── Pull-to-refresh ───────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBooks(selectedGenre, currentPage, searchQuery);
    setRefreshing(false);
  };

  // ─── Form sıfırla ──────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormPageCount('');
    setFormGenre('Roman');
    setFormYear('');
    setFormDescription('');
    setFormCoverUrl('');
  };

  // ─── Kitap Ekle ────────────────────────────────────────────────────────────
  const handleAddBook = async () => {
    if (!formTitle.trim() || !formAuthor.trim()) {
      Alert.alert('Eksik Bilgi', 'Kitap adı ve yazar zorunludur.');
      return;
    }

    if (formYear) {
      const yearParsed = parseInt(formYear);
      const currentYear = new Date().getFullYear();
      if (yearParsed > currentYear || yearParsed < 1000) {
        Alert.alert('Geçersiz Yıl', `Yayın yılı 1000 ile ${currentYear} arasında olmalıdır.`);
        return;
      }
    }

    if (formPageCount) {
      const pageParsed = parseInt(formPageCount);
      if (pageParsed <= 0) {
        Alert.alert('Geçersiz Sayfa Sayısı', 'Sayfa sayısı 0 veya negatif olamaz.');
        return;
      }
    }

    setFormLoading(true);
    try {
      const bookData = {
        title: formTitle.trim(),
        author: formAuthor.trim(),
        genre: formGenre,
        pageCount: formPageCount ? parseInt(formPageCount) : undefined,
        year: formYear ? parseInt(formYear) : new Date().getFullYear(),
        description: formDescription.trim(),
        coverUrl: formCoverUrl.trim() || undefined,
      };

      console.log('[Library] Gönderilen kitap verisi:', JSON.stringify(bookData));
      const res = await booksAPI.create(bookData);
      console.log('[Library] Kitap ekleme yanıtı:', JSON.stringify(res.data));

      setModalVisible(false);
      resetForm();

      // KRİTİK: Listeyi yenile → yeni kitap görünsün
      await fetchBooks(selectedGenre, currentPage, searchQuery);

      Alert.alert('Başarılı', 'Kitap kütüphanenize eklendi! 📚');
    } catch (e) {
      console.log('[Library] Kitap ekleme hatası:', e.response?.status, e.response?.data);
      Alert.alert(
        'Kitap Eklenemedi',
        e.response?.data?.message || e.response?.data?.error || 'Sunucu hatası oluştu.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Kütüphane yükleniyor..." />;

  return (
    <View style={styles.container}>
      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kitap veya yazar ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Kategori Filtreleri — Modern Pill Tasarım */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genreScroll}
        contentContainerStyle={styles.genreContent}
      >
        {GENRES.map((genre) => {
          const isActive = selectedGenre === genre.label;
          return (
            <TouchableOpacity
              key={genre.label}
              style={[styles.genreChip, isActive && styles.genreChipActive]}
              onPress={() => handleGenreChange(genre.label)}
              activeOpacity={0.75}
            >
              <Text style={styles.genreEmoji}>{genre.emoji}</Text>
              <Text style={[styles.genreText, isActive && styles.genreTextActive]}>
                {genre.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error ? (
        <EmptyState emoji="⚠️" message={error} onRetry={() => fetchBooks(selectedGenre, currentPage, searchQuery)} retryLabel="Tekrar Dene" />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item._id || item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji="📚"
              message={searchQuery ? `"${searchQuery}" için sonuç bulunamadı.` : 'Kütüphaneniz boş. İlk kitabınızı ekleyin!'}
              onRetry={searchQuery ? () => handleSearch('') : () => setModalVisible(true)}
              retryLabel={searchQuery ? 'Aramayı Temizle' : 'Kitap Ekle'}
            />
          }
          renderItem={({ item }) => (
            // Sabit genişlik — liste yenilenince kart boyutu değişmez
            <View style={{ width: CARD_WIDTH, margin: 4 }}>
              <BookCard
                book={item}
                onPress={() => router.push(`/book/${item._id || item.id}`)}
              />
            </View>
          )}
          columnWrapperStyle={styles.columnWrapper}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.paginationContainer}>
                <TouchableOpacity 
                  style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} 
                  disabled={currentPage === 1}
                  onPress={() => fetchBooks(selectedGenre, currentPage - 1, searchQuery)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
                <Text style={styles.pageText}>{currentPage} / {totalPages}</Text>
                <TouchableOpacity 
                  style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                  disabled={currentPage === totalPages}
                  onPress={() => fetchBooks(selectedGenre, currentPage + 1, searchQuery)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
              </View>
            ) : <View style={{ height: 24 }} />
          }
        />
      )}

      {/* Kitap Ekle Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📚 Kitap Ekle</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalLabel}>Kitap Adı *</Text>
                <TextInput style={styles.modalInput} placeholder="Kitabın adını girin" placeholderTextColor={colors.textMuted} value={formTitle} onChangeText={setFormTitle} />

                <Text style={styles.modalLabel}>Yazar *</Text>
                <TextInput style={styles.modalInput} placeholder="Yazar adını girin" placeholderTextColor={colors.textMuted} value={formAuthor} onChangeText={setFormAuthor} />

                <Text style={styles.modalLabel}>Sayfa Sayısı</Text>
                <TextInput style={styles.modalInput} placeholder="örn: 350" placeholderTextColor={colors.textMuted} value={formPageCount} onChangeText={setFormPageCount} keyboardType="numeric" />

                <Text style={styles.modalLabel}>Tür Seç *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {GENRES.filter((g) => g.label !== 'Hepsi').map((g) => (
                      <TouchableOpacity
                        key={g.label}
                        style={[
                          styles.genreChip,
                          { marginRight: 0 },
                          formGenre === g.label && styles.genreChipActive,
                        ]}
                        onPress={() => setFormGenre(g.label)}
                      >
                        <Text style={styles.genreEmoji}>{g.emoji}</Text>
                        <Text style={[styles.genreText, formGenre === g.label && styles.genreTextActive]}>
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.modalLabel}>Kitap Kapak URL</Text>
                {formCoverUrl.trim() ? (
                  <Image
                    source={{ uri: formCoverUrl.trim() }}
                    style={styles.coverPreview}
                    resizeMode="cover"
                  />
                ) : null}
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://... (opsiyonel)"
                  placeholderTextColor={colors.textMuted}
                  value={formCoverUrl}
                  onChangeText={setFormCoverUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <Text style={styles.modalLabel}>Yayın Yılı</Text>
                <TextInput style={styles.modalInput} placeholder="örn: 2020" placeholderTextColor={colors.textMuted} value={formYear} onChangeText={setFormYear} keyboardType="numeric" />

                <Text style={styles.modalLabel}>Açıklama</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Kitap hakkında kısa bir açıklama..."
                  placeholderTextColor={colors.textMuted}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.addBookBtn, formLoading && { opacity: 0.7 }]}
                  onPress={handleAddBook}
                  disabled={formLoading}
                  activeOpacity={0.85}
                >
                  {formLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBookBtnText}>Kitabı Ekle</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  addButton: {
    backgroundColor: colors.primary, width: 44, height: 44,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  // ─── Modern Genre Filtre ───────────────────────────────────────────────────────────────
  genreScroll: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 52,         // Sabit boyut
    minHeight: 52,      // Sabit boyut
    maxHeight: 52,      // Sabit boyut
    flexGrow: 0,        // Asla büyümesin
    flexShrink: 0,      // Asla küçülmesin
  },
  genreContent: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  // Genre chip — SABİT genişlik, asla büyümez
  genreEmoji: { fontSize: 14 },
  genreText: { fontSize: 13, fontWeight: '600', color: '#5B5B8A' },
  genreTextActive: { color: '#FFFFFF', fontWeight: '700' },
  // ───────────────────────────────────────────────────────────────────────────
  listContent: { padding: 4, paddingBottom: 100 },
  columnWrapper: { flexDirection: 'row', justifyContent: 'flex-start' },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  pageBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
  },
  pageBtnDisabled: {
    opacity: 0.6,
    backgroundColor: colors.background,
  },
  pageText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  recommendSection: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, paddingHorizontal: 8, marginBottom: 10 },
  recommendContent: { paddingHorizontal: 8, gap: 12 },
  recCard: { width: 120, marginRight: 0 },
  recCover: { height: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  recEmoji: { fontSize: 32 },
  recTitle: { fontSize: 12, fontWeight: '600', color: colors.text, lineHeight: 16 },
  recAuthor: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, maxHeight: '92%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 4 },
  modalInput: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.text, marginBottom: 12,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  coverPreview: {
    width: '100%', height: 140, borderRadius: 12,
    marginBottom: 8, backgroundColor: colors.background,
  },
  addBookBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 8,
  },
  addBookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
