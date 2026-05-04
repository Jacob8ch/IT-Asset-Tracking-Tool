import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../services/api';
import { FiPlus, FiSearch, FiFilter, FiEdit2 } from 'react-icons/fi';

export default function AssetInventory() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    asset_tag: '',
    asset_name: '',
    asset_type: 'Laptop',
    manufacturer: '',
    model: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAssets();
  }, [page, filters]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await assetService.getAssets(page, filters);
      setAssets(response.data.items);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await assetService.createAsset(newAsset);
      setShowModal(false);
      setNewAsset({ asset_tag: '', asset_name: '', asset_type: 'Laptop', manufacturer: '', model: '' });
      loadAssets();
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `badge-${status} px-3 py-1 rounded-full text-sm font-medium`;
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Asset Inventory</h1>
          <p className="text-gray-400">Manage and track all IT assets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="glass-button flex items-center gap-2"
        >
          <FiPlus size={20} />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex items-center gap-4">
        <FiFilter size={20} className="text-gray-400" />
        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="glass-input flex-1"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="repair">Repair</option>
          <option value="retired">Retired</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          className="glass-input flex-1"
        >
          <option value="">All Types</option>
          <option value="Laptop">Laptop</option>
          <option value="Desktop">Desktop</option>
          <option value="Phone">Phone</option>
          <option value="Tablet">Tablet</option>
          <option value="Monitor">Monitor</option>
        </select>
      </div>

      {/* Assets Table */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Asset Tag</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Assigned To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm font-mono text-primary">{asset.asset_tag}</td>
                    <td className="px-6 py-4 text-sm text-white">{asset.asset_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{asset.asset_type}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={getStatusBadgeClass(asset.status)}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{asset.assigned_to_user || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="text-primary hover:text-blue-400"
                      >
                        <FiEdit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="glass-button-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="glass-button-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Asset</h2>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <input
                type="text"
                placeholder="Asset Tag (Barcode)"
                value={newAsset.asset_tag}
                onChange={(e) => setNewAsset({ ...newAsset, asset_tag: e.target.value })}
                className="glass-input"
                required
              />
              <input
                type="text"
                placeholder="Asset Name"
                value={newAsset.asset_name}
                onChange={(e) => setNewAsset({ ...newAsset, asset_name: e.target.value })}
                className="glass-input"
                required
              />
              <select
                value={newAsset.asset_type}
                onChange={(e) => setNewAsset({ ...newAsset, asset_type: e.target.value })}
                className="glass-input"
              >
                <option>Laptop</option>
                <option>Desktop</option>
                <option>Phone</option>
                <option>Tablet</option>
                <option>Monitor</option>
              </select>
              <input
                type="text"
                placeholder="Manufacturer"
                value={newAsset.manufacturer}
                onChange={(e) => setNewAsset({ ...newAsset, manufacturer: e.target.value })}
                className="glass-input"
              />
              <input
                type="text"
                placeholder="Model"
                value={newAsset.model}
                onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                className="glass-input"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="glass-button flex-1"
                >
                  Create Asset
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="glass-button-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
