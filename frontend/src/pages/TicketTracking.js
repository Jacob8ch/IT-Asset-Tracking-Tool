import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../services/api';
import { FiPlus, FiSearch } from 'react-icons/fi';

export default function TicketTracking() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    issue_type: 'hardware',
    priority: 'medium',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadTickets();
  }, [page, filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTickets(page, filters);
      setTickets(response.data.items);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await ticketService.createTicket(newTicket);
      setShowModal(false);
      navigate(`/tickets/${response.data.ticket_id}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'blue',
    };
    return colors[priority] || 'gray';
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">IT Tickets</h1>
          <p className="text-gray-400">Track and manage support tickets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="glass-button flex items-center gap-2"
        >
          <FiPlus size={20} />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex items-center gap-4">
        <FiSearch size={20} className="text-gray-400" />
        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="glass-input flex-1"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => { setFilters({ ...filters, priority: e.target.value }); setPage(1); }}
          className="glass-input flex-1"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="glass-card p-6 cursor-pointer hover:shadow-glow transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-primary">{ticket.ticket_number}</span>
                    <h3 className="text-lg font-bold text-white">{ticket.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    {ticket.description.substring(0, 100)}...
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`badge-${ticket.priority} px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap`}>
                    {ticket.priority}
                  </span>
                  <span className={`badge-${ticket.status} px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Assigned to: {ticket.assigned_to_name}</span>
                <span>{new Date(ticket.created_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {tickets.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-400">No tickets found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
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
          )}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <input
                type="text"
                placeholder="Ticket Title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                className="glass-input"
                required
              />
              <textarea
                placeholder="Description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                className="glass-input min-h-24"
                required
              />
              <select
                value={newTicket.issue_type}
                onChange={(e) => setNewTicket({ ...newTicket, issue_type: e.target.value })}
                className="glass-input"
              >
                <option value="hardware">Hardware Issue</option>
                <option value="software">Software Issue</option>
                <option value="network">Network Issue</option>
                <option value="other">Other</option>
              </select>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="glass-input"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" className="glass-button flex-1">
                  Create Ticket
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
