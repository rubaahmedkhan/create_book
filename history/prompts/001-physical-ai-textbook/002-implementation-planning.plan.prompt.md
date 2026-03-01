---
id: 002
title: Implementation Planning
stage: plan
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-physical-ai-textbook
branch: 001-physical-ai-textbook
user: rubaahmedkhan
command: /sp.plan
labels: ["planning", "architecture", "docusaurus", "multi-instance", "multi-repo", "ros2", "wcag", "git-lfs"]
links:
  spec: specs/001-physical-ai-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-physical-ai-textbook/plan.md
tests:
  - Constitution check (all 7 principles PASS)
  - Technical context completeness validation
  - Research phase completion verification
---

## Prompt

$ARGUMENTS

(Empty - no additional arguments provided)

## Response snapshot

Created comprehensive implementation plan for Physical AI & Humanoid Robotics Textbook with detailed technical architecture, research findings, and 5 ADRs.

**Technical Approach**: Multi-instance Docusaurus architecture (5 sites: main + 4 modules), multi-repository strategy (4 separate repos), Git LFS for large URDF assets, Algolia DocSearch with Ask AI, WCAG 2.1 AA compliance.

**Phase 0 Research Completed** (15,000+ word report via research agent):
1. **Docusaurus v3**: Multi-instance setup, plugin recommendations (Algolia Ask AI, @saucelabs/theme-github-codeblock, docusaurus-prince-pdf), performance optimization, GitHub Actions deployment
2. **ROS 2 Integration**: Code embedding from GitHub, Prism.js syntax highlighting, tabbed simulation content (Gazebo/Unity/Isaac Sim), asset management strategies
3. **Educational Structure**: Scaffold-fade progression (beginner → intermediate → advanced), code playgrounds (JupyterLite, The Construct), WCAG 2.1 AA automated testing (pa11y-ci, axe-core)
4. **Repository Architecture**: Multi-repo vs monorepo analysis, Git LFS strategies, semantic versioning, synchronized releases

**Constitution Check**: ✅ ALL 7 PRINCIPLES PASS
- Principle I (Educational Excellence): Multi-instance enables module independence, scaffold-fade labs, simulation-first
- Principle II (Simulation-First): "Try It First" sections, tabbed Gazebo/Unity/Isaac, runnable code from GitHub
- Principle III (Hardware-Aware): Requirements tables, RTX/cloud/Jetson paths, cost estimates, optimization tips
- Principle IV (Industry-Standard): Version compatibility matrix, ROS 2 Humble/Iron, Isaac Sim versions, API references
- Principle V (Multimodal Integration): Module 4 VLA, integration points, capstone rubric (4 components)
- Principle VI (Accessibility): Prerequisites explicit, plain-English math, PEP 8 + docstrings, WCAG 2.1 AA, glossary linking
- Principle VII (Reproducibility): Separate repos, semantic versioning, Git LFS, CI/CD testing, README docs

**Architecture Decisions**:
- **ADR-001**: Multi-instance Docusaurus (5 sites vs monolithic) for build performance, team collaboration, progressive loading
- **ADR-002**: Multi-repository (4 repos vs monorepo) for access control, build efficiency, independent versioning
- **ADR-003**: Git LFS ≤500MB + GitHub Releases 500MB-2GB + CDN >2GB for student bandwidth tiers
- **ADR-004**: Algolia DocSearch with Ask AI (production) + local search (development) for conversational queries
- **ADR-005**: WCAG 2.1 AA compliance with pa11y-ci + axe-core automated testing (legal deadline: April 24, 2026)

**Project Structure**:
- **Repository 1** (this repo): `physical-ai-textbook` - Docusaurus source (main-site, module1-ros2, module2-simulation, module3-isaac, module4-vla, shared/)
- **Repository 2**: `physical-ai-examples` - Student code (module1-4 ROS 2 packages, launch files, tests)
- **Repository 3**: `physical-ai-assets` - URDF models, meshes, simulation worlds (Git LFS)
- **Repository 4**: `physical-ai-student-template` - Starter kit (setup scripts, workspace, Docker)

**Technical Stack**:
- Languages: JavaScript (Node 20), Python 3.11, Markdown/MDX
- Framework: Docusaurus v3.9+ (React 18)
- Plugins: @saucelabs/theme-github-codeblock, Algolia DocSearch v4, @docusaurus/plugin-ideal-image, docusaurus-prince-pdf
- CI/CD: GitHub Actions (5 deployment workflows, accessibility tests, link validation)
- Storage: Git + Git LFS + GitHub Releases
- Testing: pa11y-ci, axe-core (WCAG), link validation, code execution (Ubuntu 22.04 + ROS 2)

**Scale**: 40 chapters, 100 code examples, 200 diagrams, 20 URDF models, 10 simulation worlds, 10,000+ students (5-year target)

## Outcome

- ✅ Impact: Comprehensive implementation plan created with multi-instance architecture, multi-repo strategy, 5 ADRs, complete technical context, and constitution compliance validation
- 🧪 Tests: Constitution check (7/7 principles PASS), technical context completeness, research phase validation
- 📁 Files: specs/001-physical-ai-textbook/plan.md (568 lines with architecture decisions and development workflow)
- 🔁 Next prompts: Create data-model.md, contracts/, quickstart.md (manual), then /sp.tasks to generate actionable implementation tasks
- 🧠 Reflection: Multi-instance Docusaurus + multi-repo strategy optimizes for educational use case (student access control, independent module builds, tiered asset downloads); research agent provided production-grade recommendations with 2025-current best practices; all constitution principles validated with specific implementation mappings

## Evaluation notes (flywheel)

- Failure modes observed: None - setup-plan.ps1 script executed successfully, research agent completed comprehensive analysis
- Graders run and results (PASS/FAIL): PASS - Constitution check (7/7 principles), technical context complete (no NEEDS CLARIFICATION markers), Phase 0 research comprehensive (15K+ words with sources)
- Prompt variant (if applicable): N/A - Initial planning
- Next experiment (smallest change to try): Execute Phase 1 artifact generation (data-model.md, contracts/, quickstart.md) manually or via separate command, then proceed to /sp.tasks for dependency-ordered implementation tasks
