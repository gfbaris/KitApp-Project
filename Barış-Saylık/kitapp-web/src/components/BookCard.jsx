import { useNavigate } from 'react-router-dom';

const genreColors = {
  'Roman': 'bg-blue-100/80 text-blue-700 border-blue-200',
  'Bilim Kurgu': 'bg-purple-100/80 text-purple-700 border-purple-200',
  'Tarih': 'bg-yellow-100/80 text-yellow-700 border-yellow-200',
  'Polisiye': 'bg-slate-100/80 text-slate-700 border-slate-200',
  'Şiir': 'bg-pink-100/80 text-pink-700 border-pink-200',
  'Fantastik': 'bg-emerald-100/80 text-emerald-700 border-emerald-200',
  'Felsefe': 'bg-indigo-100/80 text-indigo-700 border-indigo-200',
};

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const genreStyle = genreColors[book.genre] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div
      onClick={() => navigate(`/books/${book._id}`)}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer border border-gray-100/80 overflow-hidden flex flex-col hover:-translate-y-1"
    >
      {/* Resim Alanı */}
      <div className="relative h-56 w-full bg-gradient-to-br from-[#1e3a5f] to-[#3a5b8c] overflow-hidden">
        {book.coverImage ? (
          <>
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Resim üstü karartma */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/50 group-hover:text-white/80 transition-colors">
            <span className="text-6xl mb-2 drop-shadow-md">📖</span>
            <span className="text-sm px-4 text-center truncate w-full">{book.title}</span>
          </div>
        )}

        {/* Puan Badge'i (Resim üzerinde) */}
        {book.averageRating > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-amber-500 shadow-sm flex items-center gap-1">
            ⭐ {book.averageRating.toFixed(1)}
          </div>
        )}
      </div>

      {/* İçerik Alanı */}
      <div className="p-5 flex-1 flex flex-col bg-white">
        <div className="mb-auto">
          <h3 className="font-extrabold text-gray-800 text-base leading-tight line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-gray-500 text-sm font-medium truncate mb-3">{book.author}</p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          {book.genre ? (
            <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border ${genreStyle}`}>
              {book.genre}
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide bg-gray-50 text-gray-400 border border-gray-100">
              Diğer
            </span>
          )}
          
          <span className="text-xs font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            İncele <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
