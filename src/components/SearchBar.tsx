import React from "react";

interface SearchBarProps {
  search: string;
  setSearch: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleClear: () => void;
  searchError: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  search,
  setSearch,
  handleSearch,
  handleClear,
  searchError,
}) => (
  <div className="w-full flex items-center justify-between px-8 py-4 gap-4 bg-transparent">
    <form className="flex-1 flex items-center bg-white rounded-full shadow px-4 py-2 max-w-2xl">
      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      <input
        type="text"
        placeholder="Search by name"
        className="flex-1 bg-transparent outline-none text-gray-700"
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e as any);
          }
        }}
      />
      <button
        type="button"
        onClick={handleSearch as any}
        className="ml-2 text-blue-600 font-semibold"
      >
        Search
      </button>
      {search && (
        <button type="button" className="ml-2 text-gray-400 hover:text-blue-600" onClick={handleClear} title="Clear search">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </form>
    {searchError && <div className="text-red-500 text-sm text-center mb-2">{searchError}</div>}
  </div>
); 