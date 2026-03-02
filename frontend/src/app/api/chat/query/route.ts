import { NextRequest, NextResponse } from "next/server";

// Allow calls from GitHub Pages (Docusaurus book) and local dev
const ALLOWED_ORIGINS = [
  "https://rubaahmedkhan.github.io",
  "http://localhost:3000",
  "http://localhost:3001",
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 200, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = {
    ...corsHeaders(origin),
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400, headers }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          answer:
            "The AI assistant is not yet configured. Please add ANTHROPIC_API_KEY to Vercel environment variables.",
          citations: [],
        },
        { headers }
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: `You are a helpful AI teaching assistant for a textbook called "Physical AI & Humanoid Robotics".
The textbook covers: ROS 2 fundamentals (nodes, topics, services, actions), Gazebo 3D simulation,
NVIDIA Isaac platform (GPU-accelerated simulation, reinforcement learning), and Vision-Language-Action (VLA) models.
Answer student questions concisely and clearly. Use simple language.
If a question is unrelated to robotics or AI, politely guide the student back to the textbook topics.`,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    const answer =
      data.content?.[0]?.text || "I could not generate a response.";

    return NextResponse.json({ answer, citations: [] }, { headers });
  } catch (error) {
    console.error("[chat/query] error:", error);
    return NextResponse.json(
      { answer: "Sorry, something went wrong. Please try again.", citations: [] },
      { status: 500, headers }
    );
  }
}
