import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiSearch, FiUser } from 'react-icons/fi';
import { customerAPI } from '../services';

// CustomerPicker: account open karne ke form me customer select karne ke liye.
// User naam type karta hai, chhota dropdown me matching customers dikhte hain.
export default function CustomerPicker({ value, onChange, placeholder = 'Type customer name...' }) {
  const [query, setQuery] = useState(''); // jo text user type kar raha hai
  const [results, setResults] = useState([]); // search results (matching customers)
  const [open, setOpen] = useState(false); // dropdown khula hai ya nahi
  const [loading, setLoading] = useState(false); // search API chal rahi hai ya nahi
  const [selected, setSelected] = useState(null); // selected customer ka poora object
  const boxRef = useRef(null); // dropdown ke bahar click detect karne ke liye

  // Dropdown ke bahar click karne par band karo
  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Jab bhi query change ho, 300ms ke baad search karo (debounce = har keystroke par API call nahi)
  useEffect(() => {
    // Kam se kam 2 letters likhna zaroori hai
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false; // purani request ka result ignore karne ke liye
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await customerAPI.search(query.trim()); // GET /api/customers/search?q=...
        if (!cancelled) setResults(res.data.data || []);
      } catch (e) {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true; // cleanup: naya type hua to purana result mat set karo
      clearTimeout(t);
    };
  }, [query]);

  // Kisi customer par click karo to use select kar lo aur upar wale form me id bhejo
  const pick = (c) => {
    setSelected(c);
    setQuery(`${c.firstName} ${c.lastName}`); // input me naam dikhao
    setOpen(false); // dropdown band karo
    onChange(c._id); // parent component ko customer id do
  };

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        {/* Search icon input ke andar */}
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          className="input pl-10"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            onChange(''); // naya type ho raha hai to purana selection hatao
            setOpen(true); // dropdown dikhao
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          autoComplete="off"
        />
        {/* Agar customer select ho chuka hai to '✓ selected' dikhao */}
        {selected && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-600">
            ✓ selected
          </span>
        )}
      </div>
      {/* Dropdown (jab open ho): searching message, empty message ya results ki list */}
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {loading ? (
            <p className="px-4 py-3 text-sm text-slate-400">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">
              {query.trim().length < 2 ? 'Type at least 2 letters to search' : 'No customers found'}
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {results.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => pick(c)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-50 dark:hover:bg-slate-700/70"
                >
                  <FiUser className="shrink-0 text-brand-500" size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-400">{c.phone} · {c.branch?.name || '—'}</p>
                  </div>
                  {/* Agar customer ka KYC abhi 'Pending' hai toh uske saamne yellow badge dikhao
                      taaki teller ko pata chale ki ye customer abhi verify nahi hua */}
                  {c.kycStatus === 'Pending' && (
                    <span className="shrink-0 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">Pending KYC</span>
                  )}
                  {/* Jo customer pehle se select hai uske saamne tick mark dikhao */}
                  {value === c._id && <FiCheck className="shrink-0 text-brand-600" size={15} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}