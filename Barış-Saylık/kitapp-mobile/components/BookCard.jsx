import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../constants/colors';

export default function BookCard({ book, onPress }) {
  const genreColor = colors.genreColors[book.genre] || colors.genreColors['default'];

  const displayRating = book.averageRating
    ? parseFloat(book.averageRating).toFixed(1)
    : book.rating
    ? parseFloat(book.rating).toFixed(1)
    : book.userRating
    ? parseFloat(book.userRating).toFixed(1)
    : null;

  // Backend'de coverImage alanı (MongoDB schema)
  const hasCover = !!(book.coverImage || book.coverUrl || book.imageUrl);
  const coverUri = book.coverImage || book.coverUrl || book.imageUrl;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Kitap Kapağı Alanı */}
      <View style={[styles.coverArea, !hasCover && { backgroundColor: genreColor }]}>
        {hasCover ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.bookEmoji}>📖</Text>
        )}

        {/* Kategori Badge */}
        {book.genre && (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {book.genre}
            </Text>
          </View>
        )}
      </View>

      {/* Kitap Bilgileri */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>

        {/* Alt: Puan + Sayfa */}
        <View style={styles.meta}>
          {displayRating ? (
            <>
              <Text style={styles.star}>★</Text>
              <Text style={styles.rating}>{displayRating}</Text>
            </>
          ) : (
            <Text style={styles.noRating}>Puanlanmadı</Text>
          )}
          {book.pageCount ? (
            <Text style={styles.pages}> · {book.pageCount} sf</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    margin: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  coverArea: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    maxWidth: 80,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  bookEmoji: {
    fontSize: 44,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
    lineHeight: 18,
  },
  author: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
    color: colors.star,
  },
  rating: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 2,
  },
  noRating: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  pages: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
