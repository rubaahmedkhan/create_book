# RAG Chatbot Backend

FastAPI backend for the Retrieval-Augmented Generation (RAG) chatbot integrated with the Physical AI & Humanoid Robotics textbook.

## Architecture

This backend implements a complete RAG pipeline:
1. **Embedding**: Convert user queries to vectors using OpenAI text-embedding-3-small
2. **Retrieval**: Search Qdrant Cloud vector database for relevant textbook chunks
3. **Generation**: Generate answers using OpenAI GPT-4 with retrieved context
4. **Citations**: Parse and return source references
5. **Persistence**: Store conversations and messages in Neon Postgres

## Prerequisites

- Python 3.11 or higher
- OpenRouter API key (free tier available - supports deepseek/deepseek-chat)
- Qdrant Cloud credentials (already configured in .env)
- Neon Postgres credentials (already configured in .env)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

The `.env` file has been created with all credentials from Rag.md, including:

✅ **OpenRouter API key** (already configured)
✅ **Qdrant Cloud credentials** (already configured)
✅ **Neon Postgres connection** (already configured)

**Using OpenRouter**: We're using OpenRouter's OpenAI-compatible API with the free `deepseek/deepseek-chat` model for unlimited completions.

### 3. Initialize Database

Create the required database tables:

```bash
python scripts/init_database.py
```

### 4. Verify Credentials

Test all service connections:

```bash
python scripts/verify_credentials.py
```

This will verify:
- ✅ OpenAI API connection
- ✅ Qdrant Cloud connection
- ✅ Neon Postgres connection

### 5. Start Development Server

```bash
# From the backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or run directly
python app/main.py
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## API Endpoints

### Health Check
```
GET /health
```
Returns status of all services (OpenAI, Qdrant, Postgres).

### Chat Query
```
POST /api/chat/query
```
Submit a question and receive an answer with citations.

**Request Body:**
```json
{
  "question": "What is a ROS 2 node?",
  "conversation_id": null,
  "selected_text": null,
  "page_context": "/docs/module1/week1/ros2-basics",
  "session_id": "browser-session-xyz"
}
```

**Response:**
```json
{
  "answer": "A ROS 2 node is a process that performs computation...",
  "citations": [
    {
      "source": "Module 1, Week 1, Tutorial 01: ROS 2 Basics",
      "url": "/docs/module1/week1/tutorial-01-ros2-basics#nodes",
      "module": "module1-ros2",
      "relevance_score": 0.94
    }
  ],
  "conversation_id": "uuid-here"
}
```

### Get Conversation History
```
GET /api/chat/conversations/{conversation_id}
```

### Delete Conversation
```
DELETE /api/chat/conversations/{conversation_id}
```

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Environment variables
│   ├── api/
│   │   ├── dependencies.py        # Dependency injection
│   │   └── routes/
│   │       ├── health.py          # Health check
│   │       └── chat.py            # Chat endpoints
│   ├── models/
│   │   ├── conversation.py        # Pydantic models
│   │   ├── message.py
│   │   └── citation.py
│   ├── services/
│   │   ├── openai_service.py      # OpenAI integration
│   │   ├── qdrant_service.py      # Vector search
│   │   ├── postgres_service.py    # Database operations
│   │   └── rag_service.py         # RAG orchestration
│   └── utils/
│       ├── logging.py             # Logging configuration
│       └── error_handlers.py      # Custom exceptions
├── scripts/
│   ├── init_database.py           # Database schema setup
│   ├── verify_credentials.py      # Credential verification
│   └── index_textbook.py          # (To be created) Index textbook content
└── tests/                          # (To be created) Test suite
```

## Next Steps

1. **Add OpenAI API Key**: Update `.env` with your OpenAI API key
2. **Initialize Database**: Run `python scripts/init_database.py`
3. **Verify Setup**: Run `python scripts/verify_credentials.py`
4. **Index Textbook**: Create and run indexing script to populate Qdrant with textbook content
5. **Start Server**: Run `uvicorn app.main:app --reload`
6. **Test API**: Use the interactive docs at http://localhost:8000/api/docs

## Troubleshooting

### Connection Errors

**Qdrant Connection Failed:**
- Verify `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
- Check network connectivity
- Ensure Qdrant Cloud cluster is running

**Postgres Connection Failed:**
- Verify `NEON_DATABASE_URL` in `.env`
- Ensure Neon database is active (free tier sleeps after inactivity)
- Check connection string format

**OpenAI API Errors:**
- Verify `OPENAI_API_KEY` is valid
- Check API rate limits and quota
- Ensure you have billing set up if using paid tier

### Import Errors

If you get import errors, ensure you're running scripts from the `backend` directory and Python can find the `app` module.

## Development

### Running Tests
```bash
pytest tests/ -v --cov=app
```

### Code Quality
```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

## Security Notes

- ✅ `.env` file is in `.gitignore` and never committed
- ✅ All credentials loaded from environment variables
- ✅ No hardcoded secrets in source code
- ✅ CORS configured for specific origins only

## Support

For issues or questions, refer to:
- API Documentation: http://localhost:8000/api/docs
- Feature Specification: `../specs/001-rag-chatbot-integration/spec.md`
- Implementation Plan: `../specs/001-rag-chatbot-integration/plan.md`
