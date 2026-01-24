// Shared TypeScript types for user authentication and profile

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Proficiency = 'none' | 'basic' | 'intermediate' | 'advanced';
export type HardwareExperience = 'none' | 'hobbyist' | 'professional';
export type LearningPace = 'self-paced' | 'structured' | 'intensive';

export interface UserProfile {
  id: string;
  userId: string;
  skillLevel: SkillLevel;
  softwareExperienceYears?: number | null;
  programmingLanguages?: string[] | null;
  pythonProficiency?: Proficiency | null;
  cppProficiency?: Proficiency | null;
  rosExposure: boolean;
  hardwareExperience?: HardwareExperience | null;
  roboticsHardware?: string[] | null;
  sensorIntegrationExp: boolean;
  robotDeploymentExp: boolean;
  mlFrameworks?: string[] | null;
  computerVisionExp: boolean;
  llmFamiliarity?: Proficiency | null;
  careerObjectives?: string | null;
  roboticsDomainsInterest?: string[] | null;
  learningPace?: LearningPace | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireSubmission {
  software_background: {
    experience_years: number;
    programming_languages: string[];
    python_proficiency: Proficiency;
    cpp_proficiency: Proficiency;
    ros_exposure: boolean;
  };
  hardware_background: {
    experience_level: HardwareExperience;
    robotics_hardware: string[];
    sensor_integration_exp: boolean;
    robot_deployment_exp: boolean;
  };
  aiml_background: {
    ml_frameworks: string[];
    computer_vision_exp: boolean;
    llm_familiarity: Proficiency;
  };
  learning_goals: {
    career_objectives: string;
    robotics_domains_interest: string[];
    learning_pace: LearningPace;
  };
}
