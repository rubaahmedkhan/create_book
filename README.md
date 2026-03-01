# Physical AI & Humanoid Robotics Textbook

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-v3-blue)](https://docusaurus.io/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel)](https://frontend-chi-fawn-17.vercel.app)

A comprehensive 13-week course on Physical AI and Humanoid Robotics — from ROS 2 basics to Vision-Language-Action models. Features personalized learning, bilingual content (English + Urdu), and an AI-powered chatbot.

---

## 🔗 Live Links

| Platform | URL | Description |
|----------|-----|-------------|
| 📚 **Textbook** | [rubaahmedkhan.github.io/create_book](https://rubaahmedkhan.github.io/create_book/) | Docusaurus book (GitHub Pages) |
| 🚀 **Learning Platform** | [frontend-chi-fawn-17.vercel.app](https://frontend-chi-fawn-17.vercel.app) | Auth + Dashboard (Vercel) |

---

## 🏗️ Project Architecture

```
book1/
├── main-site/              # Docusaurus — Course overview & navigation
├── module1-ros2/           # Docusaurus — ROS 2 Fundamentals
├── module2-simulation/     # Docusaurus — Gazebo & Simulation
├── module3-isaac/          # Docusaurus — NVIDIA Isaac Platform
├── module4-vla/            # Docusaurus — Vision-Language-Action Models
├── frontend/               # Next.js 14 — Auth, Dashboard, Personalization
├── backend/                # FastAPI — RAG Chatbot & AI Services
└── auth-service/           # Better Auth — Session Management
```

### How It Works

1. **User visits** `frontend-chi-fawn-17.vercel.app` → Signs up / Signs in
2. **Questionnaire** → Skill level assessed (Beginner / Intermediate / Advanced)
3. **Dashboard** → Personalized view with direct links to the book modules
4. **Book** → Opens `rubaahmedkhan.github.io/create_book` — content filtered by skill level
5. **AI Chatbot** → Floating button on every page — answers questions about the content
6. **Bilingual** → Language toggle on every chapter (English ↔ اردو)

---

## ✨ Features

### 📖 Textbook (Docusaurus — GitHub Pages)
- **5 Docusaurus sites** built as one multi-instance deployment
- **Bilingual** — English (LTR) and Urdu (RTL) toggle on every chapter
- **Skill-level content filtering** — sections marked 🟢 Beginner / 🟡 Intermediate / 🔴 Advanced
- **AI Chatbot** — floating button powered by OpenRouter / RAG backend
- **Personalization button** — adapts content display per user profile
- **Auto-deploy** via GitHub Actions on every push to `main`

### 🔐 Learning Platform (Next.js — Vercel)
- **Authentication** — Email/password signup & signin (Better Auth + Neon PostgreSQL)
- **Onboarding Questionnaire** — Software, Hardware, AI/ML background assessment
- **Smart Dashboard** — Skill badge, module flash cards, direct book links
- **Session management** — 30-day sessions with cookie-based auth
- **Protected routes** — Unauthenticated users redirected to signin

---

## 📚 Course Modules

| Module | Topic | Weeks |
|--------|-------|-------|
| **Intro** | Physical AI Overview | — |
| **Module 1** | ROS 2 Fundamentals — Nodes, Topics, Services | 1–3 |
| **Module 2** | Gazebo & Unity Simulation — Physics, Digital Twin | 4–6 |
| **Module 3** | NVIDIA Isaac Platform — GPU Simulation, Nav2 | 7–10 |
| **Module 4** | Vision-Language-Action Models — Capstone | 11–13 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Textbook | Docusaurus v3, React, TypeScript |
| Frontend | Next.js 14, Tailwind CSS, Better Auth client |
| Auth | Better Auth, Neon PostgreSQL (serverless) |
| Backend | FastAPI, Python, Qdrant (vector DB) |
| AI Chatbot | OpenRouter API, RAG pipeline |
| Deployment | GitHub Actions → GitHub Pages (book), Vercel (frontend) |
| Language | English + Urdu (RTL/LTR) |

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- npm 9+

### Run the Textbook (Docusaurus)

```bash
# Install dependencies
npm install

# Start main site (port 3000)
npm run start --workspace=main-site

# Start a specific module
npm run start --workspace=module1-ros2
npm run start --workspace=module2-simulation
npm run start --workspace=module3-isaac
npm run start --workspace=module4-vla
```

### Run the Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local and fill in your values
cp .env.example .env.local

# Start dev server
npm run dev
```

### Run the Backend (FastAPI)

```bash
cd backend

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables (Frontend)

```env
DATABASE_URL=postgresql://...          # Neon PostgreSQL connection string
AUTH_SECRET=your-secret-key            # Random 32+ char string
TRUSTED_ORIGINS=http://localhost:3001  # Comma-separated allowed origins
NEXT_PUBLIC_BOOK_URL=https://rubaahmedkhan.github.io/create_book
```

---

## 📦 Deployment

### Textbook → GitHub Pages

Push to `main` branch — GitHub Actions automatically builds all 5 Docusaurus sites and deploys.

```bash
git push origin main   # triggers .github/workflows/deploy.yml
```

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

---

## 📝 License

**Textbook content** — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — Free to share and adapt with attribution.

**Code** — [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

---

*Built with ❤️ for the next generation of Physical AI engineers*
