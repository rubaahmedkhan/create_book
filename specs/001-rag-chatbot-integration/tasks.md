# Tasks: RAG Chatbot Integration for Interactive Learning

**Input**: Design documents from `/specs/001-rag-chatbot-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests are NOT explicitly requested in the specification, but recommended for quality assurance. Test tasks are included and marked clearly.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure (Web app architecture):
- **Backend**: `backend/app/`, `backend/scripts/`, `backend/tests/`
- **Frontend**: `main-site/src/`, `main-site/plugins/`, `main-site/tests/`
- **Documentation**: `specs/001-rag-chatbot-integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure: backend/app/{api/routes,models,services,utils}, backend/scripts/, backend/tests/{unit,integration,e2e}
- [ ] T002 Create backend/requirements.txt with dependencies: fastapi, uvicorn, openai, qdrant-client, asyncpg, psycopg2-binary, python-dotenv, pydantic, pytest, pytest-asyncio
- [ ] T003 [P] Create backend/.env.template with placeholders for OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY, NEON_DATABASE_URL, DOCUSAURUS_URL, CORS_ORIGINS, LOG_LEVEL
- [ ] T004 [P] Add .env and .env.local to .gitignore at repository root
- [ ] T005 Create frontend directory structure: main-site/src/components/Chatbot/, main-site/plugins/chatbot-plugin/
- [ ] T006 Update main-site/package.json with dependencies: @docusaurus/core@3.x, react@18, react-dom@18
- [ ] T007 [P] Create backend/README.md with setup instructions from quickstart.md
- [ ] T008 [P] Create main-site/static/img/chatbot-icon.svg (chatbot UI icon)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create backend/app/config.py to load environment variables using python-dotenv with validation for required keys
- [ ] T010 [P] Create backend/app/utils/logging.py with structured logging configuration (INFO level default)
- [ ] T011 [P] Create backend/app/utils/error_handlers.py with custom exception classes: QdrantError, PostgresError, OpenAIError, ValidationError
- [ ] T012 Create backend/app/main.py FastAPI application with CORS middleware configured from CORS_ORIGINS env var
- [ ] T013 Implement backend/app/api/dependencies.py with dependency injection functions: get_qdrant_client(), get_postgres_pool(), get_openai_client()
- [ ] T014 Create backend/scripts/verify_credentials.py to test connections to OpenAI, Qdrant, and Neon Postgres
- [ ] T015 Create backend/scripts/init_database.py to create conversations and messages tables per data-model.md schema
- [ ] T016 [P] Implement backend/app/models/conversation.py with Pydantic model matching data-model.md Conversation entity
- [ ] T017 [P] Implement backend/app/models/message.py with Pydantic model matching data-model.md Message entity, including Citation sub-model
- [ ] T018 [P] Implement backend/app/models/citation.py with Pydantic model matching data-model.md Citation entity
- [ ] T019 Create backend/app/api/routes/health.py implementing GET /health endpoint per contracts/openapi.yaml
- [ ] T020 Register health route in backend/app/main.py with app.include_router()

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - General Book Questions (Priority: P1) 🎯 MVP

**Goal**: Students can ask general questions about any textbook topic and receive accurate answers with citations drawn strictly from indexed content.

**Independent Test**: Load any textbook page, ask "What is a ROS 2 node?", verify answer is accurate and includes citations to Module 1 content with clickable links.

### Implementation for User Story 1

- [ ] T021 [P] [US1] Implement backend/app/services/openai_service.py with generate_embedding(text) method using text-embedding-3-small
- [ ] T022 [P] [US1] Implement backend/app/services/qdrant_service.py with search_chunks(query_vector, limit=5, score_threshold=0.7) method
- [ ] T023 [P] [US1] Implement backend/app/services/postgres_service.py with create_conversation(), create_message(), get_conversation() async methods using asyncpg
- [ ] T024 [US1] Implement backend/app/services/openai_service.py with generate_response(prompt, retrieved_chunks) method using OpenAI Assistants API per research.md
- [ ] T025 [US1] Implement backend/app/services/rag_service.py with orchestrate_query(question, conversation_id, page_context) method calling embed → search → generate → store pipeline
- [ ] T026 [US1] Implement backend/app/api/routes/chat.py with POST /api/chat/query endpoint per contracts/openapi.yaml, calling rag_service.orchestrate_query()
- [ ] T027 [US1] Add citation parsing logic to backend/app/services/rag_service.py to extract [Source N] markers and map to chunk metadata per research.md Section 8
- [ ] T028 [US1] Add request validation in backend/app/api/routes/chat.py using Pydantic models for QueryRequest/QueryResponse per contracts/openapi.yaml
- [ ] T029 [US1] Add error handling in backend/app/api/routes/chat.py for 400 (validation), 429 (rate limit), 500 (internal), 503 (service unavailable) per contracts/openapi.yaml
- [ ] T030 [US1] Register chat route in backend/app/main.py
- [ ] T031 [P] [US1] Create main-site/src/components/Chatbot/Chatbot.tsx React component with message list, input field, send button, and conversation state management
- [ ] T032 [P] [US1] Create main-site/src/components/Chatbot/ChatMessage.tsx component to render user/assistant messages with role-based styling
- [ ] T033 [P] [US1] Create main-site/src/components/Chatbot/ChatInput.tsx component with text input, send button, and Enter key handling
- [ ] T034 [P] [US1] Create main-site/src/components/Chatbot/Citation.tsx component to render clickable citation links per data-model.md Citation entity
- [ ] T035 [P] [US1] Create main-site/src/components/Chatbot/chatbot.module.css with styling for chatbot widget (bottom-right positioning, expand/collapse animation)
- [ ] T036 [US1] Implement sendMessage() function in main-site/src/components/Chatbot/Chatbot.tsx to POST to /api/chat/query with question, conversation_id, page_context
- [ ] T037 [US1] Add typing indicator animation in main-site/src/components/Chatbot/Chatbot.tsx while waiting for response
- [ ] T038 [US1] Create main-site/plugins/chatbot-plugin/index.js to inject chatbot component into all pages using injectHtmlTags()
- [ ] T039 [US1] Create main-site/plugins/chatbot-plugin/chatbot-client.js to initialize chatbot on page load and mount to DOM
- [ ] T040 [US1] Register chatbot plugin in main-site/docusaurus.config.js plugins array
- [ ] T041 [US1] Create backend/scripts/index_textbook.py to chunk markdown files per research.md Section 7 (500-800 tokens, 100 overlap, respect headers)
- [ ] T042 [US1] Implement chunking algorithm in backend/scripts/index_textbook.py using markdown section splitting (H2/H3 boundaries)
- [ ] T043 [US1] Add embedding generation loop in backend/scripts/index_textbook.py calling OpenAI text-embedding-3-small for each chunk
- [ ] T044 [US1] Add Qdrant upload logic in backend/scripts/index_textbook.py to create collection textbook_chunks and insert points per data-model.md TextbookChunk schema
- [ ] T045 [US1] Add metadata extraction in backend/scripts/index_textbook.py to parse module, week, tutorial_file, section_title, url_path from file paths
- [ ] T046 [US1] Create backend/scripts/verify_indexing.py to query Qdrant and display indexed chunk count and sample chunks
- [ ] T047 [US1] Update quickstart.md Step 4 with actual index_textbook.py usage instructions

**Checkpoint**: At this point, User Story 1 should be fully functional - students can ask general questions and receive cited answers

---

## Phase 4: User Story 2 - Context-Specific Questions from Selected Text (Priority: P2)

**Goal**: Students can highlight text on any page and ask questions specifically about that selection, receiving context-aware answers.

**Independent Test**: Select a URDF XML snippet from Module 2, click "Ask about this selection", ask "Why is inertia important here?", verify answer focuses on the selected context.

### Implementation for User Story 2

- [ ] T048 [P] [US2] Create main-site/src/components/Chatbot/TextSelection.tsx component to detect text selection via window.getSelection()
- [ ] T049 [P] [US2] Add mouseup event listener in main-site/src/components/Chatbot/TextSelection.tsx to show floating "Ask about this" button when text is selected
- [ ] T050 [US2] Implement button positioning logic in main-site/src/components/Chatbot/TextSelection.tsx to place button near selection using getBoundingClientRect()
- [ ] T051 [US2] Add onClick handler in main-site/src/components/Chatbot/TextSelection.tsx to capture selected text and open chatbot with pre-filled context
- [ ] T052 [US2] Update backend/app/services/rag_service.py orchestrate_query() to accept optional selected_text parameter and prioritize it in vector search
- [ ] T053 [US2] Modify backend/app/services/rag_service.py to combine selected_text + question when generating embedding (boosts contextual relevance)
- [ ] T054 [US2] Update backend/app/api/routes/chat.py POST /api/chat/query to accept selected_text in request body per contracts/openapi.yaml
- [ ] T055 [US2] Update backend/app/models/message.py to store selected_text_context field for user messages per data-model.md
- [ ] T056 [US2] Modify backend/app/services/postgres_service.py create_message() to persist selected_text_context to messages table
- [ ] T057 [US2] Update main-site/src/components/Chatbot/Chatbot.tsx sendMessage() to include selected_text in API request
- [ ] T058 [US2] Add visual indicator in main-site/src/components/Chatbot/ChatMessage.tsx to show when a user message includes selected text (e.g., quote box)
- [ ] T059 [US2] Integrate TextSelection.tsx into chatbot-client.js initialization flow

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - general questions AND text selection questions

---

## Phase 5: User Story 3 - Conversation History and Follow-Up Questions (Priority: P3)

**Goal**: Students can ask follow-up questions without repeating context, with conversation history maintained across sessions.

**Independent Test**: Ask "How does SLAM work?", receive answer, then ask "What sensors does it need?" without mentioning SLAM, verify chatbot maintains context.

### Implementation for User Story 3

- [ ] T060 [P] [US3] Update backend/app/services/postgres_service.py with get_conversation_history(conversation_id, limit=5) method to retrieve last N messages
- [ ] T061 [US3] Modify backend/app/services/rag_service.py orchestrate_query() to load conversation history and include it in OpenAI prompt for context
- [ ] T062 [US3] Update backend/app/services/openai_service.py generate_response() to accept conversation_history parameter and format as message array
- [ ] T063 [US3] Add conversation_id persistence in main-site/src/components/Chatbot/Chatbot.tsx using localStorage or sessionStorage
- [ ] T064 [US3] Implement loadConversationHistory() method in main-site/src/components/Chatbot/Chatbot.tsx to fetch existing conversation on component mount
- [ ] T065 [US3] Add GET /api/chat/conversations/{id} endpoint in backend/app/api/routes/chat.py per contracts/openapi.yaml
- [ ] T066 [US3] Implement backend/app/services/postgres_service.py get_conversation_with_messages(conversation_id, limit, offset) for pagination support
- [ ] T067 [US3] Add "New conversation" button in main-site/src/components/Chatbot/Chatbot.tsx to clear conversation_id and start fresh
- [ ] T068 [US3] Implement clearConversation() handler in main-site/src/components/Chatbot/Chatbot.tsx to reset state and remove from localStorage
- [ ] T069 [US3] Update backend/app/services/postgres_service.py with update_conversation_timestamp() to set updated_at on new messages
- [ ] T070 [US3] Add conversation restoration logic in main-site/src/components/Chatbot/Chatbot.tsx to load messages from localStorage if conversation_id exists

**Checkpoint**: All three user stories should now work - general questions, text selection, AND conversation history

---

## Phase 6: User Story 4 - Citation and Source References (Priority: P4)

**Goal**: Every chatbot response includes citations to specific textbook sections with clickable hyperlinks for verification.

**Independent Test**: Ask about Gazebo physics engines, verify response includes citation like "Module 2, Week 5, Tutorial 06: Gazebo Physics" with working link.

### Implementation for User Story 4

- [ ] T071 [P] [US4] Implement format_citation() utility function in backend/app/utils/citation_formatter.py per research.md Section 8 format: "Module X, Week Y, Tutorial Z: Section"
- [ ] T072 [P] [US4] Implement generate_citation_link() utility in backend/app/utils/citation_formatter.py to construct URL path from chunk metadata
- [ ] T073 [US4] Update backend/app/services/rag_service.py to call format_citation() and generate_citation_link() for each retrieved chunk
- [ ] T074 [US4] Ensure backend/app/services/rag_service.py populates Citation objects with all fields: source, url, module, week, tutorial_file, section_title, relevance_score
- [ ] T075 [US4] Update main-site/src/components/Chatbot/Citation.tsx to render citation as clickable link with source text and relevance score
- [ ] T076 [US4] Add onClick handler to main-site/src/components/Chatbot/Citation.tsx to navigate to citation URL using window.location or React Router
- [ ] T077 [US4] Style citations in main-site/src/components/Chatbot/chatbot.module.css with distinct formatting (e.g., smaller font, blue link color)
- [ ] T078 [US4] Render multiple citations in main-site/src/components/Chatbot/ChatMessage.tsx as a list below the answer text
- [ ] T079 [US4] Add "Sources" section header in main-site/src/components/Chatbot/ChatMessage.tsx when citations exist
- [ ] T080 [US4] Validate that all assistant messages have at least one citation in backend/app/services/rag_service.py (warn if missing)

**Checkpoint**: All four user stories complete - full chatbot functionality with general questions, text selection, conversation history, and citations

---

## Phase 7: Testing & Quality Assurance

**Purpose**: Comprehensive testing across all user stories

### Unit Tests

- [ ] T081 [P] Create backend/tests/unit/test_qdrant_service.py with mocked Qdrant client to test search_chunks() with various query vectors
- [ ] T082 [P] Create backend/tests/unit/test_openai_service.py with mocked OpenAI client to test generate_embedding() and generate_response()
- [ ] T083 [P] Create backend/tests/unit/test_postgres_service.py with mocked asyncpg pool to test CRUD operations for conversations and messages
- [ ] T084 [P] Create backend/tests/unit/test_rag_service.py to test orchestrate_query() with mocked dependencies (embedding, search, generation, storage)
- [ ] T085 [P] Create backend/tests/unit/test_citation_formatter.py to test format_citation() and generate_citation_link() with sample chunk metadata

### Integration Tests

- [ ] T086 [P] Create backend/tests/integration/test_api_chat.py to test POST /api/chat/query with real FastAPI TestClient
- [ ] T087 [P] Create backend/tests/integration/test_api_health.py to test GET /health endpoint
- [ ] T088 [P] Create backend/tests/integration/test_api_conversations.py to test GET and DELETE /api/chat/conversations/{id} endpoints
- [ ] T089 Create backend/tests/integration/test_database.py to verify Postgres schema matches data-model.md (tables, columns, indexes)
- [ ] T090 Create backend/tests/integration/test_indexing.py to run index_textbook.py on sample markdown and verify chunks in Qdrant

### End-to-End Tests

- [ ] T091 Create backend/tests/e2e/test_full_flow.py to simulate: ask question → receive answer with citations → ask follow-up → verify context maintained
- [ ] T092 Create backend/tests/e2e/test_text_selection_flow.py to test: select text → ask question → verify contextual answer
- [ ] T093 Create backend/tests/e2e/test_conversation_persistence.py to test: start conversation → close browser → reopen → verify history loaded
- [ ] T094 Create main-site/tests/chatbot.test.tsx with Jest/React Testing Library to test Chatbot component rendering and interactions

### Quality Validation

- [ ] T095 Run backend/scripts/verify_credentials.py to confirm all API keys are valid
- [ ] T096 Run backend/scripts/verify_indexing.py to confirm all modules (1-4) are indexed with expected chunk counts
- [ ] T097 Validate that no .env files are committed using: git ls-files | grep ".env"
- [ ] T098 Run pytest backend/tests/ -v --cov=backend/app --cov-report=term to achieve 80%+ test coverage
- [ ] T099 Test all 10 success criteria from spec.md Success Criteria section (SC-001 through SC-010)
- [ ] T100 Manual QA: Test chatbot on 5 different textbook pages across different modules

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T101 [P] Add rate limiting middleware in backend/app/main.py using slowapi library (10 requests per minute per IP)
- [ ] T102 [P] Implement DELETE /api/chat/conversations/{id} endpoint in backend/app/api/routes/chat.py per contracts/openapi.yaml
- [ ] T103 [P] Add markdown rendering support in main-site/src/components/Chatbot/ChatMessage.tsx using react-markdown for code blocks, lists, bold/italic
- [ ] T104 [P] Implement keyboard navigation (Tab, Enter, Esc) in main-site/src/components/Chatbot/Chatbot.tsx for WCAG 2.1 AA compliance
- [ ] T105 [P] Add ARIA labels to chatbot components for screen reader accessibility
- [ ] T106 Add mobile-responsive CSS in main-site/src/components/Chatbot/chatbot.module.css for smartphone/tablet devices
- [ ] T107 Optimize backend/scripts/index_textbook.py to support incremental re-indexing (detect changed files via git diff)
- [ ] T108 Add streaming response support in backend/app/api/routes/chat.py using FastAPI StreamingResponse for typing indicators (future enhancement)
- [ ] T109 Create deployment guide in specs/001-rag-chatbot-integration/DEPLOYMENT.md for Railway.app and Fly.io
- [ ] T110 Update root README.md with RAG chatbot feature description and link to quickstart.md
- [ ] T111 Add troubleshooting section to backend/README.md for common issues (connection failures, indexing errors, CORS issues)
- [ ] T112 Run security audit: automated secret scanning with TruffleHog or GitGuardian per risk analysis in plan.md
- [ ] T113 Run quickstart.md validation: follow all 7 steps on fresh environment to ensure reproducibility

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Testing (Phase 7)**: Can run tests for completed user stories incrementally, or all at end
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ INDEPENDENT
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 chatbot but independently testable ✅ INDEPENDENT
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds conversation history to US1, independently testable ✅ INDEPENDENT
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Enhances US1 citations, independently testable ✅ INDEPENDENT

**Note**: All 4 user stories are independently testable. US2, US3, US4 extend US1 functionality but can be implemented and verified independently.

### Within Each User Story

**User Story 1 (General Questions)**:
1. Services in parallel (T021, T022, T023) → RAG orchestration (T024, T025) → API endpoint (T026-T030)
2. Frontend components in parallel (T031-T035) → Integration (T036-T037) → Plugin setup (T038-T040)
3. Indexing script (T041-T046) can run in parallel with frontend work
4. Complete order: Foundational → Services → API → Frontend → Indexing → Test

**User Story 2 (Text Selection)**:
1. Frontend TextSelection component (T048-T051) in parallel with backend changes (T052-T056)
2. Integration tasks (T057-T059) after both frontend and backend complete

**User Story 3 (Conversation History)**:
1. Backend database methods (T060-T062, T066, T069) in parallel with frontend state management (T063-T064, T067-T068, T070)
2. API endpoint (T065) after backend methods complete

**User Story 4 (Citations)**:
1. Backend formatting utilities (T071-T074) in parallel with frontend rendering (T075-T079)
2. Validation (T080) after backend complete

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T003, T004, T007, T008 can all run in parallel (different files)

**Within Foundational (Phase 2)**:
- T010, T011 (utils) in parallel
- T016, T017, T018 (models) in parallel
- T019 (health endpoint) in parallel with models

**Within User Story 1**:
- T021, T022, T023 (services) in parallel
- T031, T032, T033, T034, T035 (components) in parallel
- Indexing scripts (T041-T046) in parallel with frontend (T031-T040)

**Within Testing (Phase 7)**:
- All unit tests (T081-T085) in parallel
- All integration tests (T086-T090) in parallel
- E2E tests (T091-T094) can run in parallel if isolated

**Within Polish (Phase 8)**:
- T101, T102, T103, T104, T105 (independent features) in parallel

**Across User Stories**:
- US1, US2, US3, US4 can be worked on in parallel by different developers after Foundational phase complete

---

## Parallel Example: User Story 1

```bash
# After Foundational phase complete, launch US1 services in parallel:
Task T021: "Implement OpenAI embedding service"
Task T022: "Implement Qdrant search service"
Task T023: "Implement Postgres CRUD service"

# Once services complete, launch US1 components in parallel:
Task T031: "Chatbot.tsx main component"
Task T032: "ChatMessage.tsx component"
Task T033: "ChatInput.tsx component"
Task T034: "Citation.tsx component"
Task T035: "chatbot.module.css styling"

# Indexing can run in parallel with frontend work:
Task T041-T046: "Create and run index_textbook.py script"
```

---

## Parallel Example: All User Stories (Multi-Developer Team)

```bash
# After Foundational phase (T001-T020) complete:

# Developer A: User Story 1 (MVP)
Tasks T021-T047

# Developer B: User Story 2 (Text Selection) - can start immediately
Tasks T048-T059

# Developer C: User Story 3 (Conversation History) - can start immediately
Tasks T060-T070

# Developer D: User Story 4 (Citations) - can start immediately
Tasks T071-T080

# All stories complete and test independently before integration
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (T001-T008)
2. ✅ Complete Phase 2: Foundational (T009-T020) - CRITICAL checkpoint
3. ✅ Complete Phase 3: User Story 1 (T021-T047)
4. **STOP and VALIDATE**:
   - Run backend: `uvicorn app.main:app --reload`
   - Index textbook: `python scripts/index_textbook.py --modules all`
   - Test: Ask "What is a ROS 2 node?" and verify cited answer
   - Verify SC-001, SC-002, SC-003, SC-006 from spec.md
5. **Deploy/Demo MVP**: Functional chatbot with general questions

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Backend + DB + Indexing ready
2. **MVP** (Phase 3: US1) → Test independently → Deploy/Demo 🚀
3. **Enhancement 1** (Phase 4: US2) → Test text selection → Deploy/Demo 🚀
4. **Enhancement 2** (Phase 5: US3) → Test conversation history → Deploy/Demo 🚀
5. **Enhancement 3** (Phase 6: US4) → Test citation formatting → Deploy/Demo 🚀
6. **Quality** (Phase 7: Testing) → Full test suite validation
7. **Production Ready** (Phase 8: Polish) → Accessibility, rate limiting, deployment guides

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy (4 Developers)

**Week 1**: All developers on Setup + Foundational (T001-T020)

**Week 2-3**: Parallel user story development
- Dev A: User Story 1 (T021-T047) - MVP priority
- Dev B: User Story 2 (T048-T059) - Ready for integration after US1
- Dev C: User Story 3 (T060-T070) - Ready for integration after US1
- Dev D: User Story 4 (T071-T080) - Ready for integration after US1

**Week 4**: Integration, Testing, Polish
- All devs: Merge user stories, run full test suite (T081-T100)
- All devs: Polish tasks (T101-T113)

**Week 5**: Deployment and validation
- Follow deployment guide, validate quickstart.md, user acceptance testing

---

## Task Summary

**Total Tasks**: 113

**Phase Breakdown**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 12 tasks
- Phase 3 (User Story 1 - P1): 27 tasks 🎯 MVP
- Phase 4 (User Story 2 - P2): 12 tasks
- Phase 5 (User Story 3 - P3): 11 tasks
- Phase 6 (User Story 4 - P4): 10 tasks
- Phase 7 (Testing): 20 tasks
- Phase 8 (Polish): 13 tasks

**Parallelizable Tasks**: 45 tasks marked with [P]

**User Story Distribution**:
- US1 (General Questions): 27 tasks
- US2 (Text Selection): 12 tasks
- US3 (Conversation History): 11 tasks
- US4 (Citations): 10 tasks

**Critical Path**: Setup → Foundational → US1 Core Services (T021-T025) → US1 API (T026-T030) → US1 Frontend (T031-T040) → Indexing (T041-T047)

**Suggested MVP Scope**: Phases 1-3 (T001-T047) = 47 tasks for functional chatbot with general questions and citations

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests (Phase 7) can be run incrementally after each user story completes
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently before proceeding
- Follow quickstart.md for environment setup before starting implementation
- Refer to plan.md for architecture details and risk mitigations
- Refer to data-model.md for entity schemas and validation rules
- Refer to contracts/openapi.yaml for exact API request/response formats
