import React from 'react';
import ChatBot from '@site/src/components/ChatBot/ChatBot';
import PersonalizationButton from '@site/src/components/PersonalizationButton/PersonalizationButton';

// This component wraps the entire application
// ChatBot and PersonalizationButton are floating buttons that always show
export default function Root({ children }) {
  return (
    <div>
      {children}
      <ChatBot />
      <PersonalizationButton />
    </div>
  );
}
