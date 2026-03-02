# Data Model: User Authentication with Personalization

**Feature**: 001-user-auth
**Date**: 2025-12-30
**Database**: Neon Serverless Postgres

---

## Overview

The data model consists of two distinct ownership domains:

1. **Better Auth Domain** (managed by Better Auth framework):
   - `user` - Core authentication identity
   - `session` - Active user sessions
   - `account` - OAuth/social accounts (future)
   - `verification` - Email verification tokens

2. **Application Domain** (managed by FastAPI backend):
   - `user_profile` - Extended user profile with skill level
   - `questionnaire_response` - Individual background questionnaire answers
   - `gdpr_request` - Data export/deletion requests for compliance

All tables share the same database and are linked via `user.id` foreign keys.

---

## Better Auth Domain Tables

### Table: `user`

**Owner**: Better Auth framework
**Purpose**: Core authentication identity and credentials

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique user identifier (Better Auth generates UUIDs) |
| `email` | TEXT | UNIQUE NOT NULL | User email address (login credential) |
| `emailVerified` | BOOLEAN | NOT NULL DEFAULT false | Whether email has been verified |
| `name` | TEXT | NULL | Optional display name |
| `image` | TEXT | NULL | Optional profile picture URL |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT now() | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Unique index on `email`

**Notes**:
- Better Auth manages password storage in a separate hashed format (not in this table)
- Email verification status tracked via `emailVerified` and `verification` table
- Additional fields can be added via Better Auth `additionalFields` config but kept minimal

---

### Table: `session`

**Owner**: Better Auth framework
**Purpose**: Track active authenticated sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique session identifier |
| `userId` | TEXT | NOT NULL REFERENCES user(id) ON DELETE CASCADE | User this session belongs to |
| `expiresAt` | TIMESTAMP | NOT NULL | Session expiration (30 days from creation) |
| `token` | TEXT | UNIQUE NOT NULL | Session token (stored in httpOnly cookie) |
| `ipAddress` | TEXT | NULL | IP address of session origin |
| `userAgent` | TEXT | NULL | Browser/client user agent string |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT now() | Session creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT now() | Last activity timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key index on `userId`
- Unique index on `token`
- Index on `expiresAt` for cleanup queries

**Notes**:
- Sessions expire after 30 days as per FR-013
- `updatedAt` refreshes on activity to enable "remember me" functionality
- Better Auth automatically cleans expired sessions

---

### Table: `account`

**Owner**: Better Auth framework
**Purpose**: Link OAuth/social provider accounts (future feature)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique account link identifier |
| `userId` | TEXT | NOT NULL REFERENCES user(id) ON DELETE CASCADE | User who owns this linked account |
| `provider` | TEXT | NOT NULL | OAuth provider (google, github, etc.) |
| `providerAccountId` | TEXT | NOT NULL | User ID from the OAuth provider |
| `accessToken` | TEXT | NULL | OAuth access token (encrypted) |
| `refreshToken` | TEXT | NULL | OAuth refresh token (encrypted) |
| `expiresAt` | TIMESTAMP | NULL | Token expiration timestamp |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT now() | Link creation timestamp |

**Indexes**:
- Primary key on `id`
- Foreign key index on `userId`
- Unique composite index on `(provider, providerAccountId)`

**Notes**:
- Out of scope for MVP (email/password only)
- Included in schema for Better Auth initialization
- Future enhancement: Google/GitHub signin

---

### Table: `verification`

**Owner**: Better Auth framework
**Purpose**: Email verification and password reset tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique verification record identifier |
| `identifier` | TEXT | NOT NULL | Email address being verified |
| `value` | TEXT | NOT NULL | Verification token (random secure string) |
| `expiresAt` | TIMESTAMP | NOT NULL | Token expiration (typically 24 hours) |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT now() | Token generation timestamp |

**Indexes**:
- Primary key on `id`
- Index on `identifier` for lookup
- Index on `value` for token validation
- Index on `expiresAt` for cleanup

**Notes**:
- Used for both email verification and password reset flows
- Tokens automatically expire and are cleaned up by Better Auth
- One-time use: deleted after successful verification

---

## Application Domain Tables

### Table: `user_profile`

**Owner**: FastAPI backend
**Purpose**: Extended user profile with skill level and personalization data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Unique profile identifier |
| `user_id` | TEXT | UNIQUE NOT NULL REFERENCES user(id) ON DELETE CASCADE | Links to Better Auth user |
| `skill_level` | TEXT | NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) | Calculated skill level |
| `software_experience_years` | INTEGER | NULL CHECK (software_experience_years >= 0) | Years of programming experience |
| `programming_languages` | TEXT[] | NULL | Array of known programming languages |
| `python_proficiency` | TEXT | NULL CHECK (python_proficiency IN ('none', 'basic', 'intermediate', 'advanced')) | Python skill level |
| `cpp_proficiency` | TEXT | NULL CHECK (cpp_proficiency IN ('none', 'basic', 'intermediate', 'advanced')) | C++ skill level |
| `ros_exposure` | BOOLEAN | NOT NULL DEFAULT false | Prior ROS/ROS 2 experience |
| `hardware_experience` | TEXT | NULL CHECK (hardware_experience IN ('none', 'hobbyist', 'professional')) | Embedded systems experience |
| `robotics_hardware` | TEXT[] | NULL | Array of robotics hardware worked with |
| `sensor_integration_exp` | BOOLEAN | NOT NULL DEFAULT false | Sensor integration experience |
| `robot_deployment_exp` | BOOLEAN | NOT NULL DEFAULT false | Real-world robot deployment experience |
| `ml_frameworks` | TEXT[] | NULL | Array of ML frameworks used (TensorFlow, PyTorch, etc.) |
| `computer_vision_exp` | BOOLEAN | NOT NULL DEFAULT false | Computer vision experience |
| `llm_familiarity` | TEXT | NULL CHECK (llm_familiarity IN ('none', 'basic', 'intermediate', 'advanced')) | LLM/GenAI familiarity |
| `career_objectives` | TEXT | NULL | Free-text career goals |
| `robotics_domains_interest` | TEXT[] | NULL | Array of robotics domains of interest |
| `learning_pace` | TEXT | NULL CHECK (learning_pace IN ('self-paced', 'structured', 'intensive')) | Preferred learning pace |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT now() | Profile creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL DEFAULT now() | Last profile update timestamp |

**Indexes**:
- Primary key on `id`
- Unique index on `user_id` (one profile per user)
- Index on `skill_level` for personalization queries
- Index on `updated_at` for recent activity tracking

**Notes**:
- Created immediately after user completes questionnaire (FR-005, FR-010)
- Skill level calculated by FastAPI `skill_calculator` service based on questionnaire responses
- Updated when user edits profile (FR-015, FR-016)
- Soft validation: NULL allowed for optional fields to support partial questionnaire completion

---

### Table: `questionnaire_response`

**Owner**: FastAPI backend
**Purpose**: Store individual questionnaire answers for audit and recalculation

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Unique response identifier |
| `user_id` | TEXT | NOT NULL REFERENCES user(id) ON DELETE CASCADE | User who submitted response |
| `question_id` | TEXT | NOT NULL | Identifier for the question (e.g., "software_exp_years") |
| `question_category` | TEXT | NOT NULL CHECK (question_category IN ('software', 'hardware', 'aiml', 'goals')) | Question category for grouping |
| `response_value` | JSONB | NOT NULL | Flexible response storage (string, number, array, object) |
| `is_required` | BOOLEAN | NOT NULL DEFAULT false | Whether question was mandatory |
| `answered_at` | TIMESTAMP | NOT NULL DEFAULT now() | When user answered this question |

**Indexes**:
- Primary key on `id`
- Composite index on `(user_id, question_id)` for user's answer lookup
- Index on `question_category` for category-based queries
- GIN index on `response_value` for JSONB queries

**Notes**:
- Stores granular questionnaire data for analytics and skill level recalculation
- JSONB allows flexible response types: text, numbers, arrays, nested objects
- Immutable audit trail: new rows created on profile updates (existing rows not modified)
- Supports skill level recalculation when algorithm changes (FR-016)

---

### Table: `gdpr_request`

**Owner**: FastAPI backend
**Purpose**: Track GDPR data export and deletion requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Unique request identifier |
| `user_id` | TEXT | NOT NULL REFERENCES user(id) ON DELETE CASCADE | User requesting GDPR action |
| `request_type` | TEXT | NOT NULL CHECK (request_type IN ('export', 'deletion')) | Type of GDPR request |
| `status` | TEXT | NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending' | Request processing status |
| `requested_at` | TIMESTAMP | NOT NULL DEFAULT now() | When request was submitted |
| `processed_at` | TIMESTAMP | NULL | When request was completed/failed |
| `export_file_url` | TEXT | NULL | S3/storage URL for exported data (export requests only) |
| `deletion_scheduled_for` | TIMESTAMP | NULL | Scheduled deletion date (30 days from request per FR-018) |
| `error_message` | TEXT | NULL | Error details if status='failed' |

**Indexes**:
- Primary key on `id`
- Index on `user_id` for user's request history
- Index on `status` for processing queue queries
- Composite index on `(request_type, status)` for filtered queries

**Notes**:
- Data exports (FR-017): generate JSON file with all user data
- Account deletions (FR-018): 30-day delay before permanent removal
- Supports GDPR right to data portability and right to be forgotten
- Automated background job processes pending requests

---

## Relationships

```
user (Better Auth)
 │
 ├─→ session (Better Auth) [1:N]
 │    └─ One user can have multiple active sessions (multi-device support)
 │
 ├─→ account (Better Auth) [1:N] [Future]
 │    └─ One user can link multiple OAuth providers
 │
 ├─→ user_profile (FastAPI) [1:1]
 │    └─ One user has exactly one extended profile
 │
 ├─→ questionnaire_response (FastAPI) [1:N]
 │    └─ One user has multiple questionnaire responses (audit trail)
 │
 └─→ gdpr_request (FastAPI) [1:N]
      └─ One user can make multiple GDPR requests over time
```

---

## Data Flow

### 1. Signup Flow (User Story 1 - P1)

```
1. User submits email + password → auth-service
2. Better Auth creates:
   - user row (id, email, emailVerified=false)
   - session row (token, userId, expiresAt=now()+30d)
3. Frontend receives session cookie → redirect to questionnaire
4. User completes questionnaire → backend
5. FastAPI creates:
   - user_profile row (user_id=user.id, all questionnaire fields)
   - questionnaire_response rows (one per question answered)
6. FastAPI calculates skill_level based on responses
7. User redirected to personalized dashboard
```

### 2. Signin Flow (User Story 2 - P2)

```
1. User submits email + password → auth-service
2. Better Auth validates credentials
3. Better Auth creates new session row (or updates existing)
4. Frontend receives session cookie → redirect to dashboard
5. Dashboard queries backend for user_profile data
6. Content personalized based on skill_level
```

### 3. Profile Update Flow (User Story 3 - P3)

```
1. Authenticated user edits profile → backend
2. FastAPI validates session by querying session table
3. FastAPI updates user_profile row (updated_at=now())
4. FastAPI creates new questionnaire_response rows (audit trail)
5. FastAPI recalculates skill_level if background changed
6. Updated profile returned to frontend
```

### 4. Data Export Flow (FR-017)

```
1. User requests data export → backend
2. FastAPI creates gdpr_request row (type='export', status='pending')
3. Background job:
   - Queries user, user_profile, questionnaire_response tables
   - Generates JSON file with all user data
   - Uploads to secure storage
   - Updates gdpr_request (status='completed', export_file_url=url)
4. User downloads file from provided URL
```

### 5. Account Deletion Flow (FR-018)

```
1. User requests account deletion → backend
2. FastAPI creates gdpr_request row (type='deletion', deletion_scheduled_for=now()+30d)
3. After 30 days, background job:
   - Deletes user_profile, questionnaire_response, gdpr_request rows (CASCADE)
   - Calls Better Auth API to delete user row
   - Better Auth cascades: session, account, verification rows deleted
4. All personal data permanently removed
```

---

## Validation Rules

### Field Constraints (enforced at database and application layer)

| Field | Rule | Error Message |
|-------|------|---------------|
| `email` | Valid email format | "Invalid email address format" |
| `email` | Unique across users | "Email already registered" |
| `skill_level` | One of: beginner, intermediate, advanced | "Invalid skill level" |
| `software_experience_years` | >= 0 | "Experience years cannot be negative" |
| `python_proficiency`, `cpp_proficiency` | One of: none, basic, intermediate, advanced | "Invalid proficiency level" |
| `hardware_experience` | One of: none, hobbyist, professional | "Invalid hardware experience level" |
| `llm_familiarity` | One of: none, basic, intermediate, advanced | "Invalid LLM familiarity level" |
| `learning_pace` | One of: self-paced, structured, intensive | "Invalid learning pace" |

### Business Logic Validation (enforced at application layer)

| Rule | Enforced By | Description |
|------|-------------|-------------|
| Questionnaire completeness | FastAPI | At least software OR hardware background required for skill level calculation |
| Skill level recalculation | FastAPI `skill_calculator` | Automatically triggered when profile background fields updated |
| Session expiration | Better Auth | Sessions invalid after 30 days; require re-authentication |
| Password requirements | Better Auth | Min 8 characters, mix of uppercase/lowercase/numbers/symbols |
| GDPR deletion delay | FastAPI | 30-day waiting period before permanent deletion |

---

## State Transitions

### User Account States

```
[Unregistered]
    ↓ (signup)
[Registered - Email Unverified]
    ↓ (verify email) [Future]
[Registered - Active]
    ↓ (request deletion)
[Pending Deletion] (30-day wait)
    ↓ (deletion job)
[Deleted] (permanent)
```

### GDPR Request States

```
[Pending] → [Processing] → [Completed]
                        ↘ [Failed]
```

### Session States

```
[Active] → [Expired] (after 30 days)
       ↘ [Invalidated] (logout/password change)
```

---

## Indexes for Performance

### Critical Indexes

1. **`user(email)`** - Unique index for login lookup (Better Auth managed)
2. **`session(token)`** - Unique index for session validation (Better Auth managed)
3. **`session(userId, expiresAt)`** - Composite for active sessions query
4. **`user_profile(user_id)`** - Unique for profile lookup by auth ID
5. **`user_profile(skill_level)`** - For personalization filtering
6. **`questionnaire_response(user_id, question_id)`** - Composite for answer retrieval
7. **`gdpr_request(status, request_type)`** - For background job processing queue

### Query Optimization

- **Session validation**: `SELECT * FROM session WHERE token = ? AND expiresAt > now()`
  - Uses `session(token)` unique index

- **Profile lookup**: `SELECT * FROM user_profile WHERE user_id = ?`
  - Uses `user_profile(user_id)` unique index

- **Skill-based content filtering**: `SELECT user_id FROM user_profile WHERE skill_level = ?`
  - Uses `user_profile(skill_level)` index

---

## Migration Strategy

### Phase 1: Better Auth Tables (Automated)

Better Auth CLI automatically generates and runs migrations:

```bash
npx better-auth migrate
```

This creates: `user`, `session`, `account`, `verification` tables.

### Phase 2: Application Tables (Alembic)

FastAPI uses Alembic for application domain migrations:

```bash
# Generate migration
alembic revision --autogenerate -m "Add user profile and questionnaire tables"

# Apply migration
alembic upgrade head
```

Creates: `user_profile`, `questionnaire_response`, `gdpr_request` tables.

### Rollback Plan

```bash
# Rollback FastAPI tables
alembic downgrade -1

# Better Auth handles schema changes via versioned migrations
```

---

## Data Retention Policy

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Active user accounts | Indefinite | Until user requests deletion |
| Expired sessions | 30 days after expiration | Better Auth automatic cleanup |
| Questionnaire responses | Indefinite | Audit trail for skill level calculations |
| GDPR export files | 7 days after generation | Temporary download link |
| GDPR deletion requests | 90 days after completion | Compliance audit trail |
| Deleted user data | Permanently removed | GDPR compliance (right to be forgotten) |

---

## Security Considerations

### Data Protection

1. **Password Storage**: Better Auth uses Scrypt hashing (passwords never stored plaintext)
2. **Session Tokens**: Cryptographically random, stored in httpOnly cookies
3. **Sensitive Fields**: Email addresses, IP addresses treated as PII
4. **Encryption at Rest**: Neon Postgres provides automatic encryption

### Access Control

1. **Database Credentials**: Stored in `.env`, never in code
2. **Service Isolation**: auth-service and backend use separate DB connection pools
3. **Row-Level Security** (future): Postgres RLS to enforce user data access by user_id

### Audit Trail

- `questionnaire_response` provides immutable audit trail of user answers
- `gdpr_request` tracks all data export/deletion operations
- Better Auth logs authentication events (successful logins, failures)
