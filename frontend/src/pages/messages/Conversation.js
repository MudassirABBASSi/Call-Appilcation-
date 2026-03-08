import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import { toast } from 'react-toastify';
import '../../styles/dashboard.css';

const Conversation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    fetchConversation();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await messagesAPI.getConversation(userId);
      setMessages(response.data.conversation);
      setParticipantName(response.data.participantName);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await messagesAPI.sendMessage({
        receiver_id: parseInt(userId),
        message: newMessage.trim()
      });

      // Add the new message to the conversation
      setMessages([...messages, response.data.data]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (senderId) => {
    return Number(senderId) === Number(currentUserId);
  };

  return (
          <div className="content-wrapper">
          <div style={styles.header}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              ← Back
            </button>
            <h1 style={styles.pageTitle}>
              Conversation with {participantName || 'Loading...'}
            </h1>
          </div>

          {loading ? (
            <p>Loading messages...</p>
          ) : (
            <>
              <div style={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <p style={styles.emptyState}>
                    No messages yet. Start the conversation!
                  </p>
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
                          {new Date(msg.sent_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={styles.inputForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={styles.input}
                  disabled={sending}
                />
                <button
                  type="submit"
                  style={styles.sendButton}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
  );
};DashboardLayout

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  pageTitle: {
    color: colors.primary,
    margin: 0
  },
  messagesContainer: {
    height: '500px',
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ddd'
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    padding: '40px'
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '15px'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    wordWrap: 'break-word'
  },
  myMessage: {
    backgroundColor: colors.primary,
    color: '#fff'
  },
  theirMessage: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ddd'
  },
  messageText: {
    marginBottom: '5px',
    fontSize: '14px'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7
  },
  inputForm: {
    display: 'flex',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  sendButton: {
    padding: '12px 30px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default Conversation;
