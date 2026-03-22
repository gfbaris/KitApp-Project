import { useState, useEffect, useCallback } from 'react';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import { getBooks, filterBooks, addBook, searchBooks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const GENRES = ['All', 'Roman', 'Bilim Kurgu', 'Tarih', 'Polisiye', 'Şiir', 'Biyografi'];

const AddBookModal = ({ onClose, onAdded }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: '', author: '', genre: 'Roman',
    pageCount: '', publishYear: '', description: '', coverImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.pageCount) payload.pageCount = Number(payload.pageCount);
      else delete payload.pageCount;
      if (payload.publishYear) payload.publishYear = Number(payload.publishYear);
      else delete payload.publishYear;
      if (!payload.coverImage) delete payload.coverImage;
      
      await addBook(payload);
      showToast('Book successfully added', 'success');
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200 transform transition-all max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Add New Book</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-lg px-4 py-3 mb-5 text-[13px] font-medium flex items-center gap-2"><span>⚠️</span> {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Book Title *</label>
              <input name="title" required value={form.title} onChange={handleChange} placeholder="The Great Gatsby" className="w-full border border-slate-200 bg-white shadow-sm rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 text-slate-900 transition" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Author *</label>
              <input name="author" required value={form.author} onChange={handleChange} placeholder="F. Scott Fitzgerald" className="w-full border border-slate-200 bg-white shadow-sm rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 text-slate-900 transition" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Genre</label>
              <select name="genre" value={form.genre} onChange={handleChange} className="w-full border border-slate-200 bg-white shadow-sm rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 text-slate-900 transition cursor-pointer">
                {GENRES.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Pages</label>
                <input name="pageCount" type="number" min="1" value={form.pageCount} onChange={handleChange} placeholder="218" className="w-full border border-slate-200 bg-white shadow-sm rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 text-slate-900 transition" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Year</label>
                <input name="publishYear" type="number" min="1000" max="2099" value={form.publishYear} onChange={handleChange} placeholder="1925" className="w-full border border-slate-200 bg-white shadow-sm rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 text-slate-900 transition" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="A brief summary..." className="w-full border border-slate-200 bg-white shadow-sm rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 text-slate-900 transition resize-none" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Cover Image URL</label>
              <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..." className="w-full border border-slate-200 bg-white shadow-sm rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 text-slate-900 transition" />
            </div>

            <div className="flex gap-3 pt-6">
              <button type="button" onClick={onClose} className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-lg py-2.5 text-[14px] font-medium hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white rounded-lg py-2.5 text-[14px] font-medium shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Add Book'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

// ─── Ana Sayfa ───────────────────────────────────────
const HomePage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const loadBooks = useCallback(async (genre = 'All') => {
    setLoading(true);
    try {
      const res = genre && genre !== 'All'
        ? await filterBooks(genre)
        : await getBooks();
      
      let booksData = [];
      if (Array.isArray(res.data?.data)) booksData = res.data.data;
      else if (Array.isArray(res.data?.books)) booksData = res.data.books;
      else if (Array.isArray(res.data)) booksData = res.data;
      
      setBooks(booksData);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks('All');
  }, [loadBooks]);

  const handleGenreFilter = (genre) => {
    setActiveGenre(genre);
    setSearchQuery('');
    setSearchResults(null);
    loadBooks(genre);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
       setSearchResults(null);
       return;
    }
    setLoading(true);
    try {
      const res = await searchBooks(query);
      let booksData = [];
      if (Array.isArray(res.data?.data)) booksData = res.data.data;
      else if (Array.isArray(res.data?.books)) booksData = res.data.books;
      else if (Array.isArray(res.data)) booksData = res.data;
      setSearchResults(booksData);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedBooks = searchResults !== null ? searchResults : books;

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Library</h1>
          <p className="text-[14px] text-slate-500 mt-1">Manage and read your collection of {books.length} books.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
             <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             <input
               type="text"
               placeholder="Search books..."
               value={searchQuery}
               onChange={handleSearch}
               className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 shadow-sm"
             />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium shadow-sm border border-transparent hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
          >
            Add Book
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => handleGenreFilter(genre)}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeGenre === genre
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayedBooks.length === 0 ? (
        <div className="border border-slate-200 border-dashed rounded-2xl bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
             <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900 mb-1">
            {searchQuery ? 'No search results' : 'No books found'}
          </h3>
          <p className="text-[14px] text-slate-500 max-w-sm mb-6">
            {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : "You don't have any books in this category yet. Add your first book to get started."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors"
            >
              Add Book
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayedBooks.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}

      {showModal && (
        <AddBookModal
          onClose={() => setShowModal(false)}
          onAdded={() => loadBooks(activeGenre)}
        />
      )}
    </div>
  );
};

export default HomePage;
