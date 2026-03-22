import { useNavigate } from 'react-router-dom';

const genreGradients = {
  'Roman': 'from-blue-500 to-indigo-600',
  'Bilim Kurgu': 'from-purple-500 to-fuchsia-600',
  'Tarih': 'from-amber-400 to-orange-500',
  'Polisiye': 'from-slate-600 to-slate-800',
  'Şiir': 'from-rose-400 to-pink-600',
  'Biyografi': 'from-teal-500 to-emerald-600',
  'Fantastik': 'from-violet-500 to-purple-700',
  'Felsefe': 'from-indigo-500 to-cyan-600',
};

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const gradient = genreGradients[book.genre] || 'from-indigo-400 to-blue-500';

  return (
    <div
      onClick={() => navigate(`/books/${book._id}`)}
      className="group bg-white rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(79,70,229,0.15)] border border-slate-100/60 overflow-hidden transition-all duration-500 cursor-pointer flex flex-col h-full transform hover:-translate-y-2 relative"
    >
      {/* Glow Effect Arkada */}
      <div className={`absolute -inset-4 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-700 -z-10`}></div>

      {/* Kapak Görseli */}
      <div className={`relative h-[220px] rounded-3xl ${book.coverImage ? '' : `bg-gradient-to-br ${gradient}`} flex-shrink-0 overflow-hidden shadow-inner`}>
        {book.coverImage ? (
          <>
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add(`bg-gradient-to-br`, ...gradient.split(' '));
              }}
            />
            {/* Overlay Gradient (daha iyi kontrast için) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform duration-700 ease-out">
            <span className="text-6xl drop-shadow-md">📖</span>
          </div>
        )}

        {/* Tür rozeti (Badge) */}
        {book.genre && (
          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[11px] font-black tracking-wider text-slate-700 uppercase px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] group-hover:shadow-lg transition-shadow">
            {book.genre}
          </span>
        )}
      </div>

      {/* Bilgiler */}
      <div className="p-4 flex-1 flex flex-col bg-white rounded-b-[2rem] z-10">
        <h3 className="text-base font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-[13px] font-medium text-slate-500 mt-1.5 truncate">{book.author}</p>

        <div className="flex-1"></div>

        {/* Alt Bilgiler Bar */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {book.averageRating > 0 ? (
              <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-1 border border-amber-100/50">
                <span className="text-amber-500 text-xs shadow-sm">⭐</span>
                <span className="text-[13px] font-black text-amber-600">{book.averageRating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Puan Yok</span>
            )}
          </div>

          {book.pageCount ? (
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{book.pageCount} SF</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
