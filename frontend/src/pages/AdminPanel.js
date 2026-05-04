import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { FiEdit2, FiToggle2 } from 'react-icons/fi';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm(user);
  };

  const handleSaveUser = async () => {
    try {
      await adminService.updateUser(editingUser, editForm);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-400">Manage system users and settings</p>
      </div>

      {/* Users Management */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Users</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm text-white">{user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingUser === user.id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="glass-input text-xs"
                        >
                          <option value="admin">Admin</option>
                          <option value="technician">Technician</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="capitalize text-primary">{user.role}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingUser === user.id ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                            className="rounded"
                          />
                          <span>{editForm.is_active ? 'Active' : 'Inactive'}</span>
                        </label>
                      ) : (
                        <span className={user.is_active ? 'text-green-400' : 'text-gray-400'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingUser === user.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveUser}
                            className="glass-button text-xs py-1 px-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="glass-button-secondary text-xs py-1 px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-primary hover:text-blue-400"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Database</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Users</span>
              <span className="text-white font-medium">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white font-medium">PostgreSQL 14+</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">System</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">API Status</span>
              <span className="text-green-400">Running</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white font-medium">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
