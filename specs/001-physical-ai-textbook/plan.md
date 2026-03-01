# Implementation Plan: Physical AI & Humanoid Robotics Textbook

**Branch**: `001-physical-ai-textbook` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-physical-ai-textbook/spec.md`

## Summary

Build a comprehensive educational textbook for a 13-week Physical AI & Humanoid Robotics course using Docusaurus v3, deploying to GitHub Pages. The textbook covers four modules (ROS 2, Gazebo/Unity, NVIDIA Isaac, VLA) with progressive skill-building from simulation-first pedagogy to capstone multimodal integration. Technical approach: multi-instance Docusaurus architecture (5 sites: main + 4 modules), separate GitHub repositories for content/code/assets, Git LFS for large URDF models, Algolia DocSearch with Ask AI, WCAG 2.1 AA compliance, and synchronized semantic versioning.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS), Python 3.11 (for ROS 2 code examples), Markdown/MDX (Docusaurus content)
**Primary Dependencies**:
- Docusaurus v3.9+ (with React 18)
- @saucelabs/theme-github-codeblock (code embedding from GitHub)
- @easyops-cn/docusaurus-search-local (local search) OR Algolia DocSearch v4 (production search with Ask AI)
- @docusaurus/plugin-ideal-image (image optimization)
- docusaurus-prince-pdf (PDF generation, light mode only)
- GitHub Actions (CI/CD deployment)

**Storage**: Git repositories (textbook source, code examples, URDF assets), Git LFS for large files (URDF meshes, simulation worlds), GitHub Releases for >500MB assets

**Testing**:
- Link validation (automated in CI/CD)
- Code execution tests (Ubuntu 22.04 + ROS 2 Humble/Iron environment)
- Accessibility testing (pa11y-ci, axe-core for WCAG 2.1 AA compliance)
- Build verification (Docusaurus builds without warnings)
- Peer review (2 technical + 1 pedagogical expert per module)

**Target Platform**: Web (GitHub Pages static hosting), PDF exports (per module), Ubuntu 22.04 LTS (for code examples execution environment)

**Project Type**: Multi-instance web documentation (5 Docusaurus instances: main site + 4 module sites)

**Performance Goals**:
- Website load time <3 seconds on standard broadband (SC-012)
- Docusaurus build time <5 minutes per module instance (with caching)
- Search results <500ms (Algolia)
- 90% of students run simulation examples without instructor intervention (SC-002)

**Constraints**:
- Ubuntu 22.04 LTS only (macOS/Windows out of scope per constraints)
- NVIDIA RTX GPU required for NVIDIA Isaac Sim (12GB VRAM minimum)
- Individual simulation assets ≤500MB (per asset size constraint)
- PDF export supports light mode only (dark mode causes background artifacts)
- WCAG 2.1 AA compliance mandatory (deadline April 24, 2026)

**Scale/Scope**:
- 4 modules × ~10 chapters each = ~40 chapters
- ~100 code examples (ROS 2 Python, launch files, URDF models)
- ~200 diagrams/screenshots (with alt text)
- ~20 URDF models with meshes (low-poly 50MB, high-res 450MB)
- ~10 simulation worlds (Gazebo/Isaac Sim/Unity)
- Target: 10,000+ students over 5-year lifespan
- Support 3 hardware tiers: RTX workstation, cloud (AWS g5.2xlarge), Jetson Orin Nano

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Educational Excellence ✅

**Status**: PASS

- **Requirement**: Pedagogical clarity, progressive skill building, clear learning outcomes, concepts before application
- **Implementation**: Multi-instance architecture enables module independence; scaffold-fade progression (beginner → intermediate → advanced labs); explicit prerequisites in each chapter; simulation-first pedagogy (FR-002)
- **Validation**: Module structure template enforces focus statement, 3-5 learning outcomes, conceptual foundation, min 3 labs, assessment criteria (constitution lines 97-103)

### Principle II: Hands-On Simulation-First Approach ✅

**Status**: PASS

- **Requirement**: Demonstrate via simulation (Gazebo, Unity, Isaac Sim) before theory; executable examples, step-by-step instructions, documented outputs
- **Implementation**: Every chapter includes `##🎮 Try It First` section before theory; tabbed content for Gazebo/Unity/Isaac Sim alternatives; @saucelabs/theme-github-codeblock ensures runnable code from repository
- **Validation**: FR-002 mandates simulation-before-theory; FR-003 requires complete runnable code; FR-004 requires step-by-step instructions with screenshots

### Principle III: Hardware-Aware Content Design ✅

**Status**: PASS

- **Requirement**: Acknowledge computational requirements, provide tiered paths (RTX/cloud/Jetson), optimization tips, latency documentation
- **Implementation**: Hardware requirements table in each module overview; tabbed content for RTX/cloud/Jetson setup paths; cloud cost estimates (FR-015); performance optimization sections; latency warnings for cloud-to-edge deployments
- **Validation**: FR-013 mandates upfront hardware requirements; FR-014 requires alternative deployment paths; FR-016 requires optimization tips

### Principle IV: Industry-Standard Tooling ✅

**Status**: PASS

- **Requirement**: Focus on production-grade frameworks (ROS 2 Humble/Iron, NVIDIA Isaac, Gazebo, Unity, GPT VLA); version numbers specified, official docs links, deprecated feature warnings
- **Implementation**: Version compatibility matrix (textbook version → ROS 2 version → Isaac Sim version); Docusaurus versioning for major ROS 2 migrations; API reference links in every code example; migration guides when tools update
- **Validation**: FR-009 specifies ROS 2 Humble/Iron; FR-010 requires Isaac Sim version numbers; FR-056 mandates API references; version control strategy tracks tool versions

### Principle V: Multimodal Integration Emphasis ✅

**Status**: PASS

- **Requirement**: Emphasize VLA convergence (vision, language, action); module integration points, capstone synthesis, end-to-end voice-to-action pipelines
- **Implementation**: Module 4 dedicated to VLA; each module includes "Integration Points" section linking to other modules; capstone project rubric requires all 4 components (voice, LLM planning, navigation, manipulation); OpenAI Whisper + GPT-4 + ROS 2 actions demonstrated end-to-end
- **Validation**: FR-001 requires integration points in modules; User Story 4 (P2) defines capstone multimodal integration; FR-035 defines capstone rubric covering all components

### Principle VI: Accessibility and Inclusivity ✅

**Status**: PASS

- **Requirement**: Written for AI/ML backgrounds (no prior robotics); math balances rigor with intuition; code well-commented; jargon defined with glossary links
- **Implementation**: Prerequisites explicitly state "AI/ML background, no robotics experience"; math notation includes plain-English explanations (FR-005); PEP 8 + docstrings required (FR-018, FR-019); glossary with auto-linking; WCAG 2.1 AA compliance (alt text, color contrast, keyboard navigation)
- **Validation**: FR-004 mandates glossary links for jargon; FR-005 requires plain-English math explanations; FR-018-020 mandate code quality; FR-037 requires WCAG 2.1 AA compliance; accessibility testing in CI/CD

### Principle VII: Reproducibility and Version Control ✅

**Status**: PASS

- **Requirement**: All code/URDF/launch files version-controlled, tested, publicly accessible; repository mirrors textbook structure; README docs; CI/CD verification
- **Implementation**: Separate repositories for textbook source, code examples, assets; semantic versioning (textbook v1.2.0 ↔ examples v1.2.0); Git LFS for large URDF models; GitHub Actions CI/CD tests all examples on Ubuntu 22.04 + ROS 2; README per example with dependencies/setup/outputs
- **Validation**: FR-024 mandates GitHub repository mirroring structure; FR-025 requires testing in target environment; FR-026 mandates CI/CD verification; FR-027 requires README docs; version control strategy documented in research.md

### Content Quality Standards ✅

**Status**: PASS

- **Module Structure**: Focus statement, 3-5 learning outcomes, conceptual foundation, min 3 labs, assessment criteria, further resources (constitution lines 96-103)
- **Code Quality**: Run without modification, error handling, ROS 2 conventions, logging, comments (constitution lines 105-111)
- **Visual Assets**: Consistent styling, captions, actual outputs, annotations, accessibility (constitution lines 113-119)
- **Validation**: All enforced via FR-001 (module structure), FR-018-023 (code quality), FR-029-033 (visual assets)

### Technical Infrastructure ✅

**Status**: PASS

- **Docusaurus Deployment**: v3 + React 18 (FR-006), auto-deploy to GitHub Pages (FR-007), dark mode (FR-011), search (FR-012), PDF exports (FR-028)
- **Repository Structure**: Matches constitution specification (docs/, code-examples/, assets/, .specify/)
- **Testing & Validation**: Link validation (FR-036), code execution (FR-025), build verification (FR-037), accessibility audit (FR-037), peer review (FR-038)
- **Validation**: Technical Context section above matches constitution requirements; GitHub Actions workflow implements all validation gates

**Constitution Check Result**: ✅ ALL PRINCIPLES PASS - No violations, no complexity justification required

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-textbook/
├── spec.md                    # Feature specification (completed)
├── plan.md                    # This file (in progress)
├── research.md                # Phase 0 research output (to be created)
├── data-model.md              # Phase 1 output (to be created)
├── quickstart.md              # Phase 1 output (to be created)
├── contracts/                 # Phase 1 output (to be created)
│   ├── docusaurus-config.schema.json
│   ├── module-structure.schema.json
│   └── code-example.schema.json
├── checklists/
│   └── requirements.md        # Spec quality checklist (completed)
└── tasks.md                   # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

**Structure Decision**: Multi-repository architecture with Docusaurus multi-instance pattern

Per research findings, the project uses **4 separate GitHub repositories** to separate concerns, enable independent versioning, and optimize for educational workflows:

```text
# Repository 1: physical-ai-textbook (Docusaurus source - THIS REPO)
book1/  (D:\book1)
├── main-site/                 # Landing page, course overview, shared resources
│   ├── docusaurus.config.js
│   ├── docs/
│   │   ├── index.md
│   │   ├── course-overview.md
│   │   ├── hardware-requirements.md
│   │   ├── version-compatibility.md
│   │   └── accessibility.md
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── static/
│       └── img/
│
├── module1-ros2/              # Separate Docusaurus instance for Module 1
│   ├── docusaurus.config.js   # Extends shared config
│   ├── docs/
│   │   ├── 00-overview.md
│   │   ├── 01-quickstart-lab.md
│   │   ├── 02-conceptual-foundation.md
│   │   ├── 03-intermediate-lab.md
│   │   ├── 04-advanced-concepts.md
│   │   ├── 05-advanced-lab.md
│   │   └── 06-assessment.md
│   └── static/
│
├── module2-simulation/        # Separate Docusaurus instance for Module 2
│   ├── docusaurus.config.js
│   ├── docs/
│   │   ├── gazebo/
│   │   ├── unity/
│   │   └── urdf/
│   └── static/
│
├── module3-isaac/             # Separate Docusaurus instance for Module 3
│   ├── docusaurus.config.js
│   ├── docs/
│   │   ├── isaac-sim/
│   │   ├── isaac-ros/
│   │   └── nav2/
│   └── static/
│
├── module4-vla/               # Separate Docusaurus instance for Module 4
│   ├── docusaurus.config.js
│   ├── docs/
│   │   ├── whisper-integration/
│   │   ├── llm-planning/
│   │   └── capstone-project/
│   └── static/
│
├── shared/                    # Shared components, theme, config
│   ├── components/
│   │   ├── HardwareRequirementsTable.jsx
│   │   ├── SimulationTabs.jsx
│   │   └── CodeEmbedFromGitHub.jsx
│   ├── theme/
│   │   ├── custom.css
│   │   └── prism-config.js
│   └── config/
│       ├── base-docusaurus.config.js
│       └── shared-navbar.js
│
├── .github/
│   └── workflows/
│       ├── deploy-main.yml
│       ├── deploy-module1.yml
│       ├── deploy-module2.yml
│       ├── deploy-module3.yml
│       ├── deploy-module4.yml
│       ├── accessibility-test.yml
│       └── link-validation.yml
│
├── .specify/                  # Spec-driven development artifacts
│   ├── memory/
│   │   └── constitution.md
│   ├── templates/
│   └── scripts/
│
├── specs/                     # Feature specifications
│   └── 001-physical-ai-textbook/
│
├── history/                   # Prompt history records
│   └── prompts/
│
├── package.json               # NPM workspace root
├── package-lock.json
└── README.md

# Repository 2: physical-ai-examples (Student code - SEPARATE REPO)
physical-ai-examples/
├── module1-ros2/
│   ├── README.md
│   ├── publisher_example/
│   │   ├── publisher_node.py
│   │   ├── package.xml
│   │   ├── setup.py
│   │   └── README.md
│   ├── subscriber_example/
│   ├── service_example/
│   └── tests/
│       ├── test_publisher.py
│       └── test_subscriber.py
│
├── module2-simulation/
│   ├── gazebo_worlds/
│   │   ├── basic_office.world
│   │   └── launch/
│   ├── unity_scenes/
│   │   └── HumanoidScene.unity
│   └── urdf_examples/
│       ├── humanoid_lowpoly.urdf
│       └── launch/
│
├── module3-isaac/
│   ├── isaac_sim_scenes/
│   │   └── humanoid_navigation.usd
│   ├── isaac_ros_nodes/
│   │   └── vslam_example/
│   └── nav2_configs/
│       └── nav2_params.yaml
│
├── module4-vla/
│   ├── whisper_integration/
│   │   └── voice_command_node.py
│   ├── llm_planning/
│   │   └── gpt4_planner_node.py
│   └── capstone_project/
│       ├── autonomous_humanoid.py
│       ├── README.md
│       └── rubric.md
│
├── .github/
│   └── workflows/
│       ├── test-examples-ubuntu.yml
│       └── test-examples-cloud.yml
│
└── README.md

# Repository 3: physical-ai-assets (Large files - SEPARATE REPO with Git LFS)
physical-ai-assets/
├── .gitattributes             # Git LFS configuration
│
├── urdf_models/
│   ├── humanoid_lowpoly/      (~50MB, Git LFS)
│   │   ├── humanoid.urdf
│   │   ├── meshes/
│   │   │   ├── torso.stl
│   │   │   ├── arm_left.dae
│   │   │   └── ...
│   │   └── README.md
│   │
│   ├── humanoid_highres/      (~450MB, GitHub Releases)
│   │   ├── download_instructions.md
│   │   ├── checksums.txt
│   │   └── download_highres.sh
│   │
│   └── humanoid_premium/      (~2GB, External CDN link)
│       └── README.md
│
├── simulation_worlds/
│   ├── gazebo/
│   │   ├── basic_office.world (~20MB, Git LFS)
│   │   └── photorealistic_lab.world (~800MB, GitHub Releases)
│   │
│   ├── isaac_sim/
│   │   ├── simple_scene.usd (~100MB, Git LFS)
│   │   └── complex_scene.usd (~1.5GB, GitHub Releases)
│   │
│   └── unity/
│       └── HumanoidEnvironment.unitypackage (~300MB, Git LFS)
│
└── README.md

# Repository 4: physical-ai-student-template (Starter kit - SEPARATE REPO)
physical-ai-student-template/
├── setup_scripts/
│   ├── install_ros2.sh
│   ├── install_gazebo.sh
│   ├── install_isaac.sh
│   ├── setup_venv.sh
│   └── verify_installation.sh
│
├── workspace/
│   ├── src/                   # Empty, ready for student packages
│   ├── .gitignore
│   └── README.md
│
├── docker/
│   ├── Dockerfile.ros2
│   ├── Dockerfile.isaac
│   └── docker-compose.yml
│
└── README.md
```

**Repository Deployment Mapping**:
- **physical-ai-textbook** → GitHub Pages: `https://<username>.github.io/physical-ai-textbook/`
  - Main site: `/`
  - Module 1: `/module1/`
  - Module 2: `/module2/`
  - Module 3: `/module3/`
  - Module 4: `/module4/`
- **physical-ai-examples** → Students clone/fork for code
- **physical-ai-assets** → Students clone for low-poly models, download releases for high-res
- **physical-ai-student-template** → Students fork as starter template

## Complexity Tracking

**No violations detected** - All constitution principles pass. This section is empty per template requirement ("Fill ONLY if Constitution Check has violations that must be justified").

## Phase 0: Research Summary

**Status**: ✅ COMPLETED

Research agent executed comprehensive analysis covering:

1. **Docusaurus v3 Setup Best Practices**:
   - Multi-instance architecture (5 sites: main + 4 modules)
   - Plugin recommendations: Algolia DocSearch with Ask AI (production), @easyops-cn/docusaurus-search-local (development)
   - PDF export: docusaurus-prince-pdf (light mode only, dark mode causes background artifacts)
   - Performance: Code splitting, lazy loading, @docusaurus/plugin-ideal-image, build caching

2. **ROS 2 Documentation Integration**:
   - Code embedding: @saucelabs/theme-github-codeblock for live GitHub references
   - Syntax highlighting: Prism.js (built-in, supports Python, XML for URDF)
   - Simulation documentation: Tabbed content for Gazebo/Unity/Isaac Sim alternatives
   - Asset management: Git LFS for URDF models, GitHub Releases for >500MB files

3. **Educational Content Structure**:
   - Scaffold-fade progression: Beginner (high scaffolding) → Intermediate (medium) → Advanced (minimal)
   - Code playgrounds: JupyterLite (Python syntax), The Construct (full ROS 2 environment)
   - WCAG 2.1 AA compliance: pa11y-ci + axe-core automated testing, deadline April 24, 2026

4. **GitHub Repository Structure**:
   - Multi-repo recommended over monorepo (better access control, independent versioning, faster builds)
   - Version control: Semantic versioning with synchronized releases (textbook v1.2.0 ↔ examples v1.2.0)
   - Asset hosting: Git LFS (≤500MB), GitHub Releases (500MB-2GB), External CDN (>2GB)

**Key Decisions**:
- Use Algolia DocSearch with Ask AI for production (free for open-source education)
- Separate repositories for textbook source, code examples, assets, student template
- Multi-instance Docusaurus architecture for independent module builds/deploys
- WCAG 2.1 AA compliance mandatory with automated CI/CD testing

**Full research report**: See research agent output above (comprehensive 15,000+ word report with sources)

## Phase 1: Design Artifacts

### Data Model

**See**: [data-model.md](./data-model.md) (to be created in next step)

**Key Entities**:
1. **Module**: Container for learning unit (1 of 4: ROS 2, Gazebo/Unity, Isaac, VLA)
2. **Chapter**: Subsection within module (Quickstart Lab, Conceptual Foundation, Intermediate Lab, Advanced Concepts, Advanced Lab, Assessment)
3. **Lab Exercise**: Hands-on activity (beginner/intermediate/advanced progressive difficulty)
4. **Code Example**: Complete runnable code sample in GitHub repository
5. **Simulation Asset**: URDF model, mesh, texture, or world file
6. **Assessment Rubric**: Evaluation criteria for labs and capstone
7. **Hardware Configuration**: Deployment option specification (RTX, cloud, Jetson)

### API Contracts

**See**: [contracts/](./contracts/) directory (to be created in next step)

**Contract Files**:
1. `docusaurus-config.schema.json`: Configuration schema for Docusaurus instances
2. `module-structure.schema.json`: Enforces module structure requirements (FR-001)
3. `code-example.schema.json`: Defines code example metadata (language, ROS 2 version, hardware requirements)
4. `assessment-rubric.schema.json`: Standardizes rubric format (FR-034, FR-035)
5. `hardware-requirements.schema.json`: Validates hardware specification format (FR-013)

### Quickstart Guide

**See**: [quickstart.md](./quickstart.md) (to be created in next step)

**Contents**:
1. Developer setup (Node.js 20, npm workspaces, Docusaurus CLI)
2. Repository cloning and workspace initialization
3. Local development server (`npm run start` per module)
4. Building and testing (`npm run build`, accessibility tests)
5. Deployment to GitHub Pages (GitHub Actions workflow)
6. Content authoring guidelines (markdown, MDX, code embedding)
7. Adding new modules, chapters, and code examples

## Architecture Decisions

### ADR-001: Multi-Instance Docusaurus Architecture

**Decision**: Use 5 separate Docusaurus instances (main + 4 modules) instead of single monolithic site

**Rationale**:
- **Build Performance**: Each module builds independently (~3-5 min vs ~20-30 min monolithic)
- **Team Collaboration**: Module authors work in isolation, reducing merge conflicts
- **Progressive Loading**: Students load only the module they need, reducing initial bundle size
- **Independent Versioning**: Each module can be versioned separately for ROS 2 migrations

**Alternatives Considered**:
- Monolithic single Docusaurus site: Simpler deployment but poor performance at scale, single point of failure
- Completely separate repositories per module: Too much duplication of theme/config, harder to maintain consistency

**Trade-offs**:
- **Complexity**: Requires shared theme/config management via npm workspaces
- **Navigation**: Requires cross-linking between instances (mitigated by consistent navbar)
- **Deployment**: 5 separate GitHub Actions workflows (but runs in parallel, total time <10 min)

### ADR-002: Multi-Repository Strategy

**Decision**: Use 4 separate GitHub repositories (textbook, examples, assets, student-template) instead of monorepo

**Rationale**:
- **Access Control**: Students fork `examples` and `student-template` without accessing textbook source
- **Build Efficiency**: Textbook updates don't trigger code testing, code updates don't rebuild docs
- **Independent Versioning**: Textbook typo fixes (v1.1.1) don't require re-releasing code examples
- **Asset Size Management**: Large URDF models don't bloat docs repository

**Alternatives Considered**:
- Monorepo: Simpler workflow but slower CI/CD, larger clone size, complex permission model
- Git submodules: Hybrid approach but adds complexity without significant benefits

**Trade-offs**:
- **Coordination**: Requires version synchronization (mitigated by automated release workflow)
- **Student Onboarding**: Students clone multiple repos (mitigated by `student-template` with setup scripts)

### ADR-003: Git LFS + GitHub Releases for Assets

**Decision**: Use Git LFS for assets ≤500MB, GitHub Releases for 500MB-2GB, external CDN for >2GB

**Rationale**:
- **GitHub Free Tier Limits**: 1GB LFS storage + 1GB bandwidth/month (sufficient for low-poly models)
- **Student Bandwidth**: Tiered approach lets students download only what their hardware supports
- **Version Control**: Low-poly models stay in Git history, high-res models downloaded on demand

**Alternatives Considered**:
- Azure DevOps (unlimited LFS): Requires students to have Azure accounts, adds complexity
- All assets in Git (no LFS): Bloats repository, unworkable for multi-GB files
- External CDN only: Loses version control benefits, harder to ensure availability

**Trade-offs**:
- **Complexity**: Students must understand which assets to download for their hardware tier
- **Cost**: May need GitHub LFS paid plan if student usage exceeds 1GB bandwidth/month (can apply for GitHub Education)

### ADR-004: Algolia DocSearch with Ask AI

**Decision**: Use Algolia DocSearch v4 with Ask AI feature for production, local search for development

**Rationale**:
- **Conversational Search**: Ask AI enables students to query via natural language ("How do I create a ROS 2 publisher?")
- **Free for Education**: Algolia DocSearch is free for open-source educational projects
- **Quality**: Superior to local search (typo tolerance, relevance ranking, multi-language support)

**Alternatives Considered**:
- Local search only: Works offline but inferior UX, adds ~1-2MB bundle size per module
- Custom search backend: Requires infrastructure, maintenance burden

**Trade-offs**:
- **Development Workflow**: Local search required during development (Algolia needs deployed site to index)
- **Vendor Lock-in**: Dependency on Algolia service (mitigated by free-tier guarantee for education)

### ADR-005: WCAG 2.1 AA Compliance with Automated Testing

**Decision**: Implement WCAG 2.1 AA compliance with pa11y-ci + axe-core automated testing in CI/CD

**Rationale**:
- **Legal Requirement**: ADA Title II compliance deadline April 24, 2026
- **Educational Access**: Students with disabilities must be able to access content
- **Automated Detection**: pa11y-ci + axe-core catch ~30-40% of accessibility issues automatically

**Alternatives Considered**:
- Manual testing only: Insufficient coverage, scales poorly
- WCAG 2.2 AAA: Over-engineered for educational content, no legal requirement

**Trade-offs**:
- **Build Time**: Accessibility tests add ~2-3 minutes to CI/CD pipeline
- **Automated Limitations**: Still requires manual testing for screen readers, keyboard navigation edge cases

## Next Steps

### Immediate Actions (Phase 1 Completion)

1. **Create data-model.md**: Document all entities (Module, Chapter, Lab, Code Example, etc.) with schemas
2. **Create contracts/ directory**: Generate JSON schemas for Docusaurus config, module structure, code examples
3. **Create quickstart.md**: Developer onboarding guide for content authoring and deployment
4. **Update agent context**: Run `.specify/scripts/powershell/update-agent-context.ps1` to add Docusaurus, ROS 2, Git LFS to technology stack

### Phase 2: Task Generation (/sp.tasks)

After Phase 1 completion, run `/sp.tasks` to generate:
- Actionable, dependency-ordered tasks in `tasks.md`
- Test-first approach (red-green-refactor cycle)
- Integration between modules and repositories
- CI/CD pipeline setup tasks
- Content authoring tasks per module

### Development Workflow

1. **Week 1-2**: Repository setup, Docusaurus multi-instance configuration, shared theme development
2. **Week 3-4**: Main site content, version compatibility matrix, accessibility infrastructure
3. **Week 5-8**: Module 1 (ROS 2) content authoring, code examples, testing
4. **Week 9-12**: Module 2 (Gazebo/Unity) content authoring, URDF models, simulation worlds
5. **Week 13-16**: Module 3 (NVIDIA Isaac) content authoring, Isaac Sim scenes, Nav2 configs
6. **Week 17-20**: Module 4 (VLA) content authoring, Whisper integration, capstone project
7. **Week 21-24**: Integration testing, accessibility audits, peer review, deployment
