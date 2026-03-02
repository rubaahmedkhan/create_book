---
description: "Actionable task list for Physical AI & Humanoid Robotics Textbook implementation"
---

# Tasks: Physical AI & Humanoid Robotics Textbook

**Input**: Design documents from `/specs/001-physical-ai-textbook/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are NOT explicitly requested in the specification. This task list focuses on implementation, build verification, and accessibility testing as specified in FR-026 and FR-037.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each module.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

This project uses **multi-instance Docusaurus architecture** with **multi-repository strategy**:

**Repository 1** (THIS REPO - `book1/`):
- `main-site/`, `module1-ros2/`, `module2-simulation/`, `module3-isaac/`, `module4-vla/`
- `shared/` (components, theme, config)
- `.github/workflows/` (CI/CD)

**Repositories 2-4** (SEPARATE REPOS - created later):
- `physical-ai-examples/` (code examples)
- `physical-ai-assets/` (URDF models, Git LFS)
- `physical-ai-student-template/` (starter kit)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize multi-instance Docusaurus architecture and foundational repository structure

- [X] T001 Create NPM workspace structure in package.json at repository root for multi-instance Docusaurus setup
- [ ] T002 Initialize Node.js 20 LTS environment and install Docusaurus v3.9+ dependencies in package.json
- [ ] T003 [P] Configure ESLint and Prettier for JavaScript/MDX in .eslintrc.js and .prettierrc
- [ ] T004 [P] Create main-site Docusaurus instance in main-site/ directory with docusaurus.config.js
- [ ] T005 [P] Create module1-ros2 Docusaurus instance in module1-ros2/ directory with docusaurus.config.js
- [ ] T006 [P] Create module2-simulation Docusaurus instance in module2-simulation/ directory with docusaurus.config.js
- [ ] T007 [P] Create module3-isaac Docusaurus instance in module3-isaac/ directory with docusaurus.config.js
- [ ] T008 [P] Create module4-vla Docusaurus instance in module4-vla/ directory with docusaurus.config.js
- [ ] T009 Create shared theme and components directory in shared/ with base-docusaurus.config.js
- [ ] T010 [P] Configure Prism.js syntax highlighting for Python, Bash, YAML, XML in shared/theme/prism-config.js
- [ ] T011 [P] Create shared navbar configuration in shared/config/shared-navbar.js
- [ ] T012 Create custom CSS theme with dark mode support in shared/theme/custom.css (FR-011)
- [ ] T013 [P] Install @saucelabs/theme-github-codeblock plugin for code embedding from GitHub
- [ ] T014 [P] Install @easyops-cn/docusaurus-search-local plugin for local search during development (FR-012)
- [ ] T015 [P] Install @docusaurus/plugin-ideal-image for image optimization
- [ ] T016 [P] Install docusaurus-prince-pdf plugin for PDF generation (light mode only per plan.md ADR)
- [ ] T017 Create .gitignore file with node_modules, build/, .docusaurus/ entries

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story (module content authoring) can begin

**⚠️ CRITICAL**: No module content work can begin until this phase is complete

- [ ] T018 Configure GitHub Actions workflow for main-site deployment in .github/workflows/deploy-main.yml (FR-007)
- [ ] T019 [P] Configure GitHub Actions workflow for module1-ros2 deployment in .github/workflows/deploy-module1.yml
- [ ] T020 [P] Configure GitHub Actions workflow for module2-simulation deployment in .github/workflows/deploy-module2.yml
- [ ] T021 [P] Configure GitHub Actions workflow for module3-isaac deployment in .github/workflows/deploy-module3.yml
- [ ] T022 [P] Configure GitHub Actions workflow for module4-vla deployment in .github/workflows/deploy-module4.yml
- [ ] T023 [P] Configure accessibility testing workflow with pa11y-ci and axe-core in .github/workflows/accessibility-test.yml (FR-037)
- [ ] T024 [P] Configure link validation workflow in .github/workflows/link-validation.yml (FR-036)
- [ ] T025 Create shared React components: HardwareRequirementsTable.jsx in shared/components/ (FR-013, FR-014)
- [ ] T026 [P] Create shared React component: SimulationTabs.jsx for Gazebo/Unity/Isaac Sim in shared/components/
- [ ] T027 [P] Create shared React component: CodeEmbedFromGitHub.jsx using @saucelabs/theme-github-codeblock in shared/components/
- [ ] T028 Create glossary infrastructure with auto-linking in main-site/docs/glossary.md (FR-004)
- [ ] T029 Create version compatibility matrix in main-site/docs/version-compatibility.md (FR-010, ADR-002)
- [ ] T030 Create accessibility statement page in main-site/docs/accessibility.md (FR-037, WCAG 2.1 AA)
- [ ] T031 Configure Algolia DocSearch application for production search (free tier for education per ADR-004)

**Checkpoint**: Foundation ready - module content authoring (user stories) can now begin in parallel

---

## Phase 3: User Story 1 - Progressive Module-Based Learning (Priority: P1) 🎯 MVP

**Goal**: Create Module 1 (ROS 2 Fundamentals) with scaffold-fade progression (beginner → intermediate → advanced labs) demonstrating core educational approach

**Independent Test**: Student with AI/ML background can complete Module 1 independently, create ROS 2 package with nodes communicating via topics, demonstrating functional learning path

### Implementation for User Story 1

#### Main Site Landing Content
- [ ] T032 [P] [US1] Create main-site landing page in main-site/docs/index.md with course overview
- [ ] T033 [P] [US1] Create course overview page in main-site/docs/course-overview.md explaining 4-module structure
- [ ] T034 [P] [US1] Create hardware requirements page in main-site/docs/hardware-requirements.md (FR-013)

#### Module 1: ROS 2 Fundamentals Structure
- [ ] T035 [US1] Create module 1 overview in module1-ros2/docs/00-overview.md with focus statement, 3-5 learning outcomes, prerequisites (FR-001)
- [ ] T036 [P] [US1] Create beginner quickstart lab in module1-ros2/docs/01-quickstart-lab.md with simulation-first approach (FR-002)
- [ ] T037 [P] [US1] Create conceptual foundation chapter in module1-ros2/docs/02-conceptual-foundation.md with plain-English explanations (FR-005)
- [ ] T038 [P] [US1] Create intermediate lab in module1-ros2/docs/03-intermediate-lab.md with medium scaffolding
- [ ] T039 [P] [US1] Create advanced concepts chapter in module1-ros2/docs/04-advanced-concepts.md
- [ ] T040 [P] [US1] Create advanced lab in module1-ros2/docs/05-advanced-lab.md with minimal scaffolding
- [ ] T041 [P] [US1] Create assessment rubric in module1-ros2/docs/06-assessment.md (FR-034)

#### ROS 2 Content Chapters (Detailed Topics)
- [ ] T042 [P] [US1] Write chapter on ROS 2 architecture and nodes in module1-ros2/docs/ros2-architecture.md
- [ ] T043 [P] [US1] Write chapter on topics and pub/sub in module1-ros2/docs/topics-pubsub.md
- [ ] T044 [P] [US1] Write chapter on services in module1-ros2/docs/services.md
- [ ] T045 [P] [US1] Write chapter on rclpy Python client library in module1-ros2/docs/rclpy-basics.md
- [ ] T046 [P] [US1] Write chapter on launch files in module1-ros2/docs/launch-files.md
- [ ] T047 [P] [US1] Write chapter on parameters and configuration in module1-ros2/docs/parameters.md

#### Create physical-ai-examples Repository (External Repo)
- [ ] T048 [US1] Initialize physical-ai-examples GitHub repository with README and LICENSE
- [ ] T049 [US1] Create module1-ros2 directory structure in physical-ai-examples/module1-ros2/
- [ ] T050 [P] [US1] Create ROS 2 publisher example in physical-ai-examples/module1-ros2/publisher_example/ with Python code, package.xml, setup.py (FR-003, FR-018-023)
- [ ] T051 [P] [US1] Create ROS 2 subscriber example in physical-ai-examples/module1-ros2/subscriber_example/ with complete code (FR-003)
- [ ] T052 [P] [US1] Create ROS 2 service example in physical-ai-examples/module1-ros2/service_example/ with complete code
- [ ] T053 [P] [US1] Write README for module1 examples in physical-ai-examples/module1-ros2/README.md (FR-027)

#### Code Example Testing Infrastructure
- [ ] T054 [US1] Create CI/CD workflow for code examples in physical-ai-examples/.github/workflows/test-examples-ubuntu.yml (FR-026)
- [ ] T055 [P] [US1] Write test script for publisher example in physical-ai-examples/module1-ros2/tests/test_publisher.py (FR-025)
- [ ] T056 [P] [US1] Write test script for subscriber example in physical-ai-examples/module1-ros2/tests/test_subscriber.py

#### Visual Assets and Accessibility
- [ ] T057 [P] [US1] Create ROS 2 architecture diagram with alt text in module1-ros2/static/img/ros2-architecture.png (FR-029-033)
- [ ] T058 [P] [US1] Create pub/sub flow diagram with annotations in module1-ros2/static/img/pubsub-flow.png
- [ ] T059 [P] [US1] Create service interaction diagram in module1-ros2/static/img/service-interaction.png
- [ ] T060 [US1] Add glossary entries for ROS 2 jargon (node, topic, service, rclpy) in main-site/docs/glossary.md (FR-004)

#### Module 1 Deployment and Validation
- [ ] T061 [US1] Build module1-ros2 locally and verify no warnings using npm run build
- [ ] T062 [US1] Run accessibility tests on module1-ros2 using pa11y-ci and axe-core (FR-037)
- [ ] T063 [US1] Run link validation on module1-ros2 content (FR-036)
- [ ] T064 [US1] Deploy module1-ros2 to GitHub Pages subdirectory /module1/ (FR-007)

**Checkpoint**: At this point, Module 1 (User Story 1) should be fully functional with complete educational content, code examples, and deployment. This represents the MVP demonstrating the core educational approach.

---

## Phase 4: User Story 2 - Hands-On Simulation Practice (Priority: P1)

**Goal**: Create Module 2 (Gazebo & Unity Simulation) with simulation-first pedagogy, URDF examples, and tabbed content for multiple simulators

**Independent Test**: Student can load URDF model in Gazebo, run simulation, modify parameters, and observe behavior changes with troubleshooting guidance

### Implementation for User Story 2

#### Module 2: Gazebo & Unity Simulation Structure
- [ ] T065 [US2] Create module 2 overview in module2-simulation/docs/00-overview.md with focus on physics simulation (FR-001)
- [ ] T066 [P] [US2] Create beginner Gazebo quickstart lab in module2-simulation/docs/01-quickstart-lab.md with "Try It First" section (FR-002)
- [ ] T067 [P] [US2] Create conceptual foundation on URDF in module2-simulation/docs/02-conceptual-foundation.md (FR-005)
- [ ] T068 [P] [US2] Create intermediate simulation lab in module2-simulation/docs/03-intermediate-lab.md
- [ ] T069 [P] [US2] Create advanced concepts on physics engines in module2-simulation/docs/04-advanced-concepts.md
- [ ] T070 [P] [US2] Create advanced Unity integration lab in module2-simulation/docs/05-advanced-lab.md
- [ ] T071 [P] [US2] Create assessment rubric for simulation projects in module2-simulation/docs/06-assessment.md (FR-034)

#### Simulation Content Chapters
- [ ] T072 [P] [US2] Write chapter on URDF syntax and structure in module2-simulation/docs/urdf/urdf-basics.md
- [ ] T073 [P] [US2] Write chapter on Gazebo worlds and environments in module2-simulation/docs/gazebo/gazebo-worlds.md
- [ ] T074 [P] [US2] Write chapter on Unity scene setup in module2-simulation/docs/unity/unity-setup.md
- [ ] T075 [P] [US2] Write chapter on sensor simulation (LiDAR, cameras, IMU) in module2-simulation/docs/gazebo/sensor-simulation.md
- [ ] T076 [P] [US2] Write troubleshooting guide for simulation errors in module2-simulation/docs/troubleshooting.md

#### Simulation Code Examples
- [ ] T077 [US2] Create module2-simulation directory in physical-ai-examples/module2-simulation/
- [ ] T078 [P] [US2] Create low-poly humanoid URDF example in physical-ai-examples/module2-simulation/urdf_examples/humanoid_lowpoly.urdf (FR-003)
- [ ] T079 [P] [US2] Create Gazebo launch file in physical-ai-examples/module2-simulation/gazebo_worlds/launch/gazebo_humanoid.launch.py
- [ ] T080 [P] [US2] Create basic office Gazebo world in physical-ai-examples/module2-simulation/gazebo_worlds/basic_office.world
- [ ] T081 [P] [US2] Create Unity scene package in physical-ai-examples/module2-simulation/unity_scenes/HumanoidScene.unity
- [ ] T082 [P] [US2] Write README for module2 examples in physical-ai-examples/module2-simulation/README.md (FR-027)

#### Create physical-ai-assets Repository (External Repo with Git LFS)
- [ ] T083 [US2] Initialize physical-ai-assets GitHub repository with Git LFS configured
- [ ] T084 [US2] Configure Git LFS to track .stl, .dae, .usd, .world, .obj files in .gitattributes
- [ ] T085 [P] [US2] Upload low-poly humanoid URDF model (~50MB) to physical-ai-assets/urdf_models/humanoid_lowpoly/ with Git LFS
- [ ] T086 [P] [US2] Create download script for high-res models in physical-ai-assets/urdf_models/humanoid_highres/download_highres.sh
- [ ] T087 [P] [US2] Upload basic office world (~20MB) to physical-ai-assets/simulation_worlds/gazebo/ with Git LFS
- [ ] T088 [P] [US2] Write assets repository README with size info and hardware requirements in physical-ai-assets/README.md

#### Visual Assets and Tabbed Content
- [ ] T089 [P] [US2] Create URDF tree structure diagram in module2-simulation/static/img/urdf-structure.png (FR-029-033)
- [ ] T090 [P] [US2] Create Gazebo screenshot with annotations in module2-simulation/static/img/gazebo-interface.png
- [ ] T091 [P] [US2] Create Unity screenshot with annotations in module2-simulation/static/img/unity-interface.png
- [ ] T092 [US2] Implement SimulationTabs component usage in module2 chapters for Gazebo/Unity/Isaac alternatives
- [ ] T093 [US2] Add glossary entries for URDF, SDF, mesh, inertia in main-site/docs/glossary.md (FR-004)

#### Module 2 Deployment and Validation
- [ ] T094 [US2] Build module2-simulation locally and verify no warnings
- [ ] T095 [US2] Run accessibility tests on module2-simulation (FR-037)
- [ ] T096 [US2] Run link validation on module2-simulation content (FR-036)
- [ ] T097 [US2] Deploy module2-simulation to GitHub Pages subdirectory /module2/ (FR-007)

**Checkpoint**: At this point, Module 2 (User Story 2) should be fully functional with simulation examples, URDF models, and multi-simulator support. Students can run simulations independently.

---

## Phase 5: User Story 3 - Hardware-Aware Deployment Options (Priority: P2)

**Goal**: Document hardware requirements and deployment paths (RTX, cloud, Jetson) across all modules with cost estimates and performance optimization tips

**Independent Test**: Student with RTX workstation and student with AWS cloud instance both complete same module with identical learning outcomes

### Implementation for User Story 3

#### Hardware Documentation (Cross-Module)
- [ ] T098 [US3] Create comprehensive hardware comparison table in main-site/docs/hardware-requirements.md comparing RTX/cloud/Jetson (FR-013, FR-014)
- [ ] T099 [P] [US3] Document RTX workstation setup guide in main-site/docs/setup/rtx-workstation.md
- [ ] T100 [P] [US3] Document AWS cloud instance setup guide in main-site/docs/setup/aws-cloud.md with cost estimates (FR-015)
- [ ] T101 [P] [US3] Document Jetson Orin Nano setup guide in main-site/docs/setup/jetson-edge.md
- [ ] T102 [P] [US3] Create performance optimization guide in main-site/docs/performance-optimization.md (FR-016)
- [ ] T103 [P] [US3] Document cloud-to-edge latency considerations in main-site/docs/cloud-edge-latency.md (FR-017)

#### Module-Specific Hardware Requirements
- [ ] T104 [P] [US3] Add hardware requirements section to module1-ros2/docs/00-overview.md (FR-013)
- [ ] T105 [P] [US3] Add hardware requirements section to module2-simulation/docs/00-overview.md
- [ ] T106 [P] [US3] Add hardware requirements section to module3-isaac/docs/00-overview.md (NVIDIA RTX required)
- [ ] T107 [P] [US3] Add hardware requirements section to module4-vla/docs/00-overview.md

#### Deployment Path Documentation
- [ ] T108 [P] [US3] Create tabbed content for RTX/cloud/Jetson setup in each module overview using HardwareRequirementsTable component
- [ ] T109 [P] [US3] Document Isaac Sim performance on different RTX GPUs in module3-isaac/docs/hardware-performance.md
- [ ] T110 [P] [US3] Create cloud cost calculator in main-site/docs/cloud-cost-calculator.md (10 hours/week × 13 weeks × hourly rate)

#### Create physical-ai-student-template Repository (External Repo)
- [ ] T111 [US3] Initialize physical-ai-student-template GitHub repository
- [ ] T112 [P] [US3] Create ROS 2 installation script in physical-ai-student-template/setup_scripts/install_ros2.sh
- [ ] T113 [P] [US3] Create Gazebo installation script in physical-ai-student-template/setup_scripts/install_gazebo.sh
- [ ] T114 [P] [US3] Create Isaac Sim installation script in physical-ai-student-template/setup_scripts/install_isaac.sh
- [ ] T115 [P] [US3] Create Python venv setup script in physical-ai-student-template/setup_scripts/setup_venv.sh
- [ ] T116 [P] [US3] Create installation verification script in physical-ai-student-template/setup_scripts/verify_installation.sh
- [ ] T117 [P] [US3] Create Dockerfile for ROS 2 in physical-ai-student-template/docker/Dockerfile.ros2
- [ ] T118 [P] [US3] Create Dockerfile for Isaac Sim in physical-ai-student-template/docker/Dockerfile.isaac
- [ ] T119 [P] [US3] Create docker-compose.yml in physical-ai-student-template/docker/
- [ ] T120 [US3] Write student-template repository README in physical-ai-student-template/README.md

#### Visual Assets for Hardware Guidance
- [ ] T121 [P] [US3] Create hardware comparison infographic in main-site/static/img/hardware-comparison.png (FR-029-033)
- [ ] T122 [P] [US3] Create cloud setup flowchart in main-site/static/img/cloud-setup-flowchart.png
- [ ] T123 [US3] Add glossary entries for RTX, VRAM, Isaac Sim, Jetson in main-site/docs/glossary.md (FR-004)

**Checkpoint**: At this point, User Story 3 should be complete with comprehensive hardware documentation accessible to students with varying resources. Three deployment paths (RTX, cloud, Jetson) are fully documented.

---

## Phase 6: User Story 4 - Multimodal Integration Capstone (Priority: P2)

**Goal**: Create Module 3 (NVIDIA Isaac) and Module 4 (VLA) with capstone project integrating vision, language, action, and navigation

**Independent Test**: Student's capstone submission evaluated against rubric (voice recognition, LLM planning, navigation, manipulation) with all 4 components functional

### Implementation for User Story 4

#### Module 3: NVIDIA Isaac Platform Structure
- [ ] T124 [US4] Create module 3 overview in module3-isaac/docs/00-overview.md focusing on AI perception (FR-001)
- [ ] T125 [P] [US4] Create beginner Isaac Sim quickstart lab in module3-isaac/docs/01-quickstart-lab.md (FR-002)
- [ ] T126 [P] [US4] Create conceptual foundation on VSLAM in module3-isaac/docs/02-conceptual-foundation.md (FR-005)
- [ ] T127 [P] [US4] Create intermediate Isaac ROS lab in module3-isaac/docs/03-intermediate-lab.md
- [ ] T128 [P] [US4] Create advanced concepts on Nav2 path planning in module3-isaac/docs/04-advanced-concepts.md
- [ ] T129 [P] [US4] Create advanced lab on synthetic data generation in module3-isaac/docs/05-advanced-lab.md
- [ ] T130 [P] [US4] Create assessment rubric for Isaac projects in module3-isaac/docs/06-assessment.md (FR-034)

#### Isaac Sim Content Chapters
- [ ] T131 [P] [US4] Write chapter on Isaac Sim setup and basics in module3-isaac/docs/isaac-sim/basics.md
- [ ] T132 [P] [US4] Write chapter on Isaac ROS VSLAM in module3-isaac/docs/isaac-ros/vslam.md
- [ ] T133 [P] [US4] Write chapter on Nav2 integration in module3-isaac/docs/nav2/navigation.md
- [ ] T134 [P] [US4] Write chapter on photorealistic rendering in module3-isaac/docs/isaac-sim/rendering.md
- [ ] T135 [P] [US4] Document Isaac Sim version numbers (FR-010) in module3-isaac/docs/version-requirements.md

#### Module 4: Vision-Language-Action (VLA) Structure
- [ ] T136 [US4] Create module 4 overview in module4-vla/docs/00-overview.md focusing on multimodal integration (FR-001)
- [ ] T137 [P] [US4] Create beginner Whisper integration lab in module4-vla/docs/01-quickstart-lab.md (FR-002)
- [ ] T138 [P] [US4] Create conceptual foundation on VLA convergence in module4-vla/docs/02-conceptual-foundation.md (FR-005)
- [ ] T139 [P] [US4] Create intermediate LLM planning lab in module4-vla/docs/03-intermediate-lab.md
- [ ] T140 [P] [US4] Create advanced concepts on voice-to-action pipelines in module4-vla/docs/04-advanced-concepts.md
- [ ] T141 [P] [US4] Create capstone project instructions in module4-vla/docs/05-capstone-project.md
- [ ] T142 [US4] Create capstone assessment rubric covering all 4 components in module4-vla/docs/06-capstone-rubric.md (FR-035)

#### VLA Content Chapters
- [ ] T143 [P] [US4] Write chapter on OpenAI Whisper integration in module4-vla/docs/whisper-integration/basics.md
- [ ] T144 [P] [US4] Write chapter on LLM cognitive planning in module4-vla/docs/llm-planning/gpt4-planning.md
- [ ] T145 [P] [US4] Write chapter on voice-to-ROS action translation in module4-vla/docs/voice-to-action/pipeline.md
- [ ] T146 [P] [US4] Write chapter on end-to-end integration in module4-vla/docs/integration/full-pipeline.md

#### Isaac and VLA Code Examples
- [ ] T147 [US4] Create module3-isaac directory in physical-ai-examples/module3-isaac/
- [ ] T148 [P] [US4] Create Isaac Sim scene example in physical-ai-examples/module3-isaac/isaac_sim_scenes/humanoid_navigation.usd
- [ ] T149 [P] [US4] Create Isaac ROS VSLAM example in physical-ai-examples/module3-isaac/isaac_ros_nodes/vslam_example/
- [ ] T150 [P] [US4] Create Nav2 configuration in physical-ai-examples/module3-isaac/nav2_configs/nav2_params.yaml
- [ ] T151 [US4] Create module4-vla directory in physical-ai-examples/module4-vla/
- [ ] T152 [P] [US4] Create Whisper voice command node in physical-ai-examples/module4-vla/whisper_integration/voice_command_node.py (FR-003, FR-018-023)
- [ ] T153 [P] [US4] Create GPT-4 planner node in physical-ai-examples/module4-vla/llm_planning/gpt4_planner_node.py
- [ ] T154 [P] [US4] Create autonomous humanoid capstone code in physical-ai-examples/module4-vla/capstone_project/autonomous_humanoid.py
- [ ] T155 [P] [US4] Write README for module3 examples in physical-ai-examples/module3-isaac/README.md (FR-027)
- [ ] T156 [P] [US4] Write README for module4 examples in physical-ai-examples/module4-vla/README.md (FR-027)
- [ ] T157 [P] [US4] Write capstone project rubric in physical-ai-examples/module4-vla/capstone_project/rubric.md (FR-035)

#### Module Integration Points Documentation
- [ ] T158 [P] [US4] Add "Integration Points" section to module1-ros2/docs/00-overview.md linking to modules 2-4
- [ ] T159 [P] [US4] Add "Integration Points" section to module2-simulation/docs/00-overview.md linking to modules 3-4
- [ ] T160 [P] [US4] Add "Integration Points" section to module3-isaac/docs/00-overview.md linking to module 4
- [ ] T161 [US4] Document capstone synthesis of all 4 modules in module4-vla/docs/05-capstone-project.md

#### Visual Assets for Modules 3-4
- [ ] T162 [P] [US4] Create Isaac Sim interface screenshot in module3-isaac/static/img/isaac-sim-interface.png (FR-029-033)
- [ ] T163 [P] [US4] Create VSLAM visualization diagram in module3-isaac/static/img/vslam-visualization.png
- [ ] T164 [P] [US4] Create VLA architecture diagram in module4-vla/static/img/vla-architecture.png
- [ ] T165 [P] [US4] Create voice-to-action pipeline flowchart in module4-vla/static/img/voice-action-pipeline.png
- [ ] T166 [US4] Add glossary entries for VSLAM, Nav2, VLA, Whisper, Isaac Sim in main-site/docs/glossary.md (FR-004)

#### Module 3-4 Deployment and Validation
- [ ] T167 [US4] Build module3-isaac locally and verify no warnings
- [ ] T168 [US4] Build module4-vla locally and verify no warnings
- [ ] T169 [US4] Run accessibility tests on modules 3-4 (FR-037)
- [ ] T170 [US4] Run link validation on modules 3-4 (FR-036)
- [ ] T171 [US4] Deploy module3-isaac to GitHub Pages subdirectory /module3/ (FR-007)
- [ ] T172 [US4] Deploy module4-vla to GitHub Pages subdirectory /module4/ (FR-007)

**Checkpoint**: At this point, Modules 3-4 (User Story 4) should be complete with multimodal integration capstone. Students can synthesize vision, language, and action systems. All 4 modules are deployed and integrated.

---

## Phase 7: User Story 5 - Code Example Reproducibility (Priority: P3)

**Goal**: Ensure all code examples are tested, version-controlled, and work on fresh Ubuntu 22.04 + RTX setup with CI/CD verification

**Independent Test**: Fresh Ubuntu 22.04 + RTX environment, clone repositories, run CI/CD tests, verify all examples execute successfully

### Implementation for User Story 5

#### CI/CD Pipeline Completion
- [ ] T173 [P] [US5] Add cloud testing workflow in physical-ai-examples/.github/workflows/test-examples-cloud.yml (FR-026)
- [ ] T174 [P] [US5] Configure ROS 2 Humble testing environment in CI/CD with Ubuntu 22.04 (FR-008, FR-009)
- [ ] T175 [P] [US5] Configure ROS 2 Iron testing environment in CI/CD for version compatibility (FR-009)
- [ ] T176 [US5] Add code quality checks (PEP 8, linting) to CI/CD for all Python examples (FR-018)

#### Example Testing and Documentation
- [ ] T177 [P] [US5] Test all module1 examples on fresh Ubuntu 22.04 + ROS 2 Humble environment (FR-025)
- [ ] T178 [P] [US5] Test all module2 examples on fresh Ubuntu 22.04 + Gazebo environment (FR-025)
- [ ] T179 [P] [US5] Test all module3 examples on fresh Ubuntu 22.04 + RTX + Isaac Sim environment (FR-025)
- [ ] T180 [P] [US5] Test all module4 examples on fresh Ubuntu 22.04 + ROS 2 + OpenAI API environment (FR-025)
- [ ] T181 [P] [US5] Verify all code examples include docstrings per PEP 8 (FR-019)
- [ ] T182 [P] [US5] Verify all code examples include error handling (FR-022)
- [ ] T183 [P] [US5] Verify all code examples include logging (FR-023)
- [ ] T184 [US5] Update all README files with dependency versions in physical-ai-examples/*/README.md (FR-027)

#### Version Control and Release Strategy
- [ ] T185 [US5] Create semantic versioning strategy document in main-site/docs/versioning.md
- [ ] T186 [US5] Tag initial release v1.0.0 for textbook repository
- [ ] T187 [US5] Tag matching release v1.0.0 for physical-ai-examples repository (synchronized versioning per ADR-002)
- [ ] T188 [US5] Tag initial release v1.0.0 for physical-ai-assets repository
- [ ] T189 [US5] Create GitHub Release for high-res URDF models in physical-ai-assets (>500MB assets)
- [ ] T190 [US5] Update version compatibility matrix in main-site/docs/version-compatibility.md with all tool versions

#### Issue Tracking and Student Support
- [ ] T191 [P] [US5] Create GitHub issue template for broken examples in physical-ai-examples/.github/ISSUE_TEMPLATE/broken-example.md
- [ ] T192 [P] [US5] Create GitHub issue template for content improvements in book1/.github/ISSUE_TEMPLATE/content-improvement.md
- [ ] T193 [US5] Document issue resolution workflow in main-site/docs/contributing.md

**Checkpoint**: At this point, User Story 5 should be complete with all code examples tested, CI/CD passing, and version control established. Students can reliably run all examples.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple modules and final production readiness

- [ ] T194 [P] Configure Algolia DocSearch indexing for production site (ADR-004)
- [ ] T195 [P] Generate PDF exports for all 4 modules using docusaurus-prince-pdf (FR-028, light mode only)
- [ ] T196 [P] Optimize images across all modules using @docusaurus/plugin-ideal-image
- [ ] T197 [P] Run full accessibility audit on all 5 Docusaurus instances (WCAG 2.1 AA compliance, FR-037)
- [ ] T198 [P] Run performance testing on main site and all modules (load time <3 seconds per SC-012)
- [ ] T199 [P] Create sitemap.xml for all 5 Docusaurus instances
- [ ] T200 [P] Configure robots.txt for search engine optimization
- [ ] T201 [US1-US5] Peer review Module 1 with 2 technical reviewers + 1 pedagogical expert (FR-038)
- [ ] T202 [US1-US5] Peer review Module 2 with 2 technical reviewers + 1 pedagogical expert (FR-038)
- [ ] T203 [US1-US5] Peer review Module 3 with 2 technical reviewers + 1 pedagogical expert (FR-038)
- [ ] T204 [US1-US5] Peer review Module 4 with 2 technical reviewers + 1 pedagogical expert (FR-038)
- [ ] T205 Security hardening: Review and sanitize all external links
- [ ] T206 Create production deployment checklist in main-site/docs/deployment-checklist.md
- [ ] T207 Write project README in book1/README.md with setup instructions
- [ ] T208 Create CONTRIBUTING.md guide for future content authors in book1/CONTRIBUTING.md
- [ ] T209 Create LICENSE file (recommend Creative Commons for educational content) in book1/LICENSE
- [ ] T210 Final validation: Build all 5 Docusaurus instances and verify zero warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Module 1): Can start after Foundational - MVP priority
  - US2 (Module 2): Can start after Foundational - Can run parallel with US1
  - US3 (Hardware Docs): Can start after Foundational - Cross-module concern
  - US4 (Modules 3-4): Can start after Foundational - Depends on understanding from US1-US2 content
  - US5 (Testing/CI/CD): Can start after Foundational - Should run parallel with all modules
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Module 1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP**
- **User Story 2 (P1 - Module 2)**: Can start after Foundational (Phase 2) - Independent, can run parallel with US1
- **User Story 3 (P2 - Hardware Docs)**: Can start after Foundational (Phase 2) - References all modules but independently testable
- **User Story 4 (P2 - Modules 3-4)**: Can start after Foundational (Phase 2) - References Module 1-2 concepts but independently testable
- **User Story 5 (P3 - Testing)**: Can start after Foundational (Phase 2) - Runs parallel with all modules, validates as content is created

### Within Each User Story

- Content authoring (markdown) before code examples
- Code examples before testing
- Local build verification before deployment
- Accessibility testing before final deployment
- Peer review before marking story complete

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T003-T016 can run in parallel (different Docusaurus instances and plugins)

**Phase 2 (Foundational)**: Tasks T019-T024, T025-T027 can run in parallel (different workflows and components)

**Phase 3 (US1 - Module 1)**:
- Content chapters T042-T047 can run in parallel
- Code examples T050-T052 can run in parallel
- Visual assets T057-T059 can run in parallel

**Phase 4 (US2 - Module 2)**:
- Content chapters T072-T076 can run in parallel
- Code examples T078-T081, T085-T087 can run in parallel
- Visual assets T089-T091 can run in parallel

**Phase 5 (US3 - Hardware Docs)**:
- Setup guides T099-T101 can run in parallel
- Module requirements T104-T107 can run in parallel
- Setup scripts T112-T119 can run in parallel

**Phase 6 (US4 - Modules 3-4)**:
- Module 3 chapters T131-T135 and Module 4 chapters T143-T146 can run in parallel
- Code examples T148-T150, T152-T157 can run in parallel
- Visual assets T162-T165 can run in parallel

**Phase 7 (US5 - Testing)**:
- Testing tasks T177-T180 can run in parallel across modules
- Verification tasks T181-T183 can run in parallel

**Phase 8 (Polish)**:
- Tasks T194-T200 can run in parallel
- Peer reviews T201-T204 can run in parallel

---

## Parallel Example: User Story 1 (Module 1 - ROS 2)

```bash
# Launch all content chapters for Module 1 together:
Task: "Write chapter on ROS 2 architecture and nodes in module1-ros2/docs/ros2-architecture.md"
Task: "Write chapter on topics and pub/sub in module1-ros2/docs/topics-pubsub.md"
Task: "Write chapter on services in module1-ros2/docs/services.md"
Task: "Write chapter on rclpy Python client library in module1-ros2/docs/rclpy-basics.md"
Task: "Write chapter on launch files in module1-ros2/docs/launch-files.md"
Task: "Write chapter on parameters and configuration in module1-ros2/docs/parameters.md"

# Launch all code examples for Module 1 together:
Task: "Create ROS 2 publisher example in physical-ai-examples/module1-ros2/publisher_example/"
Task: "Create ROS 2 subscriber example in physical-ai-examples/module1-ros2/subscriber_example/"
Task: "Create ROS 2 service example in physical-ai-examples/module1-ros2/service_example/"

# Launch all visual assets for Module 1 together:
Task: "Create ROS 2 architecture diagram with alt text in module1-ros2/static/img/ros2-architecture.png"
Task: "Create pub/sub flow diagram with annotations in module1-ros2/static/img/pubsub-flow.png"
Task: "Create service interaction diagram in module1-ros2/static/img/service-interaction.png"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Module 1)

1. **Complete Phase 1: Setup** (T001-T017) - Multi-instance Docusaurus infrastructure
2. **Complete Phase 2: Foundational** (T018-T031) - CI/CD, shared components, glossary
3. **Complete Phase 3: User Story 1 - Module 1** (T032-T064) - Complete ROS 2 module
4. **STOP and VALIDATE**: Test Module 1 independently
   - Student can complete all labs
   - Code examples run on Ubuntu 22.04 + ROS 2 Humble
   - Accessibility tests pass (WCAG 2.1 AA)
   - Deployment to GitHub Pages successful
5. **Deploy/Demo**: MVP is ready - Module 1 demonstrates core educational approach

**Timeline**: Weeks 1-8 (assuming 1-2 weeks per phase)

### Incremental Delivery

1. **Complete Setup + Foundational** → Foundation ready (Weeks 1-4)
2. **Add Module 1 (US1)** → Test independently → Deploy/Demo (Weeks 5-8) - **MVP!**
3. **Add Module 2 (US2)** → Test independently → Deploy/Demo (Weeks 9-12)
4. **Add Hardware Docs (US3)** → Test independently → Deploy/Demo (Weeks 9-12, parallel with US2)
5. **Add Modules 3-4 (US4)** → Test independently → Deploy/Demo (Weeks 13-20)
6. **Add Testing Infrastructure (US5)** → Validate all modules → Deploy/Demo (Weeks 13-20, parallel with US4)
7. **Polish (Phase 8)** → Final production readiness (Weeks 21-24)

Each module adds value without breaking previous modules.

### Parallel Team Strategy

With multiple content authors:

1. **Team completes Setup + Foundational together** (Weeks 1-4)
2. Once Foundational is done:
   - **Author A**: Module 1 (ROS 2) - US1
   - **Author B**: Module 2 (Gazebo/Unity) - US2
   - **Author C**: Hardware documentation - US3
   - **Author D**: Modules 3-4 (Isaac, VLA) - US4
   - **Developer E**: CI/CD and testing infrastructure - US5
3. Modules complete and integrate independently
4. Weekly integration testing to ensure cross-module links work

---

## Task Count Summary

- **Total Tasks**: 210
- **Phase 1 (Setup)**: 17 tasks
- **Phase 2 (Foundational)**: 14 tasks (CRITICAL BLOCKING)
- **Phase 3 (US1 - Module 1)**: 33 tasks (MVP)
- **Phase 4 (US2 - Module 2)**: 33 tasks
- **Phase 5 (US3 - Hardware Docs)**: 26 tasks
- **Phase 6 (US4 - Modules 3-4)**: 49 tasks
- **Phase 7 (US5 - Testing)**: 21 tasks
- **Phase 8 (Polish)**: 17 tasks

**Parallel Opportunities Identified**: ~120 tasks marked [P] can run in parallel

**MVP Scope**: Phases 1-3 (T001-T064) = 64 tasks for functional Module 1 demonstration

---

## Notes

- [P] tasks = different files/modules, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1-US5) for traceability
- Each user story (module) should be independently completable and testable
- Tests are NOT explicitly requested in spec, focus is on build verification (FR-026) and accessibility (FR-037)
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate module independently
- Multi-repository architecture requires coordination across 4 separate repos
- WCAG 2.1 AA compliance is legally required (deadline: April 24, 2026)
- Algolia DocSearch application may take 1-2 weeks for approval (apply early)
- Avoid: Duplicate content, broken cross-module links, version mismatches between textbook and examples
