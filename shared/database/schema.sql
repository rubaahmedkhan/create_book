-- Complete Database Schema for User Authentication with Personalization
-- Database: Neon Serverless Postgres

-- ============================================================================
-- BETTER AUTH DOMAIN (Managed by Better Auth framework)
-- ============================================================================

-- Core authentication identity
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    name TEXT,
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Active user sessions
CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON session(expires_at);

-- OAuth/social accounts (future)
CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_account_user_id ON account(user_id);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
CREATE INDEX IF NOT EXISTS idx_verification_value ON verification(value);

-- ============================================================================
-- APPLICATION DOMAIN (Managed by FastAPI backend)
-- ============================================================================

-- Extended user profile with skill level
CREATE TABLE IF NOT EXISTS user_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    
    -- Skill level (calculated)
    skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Software background
    software_experience_years INTEGER CHECK (software_experience_years >= 0),
    programming_languages TEXT[],
    python_proficiency TEXT CHECK (python_proficiency IN ('none', 'basic', 'intermediate', 'advanced')),
    cpp_proficiency TEXT CHECK (cpp_proficiency IN ('none', 'basic', 'intermediate', 'advanced')),
    ros_exposure BOOLEAN NOT NULL DEFAULT false,
    
    -- Hardware background
    hardware_experience TEXT CHECK (hardware_experience IN ('none', 'hobbyist', 'professional')),
    robotics_hardware TEXT[],
    sensor_integration_exp BOOLEAN NOT NULL DEFAULT false,
    robot_deployment_exp BOOLEAN NOT NULL DEFAULT false,
    
    -- AI/ML background
    ml_frameworks TEXT[],
    computer_vision_exp BOOLEAN NOT NULL DEFAULT false,
    llm_familiarity TEXT CHECK (llm_familiarity IN ('none', 'basic', 'intermediate', 'advanced')),
    
    -- Learning goals
    career_objectives TEXT,
    robotics_domains_interest TEXT[],
    learning_pace TEXT CHECK (learning_pace IN ('self-paced', 'structured', 'intensive')),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_skill_level ON user_profile(skill_level);

-- Individual questionnaire answers (audit trail)
CREATE TABLE IF NOT EXISTS questionnaire_response (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_category TEXT NOT NULL CHECK (question_category IN ('software', 'hardware', 'aiml', 'goals')),
    response_value JSONB NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    answered_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_response_user_question ON questionnaire_response(user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_response_category ON questionnaire_response(question_category);

-- GDPR data export/deletion requests
CREATE TABLE IF NOT EXISTS gdpr_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    export_file_url TEXT,
    deletion_scheduled_for TIMESTAMP,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_gdpr_request_user_id ON gdpr_request(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_request_status ON gdpr_request(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_request_type_status ON gdpr_request(request_type, status);
