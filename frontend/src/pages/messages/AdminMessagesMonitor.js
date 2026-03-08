import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { messagesAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import { toast } from 'react-toastify';
import '../../styles/dashboard.css';

const AdminMessagesMonitor = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    fetchMessages();
  }, [pagination.offset]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getAllMessages({
        limit: pagination.limit,
        offset: pagination.offset
      });
      setMessages(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        hasMore: response.data.pagination.hasMore
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit)
      });
    }
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="content-wrapper">
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Messages Monitoring</h1>
            <div style={styles.stats}>
              <span>Total Messages: {pagination.total}</span>
            </div>
          </div>

          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="table-container">
              <p style={styles.emptyState}>No messages in the system yet.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Message</th>
                      <th>Sent At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.id}>
                        <td>{msg.id}</td>
                        <td>
                          <div>
                            <strong>{msg.sender_name}</strong>
                            <br />
                            <span style={styles.roleTag}>
                              {msg.sender_role}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{msg.receiver_name}</strong>
                            <br />
                            <span style={styles.roleTag}>
                              {msg.receiver_role}
                            </span>
                          </div>
                        </td>
                        <td style={styles.messageCell}>
                          {msg.message.length > 50
                            ? msg.message.substring(0, 50) + '...'
                            : msg.message}
                        </td>
                        <td>{new Date(msg.sent_at).toLocaleString()}</td>
                        <td>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: msg.is_read
                                ? colors.success
                                : colors.warning
                            }}
                          >
                            {msg.is_read ? 'Read' : 'Unread'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.paginationControls}>
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                  style={styles.paginationButton}
                >
                  Previous
                </button>
                <span style={styles.paginationInfo}>
                  Showing {pagination.offset + 1} -{' '}
                  {Math.min(
                    pagination.offset + pagination.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasMore}
                  style={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  pageTitle: {
    color: colors.primary,
    margin: 0
  },
  stats: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    padding: '40px'
  },
  roleTag: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'capitalize'
  },
  messageCell: {
    maxWidth: '300px',
    wordWrap: 'break-word'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#fff',
    fontWeight: '500'
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px'
  },
  paginationButton: {
    padding: '8px 20px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#666'
  }
};

export default AdminMessagesMonitor;
