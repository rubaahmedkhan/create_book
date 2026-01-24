import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.com'
  : 'http://localhost:8000';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionButton, setShowSelectionButton] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectionTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle text selection on the page
  useEffect(() => {
    const handleTextSelection = () => {
      // Clear any existing timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      // Small delay to ensure selection is complete
      selectionTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 0 && text.length < 500) {
          // Get selection position
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setSelectedText(text);
          setSelectionPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
          setShowSelectionButton(true);
        } else {
          setShowSelectionButton(false);
          setSelectedText('');
        }
      }, 100);
    };

    const handleClickOutside = (e) => {
      // Hide button if clicking outside selection
      if (showSelectionButton && !e.target.closest(`.${styles.selectionButton}`)) {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim().length === 0) {
          setShowSelectionButton(false);
          setSelectedText('');
        }
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [showSelectionButton]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please make sure the backend server is running on http://localhost:8000',
        isError: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleAskAboutSelection = () => {
    if (selectedText) {
      // Format the question with the selected text
      const question = `Explain this: "${selectedText}"`;
      setInput(question);
      setIsOpen(true);
      setShowSelectionButton(false);

      // Clear the browser's text selection
      window.getSelection()?.removeAllRanges();

      // Focus the input field after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <>
      {/* Text Selection "Ask About This" Button */}
      {showSelectionButton && (
        <button
          className={styles.selectionButton}
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
          }}
          onClick={handleAskAboutSelection}
          title="Ask chatbot about this text"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Ask about this
        </button>
      )}

      {/* Floating Chat Button */}
      <button
        className={styles.chatButton}
        onClick={toggleChat}
        aria-label="Toggle chatbot"
        title="Ask questions about the textbook"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <h3>Textbook Assistant</h3>
              <p>Ask me anything about Physical AI & Robotics</p>
            </div>
            {messages.length > 0 && (
              <button
                className={styles.clearButton}
                onClick={clearChat}
                title="Clear chat history"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <h4>Welcome! 👋</h4>
                <p>I'm your AI assistant for the Physical AI & Humanoid Robotics textbook.</p>
                <div className={styles.exampleQuestions}>
                  <p><strong>Try asking:</strong></p>
                  <button onClick={() => setInput("What is ROS 2?")} className={styles.exampleButton}>
                    "What is ROS 2?"
                  </button>
                  <button onClick={() => setInput("Explain ROS 2 nodes")} className={styles.exampleButton}>
                    "Explain ROS 2 nodes"
                  </button>
                  <button onClick={() => setInput("How do publishers work?")} className={styles.exampleButton}>
                    "How do publishers work?"
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${styles[message.role]} ${message.isError ? styles.error : ''}`}
                >
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>

                  {message.citations && message.citations.length > 0 && (
                    <div className={styles.citations}>
                      <div className={styles.citationsHeader}>Sources:</div>
                      {message.citations.map((citation, citIndex) => (
                        <a
                          key={citIndex}
                          href={citation.url}
                          className={styles.citation}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className={styles.citationHeader}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            <span className={styles.citationModule}>{citation.module}</span>
                            {citation.relevance_score && (
                              <span className={styles.relevanceScore}>
                                {(citation.relevance_score * 100).toFixed(0)}% match
                              </span>
                            )}
                          </div>
                          <div className={styles.citationContent}>
                            {citation.section_title && (
                              <div className={styles.citationSection}>{citation.section_title}</div>
                            )}
                            <div className={styles.citationSource}>{citation.source}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className={styles.chatInputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              className={styles.chatInput}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!input.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
