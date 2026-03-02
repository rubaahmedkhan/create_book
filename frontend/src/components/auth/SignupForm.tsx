"use client";

import React, { useState } from "react";
import { signUp } from "@/services/authClient";
import { submitQuestionnaire } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

type SkillLevel = "beginner" | "intermediate" | "advanced";
type HardwareOS = "windows" | "mac" | "linux" | "chromebook";

const SKILL_OPTIONS = [
  {
    value: "beginner",
    label: "Beginner",
    desc: "New to programming or robotics",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "Some experience with Python or similar languages",
  },
  {
    value: "advanced",
    label: "Advanced",
    desc: "Professional developer or robotics engineer",
  },
];

const HARDWARE_OPTIONS = [
  { value: "windows", label: "Windows PC", desc: "Desktop or laptop" },
  { value: "mac", label: "Mac", desc: "MacBook or iMac" },
  { value: "linux", label: "Linux", desc: "Ubuntu, Fedora, etc." },
  { value: "chromebook", label: "Chromebook/Web", desc: "Browser-based only" },
];

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function SignupForm() {
  const { refreshSession } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2 fields
  const [skillLevel, setSkillLevel] = useState<SkillLevel | "">("");
  const [hardwareOS, setHardwareOS] = useState<HardwareOS | "">("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (!password) { setError("Password is required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setStep(2);
  };

  const handleCreateAccount = async () => {
    setError("");
    if (!skillLevel) { setError("Please select your software background"); return; }
    if (!hardwareOS) { setError("Please select your hardware/OS"); return; }

    setLoading(true);
    try {
      const result = await signUp(email, password, name);
      if (result.error) {
        setError(result.error.message || "Signup failed");
        setLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 500));
      await refreshSession();
      await new Promise((r) => setTimeout(r, 200));

      // Map simplified 2 answers to full questionnaire schema
      const expMap: Record<SkillLevel, number> = { beginner: 0, intermediate: 2, advanced: 5 };
      const paceMap: Record<SkillLevel, string> = { beginner: "slow", intermediate: "medium", advanced: "fast" };
      const goalMap: Record<SkillLevel, string> = {
        beginner: "learn_basics",
        intermediate: "advance_skills",
        advanced: "master_robotics",
      };

      // Save learning profile — ignore errors (dashboard works without it)
      try {
        await submitQuestionnaire({
          background_category: "software",
          software_experience_years: expMap[skillLevel as SkillLevel],
          programming_languages: [],
          frameworks_used: [],
          development_environments: [hardwareOS],
          version_control_experience: false,
          software_projects_completed: 0,
          hardware_experience_years: 0,
          microcontrollers_used: [],
          sensors_actuators_used: [],
          circuit_design_experience: false,
          soldering_experience: false,
          hardware_projects_completed: 0,
          aiml_experience_years: 0,
          ml_frameworks_used: [],
          aiml_concepts_familiar: [],
          aiml_projects_completed: 0,
          primary_learning_goal: goalMap[skillLevel as SkillLevel],
          specific_topics_interested: [],
          preferred_learning_pace: paceMap[skillLevel as SkillLevel],
          time_commitment_hours_per_week: 5,
          project_goals: [],
        });
      } catch {
        // Profile save failed — continue anyway, dashboard handles missing profile
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8">
      {/* Progress indicator */}
      <div className="flex items-start mb-8">
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            1
          </div>
          <span
            className={`text-xs mt-1 font-medium ${
              step >= 1 ? "text-violet-600" : "text-gray-400"
            }`}
          >
            Account
          </span>
        </div>
        <div
          className={`flex-1 h-1 mt-5 mx-2 rounded ${
            step >= 2 ? "bg-violet-600" : "bg-gray-200"
          }`}
        />
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </div>
          <span
            className={`text-xs mt-1 font-medium text-right ${
              step >= 2 ? "text-violet-600" : "text-gray-400"
            }`}
          >
            Learning Profile
          </span>
        </div>
      </div>

      {/* ── Step 1: Account ── */}
      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Get started in seconds</p>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select className="px-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="+92">🇵🇰 +92</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="3xx xxxxxxx"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                ☎ Select your country code and enter phone number (required)
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleContinue}
            className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            Continue
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/signin" className="text-violet-600 font-medium hover:underline">
              Sign in
            </a>
          </p>
        </>
      )}

      {/* ── Step 2: Learning Profile ── */}
      {step === 2 && (
        <>
          <button
            onClick={() => { setStep(1); setError(""); }}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tell us about yourself</h1>
          <p className="text-gray-500 text-sm mb-6">Help us personalize your learning experience</p>

          {/* Question 1: Software Background */}
          <div className="mb-6">
            <div className="border-l-4 border-violet-500 pl-3 mb-4 bg-violet-50 py-2 rounded-r-lg">
              <p className="font-semibold text-gray-800 text-sm">What's your software background?</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SKILL_OPTIONS.map((opt) => {
                const selected = skillLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSkillLevel(opt.value as SkillLevel)}
                    className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all ${
                      selected
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 bg-white hover:border-violet-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 mx-auto mb-2 flex items-center justify-center ${
                        selected ? "border-violet-600 bg-violet-600" : "border-gray-300"
                      }`}
                    >
                      {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        selected ? "text-violet-700" : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 leading-snug hidden sm:block ${
                        selected ? "text-violet-600" : "text-gray-400"
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Hardware/OS */}
          <div className="mb-6">
            <div className="border-l-4 border-violet-500 pl-3 mb-4 bg-violet-50 py-2 rounded-r-lg">
              <p className="font-semibold text-gray-800 text-sm">What hardware and OS do you use?</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {HARDWARE_OPTIONS.map((opt) => {
                const selected = hardwareOS === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setHardwareOS(opt.value as HardwareOS)}
                    className={`p-2 sm:p-3 rounded-xl border-2 text-left flex items-start gap-2 transition-all ${
                      selected
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 bg-white hover:border-violet-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                        selected ? "border-violet-600 bg-violet-600" : "border-gray-300"
                      }`}
                    >
                      {selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/signin" className="text-violet-600 font-medium hover:underline">
              Sign in
            </a>
          </p>
        </>
      )}
    </div>
  );
}
