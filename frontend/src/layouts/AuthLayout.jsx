// AuthLayout: login jaisi pages ka layout — bina sidebar ke.
// Left me bank ka brand panel, right me form (children) dikhta hai.
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Left brand panel — sirf bade screens (lg+) par dikhta hai */}
      <div className="relative hidden w-1/2 lg:block overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900">
        <div className="flex h-full flex-col justify-center p-14 text-white">
          {/* Bank ka logo + naam */}
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg font-bold text-brand-700">A</div>
            <div>
              <p className="text-lg font-bold leading-tight">ABC Co-operative Bank</p>
              <p className="text-xs text-brand-200">Core Banking System</p>
            </div>
          </div>

          {/* Marketing heading + chota paragraph */}
          <h1 className="text-3xl font-bold leading-tight">Manage all your banking operations in one place</h1>
          <p className="mt-4 max-w-md text-sm text-brand-100">
            Customers, accounts, transactions, interest, reports and audit trails —
            across all branches, in real time.
          </p>

          {/* Kuch bank ke highlight numbers */}
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              ['20,000+', 'Accounts'],
              ['₹700 Cr', 'Deposits'],
              ['3', 'Branches'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-white/10 px-4 py-3 text-center">
                <p className="text-xl font-bold">{v}</p>
                <p className="text-xs text-brand-100">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form ka area (children = Login page) */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">{children}</div>
    </div>
  );
}