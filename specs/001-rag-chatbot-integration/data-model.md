# Data Model: RAG Chatbot Integration

**Feature**: 001-rag-chatbot-integration
**Date**: 2025-12-29

## Overview

This document defines the data entities, relationships, and validation rules for the RAG chatbot system. The system uses two primary data stores:

1. **Qdrant Cloud** (vector database): Textbook content chunks with embeddings
2. **Neon Serverless Postgres** (relational database): Conversation history and messages

---

## Entity Definitions

### 1. TextbookChunk (Vector Database - Qdrant)

Represents a semantically meaningful segment of textbook content stored as vectors for similarity search.

**Storage**: Qdrant Cloud collection `textbook_chunks`

**Schema**:
```python
class TextbookChunk:
    id: UUID                    # Unique chunk identifier
    vector: List[float]         # 1536-dim embedding from text-embedding-3-small
    payload: {
        "module": str,          # e.g., "module1-ros2", "module2-simulation"
        "week": int,            # Week number (1-12 per module)
        "tutorial_file": str,   # e.g., "01-ros2-basics.md"
        "section_title": str,   # Section/heading title from markdown
        "content": str,         # Full text content of chunk (500-800 tokens)
        "file_path": str,       # Relative path: "module1-ros2/docs/week1/01-ros2-basics.md"
        "line_start": int,      # Starting line number in source file
        "line_end": int,        # Ending line number in source file
        "url_path": str,        # Published URL path with anchor
        "chunk_index": int,     # Sequential index within file
        "created_at": datetime  # Indexing timestamp
    }
```

**Validation Rules**:
- `vector` must be exactly 1536 dimensions (OpenAI text-embedding-3-small output)
- `content` length: 200-1000 tokens (prevents too-small or too-large chunks)
- `module` must match pattern: `module[1-4]-(ros2|simulation|isaac|vla)`
- `week` must be between 1-12
- `url_path` must start with `/docs/` and include section anchor
- `section_title` cannot be empty
- `file_path` must exist in repository

**Relationships**:
- Multiple chunks belong to one tutorial file
- Chunks are ordered by `chunk_index` within a file
- No foreign keys (vector DB doesn't support relational constraints)

**Indexes**:
- Vector similarity index (HNSW algorithm, cosine distance)
- Payload filters on: `module`, `week`, `tutorial_file`

---

### 2. Conversation (Relational Database - Neon Postgres)

Represents a chat session between a student and the chatbot, tied to a browser session.

**Storage**: Postgres table `conversations`

**Schema**:
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    page_context TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
```

**Python Model** (Pydantic):
```python
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class Conversation(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    session_id: str = Field(max_length=255)  # Browser session/cookie ID
    page_context: str | None = None          # URL where conversation started
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Validation Rules**:
- `session_id` is required (generated client-side or server-assigned)
- `session_id` format: UUIDv4 or session token
- `page_context` must be a valid URL path (starts with `/`)
- `created_at` <= `updated_at`
- Auto-update `updated_at` on any message addition

**Relationships**:
- One conversation has many messages (1:N)
- Cascade delete: Deleting conversation deletes all messages

**State Transitions**:
```
[New] → (first message) → [Active] → (30 days idle) → [Archived]
                                  → (user clicks "New conversation") → [Closed]
```

---

### 3. Message (Relational Database - Neon Postgres)

Represents a single message in a conversation (either user question or assistant response).

**Storage**: Postgres table `messages`

**Schema**:
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    selected_text_context TEXT,
    citations JSONB,
    token_count INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

**Python Model** (Pydantic):
```python
class Citation(BaseModel):
    source: str              # Formatted citation text
    url: str                 # Link to exact textbook section
    module: str
    week: int
    tutorial_file: str
    section_title: str
    relevance_score: float   # Similarity score from Qdrant search

class Message(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    conversation_id: UUID
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=5000)
    selected_text_context: str | None = Field(default=None, max_length=5000)
    citations: list[Citation] = Field(default_factory=list)
    token_count: int | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Validation Rules**:
- `role` must be exactly "user" or "assistant"
- `content` cannot be empty (min 1 char, max 5000 chars)
- `selected_text_context` only present for user messages when text was selected
- `citations` only present for assistant messages
- `citations` must have at least 1 citation if content references textbook
- `token_count` used for OpenAI usage tracking

**Relationships**:
- Many messages belong to one conversation (N:1)
- Messages ordered by `created_at` ASC within a conversation

**Business Rules**:
- User messages and assistant messages alternate (user always starts)
- If user message has `selected_text_context`, assistant response should prioritize that context
- Assistant messages must include `citations` unless answering meta-questions ("How do I use this chatbot?")

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────┐
│      Qdrant Cloud (Vector DB)      │
│                                     │
│  ┌───────────────────────────┐     │
│  │   TextbookChunk           │     │
│  │   - id (UUID)             │     │
│  │   - vector (1536-dim)     │     │
│  │   - payload {             │     │
│  │       module, week,       │     │
│  │       tutorial_file,      │     │
│  │       section_title,      │     │
│  │       content, url_path   │     │
│  │     }                     │     │
│  └───────────────────────────┘     │
│         (No FK relationships)       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Neon Postgres (Relational DB)    │
│                                     │
│  ┌───────────────────────────┐     │
│  │   Conversation            │     │
│  │   - id (PK)               │     │
│  │   - session_id            │     │
│  │   - page_context          │     │
│  │   - created_at            │     │
│  │   - updated_at            │     │
│  └───────────────┬───────────┘     │
│                  │                  │
│                  │ 1:N              │
│                  │                  │
│  ┌───────────────▼───────────┐     │
│  │   Message                 │     │
│  │   - id (PK)               │     │
│  │   - conversation_id (FK)  │     │
│  │   - role (user/assistant) │     │
│  │   - content               │     │
│  │   - selected_text_context │     │
│  │   - citations (JSONB)     │     │
│  │   - token_count           │     │
│  │   - created_at            │     │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘

External (not persisted):
┌─────────────────────────┐
│  OpenAI Assistants API  │  (Stateless, no data model)
│  - Used for inference   │
│  - No conversation      │
│    persistence          │
└─────────────────────────┘
```

---

## Data Flows

### Flow 1: User Asks General Question

```
1. Frontend → Backend: POST /api/chat/query
   {
     "question": "What is a ROS 2 node?",
     "conversation_id": null,  // New conversation
     "page_context": "/docs/module1/week1/ros2-basics"
   }

2. Backend:
   a. Generate embedding for question → OpenAI text-embedding-3-small
   b. Search Qdrant:
      - Query vector: embedding from step 2a
      - Filter: None (search all modules)
      - Limit: 5 chunks
      - Returns: List[TextbookChunk] with relevance scores

   c. Create/retrieve Conversation:
      - If conversation_id is null → INSERT new Conversation
      - Else → SELECT existing Conversation

   d. Insert user Message:
      - role: "user"
      - content: "What is a ROS 2 node?"
      - conversation_id: from step 2c

   e. Call OpenAI Assistants API:
      - System prompt + retrieved chunks (from step 2b)
      - User question
      - Returns: Assistant response with inline citations

   f. Parse citations from response → list[Citation]

   g. Insert assistant Message:
      - role: "assistant"
      - content: parsed answer
      - citations: from step 2f
      - conversation_id: from step 2c

3. Backend → Frontend: Response
   {
     "answer": "A ROS 2 node is...",
     "citations": [
       {
         "source": "Module 1, Week 1, Tutorial 01: ROS 2 Basics",
         "url": "/docs/module1/week1/ros2-basics#nodes",
         "relevance_score": 0.92
       }
     ],
     "conversation_id": "uuid-here"
   }
```

### Flow 2: User Asks Question with Text Selection

```
1. Frontend → Backend: POST /api/chat/query
   {
     "question": "Why is this important?",
     "conversation_id": "existing-uuid",
     "selected_text": "<link name=\"base_link\">\n  <inertial>...",  // Selected URDF snippet
     "page_context": "/docs/module2/week4/links-joints"
   }

2. Backend:
   a. Generate embedding for: question + selected_text (combined context)

   b. Search Qdrant:
      - Boost results from page_context module/week
      - Apply text selection as additional filter

   c. Retrieve Conversation + last 5 Messages for context

   d. Insert user Message with selected_text_context

   e. Call OpenAI with:
      - Conversation history (last 5 messages)
      - Selected text as primary context
      - Retrieved chunks as supplementary context

   f. Insert assistant Message with citations

   g. Return response (same format as Flow 1)
```

---

## Data Lifecycle & Retention

### Textbook Chunks (Qdrant)

**Creation**: One-time indexing script (`scripts/index_textbook.py`)
- Triggered manually when textbook content changes
- Re-indexes modified modules only (detect changes via git diff)

**Updates**:
- Full re-index when content changes significantly
- Partial updates for typo fixes (update specific chunks)

**Deletion**:
- Remove chunks when textbook sections are deleted
- Archive old module versions (keep for reference)

**Retention**: Indefinite (no automatic cleanup)

### Conversations & Messages (Neon Postgres)

**Creation**: On-demand when user asks first question

**Updates**:
- `conversations.updated_at` updated on every new message
- Messages are immutable (no edits after creation)

**Deletion**:
- Conversations idle >90 days → archived to separate table
- User can manually clear conversation history (DELETE conversation)
- Cascade delete ensures orphaned messages are removed

**Retention Policy**:
- Active conversations: Indefinite
- Idle >90 days: Archived (moved to `archived_conversations` table)
- Archived >1 year: Deleted permanently

**Privacy**:
- No personal identifiable information (PII) stored
- Session IDs are anonymous UUIDs
- No user authentication → no user profiles

---

## Performance Considerations

### Qdrant Vector Search

- **Index Type**: HNSW (Hierarchical Navigable Small World)
- **Distance Metric**: Cosine similarity
- **Search Latency**: <200ms for top-5 results
- **Scaling**: 1GB free tier supports ~400,000 chunks (sufficient for 4 modules)

### Postgres Queries

- **Conversation Lookup**: O(1) via `idx_conversations_session` index
- **Message History**: O(log N) via `idx_messages_conversation` index
- **Pagination**: Use `LIMIT/OFFSET` for message history (load last 20 messages)

**Query Optimization**:
```sql
-- Efficient: Load conversation with last 5 messages
SELECT c.*,
       json_agg(m ORDER BY m.created_at DESC) FILTER (WHERE m.id IS NOT NULL) as messages
FROM conversations c
LEFT JOIN LATERAL (
    SELECT * FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 5
) m ON true
WHERE c.id = $1
GROUP BY c.id;
```

---

## Validation Summary

All entities enforce strict validation:

✅ **TextbookChunk**: Vector dimensions, payload completeness, URL format
✅ **Conversation**: Session ID format, timestamp ordering
✅ **Message**: Role enum, content length, citation structure
✅ **Citation**: Required fields, URL validity

These rules ensure data integrity and prevent malformed queries/responses.
