import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { calculateSkillLevel } from "@/lib/skillCalculator";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const skillLevel = calculateSkillLevel({
    software_experience_years: body.software_experience_years ?? 0,
    programming_languages: body.programming_languages ?? [],
    frameworks_used: body.frameworks_used ?? [],
    version_control_experience: body.version_control_experience ?? false,
    software_projects_completed: body.software_projects_completed ?? 0,
    hardware_experience_years: body.hardware_experience_years ?? 0,
    microcontrollers_used: body.microcontrollers_used ?? [],
    circuit_design_experience: body.circuit_design_experience ?? false,
    hardware_projects_completed: body.hardware_projects_completed ?? 0,
    aiml_experience_years: body.aiml_experience_years ?? 0,
    ml_frameworks_used: body.ml_frameworks_used ?? [],
    aiml_concepts_familiar: body.aiml_concepts_familiar ?? [],
    aiml_projects_completed: body.aiml_projects_completed ?? 0,
  });

  const sql = getSql();
  await sql`
    INSERT INTO user_profile (
      user_id, skill_level, background_category,
      software_experience_years, hardware_experience_years, aiml_experience_years,
      programming_languages, frameworks_used, development_environments,
      version_control_experience, software_projects_completed,
      microcontrollers_used, sensors_actuators_used,
      circuit_design_experience, soldering_experience, hardware_projects_completed,
      ml_frameworks_used, aiml_concepts_familiar, aiml_projects_completed,
      primary_learning_goal, specific_topics_interested,
      preferred_learning_pace, time_commitment_hours_per_week, project_goals
    ) VALUES (
      ${session.user.id}, ${skillLevel}, ${body.background_category ?? "software"},
      ${body.software_experience_years ?? 0}, ${body.hardware_experience_years ?? 0}, ${body.aiml_experience_years ?? 0},
      ${body.programming_languages ?? []}, ${body.frameworks_used ?? []}, ${body.development_environments ?? []},
      ${body.version_control_experience ?? false}, ${body.software_projects_completed ?? 0},
      ${body.microcontrollers_used ?? []}, ${body.sensors_actuators_used ?? []},
      ${body.circuit_design_experience ?? false}, ${body.soldering_experience ?? false}, ${body.hardware_projects_completed ?? 0},
      ${body.ml_frameworks_used ?? []}, ${body.aiml_concepts_familiar ?? []}, ${body.aiml_projects_completed ?? 0},
      ${body.primary_learning_goal ?? ""}, ${body.specific_topics_interested ?? []},
      ${body.preferred_learning_pace ?? "moderate"}, ${body.time_commitment_hours_per_week ?? 5}, ${body.project_goals ?? []}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      skill_level = EXCLUDED.skill_level,
      background_category = EXCLUDED.background_category,
      software_experience_years = EXCLUDED.software_experience_years,
      hardware_experience_years = EXCLUDED.hardware_experience_years,
      aiml_experience_years = EXCLUDED.aiml_experience_years,
      programming_languages = EXCLUDED.programming_languages,
      frameworks_used = EXCLUDED.frameworks_used,
      development_environments = EXCLUDED.development_environments,
      version_control_experience = EXCLUDED.version_control_experience,
      software_projects_completed = EXCLUDED.software_projects_completed,
      microcontrollers_used = EXCLUDED.microcontrollers_used,
      sensors_actuators_used = EXCLUDED.sensors_actuators_used,
      circuit_design_experience = EXCLUDED.circuit_design_experience,
      soldering_experience = EXCLUDED.soldering_experience,
      hardware_projects_completed = EXCLUDED.hardware_projects_completed,
      ml_frameworks_used = EXCLUDED.ml_frameworks_used,
      aiml_concepts_familiar = EXCLUDED.aiml_concepts_familiar,
      aiml_projects_completed = EXCLUDED.aiml_projects_completed,
      primary_learning_goal = EXCLUDED.primary_learning_goal,
      specific_topics_interested = EXCLUDED.specific_topics_interested,
      preferred_learning_pace = EXCLUDED.preferred_learning_pace,
      time_commitment_hours_per_week = EXCLUDED.time_commitment_hours_per_week,
      project_goals = EXCLUDED.project_goals,
      updated_at = NOW()
  `;

  return NextResponse.json({ skill_level: skillLevel, success: true });
}
