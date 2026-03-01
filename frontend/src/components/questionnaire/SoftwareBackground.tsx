"use client";

import React from "react";

/**
 * Software Background Questionnaire Section
 *
 * Collects information about user's software development experience.
 */
interface SoftwareBackgroundProps {
  data: SoftwareBackgroundData;
  onChange: (data: SoftwareBackgroundData) => void;
}

export interface SoftwareBackgroundData {
  software_experience_years: number;
  programming_languages: string[];
  frameworks_used: string[];
  development_environments: string[];
  version_control_experience: boolean;
  software_projects_completed: number;
}

const PROGRAMMING_LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "C++", "C", "Java", "Go", "Rust", "Other"
];

const FRAMEWORKS = [
  "React", "Angular", "Vue", "Django", "Flask", "FastAPI", "Express", "Spring", "Other"
];

const IDES = [
  "VS Code", "PyCharm", "IntelliJ IDEA", "Vim/Neovim", "Sublime Text", "Eclipse", "Other"
];

export default function SoftwareBackground({ data, onChange }: SoftwareBackgroundProps) {
  const handleCheckboxChange = (field: "programming_languages" | "frameworks_used" | "development_environments", value: string) => {
    const currentValues = data[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({ ...data, [field]: newValues });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Software Development Background</h3>

      {/* Years of experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of software development experience
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={data.software_experience_years || 0}
          onChange={(e) => onChange({ ...data, software_experience_years: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Programming languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Programming languages (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROGRAMMING_LANGUAGES.map((lang) => (
            <label key={lang} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.programming_languages || []).includes(lang)}
                onChange={() => handleCheckboxChange("programming_languages", lang)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frameworks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frameworks and libraries used (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FRAMEWORKS.map((framework) => (
            <label key={framework} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.frameworks_used || []).includes(framework)}
                onChange={() => handleCheckboxChange("frameworks_used", framework)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{framework}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Development environments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Development environments (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {IDES.map((ide) => (
            <label key={ide} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.development_environments || []).includes(ide)}
                onChange={() => handleCheckboxChange("development_environments", ide)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{ide}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Version control */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={data.version_control_experience || false}
            onChange={(e) => onChange({ ...data, version_control_experience: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            I have experience with version control (Git, SVN, etc.)
          </span>
        </label>
      </div>

      {/* Projects completed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of software projects completed
        </label>
        <input
          type="number"
          min="0"
          max="1000"
          value={data.software_projects_completed || 0}
          onChange={(e) => onChange({ ...data, software_projects_completed: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
