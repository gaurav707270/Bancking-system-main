// PageHeader: har page ka top heading — title, subtitle aur right side ke buttons (actions).
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        {/* Bada title */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        {/* Chota description (optional) */}
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {/* Right side ke actions jaise Search bar ya Add button (optional) */}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}