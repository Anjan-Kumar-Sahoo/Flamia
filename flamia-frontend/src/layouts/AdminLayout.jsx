import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineChartBarSquare,
  HiOutlineCube,
  HiOutlineClipboardDocumentList,
  HiOutlineTicket,
  HiOutlineArrowLeftOnRectangle,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { to: '/admin', icon: HiOutlineChartBarSquare, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: HiOutlineCube, label: 'Products' },
  { to: '/admin/orders', icon: HiOutlineClipboardDocumentList, label: 'Orders' },
  { to: '/admin/coupons', icon: HiOutlineTicket, label: 'Coupons' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-charcoal-50 flex">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-charcoal-900 text-ivory fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-charcoal-700">
          <span className="font-serif text-xl font-semibold tracking-wide">Flamia</span>
          <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-flame-400 font-sans font-semibold bg-flame-500/10 px-2 py-0.5 rounded">
            Admin
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-sans transition-all duration-200
                  ${isActive
                    ? 'bg-flame-500/15 text-flame-400 font-medium'
                    : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-ivory'}`
                }
                id={`admin-nav-${link.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-charcoal-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm text-charcoal-400 hover:bg-charcoal-800 hover:text-ivory transition-colors w-full"
            id="admin-logout"
          >
            <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-charcoal-900 z-40 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)} className="text-ivory" aria-label="Open sidebar">
          <HiBars3 className="w-6 h-6" />
        </button>
        <span className="font-serif text-ivory text-lg">
          Flamia <span className="text-[10px] text-flame-400 uppercase tracking-widest font-sans">Admin</span>
        </span>
        <div className="w-6" />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-900/60 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-y-0 left-0 w-64 bg-charcoal-900 z-50 lg:hidden flex flex-col"
          >
            <div className="h-14 flex items-center justify-between px-4">
              <span className="font-serif text-ivory text-lg">Flamia</span>
              <button onClick={() => setSidebarOpen(false)} className="text-ivory" aria-label="Close sidebar">
                <HiXMark className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm
                      ${isActive ? 'bg-flame-500/15 text-flame-400 font-medium' : 'text-charcoal-300 hover:bg-charcoal-800'}`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-3 border-t border-charcoal-700">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-body-sm text-charcoal-400 w-full">
                <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        </>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
