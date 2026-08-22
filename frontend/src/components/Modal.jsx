import { FiX } from 'react-icons/fi';

// Modal: popup box — bina open par kuch nahi dikhta, open par overlay + box dikhta hai.
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  // open false hai to kuch mat render karo (khaali jagah bhi nahi)
  if (!open) return null;
  // Size ke hisaab se max width: sm = small, md = medium, lg = large
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark background overlay — click karne se modal band hota hai */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      {/* Main modal box: bada content aaya to andar scroll hota hai (max-h-[90vh]) */}
      <div className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 shadow-2xl`}>
        {/* Modal ka header: title + close (X) button. Sticky = scroll karte waqt upar hi rahta hai */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 rounded-t-xl z-10">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <FiX size={20} />
          </button>
        </div>
        {/* Modal ka body content yahan aata hai (form wagera) */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}