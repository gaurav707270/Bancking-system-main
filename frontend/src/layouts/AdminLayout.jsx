import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// AdminLayout: main app ka shell (khool) — sidebar, topbar aur content area.
// Login hone ke baad har logged-in page is layout ke andar dikhta hai.
export default function AdminLayout() {
  // Mobile par sidebar chhupa hota hai; is state se khola/band kiya jata hai.
  const [sidebarOpen, setSidebarOpen] = useState(false);


  
  return (
    // Poori screen height (h-screen), andar ka overflow chhupana (sidebar fixed rahe)
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Sidebar (left menu) — open/close ka control isko bheja gaya */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right side ka area: topbar + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar (top bar) — hamburger click par mobile sidebar kholta hai */}
        <Navbar onMenu={() => setSidebarOpen(true)} />
        {/* Content area — scrollable hota hai, isme page render hota hai */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Outlet = jo bhi route abhi active hai wahi page yahan dikhega */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}