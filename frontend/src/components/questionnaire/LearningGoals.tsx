"use client";

import React from "react";

/**
 * Learning Goals Questionnaire Section
 *
 * Collects information about user's learning objectives and preferences.
 */
interface LearningGoalsProps {
  data: LearningGoalsData;
  onChange: (data: LearningGoalsData) => void;
}

export interface LearningGoalsData {
  primary_learning_goal: string;
  specific_topics_interested: string[];
  preferred_learning_pace: string;
  time_commitment_hours_per_week: number;
  project_goals: string[];
}

const LEARNING_GOALS = [
  "Build autonomous robots",
  "Understand ROS 2 fundamentals",
  "Learn computer vision for robotics",
  "Develop AI/ML models for robots",
  "Work with simulation environments",
  "Career transition to robotics",
  "Academic research",
  "Hobby/Personal interest"
];

const SPECIFIC_TOPICS = [
  "ROS 2 basics", "Navigation", "Manipulation", "Computer Vision", "SLAM",
  "Path Planning", "Sensor Fusion", "Deep Learning", "Reinforcement Learning",
  "Gazebo Simulation", "Isaac Sim", "Real robot deployment"
];

const PROJECT_GOALS_OPTIONS = [
  "Build a simple mobile robot",
  "Create a robot arm controller",
  "Implement object detection and tracking",
  "Develop autonomous navigation system",
  "Train a robot using RL",
  "Contribute to open-source robotics projects",
  "Build a portfolio project",
  "Just learn the fundamentals"
];

export default function LearningGoals({ data, onChange }: LearningGoalsProps) {
  const handleCheckboxChange = (field: "specific_topics_interested" | "project_goals", value: string) => {
    const currentValues = data[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({ ...data, [field]: newValues });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Learning Goals & Preferences</h3>

      {/* Primary learning goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary learning goal
        </label>
        <select
          value={data.primary_learning_goal || ""}
          onChange={(e) => onChange({ ...data, primary_learning_goal: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a goal...</option>
          {LEARNING_GOALS.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>

      {/* Specific topics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specific topics interested in (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SPECIFIC_TOPICS.map((topic) => (
            <label key={topic} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.specific_topics_interested || []).includes(topic)}
                onChange={() => handleCheckboxChange("specific_topics_interested", topic)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{topic}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Learning pace */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred learning pace
        </label>
        <select
          value={data.preferred_learning_pace || ""}
          onChange={(e) => onChange({ ...data, preferred_learning_pace: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a pace...</option>
          <option value="slow">Slow and thorough (understand every detail)</option>
          <option value="moderate">Moderate (balance theory and practice)</option>
          <option value="fast">Fast-paced (learn by doing, iterate quickly)</option>
        </select>
      </div>

      {/* Time commitment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time commitment (hours per week)
        </label>
        <input
          type="number"
          min="0"
          max="168"
          value={data.time_commitment_hours_per_week || 0}
          onChange={(e) => onChange({ ...data, time_commitment_hours_per_week: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Project goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project goals (select all that apply)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {PROJECT_GOALS_OPTIONS.map((goal) => (
            <label key={goal} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(data.project_goals || []).includes(goal)}
                onChange={() => handleCheckboxChange("project_goals", goal)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{goal}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
