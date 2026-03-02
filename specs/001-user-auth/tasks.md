---

description: "Task list for user authentication with personalization feature"
---

# Tasks: User Authentication with Personalization

**Input**: Design documents from `/specs/001-user-auth/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in feature specification - tests are optional for this implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Hybrid architecture**: `auth-service/`, `backend/`, `frontend/` at repository root
- **Shared config**: `shared/` at repository root
- Paths shown below are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for all three services

- [x] T001 Create root project structure with auth-service, backend, frontend, and shared directories
- [x] T002 [P] Initialize auth-service Node.js project with TypeScript 5.x in auth-service/package.json
- [x] T003 [P] Initialize backend Python project with FastAPI in backend/requirements.txt
- [x] T004 [P] Initialize frontend React/Next.js project in frontend/package.json
- [x] T005 [P] Create auth-service TypeScript configuration in auth-service/tsconfig.json
- [x] T006 [P] Create backend Python project config with pyproject.toml in backend/pyproject.toml
- [x] T007 [P] Create .env.template files for all services (auth-service/.env.template, backend/.env.template, frontend/.env.template)
- [x] T008 [P] Add .env files to .gitignore in root .gitignore
- [x] T009 [P] Create shared TypeScript types directory in shared/types/user.ts
- [x] T010 [P] Document hybrid architecture in shared/docs/architecture.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 Install Better Auth dependency in auth-service/package.json (better-auth@^1.0.0)
- [ ] T012 [P] Install Neon Postgres client in auth-service/package.json (@neondatabase/serverless)
- [ ] T013 [P] Install FastAPI and dependencies in backend/requirements.txt (fastapi, uvicorn, sqlalchemy, alembic, psycopg2-binary, python-dotenv)
- [ ] T014 [P] Install Hono web framework in auth-service/package.json (hono@^3.0.0)
- [ ] T015 Create Neon Serverless Postgres database instance and copy connection string to .env files
- [x] T016 Configure Better Auth in auth-service/src/auth.ts (database connection, session config, 30-day expiration)
- [x] T017 [P] Configure Neon Postgres client in auth-service/src/lib/db.ts
- [ ] T018 Run Better Auth migrations to create user, session, account, verification tables (npx better-auth migrate)
- [x] T019 Setup FastAPI database connection in backend/src/db/database.py (SQLAlchemy engine with Neon Postgres)
- [x] T020 [P] Initialize Alembic for database migrations in backend/ (alembic init backend/src/db/migrations)
- [x] T021 [P] Configure Alembic to use Neon Postgres URL from .env in backend/alembic.ini
- [x] T022 Create SQLAlchemy models for user_profile in backend/src/models/user_profile.py
- [x] T023 [P] Create SQLAlchemy models for questionnaire_response in backend/src/models/questionnaire.py
- [x] T024 [P] Create SQLAlchemy models for gdpr_request in backend/src/models/gdpr_request.py
- [ ] T025 Generate Alembic migration for application tables (user_profile, questionnaire_response, gdpr_request)
- [ ] T026 Run Alembic migrations to create application tables (alembic upgrade head)
- [x] T027 Create Hono server entry point in auth-service/src/index.ts (CORS, trusted origins, health endpoint)
- [x] T028 [P] Create FastAPI app entry point in backend/src/main.py (CORS, health endpoint)
- [x] T029 Implement session validation middleware in backend/src/api/middleware/auth.py (query session table from Better Auth)
- [x] T030 [P] Create shared database schema documentation in shared/database/schema.sql
- [ ] T031 Verify Better Auth endpoints are accessible (POST /api/auth/sign-up, /sign-in, /sign-out)
- [ ] T032 [P] Verify FastAPI health endpoint is accessible (GET /health)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Signup with Background Assessment (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts and complete background questionnaire to receive personalized content

**Independent Test**: Create a new account with email/password, complete the background questionnaire, verify user profile is created with skill level assigned and background information stored

### Implementation for User Story 1

- [x] T033 [P] [US1] Create SignupForm React component in frontend/src/components/auth/SignupForm.tsx
- [x] T034 [P] [US1] Create Better Auth React client in frontend/src/services/authClient.ts
- [x] T035 [US1] Implement signup form submission calling Better Auth /sign-up endpoint in SignupForm.tsx
- [x] T036 [P] [US1] Create QuestionnaireFlow React component in frontend/src/components/questionnaire/QuestionnaireFlow.tsx
- [x] T037 [P] [US1] Create SoftwareBackground questionnaire section component in frontend/src/components/questionnaire/SoftwareBackground.tsx
- [x] T038 [P] [US1] Create HardwareBackground questionnaire section component in frontend/src/components/questionnaire/HardwareBackground.tsx
- [x] T039 [P] [US1] Create AIMLBackground questionnaire section component in frontend/src/components/questionnaire/AIMLBackground.tsx
- [x] T040 [P] [US1] Create LearningGoals questionnaire section component in frontend/src/components/questionnaire/LearningGoals.tsx
- [x] T041 [US1] Wire up questionnaire flow with multi-step form state management in QuestionnaireFlow.tsx
- [x] T042 [P] [US1] Create FastAPI client for backend API in frontend/src/services/api.ts
- [x] T043 [US1] Implement questionnaire submission calling POST /api/questionnaire endpoint in QuestionnaireFlow.tsx
- [x] T044 [P] [US1] Create Pydantic schema for questionnaire submission in backend/src/api/questionnaire.py
- [x] T045 [US1] Implement POST /api/questionnaire endpoint in backend/src/api/questionnaire.py (validate session, parse request)
- [x] T046 [P] [US1] Create skill level calculator service in backend/src/services/skill_calculator.py
- [x] T047 [US1] Implement skill level calculation algorithm (beginner/intermediate/advanced based on experience years and background)
- [x] T048 [P] [US1] Create profile service in backend/src/services/profile.py
- [x] T049 [US1] Implement profile creation logic in profile service (create user_profile row, questionnaire_response rows, assign skill level)
- [x] T050 [US1] Wire questionnaire endpoint to profile service (call profile creation after validation)
- [x] T051 [US1] Add error handling for duplicate profile creation (409 Conflict) in questionnaire endpoint
- [x] T052 [P] [US1] Create personalized dashboard placeholder component in frontend/src/components/dashboard/Dashboard.tsx
- [x] T053 [US1] Implement redirect to dashboard after questionnaire completion in QuestionnaireFlow.tsx
- [x] T054 [US1] Display user skill level on dashboard by calling GET /api/profile endpoint

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Existing User Signin (Priority: P2)

**Goal**: Enable existing users to sign in and access their personalized learning experience

**Independent Test**: Sign in with previously created credentials, verify session is established, profile data is accessible, and user can navigate to personalized content

### Implementation for User Story 2

- [ ] T055 [P] [US2] Create SigninForm React component in frontend/src/components/auth/SigninForm.tsx
- [ ] T056 [US2] Implement signin form submission calling Better Auth /sign-in endpoint in SigninForm.tsx
- [ ] T057 [US2] Add error handling for invalid credentials (401 Unauthorized) in SigninForm.tsx
- [ ] T058 [US2] Implement session persistence check on app load (call GET /api/auth/session) in frontend/src/app/layout.tsx or _app.tsx
- [ ] T059 [US2] Implement automatic redirect to dashboard if valid session exists
- [ ] T060 [US2] Create session context provider in frontend/src/contexts/SessionContext.tsx (store user data, session state)
- [ ] T061 [US2] Wire dashboard to display personalized content based on skill level from session context
- [ ] T062 [P] [US2] Implement GET /api/profile endpoint in backend/src/api/profile.py (validate session, return user profile)
- [ ] T063 [US2] Add authorization check to profile endpoint (ensure user can only access their own profile)
- [ ] T064 [US2] Handle 404 Not Found if profile doesn't exist (redirect to questionnaire) in dashboard

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Profile Management and Background Updates (Priority: P3)

**Goal**: Enable users to view, update their profile information, export data, and delete accounts

**Independent Test**: Sign in, navigate to profile settings, view background information, update responses, save changes, verify skill level recalculation, test data export and account deletion flows

### Implementation for User Story 3

- [ ] T065 [P] [US3] Create ProfileView component in frontend/src/components/profile/ProfileView.tsx
- [ ] T066 [P] [US3] Create ProfileEdit component in frontend/src/components/profile/ProfileEdit.tsx
- [ ] T067 [P] [US3] Create DataExport component in frontend/src/components/profile/DataExport.tsx
- [ ] T068 [US3] Implement profile view displaying all questionnaire responses in ProfileView.tsx
- [ ] T069 [US3] Implement profile edit form with pre-filled current values in ProfileEdit.tsx
- [ ] T070 [P] [US3] Create Pydantic schema for profile update in backend/src/api/profile.py
- [ ] T071 [US3] Implement PATCH /api/profile endpoint in backend/src/api/profile.py (validate session, parse updates)
- [ ] T072 [US3] Implement profile update logic in profile service (update user_profile, create new questionnaire_response rows)
- [ ] T073 [US3] Wire profile update endpoint to skill calculator (recalculate if background changed)
- [ ] T074 [US3] Update profile edit form submission calling PATCH /api/profile endpoint
- [ ] T075 [US3] Display updated skill level after profile save in ProfileEdit.tsx
- [ ] T076 [P] [US3] Create GDPR service in backend/src/services/gdpr.py
- [ ] T077 [P] [US3] Implement POST /api/gdpr/export endpoint in backend/src/api/gdpr.py (create gdpr_request row)
- [ ] T078 [US3] Implement data export request handling in GDPR service (generate JSON with all user data)
- [ ] T079 [US3] Wire data export button to call POST /api/gdpr/export endpoint in DataExport.tsx
- [ ] T080 [US3] Implement GET /api/gdpr/export/{requestId} endpoint to check export status
- [ ] T081 [US3] Display download link when export is completed in DataExport.tsx
- [ ] T082 [P] [US3] Implement POST /api/gdpr/delete endpoint in backend/src/api/gdpr.py (password confirmation, create deletion request)
- [ ] T083 [US3] Implement account deletion scheduling in GDPR service (set deletion_scheduled_for to 30 days from now)
- [ ] T084 [US3] Create account deletion confirmation dialog in ProfileView.tsx (require password input)
- [ ] T085 [US3] Wire delete account button to call POST /api/gdpr/delete endpoint
- [ ] T086 [US3] Implement POST /api/gdpr/delete/{requestId}/cancel endpoint to cancel pending deletion
- [ ] T087 [US3] Display deletion scheduled date and cancellation option in ProfileView.tsx
- [ ] T088 [P] [US3] Implement GET /api/questionnaire endpoint to retrieve historical responses in backend/src/api/questionnaire.py
- [ ] T089 [US3] Display questionnaire response history in ProfileView.tsx (audit trail)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T090 [P] Create PasswordResetForm component in frontend/src/components/auth/PasswordResetForm.tsx
- [ ] T091 [P] Implement password reset request flow (POST /api/auth/forget-password)
- [ ] T092 [P] Implement password reset completion flow (POST /api/auth/reset-password with token)
- [ ] T093 [P] Create password change UI in profile settings calling POST /api/auth/change-password
- [ ] T094 [P] Add input validation for email format and password requirements in all auth forms
- [ ] T095 [P] Add loading states and disabled buttons during API calls in all forms
- [ ] T096 [P] Implement consistent error message display across all forms
- [ ] T097 [P] Add form field validation feedback (email format, password strength indicator)
- [ ] T098 [P] Create shared error handling utility in frontend/src/utils/errorHandler.ts
- [ ] T099 [P] Implement rate limiting on auth endpoints in auth-service (Better Auth config)
- [ ] T100 [P] Add CSRF protection verification in auth-service (trusted origins configuration)
- [ ] T101 [P] Implement background job for GDPR data export processing in backend/src/services/gdpr.py
- [ ] T102 [P] Implement background job for GDPR account deletion (after 30-day wait) in backend/src/services/gdpr.py
- [ ] T103 [P] Add logging for authentication events (signup, signin, password changes) in auth-service
- [ ] T104 [P] Add logging for profile operations (create, update, GDPR requests) in backend
- [ ] T105 [P] Create comprehensive .env.template documentation in README.md
- [ ] T106 [P] Update quickstart.md with final setup instructions and verification steps
- [ ] T107 [P] Add API endpoint documentation (OpenAPI specs) to auth-service and backend
- [ ] T108 [P] Implement session expiration handling in frontend (auto-redirect to login on 401)
- [ ] T109 [P] Add user-friendly error pages (404, 401, 500) in frontend
- [ ] T110 [P] Verify all secrets are in .env and not hardcoded (security audit)
- [ ] T111 [P] Test signup, signin, questionnaire, profile flows end-to-end manually
- [ ] T112 [P] Verify GDPR export generates complete user data JSON
- [ ] T113 [P] Verify GDPR deletion removes all user data after 30 days
- [ ] T114 Run quickstart.md validation (follow setup guide to verify reproducibility)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Assumes User Story 1 data exists for testing but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Assumes User Story 1 data exists for profile updates but is independently testable

### Within Each User Story

- Frontend components can be built in parallel ([P] marked)
- Backend endpoints depend on database models (Foundational phase)
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T010)
- All Foundational tasks marked [P] can run in parallel within their dependency groups
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Frontend components within a story marked [P] can run in parallel
- Backend models and services marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all frontend components for User Story 1 together:
Task: "Create SignupForm React component in frontend/src/components/auth/SignupForm.tsx"
Task: "Create Better Auth React client in frontend/src/services/authClient.ts"
Task: "Create QuestionnaireFlow React component in frontend/src/components/questionnaire/QuestionnaireFlow.tsx"
Task: "Create SoftwareBackground questionnaire section component in frontend/src/components/questionnaire/SoftwareBackground.tsx"
Task: "Create HardwareBackground questionnaire section component in frontend/src/components/questionnaire/HardwareBackground.tsx"
Task: "Create AIMLBackground questionnaire section component in frontend/src/components/questionnaire/AIMLBackground.tsx"
Task: "Create LearningGoals questionnaire section component in frontend/src/components/questionnaire/LearningGoals.tsx"
Task: "Create FastAPI client for backend API in frontend/src/services/api.ts"

# Launch all backend services for User Story 1 together:
Task: "Create Pydantic schema for questionnaire submission in backend/src/api/questionnaire.py"
Task: "Create skill level calculator service in backend/src/services/skill_calculator.py"
Task: "Create profile service in backend/src/services/profile.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T032) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T033-T054)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Create account → Complete questionnaire → Verify profile created with skill level
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Users can now: signup, complete questionnaire, see skill level
3. Add User Story 2 → Test independently → Deploy/Demo
   - Users can now: signup, signin, access personalized dashboard
4. Add User Story 3 → Test independently → Deploy/Demo
   - Users can now: manage profile, export data, delete account
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Signup + Questionnaire)
   - Developer B: User Story 2 (Signin)
   - Developer C: User Story 3 (Profile Management)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Total Tasks**: 114
- **Setup (Phase 1)**: 10 tasks
- **Foundational (Phase 2)**: 22 tasks (BLOCKING)
- **User Story 1 (Phase 3)**: 22 tasks (MVP)
- **User Story 2 (Phase 4)**: 10 tasks
- **User Story 3 (Phase 5)**: 25 tasks
- **Polish (Phase 6)**: 25 tasks

---

## Parallel Opportunities Identified

- **Setup Phase**: 9 parallelizable tasks (T002-T010)
- **Foundational Phase**: 15 parallelizable tasks (within dependency groups)
- **User Story 1**: 12 parallelizable tasks (frontend components, backend services)
- **User Story 2**: 3 parallelizable tasks
- **User Story 3**: 7 parallelizable tasks
- **Polish Phase**: 24 parallelizable tasks (all cross-cutting improvements)

**Total Parallelizable**: 70 out of 114 tasks (61% can run in parallel with proper coordination)

---

## Independent Test Criteria

### User Story 1 (P1) - MVP
**Test**: Create new account → Complete questionnaire → Verify profile with skill level
- ✅ User can enter email/password and create account
- ✅ Session cookie is set after signup
- ✅ User is redirected to questionnaire
- ✅ Questionnaire collects software, hardware, AI/ML, and learning goals data
- ✅ Profile is created with calculated skill level (beginner/intermediate/advanced)
- ✅ User is redirected to personalized dashboard showing their skill level

### User Story 2 (P2)
**Test**: Sign in with existing credentials → Access dashboard
- ✅ User can enter email/password and sign in
- ✅ Session cookie is set after signin
- ✅ User is redirected to personalized dashboard
- ✅ Session persists across browser close/reopen
- ✅ Invalid credentials show error message

### User Story 3 (P3)
**Test**: Sign in → Navigate to profile → Update background → Export data → Delete account
- ✅ User can view all previously submitted questionnaire responses
- ✅ User can update background information and save changes
- ✅ Skill level is recalculated after background updates
- ✅ User can request data export and receive downloadable JSON
- ✅ User can request account deletion with 30-day waiting period
- ✅ User can cancel pending deletion request

---

## Suggested MVP Scope

**Minimum Viable Product**: User Story 1 Only (Phase 1 + Phase 2 + Phase 3)

This delivers:
- ✅ User signup with email/password
- ✅ Background questionnaire (software, hardware, AI/ML, learning goals)
- ✅ Skill level assignment (beginner/intermediate/advanced)
- ✅ User profile creation
- ✅ Personalized dashboard showing skill level

**Total Tasks for MVP**: 54 tasks (Setup: 10, Foundational: 22, User Story 1: 22)

**Post-MVP Enhancements**:
- Add User Story 2 (signin for returning users): +10 tasks
- Add User Story 3 (profile management, GDPR): +25 tasks
- Add Polish (password reset, error handling, production readiness): +25 tasks
