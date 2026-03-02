# Implementation Plan: RAG Chatbot Integration for Interactive Learning

**Branch**: `001-rag-chatbot-integration` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rag-chatbot-integration/spec.md`

## Summary

Implement an embedded Retrieval-Augmented Generation (RAG) chatbot within the Docusaurus-published Physical AI & Humanoid Robotics textbook. The chatbot provides 24/7 interactive learning assistance by answering student questions strictly based on textbook content, supporting both general queries and context-specific questions from selected text. The system enforces zero hallucinations through grounded retrieval, provides citation references to source material, and maintains conversation history for multi-turn dialogues.

**Technical Approach**: FastAPI backend with OpenAI Assistants API for response generation, Qdrant Cloud vector database for semantic search over textbook chunks, Neon Serverless Postgres for conversation persistence, and React-based chatbot UI embedded in Docusaurus v3 theme. All credentials managed via environment variables per Constitution Principle VIII.

---

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5+ (frontend)
**Primary Dependencies**: FastAPI, OpenAI Python SDK, Qdrant Client, asyncpg, React 18, Docusaurus v3
**Storage**: Qdrant Cloud (vector database), Neon Serverless Postgres (conversation history)
**Testing**: pytest (backend), Jest + Playwright (frontend/e2e)
**Target Platform**: Linux/Docker (backend), Static site (Docusaurus frontend on GitHub Pages)
**Project Type**: Web application (backend API + frontend plugin)
**Performance Goals**: <3s response time, 100 concurrent users, <500ms vector search, 95% answer accuracy
**Constraints**: Must operate within free tiers (Qdrant 1GB, Neon 10GB, reasonable OpenAI usage), zero-hallucination requirement (answers must be grounded in retrieved content only), WCAG 2.1 AA accessibility compliance
**Scale/Scope**: ~400,000 textbook chunks indexed, 4 modules (ROS 2, Simulation, NVIDIA Isaac, VLA), estimated 100 daily active students

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### ✅ Principle VIII: Security and Secrets Management

**Compliance**:
- All API keys (OpenAI, Qdrant, Neon Postgres) stored in `.env` files
- Environment variables loaded via python-dotenv (backend)
- `.env.template` provided with placeholder values
- `.env` file added to `.gitignore` (never committed)
- FR-016/FR-017 explicitly enforce this requirement

**Evidence**:
- research.md Section 6 documents secrets management strategy
- quickstart.md Step 2 demonstrates `.env` setup workflow
- No hardcoded credentials in any planning documents

### ✅ Principle IX: Interactive Learning with RAG Integration

**Compliance**:
- RAG chatbot embedded in Docusaurus textbook (FR-001)
- OpenAI Agents SDK for response generation (research.md Section 1)
- Qdrant Cloud for vector search (research.md Section 2)
- Neon Serverless Postgres for conversation storage (research.md Section 3)
- FastAPI backend (research.md Section 4)
- Answers strictly from textbook content (FR-005, zero-hallucination requirement)
- Citation support (FR-010, FR-011)
- Text selection feature (FR-006, FR-007)

**Evidence**:
- All constitutional requirements mapped to functional requirements in spec.md
- Architecture documented in research.md aligns with Constitution IX technology stack

### ✅ Principle I: Educational Excellence

**Compliance**:
- Chatbot enhances learning by providing 24/7 assistance
- Citation support allows students to verify information
- Context-aware answers for selected text improve comprehension
- Conversation history enables natural learning dialogues

### ✅ Principle VII: Reproducibility and Version Control

**Compliance**:
- Complete quickstart.md with step-by-step setup instructions
- API contracts documented in OpenAPI format
- Data model fully specified with validation rules
- All code will be version-controlled on feature branch

**Gates Status**: ✅ ALL PASSED - No violations, proceed to implementation

---

## Project Structure

### Documentation (this feature)

```text
specs/001-rag-chatbot-integration/
├── spec.md                          # Feature specification (/sp.specify output)
├── plan.md                          # This file (/sp.plan output)
├── research.md                      # Phase 0: Technology research and decisions
├── data-model.md                    # Phase 1: Entity definitions and schema
├── quickstart.md                    # Phase 1: Developer setup guide
├── contracts/                       # Phase 1: API contracts
│   └── openapi.yaml                 # FastAPI OpenAPI 3.1 specification
├── checklists/                      # Quality validation
│   └── requirements.md              # Spec quality checklist (14/14 passed)
└── tasks.md                         # Phase 2: Implementation tasks (/sp.tasks - NOT YET CREATED)
```

### Source Code (repository root)

**Structure Decision**: Web application architecture with separate backend (FastAPI) and frontend (Docusaurus plugin). This structure is chosen because:
1. Backend and frontend have distinct technology stacks (Python vs TypeScript)
2. Backend can be deployed independently as a microservice
3. Docusaurus plugin integrates seamlessly with existing textbook structure
4. Clear separation of concerns (API layer vs UI layer)

```text
book1/
├── backend/                         # FastAPI backend service
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── chat.py          # /api/chat/query, /api/chat/conversations endpoints
│   │   │   │   └── health.py        # /health endpoint
│   │   │   └── dependencies.py      # Dependency injection (DB connections, clients)
│   │   ├── models/
│   │   │   ├── conversation.py      # Pydantic models for Conversation
│   │   │   ├── message.py           # Pydantic models for Message
│   │   │   └── citation.py          # Pydantic models for Citation
│   │   ├── services/
│   │   │   ├── qdrant_service.py    # Vector search operations
│   │   │   ├── openai_service.py    # Embedding & completion generation
│   │   │   ├── postgres_service.py  # Conversation CRUD operations
│   │   │   └── rag_service.py       # RAG orchestration (query → retrieval → response)
│   │   ├── config.py                # Environment variable loading
│   │   └── utils/
│   │       ├── logging.py           # Logging configuration
│   │       └── error_handlers.py    # Custom exception handlers
│   ├── scripts/
│   │   ├── verify_credentials.py    # Verify API keys and connections
│   │   ├── init_database.py         # Create Postgres tables
│   │   ├── index_textbook.py        # Chunk and index textbook content
│   │   └── verify_indexing.py       # Check Qdrant indexing status
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_qdrant_service.py
│   │   │   ├── test_openai_service.py
│   │   │   ├── test_postgres_service.py
│   │   │   └── test_rag_service.py
│   │   ├── integration/
│   │   │   ├── test_api_chat.py     # Test /api/chat/query endpoint
│   │   │   └── test_api_health.py   # Test /health endpoint
│   │   └── e2e/
│   │       └── test_full_flow.py    # End-to-end chatbot interaction
│   ├── requirements.txt             # Python dependencies
│   ├── .env.template                # Template for environment variables
│   └── README.md                    # Backend setup instructions

├── main-site/                       # Docusaurus v3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot/
│   │   │   │   ├── Chatbot.tsx      # Main chatbot component
│   │   │   │   ├── ChatMessage.tsx  # Individual message component
│   │   │   │   ├── ChatInput.tsx    # Input field and send button
│   │   │   │   ├── Citation.tsx     # Citation link component
│   │   │   │   ├── TextSelection.tsx # Text selection handler
│   │   │   │   └── chatbot.module.css
│   │   │   └── ...
│   │   └── theme/                   # Docusaurus theme customization (swizzling)
│   ├── plugins/
│   │   └── chatbot-plugin/
│   │       ├── index.js             # Plugin entry point
│   │       └── chatbot-client.js    # Client-side initialization
│   ├── static/
│   │   └── img/
│   │       └── chatbot-icon.svg     # Chatbot UI icon
│   ├── tests/
│   │   └── chatbot.test.tsx         # React component tests
│   ├── package.json
│   └── docusaurus.config.js         # Docusaurus configuration (plugin registration)

├── module1-ros2/                    # Textbook content (existing)
├── module2-simulation/              # Textbook content (existing)
├── module3-isaac/                   # Textbook content (future)
├── module4-vla/                     # Textbook content (future)
├── .gitignore                       # Must include .env, .env.local
└── README.md                        # Project overview
```

---

## Complexity Tracking

No Constitution Check violations. This section is not applicable.

---

## Implementation Phases

### Phase 0: Research ✅ COMPLETE

**Status**: Complete - see `research.md`

**Outputs**:
- ✅ research.md: 10 research sections covering all technical unknowns
  1. OpenAI Agents SDK selection (vs ChatKit, LangChain)
  2. Qdrant Cloud integration best practices
  3. Neon Serverless Postgres schema and connection management
  4. FastAPI backend architecture
  5. Docusaurus v3 chatbot UI integration
  6. Security and environment variable management
  7. Content indexing pipeline (chunking strategy)
  8. Citation generation strategy
  9. Testing strategy (unit, integration, e2e)
  10. Performance optimization (caching, batching, pooling)

**Key Decisions**:
- Use OpenAI Assistants API (native retrieval support)
- text-embedding-3-small for embeddings ($0.02/1M tokens, 1536-dim)
- Qdrant Cloud free tier (1GB storage, HNSW index, cosine similarity)
- Neon Serverless Postgres with asyncpg connection pooling
- FastAPI with async/await for all I/O operations
- Docusaurus plugin architecture for chatbot UI integration
- python-dotenv for secrets management (Constitution Principle VIII)

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Complete - see `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Outputs**:
- ✅ data-model.md: Entity definitions for TextbookChunk (Qdrant), Conversation, Message (Postgres)
- ✅ contracts/openapi.yaml: Full OpenAPI 3.1 specification with 3 endpoints
  - POST /api/chat/query (submit question)
  - GET /api/chat/conversations/{id} (retrieve history)
  - DELETE /api/chat/conversations/{id} (delete conversation)
  - GET /health (health check)
- ✅ quickstart.md: Developer setup guide (7 steps, ~30 minutes)

**Data Model Summary**:
- **TextbookChunk**: Vector embeddings in Qdrant (1536-dim, HNSW index)
  - Payload: module, week, tutorial_file, section_title, content, url_path
  - Validation: 200-1000 tokens per chunk, valid module/week/file paths
- **Conversation**: Postgres table with session_id, page_context, timestamps
  - 1:N relationship with Messages
  - Auto-update updated_at on message addition
- **Message**: Postgres table with role (user/assistant), content, citations (JSONB)
  - Citations only for assistant messages
  - selected_text_context only for user messages

**API Contract Summary**:
- POST /api/chat/query: Accept question, return answer with citations
  - Request: question (required), conversation_id (nullable), selected_text (nullable), page_context (nullable)
  - Response: answer, citations[], conversation_id
  - Error codes: 400 (validation), 429 (rate limit), 500 (internal), 503 (service unavailable)
- Pydantic models enforce strict validation (max lengths, required fields, enums)

---

### Phase 2: Task Breakdown (Next Step)

**Command**: Run `/sp.tasks` to generate `tasks.md`

**Expected Task Categories**:
1. **Backend Infrastructure** (T001-T010):
   - Setup FastAPI project structure
   - Configure environment variables and secrets
   - Implement Qdrant client and connection pooling
   - Implement Neon Postgres connection and schema
   - Create health check endpoint

2. **Data Services** (T011-T020):
   - Implement OpenAI embedding service
   - Implement OpenAI completion service (Assistants API)
   - Implement Qdrant search service
   - Implement Postgres CRUD for conversations/messages
   - Implement RAG orchestration service

3. **API Endpoints** (T021-T030):
   - Implement POST /api/chat/query endpoint
   - Implement GET /api/chat/conversations/{id} endpoint
   - Implement DELETE /api/chat/conversations/{id} endpoint
   - Add error handling middleware
   - Add CORS configuration

4. **Content Indexing** (T031-T040):
   - Implement markdown chunking algorithm
   - Implement textbook indexing script
   - Generate embeddings for all modules
   - Upload chunks to Qdrant
   - Verify indexing completeness

5. **Frontend Integration** (T041-T050):
   - Create Docusaurus chatbot plugin
   - Implement Chatbot React component
   - Implement ChatMessage component
   - Implement text selection detection
   - Implement citation link rendering

6. **Testing** (T051-T060):
   - Write unit tests for services
   - Write integration tests for API endpoints
   - Write end-to-end tests for full flow
   - Achieve 80%+ test coverage
   - Manual QA for text selection feature

7. **Documentation & Deployment** (T061-T070):
   - Update README with setup instructions
   - Create deployment guide (Railway/Fly.io)
   - Document API usage examples
   - Create troubleshooting guide

---

## Architecture Diagrams

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Browser)                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Docusaurus v3 (React 18)                                 │ │
│  │                                                            │ │
│  │  ┌────────────────────┐   ┌─────────────────────────┐    │ │
│  │  │  Textbook Pages    │   │  Chatbot Plugin         │    │ │
│  │  │  (MDX content)     │   │  - Chatbot.tsx          │    │ │
│  │  │                    │   │  - ChatMessage.tsx      │    │ │
│  │  │  [User selects     │   │  - TextSelection.tsx    │    │ │
│  │  │   text snippet]    │◄──┤  - Citation.tsx         │    │ │
│  │  └────────────────────┘   └──────────┬──────────────┘    │ │
│  │                                       │                    │ │
│  └───────────────────────────────────────┼────────────────────┘ │
│                                          │ HTTP POST            │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI - Python 3.11+)             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  API Layer                                                │ │
│  │  POST /api/chat/query  │  GET /conversations/{id}        │ │
│  │  DELETE /conversations/{id}  │  GET /health              │ │
│  └──────────────────┬────────────────────────────────────────┘ │
│                     │                                           │
│  ┌──────────────────▼────────────────────────────────────────┐ │
│  │  RAG Orchestration Service                                │ │
│  │  1. Embed query → OpenAI text-embedding-3-small           │ │
│  │  2. Search Qdrant → Top 5 relevant chunks                 │ │
│  │  3. Construct prompt with retrieved context               │ │
│  │  4. Call OpenAI Assistants API → Generate answer          │ │
│  │  5. Parse citations from response                         │ │
│  │  6. Store message in Postgres                             │ │
│  └───┬──────────────────┬─────────────────┬──────────────────┘ │
│      │                  │                 │                    │
└──────┼──────────────────┼─────────────────┼────────────────────┘
       │                  │                 │
       ▼                  ▼                 ▼
┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐
│   OpenAI     │  │  Qdrant Cloud   │  │  Neon Postgres     │
│   API        │  │  (Vector DB)    │  │  (Relational DB)   │
│              │  │                 │  │                    │
│ - Embeddings │  │ Collection:     │  │ Tables:            │
│   (1536-dim) │  │ textbook_chunks │  │ - conversations    │
│ - Assistants │  │                 │  │ - messages         │
│   API (GPT-4)│  │ ~400k chunks    │  │                    │
└──────────────┘  └─────────────────┘  └────────────────────┘
```

### Data Flow: User Question → Answer with Citations

```
User asks: "What is a ROS 2 node?"
  │
  ├─→ Frontend: Capture question + page_context
  │
  ├─→ POST /api/chat/query
  │   {
  │     "question": "What is a ROS 2 node?",
  │     "conversation_id": null,
  │     "page_context": "/docs/module1/week1/ros2-basics"
  │   }
  │
  ├─→ Backend: RAG Orchestration
  │   ├─→ Step 1: Embed query
  │   │   OpenAI.embeddings.create(input="What is a ROS 2 node?")
  │   │   → [0.012, -0.045, 0.789, ...] (1536-dim vector)
  │   │
  │   ├─→ Step 2: Search Qdrant
  │   │   qdrant.search(query_vector=embedding, limit=5)
  │   │   → Top 5 chunks:
  │   │      1. Module 1, Week 1, Tutorial 01 (score: 0.94)
  │   │      2. Module 1, Week 2, Tutorial 04 (score: 0.87)
  │   │      3. Module 1, Week 3, Tutorial 07 (score: 0.81)
  │   │
  │   ├─→ Step 3: Construct prompt
  │   │   system_prompt = "Answer using ONLY these excerpts..."
  │   │   context = "\n\n".join([chunk.content for chunk in top_chunks])
  │   │   prompt = f"{system_prompt}\n\nEXCERPTS:\n{context}\n\nQUESTION: {question}"
  │   │
  │   ├─→ Step 4: Call OpenAI Assistants API
  │   │   response = openai.chat.completions.create(
  │   │     messages=[{"role": "user", "content": prompt}]
  │   │   )
  │   │   → "A ROS 2 node is a process that performs computation. [Source 1]..."
  │   │
  │   ├─→ Step 5: Parse citations
  │   │   Extract [Source N] markers → map to chunk metadata
  │   │   citations = [
  │   │     {source: "Module 1, Week 1...", url: "/docs/module1/week1/ros2-basics#nodes", score: 0.94}
  │   │   ]
  │   │
  │   └─→ Step 6: Store in Postgres
  │       INSERT INTO conversations (session_id, page_context) VALUES (...)
  │       INSERT INTO messages (conversation_id, role='user', content='What is a ROS 2 node?')
  │       INSERT INTO messages (conversation_id, role='assistant', content='A ROS 2 node is...', citations=[...])
  │
  └─→ Response to Frontend
      {
        "answer": "A ROS 2 node is a process that performs computation...",
        "citations": [{source: "...", url: "/docs/...", score: 0.94}],
        "conversation_id": "uuid"
      }
      │
      └─→ Frontend: Render answer + clickable citations
```

---

## Risk Analysis

### Risk 1: OpenAI API Rate Limits

**Likelihood**: Medium
**Impact**: High (chatbot unavailable during peak usage)

**Mitigation**:
- Implement request queuing with exponential backoff
- Cache frequently asked questions (Redis - future enhancement)
- Monitor usage via OpenAI dashboard, set alerts
- Consider switching to gpt-3.5-turbo for cost/rate savings if needed

### Risk 2: Qdrant Cloud Free Tier Storage Limit

**Likelihood**: Low (1GB supports ~400k chunks, sufficient for 4 modules)
**Impact**: Medium (cannot index more content)

**Mitigation**:
- Monitor storage usage via Qdrant dashboard
- Optimize chunking (larger chunks = fewer total chunks)
- Upgrade to paid tier if needed ($0.15/GB/month)

### Risk 3: Hallucinations (Answers Not Grounded in Textbook)

**Likelihood**: Medium (LLMs naturally hallucinate)
**Impact**: High (violates SC-003, erodes trust)

**Mitigation**:
- Strict system prompt: "ONLY use provided excerpts, NEVER use external knowledge"
- Post-processing: Verify all answer sentences map to retrieved chunks
- Confidence threshold: If similarity score <0.7, respond "I don't have information..."
- Manual QA: Subject matter experts validate 100 random answers

### Risk 4: Slow Response Time (>3 seconds)

**Likelihood**: Medium
**Impact**: Medium (violates SC-001, poor UX)

**Mitigation**:
- Optimize Qdrant search (<200ms via HNSW indexing)
- Use gpt-3.5-turbo instead of gpt-4 for faster inference
- Implement streaming responses (WebSocket) for typing indicators
- Connection pooling for Postgres (reduce query latency)
- CDN caching for static chatbot assets

### Risk 5: Security Breach (API Keys Exposed)

**Likelihood**: Low (with proper .gitignore)
**Impact**: Critical (financial cost, service abuse)

**Mitigation**:
- Enforce .gitignore for .env files
- Automated secret scanning in CI/CD (e.g., GitGuardian)
- Rotate API keys periodically
- Use environment-specific keys (dev vs prod)
- Principle of least privilege (read-only Qdrant access where possible)

---

## Success Metrics (from spec.md)

**Post-Implementation Validation**:

- **SC-001**: Response time <3s → Test with 100 sample queries, measure p95 latency
- **SC-002**: 95% accuracy → Manual validation by 2 subject matter experts on 100 random answers
- **SC-003**: Zero hallucinations → Automated test: verify all answer sentences have source in retrieved chunks
- **SC-004**: 100 concurrent users → Load test with Locust (ramp up to 100 concurrent requests)
- **SC-005**: 90% task completion without external search → User study (10 students, task completion tracking)
- **SC-006**: All responses have citations → Automated test: assert len(citations) >= 1 for non-meta questions
- **SC-007**: Multi-turn conversation accuracy → Test 10 conversation flows (5+ messages each)
- **SC-008**: Text selection accuracy 95% → Manual test: 20 text selections across different content types
- **SC-009**: Zero exposed credentials → Automated secret scanning (TruffleHog, GitGuardian)
- **SC-010**: Graceful degradation → Manually test error scenarios (Qdrant down, Postgres down, OpenAI rate limit)

---

## Next Steps

1. **Run `/sp.tasks`** to generate task breakdown in `tasks.md`
2. **Begin implementation** following tasks in priority order
3. **Track progress** using task status (pending → in_progress → completed)
4. **Create ADRs** for any architectural decisions made during implementation (via `/sp.adr`)
5. **Deploy to staging** after core functionality complete (P1 user stories)
6. **User testing** with 5-10 students before production release

---

**Plan Status**: ✅ COMPLETE - Ready for `/sp.tasks`
