import { useNavigate } from 'react-router-dom';

// Tür renkler eşlemesi
const genreColors = {
  'Roman': 'bg-blue-100 text-blue-700',
  'Bilim Kurgu': 'bg-purple-100 text-purple-700',
  'Tarih': 'bg-yellow-100 text-yellow-700',
  'Polisiye': 'bg-gray-100 text-gray-700',
  'Şiir': 'bg-pink-100 text-pink-700',
  'Fantastik': 'bg-green-100 text-green-700',
  'Felsefe': 'bg-indigo-100 text-indigo-700',
};

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const genreClass = genreColors[book.genre] || 'bg-gray-100 text-gray-600';

  return (
    <div
      onClick={() => navigate(`/books/${book._id}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 overflow-hidden group"
    >
      {/* Kapak */}
      <div className="h-44 bg-gradient-to-br from-[#1e3a5f] to-[#254b7a] flex items-center justify-center overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="text-white text-center p-4">
            <div className="text-5xl mb-2">📖</div>
            <p className="text-xs opacity-70 truncate px-2">{book.title}</p>
          </div>
        )}
      </div>

      {/* Bilgiler */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-gray-500 text-xs mb-2 truncate">{book.author}</p>

        <div className="flex items-center justify-between">
          {book.genre && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genreClass}`}>
              {book.genre}
            </span>
          )}
          {book.averageRating > 0 && (
            <span className="text-xs text-yellow-500 font-semibold">
              ⭐ {book.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
