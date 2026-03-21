import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative flex items-center w-full max-w-sm">
      <span className="absolute left-3 text-gray-400">🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Kitap veya yazar ara..."
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-gray-800 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
