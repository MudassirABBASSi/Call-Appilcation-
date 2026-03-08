import React, { useEffect, useState, useRef } from 'react';
import { messagesAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import { toast } from 'react-toastify';
import '../../styles/dashboard.css';

const ChatLayout = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const messagesEndRef = useRef(null);
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
  const userRole = JSON.parse(localStorage.getItem('user'))?.role;
  const isMobile = viewportWidth <= 768;
  const navbarHeight = viewportWidth <= 480 ? 50 : 60;

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchConversation(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (!selectedContact?.id) {
      return undefined;
    }

    // Poll active conversation so unread counts and messages stay up to date.
    const intervalId = setInterval(() => {
      fetchConversation(selectedContact.id, false);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [selectedContact?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    // Don't fetch if not authenticated
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }

    try {
      const response = await messagesAPI.getContacts();
      setContacts(response.data.contacts || []);
      
      // Auto-select first contact on larger screens only.
      if (!selectedContact && response.data.contacts?.length > 0 && window.innerWidth > 768) {
        setSelectedContact(response.data.contacts[0]);
      }
      setLoading(false);
    } catch (error) {
      // Silently handle auth errors (404/401) - user likely not logged in
      if (error.response?.status === 404 || error.response?.status === 401) {
        setLoading(false);
        return;
      }
      const errorMsg = error.response?.data?.message || 'Failed to load contacts';
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const fetchConversation = async (userId, showLoader = true) => {
    if (!localStorage.getItem('token')) {
      return;
    }

    if (showLoader) {
      setConversationLoading(true);
    }

    try {
      const response = await messagesAPI.getConversation(userId);
      setMessages(response.data.conversation);
      
      // Refresh contacts to update unread count
      const contactsResponse = await messagesAPI.getContacts();
      setContacts(contactsResponse.data.contacts || []);
    } catch (error) {
      // Silently handle auth errors
      if (error.response?.status === 404 || error.response?.status === 401) {
        return;
      }
      const errorMsg = error.response?.data?.message || 'Failed to load conversation';
      toast.error(errorMsg);
    } finally {
      if (showLoader) {
        setConversationLoading(false);
      }
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setNewMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setSending(true);
    try {
      const response = await messagesAPI.sendMessage({
        receiver_id: parseInt(selectedContact.id),
        message: newMessage.trim()
      });

      // Add the new message to the conversation
      setMessages((prev) => [...prev, response.data.data]);
      setNewMessage('');
      fetchContacts();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (senderId) => {
    return Number(senderId) === Number(currentUserId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
             ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
          <div className="content-wrapper" style={{ padding: 0, height: `calc(100vh - ${navbarHeight}px)` }}>
          <div style={styles.chatContainer}>
            {/* Left Sidebar - Contacts List */}
            {(!isMobile || !selectedContact) && (
            <div style={{ ...styles.contactsSidebar, ...(isMobile ? styles.contactsSidebarMobile : {}) }}>
              <div style={styles.sidebarHeader}>
                <h2 style={styles.sidebarTitle}>Messages</h2>
              </div>

              {loading ? (
                <p style={styles.loadingText}>Loading...</p>
              ) : contacts.length === 0 ? (
                <div style={styles.emptyContacts}>
                  <p>
                    {userRole === 'student' 
                      ? 'No teacher assigned yet.' 
                      : 'No students assigned yet.'}
                  </p>
                </div>
              ) : (
                <div style={styles.contactsList}>
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      style={{
                        ...styles.contactItem,
                        backgroundColor: 
                          selectedContact?.id === contact.id 
                            ? colors.lightBackground 
                            : '#fff'
                      }}
                    >
                      <div style={styles.contactAvatar}>
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.contactInfo}>
                        <div style={styles.contactName}>{contact.name}</div>
                        <div style={styles.contactRole}>{contact.role}</div>
                      </div>
                      {contact.unreadCount > 0 && (
                        <div style={styles.unreadBadge}>{contact.unreadCount}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Right Side - Chat Window */}
            {(!isMobile || selectedContact) && (
            <div style={{ ...styles.chatWindow, ...(isMobile ? styles.chatWindowMobile : {}) }}>
              {selectedContact ? (
                <>
                  {/* Chat Header */}
                  <div style={{ ...styles.chatHeader, ...(isMobile ? styles.chatHeaderMobile : {}) }}>
                    {isMobile && (
                      <button
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        style={styles.backButton}
                        aria-label="Back to contacts"
                      >
                        ←
                      </button>
                    )}
                    <div style={styles.chatHeaderAvatar}>
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.chatHeaderName}>{selectedContact.name}</div>
                      <div style={styles.chatHeaderRole}>
                        {selectedContact.role === 'teacher' ? 'Teacher' : 'Student'}
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div style={{ ...styles.messagesArea, ...(isMobile ? styles.messagesAreaMobile : {}) }}>
                    {conversationLoading ? (
                      <div style={styles.conversationLoading}>Loading conversation...</div>
                    ) : messages.length === 0 ? (
                      <div style={styles.noMessages}>
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            ...styles.messageWrapper,
                            justifyContent: isMyMessage(msg.sender_id)
                              ? 'flex-end'
                              : 'flex-start'
                          }}
                        >
                          <div
                            style={{
                              ...styles.messageBubble,
                              ...(isMyMessage(msg.sender_id)
                                ? styles.myMessage
                                : styles.theirMessage)
                            }}
                          >
                            <div style={styles.messageText}>{msg.message}</div>
                            <div style={styles.messageTime}>
                              {formatTime(msg.sent_at)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSendMessage} style={{ ...styles.inputArea, ...(isMobile ? styles.inputAreaMobile : {}) }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      style={{ ...styles.input, ...(isMobile ? styles.inputMobile : {}) }}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      style={{
                        ...styles.sendButton,
                        ...(isMobile ? styles.sendButtonMobile : {}),
                        opacity: sending || !newMessage.trim() ? 0.6 : 1
                      }}
                      disabled={sending || !newMessage.trim()}
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </>
              ) : (
                <div style={styles.noContactSelected}>
                  <p>Select a contact to start messaging</p>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
  );
};

const styles = {
  chatContainer: {
    display: 'flex',
    height: '100%',
    backgroundColor: '#F5F7F6',
    minWidth: 0,
    overflow: 'hidden'
  },

  // Left Sidebar Styles
  contactsSidebar: {
    width: '320px',
    backgroundColor: '#fff',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0
  },
  contactsSidebarMobile: {
    width: '100%',
    maxWidth: '100%'
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: colors.primary
  },
  sidebarTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600'
  },
  loadingText: {
    padding: '20px',
    textAlign: 'center',
    color: '#0F3D3E'
  },
  emptyContacts: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#666'
  },
  contactsList: {
    flex: 1,
    overflowY: 'auto'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s'
  },
  contactAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    marginRight: '12px',
    flexShrink: 0
  },
  contactInfo: {
    flex: 1,
    minWidth: 0
  },
  contactName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '3px'
  },
  contactRole: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'capitalize'
  },
  unreadBadge: {
    minWidth: '22px',
    height: '22px',
    backgroundColor: colors.danger,
    color: '#fff',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    padding: '0 6px'
  },

  // Chat Window Styles
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    minWidth: 0
  },
  chatWindowMobile: {
    width: '100%'
  },
  chatHeader: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center'
  },
  chatHeaderMobile: {
    padding: '12px'
  },
  backButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#E7ECEB',
    color: '#0F3D3E',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    marginRight: '8px',
    flexShrink: 0
  },
  chatHeaderAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    marginRight: '12px'
  },
  chatHeaderName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2px'
  },
  chatHeaderRole: {
    fontSize: '13px',
    color: '#666'
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#F5F7F6'
  },
  messagesAreaMobile: {
    padding: '12px'
  },
  conversationLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#0F3D3E',
    fontWeight: '600'
  },
  noMessages: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999'
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '16px'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '18px',
    wordWrap: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  myMessage: {
    backgroundColor: '#0F3D3E',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  theirMessage: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #e0e0e0',
    borderBottomLeftRadius: '4px'
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.4',
    marginBottom: '4px'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    textAlign: 'right'
  },
  inputArea: {
    padding: '15px 20px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    display: 'flex',
    gap: '12px'
  },
  inputAreaMobile: {
    padding: '10px 12px',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  inputMobile: {
    fontSize: '16px',
    padding: '10px 14px'
  },
  sendButton: {
    padding: '12px 28px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'opacity 0.2s'
  },
  sendButtonMobile: {
    padding: '10px 16px',
    minWidth: '84px',
    fontSize: '13px'
  },
  noContactSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
    fontSize: '16px'
  }
};

export default ChatLayout;
