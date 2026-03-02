"use client";

import React from "react";

export interface BackgroundCategoryData {
  background_category: string;
}

interface Props {
  data: BackgroundCategoryData;
  onChange: (data: BackgroundCategoryData) => void;
}

/**
 * Background Category Selection Component
 *
 * Simple selection for hardware, software, or both backgrounds.
 * This determines which content modules the user will see.
 */
export default function BackgroundCategory({ data, onChange }: Props) {
  const handleSelect = (category: string) => {
    onChange({ background_category: category });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What's your primary background?
        </h2>
        <p className="text-gray-600">
          This helps us personalize your learning experience with the most relevant content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hardware Option */}
        <button
          type="button"
          onClick={() => handleSelect("hardware")}
          className={`p-6 border-2 rounded-lg transition-all ${
            data.background_category === "hardware"
              ? "border-blue-600 bg-blue-50 shadow-md"
              : "border-gray-300 hover:border-blue-400 hover:shadow"
          }`}
        >
          <div className="text-4xl mb-3">🔧</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hardware</h3>
          <p className="text-sm text-gray-600">
            Electronics, robotics, sensors, microcontrollers, and physical systems
          </p>
        </button>

        {/* Software Option */}
        <button
          type="button"
          onClick={() => handleSelect("software")}
          className={`p-6 border-2 rounded-lg transition-all ${
            data.background_category === "software"
              ? "border-blue-600 bg-blue-50 shadow-md"
              : "border-gray-300 hover:border-blue-400 hover:shadow"
          }`}
        >
          <div className="text-4xl mb-3">💻</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Software</h3>
          <p className="text-sm text-gray-600">
            Programming, AI/ML, frameworks, and software development
          </p>
        </button>

        {/* Both Option */}
        <button
          type="button"
          onClick={() => handleSelect("both")}
          className={`p-6 border-2 rounded-lg transition-all ${
            data.background_category === "both"
              ? "border-blue-600 bg-blue-50 shadow-md"
              : "border-gray-300 hover:border-blue-400 hover:shadow"
          }`}
        >
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Both</h3>
          <p className="text-sm text-gray-600">
            Experienced in both hardware and software development
          </p>
        </button>
      </div>

      {data.background_category && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            ✓ You selected: <strong className="capitalize">{data.background_category}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
