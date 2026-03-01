"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import QuestionnaireFlow from "@/components/questionnaire/QuestionnaireFlow";

export default function QuestionnairePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            Tell Us About Your Background
          </h1>
          <p className="text-center text-gray-600">
            Help us personalize your learning experience by answering a few questions
          </p>
        </div>
        <QuestionnaireFlow />
      </div>
    </ProtectedRoute>
  );
}
