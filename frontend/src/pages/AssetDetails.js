import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetService } from '../services/api';
import { FiArrowLeft, FiEdit2, FiDownload, FiCopy } from 'react-icons/fi';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadAsset();
  }, [id]);

  const loadAsset = async () => {
    try {
      const response = await assetService.getAsset(id);
      setAsset(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to load asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await assetService.updateAsset(id, formData);
      setAsset(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update asset:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full"></div>
      </div>
    );
  }

  if (!asset) {
    return <div className="text-center text-gray-400">Asset not found</div>;
  }

  return (
    <div className="space-y-6 animate-slideIn">
      <button
        onClick={() => navigate('/assets')}
        className="flex items-center gap-2 text-primary hover:text-blue-400"
      >
        <FiArrowLeft size={20} />
        Back to Inventory
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{asset.asset_name}</h1>
          <p className="text-gray-400">Asset Tag: {asset.asset_tag}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="glass-button flex items-center gap-2"
        >
          <FiEdit2 size={20} />
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Asset Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Type</label>
                {editing ? (
                  <select
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                    className="glass-input"
                  >
                    <option>Laptop</option>
                    <option>Desktop</option>
                    <option>Phone</option>
                    <option>Tablet</option>
                  </select>
                ) : (
                  <p className="text-white font-medium">{asset.asset_type}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Status</label>
                {editing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="glass-input"
                  >
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="repair">Repair</option>
                    <option value="retired">Retired</option>
                  </select>
                ) : (
                  <span className={`badge-${asset.status} px-3 py-1 rounded-full text-sm font-medium inline-block`}>
                    {asset.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Manufacturer</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="glass-input"
                  />
                ) : (
                  <p className="text-white font-medium">{asset.manufacturer || '-'}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Model</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="glass-input"
                  />
                ) : (
                  <p className="text-white font-medium">{asset.model || '-'}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Serial Number</label>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{asset.serial_number || '-'}</p>
                  {asset.serial_number && (
                    <button className="text-gray-400 hover:text-white">
                      <FiCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Location</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="glass-input"
                  />
                ) : (
                  <p className="text-white font-medium">{asset.location || '-'}</p>
                )}
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} className="glass-button">
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(asset);
                  }}
                  className="glass-button-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Maintenance History */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Maintenance History</h2>
            {asset.maintenance_records && asset.maintenance_records.length > 0 ? (
              <div className="space-y-3">
                {asset.maintenance_records.map((record) => (
                  <div key={record.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white capitalize">{record.maintenance_type}</p>
                      <span className={`badge-${record.status} text-xs px-2 py-1 rounded`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{record.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.start_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No maintenance records yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Assigned To</p>
                <p className="text-white font-medium">{asset.assigned_to_user || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Organizational Unit</p>
                <p className="text-white font-medium">{asset.assigned_to_ou || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Created</p>
                <p className="text-white font-medium">
                  {new Date(asset.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full glass-button text-sm">
                <FiDownload className="inline mr-2" size={16} />
                Generate QR Code
              </button>
              <button className="w-full glass-button-secondary text-sm">
                Assign Loaner
              </button>
              <button className="w-full glass-button-secondary text-sm">
                Record Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
