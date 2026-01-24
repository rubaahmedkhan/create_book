import React from 'react';
import ChatBot from '@site/src/components/ChatBot/ChatBot';

// This component wraps the entire application
// It's the perfect place to add global components like the chatbot
export default function Root({ children }) {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}
