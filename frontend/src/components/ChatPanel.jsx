import './ChatPanel.css';
import { useState } from 'react';
import { sendMessage } from '../api/chat';

function ChatPanel({ isSidebarOpen, onOpenSidebar }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const query = input;

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: query,
      },
    ]);

    setInput('');
    setIsThinking(true);

    try {
      const data = await sendMessage(query);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.intent,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Something went wrong.',
        },
      ]);
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-shell">
        <div className="chat-header">
          {!isSidebarOpen && (
            <button
              type="button"
              className="chat-sidebar-open"
              onClick={onOpenSidebar}
              aria-label="Open sidebar"
            >
              <i className="fa-solid fa-angles-right"></i>
            </button>
          )}
          <h2 className="chat-title">New Chat</h2>
        </div>

        <div className="chat-body">
          {messages.length === 0 && !isThinking ? (
            <div className="chat-placeholder">
              <h3>Welcome to Cortex</h3>
              <p>Ask anything or add to your memory.</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => (
                <div key={index} className={`message-row ${message.sender}`}>
                  {message.sender === 'bot' && (
                    <img src="logo.png" alt="Cortex" className="message-logo" />
                  )}

                  {message.sender === 'user' && <div className="profile-avatar">Y</div>}

                  <div className={`message-bubble ${message.sender}`}>{message.text}</div>
                </div>
              ))}

              {isThinking && (
                <div className="message-row bot">
                  <img src="logo.png" alt="Cortex" className="message-logo" />

                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />

          <button className="send-btn" onClick={handleSend}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
