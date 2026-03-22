import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook, rateBook, addFavorite, summarizeBook, updateBook, deleteBook } from '../services/api';
import { useToast } from '../context/ToastContext';

const StarRating = ({ onRate, disabled, initialRating }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(initialRating || 0);

  const handleSelect = (star) => { if (!disabled) setSelected(star); };
  const handleRate = () => { if (selected && !disabled) onRate(selected); };

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(0)}
            onClick={() => handleSelect(star)}
            className={`text-xl transition-colors ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:scale-110'} ${(star <= (hovered || selected)) ? 'text-amber-400' : 'text-slate-200'} `}
          >
            ★
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleRate}
        disabled={!selected || disabled}
        className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 disabled:opacity-50 transition-colors"
      >
        Submit
      </button>
    </div>
  );
};

const UpdateModal = ({ book, onClose, onUpdated }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: book.title || '', author: book.author || '', genre: book.genre || '',
    description: book.description || '', coverImage: book.coverImage || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBook(book._id, form);
      showToast('Book updated', 'success');
      onUpdated();
      onClose();
    } catch {
      setError('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Edit Book</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6">
          {error && <div className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {['title', 'author', 'genre', 'coverImage'].map((field) => (
              <div key={field}>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5 capitalize">{field.replace('Image', ' Image URL')}</label>
                <input name={field} value={form[field]} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900" />
              </div>
            ))}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} rows={4} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 resize-none" />
            </div>
            <div className="flex gap-3 pt-4">
               <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium transition">Cancel</button>
               <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition flex justify-center items-center">
                 {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Changes'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [rateLoading, setRateLoading] = useState(false);
  const [rateDisabled, setRateDisabled] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favAdded, setFavAdded] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadBook = async () => {
    try {
      const res = await getBook(bookId);
      setBook(res.data.book || res.data);
    } catch {
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBook(); }, [bookId]);

  const handleRate = async (score) => {
    setRateLoading(true);
    try {
      await rateBook(bookId, score);
      showToast('Rating saved', 'success');
      setRateDisabled(true);
      loadBook();
    } catch (err) {
      if (err.response?.status === 409) setRateDisabled(true);
      showToast('Rating failed', 'error');
    } finally { setRateLoading(false); }
  };

  const handleFavorite = async () => {
    setFavLoading(true);
    try {
      await addFavorite(bookId);
      setFavAdded(true);
      showToast('Added to favorites', 'success');
    } catch (err) {
      if (err.response?.status === 409) setFavAdded(true);
      showToast('Already in favorites', 'info');
    } finally { setFavLoading(false); }
  };

  const handleSummarize = async () => {
    if (!book?.description) return;
    setSummaryLoading(true);
    try {
      const res = await summarizeBook(book.description, bookId);
      setSummary(res.data.summary || 'Summary unavailable');
    } catch { showToast('AI processing failed', 'error'); } 
    finally { setSummaryLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${book?.title}" permanently?`)) return;
    try {
      await deleteBook(bookId);
      navigate('/home');
    } catch { showToast('Failed to delete', 'error'); }
  };

  if (loading) {
     return <div className="p-8 text-sm text-slate-500 flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin rounded-full"></div> Loading book details...</div>;
  }
  if (!book) {
     return <div className="p-8 text-sm text-slate-500">Book not found.</div>;
  }

  return (
    <div className="py-8 px-6 max-w-5xl mx-auto w-full">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center gap-3 text-[13px] font-medium text-slate-500 mb-8 border-b border-slate-200 pb-4">
        <button onClick={() => navigate('/home')} className="hover:text-slate-900 transition-colors">Library</button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 truncate max-w-[200px]">{book.title}</span>
        
        <div className="ml-auto flex items-center gap-2">
           <button onClick={() => setShowUpdateModal(true)} className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">Edit</button>
           <button onClick={handleDelete} className="px-3 py-1.5 border border-rose-200 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition-colors shadow-sm">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        
        {/* Sol Kolon - Detaylar */}
        <div>
           <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
              <div className="w-full md:w-56 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden aspect-[2/3] shadow-sm flex items-center justify-center">
                 {book.coverImage ? (
                   <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl">📖</span>
                 )}
              </div>
              <div className="flex-1">
                 {book.genre && <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold uppercase tracking-wider rounded-md mb-4">{book.genre}</span>}
                 <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-tight mb-2">{book.title}</h1>
                 <p className="text-lg text-slate-500 mb-6">{book.author}</p>
                 
                 <div className="flex gap-6 border-y border-slate-200 py-4 mb-6">
                    <div>
                       <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Rating</p>
                       <p className="text-sm font-medium text-slate-900">{book.averageRating > 0 ? `${book.averageRating.toFixed(1)} / 5.0` : '—'}</p>
                    </div>
                    <div>
                       <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Pages</p>
                       <p className="text-sm font-medium text-slate-900">{book.pageCount || '—'}</p>
                    </div>
                    <div>
                       <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Published</p>
                       <p className="text-sm font-medium text-slate-900">{book.publishYear || '—'}</p>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                    <p className="text-[15px] leading-relaxed text-slate-700">{book.description || <span className="text-slate-400 italic">No description available.</span>}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Sağ Kolon - Aksiyon Kartları */}
        <div className="space-y-4">
           {/* Kart 1: Rate */}
           <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
             <h3 className="text-sm font-semibold text-slate-900 mb-3">Rate Book</h3>
             <StarRating onRate={handleRate} disabled={rateDisabled || rateLoading} />
           </div>

           {/* Kart 2: Favorite */}
           <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                 <h3 className="text-sm font-semibold text-slate-900">Collection</h3>
                 <p className="text-xs text-slate-500 mt-0.5">Add to your favorites</p>
              </div>
              <button onClick={handleFavorite} disabled={favAdded || favLoading} className={`p-2.5 rounded-lg border transition-colors ${favAdded ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-rose-500'}`}>
                 <svg className={`w-5 h-5 ${favAdded ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
           </div>

           {/* Kart 3: AI Summary */}
           <div className="bg-slate-900 rounded-xl p-5 text-white shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-indigo-400">✨</span>
                 <h3 className="text-sm font-semibold">AI Analysis</h3>
              </div>
              {summary ? (
                 <p className="text-[13px] text-slate-300 leading-relaxed bg-white/5 rounded-lg p-3">{summary}</p>
              ) : (
                 <>
                   <p className="text-xs text-slate-400 mb-4">Generate an intelligent summary based on the book description.</p>
                   <button onClick={handleSummarize} disabled={!book.description || summaryLoading} className="w-full py-2 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 flex justify-center items-center">
                      {summaryLoading ? <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></div> : 'Generate Summary'}
                   </button>
                 </>
              )}
           </div>
        </div>

      </div>

      {showUpdateModal && <UpdateModal book={book} onClose={() => setShowUpdateModal(false)} onUpdated={loadBook} />}
    </div>
  );
};

export default BookDetailPage;
