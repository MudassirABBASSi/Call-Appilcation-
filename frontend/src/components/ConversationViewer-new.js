import React, { useState, useEffect } from 'react';
import { conversationsAPI } from '../api/api';
import { toast } from 'react-toastify';
import '../styles/conversation-viewer-new.css';

const ConversationViewer = ({ conversation, onConversationUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    limit: 50,
    totalPages: 0
  });

  useEffect(() => {
    if (conversation?.id) {
      fetchConversationMessages(conversation.id, 1);
    }
  }, [conversation?.id]);

  const fetchConversationMessages = async (conversationId, page = 1) => {
    setLoading(true);
    try {
      const response = await conversationsAPI.getConversationMessages(
        conversationId,
        { page, limit: 50 }
      );

      setMessages(response.data.messages);
      setPagination(response.data.pagination);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load messages';
      toast.error(errorMsg);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (conversation?.id && newPage > 0 && newPage <= pagination.totalPages) {
      fetchConversationMessages(conversation.id, newPage);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return time;
  };

  const formatStartDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.sent_at);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  if (!conversation) {
    return (
      <div className="chat-panel-empty">
        <div className="chat-empty">
          <span className="chat-empty-icon">💬</span>
          <p className="chat-empty-text">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const dateKeys = Object.keys(messageGroups).sort((a, b) => 
    new Date(a) - new Date(b)
  );

  return (
    <>
      {/* Chat Header - Fixed at top */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatars">
            <div className="chat-header-avatar teacher">
              {conversation.teacher_name?.charAt(0).toUpperCase()}
            </div>
            <div className="chat-header-arrow">↔</div>
            <div className="chat-header-avatar student">
              {conversation.student_name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="chat-header-names">
            <div className="chat-header-teacher-name">
              👨‍🏫 {conversation.teacher_name}
            </div>
            <div className="chat-header-student-name">
              👨‍🎓 {conversation.student_name}
            </div>
            <div className="chat-header-date">
              Started: {formatStartDate(conversation.created_at)}
            </div>
          </div>
        </div>
        <div className="chat-header-badge">
          🔒 Read-Only
        </div>
      </div>

      {/* Chat Body - Scrollable Messages */}
      <div className="chat-body">
        {loading && messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">⏳</span>
            <p className="chat-empty-text">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">📭</span>
            <p className="chat-empty-text">No messages in this conversation</p>
          </div>
        ) : (
          <>
            {dateKeys.map((dateKey) => (
              <div key={dateKey}>
                <div className="message-date-divider">
                  {dateKey}
                </div>
                {messageGroups[dateKey].map((message) => (
                  <div
                    key={message.id}
                    className={`message-wrapper ${
                      message.sender_role === 'teacher' ? 'teacher' : 'student'
                    }`}
                  >
                    <div className="message-bubble">
                      <div className="message-sender">
                        <strong>{message.sender_name}</strong>
                        <span className="sender-role">{message.sender_role}</span>
                      </div>
                      <p className="message-text">{message.message}</p>
                      <div className="message-footer">
                        <span className="message-time">
                          {formatDateTime(message.sent_at)}
                        </span>
                        {message.is_read ? (
                          <span className="read-status" title="Read">✓✓</span>
                        ) : (
                          <span className="read-status" title="Unread">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="chat-pagination">
                <button
                  className="pagination-btn"
                  disabled={pagination.current <= 1}
                  onClick={() => handlePageChange(pagination.current - 1)}
                >
                  ← Prev
                </button>
                <span className="chat-pagination-info">
                  Page {pagination.current} of {pagination.totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={pagination.current >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.current + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ConversationViewer;
