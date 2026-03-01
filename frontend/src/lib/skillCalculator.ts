export type SkillLevel = "beginner" | "intermediate" | "advanced";

export function calculateSkillLevel(params: {
  software_experience_years: number;
  programming_languages: string[];
  frameworks_used: string[];
  version_control_experience: boolean;
  software_projects_completed: number;
  hardware_experience_years: number;
  microcontrollers_used: string[];
  circuit_design_experience: boolean;
  hardware_projects_completed: number;
  aiml_experience_years: number;
  ml_frameworks_used: string[];
  aiml_concepts_familiar: string[];
  aiml_projects_completed: number;
}): SkillLevel {
  let score = 0;

  // Software (0-40 pts)
  score += Math.min(params.software_experience_years * 3, 15);
  score += Math.min(params.programming_languages.length * 2, 10);
  score += Math.min(params.frameworks_used.length, 5);
  if (params.version_control_experience) score += 3;
  score += Math.min(params.software_projects_completed, 7);

  // Hardware (0-30 pts)
  score += Math.min(params.hardware_experience_years * 3, 12);
  score += Math.min(params.microcontrollers_used.length, 8);
  if (params.circuit_design_experience) score += 4;
  score += Math.min(params.hardware_projects_completed, 6);

  // AI/ML (0-30 pts)
  score += Math.min(params.aiml_experience_years * 3, 12);
  score += Math.min(params.ml_frameworks_used.length * 2, 8);
  score += Math.min(params.aiml_concepts_familiar.length, 10);

  if (score <= 35) return "beginner";
  if (score <= 70) return "intermediate";
  return "advanced";
}
