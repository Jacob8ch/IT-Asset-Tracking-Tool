import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { FiMenu, FiX, FiHome, FiPackage, FiGift, FiPlus, FiUsers, FiLogOut } from 'react-icons/fi';
import { BsUpcScan } from 'react-icons/bs';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/assets', icon: FiPackage, label: 'Assets' },
    { path: '/scan', icon: BsUpcScan, label: 'Scan' },
    { path: '/loaners', icon: FiGift, label: 'Loaners' },
    { path: '/tickets', icon: FiPlus, label: 'Tickets' },
    ...(user?.role === 'admin' ? [{ path: '/admin', icon: FiUsers, label: 'Admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col h-screen bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-lg border-r border-white/5 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isOpen && (
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              AssetTrack
            </h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-glow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/10 transition-all duration-200"
          >
            <FiLogOut size={20} />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar - would need mobile menu implementation */}
    </>
  );
}
