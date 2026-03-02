"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, UserProfile } from "@/services/api";

// Flash card data for the book topics
const BASE =
  process.env.NEXT_PUBLIC_BOOK_URL ?? "https://rubaahmedkhan.github.io/create_book";

const FLASH_CARDS = [
  {
    icon: "🤖",
    title: "ROS2 Fundamentals",
    desc: "Master nodes, topics, services, and the core building blocks of robot operating systems.",
    tag: "Module 1",
    url: `${BASE}/module1/intro`,
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: "🎮",
    title: "Gazebo Simulation",
    desc: "Simulate robots in physics-based 3D environments before deploying to real hardware.",
    tag: "Module 2",
    url: `${BASE}/module2/intro`,
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: "⚡",
    title: "NVIDIA Isaac Platform",
    desc: "GPU-accelerated robot simulation and reinforcement learning for humanoid AI systems.",
    tag: "Module 3",
    url: `${BASE}/module3/intro`,
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: "🧠",
    title: "VLA Models",
    desc: "Vision-Language-Action models that give robots the ability to understand and act intelligently.",
    tag: "Module 4",
    url: `${BASE}/module4/intro`,
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: "🦾",
    title: "Humanoid Locomotion",
    desc: "Bipedal motion control, balance algorithms, and gait planning for walking robots.",
    tag: "Physical AI",
    url: `${BASE}/module1/intro`,
    color: "from-fuchsia-500 to-violet-600",
  },
  {
    icon: "🌐",
    title: "Embodied Intelligence",
    desc: "Bridging the gap between digital AI models and physical-world robot interaction.",
    tag: "Advanced",
    url: `${BASE}/intro`,
    color: "from-violet-600 to-indigo-700",
  },
];

// Build book URL with skill level parameter so Docusaurus can personalize content
const getBookUrl = (path: string, level?: string) =>
  level ? `${BASE}/${path}?level=${level}` : `${BASE}/${path}`;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch {
      // Profile not found or error — show dashboard without personalization
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const skillLabel = profile?.skill_level
    ? profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-wide">
              Physical AI & Humanoid Robotics
            </span>
          </div>
          <div className="flex items-center gap-4">
            {skillLabel && (
              <span className="text-xs font-semibold px-3 py-1 bg-violet-100 text-violet-700 rounded-full">
                {skillLabel}
              </span>
            )}
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.name || user?.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
        {/* Left: Text */}
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-none tracking-tight mb-4 sm:mb-6">
            <span className="block">PHYSICAL AI</span>
            <span className="block text-violet-600">&amp; HUMANOID</span>
            <span className="block">ROBOTICS</span>
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl">
            The comprehensive guide to{" "}
            <strong className="text-gray-800">Embodied AI</strong> and{" "}
            <strong className="text-gray-800">Humanoid Robot Programming</strong>. Master
            ROS2, GPU simulation, and Vision-Language-Action models to build the next
            generation of intelligent physical machines.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <a
              href={getBookUrl("intro", profile?.skill_level)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors"
            >
              START READING
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
            <a
              href={getBookUrl("module1/intro", profile?.skill_level)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-8 py-4 border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Explore Modules
            </a>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>
              <strong className="text-gray-800 font-bold">4 modules</strong> of hands-on
              robotics content
            </span>
            {profile?.skill_level && (
              <>
                <span className="mx-3 text-gray-300">|</span>
                <span className="text-violet-600 font-semibold capitalize">
                  {profile.skill_level} level content
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Book cover */}
        <div className="flex-shrink-0 flex items-center justify-center lg:justify-end">
          <div className="hidden sm:block" style={{ perspective: "1200px" }}>
            <img
              src="/BOOK_IMG.png"
              alt="Physical AI & Humanoid Robotics Book"
              style={{
                width: "320px",
                maxWidth: "85vw",
                borderRadius: "6px 12px 12px 6px",
                boxShadow:
                  "28px 28px 70px rgba(109,40,217,0.25), -6px 0 20px rgba(0,0,0,0.2), 0 4px 30px rgba(0,0,0,0.15)",
                transform: "rotateY(-10deg) rotateX(3deg) scale(1.02)",
                transformStyle: "preserve-3d",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform =
                  "rotateY(-4deg) rotateX(1deg) scale(1.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform =
                  "rotateY(-10deg) rotateX(3deg) scale(1.02)";
              }}
            />
          </div>
          <div className="sm:hidden">
            <img
              src="/BOOK_IMG.png"
              alt="Physical AI & Humanoid Robotics Book"
              style={{
                width: "220px",
                borderRadius: "6px 12px 12px 6px",
                boxShadow: "0 8px 30px rgba(109,40,217,0.3)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* ── Flash Cards Section ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore the Book</h2>
          <p className="text-gray-500 text-sm">
            Click any topic to jump directly into that section of the book.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FLASH_CARDS.map((card) => (
            <a
              key={card.title}
              href={profile?.skill_level ? `${card.url}?level=${profile.skill_level}` : card.url}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              {/* Top gradient bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} rounded-t-2xl`}
              />

              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl flex-shrink-0`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                    {card.tag}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-2 mb-1 group-hover:text-violet-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center text-xs font-semibold text-violet-600 group-hover:gap-2 transition-all">
                Read section
                <svg className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 Physical AI & Humanoid Robotics</span>
          <a
            href={getBookUrl("intro", profile?.skill_level)}
            target="_blank"
            rel="noreferrer"
            className="text-violet-600 font-medium hover:underline"
          >
            Start Reading →
          </a>
        </div>
      </footer>
    </div>
  );
}
