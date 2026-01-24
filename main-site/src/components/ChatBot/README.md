# ChatBot Component

A floating chatbot component that integrates with the RAG (Retrieval-Augmented Generation) backend to answer questions about the Physical AI & Humanoid Robotics textbook.

## Features

- 🤖 **AI-Powered Responses**: Connects to backend API for intelligent answers
- 📚 **Source Citations**: Each answer includes citations with relevance scores
- 💬 **Persistent Sessions**: Maintains conversation context across queries
- 🎨 **Theme-Aware**: Automatically adapts to light/dark mode
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⌨️ **Keyboard Shortcuts**: Press Enter to send, Shift+Enter for new line
- 🔄 **Loading States**: Visual feedback during API calls
- ❌ **Error Handling**: Graceful degradation when backend is unavailable

## Usage

### Global Integration (Current Setup)

The chatbot is globally available on all pages through the Root wrapper:

```jsx
// src/theme/Root.jsx
import ChatBot from '@site/src/components/ChatBot/ChatBot';

export default function Root({ children }) {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}
```

### Manual Integration (Optional)

You can also import and use it in specific pages:

```jsx
import ChatBot from '@site/src/components/ChatBot/ChatBot';

export default function MyPage() {
  return (
    <Layout>
      <div>Your content here</div>
      <ChatBot />
    </Layout>
  );
}
```

## Configuration

### API Endpoint

The chatbot automatically detects the environment:

- **Development**: `http://localhost:8000` (local backend)
- **Production**: Update `API_BASE_URL` in `ChatBot.jsx` to your production backend URL

```jsx
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.com'  // Update this for production
  : 'http://localhost:8000';
```

### Customization

#### Colors

The component uses Docusaurus theme variables. Customize in `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #2e7d32;  /* Chat button and headers */
  --ifm-color-primary-dark: #1b5e20;  /* Hover states */
  --ifm-color-primary-light: #43a047;  /* Accents */
}
```

#### Styling

Edit `ChatBot.module.css` to customize:
- Button size and position
- Chat window dimensions
- Message bubble styling
- Citation card appearance
- Animations and transitions

## Component Structure

```
src/components/ChatBot/
├── ChatBot.jsx              # Main component
├── ChatBot.module.css       # Scoped styles
└── README.md               # This file
```

## API Integration

### Request Format

```json
POST /api/chat/query
{
  "question": "What is ROS 2?",
  "session_id": "web-1234567890-abc123"
}
```

### Response Format

```json
{
  "answer": "ROS 2 is an open-source middleware framework...",
  "citations": [
    {
      "source": "Module 1: ROS 2, Section: What is ROS 2?",
      "url": "/module1-ros2/docs/week1/ros2-architecture",
      "module": "module1-ros2",
      "week": null,
      "tutorial_file": "ros2-architecture.md",
      "section_title": "What is ROS 2?",
      "relevance_score": 0.7058644
    }
  ],
  "conversation_id": "eee14abb-c4fc-4d42-929b-dd83fe0cdd80"
}
```

## Features Breakdown

### Chat Button
- Fixed position (bottom-right)
- Animated hover effects
- Toggle open/close with smooth transitions
- Accessible with ARIA labels

### Chat Window
- Responsive height (max 600px desktop, full-screen mobile)
- Scrollable message history
- Auto-scroll to latest message
- Welcome message with example questions

### Messages
- User messages (right-aligned, green background)
- AI messages (left-aligned, gray background)
- Error messages (red border and background)
- Fade-in animations

### Citations
- Clickable source links
- Module and section information
- Relevance score badges
- Hover effects with smooth transitions

### Input
- Auto-focus when chat opens
- Enter to send, Shift+Enter for multiline
- Disabled during loading
- Send button with loading state

## Development

### Testing Locally

1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Start the Docusaurus dev server:
```bash
cd main-site
npm start
```

3. Open http://localhost:3000
4. Click the chat button in the bottom-right corner

### Example Questions

Try these to test the chatbot:
- "What is ROS 2?"
- "Explain ROS 2 nodes"
- "How do publishers and subscribers work?"
- "What is the difference between ROS 1 and ROS 2?"

## Troubleshooting

### Chat button not appearing
- Check browser console for errors
- Verify `Root.jsx` is in `src/theme/`
- Clear `.docusaurus` cache: `npm run clear`

### "Backend server not running" error
- Verify backend is running on port 8000
- Check `curl http://localhost:8000/health`
- Check CORS configuration in backend

### Citations not linking correctly
- Verify URLs in backend match Docusaurus routes
- Check `routeBasePath` in `docusaurus.config.js`

### Styling issues
- Clear browser cache
- Check CSS module imports
- Verify CSS variables in custom.css

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Accessibility

- Keyboard navigation supported
- ARIA labels on interactive elements
- High contrast in both light/dark modes
- Semantic HTML structure

## Performance

- Lazy loading (only loads when needed)
- Minimal re-renders with React hooks
- Debounced scroll events
- Optimized animations

## Future Enhancements

Potential improvements:
- [ ] Voice input support
- [ ] Export conversation history
- [ ] Code syntax highlighting in responses
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Multi-language support
- [ ] Offline mode with cached responses
