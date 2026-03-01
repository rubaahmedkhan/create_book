/**
 * FastAPI Backend Client
 *
 * Provides methods to interact with the FastAPI backend.
 * All requests include credentials (cookies) for session validation.
 */

import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Include cookies for session validation
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to signin
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

/**
 * Submit questionnaire responses
 */
export async function submitQuestionnaire(data: QuestionnaireSubmission) {
  const response = await apiClient.post("/questionnaire", data);
  return response.data;
}

/**
 * Get user profile
 */
export async function getProfile() {
  const response = await apiClient.get("/profile");
  return response.data;
}

/**
 * Get learning modules for user's skill level
 */
export async function getLearningModules() {
  const response = await apiClient.get("/content/modules");
  return response.data;
}

/**
 * Get personalized recommendations
 */
export async function getRecommendations() {
  const response = await apiClient.get("/content/recommendations");
  return response.data;
}

/**
 * Get specific module with lessons
 */
export async function getModuleWithLessons(moduleId: string) {
  const response = await apiClient.get(`/content/modules/${moduleId}`);
  return response.data;
}

/**
 * Types
 */
export interface QuestionnaireSubmission {
  // Background category
  background_category: string;

  // Software background
  software_experience_years: number;
  programming_languages: string[];
  frameworks_used: string[];
  development_environments: string[];
  version_control_experience: boolean;
  software_projects_completed: number;

  // Hardware background
  hardware_experience_years: number;
  microcontrollers_used: string[];
  sensors_actuators_used: string[];
  circuit_design_experience: boolean;
  soldering_experience: boolean;
  hardware_projects_completed: number;

  // AI/ML background
  aiml_experience_years: number;
  ml_frameworks_used: string[];
  aiml_concepts_familiar: string[];
  aiml_projects_completed: number;

  // Learning goals
  primary_learning_goal: string;
  specific_topics_interested: string[];
  preferred_learning_pace: string;
  time_commitment_hours_per_week: number;
  project_goals: string[];
}

export interface UserProfile {
  user_id: string;
  background_category: "hardware" | "software" | "both";
  skill_level: "beginner" | "intermediate" | "advanced";
  software_experience_years: number;
  hardware_experience_years: number;
  aiml_experience_years: number;
  programming_languages: string[];
  software_projects_completed: number;
  microcontrollers_used: string[];
  hardware_projects_completed: number;
  ml_frameworks_used: string[];
  aiml_projects_completed: number;
  created_at: string;
  updated_at: string;
}
