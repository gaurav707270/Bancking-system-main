// Loader: loading spinner — full=true to poore page me center me, warna chhota.
export default function Loader({ full = true, label = 'Loading...' }) {
  return (
    <div className={`flex ${full ? 'min-h-[40vh]' : ''} flex-col items-center justify-center gap-3 text-brand-600`}>
      {/* Spinning circle: border wala div rotate hota hai (animate-spin) */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}