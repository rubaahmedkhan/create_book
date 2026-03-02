# Quickstart Guide: RAG Chatbot Integration

**Feature**: 001-rag-chatbot-integration
**Date**: 2025-12-29
**Audience**: Developers implementing the RAG chatbot feature

## Overview

This guide provides step-by-step instructions to set up and run the RAG chatbot system locally for development and testing.

**Time to Complete**: ~30 minutes

---

## Prerequisites

### Required Software

- **Python**: 3.11+ (for backend FastAPI service)
- **Node.js**: 18+ (for Docusaurus frontend)
- **Git**: For cloning repository
- **Code Editor**: VS Code recommended

### Required Accounts (Free Tiers)

1. **OpenAI Account**: https://platform.openai.com/signup
   - Get API key from: https://platform.openai.com/api-keys
   - Free tier: $5 credit (sufficient for testing)

2. **Qdrant Cloud Account**: https://cloud.qdrant.io/
   - Create free tier cluster (1GB storage)
   - Get API URL and key from cluster dashboard

3. **Neon Serverless Postgres**: https://neon.tech/
   - Create free project (10GB storage)
   - Get connection string from project dashboard

---

## Step 1: Clone Repository & Setup Environment

```bash
# Clone repository
git clone https://github.com/your-org/physical-ai-textbook.git
cd physical-ai-textbook

# Checkout feature branch
git checkout 001-rag-chatbot-integration

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Install Node.js dependencies
cd main-site
npm install
cd ..
```

---

## Step 2: Configure Environment Variables

### Create `.env` File (Backend)

Create `backend/.env` from the template:

```bash
cp backend/.env.template backend/.env
```

Edit `backend/.env` and fill in your credentials:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Qdrant Cloud Configuration
QDRANT_URL=https://your-cluster-id.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key-here

# Neon Serverless Postgres Configuration
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require

# Application Configuration
DOCUSAURUS_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=INFO
```

**Security Note**: NEVER commit `.env` files. The file is already in `.gitignore`.

### Verify Credentials

Test that all credentials are valid:

```bash
cd backend
python scripts/verify_credentials.py
```

Expected output:
```
✅ OpenAI API: Connected (Model: gpt-4-turbo-preview)
✅ Qdrant Cloud: Connected (Collections: 0)
✅ Neon Postgres: Connected (Tables: 0)
```

---

## Step 3: Initialize Database Schema

Create PostgreSQL tables for conversations and messages:

```bash
cd backend
python scripts/init_database.py
```

This script:
1. Connects to Neon Postgres
2. Creates `conversations` table
3. Creates `messages` table
4. Creates indexes
5. Verifies schema

Expected output:
```
Creating database schema...
✅ Table 'conversations' created
✅ Table 'messages' created
✅ Indexes created
Database initialization complete!
```

---

## Step 4: Index Textbook Content

Generate embeddings for all textbook content and upload to Qdrant:

```bash
cd backend
python scripts/index_textbook.py --modules all
```

This script:
1. Scans `module1-ros2/`, `module2-simulation/`, etc.
2. Chunks markdown files (500-800 tokens per chunk)
3. Generates embeddings using OpenAI text-embedding-3-small
4. Uploads to Qdrant Cloud

**Estimated time**: ~10 minutes for all 4 modules

Expected output:
```
Indexing module1-ros2...
  ✅ 01-ros2-basics.md: 12 chunks indexed
  ✅ 02-workspaces.md: 8 chunks indexed
  ...
Indexing module2-simulation...
  ✅ 01-urdf-basics.md: 15 chunks indexed
  ...

Total: 847 chunks indexed
Collection 'textbook_chunks' ready for search!
```

**Cost Estimate**: ~$0.50 for embedding 400,000 tokens (one-time cost)

---

## Step 5: Start Backend API Server

Run the FastAPI development server:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**API Documentation**: Open http://localhost:8000/docs in your browser to see interactive API docs (Swagger UI)

### Test API Endpoint

In a new terminal, test the chat query endpoint:

```bash
curl -X POST http://localhost:8000/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is a ROS 2 node?",
    "conversation_id": null,
    "page_context": "/docs/module1/week1/ros2-basics"
  }'
```

Expected response:
```json
{
  "answer": "A ROS 2 node is a process that performs computation...",
  "citations": [
    {
      "source": "Module 1, Week 1, Tutorial 01: ROS 2 Basics",
      "url": "/docs/module1/week1/ros2-basics#nodes",
      "relevance_score": 0.94
    }
  ],
  "conversation_id": "uuid-here"
}
```

---

## Step 6: Start Docusaurus Frontend

In a new terminal:

```bash
cd main-site
npm start
```

Expected output:
```
[SUCCESS] Serving at http://localhost:3000
[INFO] Docusaurus website is running.
```

Open http://localhost:3000 in your browser.

### Verify Chatbot UI

1. Navigate to any textbook page (e.g., `/docs/module1/week1/ros2-basics`)
2. Look for the chatbot widget in the bottom-right corner
3. Click to open the chatbot
4. Type a question: "What is a ROS 2 node?"
5. Verify you receive an answer with citations

---

## Step 7: Test Text Selection Feature

1. On any textbook page, highlight/select a code snippet or paragraph
2. A floating "Ask about this" button should appear
3. Click the button to open chatbot with selected text as context
4. Ask a question about the selection
5. Verify the answer is contextually relevant

---

## Development Workflow

### Making Changes

**Backend Changes**:
```bash
# Backend auto-reloads when files change (--reload flag)
# Edit files in backend/app/
# Test changes: http://localhost:8000/docs
```

**Frontend Changes**:
```bash
# Frontend auto-reloads when files change
# Edit files in main-site/src/
# Test changes: http://localhost:3000
```

### Running Tests

**Backend Tests**:
```bash
cd backend
pytest tests/ -v
```

**Frontend Tests**:
```bash
cd main-site
npm test
```

**End-to-End Tests**:
```bash
cd backend
pytest tests/e2e/ -v
```

---

## Troubleshooting

### Issue: "OpenAI API key is invalid"

**Solution**:
- Verify your API key at https://platform.openai.com/api-keys
- Check that `OPENAI_API_KEY` in `.env` starts with `sk-proj-` or `sk-`
- Ensure no extra spaces or quotes in `.env` file

### Issue: "Qdrant connection failed"

**Solution**:
- Verify cluster is running at https://cloud.qdrant.io/
- Check `QDRANT_URL` format: `https://xxx.cloud.qdrant.io:6333`
- Ensure API key is correct (no spaces/quotes)

### Issue: "Neon Postgres connection failed"

**Solution**:
- Verify database is active (not paused) at https://console.neon.tech/
- Check connection string format: `postgresql://user:pass@host/db?sslmode=require`
- Ensure password is URL-encoded if it contains special characters

### Issue: "No results found in vector search"

**Solution**:
- Run `python scripts/verify_indexing.py` to check if chunks are indexed
- Re-run indexing: `python scripts/index_textbook.py --modules all --force`
- Check Qdrant dashboard for collection `textbook_chunks`

### Issue: "CORS error in browser console"

**Solution**:
- Verify `DOCUSAURUS_URL` in backend `.env` matches frontend URL
- Check `CORS_ORIGINS` includes frontend URL
- Restart backend server after changing `.env`

---

## Next Steps

After quickstart setup:

1. **Read Architecture Docs**: See `plan.md` for system architecture
2. **Review API Contracts**: See `contracts/openapi.yaml` for full API spec
3. **Understand Data Model**: See `data-model.md` for database schema
4. **Start Development**: See `tasks.md` for implementation tasks (created via `/sp.tasks`)

---

## Useful Commands

```bash
# Backend
uvicorn app.main:app --reload --port 8000  # Start dev server
pytest tests/ -v                            # Run tests
python scripts/verify_credentials.py       # Verify API keys
python scripts/index_textbook.py --help    # See indexing options

# Frontend
npm start                                   # Start dev server
npm test                                    # Run tests
npm run build                               # Build for production

# Database
python scripts/init_database.py            # Create tables
python scripts/reset_database.py           # Drop and recreate tables (WARNING: deletes data)
```

---

## Resources

- **OpenAPI Docs**: http://localhost:8000/docs (when backend is running)
- **Qdrant Dashboard**: https://cloud.qdrant.io/
- **Neon Dashboard**: https://console.neon.tech/
- **OpenAI Platform**: https://platform.openai.com/

---

## Cost Estimates (Free Tier Usage)

- **OpenAI API**: ~$0.50 for initial indexing, ~$0.02 per 100 questions
- **Qdrant Cloud**: Free (1GB storage sufficient for 4 modules)
- **Neon Postgres**: Free (10GB storage, auto-pause when idle)
- **Deployment**: Railway/Fly.io free tiers cover dev/staging

**Total Monthly Cost**: $0 (within free tiers for development)

---

**Questions?** See `troubleshooting.md` or open an issue on GitHub.
