import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0d12] text-zinc-900 dark:text-zinc-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-12 animate-in fade-in-50 duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
