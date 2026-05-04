import React from 'react';
import { useAuth } from '../App';
import { FiBell, FiSearch, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-slate-900/50 to-slate-950/50 backdrop-blur-lg border-b border-white/5 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search assets, tickets..."
              className="glass-input pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <FiUser size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
