import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { booksAPI, parseListResponse } from '../../services/api';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';

export default function FavoritesScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    setError(null);
    try {
      // Web'de: GET /users/favorites
      const res = await booksAPI.getFavorites();
      console.log('[Favorites] Yanıt formatı:', typeof res.data, Array.isArray(res.data));

      const list = parseListResponse(res.data);
      setBooks(list);
    } catch (e) {
      console.log('[Favorites] Hata:', e.response?.status, JSON.stringify(e.response?.data));
      setError(
        e.response?.status === 404
          ? 'Favori endpoint bulunamadı'
          : e.response?.data?.message || 'Favoriler yüklenemedi. Lütfen tekrar deneyin.'
      );
    }
  }, []);

  // Sekmeye her dönüşte yenile
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFavorites().finally(() => setLoading(false));
    }, [fetchFavorites])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner message="Favoriler yükleniyor..." />;

  if (error) {
    return (
      <View style={styles.container}>
        <EmptyState emoji="⚠️" message={error} onRetry={fetchFavorites} retryLabel="Tekrar Dene" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            emoji="💔"
            message="Henüz favori eklemediniz. Kitap detayından kalp ikonuna tıklayarak favoriye ekleyebilirsiniz."
          />
        }
        renderItem={({ item }) => (
          <BookCard book={item} onPress={() => router.push(`/book/${item._id || item.id}`)} />
        )}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 8, paddingBottom: 24, flexGrow: 1 },
  columnWrapper: { justifyContent: 'space-between' },
});
