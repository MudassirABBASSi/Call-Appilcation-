import React, { useEffect, useState } from 'react';
import ConversationList from '../../components/ConversationList';
import ConversationViewer from '../../components/ConversationViewer';
import { conversationsAPI } from '../../api/api';
import { toast } from 'react-toastify';
import '../../styles/message-monitor.css';

const AdminMessageMonitor = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    limit: 20,
    totalPages: 0
  });

  // Track viewport width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchConversations(pagination.current);
  }, []);

  const fetchConversations = async (page = 1) => {
    setLoading(true);
    try {
      const response = await conversationsAPI.getAllConversations({
        page,
        limit: 20
      });

      setConversations(response.data.conversations);
      setPagination(response.data.pagination);
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && response.data.conversations.length > 0) {
        setSelectedConversation(response.data.conversations[0]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load conversations';
      toast.error(errorMsg);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    // On mobile, selecting a conversation automatically shows the chat panel
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchConversations(newPage);
    }
  };

  const handleRefresh = () => {
    fetchConversations(pagination.current);
  };

  // Calculate total unread messages
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  // Determine if we're in mobile view
  const isMobile = viewportWidth <= 768;

  return (
          <div className="content-wrapper">
          {/* Header Section */}
          <div className="monitor-header">
            <h1>Message Monitoring System</h1>
            <p className="monitor-subtitle">Admin - Conversation View (Read-Only)</p>
            <div className="monitor-stats">
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <span className="stat-value">{pagination.total || 0}</span>
                <span className="stat-label">Conversations</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📨</span>
                <span className="stat-value">{totalUnread}</span>
                <span className="stat-label">Unread Messages</span>
              </div>
            </div>
          </div>

          {/* Main Message Monitor Layout */}
          <div className="message-monitor">
            {/* LEFT PANEL (30%): Conversation List - Show on desktop OR mobile when no conversation selected */}
            {(!isMobile || !selectedConversation) && (
              <div className="conversation-panel">
                <ConversationList
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleConversationSelect}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onRefresh={handleRefresh}
                />
              </div>
            )}

            {/* RIGHT PANEL (70%): Chat Window - Show on desktop OR mobile when conversation selected */}
            {(!isMobile || selectedConversation) && (
              <div className="chat-panel">
                {/* Mobile Back Button */}
                {isMobile && selectedConversation && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'white',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <button
                      onClick={handleBackToList}
                      style={{
                        background: '#0f3d3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>←</span>
                      <span>Back to Conversations</span>
                    </button>
                  </div>
                )}
                <ConversationViewer
                  conversation={selectedConversation}
                  onConversationUpdate={fetchConversations}
                />
              </div>
            )}
          </div>
        </div>
  );
};

export default AdminMessageMonitor;
