import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { messagesAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const MessagesList = () => {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    // Note: Full inbox/conversations list endpoint not yet implemented
    setLoading(false);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleConversationClick = (userId) => {
    navigate(`/messages/conversation/${userId}`);
  };

  return (
          <div className="content-wrapper">
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Messages</h1>
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount} unread</span>
            )}
          </div>

          {loading ? (
            <p>Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <div className="table-container">
              <p style={styles.emptyState}>
                No conversations yet. Send a message to get started!
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Last Message</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conv) => (
                    <tr
                      key={conv.userId}
                      onClick={() => handleConversationClick(conv.userId)}
                      style={{
                        ...styles.row,
                        fontWeight: conv.unread > 0 ? 'bold' : 'normal'
                      }}
                    >
                      <td>{conv.name}</td>
                      <td>{conv.lastMessage}</td>
                      <td>{new Date(conv.lastMessageTime).toLocaleString()}</td>
                      <td>
                        {conv.unread > 0 && (
                          <span style={styles.unreadBadge}>{conv.unread}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  badge: {
    backgroundColor: colors.danger,
    color: '#fff',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    padding: '40px'
  },
  row: {
    cursor: 'pointer'
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px'
  }
};

export default MessagesList;
