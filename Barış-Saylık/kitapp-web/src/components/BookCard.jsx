import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/books/${book._id}`)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 overflow-hidden cursor-pointer transition-all duration-200 h-full"
    >
      {/* Resim Alanı */}
      <div className="relative h-48 bg-slate-50 border-b border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-slate-100');
            }}
          />
        ) : (
          <span className="text-4xl text-slate-300 group-hover:scale-110 transition-transform duration-500 ease-out">📖</span>
        )}
      </div>

      {/* İçerik Alanı */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[15px] font-semibold text-slate-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h3>
          {book.genre && (
            <span className="flex-shrink-0 bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-200/60">
              {book.genre}
            </span>
          )}
        </div>
        
        <p className="text-[13px] text-slate-500 truncate mb-4">{book.author}</p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {book.averageRating > 0 ? (
              <div className="flex items-center gap-1 bg-amber-50 rounded-md px-1.5 py-0.5 border border-amber-100">
                <span className="text-amber-500 text-[10px]">⭐</span>
                <span className="text-xs font-semibold text-amber-700">{book.averageRating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">No rating</span>
            )}
          </div>
          {book.pageCount && (
            <span className="text-[11px] text-slate-400 font-medium">{book.pageCount} pages</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
