import React from 'react';
import ChatBot from '@site/src/components/ChatBot/ChatBot';
import PersonalizeButton from '@site/src/components/PersonalizeButton';

// This component wraps the entire application
// No authentication required - content is public
// PersonalizeButton and ChatBot are floating buttons that always show
export default function Root({ children }) {
  return (
    <div>
      {children}
      <PersonalizeButton />
      <ChatBot />
    </div>
  );
}
