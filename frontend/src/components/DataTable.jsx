import Loader from './Loader';

// DataTable: ek generic table component — columns aur data de do, table ban jayega.
// Har column me label (heading) aur render function hota hai jo ek row ke liye cell banata hai.
export default function DataTable({ columns, data, loading, emptyMessage = 'No records found' }) {
  // Data load ho raha hai to loader dikhao
  if (loading) return <Loader full={false} />;
  // Data khali hai to empty message dikhao
  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        {/* Table ka header: column ke labels */}
        <thead className="border-b border-slate-200 dark:border-slate-700">
          <tr>{columns.map((c, i) => <th key={i} className="th">{c.label}</th>)}</tr>
        </thead>
        {/* Table body: har row ke liye, har column ka render function call karo */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((row, ri) => (
            <tr key={ri} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              {columns.map((c, ci) => (
                <td key={ci} className="td">
                  {c.render ? c.render(row) : (c.key ? row[c.key] ?? '—' : '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}