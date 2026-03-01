import React, { useState, useRef, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionButton, setShowSelectionButton] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle text selection
  useEffect(() => {
    if (!isClient) return;

    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 5 && text.length < 500) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setSelectedText(text);
          setSelectionPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 10
          });
          setShowSelectionButton(true);
        } else {
          setShowSelectionButton(false);
        }
      }, 100);
    };

    const handleMouseDown = (e) => {
      if (!e.target.closest('[data-selection-button]')) {
        setShowSelectionButton(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isClient]);

  const sendMessage = async (messageText) => {
    if (!messageText?.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: userMessage.content,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, could not connect to the server. Make sure backend is running on localhost:8000',
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleAskAboutSelection = () => {
    const question = `Explain this from the textbook: "${selectedText}"`;
    setInput(question);
    setIsOpen(true);
    setShowSelectionButton(false);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => {
      sendMessage(question);
    }, 100);
  };

  if (!isClient) return null;

  return (
    <>
      {/* Selection Button - appears when text is selected */}
      {showSelectionButton && (
        <button
          data-selection-button
          onClick={handleAskAboutSelection}
          style={{
            position: 'absolute',
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            zIndex: 10000,
            whiteSpace: 'nowrap',
          }}
        >
          <span>❓</span> Ask about this
        </button>
      )}

      {/* Chat Button - ALWAYS visible at bottom right */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            border: '3px solid white',
            boxShadow: '0 6px 24px rgba(37, 99, 235, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          title="Ask questions about the textbook"
        >
          {isOpen ? '✕' : '💬'}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '500px',
            maxHeight: 'calc(100vh - 150px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99998,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              📚 Textbook Assistant
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
              Ask me anything about ROS 2 & Robotics
            </p>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>👋</p>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Welcome!</p>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                  Ask questions about the textbook content.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['What is ROS 2?', 'Explain nodes and topics', 'How do publishers work?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#475569',
                        textAlign: 'left',
                      }}
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user'
                      ? '#3b82f6'
                      : msg.isError
                        ? '#fef2f2'
                        : '#f1f5f9',
                    color: msg.role === 'user'
                      ? 'white'
                      : msg.isError
                        ? '#dc2626'
                        : '#1e293b',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}
                >
                  {msg.content}

                  {msg.citations?.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}>
                      <p style={{ fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                        📖 Sources:
                      </p>
                      {msg.citations.map((cite, j) => (
                        <a
                          key={j}
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block',
                            padding: '8px',
                            marginBottom: '4px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            color: '#3b82f6',
                            textDecoration: 'none',
                          }}
                        >
                          {cite.section_title || cite.module}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                }}
              >
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                padding: '12px 16px',
                backgroundColor: input.trim() && !isLoading ? '#3b82f6' : '#94a3b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
