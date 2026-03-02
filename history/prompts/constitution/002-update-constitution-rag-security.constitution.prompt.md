---
id: 002
title: Update Constitution with RAG and Security Best Practices
stage: constitution
date: 2025-12-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-physical-ai-textbook
user: user
command: /sp.constitution read Rag.md file and update constitution file with best practice
labels: ["constitution", "security", "rag-integration", "best-practices"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - Manual validation of constitution structure
  - Verification of sync impact report completeness
---

## Prompt

/sp.constitution read Rag.md file and update constitution file with best practice

## Response snapshot

Successfully updated the Physical AI & Humanoid Robotics Textbook Constitution (version 1.0.0 → 1.1.0) with two new core principles extracted from Rag.md:

**Principle VIII: Security and Secrets Management**
- Mandates that all API keys, database credentials, and service URLs must be stored in .env files
- Prohibits hardcoded credentials in code examples
- Provides concrete examples showing incorrect vs. correct approaches
- Ensures students learn production-ready security practices from the start

**Principle IX: Interactive Learning with RAG Integration**
- Establishes requirements for embedding a RAG chatbot in the published textbook
- Specifies technology stack: OpenAI Agents/ChatKit SDKs, FastAPI, Neon Serverless Postgres, Qdrant Cloud
- Ensures chatbot answers strictly from book content to prevent hallucinations
- Supports both general questions and context-specific queries based on text selection
- Cross-references Principle VIII for securing chatbot credentials

The update includes:
- Comprehensive sync impact report identifying affected templates
- Follow-up TODOs for auditing existing code and implementing RAG architecture
- Version increment from 1.0.0 to 1.1.0 (minor version bump)
- Updated amendment date to 2025-12-29

## Outcome

- ✅ Impact: Added 2 new core principles to the constitution that establish security standards and interactive learning requirements across the entire textbook project
- 🧪 Tests: Manual validation passed - all placeholders filled, structure maintained, sync report complete
- 📁 Files: Modified .specify/memory/constitution.md (added ~52 lines, updated version metadata)
- 🔁 Next prompts:
  1. Audit existing Module 1 and Module 2 code for hardcoded credentials
  2. Create .env.template files for modules using external services
  3. Plan RAG chatbot architecture specification
- 🧠 Reflection: The Rag.md file contained critical production requirements (security, RAG integration) that needed to be elevated to constitutional principles. This ensures all future development adheres to these standards. The security principle is especially important as students will use these examples as templates for real deployments.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update completed successfully
- Graders run and results (PASS/FAIL): PASS - sync impact report complete, version incremented correctly, all placeholders resolved
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Implement automated linter to detect hardcoded credentials in code examples during CI/CD
