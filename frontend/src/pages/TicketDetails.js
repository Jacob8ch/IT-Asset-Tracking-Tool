import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/api';
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const response = await ticketService.getTicket(id);
      setTicket(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await ticketService.addTicketComment(id, comment);
      setComment('');
      loadTicket();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      await ticketService.updateTicket(id, formData);
      setTicket(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full"></div>
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center text-gray-400">Ticket not found</div>;
  }

  return (
    <div className="space-y-6 animate-slideIn">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-primary hover:text-blue-400"
      >
        <FiArrowLeft size={20} />
        Back to Tickets
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{ticket.title}</h1>
          <p className="text-gray-400">Ticket: {ticket.ticket_number}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="glass-button"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Description</h2>
            {editing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="glass-input min-h-32"
              />
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
            )}

            {editing && (
              <div className="flex gap-3 mt-4">
                <button onClick={handleUpdateTicket} className="glass-button">
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(ticket);
                  }}
                  className="glass-button-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Comments & Updates</h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white">{comment.author}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No comments yet</p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex gap-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="glass-input flex-1 min-h-12"
                />
                <button
                  onClick={handleAddComment}
                  className="glass-button"
                >
                  <FiPlus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Status</p>
                {editing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="glass-input"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <span className={`badge-${ticket.status} px-3 py-1 rounded-full text-sm font-medium`}>
                    {ticket.status}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Priority</p>
                <span className={`badge-${ticket.priority} px-3 py-1 rounded-full text-sm font-medium`}>
                  {ticket.priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Type</p>
                <p className="text-white font-medium capitalize">{ticket.issue_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Created</p>
                <p className="text-white font-medium">
                  {new Date(ticket.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Assignment</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-2">Assigned To</p>
                <p className="text-white font-medium">{ticket.assigned_to_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Created By</p>
                <p className="text-white font-medium">{ticket.created_by_name}</p>
              </div>
            </div>
          </div>

          {/* Assets */}
          {ticket.assets && ticket.assets.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Related Assets</h3>
              <div className="space-y-2">
                {ticket.assets.map((asset) => (
                  <a
                    key={asset.id}
                    href={`/assets/${asset.id}`}
                    className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-primary text-sm"
                  >
                    {asset.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
