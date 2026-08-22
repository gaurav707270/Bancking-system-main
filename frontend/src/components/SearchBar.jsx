import { FiSearch } from 'react-icons/fi';

// SearchBar: ek input field jiske andar search icon hota hai.
// value + onChange se parent component ke state se jude hota hai.
export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Search icon input ke andar left side par */}
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        className="input pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}