import React, { useState } from 'react';
import '../styles/conversation-list-new.css';

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
  pagination,
  onPageChange,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'No messages yet';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  // Filter conversations based on search term and date
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = searchTerm === '' || 
      conv.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate === '' ||
      (conv.last_message_at && new Date(conv.last_message_at).toLocaleDateString() === new Date(filterDate).toLocaleDateString());
    
    return matchesSearch && matchesDate;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
  };

  return (
    <div className="conversation-list-panel">
      <div className="conversation-list-header">
        <h2>Conversations</h2>
        <div className="list-controls">
          <button 
            className="refresh-btn" 
            onClick={onRefresh}
            title="Refresh conversations"
            disabled={loading}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="conversation-filters">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by teacher or student..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-row">
          <input
            type="date"
            className="date-filter"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            title="Filter by date"
          />
          {(searchTerm || filterDate) && (
            <button 
              className="clear-filters-btn"
              onClick={handleClearFilters}
              title="Clear all filters"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && conversations.length === 0 ? (
        <div className="conversation-list-loading">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="conversation-list-empty">
          <p>{searchTerm || filterDate ? 'No conversations match your filters' : 'No conversations found'}</p>
        </div>
      ) : (
        <>
          <div className="conversation-list-items">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversation?.id === conversation.id ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="conversation-avatars">
                  <div className="avatar avatar-teacher">
                    {conversation.teacher_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="avatar-arrow">↔</div>
                  <div className="avatar avatar-student">
                    {conversation.student_name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="conversation-content">
                  <div className="conversation-header-row">
                    <div className="conversation-names-container">
                      <div className="teacher-name">
                        👨‍🏫 {conversation.teacher_name}
                      </div>
                      <div className="student-name">
                        👨‍🎓 {conversation.student_name}
                      </div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge">{conversation.unread_count}</span>
                    )}
                  </div>
                  <p className="conversation-last-message">
                    {truncateMessage(conversation.last_message)}
                  </p>
                  <span className="conversation-time">
                    {formatDate(conversation.last_message_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && !searchTerm && !filterDate && (
            <div className="conversation-list-pagination">
              <button
                className="pagination-btn"
                disabled={pagination.current <= 1}
                onClick={() => onPageChange(pagination.current - 1)}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                Page {pagination.current} of {pagination.totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={pagination.current >= pagination.totalPages}
                onClick={() => onPageChange(pagination.current + 1)}
              >
                Next →
              </button>
            </div>
          )}

          <div className="conversation-list-footer">
            <small>
              {searchTerm || filterDate 
                ? `Showing ${filteredConversations.length} of ${pagination.total}`
                : `Total: ${pagination.total} conversations`
              }
            </small>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationList;
