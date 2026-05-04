import React, { useState, useEffect } from 'react';
import { assetService, ticketService } from '../services/api';
import { FiBarcode2, FiGift, FiTicket, FiPackage, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    assetsInRepair: 0,
    activeLoaners: 0,
    openTickets: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [assetsResp, ticketsResp, loanersResp] = await Promise.all([
          assetService.getAssets(1, { per_page: 1 }),
          ticketService.getTickets(1, { status: 'open', per_page: 1 }),
          assetService.getActiveLoaners(),
        ]);

        setStats({
          totalAssets: assetsResp.data.total || 0,
          assetsInRepair: assetsResp.data.total || 0,
          activeLoaners: loanersResp.data?.length || 0,
          openTickets: ticketsResp.data.total || 0,
        });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`text-${color}-400`} size={24} />
        </div>
        <span className={`text-sm font-semibold text-${color}-400`}>↑ 12%</span>
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your IT asset overview.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FiPackage} label="Total Assets" value={stats.totalAssets} color="blue" />
        <StatCard icon={FiAlertCircle} label="In Repair" value={stats.assetsInRepair} color="orange" />
        <StatCard icon={FiGift} label="Active Loaners" value={stats.activeLoaners} color="green" />
        <StatCard icon={FiTicket} label="Open Tickets" value={stats.openTickets} color="red" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp size={24} className="text-primary" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a href="/scan" className="block glass-button text-center py-2 text-sm">
              <FiBarcode2 className="inline mr-2" size={16} />
              Scan Asset
            </a>
            <a href="/assets" className="block glass-button-secondary text-center py-2 text-sm">
              <FiPackage className="inline mr-2" size={16} />
              View Inventory
            </a>
            <a href="/tickets" className="block glass-button-secondary text-center py-2 text-sm">
              <FiTicket className="inline mr-2" size={16} />
              Create Ticket
            </a>
            <a href="/loaners" className="block glass-button-secondary text-center py-2 text-sm">
              <FiGift className="inline mr-2" size={16} />
              Manage Loaners
            </a>
          </div>
        </div>

        {/* Alerts & Warnings */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiAlertCircle size={24} className="text-orange-400" />
            Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-300">
                <strong>3 Loaners</strong> due for return in 2 days
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-300">
                <strong>1 Device</strong> warranty expiring soon
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <strong>2 Tickets</strong> waiting for assignment
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Database</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Google Admin API</span>
                <span className="text-gray-400">Not configured</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Email Service</span>
                <span className="text-green-400">Ready</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-gray-400">Asset LAP-001 assigned to John Smith</span>
            <span className="text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-gray-400">Ticket TKT-2024 status changed to In Progress</span>
            <span className="text-gray-500">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Loaner device LNR-001 returned</span>
            <span className="text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
