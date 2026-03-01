"use client";

import React, { useState } from "react";
import BackgroundCategory, { BackgroundCategoryData } from "./BackgroundCategory";
import SoftwareBackground, { SoftwareBackgroundData } from "./SoftwareBackground";
import HardwareBackground, { HardwareBackgroundData } from "./HardwareBackground";
import AIMLBackground, { AIMLBackgroundData } from "./AIMLBackground";
import LearningGoals, { LearningGoalsData } from "./LearningGoals";
import { submitQuestionnaire, QuestionnaireSubmission } from "@/services/api";

/**
 * Questionnaire Flow Component
 *
 * Multi-step form for collecting user background information.
 * Steps: Background Selection → Software → Hardware → AI/ML → Learning Goals
 */
export default function QuestionnaireFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [backgroundCategory, setBackgroundCategory] = useState<BackgroundCategoryData>({
    background_category: "software",
  });

  const [softwareData, setSoftwareData] = useState<SoftwareBackgroundData>({
    software_experience_years: 0,
    programming_languages: [],
    frameworks_used: [],
    development_environments: [],
    version_control_experience: false,
    software_projects_completed: 0,
  });

  const [hardwareData, setHardwareData] = useState<HardwareBackgroundData>({
    hardware_experience_years: 0,
    microcontrollers_used: [],
    sensors_actuators_used: [],
    circuit_design_experience: false,
    soldering_experience: false,
    hardware_projects_completed: 0,
  });

  const [aimlData, setAimlData] = useState<AIMLBackgroundData>({
    aiml_experience_years: 0,
    ml_frameworks_used: [],
    aiml_concepts_familiar: [],
    aiml_projects_completed: 0,
  });

  const [learningData, setLearningData] = useState<LearningGoalsData>({
    primary_learning_goal: "",
    specific_topics_interested: [],
    preferred_learning_pace: "",
    time_commitment_hours_per_week: 0,
    project_goals: [],
  });

  const totalSteps = 5;

  const handleNext = () => {
    // Validate background category is selected before moving from step 1
    if (currentStep === 1 && !backgroundCategory.background_category) {
      setError("Please select your background");
      return;
    }

    setError("");
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    // Validate required fields
    if (!learningData.primary_learning_goal || !learningData.preferred_learning_pace) {
      setError("Please complete all required fields");
      setLoading(false);
      return;
    }

    const submission: QuestionnaireSubmission = {
      ...backgroundCategory,
      ...softwareData,
      ...hardwareData,
      ...aimlData,
      ...learningData,
    };

    try {
      await submitQuestionnaire(submission);
      // Success - redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit questionnaire");
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BackgroundCategory data={backgroundCategory} onChange={setBackgroundCategory} />;
      case 2:
        return <SoftwareBackground data={softwareData} onChange={setSoftwareData} />;
      case 3:
        return <HardwareBackground data={hardwareData} onChange={setHardwareData} />;
      case 4:
        return <AIMLBackground data={aimlData} onChange={setAimlData} />;
      case 5:
        return <LearningGoals data={learningData} onChange={setLearningData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-md"
          >
            {loading ? "Submitting..." : "Complete Questionnaire"}
          </button>
        )}
      </div>
    </div>
  );
}
