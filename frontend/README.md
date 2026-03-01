# Learning Platform Frontend

A Next.js-based frontend application with authentication and personalized learning experience.

## Features

- **Authentication System** using Better Auth
  - User signup with email/password
  - User signin
  - Session management
  - Protected routes

- **Onboarding Questionnaire**
  - Software background assessment
  - Hardware experience evaluation
  - AI/ML knowledge assessment
  - Learning goals collection

- **Personalized Dashboard**
  - Skill level display (beginner/intermediate/advanced)
  - Customized module recommendations
  - User background summary
  - Sign out functionality

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout with AuthProvider
│   │   ├── page.tsx             # Landing page
│   │   ├── signup/page.tsx      # Signup page
│   │   ├── signin/page.tsx      # Sign-in page
│   │   ├── questionnaire/page.tsx  # Protected questionnaire page
│   │   └── dashboard/page.tsx   # Protected dashboard page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx   # Signup form component
│   │   │   ├── SignInForm.tsx   # Sign-in form component
│   │   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   │   ├── questionnaire/
│   │   │   ├── QuestionnaireFlow.tsx  # Multi-step questionnaire
│   │   │   ├── SoftwareBackground.tsx
│   │   │   ├── HardwareBackground.tsx
│   │   │   ├── AIMLBackground.tsx
│   │   │   └── LearningGoals.tsx
│   │   └── dashboard/
│   │       └── Dashboard.tsx    # User dashboard component
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context provider
│   └── services/
│       ├── authClient.ts        # Better Auth client
│       └── api.ts               # Backend API client
├── public/                       # Static assets
├── .env.local                   # Local environment variables
├── .env.template                # Environment template
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── next.config.js               # Next.js configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy the `.env.template` to `.env.local` and update the values:

```bash
cp .env.template .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_AUTH_URL=http://localhost:3000/api/auth
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## User Flow

### New Users
1. Visit landing page at `/`
2. Click "Get Started" to go to `/signup`
3. Fill out signup form (email, password, optional name)
4. Redirected to `/questionnaire`
5. Complete 4-step background questionnaire
6. Redirected to `/dashboard` with personalized content

### Returning Users
1. Visit landing page at `/`
2. Click "Sign In" to go to `/signin`
3. Enter credentials
4. Redirected to `/dashboard`

## Protected Routes

The following routes require authentication:
- `/questionnaire` - Background assessment
- `/dashboard` - User dashboard

Unauthenticated users are automatically redirected to `/signin`.

## Authentication Context

The `AuthContext` provides:
- `user` - Current user object or null
- `loading` - Authentication loading state
- `signOut()` - Sign out function
- `refreshSession()` - Refresh session function

Usage:
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  // ...
}
```

## API Integration

### Auth Service (Better Auth)
- Base URL: `NEXT_PUBLIC_AUTH_URL`
- Endpoints handled by Better Auth SDK

### Backend API (FastAPI)
- Base URL: `NEXT_PUBLIC_API_URL`
- Authenticated requests include credentials (cookies)
- Auto-redirect on 401 Unauthorized

## Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Key Components

### SignupForm
- Email/password validation
- Password confirmation
- Error handling
- Redirect to questionnaire on success

### SignInForm
- Email/password authentication
- Error handling
- Redirect to dashboard on success

### QuestionnaireFlow
- 4-step multi-part form
- Progress indicator
- Data validation
- Submit to backend API

### Dashboard
- Display skill level badge
- Show recommended modules based on skill level
- Display background summary
- Navigation bar with sign out

### ProtectedRoute
- Check authentication status
- Show loading spinner while checking
- Redirect to signin if not authenticated
- Render children if authenticated

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_AUTH_URL` | Better Auth service URL | `http://localhost:3000/api/auth` |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |

## Notes

- All forms include client-side validation
- Session management is automatic via Better Auth
- Protected routes use `ProtectedRoute` wrapper component
- Tailwind CSS for styling with custom configuration
- TypeScript for type safety
- Path aliases configured (`@/` = `src/`)
