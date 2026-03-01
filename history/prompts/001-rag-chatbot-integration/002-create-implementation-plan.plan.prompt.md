---
id: 002
title: Create RAG Chatbot Implementation Plan
stage: plan
date: 2025-12-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-rag-chatbot-integration
branch: 001-rag-chatbot-integration
user: user
command: /sp.plan
labels: ["plan", "rag-chatbot", "architecture", "phase0-research", "phase1-design"]
links:
  spec: specs/001-rag-chatbot-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-rag-chatbot-integration/plan.md
  - specs/001-rag-chatbot-integration/research.md
  - specs/001-rag-chatbot-integration/data-model.md
  - specs/001-rag-chatbot-integration/quickstart.md
  - specs/001-rag-chatbot-integration/contracts/openapi.yaml
tests:
  - Constitution Check validation (all gates passed)
  - Research completeness validation (10/10 sections)
  - Data model validation (3 entities fully specified)
  - API contract validation (OpenAPI 3.1 schema valid)
---

## Prompt

/sp.plan

## Response snapshot

Created comprehensive implementation plan for RAG Chatbot Integration feature, completing Phase 0 (Research) and Phase 1 (Design & Contracts).

### **Phase 0: Research (COMPLETE)**

Generated `research.md` with 10 research sections resolving all technical unknowns:

1. **OpenAI Agents SDK vs ChatKit**: Selected OpenAI Assistants API (native retrieval, conversation threading)
2. **Qdrant Cloud Integration**: Free tier with text-embedding-3-small (1536-dim, $0.02/1M tokens)
3. **Neon Serverless Postgres**: asyncpg with connection pooling, schema defined (conversations, messages tables)
4. **FastAPI Backend**: Async architecture, CORS configuration, Pydantic validation
5. **Docusaurus v3 Integration**: Custom plugin with React components, text selection support
6. **Security & Secrets**: python-dotenv, .env files, .gitignore enforcement (Constitution Principle VIII)
7. **Content Indexing**: Chunking strategy (500-800 tokens, 100 token overlap, respect markdown headers)
8. **Citation Generation**: Format as "Module X, Week Y, Tutorial Z: Section", include clickable URLs
9. **Testing Strategy**: Unit (pytest), integration (API), e2e (Playwright)
10. **Performance Optimization**: <3s response time budget (100ms embed, 200ms search, 1-2s completion, 50ms DB)

### **Phase 1: Design & Contracts (COMPLETE)**

**1. Data Model (`data-model.md`)**:
- **TextbookChunk** (Qdrant): 1536-dim vectors, payload with module/week/tutorial/section/content/url_path
- **Conversation** (Postgres): UUID, session_id, page_context, timestamps, 1:N with Messages
- **Message** (Postgres): UUID, conversation_id, role (user/assistant), content, citations (JSONB), selected_text_context
- Entity relationships, validation rules, indexes, performance considerations documented

**2. API Contracts (`contracts/openapi.yaml`)**:
- **POST /api/chat/query**: Submit question, return answer with citations
  - Request: question (required), conversation_id (nullable), selected_text (nullable), page_context (nullable)
  - Response: answer, citations[], conversation_id
  - Error handling: 400, 429, 500, 503
- **GET /api/chat/conversations/{id}**: Retrieve conversation history with pagination
- **DELETE /api/chat/conversations/{id}**: Delete conversation and cascade delete messages
- **GET /health**: Health check for Qdrant, Postgres, OpenAI
- Pydantic schemas: QueryRequest, QueryResponse, Citation, Message, ConversationResponse, ErrorResponse, HealthResponse

**3. Developer Quickstart (`quickstart.md`)**:
- 7-step setup guide (~30 minutes)
- Prerequisites: Python 3.11+, Node.js 18+, OpenAI/Qdrant/Neon accounts (all free tiers)
- Environment variable configuration with .env.template
- Database schema initialization script
- Textbook indexing script (~10 min, $0.50 one-time cost)
- Backend (FastAPI) and frontend (Docusaurus) startup instructions
- Testing procedures and troubleshooting guide

**4. Implementation Plan (`plan.md`)**:
- **Summary**: RAG chatbot embedded in Docusaurus, zero-hallucination requirement, citation support
- **Technical Context**: Python 3.11+/TypeScript 5+, FastAPI/React 18/Docusaurus v3, Qdrant/Neon Postgres
- **Constitution Check**: ✅ ALL PASSED (Principles VIII, IX, I, VII validated)
- **Project Structure**: Web app architecture (backend/ and main-site/ directories), detailed file tree
- **Architecture Diagrams**: System architecture and data flow (User Question → RAG → Answer with Citations)
- **Risk Analysis**: 5 risks identified (API rate limits, storage limits, hallucinations, latency, security breach) with mitigations
- **Success Metrics**: 10 validation methods for post-implementation testing
- **Next Steps**: Run /sp.tasks to generate task breakdown

### **Constitution Compliance**:

✅ **Principle VIII (Security)**: All credentials in .env files, python-dotenv loading, .env.template provided, no hardcoded secrets
✅ **Principle IX (RAG Integration)**: All constitutional tech stack requirements mapped (OpenAI Agents, Qdrant, Neon Postgres, FastAPI)
✅ **Principle I (Educational Excellence)**: 24/7 assistance, citation verification, context-aware answers
✅ **Principle VII (Reproducibility)**: Complete quickstart guide, API contracts, data model specifications

## Outcome

- ✅ Impact: Completed comprehensive architectural design with 5 planning artifacts (plan.md, research.md, data-model.md, quickstart.md, openapi.yaml) totaling ~1,400 lines of technical documentation
- 🧪 Tests: Constitution Check passed (4/4 principles validated), all technical unknowns resolved, API contract valid OpenAPI 3.1 schema
- 📁 Files: Created/updated 5 files in specs/001-rag-chatbot-integration/
- 🔁 Next prompts:
  1. `/sp.tasks` to generate actionable task breakdown in tasks.md
  2. Begin implementation following task priorities
  3. `/sp.adr` if significant architectural decisions arise during implementation
- 🧠 Reflection: The planning phase successfully translated high-level constitutional requirements (Principle IX) into concrete, implementable architecture. Key achievement: Resolved the complexity of RAG systems (embedding → vector search → grounded generation → citation parsing) into clear service boundaries (qdrant_service, openai_service, postgres_service, rag_service). The zero-hallucination requirement (SC-003) is enforced through strict prompt engineering and post-processing validation. The 30-minute quickstart demonstrates commitment to reproducibility (Principle VII).

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully without blockers
- Graders run and results (PASS/FAIL): PASS - Constitution Check (4/4), Research completeness (10/10), Data model validation (3 entities), API contract validation (OpenAPI 3.1)
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 0 (Research) and Phase 1 (Design & Contracts)
- Next experiment (smallest change to try): Consider adding Redis caching layer for frequently asked questions as performance enhancement (mentioned in research.md Section 10 but not in core architecture - evaluate after load testing)
