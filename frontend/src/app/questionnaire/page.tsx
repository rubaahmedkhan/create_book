"use client";

import { useEffect } from "react";

// Old questionnaire page — redirect all users to dashboard.
// The 2-question learning profile is now collected during signup (SignupForm).
export default function QuestionnairePage() {
  useEffect(() => {
    window.location.replace("/dashboard");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mb-4" />
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
