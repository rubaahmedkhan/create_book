# Implementation Plan: User Authentication with Personalization

**Branch**: `001-user-auth` | **Date**: 2025-12-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-user-auth/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement user authentication system using Better Auth framework for email/password-based signup and signin, with integrated background questionnaire to collect user technical experience (software, hardware, AI/ML skills) and learning goals. The system assigns skill levels (beginner/intermediate/advanced) based on questionnaire responses to enable content personalization. Architecture uses a hybrid approach: Better Auth TypeScript service for authentication + FastAPI backend for business logic, both sharing Neon Serverless Postgres database.

## Technical Context

**Language/Version**: TypeScript 5.x (Better Auth service), Python 3.11+ (FastAPI backend), JavaScript/TypeScript (Frontend)
**Primary Dependencies**: Better Auth 1.x, FastAPI 0.100+, Neon Serverless Postgres, React/Next.js (frontend TBD)
**Storage**: Neon Serverless Postgres with Better Auth schema (user, session, account, verification tables) + custom profile tables
**Testing**: Vitest (TypeScript/Better Auth), pytest (FastAPI), React Testing Library (frontend)
**Target Platform**: Web application - Linux server (Docker/Railway/Vercel), browser clients (modern browsers with cookie support)
**Project Type**: Web application (hybrid architecture: auth-service + backend + frontend)
**Performance Goals**: <200ms authentication response time, support 1000 concurrent authentication requests, <15s signin completion, <5min signup + questionnaire completion
**Constraints**: 30-day session persistence, GDPR compliance (data export/deletion within 30 days), secure credential storage (Scrypt/Argon2 hashing), CSRF protection required
**Scale/Scope**: Initial 10K users, expandable to 100K+; 3 user stories (signup, signin, profile management); 24 functional requirements; 4 core entities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle VIII: Security and Secrets Management ✅ PASS
- All authentication credentials (database URLs, Better Auth secrets, session keys) stored in .env files
- No hardcoded API keys or connection strings in code
- .env.template provided with placeholders
- Environment variable loading via dotenv (TypeScript) and python-dotenv (FastAPI)
- Password hashing via Better Auth built-in Scrypt/Argon2 (no plaintext storage)

### Principle IX: Interactive Learning with RAG Integration ✅ PASS (Future Integration)
- Authentication system provides foundation for future RAG chatbot personalization
- User profile data (skill level, background) will be consumed by RAG system for context-aware responses
- Session management enables authenticated chatbot interactions
- Current feature: authentication only; RAG integration is separate future feature (out of scope)

### Principle XI: User Authentication and Personalized Learning ✅ PASS
- **CRITICAL**: This feature directly implements Constitution Principle XI
- Better Auth framework as specified in principle requirements
- Background questionnaire collecting: software background, hardware experience, AI/ML familiarity, learning goals
- Skill level assignment (beginner/intermediate/advanced) based on responses
- User profile data stored in Neon Serverless Postgres as specified
- GDPR compliance: user consent, data export, 30-day deletion
- Privacy-first: httpOnly cookies, CSRF protection, secure session management
- Session persistence: 30-day expiration as required

### Additional Constitution Principles
- **Principle VII: Reproducibility and Version Control** ✅ PASS
  - All code version-controlled in GitHub
  - Better Auth configuration, FastAPI endpoints, and frontend components in repository
  - .env.template for reproducible setup
  - Documentation in quickstart.md for developers

**GATE STATUS**: ✅ ALL CHECKS PASSED - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Hybrid Web Application Architecture

auth-service/                    # Better Auth TypeScript service
├── src/
│   ├── auth.ts                 # Better Auth configuration
│   ├── index.ts                # Hono/Express server entry
│   ├── lib/
│   │   ├── db.ts              # Neon Postgres client
│   │   └── utils.ts           # Helper functions
│   └── types/
│       └── user.ts            # User/session TypeScript types
├── tests/
│   ├── auth.test.ts           # Better Auth integration tests
│   └── session.test.ts        # Session management tests
├── package.json
├── tsconfig.json
└── .env.template              # AUTH_SECRET, DATABASE_URL, etc.

backend/                        # FastAPI business logic
├── src/
│   ├── main.py                # FastAPI app entry
│   ├── api/
│   │   ├── profile.py         # Profile management endpoints
│   │   ├── questionnaire.py   # Background questionnaire endpoints
│   │   └── middleware/
│   │       └── auth.py        # Session validation middleware
│   ├── models/
│   │   ├── user_profile.py    # SQLAlchemy user profile model
│   │   └── questionnaire.py   # SQLAlchemy questionnaire response model
│   ├── services/
│   │   ├── profile.py         # Profile business logic
│   │   ├── skill_calculator.py # Skill level assignment logic
│   │   └── gdpr.py            # Data export/deletion logic
│   └── db/
│       ├── database.py        # Database session management
│       └── migrations/        # Alembic migrations
├── tests/
│   ├── test_profile.py        # Profile API tests
│   ├── test_questionnaire.py  # Questionnaire tests
│   └── test_auth_middleware.py # Auth middleware tests
├── requirements.txt
├── pyproject.toml
└── .env.template              # DATABASE_URL, etc.

frontend/                       # React/Next.js UI (structure TBD based on framework choice)
├── src/
│   ├── app/ or pages/         # Next.js routing
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx
│   │   │   ├── SigninForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   ├── questionnaire/
│   │   │   ├── QuestionnaireFlow.tsx
│   │   │   ├── SoftwareBackground.tsx
│   │   │   ├── HardwareBackground.tsx
│   │   │   ├── AIMLBackground.tsx
│   │   │   └── LearningGoals.tsx
│   │   └── profile/
│   │       ├── ProfileView.tsx
│   │       ├── ProfileEdit.tsx
│   │       └── DataExport.tsx
│   ├── services/
│   │   ├── authClient.ts      # Better Auth React client
│   │   └── api.ts             # FastAPI client (profile, questionnaire)
│   └── types/
│       └── user.ts            # Shared TypeScript types
├── tests/
│   └── components/
│       ├── SignupForm.test.tsx
│       └── QuestionnaireFlow.test.tsx
├── package.json
├── tsconfig.json
└── .env.template              # NEXT_PUBLIC_AUTH_URL, NEXT_PUBLIC_API_URL

shared/                         # Shared configuration and types
├── database/
│   └── schema.sql             # Complete database schema (Better Auth + custom tables)
├── types/
│   └── user.ts                # Shared TypeScript types across services
└── docs/
    └── architecture.md        # Hybrid architecture documentation
```

**Structure Decision**:

This feature uses **Option 2: Web application** with a **hybrid architecture**:

1. **auth-service/** (TypeScript): Dedicated Better Auth service handling authentication, session management, and password operations. Exposes REST API endpoints for signup, signin, signout, password reset.

2. **backend/** (FastAPI/Python): Business logic service handling user profiles, questionnaire responses, skill level calculations, and GDPR operations (data export/deletion). Validates sessions by querying the shared database.

3. **frontend/** (React/TypeScript): User interface for signup, signin, background questionnaire, and profile management. Communicates with both auth-service (for authentication) and backend (for profile data).

4. **shared/** (Configuration): Database schema definitions and shared TypeScript types to ensure consistency across services.

All three services connect to the same **Neon Serverless Postgres** database but with clear separation of concerns:
- Better Auth owns: `user`, `session`, `account`, `verification` tables
- FastAPI owns: `user_profile`, `questionnaire_response`, `gdpr_request` tables
- Shared reference: `user.id` foreign key links profile data to auth data

## Complexity Tracking

**No Constitution Violations**: All checks passed. This section documents architectural decisions that add necessary complexity.

| Decision | Rationale | Simpler Alternative Rejected Because |
|----------|-----------|--------------------------------------|
| Hybrid architecture (3 services) | Better Auth is TypeScript-only; cannot run natively in FastAPI/Python | Monolithic FastAPI with custom auth would require reimplementing session management, CSRF protection, password hashing, and 2FA from scratch—reinventing the wheel and introducing security risks |
| Separate auth-service + backend | Clean separation of concerns: auth domain vs. business logic domain | Embedding Better Auth in frontend-only would expose session secrets to client; using third-party auth SaaS (Auth0, Clerk) violates Constitution Principle XI requirement for database ownership |
| Neon Serverless Postgres | Constitution Principle XI specifies Neon; serverless scales automatically for variable auth load | Self-hosted Postgres would require DevOps overhead for connection pooling, scaling, and high availability |
| Custom questionnaire tables vs. Better Auth user fields | Better Auth `additionalFields` has limited types; questionnaire needs rich structured data (arrays, nested objects) | Storing complex questionnaire JSON in Better Auth user table would make querying/analytics difficult and violate normalization |
