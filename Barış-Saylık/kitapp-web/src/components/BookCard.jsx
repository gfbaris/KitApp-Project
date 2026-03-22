import { useNavigate } from 'react-router-dom'

// Tür → Arka plan gradient renkleri (referans görseldeki gibi)
const genreColors = {
  'Roman':       'from-purple-100 to-purple-200',
  'Bilim Kurgu': 'from-emerald-100 to-emerald-200',
  'Tarih':       'from-amber-100 to-amber-200',
  'Polisiye':    'from-sky-100 to-sky-200',
  'Şiir':        'from-pink-100 to-pink-200',
  'Biyografi':   'from-violet-100 to-violet-200',
  'Felsefe':     'from-teal-100 to-teal-200',
  'Fantastik':   'from-orange-100 to-orange-200',
}

const genreBadgeColors = {
  'Roman':       'bg-purple-100 text-purple-700',
  'Bilim Kurgu': 'bg-emerald-100 text-emerald-700',
  'Tarih':       'bg-amber-100 text-amber-700',
  'Polisiye':    'bg-sky-100 text-sky-700',
  'Şiir':        'bg-pink-100 text-pink-700',
  'Biyografi':   'bg-violet-100 text-violet-700',
  'Felsefe':     'bg-teal-100 text-teal-700',
  'Fantastik':   'bg-orange-100 text-orange-700',
}

const BookCard = ({ book }) => {
  const navigate = useNavigate()
  const gradient = genreColors[book.genre] || 'from-indigo-100 to-indigo-200'
  const badgeColor = genreBadgeColors[book.genre] || 'bg-indigo-100 text-indigo-700'

  return (
    <div
      onClick={() => navigate(`/books/${book._id}`)}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 flex flex-col"
    >
      {/* Kapak Alanı */}
      <div className="h-44 relative flex-shrink-0">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.classList.add(`bg-gradient-to-br`, ...gradient.split(' ')) }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-5xl">📖</span>
          </div>
        )}

        {/* Tür badge */}
        {book.genre && (
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${badgeColor}`}>
            {book.genre}
          </span>
        )}
      </div>

      {/* Bilgi Alanı */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{book.author}</p>

        <div className="flex-1" />

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
          <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
            ★ {book.averageRating > 0 ? book.averageRating.toFixed(1) : (
              <span className="text-slate-400 font-normal">— puan yok</span>
            )}
          </span>
          {book.pageCount && (
            <span className="text-xs text-slate-400">{book.pageCount} sf</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookCard
