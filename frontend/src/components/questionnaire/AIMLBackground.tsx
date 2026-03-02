"use client";

import React from "react";

/**
 * AI/ML Background Questionnaire Section
 *
 * Collects information about user's AI/ML experience.
 */
interface AIMLBackgroundProps {
  data: AIMLBackgroundData;
  onChange: (data: AIMLBackgroundData) => void;
}

export interface AIMLBackgroundData {
  aiml_experience_years: number;
  ml_frameworks_used: string[];
  aiml_concepts_familiar: string[];
  aiml_projects_completed: number;
}

const ML_FRAMEWORKS = [
  "TensorFlow", "PyTorch", "Keras", "scikit-learn", "JAX", "Hugging Face", "OpenCV", "Other", "None"
];

const AI_CONCEPTS = [
  "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning",
  "Neural Networks", "CNNs", "RNNs/LSTMs", "Transformers",
  "Computer Vision", "NLP", "GANs", "Transfer Learning", "Other"
];

export default function AIMLBackground({ data, onChange }: AIMLBackgroundProps) {
  const handleCheckboxChange = (field: "ml_frameworks_used" | "aiml_concepts_familiar", value: string) => {
    const currentValues = data[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({ ...data, [field]: newValues });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">AI/ML Background</h3>

      {/* Years of experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of AI/ML experience
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={data.aiml_experience_years || 0}
          onChange={(e) => onChange({ ...data, aiml_experience_years: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ML frameworks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ML frameworks and libraries used (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ML_FRAMEWORKS.map((framework) => (
            <label key={framework} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.ml_frameworks_used || []).includes(framework)}
                onChange={() => handleCheckboxChange("ml_frameworks_used", framework)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{framework}</span>
            </label>
          ))}
        </div>
      </div>

      {/* AI/ML concepts */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI/ML concepts familiar with (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AI_CONCEPTS.map((concept) => (
            <label key={concept} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.aiml_concepts_familiar || []).includes(concept)}
                onChange={() => handleCheckboxChange("aiml_concepts_familiar", concept)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{concept}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Projects completed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of AI/ML projects completed
        </label>
        <input
          type="number"
          min="0"
          max="1000"
          value={data.aiml_projects_completed || 0}
          onChange={(e) => onChange({ ...data, aiml_projects_completed: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
