import { useNavigate } from 'react-router-dom';

// Tür → gradyan renk eşlemesi (arka plan için)
const genreGradients = {
  'Roman': 'from-blue-400 to-blue-600',
  'Bilim Kurgu': 'from-purple-400 to-indigo-600',
  'Tarih': 'from-amber-400 to-orange-500',
  'Polisiye': 'from-gray-500 to-gray-700',
  'Şiir': 'from-pink-400 to-rose-500',
  'Biyografi': 'from-teal-400 to-emerald-600',
  'Fantastik': 'from-violet-400 to-purple-600',
  'Felsefe': 'from-indigo-400 to-blue-600',
};

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const gradient = genreGradients[book.genre] || 'from-indigo-400 to-indigo-600';

  return (
    <div
      onClick={() => navigate(`/books/${book._id}`)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Kapak Alanı */}
      <div className={`relative h-40 ${book.coverImage ? '' : `bg-gradient-to-br ${gradient}`} flex-shrink-0`}>
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add(`bg-gradient-to-br`, ...gradient.split(' '));
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            <span className="text-5xl">📖</span>
          </div>
        )}
        {/* Tür badge */}
        {book.genre && (
          <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-medium text-gray-700 px-2 py-0.5 rounded-full shadow-sm">
            {book.genre}
          </span>
        )}
      </div>

      {/* Bilgi Alanı */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {book.title}
        </p>
        <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>

        <div className="flex-1"></div>

        {/* Alt Bilgiler */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs font-medium text-amber-500">
            {book.averageRating > 0
              ? `⭐ ${book.averageRating.toFixed(1)}`
              : <span className="text-gray-400">Henüz puan yok</span>}
          </span>
          {book.pageCount ? (
            <span className="text-xs text-gray-400">{book.pageCount} sf</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
