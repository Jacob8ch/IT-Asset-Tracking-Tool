import React, { useState, useEffect } from 'react';
import { assetService } from '../services/api';
import { FiPlus, FiX } from 'react-icons/fi';

export default function LoanerManagement() {
  const [activeLoaners, setActiveLoaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loanerAssets, setLoanerAssets] = useState([]);
  const [formData, setFormData] = useState({
    device_id: '',
    loaner_device_id: '',
    assigned_to_user: '',
    loan_duration_days: 7,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loanersResp, assetsResp] = await Promise.all([
        assetService.getActiveLoaners(),
        assetService.getAssets(1, { per_page: 100 }),
      ]);
      setActiveLoaners(loanersResp.data);
      setAssets(assetsResp.data.items);
      setLoanerAssets(assetsResp.data.items.filter(a => a.is_loaner));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLoaner = async (e) => {
    e.preventDefault();
    try {
      await assetService.assignLoaner(formData);
      setShowModal(false);
      setFormData({ device_id: '', loaner_device_id: '', assigned_to_user: '', loan_duration_days: 7 });
      loadData();
    } catch (error) {
      console.error('Failed to assign loaner:', error);
    }
  };

  const handleReturnLoaner = async (assignmentId) => {
    try {
      await assetService.returnLoaner(assignmentId);
      loadData();
    } catch (error) {
      console.error('Failed to return loaner:', error);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Loaner Management</h1>
          <p className="text-gray-400">Manage temporary device assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="glass-button flex items-center gap-2"
        >
          <FiPlus size={20} />
          Assign Loaner
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeLoaners.length > 0 ? (
            activeLoaners.map((loaner) => {
              const daysRemaining = getDaysUntilDue(loaner.due_date);
              const isOverdue = loaner.is_overdue;

              return (
                <div key={loaner.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {loaner.device_name} → {loaner.loaner_name}
                      </h3>
                      <p className="text-gray-400">
                        Assigned to: <span className="text-white font-medium">{loaner.assigned_to}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isOverdue
                        ? 'badge-critical'
                        : daysRemaining <= 2
                        ? 'badge-high'
                        : 'badge-medium'
                    }`}>
                      {isOverdue ? 'OVERDUE' : `${daysRemaining} days`}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 py-4 border-t border-b border-white/10">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Assigned Date</p>
                      <p className="text-white font-medium">
                        {new Date(loaner.assigned_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Due Date</p>
                      <p className="text-white font-medium">
                        {new Date(loaner.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Status</p>
                      <p className="text-white font-medium">Active</p>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => handleReturnLoaner(loaner.id)}
                        className="glass-button text-sm"
                      >
                        Mark as Returned
                      </button>
                    </div>
                  </div>

                  {loaner.notes && (
                    <p className="text-sm text-gray-400">
                      <strong>Notes:</strong> {loaner.notes}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-400">No active loaner assignments</p>
            </div>
          )}
        </div>
      )}

      {/* Assign Loaner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Assign Loaner Device</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignLoaner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Device Needing Repair</label>
                <select
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                  className="glass-input"
                  required
                >
                  <option value="">Select device...</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_name} ({asset.asset_tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Loaner Device</label>
                <select
                  value={formData.loaner_device_id}
                  onChange={(e) => setFormData({ ...formData, loaner_device_id: e.target.value })}
                  className="glass-input"
                  required
                >
                  <option value="">Select loaner...</option>
                  {loanerAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_name} ({asset.asset_tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assigned To (User)</label>
                <input
                  type="text"
                  value={formData.assigned_to_user}
                  onChange={(e) => setFormData({ ...formData, assigned_to_user: e.target.value })}
                  className="glass-input"
                  placeholder="User name or email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Loan Duration (days)</label>
                <input
                  type="number"
                  value={formData.loan_duration_days}
                  onChange={(e) => setFormData({ ...formData, loan_duration_days: parseInt(e.target.value) })}
                  className="glass-input"
                  min="1"
                  max="30"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="glass-button flex-1">
                  Assign Loaner
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
